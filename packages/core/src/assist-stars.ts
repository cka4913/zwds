import type { EarthBranch, HeavenlyStem, StarPresence } from "./types.js";
import { getBranchByIndex, getBranchIndex, getStarBrightness } from "./data.js";

/**
 * 輔星排列工具
 *
 * 包含六吉星、六煞星、其他辅星的排列算法
 */

/**
 * 移動宮位（順時針）
 * @param branch 起始地支
 * @param steps 移動步數
 * @returns 目標地支
 */
function moveClockwise(branch: EarthBranch, steps: number): EarthBranch {
  const index = getBranchIndex(branch);
  const targetIndex = (index + steps) % 12;
  return getBranchByIndex(targetIndex);
}

/**
 * 移動宮位（逆時針）
 * @param branch 起始地支
 * @param steps 移動步數
 * @returns 目標地支
 */
function moveCounterClockwise(branch: EarthBranch, steps: number): EarthBranch {
  const index = getBranchIndex(branch);
  const targetIndex = (index - steps + 12) % 12;
  return getBranchByIndex(targetIndex);
}

/**
 * 添加星曜亮度
 * @param starName 星曜名稱
 * @param branch 所在地支
 * @returns StarPresence
 */
function addStarBrightness(starName: string, branch: EarthBranch): StarPresence {
  const brightness = getStarBrightness(starName, branch);
  return {
    name: starName,
    status: brightness || ""
  };
}

// ============ 六吉星 ============

/**
 * 安文昌星（時系星曜）
 * 口訣：子時戌上起文昌，逆到生時是貴鄉
 *
 * @param hourBranch 出生時辰地支
 * @returns 文昌星所在地支
 */
export function placeWenChang(hourBranch: EarthBranch): { branch: EarthBranch; star: StarPresence } {
  // 從戌宮起子時，逆時針數至出生時辰
  // 戌 = index 10
  const xuIndex = 10; // 戌
  const ziIndex = 0;  // 子

  // 計算時辰偏移（從子時開始）
  const hourIndex = getBranchIndex(hourBranch);
  const offset = (hourIndex - ziIndex + 12) % 12;

  // 從戌宮逆時針移動
  const wenChangIndex = (xuIndex - offset + 12) % 12;
  const branch = getBranchByIndex(wenChangIndex);

  return { branch, star: addStarBrightness("文昌", branch) };
}

/**
 * 安文曲星（時系星曜）
 * 口訣：文曲數從辰上起，順到生時是本鄉
 *
 * @param hourBranch 出生時辰地支
 * @returns 文曲星所在地支
 */
export function placeWenQu(hourBranch: EarthBranch): { branch: EarthBranch; star: StarPresence } {
  // 從辰宮起子時，順時針數至出生時辰
  // 辰 = index 4
  const chenIndex = 4; // 辰
  const ziIndex = 0;   // 子

  // 計算時辰偏移
  const hourIndex = getBranchIndex(hourBranch);
  const offset = (hourIndex - ziIndex + 12) % 12;

  // 從辰宮順時針移動
  const wenQuIndex = (chenIndex + offset) % 12;
  const branch = getBranchByIndex(wenQuIndex);

  return { branch, star: addStarBrightness("文曲", branch) };
}

/**
 * 安左輔星（月系星曜）
 * 口訣：左輔正月起於辰，順逢生月是貴方
 *
 * @param lunarMonth 農曆出生月份 (1-12)
 * @returns 左輔星所在地支
 */
export function placeZuoFu(lunarMonth: number): { branch: EarthBranch; star: StarPresence } {
  // 從辰宮起正月，順時針數至出生月份
  // 辰 = index 4
  const chenIndex = 4; // 辰

  // 正月 = 1，在辰宮（index 4）
  // 二月 = 2，在巳宮（index 5）
  const offset = lunarMonth - 1;
  const zuoFuIndex = (chenIndex + offset) % 12;
  const branch = getBranchByIndex(zuoFuIndex);

  return { branch, star: addStarBrightness("左輔", branch) };
}

/**
 * 安右弼星（月系星曜）
 * 口訣：右弼正月宮尋戌，逆至生月便調停
 *
 * @param lunarMonth 農曆出生月份 (1-12)
 * @returns 右弼星所在地支
 */
export function placeYouBi(lunarMonth: number): { branch: EarthBranch; star: StarPresence } {
  // 從戌宮起正月，逆時針數至出生月份
  // 戌 = index 10
  const xuIndex = 10; // 戌

  // 正月 = 1，在戌宮（index 10）
  // 二月 = 2，在酉宮（index 9）
  const offset = lunarMonth - 1;
  const youBiIndex = (xuIndex - offset + 12) % 12;
  const branch = getBranchByIndex(youBiIndex);

  return { branch, star: addStarBrightness("右弼", branch) };
}

/**
 * 安天魁天鉞星（年系星曜）
 * 根據出生年干確定宮位（天乙貴人）
 *
 * @param yearStem 年干
 * @returns 天魁和天鉞所在地支
 */
