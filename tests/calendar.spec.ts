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
    const result = parseISODateTime("2000-01-01T12:00:00");
    expect(result).toEqual({
      year: 2000,
      month: 1,
      day: 1,
      hour: 12
    });
  });

  it("should handle different hours", () => {
    const result = parseISODateTime("2000-01-01T23:30:00");
    expect(result.hour).toBe(23);
  });
});

describe("Calendar - Solar to Lunar Conversion", () => {
  it("should convert fixture case 2000-01-01 correctly", () => {
    const solar = { year: 2000, month: 1, day: 1, hour: 12 };
    const lunar = solarToLunar(solar);

    expect(lunar.year).toBe(1999);
    expect(lunar.month).toBe(11);
    expect(lunar.day).toBe(25);
    expect(lunar.isLeap).toBe(false);
    expect(lunar.hour).toBe(12);
  });

  it("should format lunar date correctly", () => {
    const lunar = { year: 1999, month: 11, day: 25, isLeap: false, hour: 12 };
    const formatted = formatLunarDate(lunar);
    expect(formatted).toBe("1999 年 11 月 25 日");
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

  it("should calculate 午時 for hour 12 (fixture case)", () => {
    expect(getHourBranch(12)).toBe("午");
  });

  it("should calculate 卯時 for hour 6", () => {
    expect(getHourBranch(6)).toBe("卯");
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
  it("should calculate 2000-01-01 as 戊午日", () => {
    const solar = { year: 2000, month: 1, day: 1, hour: 12 };
    const result = getDayStemBranch(solar);
    expect(result.stem).toBe("戊");
    expect(result.branch).toBe("午");
  });
});

describe("Calendar - Full Integration Test", () => {
  it("should process fixture case 2000-01-01 12:00 completely", () => {
    // Parse
    const solar = parseISODateTime("2000-01-01T12:00:00");
    expect(solar).toEqual({ year: 2000, month: 1, day: 1, hour: 12 });

    // Solar to Lunar
    const lunar = solarToLunar(solar);
    expect(lunar).toEqual({
      year: 1999,
      month: 11,
      day: 25,
      isLeap: false,
      hour: 12
    });

    // Year stem-branch (農曆年份1999年)
    const year = getYearStemBranch(1999);
    expect(year).toEqual({ stem: "己", branch: "卯" });

    // Month stem-branch (農曆11月)
    const month = getMonthStemBranch(11, "己");
    expect(month.branch).toBe("子"); // 十一月建子

    // Hour branch
    const hourBranch = getHourBranch(12);
    expect(hourBranch).toBe("午");

    // Day stem-branch
    const day = getDayStemBranch(solar);
    expect(day).toEqual({ stem: "戊", branch: "午" });
  });
});
