import type { EarthBranch, HeavenlyStem, PalaceName, Sex } from "./types.js";
import { PALACE_NAMES, getBranchIndex, getBranchByIndex } from "./data.js";

/**
 * 大限和流年计算工具
 *
 * 大限（Major Periods）：10年一个周期
 * 流年（Annual Periods）：每年对应的宫位
 */

/**
 * 大限年份范围
 */
export interface DecadeRange {
  start: number; // 起始年龄
  end: number;   // 结束年龄
}

/**
 * 根据五行局确定起始年龄
 * - 水二局：2岁起
 * - 木三局：3岁起
 * - 金四局：4岁起
 * - 土五局：5岁起
 * - 火六局：6岁起
 *
 * @param bureau 五行局数 (2-6)
 * @returns 起始年龄
 */
export function getStartingAge(bureau: number): number {
  return bureau;
}

/**
 * 判断是否为阳（用于决定大限方向）
 *
 * 阳男阴女：顺时针
 * 阴男阳女：逆时针
 *
 * @param sex 性别
 * @param yearStem 年干
 * @returns true = 顺时针, false = 逆时针
 */
export function isYangDirection(sex: Sex, yearStem: HeavenlyStem): boolean {
  // 年干阴阳：甲丙戊庚壬为阳，乙丁己辛癸为阴
  const yangStems: HeavenlyStem[] = ["甲", "丙", "戊", "庚", "壬"];
  const yearIsYang = yangStems.includes(yearStem);

  // 阳男阴女顺行（返回true），阴男阳女逆行（返回false）
  return (sex === "male" && yearIsYang) || (sex === "female" && !yearIsYang);
}

/**
 * 计算各宫的大限年份范围
 *
 * 算法：
 * 1. 宫位固定逆时针排列（命宫→兄弟→夫妻→...→父母）
 * 2. 大限从命宫开始，按阴阳男女的方向走12个地支
 * 3. 找到每个宫位的地支对应第几个大限，计算年份范围
 *
 * @param lifePalaceBranch 命宫地支
 * @param bureau 五行局数
 * @param sex 性别
 * @param yearStem 年干
 * @param palaceBranches 各宫位的地支（从arrangePalaces得到）
 * @returns 每个宫位对应的大限年份范围
 */
export function calculateDecades(
  lifePalaceBranch: EarthBranch,
  bureau: number,
  sex: Sex,
  yearStem: HeavenlyStem,
  palaceBranches: Record<PalaceName, EarthBranch>
): Record<PalaceName, DecadeRange> {
  const result = {} as Record<PalaceName, DecadeRange>;

  const lifePalaceIndex = getBranchIndex(lifePalaceBranch);
  const startingAge = getStartingAge(bureau);
  const isYang = isYangDirection(sex, yearStem);

  // 大限方向：阳顺阴逆
  const direction = isYang ? 1 : -1;

  // 十二宫按顺序（不包含身宫）
  const palaces = PALACE_NAMES.filter(p => p !== "身宮");

  // 计算12个大限对应的地支
  const decadeBranches: EarthBranch[] = [];
  for (let i = 0; i < 12; i++) {
    const branchIndex = (lifePalaceIndex + i * direction + 12) % 12;
    decadeBranches.push(getBranchByIndex(branchIndex));
  }

  // 为每个宫位找到对应的大限
  for (const palaceName of palaces) {
    const palaceBranch = palaceBranches[palaceName];
    const decadeIndex = decadeBranches.indexOf(palaceBranch);

    if (decadeIndex >= 0) {
      const start = startingAge + decadeIndex * 10;
      const end = start + 9;
      result[palaceName] = { start, end };
    }
  }

  return result;
}

/**
 * 根据年份获取该年的地支
 *
 * 地支纪年规则：
 * 子年、丑年、寅年... 按12年一个周期循环
 * 基准：1984年为甲子年（子=0）
 *
 * @param year 阳历年份
 * @returns 该年的地支
 */
export function getYearBranch(year: number): EarthBranch {
  // 1984年是甲子年，地支为子（index=0）
  const baseYear = 1984;
  const offset = (year - baseYear) % 12;
  const branchIndex = (offset + 12) % 12; // 确保为正数
  return getBranchByIndex(branchIndex);
}

/**
 * 计算给定年份对应的流年宫位
 *
 * 流年规则：根据年份的地支来定位
 * 例如：2025年是乙巳年，流年就在命盘中"巳"地支所在的宫位
 *
 * @param currentYear 目标年份
 * @param palaceBranches 各宫位的地支
 * @returns 该年份对应的宫位名称
 */
export function getAnnualPalace(
  currentYear: number,
  palaceBranches: Record<PalaceName, EarthBranch>
): PalaceName {
  // 获取该年份的地支
  const yearBranch = getYearBranch(currentYear);

  // 十二宫按顺序（不包含身宫）
  const palaces = PALACE_NAMES.filter(p => p !== "身宮");

  // 找到该地支对应的宫位
  for (const palaceName of palaces) {
    if (palaceBranches[palaceName] === yearBranch) {
      return palaceName;
    }
  }

  return "命宮"; // 默认返回命宫（理论上不会到这里）
}

/**
 * 生成大限年份的文字描述
 *
 * @param decade 大限年份范围
 * @param birthYear 出生年份
 * @returns 文字描述，例如 "1989-1998"
 */
export function formatDecadeRange(decade: DecadeRange, birthYear: number): string {
  const startYear = birthYear + decade.start - 1;
  const endYear = birthYear + decade.end - 1;
  return `${startYear}-${endYear}`;
}

/**
 * 生成流年年份列表（显示该宫位对应的所有年份）
 *
 * 根据宫位的地支，找出所有该地支对应的年份
 * 例如：宫位在"巳"，则返回所有巳年（2025, 2037, 2049...和2013, 2001, 1989...）
 *
 * @param palaceBranch 宫位的地支
 * @param birthYear 出生年份（用于确定显示范围）
 * @param maxYears 最多返回多少个年份（默认12个，前后各6年周期）
 * @returns 年份数组（按时间顺序排列）
 */
export function getAnnualYearsForPalace(
  palaceBranch: EarthBranch,
  birthYear: number,
  maxYears: number = 12
): number[] {
  const years: number[] = [];
  const palaceBranchIndex = getBranchIndex(palaceBranch);

  // 找到离出生年最近的该地支年份
  const birthYearBranch = getYearBranch(birthYear);
  const birthYearBranchIndex = getBranchIndex(birthYearBranch);

  // 计算从出生年到目标地支的偏移
  let offset = (palaceBranchIndex - birthYearBranchIndex + 12) % 12;
  if (offset === 0 && birthYearBranch !== palaceBranch) {
    offset = 12;
  }

  // 找到第一个该地支的年份（>=出生年）
  const firstYear = birthYear + offset;

  // 生成前后的年份
  const halfYears = Math.floor(maxYears / 2);
  for (let i = -halfYears; i < maxYears - halfYears; i++) {
    const year = firstYear + i * 12;
    if (year > 1900 && year < 2200) { // 合理的年份范围
      years.push(year);
    }
  }

  return years.sort((a, b) => a - b);
}
