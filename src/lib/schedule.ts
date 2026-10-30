/**
 * The booking rule behind the schedule board on the home page.
 *
 * It mirrors the PostgreSQL exclusion constraint from
 * github.com/mgndxb/booking-conflict-engine: two active bookings on the same
 * resource may never overlap, ranges are half-open, and cancelled rows no
 * longer take part. Times are minutes counted from the start of the board's day.
 */

export const DAY_START_HOUR = 9;
export const DAY_END_HOUR = 18;
export const DAY_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;
export const SLOT_MINUTES = 30;

export type BookingStatus = "hold" | "confirmed" | "refused" | "cancelled";

export interface TimeRange {
  start: number;
  end: number;
}

export interface Booking extends TimeRange {
  id: string;
  lane: number;
  label: string;
  status: BookingStatus;
  /** Layout hint while several requests are in flight for one slot. */
  track: number;
  tracks: number;
}

export interface SlotRequest extends TimeRange {
  lane: number;
}

/**
 * Half-open ranges, like `tstzrange(start_at, end_at, '[)')`:
 * 10:00–11:00 and 11:00–12:00 touch without overlapping.
 */
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Returns the booking that would make the database refuse this request, or null.
 *
 * Only confirmed rows count. A request that is still in flight has not been
 * written yet, which is exactly why "check first, then insert" is unsafe.
 */
export function findBlocker(
  bookings: readonly Booking[],
  request: SlotRequest,
): Booking | null {
  return (
    bookings.find(
      (booking) =>
        booking.status === "confirmed" &&
        booking.lane === request.lane &&
        overlaps(booking, request),
    ) ?? null
  );
}

export function clampToDay(minutes: number): number {
  return Math.min(Math.max(minutes, 0), DAY_MINUTES);
}

export function snapToSlot(minutes: number, mode: "floor" | "round" = "round"): number {
  const slots = minutes / SLOT_MINUTES;
  const snapped = mode === "floor" ? Math.floor(slots) : Math.round(slots);
  return clampToDay(snapped * SLOT_MINUTES);
}

export function formatTime(minutes: number): string {
  const total = DAY_START_HOUR * 60 + minutes;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function formatRange(range: TimeRange): string {
  return `${formatTime(range.start)}–${formatTime(range.end)}`;
}

/** Picks a random free slot of the given length, or null when the day is full. */
export function findFreeSlot(
  bookings: readonly Booking[],
  length: number,
  laneCount: number,
  random: () => number = Math.random,
): SlotRequest | null {
  const candidates: SlotRequest[] = [];

  for (let lane = 0; lane < laneCount; lane++) {
    for (let start = 0; start + length <= DAY_MINUTES; start += SLOT_MINUTES) {
      const request = { lane, start, end: start + length };
      if (!findBlocker(bookings, request)) candidates.push(request);
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(random() * candidates.length)];
}