export function placeTianKuiTianYue(yearStem: HeavenlyStem): {
  tianKui: { branch: EarthBranch; star: StarPresence };
  tianYue: { branch: EarthBranch; star: StarPresence };
} {
  // 天魁天鉞對照表
  const tianKuiYueMap: Record<HeavenlyStem, { kui: EarthBranch; yue: EarthBranch }> = {
    "甲": { kui: "丑", yue: "未" },
    "乙": { kui: "子", yue: "申" },
    "丙": { kui: "亥", yue: "酉" },
    "丁": { kui: "亥", yue: "酉" },
    "戊": { kui: "丑", yue: "未" },
    "己": { kui: "子", yue: "申" },
    "庚": { kui: "丑", yue: "未" },
    "辛": { kui: "午", yue: "寅" },
    "壬": { kui: "卯", yue: "巳" },
    "癸": { kui: "卯", yue: "巳" }
  };

  const { kui, yue } = tianKuiYueMap[yearStem];

  return {
    tianKui: { branch: kui, star: addStarBrightness("天魁", kui) },
    tianYue: { branch: yue, star: addStarBrightness("天鉞", yue) }
  };
}

// ============ 六煞星 ============

/**
 * 安祿存星（年系星曜）
 * 口訣：甲生祿存在寅宮，乙生在卯丙戊巳，丁己祿存午方，庚祿申，辛祿酉，壬祿亥，癸祿子
 *
 * @param yearStem 年干
 * @returns 祿存星所在地支
 */
export function placeLuCun(yearStem: HeavenlyStem): { branch: EarthBranch; star: StarPresence } {
  const luCunMap: Record<HeavenlyStem, EarthBranch> = {
    "甲": "寅",
    "乙": "卯",
    "丙": "巳",
    "丁": "午",
    "戊": "巳",
    "己": "午",
    "庚": "申",
    "辛": "酉",
    "壬": "亥",
    "癸": "子"
  };

  const branch = luCunMap[yearStem];
  return { branch, star: addStarBrightness("祿存", branch) };
}

/**
 * 安擎羊陀羅星（年系星曜）
 * 規則：祿前安擎羊，祿後安陀羅
 *
 * @param yearStem 年干
 * @returns 擎羊和陀羅所在地支
 */
export function placeQingYangTuoLuo(yearStem: HeavenlyStem): {
  qingYang: { branch: EarthBranch; star: StarPresence };
  tuoLuo: { branch: EarthBranch; star: StarPresence };
} {
  const { branch: luCunBranch } = placeLuCun(yearStem);

  // 擎羊在祿存順時針下一宮
  const qingYangBranch = moveClockwise(luCunBranch, 1);

  // 陀羅在祿存逆時針上一宮
  const tuoLuoBranch = moveCounterClockwise(luCunBranch, 1);

  return {
    qingYang: { branch: qingYangBranch, star: addStarBrightness("擎羊", qingYangBranch) },
    tuoLuo: { branch: tuoLuoBranch, star: addStarBrightness("陀羅", tuoLuoBranch) }
  };
}

/**
 * 安火星鈴星（年支時系星曜）
 * 根據年支與時辰組合確定位置
 *
 * @param yearBranch 年支
 * @param hourBranch 時辰地支
 * @returns 火星和鈴星所在地支
 */
export function placeHuoXingLingXing(yearBranch: EarthBranch, hourBranch: EarthBranch): {
  huoXing: { branch: EarthBranch; star: StarPresence };
  lingXing: { branch: EarthBranch; star: StarPresence };
} {
  // 火星鈴星對照表（根據年支組合）
  // 寅午戌年：火星從卯起子時順行，鈴星從戌起子時順行
  // 申子辰年：火星從酉起子時順行，鈴星從辰起子時順行
  // 巳酉丑年：火星從午起子時順行，鈴星從丑起子時順行
  // 亥卯未年：火星從子起子時順行，鈴星從未起子時順行

  const huoXingStart: Record<string, number> = {
    "寅午戌": 3,  // 卯
    "申子辰": 9,  // 酉
    "巳酉丑": 6,  // 午
    "亥卯未": 0   // 子
  };

  const lingXingStart: Record<string, number> = {
    "寅午戌": 10, // 戌
    "申子辰": 4,  // 辰
    "巳酉丑": 1,  // 丑
    "亥卯未": 7   // 未
  };

  // 確定年支屬於哪個三合組
  let group = "";
  if (["寅", "午", "戌"].includes(yearBranch)) group = "寅午戌";
  else if (["申", "子", "辰"].includes(yearBranch)) group = "申子辰";
  else if (["巳", "酉", "丑"].includes(yearBranch)) group = "巳酉丑";
  else if (["亥", "卯", "未"].includes(yearBranch)) group = "亥卯未";

  // 計算時辰偏移
  const hourIndex = getBranchIndex(hourBranch);
  const ziIndex = 0; // 子時
  const offset = (hourIndex - ziIndex + 12) % 12;

  // 計算火星和鈴星位置
  const huoXingIndex = (huoXingStart[group] + offset) % 12;
  const lingXingIndex = (lingXingStart[group] + offset) % 12;

  const huoXingBranch = getBranchByIndex(huoXingIndex);
  const lingXingBranch = getBranchByIndex(lingXingIndex);

  return {
    huoXing: { branch: huoXingBranch, star: addStarBrightness("火星", huoXingBranch) },
    lingXing: { branch: lingXingBranch, star: addStarBrightness("鈴星", lingXingBranch) }
  };
}

