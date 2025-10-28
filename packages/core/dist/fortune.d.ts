import type { EarthBranch, HeavenlyStem, PalaceName, Sex } from "./types.js";
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
    start: number;
    end: number;
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
export declare function getStartingAge(bureau: number): number;
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
export declare function isYangDirection(sex: Sex, yearStem: HeavenlyStem): boolean;
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
export declare function calculateDecades(lifePalaceBranch: EarthBranch, bureau: number, sex: Sex, yearStem: HeavenlyStem, palaceBranches: Record<PalaceName, EarthBranch>): Record<PalaceName, DecadeRange>;
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
export declare function getYearBranch(year: number): EarthBranch;
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
export declare function getAnnualPalace(currentYear: number, palaceBranches: Record<PalaceName, EarthBranch>): PalaceName;
/**
 * 生成大限年份的文字描述
 *
 * @param decade 大限年份范围
 * @param birthYear 出生年份
 * @returns 文字描述，例如 "1989-1998"
 */
export declare function formatDecadeRange(decade: DecadeRange, birthYear: number): string;
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
export declare function getAnnualYearsForPalace(palaceBranch: EarthBranch, birthYear: number, maxYears?: number): number[];
