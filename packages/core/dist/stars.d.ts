import { EarthBranch, HeavenlyStem, StarPresence } from "./types.js";
/**
 * 取得五行局 - Get Five Element Bureau
 * 根據命宮的天干地支（納音）確定五行局
 * @param lifePalaceStem 命宮天干
 * @param lifePalaceBranch 命宮地支
 * @returns 五行局數字 (2=水二局, 3=木三局, 4=金四局, 5=土五局, 6=火六局)
 */
export declare function getFiveElementBureau(lifePalaceStem: HeavenlyStem, lifePalaceBranch: EarthBranch): number;
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
export declare function findZiweiPosition(bureau: number, lunarDay: number): EarthBranch;
/**
 * 尋找天府星位置 - Find Tianfu Star Position
 * 天府星與紫微星有固定的對應關係
 *
 * @param ziweiPosition 紫微星所在地支
 * @returns 天府星所在地支
 */
export declare function findTianfuPosition(ziweiPosition: EarthBranch): EarthBranch;
/**
 * 安放紫微星系 - Place Ziwei System Stars
 *
 * 紫微星系（6顆星，逆時針排列）：
 * 紫微 → 天機 → [空1格] → 太陽 → 武曲 → 天同 → [空2格] → 廉貞
 *
 * @param ziweiPosition 紫微星所在地支
 * @returns 紫微星系各星的位置
 */
export declare function placeZiweiSystemStars(ziweiPosition: EarthBranch): Record<string, EarthBranch>;
/**
 * 安放天府星系 - Place Tianfu System Stars
 *
 * 天府星系（8顆星，順時針排列）：
 * 天府 → 太陰 → 貪狼 → 巨門 → 天相 → 天梁 → 七殺 → [空3格] → 破軍
 *
 * @param tianfuPosition 天府星所在地支
 * @returns 天府星系各星的位置
 */
export declare function placeTianfuSystemStars(tianfuPosition: EarthBranch): Record<string, EarthBranch>;
/**
 * 為星曜添加廟旺陷落標註 - Add brightness annotation to stars
 *
 * @param starName 星曜名稱
 * @param branch 所在地支
 * @returns StarPresence 物件（含 name 和 status）
 */
export declare function addStarBrightness(starName: string, branch: EarthBranch): StarPresence;
/**
 * 安放所有14主星 - Place all 14 main stars
 *
 * @param ziweiPosition 紫微星所在地支
 * @param tianfuPosition 天府星所在地支
 * @returns 每個地支對應的主星列表
 */
export declare function placeAllMainStars(ziweiPosition: EarthBranch, tianfuPosition: EarthBranch): Record<EarthBranch, StarPresence[]>;
