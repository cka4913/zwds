import type { EarthBranch, HeavenlyStem, PalaceName, Sex } from "./types.js";
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
export declare function findLifePalaceBranch(lunarMonth: number, hourBranch: EarthBranch): EarthBranch;
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
export declare function findBodyPalaceBranch(lunarMonth: number, hourBranch: EarthBranch): EarthBranch;
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
export declare function findLifePalaceStem(yearStem: HeavenlyStem, lifePalaceBranch: EarthBranch): HeavenlyStem;
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
export declare function arrangePalaces(lifePalaceBranch: EarthBranch): Record<PalaceName, EarthBranch>;
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
export declare function arrangePalaceStems(yearStem: HeavenlyStem, palaceBranches: Record<PalaceName, EarthBranch>, _sex?: Sex): Record<PalaceName, HeavenlyStem>;
/**
 * 驗證命宮與身宮的相對位置
 *
 * 命宮和身宮必定在對宮或相鄰的特定關係
 * （此函數用於除錯驗證）
 */
export declare function validatePalacePositions(lifePalaceBranch: EarthBranch, bodyPalaceBranch: EarthBranch): boolean;
