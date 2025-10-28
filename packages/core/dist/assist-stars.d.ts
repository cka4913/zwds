import type { EarthBranch, HeavenlyStem, StarPresence } from "./types.js";
/**
 * 安文昌星（時系星曜）
 * 口訣：子時戌上起文昌，逆到生時是貴鄉
 *
 * @param hourBranch 出生時辰地支
 * @returns 文昌星所在地支
 */
export declare function placeWenChang(hourBranch: EarthBranch): {
    branch: EarthBranch;
    star: StarPresence;
};
/**
 * 安文曲星（時系星曜）
 * 口訣：文曲數從辰上起，順到生時是本鄉
 *
 * @param hourBranch 出生時辰地支
 * @returns 文曲星所在地支
 */
export declare function placeWenQu(hourBranch: EarthBranch): {
    branch: EarthBranch;
    star: StarPresence;
};
/**
 * 安左輔星（月系星曜）
 * 口訣：左輔正月起於辰，順逢生月是貴方
 *
 * @param lunarMonth 農曆出生月份 (1-12)
 * @returns 左輔星所在地支
 */
export declare function placeZuoFu(lunarMonth: number): {
    branch: EarthBranch;
    star: StarPresence;
};
/**
 * 安右弼星（月系星曜）
 * 口訣：右弼正月宮尋戌，逆至生月便調停
 *
 * @param lunarMonth 農曆出生月份 (1-12)
 * @returns 右弼星所在地支
 */
export declare function placeYouBi(lunarMonth: number): {
    branch: EarthBranch;
    star: StarPresence;
};
/**
 * 安天魁天鉞星（年系星曜）
 * 根據出生年干確定宮位（天乙貴人）
 *
 * @param yearStem 年干
 * @returns 天魁和天鉞所在地支
 */
export declare function placeTianKuiTianYue(yearStem: HeavenlyStem): {
    tianKui: {
        branch: EarthBranch;
        star: StarPresence;
    };
    tianYue: {
        branch: EarthBranch;
        star: StarPresence;
    };
};
/**
 * 安祿存星（年系星曜）
 * 口訣：甲生祿存在寅宮，乙生在卯丙戊巳，丁己祿存午方，庚祿申，辛祿酉，壬祿亥，癸祿子
 *
 * @param yearStem 年干
 * @returns 祿存星所在地支
 */
export declare function placeLuCun(yearStem: HeavenlyStem): {
    branch: EarthBranch;
    star: StarPresence;
};
/**
 * 安擎羊陀羅星（年系星曜）
 * 規則：祿前安擎羊，祿後安陀羅
 *
 * @param yearStem 年干
 * @returns 擎羊和陀羅所在地支
 */
export declare function placeQingYangTuoLuo(yearStem: HeavenlyStem): {
    qingYang: {
        branch: EarthBranch;
        star: StarPresence;
    };
    tuoLuo: {
        branch: EarthBranch;
        star: StarPresence;
    };
};
/**
 * 安火星鈴星（年支時系星曜）
 * 根據年支與時辰組合確定位置
 *
 * @param yearBranch 年支
 * @param hourBranch 時辰地支
 * @returns 火星和鈴星所在地支
 */
export declare function placeHuoXingLingXing(yearBranch: EarthBranch, hourBranch: EarthBranch): {
    huoXing: {
        branch: EarthBranch;
        star: StarPresence;
    };
    lingXing: {
        branch: EarthBranch;
        star: StarPresence;
    };
};
/**
 * 安地空地劫星（時系星曜）
 * 規則：從亥宮起子時，地劫順時針，地空逆時針
 *
 * @param hourBranch 出生時辰地支
 * @returns 地空和地劫所在地支
 */
export declare function placeDiKongDiJie(hourBranch: EarthBranch): {
    diKong: {
        branch: EarthBranch;
        star: StarPresence;
    };
    diJie: {
        branch: EarthBranch;
        star: StarPresence;
    };
};
/**
 * 安天馬星（年支系星曜）
 * 規則：
 * - 寅午戌年：申宮
 * - 申子辰年：寅宮
 * - 巳酉丑年：亥宮
 * - 亥卯未年：巳宮
 *
 * @param yearBranch 年支
 * @returns 天馬星所在地支
 */
export declare function placeTianMa(yearBranch: EarthBranch): {
    branch: EarthBranch;
    star: StarPresence;
};
/**
 * 安所有輔星
 *
 * @param yearStem 年干
 * @param yearBranch 年支
 * @param lunarMonth 農曆月份
 * @param hourBranch 時辰地支
 * @returns 每個地支對應的輔星列表
 */
export declare function placeAllAssistStars(yearStem: HeavenlyStem, yearBranch: EarthBranch, lunarMonth: number, hourBranch: EarthBranch): Record<EarthBranch, StarPresence[]>;
