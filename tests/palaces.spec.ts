import { describe, it, expect } from "vitest";
import {
  findLifePalaceBranch,
  findBodyPalaceBranch,
  findLifePalaceStem,
  arrangePalaces,
  arrangePalaceStems
} from "../packages/core/src/palaces";

describe("Palaces - Life Palace (命宮) Positioning", () => {
  it("should find life palace for fixture case: 十一月午時 → 午", () => {
    // 2000-01-01 → 農曆1999年11月25日午時
    // 命宮應在午
    const result = findLifePalaceBranch(11, "午");
    expect(result).toBe("午");
  });

  it("should find life palace for 正月子時 → 寅", () => {
    // 正月子時：從寅起正月(寅)，從寅起子時逆數0 = 寅
    const result = findLifePalaceBranch(1, "子");
    expect(result).toBe("寅");
  });

  it("should find life palace for 二月丑時 → 寅", () => {
    // 二月(卯)丑時：從卯逆數一位 = 寅
    const result = findLifePalaceBranch(2, "丑");
    expect(result).toBe("寅");
  });

  it("should find life palace for 十二月亥時 → 寅", () => {
    // 十二月(丑)亥時：從丑逆數11位 = 寅
    // 丑(1) - 亥(11) + 12 = 2 = 寅
    const result = findLifePalaceBranch(12, "亥");
    expect(result).toBe("寅");
  });
});

describe("Palaces - Body Palace (身宮) Positioning", () => {
  it("should find body palace for fixture case: 十一月午時 → 午", () => {
    // 2000-01-01 → 農曆1999年11月25日午時
    // 身宮應在午（與命宮同位）
    const result = findBodyPalaceBranch(11, "午");
    expect(result).toBe("午");
  });

  it("should find body palace for 正月子時 → 寅", () => {
    // 正月子時：從寅起正月(寅)，從寅順數0 = 寅
    const result = findBodyPalaceBranch(1, "子");
    expect(result).toBe("寅");
  });

  it("should find body palace for 二月丑時 → 辰", () => {
    // 二月(卯)丑時：從卯順數一位 = 辰
    const result = findBodyPalaceBranch(2, "丑");
    expect(result).toBe("辰");
  });
});

describe("Palaces - Life Palace Stem (命宮天干)", () => {
  it("should find life palace stem for fixture case: 己年午宮 → 庚", () => {
    // 1999己卯年，命宮在午 → 庚午
    const result = findLifePalaceStem("己", "午");
    expect(result).toBe("庚");
  });

  it("should find palace stem for 甲年寅宮 → 丙", () => {
    // 甲年寅宮應該是丙寅（五虎遁：甲己之年丙作首）
    const result = findLifePalaceStem("甲", "寅");
    expect(result).toBe("丙");
  });

  it("should find palace stem for 乙年寅宮 → 戊", () => {
    // 乙年寅宮應該是戊寅（五虎遁：乙庚之歲戊為頭）
    const result = findLifePalaceStem("乙", "寅");
    expect(result).toBe("戊");
  });
});

describe("Palaces - Arrangement", () => {
  it("should arrange 12 palaces for female from life palace 午 (逆行)", () => {
    const result = arrangePalaces("午", "female");

    // 從命宮(午)開始逆排（女命）
    expect(result["命宮"]).toBe("午");
    expect(result["兄弟宮"]).toBe("巳");
    expect(result["夫妻宮"]).toBe("辰");
    expect(result["子女宮"]).toBe("卯");
    expect(result["財帛宮"]).toBe("寅");
    expect(result["疾厄宮"]).toBe("丑");
    expect(result["遷移宮"]).toBe("子");
    expect(result["僕役宮"]).toBe("亥");
    expect(result["官祿宮"]).toBe("戌");
    expect(result["田宅宮"]).toBe("酉");
    expect(result["福德宮"]).toBe("申");
    expect(result["父母宮"]).toBe("未");
  });

  it("should arrange 12 palaces from life palace 午 (逆時針)", () => {
    const result = arrangePalaces("午");

    // 從命宮(午)開始逆時針排列
    expect(result["命宮"]).toBe("午");
    expect(result["兄弟宮"]).toBe("巳");
    expect(result["夫妻宮"]).toBe("辰");
    expect(result["父母宮"]).toBe("未");
  });

  it("should arrange 12 palaces from life palace 子", () => {
    const result = arrangePalaces("子");

    expect(result["命宮"]).toBe("子");
    expect(result["兄弟宮"]).toBe("亥");
    expect(result["夫妻宮"]).toBe("戌");
    expect(result["父母宮"]).toBe("丑");
  });
});

