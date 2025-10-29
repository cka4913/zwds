import { describe, it, expect } from "vitest";
import {
  getFiveElementBureau,
  findZiweiPosition,
  findTianfuPosition,
  placeZiweiSystemStars,
  placeTianfuSystemStars,
  placeAllMainStars,
  addStarBrightness
} from "../packages/core/src/stars.js";

describe("Star Placement - Phase 2", () => {
  describe("getFiveElementBureau", () => {
    it("should return correct bureau for 庚午 (Life Palace of 2000-01-01 female)", () => {
      const bureau = getFiveElementBureau("庚", "午");
      expect(bureau).toBe(5); // 庚午 = 路旁土 = 土五局
    });

    it("should return correct bureau for various stem-branch combinations", () => {
      expect(getFiveElementBureau("甲", "子")).toBe(4); // 海中金 = 金四局
      expect(getFiveElementBureau("丙", "寅")).toBe(6); // 爐中火 = 火六局
      expect(getFiveElementBureau("壬", "子")).toBe(3); // 桑拓木 = 木三局
      expect(getFiveElementBureau("丙", "子")).toBe(2); // 澗下水 = 水二局
    });
  });

  describe("findZiweiPosition", () => {
    it("should find Ziwei position for 2000-01-01 female case", () => {
      // 土五局 (5), 農曆24日
      // 期望：紫微在巳 (根據 FIXTURE)
      // 計算：倍數=5, 差數=1(奇), 步數=5-1=4, 從寅數4步=巳
      const ziweiPos = findZiweiPosition(5, 24);
      expect(ziweiPos).toBe("巳");
    });

    it("should calculate Ziwei position correctly - example 1", () => {
      // 15日生、土五局：15 / 5 = 3，紫微星在辰宮
      // 倍數=3, 差數=0(偶), 步數=3+0=3, 從寅數3步=辰
      const pos = findZiweiPosition(5, 15);
      expect(pos).toBe("辰");
    });

    it("should calculate Ziwei position correctly - example 2", () => {
      // 16日生、土五局：紫微星在酉宮 (步數=8)
      // 倍數=4, 差數=4(偶), 步數=4+4=8, 從寅數8步=酉
      const pos = findZiweiPosition(5, 16);
      expect(pos).toBe("酉");
    });

    it("should calculate Ziwei position correctly - example 3", () => {
      // 17日生、土五局：紫微星在寅宮
      // 倍數=4, 差數=3(奇), 步數=4-3=1, 從寅數1步=寅
      const pos = findZiweiPosition(5, 17);
      expect(pos).toBe("寅");
    });
  });

  describe("findTianfuPosition", () => {
    it("should find Tianfu position relative to Ziwei", () => {
      expect(findTianfuPosition("巳")).toBe("亥"); // 對宮
      expect(findTianfuPosition("子")).toBe("辰");
      expect(findTianfuPosition("寅")).toBe("寅"); // 同宮
      expect(findTianfuPosition("申")).toBe("申"); // 同宮
    });
  });

  describe("placeZiweiSystemStars", () => {
    it("should place Ziwei system stars correctly when Ziwei at 巳", () => {
      const positions = placeZiweiSystemStars("巳");

      console.log("Ziwei system positions:", positions);

      // Based on FIXTURE:
      // 紫微 at 巳, 天機 at 辰, 太陽 at 寅, 武曲 at 丑, 天同 at 子, 廉貞 at 酉

      expect(positions["紫微"]).toBe("巳");
      // Let's log the rest to see if they match
    });
  });

  describe("placeTianfuSystemStars", () => {
    it("should place Tianfu system stars correctly when Tianfu at 亥", () => {
      const positions = placeTianfuSystemStars("亥");

      console.log("Tianfu system positions:", positions);

      // Based on FIXTURE:
      // 天府 at 亥, 太陰 at 子, 貪狼 at 丑, 巨門 at 寅,
      // 天相 at 卯, 天梁 at 辰, 七殺 at 巳, 破軍 at 酉

      expect(positions["天府"]).toBe("亥");
    });
  });

  describe("addStarBrightness", () => {
    it("should add correct brightness for stars", () => {
      const ziwei = addStarBrightness("紫微", "巳");
      expect(ziwei.name).toBe("紫微");
      expect(ziwei.status).toBe("旺");

      const qisha = addStarBrightness("七殺", "巳");
      expect(qisha.name).toBe("七殺");
      expect(qisha.status).toBe("平");
    });
  });

  describe("placeAllMainStars - Full Integration Test", () => {
    it("should place all 14 main stars for 2000-01-01 female case", () => {
      // 紫微 at 巳, 天府 at 亥
      const starMap = placeAllMainStars("巳", "亥");

      console.log("\\n=== Complete Star Map ===");
      const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
      branches.forEach(branch => {
        const stars = starMap[branch as keyof typeof starMap];
        if (stars.length > 0) {
          const starStr = stars.map(s => `${s.name}${s.status || ""}`).join("、");
          console.log(`${branch}宮: ${starStr}`);
        }
      });

      // Validate against FIXTURE expectations:
      // 巳: 紫微旺、七殺平
      expect(starMap["巳"]).toHaveLength(2);
      const siStars = starMap["巳"].map(s => s.name);
      expect(siStars).toContain("紫微");
      expect(siStars).toContain("七殺");

      // 亥: 天府得
      expect(starMap["亥"]).toHaveLength(1);
      expect(starMap["亥"][0].name).toBe("天府");
      expect(starMap["亥"][0].status).toBe("得");
    });
  });
});
