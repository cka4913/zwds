import { PALACE_NAMES, getYearTransforms } from "./data.js";
/**
 * 找出某個星曜所在的宮位
 *
 * @param starName 星曜名稱
 * @param palaces 宮位資料（包含主星和輔星）
 * @returns 星曜所在的宮位名稱，如果找不到則返回 null
 */
function findStarPalace(starName, palaces) {
    for (const palaceName of PALACE_NAMES) {
        if (palaceName === "身宮")
            continue; // 跳過身宮
        const palace = palaces[palaceName];
        if (!palace)
            continue;
        // 檢查主星
        if (palace.mainStars.some(s => s.name === starName)) {
            return palaceName;
        }
        // 檢查輔星
        if (palace.assistStars.some(s => s.name === starName)) {
            return palaceName;
        }
    }
    return null;
}
/**
 * 計算年干四化（生年四化）
 *
 * @param yearStem 年干
 * @param palaces 宮位資料（需包含主星和輔星）
 * @returns 四化結果列表
 */
export function calculateYearTransforms(yearStem, palaces) {
    const transforms = getYearTransforms(yearStem);
    const results = [];
    // 對每個四化類型，找出星曜所在的宮位
    for (const [transformType, starName] of Object.entries(transforms)) {
        const targetPalace = findStarPalace(starName, palaces);
        if (targetPalace) {
            results.push({
                from: "命宮", // 暫時用命宮，實際顯示時會特殊處理
                to: targetPalace,
                star: starName,
                type: transformType,
                isYearTransform: true, // 標記為生年四化
                yearStem: yearStem // 記錄年干
            });
        }
    }
    return results;
}
/**
 * 計算宮干四化（宮干飛化）
 *
 * 每個宮位的天干都會產生四化，飛向其他宮位
 *
 * @param palaceStems 各宮的天干
 * @param palaces 宮位資料（需包含主星和輔星）
 * @returns 所有宮位的四化結果，按宮位分組
 */
export function calculatePalaceTransforms(palaceStems, palaces) {
    const allTransforms = {};
    // 初始化
    for (const palaceName of PALACE_NAMES) {
        if (palaceName === "身宮")
            continue;
        allTransforms[palaceName] = [];
    }
    // 對每個宮位計算其四化
    for (const palaceName of PALACE_NAMES) {
        if (palaceName === "身宮")
            continue;
        const stem = palaceStems[palaceName];
        if (!stem)
            continue;
        const transforms = getYearTransforms(stem); // 使用相同的四化表
        // 對每個四化類型，找出星曜所在的宮位
        for (const [transformType, starName] of Object.entries(transforms)) {
            const targetPalace = findStarPalace(starName, palaces);
            if (targetPalace) {
                const transformResult = {
                    from: palaceName,
                    to: targetPalace,
                    star: starName,
                    type: transformType
                };
                // 添加到目標宮位的四化列表中
                allTransforms[targetPalace].push(transformResult);
            }
        }
    }
    return allTransforms;
}
/**
 * 計算完整的四化系統（年干 + 宮干）
 *
 * @param yearStem 年干
 * @param palaceStems 各宮的天干
 * @param palaces 宮位資料（需包含主星和輔星）
 * @returns 所有宮位的四化結果，按宮位分組
 */
export function calculateAllTransforms(yearStem, palaceStems, palaces) {
    // 計算年干四化
    const yearTransforms = calculateYearTransforms(yearStem, palaces);
    // 計算宮干四化
    const palaceTransforms = calculatePalaceTransforms(palaceStems, palaces);
    // 合併結果
    const allTransforms = { ...palaceTransforms };
    // 將年干四化添加到對應的宮位
    for (const transform of yearTransforms) {
        if (!allTransforms[transform.to]) {
            allTransforms[transform.to] = [];
        }
        allTransforms[transform.to].push(transform);
    }
    return allTransforms;
}
