import type { HeavenlyStem, EarthBranch } from "./types.js";
/**
 * 曆法轉換與時間處理工具
 *
 * Note: 目前實作基於簡化演算法，支援 1900-2100 年範圍
 * 未來可整合更完整的曆法庫（如 lunar-typescript）
 */
export interface LunarDate {
    year: number;
    month: number;
    day: number;
    isLeap: boolean;
    hour: number;
}
export interface SolarDate {
    year: number;
    month: number;
    day: number;
    hour: number;
}
/**
 * 陽曆→農曆轉換
 * 使用 lunar-javascript 庫進行轉換
 */
export declare function solarToLunar(solar: SolarDate): LunarDate;
/**
 * 農曆→陽曆轉換
 * 使用 lunar-javascript 庫進行轉換
 */
export declare function lunarToSolar(lunar: LunarDate): SolarDate;
/**
 * 解析 ISO 時間字串
 * @param iso ISO 8601 格式: "YYYY-MM-DDTHH:mm:ss"
 */
export declare function parseISODateTime(iso: string): SolarDate;
/**
 * 格式化農曆日期為字串
 * @param lunar 農曆日期
 * @returns "YYYY年MM月DD日"
 */
export declare function formatLunarDate(lunar: LunarDate): string;
/**
 * 計算年干支
 *
 * 年干支從立春開始計算，非正月初一
 * 簡化版：直接用西曆年計算（需要考慮立春節氣的版本待實作）
 */
export declare function getYearStemBranch(year: number): {
    stem: HeavenlyStem;
    branch: EarthBranch;
};
/**
 * 計算月干支
 *
 * 月支固定，月干由年干推算
 * 正月建寅，月支順序: 寅卯辰巳午未申酉戌亥子丑
 */
export declare function getMonthStemBranch(lunarMonth: number, yearStem: HeavenlyStem): {
    stem: HeavenlyStem;
    branch: EarthBranch;
};
/**
 * 計算日干支
 * 使用 lunar-javascript 庫進行計算
 */
export declare function getDayStemBranch(solar: SolarDate): {
    stem: HeavenlyStem;
    branch: EarthBranch;
};
/**
 * 計算時辰地支（時干由日干推算）
 *
 * 時辰對照:
 * 23-01: 子時, 01-03: 丑時, 03-05: 寅時, 05-07: 卯時,
 * 07-09: 辰時, 09-11: 巳時, 11-13: 午時, 13-15: 未時,
 * 15-17: 申時, 17-19: 酉時, 19-21: 戌時, 21-23: 亥時
 */
export declare function getHourBranch(hour: number): EarthBranch;
/**
 * 計算時干（由日干推算）
 *
 * 時干推算口訣:
 * 甲己還加甲（甲日、己日的子時為甲子時）
 * 乙庚丙作初（乙日、庚日的子時為丙子時）
 * 丙辛從戊起（丙日、辛日的子時為戊子時）
 * 丁壬庚子居（丁日、壬日的子時為庚子時）
 * 戊癸何方發（戊日、癸日的子時為壬子時）
 */
export declare function getHourStem(hourBranch: EarthBranch, dayStem: HeavenlyStem): HeavenlyStem;
/**
 * 格式化時辰地支為中文時辰名
 */
export declare function getHourName(branch: EarthBranch): string;
/**
 * 获取某一天的日地支（使用 lunar-javascript 库）
 *
 * @param solar 阳历日期
 * @returns 日地支
 */
export declare function getDayBranch(solar: SolarDate): EarthBranch;
