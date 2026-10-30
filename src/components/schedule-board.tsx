"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  DAY_END_HOUR,
  DAY_MINUTES,
  DAY_START_HOUR,
  SLOT_MINUTES,
  findBlocker,
  findFreeSlot,
  formatRange,
  formatTime,
  snapToSlot,
  type Booking,
  type BookingStatus,
  type SlotRequest,
  type TimeRange,
} from "@/lib/schedule";
import { sound } from "@/lib/sound";

const LANES = ["Chair 1", "Chair 2"] as const;

const INITIAL_BOOKINGS: Booking[] = [
  { id: "b1", lane: 0, start: 30, end: 180, label: "Lip blush", status: "confirmed", track: 0, tracks: 1 },
  { id: "b2", lane: 1, start: 60, end: 150, label: "Neutralisation", status: "confirmed", track: 0, tracks: 1 },
  { id: "b3", lane: 1, start: 270, end: 330, label: "Consultation", status: "confirmed", track: 0, tracks: 1 },
  { id: "b4", lane: 0, start: 360, end: 450, label: "Brow touch-up", status: "confirmed", track: 0, tracks: 1 },
];
const INITIAL_IDS = new Set(INITIAL_BOOKINGS.map((booking) => booking.id));

/** The slot the opening race fights over: Chair 1, 12:30–14:00. */
const RACE_SLOT: SlotRequest = { lane: 0, start: 210, end: 300 };

const COMMIT_DELAY = 750;
const COMMIT_STAGGER = 420;
const REFUSED_VISIBLE_FOR = 1900;
const TAP_LENGTH = 60;
/** Pixels the pointer must travel before a press becomes a drag. */
const DRAG_THRESHOLD = 6;

type LogKind = "confirmed" | "refused" | "cancelled" | "info";

interface LogEntry {
  id: number;
  kind: LogKind;
  text: string;
}

interface BoardState {
  bookings: Booking[];
  log: LogEntry[];
  nextLogId: number;
}

type Action =
  | { type: "request"; bookings: Booking[] }
  | { type: "commit"; id: string }
  | { type: "cancel"; id: string }
  | { type: "dismiss"; id: string }
  | { type: "note"; text: string }
  | { type: "reset" };

function initialState(): BoardState {
  return { bookings: INITIAL_BOOKINGS, log: [], nextLogId: 0 };
}

function withLog(state: BoardState, kind: LogKind, text: string): BoardState {
  const entry = { id: state.nextLogId, kind, text };
  return { ...state, log: [entry, ...state.log].slice(0, 3), nextLogId: state.nextLogId + 1 };
}

function setStatus(bookings: Booking[], id: string, status: BookingStatus): Booking[] {
  return bookings.map((booking) => (booking.id === id ? { ...booking, status } : booking));
}

function reducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case "request":
      return { ...state, bookings: [...state.bookings, ...action.bookings] };

    case "commit": {
      // Like the insert in the real system, the decision is made at the moment
      // of writing, against what has actually been committed.
      const request = state.bookings.find((booking) => booking.id === action.id);
      if (!request || request.status !== "hold") return state;

      const blocker = findBlocker(state.bookings, request);
      const where = `${LANES[request.lane]}, ${formatRange(request)}`;

      if (blocker) {
        return withLog(
          { ...state, bookings: setStatus(state.bookings, request.id, "refused") },
          "refused",
          `Refused ${request.label} (${where}). It overlaps ${blocker.label}, ${formatRange(blocker)}. Postgres error 23P01.`,
        );
      }

      return withLog(
        { ...state, bookings: setStatus(state.bookings, request.id, "confirmed") },
        "confirmed",
        `Confirmed ${request.label}: ${where}.`,
      );
    }

    case "cancel": {
      const target = state.bookings.find((booking) => booking.id === action.id);
      if (!target || target.status !== "confirmed") return state;

      return withLog(
        { ...state, bookings: setStatus(state.bookings, target.id, "cancelled") },
        "cancelled",
        `Cancelled ${target.label}. The row stays for history, but ${formatRange(target)} on ${LANES[target.lane]} is free again.`,
      );
    }

    case "dismiss":
      return {
        ...state,
        bookings: state.bookings.filter(
          (booking) => !(booking.id === action.id && booking.status === "refused"),
        ),
      };

    case "note":
      return withLog(state, "info", action.text);

    case "reset":
      return initialState();
  }
}

