import type { HeavenlyStem, PalaceName, Transform, StarPresence } from "./types.js";
/**
 * 四化飛星系統
 *
 * 包含年干四化和宮干四化的計算
 */
export interface TransformResult {
    from: PalaceName;
    to: PalaceName;
    star: string;
    type: Transform;
    isYearTransform?: boolean;
    yearStem?: HeavenlyStem;
}
/**
 * 計算年干四化（生年四化）
 *
 * @param yearStem 年干
 * @param palaces 宮位資料（需包含主星和輔星）
 * @returns 四化結果列表
 */
export declare function calculateYearTransforms(yearStem: HeavenlyStem, palaces: Partial<Record<PalaceName, {
    mainStars: StarPresence[];
    assistStars: StarPresence[];
}>>): TransformResult[];
/**
 * 計算宮干四化（宮干飛化）
 *
 * 每個宮位的天干都會產生四化，飛向其他宮位
 *
 * @param palaceStems 各宮的天干
 * @param palaces 宮位資料（需包含主星和輔星）
 * @returns 所有宮位的四化結果，按宮位分組
 */
export declare function calculatePalaceTransforms(palaceStems: Record<PalaceName, HeavenlyStem>, palaces: Partial<Record<PalaceName, {
    mainStars: StarPresence[];
    assistStars: StarPresence[];
}>>): Record<PalaceName, TransformResult[]>;
/**
 * 計算完整的四化系統（年干 + 宮干）
 *
 * @param yearStem 年干
 * @param palaceStems 各宮的天干
 * @param palaces 宮位資料（需包含主星和輔星）
 * @returns 所有宮位的四化結果，按宮位分組
 */
export declare function calculateAllTransforms(yearStem: HeavenlyStem, palaceStems: Record<PalaceName, HeavenlyStem>, palaces: Partial<Record<PalaceName, {
    mainStars: StarPresence[];
    assistStars: StarPresence[];
}>>): Record<PalaceName, TransformResult[]>;
