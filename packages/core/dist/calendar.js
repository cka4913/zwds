import { getStemByIndex, getBranchByIndex } from "./data.js";
import { Solar } from "lunar-javascript";
/**
 * 陽曆→農曆轉換
 * 使用 lunar-javascript 庫進行轉換
 */
export function solarToLunar(solar) {
    // 使用 lunar-javascript 進行轉換
    const solarDate = Solar.fromYmd(solar.year, solar.month, solar.day);
    const lunar = solarDate.getLunar();
    const lunarMonth = lunar.getMonth();
    const isLeap = lunarMonth < 0;
    const month = isLeap ? Math.abs(lunarMonth) : lunarMonth;
    return {
        year: lunar.getYear(),
        month,
        day: lunar.getDay(),
        isLeap,
        hour: solar.hour
    };
}
/**
 * 農曆→陽曆轉換
 * 使用 lunar-javascript 庫進行轉換
 */
export function lunarToSolar(lunar) {
    const { Lunar } = require("lunar-javascript");
    const lunarMonth = lunar.isLeap ? -Math.abs(lunar.month) : lunar.month;
    const lunarDate = Lunar.fromYmd(lunar.year, lunarMonth, lunar.day);
    const solar = lunarDate.getSolar();
    return {
        year: solar.getYear(),
        month: solar.getMonth(),
        day: solar.getDay(),
        hour: lunar.hour
    };
}
/**
 * 解析 ISO 時間字串
 * @param iso ISO 8601 格式: "YYYY-MM-DDTHH:mm:ss"
 */
export function parseISODateTime(iso) {
    const parts = iso.split("T");
    if (parts.length !== 2) {
        throw new Error(`Invalid ISO datetime format: ${iso}`);
    }
    const [datePart, timePart] = parts;
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour] = timePart.split(":").map(Number);
    if (!year || !month || !day || hour === undefined) {
        throw new Error(`Invalid ISO datetime format: ${iso}`);
    }
    return { year, month, day, hour };
}
/**
 * 格式化農曆日期為字串
 * @param lunar 農曆日期
 * @returns "YYYY年MM月DD日"
 */
export function formatLunarDate(lunar) {
    const leapPrefix = lunar.isLeap ? "閏" : "";
    return `${lunar.year} 年 ${leapPrefix}${lunar.month} 月 ${lunar.day} 日`;
}
/**
 * 計算年干支
 *
 * 年干支從立春開始計算，非正月初一
 * 簡化版：直接用西曆年計算（需要考慮立春節氣的版本待實作）
 */
export function getYearStemBranch(year) {
    // 天干: (year - 4) % 10
    // 地支: (year - 4) % 12
    // 基準: 甲子年為公元 4 年（或 1984, 1924 等）
    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;
    return {
        stem: getStemByIndex(stemIndex >= 0 ? stemIndex : stemIndex + 10),
        branch: getBranchByIndex(branchIndex >= 0 ? branchIndex : branchIndex + 12)
    };
}
/**
 * 計算月干支
 *
 * 月支固定，月干由年干推算
 * 正月建寅，月支順序: 寅卯辰巳午未申酉戌亥子丑
 */
export function getMonthStemBranch(lunarMonth, yearStem) {
    // 月支: 正月(1)=寅(2), 二月(2)=卯(3), ..., 十二月(12)=丑(1)
    const branchIndex = (lunarMonth + 1) % 12;
    const branch = getBranchByIndex(branchIndex);
    // 月干: 根據年干推算
    // 甲己之年丙作首（甲年、己年的正月為丙寅）
    // 乙庚之歲戊為頭（乙年、庚年的正月為戊寅）
    // 丙辛之歲尋庚上（丙年、辛年的正月為庚寅）
    // 丁壬壬寅順水流（丁年、壬年的正月為壬寅）
    // 戊癸之年何方起（戊年、癸年的正月為甲寅）
    const yearStemIndex = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"].indexOf(yearStem);
    // 五虎遁：甲己丙作首、乙庚戊為頭、丙辛庚寅上、丁壬壬寅流、戊癸甲寅生
    const firstMonthStemIndex = [2, 4, 6, 8, 0][yearStemIndex % 5]; // 甲己->2(丙), 乙庚->4(戊), ...
    const stemIndex = (firstMonthStemIndex + lunarMonth - 1) % 10;
    const stem = getStemByIndex(stemIndex);
    return { stem, branch };
}
/**
 * 計算日干支
 * 使用 lunar-javascript 庫進行計算
 */
