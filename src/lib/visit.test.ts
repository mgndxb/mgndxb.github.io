import { describe, expect, it } from "vitest";

import { referrerHost } from "./visit";

describe("referrerHost", () => {
  it("names the site that linked here", () => {
    expect(referrerHost("https://www.linkedin.com/feed/", "magnus.is-a.dev")).toBe("linkedin.com");
    expect(referrerHost("https://app.teamtailor.com/", "magnus.is-a.dev")).toBe("app.teamtailor.com");
  });

  it("stays empty for direct visits, links within the site and junk", () => {
    expect(referrerHost("", "magnus.is-a.dev")).toBe("");
    expect(referrerHost("https://magnus.is-a.dev/#work", "magnus.is-a.dev")).toBe("");
    expect(referrerHost("not a url", "magnus.is-a.dev")).toBe("");
  });
});