describe("Palaces - Stem Arrangement", () => {
  it("should arrange palace stems for fixture case (female)", () => {
    // 命宮庚午，甲年
    const palaceBranches = arrangePalaces("午", "female");
    const result = arrangePalaceStems("甲", palaceBranches);

    // 驗證關鍵宮位（從 FIXTURE）
    expect(result["命宮"]).toBe("庚"); // 命宮庚午 ✓
    expect(result["兄弟宮"]).toBe("己"); // 兄弟宮己巳
    expect(result["夫妻宮"]).toBe("戊"); // 夫妻宮戊辰
    expect(result["子女宮"]).toBe("丁"); // 子女宮丁卯
    expect(result["財帛宮"]).toBe("丙"); // 財帛宮丙寅
    expect(result["疾厄宮"]).toBe("丁"); // 疾厄宮丁丑（注意：天干10個，地支12個，會重複）
    expect(result["遷移宮"]).toBe("丙"); // 遷移宮丙子
    expect(result["僕役宮"]).toBe("乙"); // 僕役宮乙亥
    expect(result["官祿宮"]).toBe("甲"); // 官祿宮甲戌
    expect(result["田宅宮"]).toBe("癸"); // 田宅宮癸酉
    expect(result["福德宮"]).toBe("壬"); // 福德宮壬申
    expect(result["父母宮"]).toBe("辛"); // 父母宮辛未
  });
});

describe("Palaces - Fixture Full Integration", () => {
  it("should match fixture case: 2000-01-01 女命", () => {
    const lunarMonth = 11;
    const hourBranch = "午" as const;
    const yearStem = "己" as const;
    const sex = "female" as const;

    // 1. 命宮地支
    const lifePalaceBranch = findLifePalaceBranch(lunarMonth, hourBranch);
    expect(lifePalaceBranch).toBe("午");

    // 2. 身宮地支
    const bodyPalaceBranch = findBodyPalaceBranch(lunarMonth, hourBranch);
    expect(bodyPalaceBranch).toBe("午");

    // 3. 命宮天干
    const lifePalaceStem = findLifePalaceStem(yearStem, lifePalaceBranch);
    expect(lifePalaceStem).toBe("庚");

    // 4. 十二宮排列（女命逆行）
    const palaceBranches = arrangePalaces(lifePalaceBranch, sex);
    expect(palaceBranches["命宮"]).toBe("午");
    expect(palaceBranches["兄弟宮"]).toBe("巳");
    expect(palaceBranches["夫妻宮"]).toBe("辰");
    expect(palaceBranches["遷移宮"]).toBe("子");

    // 5. 十二宮天干（由年干和地支決定，與性別無關）
    const palaceStems = arrangePalaceStems(yearStem, palaceBranches);
    expect(palaceStems["命宮"]).toBe("庚");
    expect(palaceStems["兄弟宮"]).toBe("己");
    expect(palaceStems["夫妻宮"]).toBe("戊");
    expect(palaceStems["財帛宮"]).toBe("丙");
    expect(palaceStems["遷移宮"]).toBe("丙");

    // 輸出驗證
    const palaceList = [
      "命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮",
      "遷移宮", "僕役宮", "官祿宮", "田宅宮", "福德宮", "父母宮"
    ] as const;

    console.log("\n=== Palace Arrangement for 2000-01-01 Female ===");
    palaceList.forEach(palace => {
      console.log(
        `${palace}: ${palaceStems[palace]}${palaceBranches[palace]}`
      );
    });
    console.log(`身宮: 丙${bodyPalaceBranch}`);
  });
});
