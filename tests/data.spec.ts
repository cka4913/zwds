import { describe, it, expect } from "vitest";
import {
  HEAVENLY_STEMS,
  EARTH_BRANCHES,
  PALACE_NAMES,
  MAIN_STARS,
  LUCKY_STARS,
  UNLUCKY_STARS,
  getOppositeBranch,
  getSanFangSiZheng,
  getOppositePalace,
  getYearTransforms,
  getMainStarBrightness,
  getBranchIndex,
  getStemIndex,
  getBranchByIndex,
  getStemByIndex
} from "../packages/core/src/data";

describe("Data Tables - Stems & Branches", () => {
  it("should have 10 heavenly stems", () => {
    expect(HEAVENLY_STEMS).toHaveLength(10);
    expect(HEAVENLY_STEMS[0]).toBe("甲");
    expect(HEAVENLY_STEMS[9]).toBe("癸");
  });

  it("should have 12 earth branches", () => {
    expect(EARTH_BRANCHES).toHaveLength(12);
    expect(EARTH_BRANCHES[0]).toBe("子");
    expect(EARTH_BRANCHES[11]).toBe("亥");
  });

  it("should get correct opposite branches", () => {
    expect(getOppositeBranch("子")).toBe("午");
    expect(getOppositeBranch("午")).toBe("子");
    expect(getOppositeBranch("丑")).toBe("未");
    expect(getOppositeBranch("未")).toBe("丑");
    expect(getOppositeBranch("寅")).toBe("申");
    expect(getOppositeBranch("申")).toBe("寅");
  });

  it("should get correct san fang si zheng (three-sided-four-aligned)", () => {
    const result = getSanFangSiZheng("子");
    expect(result).toHaveLength(4);
    expect(result).toContain("子"); // 本宮
    expect(result).toContain("午"); // 對宮
    expect(result).toContain("辰"); // 三合
    expect(result).toContain("申"); // 三合
  });

  it("should convert branch to index and back", () => {
    expect(getBranchIndex("子")).toBe(0);
    expect(getBranchIndex("丑")).toBe(1);
    expect(getBranchIndex("亥")).toBe(11);

    expect(getBranchByIndex(0)).toBe("子");
    expect(getBranchByIndex(11)).toBe("亥");
    expect(getBranchByIndex(12)).toBe("子"); // wraps around
  });

  it("should convert stem to index and back", () => {
    expect(getStemIndex("甲")).toBe(0);
    expect(getStemIndex("癸")).toBe(9);

    expect(getStemByIndex(0)).toBe("甲");
    expect(getStemByIndex(9)).toBe("癸");
    expect(getStemByIndex(10)).toBe("甲"); // wraps around
  });
});

describe("Data Tables - Palaces", () => {
  it("should have 12 palace names", () => {
    expect(PALACE_NAMES).toHaveLength(12);
    expect(PALACE_NAMES[0]).toBe("命宮");
    expect(PALACE_NAMES[11]).toBe("父母宮");
  });

  it("should get correct opposite palaces", () => {
    expect(getOppositePalace("命宮")).toBe("遷移宮");
    expect(getOppositePalace("遷移宮")).toBe("命宮");
    expect(getOppositePalace("兄弟宮")).toBe("交友宮");
    expect(getOppositePalace("財帛宮")).toBe("福德宮");
  });
});

describe("Data Tables - Year Transforms", () => {
  it("should get 庚 year transforms correctly (from fixture)", () => {
    const transforms = getYearTransforms("庚");
    expect(transforms["化祿"]).toBe("太陽");
    expect(transforms["化權"]).toBe("武曲");
    expect(transforms["化科"]).toBe("太陰");
    expect(transforms["化忌"]).toBe("天同");
  });

  it("should get 甲 year transforms", () => {
    const transforms = getYearTransforms("甲");
    expect(transforms["化祿"]).toBe("廉貞");
    expect(transforms["化權"]).toBe("破軍");
    expect(transforms["化科"]).toBe("武曲");
    expect(transforms["化忌"]).toBe("太陽");
  });

  it("should have all 10 stems", () => {
    HEAVENLY_STEMS.forEach(stem => {
      const transforms = getYearTransforms(stem);
      expect(transforms).toHaveProperty("化祿");
      expect(transforms).toHaveProperty("化權");
      expect(transforms).toHaveProperty("化科");
      expect(transforms).toHaveProperty("化忌");
    });
  });
});

describe("Data Tables - Stars", () => {
  it("should have 14 main stars", () => {
    expect(MAIN_STARS).toHaveLength(14);
    expect(MAIN_STARS).toContain("紫微");
    expect(MAIN_STARS).toContain("天機");
    expect(MAIN_STARS).toContain("太陽");
    expect(MAIN_STARS).toContain("破軍");
  });

  it("should get main star brightness correctly (from fixture)", () => {
    // 兄弟宮（巳）：紫微旺、七殺平
    expect(getMainStarBrightness("紫微", "巳")).toBe("旺");
    expect(getMainStarBrightness("七殺", "巳")).toBe("平");

    // 財帛宮（寅）：太陽旺、巨門廟
    expect(getMainStarBrightness("太陽", "寅")).toBe("旺");
    expect(getMainStarBrightness("巨門", "寅")).toBe("廟");

    // 遷移宮（子）：天同旺、太陰廟
    expect(getMainStarBrightness("天同", "子")).toBe("旺");
    expect(getMainStarBrightness("太陰", "子")).toBe("廟");
  });

  it("should have lucky stars", () => {
    expect(LUCKY_STARS).toHaveLength(6);
    expect(LUCKY_STARS).toContain("文昌");
    expect(LUCKY_STARS).toContain("文曲");
    expect(LUCKY_STARS).toContain("左輔");
    expect(LUCKY_STARS).toContain("右弼");
  });

  it("should have unlucky stars", () => {
    expect(UNLUCKY_STARS).toHaveLength(6);
    expect(UNLUCKY_STARS).toContain("擎羊");
    expect(UNLUCKY_STARS).toContain("陀羅");
    expect(UNLUCKY_STARS).toContain("火星");
    expect(UNLUCKY_STARS).toContain("鈴星");
  });
});
