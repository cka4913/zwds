import { describe, it, expect } from "vitest";
import {
  parseISODateTime,
  solarToLunar,
  getYearStemBranch,
  getMonthStemBranch,
  getHourBranch,
  getHourStem,
  getDayStemBranch,
  formatLunarDate
} from "../packages/core/src/calendar";

describe("Calendar - ISO DateTime Parsing", () => {
  it("should parse ISO datetime correctly", () => {
    const result = parseISODateTime("1984-09-19T06:00:00");
    expect(result).toEqual({
      year: 1984,
      month: 9,
      day: 19,
      hour: 6
    });
  });

  it("should handle different hours", () => {
    const result = parseISODateTime("2000-01-01T23:30:00");
    expect(result.hour).toBe(23);
  });
});

describe("Calendar - Solar to Lunar Conversion", () => {
  it("should convert fixture case 1984-09-19 correctly", () => {
    const solar = { year: 1984, month: 9, day: 19, hour: 6 };
    const lunar = solarToLunar(solar);

    expect(lunar.year).toBe(1984);
    expect(lunar.month).toBe(8);
    expect(lunar.day).toBe(24);
    expect(lunar.isLeap).toBe(false);
    expect(lunar.hour).toBe(6);
  });

  it("should format lunar date correctly", () => {
    const lunar = { year: 1984, month: 8, day: 24, isLeap: false, hour: 6 };
    const formatted = formatLunarDate(lunar);
    expect(formatted).toBe("1984 年 8 月 24 日");
  });

  it("should throw error for unimplemented dates", () => {
    const solar = { year: 2000, month: 1, day: 1, hour: 0 };
    expect(() => solarToLunar(solar)).toThrow();
  });
});

describe("Calendar - Year Stem-Branch", () => {
  it("should calculate 1984 as 甲子年", () => {
    const result = getYearStemBranch(1984);
    expect(result.stem).toBe("甲");
    expect(result.branch).toBe("子");
  });

  it("should calculate 1985 as 乙丑年", () => {
    const result = getYearStemBranch(1985);
    expect(result.stem).toBe("乙");
    expect(result.branch).toBe("丑");
  });

  it("should calculate 2024 as 甲辰年", () => {
    const result = getYearStemBranch(2024);
    expect(result.stem).toBe("甲");
    expect(result.branch).toBe("辰");
  });

  it("should wrap around correctly", () => {
    const result1984 = getYearStemBranch(1984);
    const result2044 = getYearStemBranch(2044); // 60年後，應該又是甲子

    expect(result2044.stem).toBe(result1984.stem);
    expect(result2044.branch).toBe(result1984.branch);
  });
});

describe("Calendar - Month Stem-Branch", () => {
  it("should calculate month for 甲年正月 (1984-01)", () => {
    const result = getMonthStemBranch(1, "甲");
    expect(result.stem).toBe("丙");
    expect(result.branch).toBe("寅"); // 正月建寅
  });

  it("should calculate month for 甲年八月 (1984-08)", () => {
    const result = getMonthStemBranch(8, "甲");
    expect(result.stem).toBe("癸"); // 丙+7=癸 (2+7=9)
    expect(result.branch).toBe("酉"); // 寅+7=酉（八月建酉）
  });
});

describe("Calendar - Hour Branch", () => {
  it("should calculate 子時 for hour 0", () => {
    expect(getHourBranch(0)).toBe("子");
  });

  it("should calculate 卯時 for hour 6 (fixture case)", () => {
    expect(getHourBranch(6)).toBe("卯");
  });

  it("should calculate 午時 for hour 12", () => {
    expect(getHourBranch(12)).toBe("午");
  });

  it("should calculate 亥時 for hour 22", () => {
    expect(getHourBranch(22)).toBe("亥");
  });

  it("should calculate 子時 for hour 23", () => {
    expect(getHourBranch(23)).toBe("子");
  });
});

describe("Calendar - Hour Stem", () => {
  it("should calculate hour stem for 甲日子時", () => {
    const result = getHourStem("子", "甲");
    expect(result).toBe("甲");
  });

  it("should calculate hour stem for 甲日卯時", () => {
    const result = getHourStem("卯", "甲");
    expect(result).toBe("丁");
  });
});

describe("Calendar - Day Stem-Branch (fixture)", () => {
  it("should calculate 1984-09-19 as 甲子日", () => {
    const solar = { year: 1984, month: 9, day: 19, hour: 6 };
    const result = getDayStemBranch(solar);
    expect(result.stem).toBe("甲");
    expect(result.branch).toBe("子");
  });
});

describe("Calendar - Full Integration Test", () => {
  it("should process fixture case 1984-09-19 06:00 completely", () => {
    // Parse
    const solar = parseISODateTime("1984-09-19T06:00:00");
    expect(solar).toEqual({ year: 1984, month: 9, day: 19, hour: 6 });

    // Solar to Lunar
    const lunar = solarToLunar(solar);
    expect(lunar).toEqual({
      year: 1984,
      month: 8,
      day: 24,
      isLeap: false,
      hour: 6
    });

    // Year stem-branch
    const year = getYearStemBranch(1984);
    expect(year).toEqual({ stem: "甲", branch: "子" });

    // Month stem-branch
    const month = getMonthStemBranch(8, "甲");
    expect(month.branch).toBe("酉"); // 八月建酉（正月建寅，寅+7=酉）

    // Hour branch
    const hourBranch = getHourBranch(6);
    expect(hourBranch).toBe("卯");

    // Day stem-branch
    const day = getDayStemBranch(solar);
    expect(day).toEqual({ stem: "甲", branch: "子" });
  });
});
