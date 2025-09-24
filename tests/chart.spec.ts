import { describe, it, expect } from "vitest";
import { makeChart, renderText } from "../packages/core/src/index";
import { FIXTURE_1984F_TEXT } from "../packages/core/src/fixtures-1984f";

describe("ZWDS fixture 1984/09/19 06:00 female", () => {
  it("renders text exactly as the gold sample", () => {
    const chart = makeChart({ sex: "female", solar: "1984-09-19T06:00:00", tz: "Asia/Hong_Kong" });
    const text = renderText(chart);
    expect(text).toBe(FIXTURE_1984F_TEXT);
  });
});