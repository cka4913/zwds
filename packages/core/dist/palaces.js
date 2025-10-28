import { PALACE_NAMES, getBranchIndex, getBranchByIndex, getStemByIndex } from "./data.js";
/**
 * 宮位定位與排列工具
 *
 * 包含命宮、身宮定位，以及十二宮排列
 */
/**
 * 計算命宮地支
 *
 * 命宮定位公式: 從「寅宮」起正月，順數到生月；
 * 再從生月宮位起「子時」，逆數到生時，即為命宮所在地支。
 *
 * @param lunarMonth 農曆出生月 (1-12)
 * @param hourBranch 出生時辰地支
 * @returns 命宮地支
 */
export function findLifePalaceBranch(lunarMonth, hourBranch) {
    // Step 1: 從寅宮起正月，順數到生月
    // 寅=0, 卯=1, 辰=2, 巳=3, 午=4, 未=5, 申=6, 酉=7, 戌=8, 亥=9, 子=10, 丑=11
    // 正月在寅(index=2), 二月在卯(index=3), ..., 十二月在丑(index=1)
    const monthBranchIndex = (2 + lunarMonth - 1) % 12; // 寅是地支index 2
    // Step 2: 從生月宮位起子時，逆數到生時
    // 子時在生月宮，丑時逆數一位，寅時逆數兩位...
    const hourIndex = getBranchIndex(hourBranch);
    const lifePalaceIndex = (monthBranchIndex - hourIndex + 12) % 12;
    return getBranchByIndex(lifePalaceIndex);
}
/**
 * 計算身宮地支
 *
 * 身宮定位公式: 從「寅宮」起正月，順數到生月；
 * 再從生月宮位起「子時」，順數到生時，即為身宮所在地支。
 *
 * @param lunarMonth 農曆出生月 (1-12)
 * @param hourBranch 出生時辰地支
 * @returns 身宮地支
 */
export function findBodyPalaceBranch(lunarMonth, hourBranch) {
    // Step 1: 從寅宮起正月，順數到生月（同命宮）
    const monthBranchIndex = (2 + lunarMonth - 1) % 12;
    // Step 2: 從生月宮位起子時，順數到生時（與命宮相反，是順數）
    const hourIndex = getBranchIndex(hourBranch);
    const bodyPalaceIndex = (monthBranchIndex + hourIndex) % 12;
    return getBranchByIndex(bodyPalaceIndex);
}
/**
 * 計算命宮的宮干
 *
 * 根據年干和命宮地支推算命宮的天干
 * 使用五虎遁元訣（年上起月法的變形）
 *
 * 簡化方法：從年干推算寅宮的天干，再順推到命宮
 *
 * @param yearStem 年干
 * @param lifePalaceBranch 命宮地支
 * @returns 命宮天干
 */
export function findLifePalaceStem(yearStem, lifePalaceBranch) {
    // 五虎遁: 甲己之年丙作首（甲、己年的寅月/寅宮為丙）
    // 乙庚之歲戊為頭、丙辛之歲尋庚上、丁壬壬寅順水流、戊癸之年甲寅生
    const yearStemIndex = getStemIndex(yearStem);
    // 五虎遁：甲己丙作首、乙庚戊為頭、丙辛庚寅上、丁壬壬寅流、戊癸甲寅生
    const firstStemIndex = [2, 4, 6, 8, 0][yearStemIndex % 5]; // 甲己->丙(2), 乙庚->戊(4), ...
    // 寅宮 = 地支 index 2
    // 從寅宮的天干順推到命宮地支
    const lifePalaceIndex = getBranchIndex(lifePalaceBranch);
    const yinIndex = 2; // 寅
    const offset = (lifePalaceIndex - yinIndex + 12) % 12;
    const lifePalaceStemIndex = (firstStemIndex + offset) % 10;
    return getStemByIndex(lifePalaceStemIndex);
}
function getStemIndex(stem) {
    return ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"].indexOf(stem);
}
/**
 * 排列十二宮
 *
 * 從命宮開始，按照固定順序排列十二宮到十二地支
 * 命宮 → 兄弟宮 → 夫妻宮 → ... → 父母宮
 *
 * 重要：宮位一律從命宮逆時針（counterclockwise）排列
 * 陰陽男女的規則僅用於計算大限，不影響宮位排列
 *
 * @param lifePalaceBranch 命宮地支
 * @returns 每個宮位對應的地支
 */