interface Drag {
  lane: number;
  anchor: number;
  current: number;
  pointerId: number;
  /** Where the pointer went down, so a tap with a little jitter still counts as a tap. */
  startX: number;
  moved: boolean;
  /** The confirmed booking under the pointer when the drag started, if any. */
  startedOn: string | null;
}

function rangeFromDrag(drag: Drag): TimeRange {
  const start = Math.min(drag.anchor, drag.current);
  const end = Math.max(drag.anchor, drag.current);
  if (end - start >= SLOT_MINUTES) return { start, end };

  // A tap asks for an hour from where it landed.
  const tapEnd = Math.min(drag.anchor + TAP_LENGTH, DAY_MINUTES);
  return { start: tapEnd - TAP_LENGTH, end: tapEnd };
}

function minutesAt(event: ReactPointerEvent<HTMLElement>): number {
  const rect = event.currentTarget.getBoundingClientRect();
  return ((event.clientX - rect.left) / rect.width) * DAY_MINUTES;
}

function blockStyle(booking: Booking): CSSProperties {
  const split = booking.status === "hold" || booking.status === "refused" ? booking.tracks : 1;
  const track = split > 1 ? booking.track : 0;
  const gap = split > 1 ? 2 : 0;

  return {
    left: `calc(${(booking.start / DAY_MINUTES) * 100}% + 1px)`,
    width: `calc(${((booking.end - booking.start) / DAY_MINUTES) * 100}% - 2px)`,
    top: `calc(4px + (100% - 8px) * ${track} / ${split})`,
    height: `calc((100% - 8px) / ${split} - ${gap}px)`,
  };
}

const HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, index) => DAY_START_HOUR + index,
);

const START_OPTIONS = Array.from(
  { length: DAY_MINUTES / SLOT_MINUTES },
  (_, index) => index * SLOT_MINUTES,
);

const LENGTH_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1½ hours" },
  { value: 120, label: "2 hours" },
];

const logSwatch: Record<LogKind, string> = {
  confirmed: "bg-mint",
  refused: "bg-red",
  cancelled: "border border-dashed border-ash",
  info: "bg-ash",
};

