import { EarthBranch, HeavenlyStem, StarPresence } from "./types.js";

// Direct JSON imports (works in both Node.js and Cloudflare Workers)
import bureauData from "./data/bureau.json" with { type: "json" };
import ziweiTianfuMap from "./data/ziwei-tianfu-map.json" with { type: "json" };
import starsMainData from "./data/stars-main.json" with { type: "json" };

// 地支順序（用於順時針/逆時針移動）
const BRANCHES: EarthBranch[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 取得五行局 - Get Five Element Bureau
 * 根據命宮的天干地支（納音）確定五行局
 * @param lifePalaceStem 命宮天干
 * @param lifePalaceBranch 命宮地支
 * @returns 五行局數字 (2=水二局, 3=木三局, 4=金四局, 5=土五局, 6=火六局)
 */
export function getFiveElementBureau(
  lifePalaceStem: HeavenlyStem,
  lifePalaceBranch: EarthBranch
): number {
  const stemBranch = `${lifePalaceStem}${lifePalaceBranch}`;
  const bureauInfo = (bureauData.nayin as any)[stemBranch];

  if (!bureauInfo) {
    throw new Error(`Invalid stem-branch combination: ${stemBranch}`);
  }

  return bureauInfo.bureauNumber;
}

/**
 * 地支位置轉換為索引
 */
function branchToIndex(branch: EarthBranch): number {
  return BRANCHES.indexOf(branch);
}

/**
 * 索引轉換為地支
 */
function indexToBranch(index: number): EarthBranch {
  const normalized = ((index % 12) + 12) % 12;
  return BRANCHES[normalized];
}

/**
 * 從某地支開始，順時針移動n個位置
 */
function moveClockwise(start: EarthBranch, steps: number): EarthBranch {
  const startIndex = branchToIndex(start);
  return indexToBranch(startIndex + steps);
}

/**
 * 從某地支開始，逆時針移動n個位置
 */
function moveCounterClockwise(start: EarthBranch, steps: number): EarthBranch {
  const startIndex = branchToIndex(start);
  return indexToBranch(startIndex - steps);
}

/**
 * 尋找紫微星位置 - Find Ziwei Star Position
 *
 * 算法（基於開源項目研究）：
 * 1. 計算倍數：找到最小的倍數使得 倍數 × 局數 > 生日數
 * 2. 計算差數：差數 = (倍數 × 局數) - 生日數
 * 3. 判斷差數奇偶：
 *    - 若差數為奇數：步數 = 倍數 - 差數
 *    - 若差數為偶數：步數 = 倍數 + 差數
 * 4. 從寅宮開始順時針數，寅=1, 卯=2, ..., 數到步數所在宮位
 *
 * 例子：
 * - 24日生、土五局(5)：
 *   倍數 = 5 (5×5=25>24)
 *   差數 = 25-24 = 1 (奇數)
 *   步數 = 5-1 = 4
 *   從寅數: 寅(1)→卯(2)→辰(3)→巳(4) ✓
 *
 * @param bureau 五行局數字 (2-6)
 * @param lunarDay 農曆生日 (1-30)
 * @returns 紫微星所在地支
 */
export function findZiweiPosition(bureau: number, lunarDay: number): EarthBranch {
  if (bureau < 2 || bureau > 6) {
    throw new Error(`Invalid bureau number: ${bureau}`);
  }

  // 1. 計算倍數 (找到最小的 multiplier 使得 multiplier × bureau > lunarDay)
  const multiplier = Math.ceil(lunarDay / bureau);

  // 2. 計算差數
  const difference = multiplier * bureau - lunarDay;

  // 3. 根據差數奇偶性計算步數
  let steps: number;
  if (difference % 2 === 1) {
    // 奇數：倍數 - 差數
    steps = multiplier - difference;
  } else {
    // 偶數：倍數 + 差數
    steps = multiplier + difference;
  }

  // 4. 從寅宮開始數 (寅=1)
  // steps-1 因為寅本身是第1步
  const yinIndex = branchToIndex("寅");
  return indexToBranch(yinIndex + steps - 1);
}

/**
 * 尋找天府星位置 - Find Tianfu Star Position
 * 天府星與紫微星有固定的對應關係
 *
 * @param ziweiPosition 紫微星所在地支
 * @returns 天府星所在地支
 */
export function findTianfuPosition(ziweiPosition: EarthBranch): EarthBranch {
  const tianfuPosition = ziweiTianfuMap.ziweiToTianfu[ziweiPosition as keyof typeof ziweiTianfuMap.ziweiToTianfu];

  if (!tianfuPosition) {
    throw new Error(`Invalid ziwei position: ${ziweiPosition}`);
  }

  return tianfuPosition as EarthBranch;
}

/**
 * 安放紫微星系 - Place Ziwei System Stars
 *
 * 紫微星系（6顆星，逆時針排列）：
 * 紫微 → 天機 → [空1格] → 太陽 → 武曲 → 天同 → [空2格] → 廉貞
 *
 * @param ziweiPosition 紫微星所在地支
 * @returns 紫微星系各星的位置
 */
export function placeZiweiSystemStars(ziweiPosition: EarthBranch): Record<string, EarthBranch> {
  const positions: Record<string, EarthBranch> = {};

  positions["紫微"] = ziweiPosition;
  positions["天機"] = moveCounterClockwise(ziweiPosition, 1);
  positions["太陽"] = moveCounterClockwise(ziweiPosition, 3); // 跳過1格
  positions["武曲"] = moveCounterClockwise(ziweiPosition, 4);
  positions["天同"] = moveCounterClockwise(ziweiPosition, 5);
  positions["廉貞"] = moveCounterClockwise(ziweiPosition, 8); // 跳過2格

  return positions;
}

/**
 * 安放天府星系 - Place Tianfu System Stars
 *
 * 天府星系（8顆星，順時針排列）：
 * 天府 → 太陰 → 貪狼 → 巨門 → 天相 → 天梁 → 七殺 → [空3格] → 破軍
 *
 * @param tianfuPosition 天府星所在地支
 * @returns 天府星系各星的位置
 */
export function placeTianfuSystemStars(tianfuPosition: EarthBranch): Record<string, EarthBranch> {
  const positions: Record<string, EarthBranch> = {};

  positions["天府"] = tianfuPosition;
  positions["太陰"] = moveClockwise(tianfuPosition, 1);
  positions["貪狼"] = moveClockwise(tianfuPosition, 2);
  positions["巨門"] = moveClockwise(tianfuPosition, 3);
  positions["天相"] = moveClockwise(tianfuPosition, 4);
  positions["天梁"] = moveClockwise(tianfuPosition, 5);
  positions["七殺"] = moveClockwise(tianfuPosition, 6);
  positions["破軍"] = moveClockwise(tianfuPosition, 10); // 跳過3格

  return positions;
}

/**
 * 為星曜添加廟旺陷落標註 - Add brightness annotation to stars
 *
 * @param starName 星曜名稱
 * @param branch 所在地支
 * @returns StarPresence 物件（含 name 和 status）
 */
export function addStarBrightness(starName: string, branch: EarthBranch): StarPresence {
  const brightness = starsMainData.brightness[starName as keyof typeof starsMainData.brightness];

  if (!brightness) {
    // 如果不是14主星，返回無狀態
    return { name: starName };
  }

  const status = brightness[branch as keyof typeof brightness];

  return {
    name: starName,
    status: status || undefined
  };
}

/**
 * 安放所有14主星 - Place all 14 main stars
 *
 * @param ziweiPosition 紫微星所在地支
 * @param tianfuPosition 天府星所在地支
 * @returns 每個地支對應的主星列表
 */
export function placeAllMainStars(
  ziweiPosition: EarthBranch,
  tianfuPosition: EarthBranch
): Record<EarthBranch, StarPresence[]> {
  // 初始化12個地支的星曜列表
  const starMap: Record<EarthBranch, StarPresence[]> = {
    子: [], 丑: [], 寅: [], 卯: [], 辰: [], 巳: [],
    午: [], 未: [], 申: [], 酉: [], 戌: [], 亥: []
  };

  // 安放紫微星系
  const ziweiSystem = placeZiweiSystemStars(ziweiPosition);
  for (const [starName, branch] of Object.entries(ziweiSystem)) {
    starMap[branch].push(addStarBrightness(starName, branch));
  }

  // 安放天府星系
  const tianfuSystem = placeTianfuSystemStars(tianfuPosition);
  for (const [starName, branch] of Object.entries(tianfuSystem)) {
    starMap[branch].push(addStarBrightness(starName, branch));
  }

  return starMap;
}
