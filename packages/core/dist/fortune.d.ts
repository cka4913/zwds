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
 * 计算流年斗君地支
 *
 * 正确算法：
 * 1. 以流年地支为起点
 * 2. 逆数到生月所落之宫（逆数生月-1步）
 * 3. 由此宫起子时，顺数至生时所在位置即是流年斗君地支
 *
 * @param birthMonth 农历生月（1-12）
 * @param birthHourBranch 生时地支
 * @param birthYearBranch 生年太岁地支（未使用，保留接口兼容性）
 * @param currentYearBranch 流年太岁地支
 * @returns 流年斗君地支
 */
export declare function getDoujunBranch(birthMonth: number, birthHourBranch: EarthBranch, birthYearBranch: EarthBranch, currentYearBranch: EarthBranch): EarthBranch;
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
 * 年份范围：出生年 到 出生年+120年
 *
 * @param palaceBranch 宫位的地支
 * @param birthYear 出生年份（用于确定显示范围）
 * @param maxYears 最多返回多少个年份（默认12个）- 已弃用，保留参数以保持兼容性
 * @returns 年份数组（按时间顺序排列）
 */
export declare function getAnnualYearsForPalace(palaceBranch: EarthBranch, birthYear: number, maxYears?: number): number[];
/**
 * 计算流月宫位
 *
 * 流月规则：流年斗君即为正月，按农历月份顺行
 * 公式：流月 = 斗君地支 + (农历月份 - 1)
 *
 * @param doujunBranch 流年斗君地支
 * @param targetMonth 目标农历月份（1-12）
 * @param palaceBranches 各宫位的地支
 * @returns 流月宫位名称
 */
export declare function getMonthlyPalace(doujunBranch: EarthBranch, targetMonth: number, palaceBranches: Record<PalaceName, EarthBranch>): Exclude<PalaceName, "身宮">;
/**
 * 计算流日宫位
 *
 * 流日规则：以流月的位置为初一，然后顺行
 * 公式：流日 = 流月地支 + (农历日 - 1)
 *
 * @param monthlyBranch 流月地支
 * @param lunarDay 农历日（1-30）
 * @param palaceBranches 各宫位的地支
 * @returns 流日宫位名称
 */
export declare function getDailyPalace(monthlyBranch: EarthBranch, lunarDay: number, palaceBranches: Record<PalaceName, EarthBranch>): Exclude<PalaceName, "身宮">;
/**
 * 计算流时宫位
 *
 * 流时规则：以流日的位置为子时，然后顺数
 * 公式：流时 = 流日地支 + 时辰地支索引
 *
 * @param dailyBranch 流日地支
 * @param hourBranch 时辰地支
 * @param palaceBranches 各宫位的地支
 * @returns 流时宫位名称
 */
export declare function getHourlyPalace(dailyBranch: EarthBranch, hourBranch: EarthBranch, palaceBranches: Record<PalaceName, EarthBranch>): Exclude<PalaceName, "身宮">;
/**
 * 根据当前年龄查找当前大限所在宫位
 *
 * @param age 当前年龄（周岁）
 * @param decades 各宫位的大限年份范围
 * @returns 当前大限宫位名称，如果未找到则返回 undefined
 */
export declare function getCurrentDecadePalace(age: number, decades: Record<PalaceName, DecadeRange>): PalaceName | undefined;