export function ScheduleBoard() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [formLane, setFormLane] = useState(0);
  const [formStart, setFormStart] = useState(240);
  const [formLength, setFormLength] = useState(60);

  const boardRef = useRef<HTMLDivElement>(null);
  const timers = useRef(new Set<number>());
  const nextId = useRef(0);
  const bookingsRef = useRef(state.bookings);

  useEffect(() => {
    bookingsRef.current = state.bookings;
  }, [state.bookings]);

  const later = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  /** Sends requests as holds, then writes them one after another, like a database would. */
  const submit = useCallback(
    (requests: SlotRequest[], labels: string[]) => {
      const holds: Booking[] = requests.map((request, index) => ({
        ...request,
        id: `r${nextId.current++}`,
        label: labels[index],
        status: "hold",
        track: index,
        tracks: requests.length,
      }));

      dispatch({ type: "request", bookings: holds });

      holds.forEach((hold, index) => {
        later(() => {
          // Same rule the reducer applies, so the sound matches what the board is about to show.
          if (findBlocker(bookingsRef.current, hold)) sound.refuse();
          else sound.confirm();
          dispatch({ type: "commit", id: hold.id });
          later(() => dispatch({ type: "dismiss", id: hold.id }), REFUSED_VISIBLE_FOR);
        }, COMMIT_DELAY + index * COMMIT_STAGGER);
      });
    },
    [later],
  );

  const race = useCallback(
    (preferred?: SlotRequest) => {
      const bookings = bookingsRef.current;
      const slot =
        preferred && !findBlocker(bookings, preferred)
          ? preferred
          : findFreeSlot(bookings, 90, LANES.length);

      if (!slot) {
        dispatch({
          type: "note",
          text: "There's no free 90-minute slot left for a race. Reset the board to start over.",
        });
        return;
      }

      submit([slot, slot], ["Request A", "Request B"]);
    },
    [submit],
  );

  // Play the race once, the first time the board is properly in view.
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const mountedAt = performance.now();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const wait = Math.max(0, 1300 - (performance.now() - mountedAt));
        later(() => race(RACE_SLOT), wait);
      },
      { threshold: 0.5 },
    );

    observer.observe(board);
    return () => observer.disconnect();
  }, [later, race]);

  function reset() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
    setDrag(null);
    dispatch({ type: "reset" });
  }

  function onLanePointerDown(lane: number, event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;

    // Drags may start on top of an existing booking: trying to double-book is the point.
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-booking-id]");
    event.currentTarget.setPointerCapture(event.pointerId);
    const anchor = snapToSlot(minutesAt(event), "floor");
    setDrag({
      lane,
      anchor,
      current: anchor,
      pointerId: event.pointerId,
      startX: event.clientX,
      moved: false,
      startedOn: target?.dataset.bookingId ?? null,
    });
  }

  function onLanePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved && Math.abs(event.clientX - drag.startX) < DRAG_THRESHOLD) return;
    if (!drag.moved) sound.select();
    const current = snapToSlot(minutesAt(event));
    if (!drag.moved || current !== drag.current) setDrag({ ...drag, current, moved: true });
  }

  function onLanePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    setDrag(null);

    // A click on a confirmed booking cancels it instead of requesting a new one.
    if (!drag.moved && drag.startedOn) {
      dispatch({ type: "cancel", id: drag.startedOn });
      return;
    }

    submit([{ lane: drag.lane, ...rangeFromDrag(drag) }], ["Your booking"]);
  }

  function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const end = Math.min(formStart + formLength, DAY_MINUTES);
    submit([{ lane: formLane, start: formStart, end }], ["Your booking"]);
  }

  const preview = drag ? { lane: drag.lane, ...rangeFromDrag(drag) } : null;

  return (
    <div
      ref={boardRef}
      className="board rounded-[28px] text-bone"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-4 pt-4 sm:px-6 sm:pt-5">
        <div>
          <p className="font-semibold">Saturday 5 September</p>
          <p className="text-[14px] text-ash">
            Drag across a row to book. Click a green booking to cancel it.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ash" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-amber" aria-hidden /> Sending
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-mint" aria-hidden /> Confirmed
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-red" aria-hidden /> Refused
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] border border-dashed border-ash" aria-hidden />{" "}
            Cancelled
          </li>
        </ul>
      </div>

      <div className="mt-5 px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-[4.5rem_1fr]">
          <div className="hidden sm:block" />
          <div className="relative h-5 text-[12px] text-ash tabular-nums" aria-hidden>
            {HOURS.map((hour, index) => {
              const left = (index / (HOURS.length - 1)) * 100;
              const align =
                index === 0 ? "translate-x-0" : index === HOURS.length - 1 ? "-translate-x-full" : "-translate-x-1/2";
              const minor = (hour - DAY_START_HOUR) % 3 !== 0;
              return (
                <span
                  key={hour}
                  className={`absolute top-0 ${align} ${minor ? "hidden md:inline" : ""}`}
                  style={{ left: `${left}%` }}
                >
                  {String(hour).padStart(2, "0")}
                </span>
              );
            })}
          </div>

          {LANES.map((laneLabel, lane) => (
            <div key={laneLabel} className="contents">
              <p className="mt-3 self-center text-[13px] font-medium text-ash sm:mt-2">{laneLabel}</p>
              <div
                className="lane mt-1 sm:mt-2"
                data-cursor="Drag"
                onPointerDown={(event) => onLanePointerDown(lane, event)}
                onPointerMove={onLanePointerMove}
                onPointerUp={onLanePointerUp}
                onPointerCancel={() => setDrag(null)}
                aria-label={`${laneLabel} schedule`}
                role="group"
              >
                {state.bookings
                  .filter((booking) => booking.lane === lane)
                  .map((booking, index) => {
                    const intro = INITIAL_IDS.has(booking.id);
                    const style: CSSProperties = {
                      ...blockStyle(booking),
                      ...(intro ? { animationDelay: `${420 + index * 90}ms` } : null),
                    };
                    const content = (
                      <>
                        <span className="shrink-0">{booking.label}</span>
                        {booking.end - booking.start >= 60 && (
                          <span className="booking-time hidden min-w-0 truncate lg:inline">{formatRange(booking)}</span>
                        )}
                      </>
                    );

                    return booking.status === "confirmed" ? (
                      <button
                        key={booking.id}
                        type="button"
                        data-booking-id={booking.id}
                        data-cursor="Cancel"
                        data-status={booking.status}
                        data-intro={intro || undefined}
                        className="booking"
                        style={style}
                        // Pointer clicks are handled by the lane; this covers Enter and Space.
                        onClick={(event) => {
                          if (event.detail === 0) dispatch({ type: "cancel", id: booking.id });
                        }}
                        aria-label={`${booking.label}, ${laneLabel}, ${formatRange(booking)}. Cancel this booking.`}
                      >
                        {content}
                      </button>
                    ) : (
                      <div
                        key={booking.id}
                        data-status={booking.status}
                        data-intro={intro || undefined}
                        className="booking"
                        style={style}
                      >
                        {content}
                      </div>
                    );
                  })}

                {preview && preview.lane === lane && (
                  <div
                    className="drag-preview"
                    style={{
                      left: `${(preview.start / DAY_MINUTES) * 100}%`,
                      width: `${((preview.end - preview.start) / DAY_MINUTES) * 100}%`,
                    }}
                  >
                    {formatRange(preview)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 min-h-[5.25rem] px-4 sm:px-6" aria-live="polite">
        {state.log.length === 0 ? (
          <p className="text-[14px] text-ash">Two requests are about to arrive for the same slot.</p>
        ) : (
          <ol className="space-y-1.5">
            {state.log.map((entry, index) => (
              <li
                key={entry.id}
                className={`log-entry flex items-baseline gap-2.5 text-[14px] leading-snug ${
                  index === 0 ? "text-bone" : "text-ash"
                }`}
              >
                <span className={`relative top-px size-2.5 shrink-0 rounded-[3px] ${logSwatch[entry.kind]}`} aria-hidden />
                <span>{entry.text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-white/[0.08] px-4 py-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <form onSubmit={onFormSubmit} className="flex flex-wrap items-end gap-2" aria-label="Request a booking">
          <label className="grid gap-1 text-[12px] text-ash">
            Chair
            <select
              className="board-select"
              value={formLane}
              onChange={(event) => setFormLane(Number(event.target.value))}
            >
              {LANES.map((laneLabel, lane) => (
                <option key={laneLabel} value={lane}>
                  {laneLabel}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-[12px] text-ash">
            Start
            <select
              className="board-select tabular-nums"
              value={formStart}
              onChange={(event) => setFormStart(Number(event.target.value))}
            >
              {START_OPTIONS.map((start) => (
                <option key={start} value={start}>
                  {formatTime(start)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-[12px] text-ash">
            Length
            <select
              className="board-select"
              value={formLength}
              onChange={(event) => setFormLength(Number(event.target.value))}
            >
              {LENGTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="board-btn board-btn-strong">
            Book
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="board-btn" onClick={() => race()}>
            Send two requests at once
          </button>
          <button type="button" className="board-btn" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
