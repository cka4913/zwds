import { describe, it, expect } from "vitest";
import { makeChart, renderText } from "../packages/core/src/index";
import { FIXTURE_2000F_TEXT } from "../packages/core/src/fixtures-2000f";

describe("ZWDS fixture 2000/01/01 12:00 female", () => {
  it("renders text exactly as the gold sample", () => {
    const chart = makeChart({ sex: "female", solar: "2000-01-01T12:00:00" });
    const text = renderText(chart);
    expect(text).toBe(FIXTURE_2000F_TEXT);
  });
});