/**
 * 安地空地劫星（時系星曜）
 * 規則：從亥宮起子時，地劫順時針，地空逆時針
 *
 * @param hourBranch 出生時辰地支
 * @returns 地空和地劫所在地支
 */
export function placeDiKongDiJie(hourBranch: EarthBranch): {
  diKong: { branch: EarthBranch; star: StarPresence };
  diJie: { branch: EarthBranch; star: StarPresence };
} {
  // 從亥宮起子時
  const haiIndex = 11; // 亥
  const ziIndex = 0;   // 子

  // 計算時辰偏移
  const hourIndex = getBranchIndex(hourBranch);
  const offset = (hourIndex - ziIndex + 12) % 12;

  // 地劫：從亥宮順時針數至出生時辰
  const diJieIndex = (haiIndex + offset) % 12;
  const diJieBranch = getBranchByIndex(diJieIndex);

  // 地空：從亥宮逆時針數至出生時辰
  const diKongIndex = (haiIndex - offset + 12) % 12;
  const diKongBranch = getBranchByIndex(diKongIndex);

  return {
    diKong: { branch: diKongBranch, star: addStarBrightness("地空", diKongBranch) },
    diJie: { branch: diJieBranch, star: addStarBrightness("地劫", diJieBranch) }
  };
}

// ============ 其他輔星 ============

/**
 * 安天馬星（年支系星曜）
 * 規則：
 * - 寅午戌年：申宮
 * - 申子辰年：寅宮
 * - 巳酉丑年：亥宮
 * - 亥卯未年：巳宮
 *
 * @param yearBranch 年支
 * @returns 天馬星所在地支
 */
export function placeTianMa(yearBranch: EarthBranch): { branch: EarthBranch; star: StarPresence } {
  const tianMaMap: Record<string, EarthBranch> = {
    "寅": "申", "午": "申", "戌": "申",
    "申": "寅", "子": "寅", "辰": "寅",
    "巳": "亥", "酉": "亥", "丑": "亥",
    "亥": "巳", "卯": "巳", "未": "巳"
  };

  const branch = tianMaMap[yearBranch];
  return { branch, star: addStarBrightness("天馬", branch) };
}

/**
 * 安所有輔星
 *
 * @param yearStem 年干
 * @param yearBranch 年支
 * @param lunarMonth 農曆月份
 * @param hourBranch 時辰地支
 * @returns 每個地支對應的輔星列表
 */
export function placeAllAssistStars(
  yearStem: HeavenlyStem,
  yearBranch: EarthBranch,
  lunarMonth: number,
  hourBranch: EarthBranch
): Record<EarthBranch, StarPresence[]> {
  // 初始化12個地支的輔星列表
  const assistStarMap: Record<EarthBranch, StarPresence[]> = {
    子: [], 丑: [], 寅: [], 卯: [], 辰: [], 巳: [],
    午: [], 未: [], 申: [], 酉: [], 戌: [], 亥: []
  };

  // 六吉星
  const { branch: wenChangBranch, star: wenChangStar } = placeWenChang(hourBranch);
  assistStarMap[wenChangBranch].push(wenChangStar);

  const { branch: wenQuBranch, star: wenQuStar } = placeWenQu(hourBranch);
  assistStarMap[wenQuBranch].push(wenQuStar);

  const { branch: zuoFuBranch, star: zuoFuStar } = placeZuoFu(lunarMonth);
  assistStarMap[zuoFuBranch].push(zuoFuStar);

  const { branch: youBiBranch, star: youBiStar } = placeYouBi(lunarMonth);
  assistStarMap[youBiBranch].push(youBiStar);

  const { tianKui, tianYue } = placeTianKuiTianYue(yearStem);
  assistStarMap[tianKui.branch].push(tianKui.star);
  assistStarMap[tianYue.branch].push(tianYue.star);

  // 祿存
  const { branch: luCunBranch, star: luCunStar } = placeLuCun(yearStem);
  assistStarMap[luCunBranch].push(luCunStar);

  // 六煞星
  const { qingYang, tuoLuo } = placeQingYangTuoLuo(yearStem);
  assistStarMap[qingYang.branch].push(qingYang.star);
  assistStarMap[tuoLuo.branch].push(tuoLuo.star);

  const { huoXing, lingXing } = placeHuoXingLingXing(yearBranch, hourBranch);
  assistStarMap[huoXing.branch].push(huoXing.star);
  assistStarMap[lingXing.branch].push(lingXing.star);

  const { diKong, diJie } = placeDiKongDiJie(hourBranch);
  assistStarMap[diKong.branch].push(diKong.star);
  assistStarMap[diJie.branch].push(diJie.star);

  // 天馬
  const { branch: tianMaBranch, star: tianMaStar } = placeTianMa(yearBranch);
  assistStarMap[tianMaBranch].push(tianMaStar);

  return assistStarMap;
}