export function arrangePalaces(lifePalaceBranch) {
    const result = {};
    const lifePalaceIndex = getBranchIndex(lifePalaceBranch);
    // 十二宮按順序（不包含身宮）
    const palaces = PALACE_NAMES.filter(p => p !== "身宮");
    // 宮位一律從命宮逆時針排列
    // 逆時針 = -1 (命宮 → 兄弟 → 夫妻 → 子女 → 財帛 → 疾厄 → 遷移 → 僕役 → 官祿 → 田宅 → 福德 → 父母)
    const direction = -1;
    for (let i = 0; i < palaces.length; i++) {
        const palaceName = palaces[i];
        const branchIndex = (lifePalaceIndex + i * direction + 12) % 12;
        result[palaceName] = getBranchByIndex(branchIndex);
    }
    return result;
}
/**
 * 計算各宮的天干
 *
 * 關鍵發現：宮位天干由地支決定，與性別無關！
 *
 * 算法：
 * 1. 先用五虎遁計算寅宮的天干
 * 2. 從寅宮開始，按地支順序（寅卯辰巳午未申酉戌亥子丑）
 *    依次配上天干（循環10天干）
 *
 * 例如：甲年 → 寅宮=丙
 * 寅=丙, 卯=丁, 辰=戊, 巳=己, 午=庚, 未=辛
 * 申=壬, 酉=癸, 戌=甲, 亥=乙, 子=丙, 丑=丁
 *
 * @param yearStem 年干
 * @param palaceBranches 各宮地支（從 arrangePalaces 取得）
 * @returns 每個宮位的天干
 */
export function arrangePalaceStems(yearStem, palaceBranches, _sex // 保留參數以兼容現有調用，但不再使用
) {
    const result = {};
    // 計算寅宮的天干（五虎遁）
    const yearStemIndex = getStemIndex(yearStem);
    const yinStemIndex = [2, 4, 6, 8, 0][yearStemIndex % 5]; // 甲己->丙(2), 乙庚->戊(4), ...
    // 寅宮 = 地支 index 2
    const yinBranchIndex = 2;
    // 十二宮按順序（不包含身宮）
    const palaces = PALACE_NAMES.filter(p => p !== "身宮");
    for (const palaceName of palaces) {
        const branchIndex = getBranchIndex(palaceBranches[palaceName]);
        // 從寅宮的天干開始，按地支距離計算該宮的天干
        // 任何地支的天干 = 寅宮天干 + (該地支index - 寅宮index)
        const offset = (branchIndex - yinBranchIndex + 12) % 12;
        const stemIndex = (yinStemIndex + offset) % 10;
        result[palaceName] = getStemByIndex(stemIndex);
    }
    return result;
}
/**
 * 驗證命宮與身宮的相對位置
 *
 * 命宮和身宮必定在對宮或相鄰的特定關係
 * （此函數用於除錯驗證）
 */
export function validatePalacePositions(lifePalaceBranch, bodyPalaceBranch) {
    // 暫時只檢查是否都是有效的地支
    const lifeIndex = getBranchIndex(lifePalaceBranch);
    const bodyIndex = getBranchIndex(bodyPalaceBranch);
    return lifeIndex >= 0 && lifeIndex < 12 && bodyIndex >= 0 && bodyIndex < 12;
}
// Note: getFiveElementBureau() has been moved to stars.ts with complete Nayin table implementation