export function getDayStemBranch(solar) {
    const solarDate = Solar.fromYmd(solar.year, solar.month, solar.day);
    const lunar = solarDate.getLunar();
    // lunar-javascript 返回的日干支格式：如 "甲子"
    const dayGanZhi = lunar.getDayInGanZhi();
    if (dayGanZhi && dayGanZhi.length === 2) {
        const stem = dayGanZhi[0];
        const branch = dayGanZhi[1];
        return { stem, branch };
    }
    throw new Error(`Failed to calculate day stem-branch for ${solar.year}-${solar.month}-${solar.day}`);
}
/**
 * 計算時辰地支（時干由日干推算）
 *
 * 時辰對照:
 * 23-01: 子時, 01-03: 丑時, 03-05: 寅時, 05-07: 卯時,
 * 07-09: 辰時, 09-11: 巳時, 11-13: 午時, 13-15: 未時,
 * 15-17: 申時, 17-19: 酉時, 19-21: 戌時, 21-23: 亥時
 */
export function getHourBranch(hour) {
    const hourRanges = [
        { start: 23, end: 1, branch: "子" },
        { start: 1, end: 3, branch: "丑" },
        { start: 3, end: 5, branch: "寅" },
        { start: 5, end: 7, branch: "卯" },
        { start: 7, end: 9, branch: "辰" },
        { start: 9, end: 11, branch: "巳" },
        { start: 11, end: 13, branch: "午" },
        { start: 13, end: 15, branch: "未" },
        { start: 15, end: 17, branch: "申" },
        { start: 17, end: 19, branch: "酉" },
        { start: 19, end: 21, branch: "戌" },
        { start: 21, end: 23, branch: "亥" }
    ];
    for (const range of hourRanges) {
        if (range.start < range.end) {
            // 正常範圍 (如 1-3)
            if (hour >= range.start && hour < range.end) {
                return range.branch;
            }
        }
        else {
            // 跨越午夜 (23-1)
            if (hour >= range.start || hour < range.end) {
                return range.branch;
            }
        }
    }
    // 兜底：不應該到這裡
    return "子";
}
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
export function getHourStem(hourBranch, dayStem) {
    const dayStemIndex = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"].indexOf(dayStem);
    const firstHourStemIndex = [0, 2, 4, 6, 8][Math.floor(dayStemIndex / 2)]; // 甲己->0(甲), 乙庚->2(丙), ...
    const branchIndex = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"].indexOf(hourBranch);
    const stemIndex = (firstHourStemIndex + branchIndex) % 10;
    return getStemByIndex(stemIndex);
}
/**
 * 格式化時辰地支為中文時辰名
 */
export function getHourName(branch) {
    const hourNames = {
        "子": "子",
        "丑": "丑",
        "寅": "寅",
        "卯": "卯",
        "辰": "辰",
        "巳": "巳",
        "午": "午",
        "未": "未",
        "申": "申",
        "酉": "酉",
        "戌": "戌",
        "亥": "亥"
    };
    return hourNames[branch];
}
/**
 * 获取某一天的日地支（使用 lunar-javascript 库）
 *
 * @param solar 阳历日期
 * @returns 日地支
 */
export function getDayBranch(solar) {
    const solarDate = Solar.fromYmd(solar.year, solar.month, solar.day);
    const lunar = solarDate.getLunar();
    // 获取日柱（日干支）
    const dayInGanZhi = lunar.getDayInGanZhi();
    // dayInGanZhi 格式为"甲子"、"乙丑"等，取后一个字符作为地支
    const branch = dayInGanZhi.charAt(1);
    return branch;
}
