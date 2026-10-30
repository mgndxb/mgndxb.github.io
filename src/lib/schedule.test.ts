import { describe, expect, it } from "vitest";

import {
  DAY_MINUTES,
  findBlocker,
  findFreeSlot,
  formatRange,
  snapToSlot,
  type Booking,
} from "./schedule";

function booking(overrides: Partial<Booking>): Booking {
  return {
    id: "existing",
    lane: 0,
    start: 60,
    end: 120,
    label: "Lip blush",
    status: "confirmed",
    track: 0,
    tracks: 1,
    ...overrides,
  };
}

describe("findBlocker", () => {
  const existing = booking({ start: 60, end: 120 }); // 10:00–11:00

  it("refuses a request that overlaps a confirmed booking on the same lane", () => {
    expect(findBlocker([existing], { lane: 0, start: 90, end: 150 })).toBe(existing);
  });

  it("accepts a request that only touches the end of another booking", () => {
    expect(findBlocker([existing], { lane: 0, start: 120, end: 180 })).toBeNull();
  });

  it("accepts a request that only touches the start of another booking", () => {
    expect(findBlocker([existing], { lane: 0, start: 0, end: 60 })).toBeNull();
  });

  it("accepts the same time on a different lane", () => {
    expect(findBlocker([existing], { lane: 1, start: 60, end: 120 })).toBeNull();
  });

  it("ignores cancelled bookings, so cancelling frees the slot", () => {
    const cancelled = booking({ status: "cancelled" });
    expect(findBlocker([cancelled], { lane: 0, start: 60, end: 120 })).toBeNull();
  });

  it("ignores requests that are still in flight", () => {
    const inFlight = booking({ status: "hold" });
    expect(findBlocker([inFlight], { lane: 0, start: 60, end: 120 })).toBeNull();
  });
});

describe("findFreeSlot", () => {
  it("returns null when every lane is fully booked", () => {
    const full = [
      booking({ id: "a", lane: 0, start: 0, end: DAY_MINUTES }),
      booking({ id: "b", lane: 1, start: 0, end: DAY_MINUTES }),
    ];
    expect(findFreeSlot(full, 60, 2)).toBeNull();
  });

  it("only offers slots that the board would accept", () => {
    const existing = [booking({ lane: 0, start: 0, end: DAY_MINUTES - 60 })];
    const slot = findFreeSlot(existing, 60, 1, () => 0);
    expect(slot).toEqual({ lane: 0, start: DAY_MINUTES - 60, end: DAY_MINUTES });
  });
});

describe("formatting and snapping", () => {
  it("formats minutes from the start of the day as clock times", () => {
    expect(formatRange({ start: 210, end: 300 })).toBe("12:30–14:00");
  });

  it("snaps to half-hour slots inside the day", () => {
    expect(snapToSlot(44)).toBe(30);
    expect(snapToSlot(44, "floor")).toBe(30);
    expect(snapToSlot(46)).toBe(60);
    expect(snapToSlot(-20)).toBe(0);
    expect(snapToSlot(DAY_MINUTES + 90)).toBe(DAY_MINUTES);
  });
});
