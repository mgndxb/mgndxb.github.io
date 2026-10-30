/**
 * Excerpts from github.com/mgndxb/booking-conflict-engine, copied from the
 * repository. Some comments were shortened, and `// …` marks code left out.
 */

export const codeRepo = "https://github.com/mgndxb/booking-conflict-engine";

export interface CodeSample {
  id: string;
  title: string;
  path: string;
  lang: "sql" | "ts";
  explanation: string;
  /** 1-based line numbers to emphasise. */
  highlight: number[];
  code: string;
}

export const codeSamples: CodeSample[] = [
  {
    id: "constraint",
    title: "The rule lives in the schema",
    path: "migrations/0002_enforce_booking_invariants.sql",
    lang: "sql",
    explanation:
      "Two active bookings for the same resource can't overlap. Postgres checks this inside the write, so two requests arriving at the same moment can't both get in. Cancelled rows drop out of the check, which frees the slot without deleting history.",
    highlight: [11, 13],
    code: `-- Invariant 1: two active bookings for the same resource may never overlap.
--
-- An exclusion constraint is checked by the index itself while the row is being
-- written, under the same locks that protect a unique index. Two concurrent
-- transactions inserting the same slot cannot both pass: the second one blocks
-- until the first commits, then fails with SQLSTATE 23P01.
ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
  )
  WHERE (cancelled_at IS NULL);`,
  },
  {
    id: "service",
    title: "Don't ask first, just write",
    path: "src/server/bookings/service.ts",
    lang: "ts",
    explanation:
      "Checking whether a slot is free and then inserting leaves a gap where another request can sneak in. So the service skips the check, attempts the insert, and turns a refusal from the database into an error a person can act on.",
    highlight: [18, 19, 20, 21, 22],
    code: `/**
 * The shape of this function is the point of the project. There is no
 * "is the slot free?" query before the insert, because any answer it gave would
 * already be stale by the time the insert ran: another transaction can commit
 * in the gap. Instead the insert is attempted unconditionally and the database
 * is allowed to refuse it.
 */
export async function createBooking(
  db: Database,
  rawInput: unknown,
): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(rawInput);
  // … invalid input is rejected here

  const input = parsed.data;

  let created: Booking | null;
  try {
    created = await insertBooking(db, input);
  } catch (error) {
    throw await translateInsertError(db, error, input);
  }

  if (created) {
    return { booking: created, replayed: false };
  }
  // … otherwise this was a retry: return the original booking`,
  },
  {
    id: "idempotency",
    title: "A retry returns the original",
    path: "src/server/bookings/queries.ts",
    lang: "ts",
    explanation:
      "Every request carries an idempotency key, so a double click or a retry after a timeout gets the first booking back instead of creating a second one. Naming the conflict target matters: a bare ON CONFLICT would also swallow real overlaps.",
    highlight: [16],
    code: `/**
 * The conflict target is named explicitly. A bare \`ON CONFLICT DO NOTHING\`
 * would also swallow the exclusion constraint, turning a genuine double-booking
 * into a silent no-op — exactly the failure this project is about. Naming
 * \`(idempotency_key)\` keeps overlap violations raising SQLSTATE 23P01.
 */
export async function insertBooking(
  db: SqlExecutor,
  values: NewBooking,
): Promise<Booking | null> {
  const { rows } = await db.query<BookingRow>(
    \`
    WITH inserted AS (
      INSERT INTO bookings (resource_id, start_at, end_at, customer_name, idempotency_key)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING *
    )
    SELECT \${BOOKING_COLUMNS}
    FROM inserted b
    JOIN resources r ON r.id = b.resource_id
    \`,
    // … the five values
  );

  return rows.length > 0 ? toBooking(rows[0]) : null;
}`,
  },
  {
    id: "control-test",
    title: "A test that checks the test",
    path: "tests/concurrency.test.ts",
    lang: "ts",
    explanation:
      "The tests run the real migrations on PGlite, which is actual Postgres compiled to WebAssembly. One test races two requests and expects one to fail. This control test drops the constraint, replays the race and expects both to succeed, proving the constraint was doing the work.",
    highlight: [12, 17],
    code: `/**
 * These tests are about the interleaving that breaks naive booking code:
 *
 *   request A: is the slot free?  -> yes
 *   request B: is the slot free?  -> yes      (A has not written yet)
 *   request A: insert             -> ok
 *   request B: insert             -> ???      (A's answer is now stale)
 */
it("proves the constraint is what refuses the second write", async () => {
  // Same interleaving with the exclusion constraint removed. If the
  // application code were doing the work, this would still be rejected.
  await db.exec("ALTER TABLE bookings DROP CONSTRAINT bookings_no_overlap");

  await createBooking(db, bookingInput({ ...SLOT, customerName: "Alice" }));
  await createBooking(db, bookingInput({ ...SLOT, customerName: "Bob" }));

  expect(await countActiveBookings(db)).toBe(2);
});`,
  },
];
