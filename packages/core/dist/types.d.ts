export type Sex = "male" | "female";
export type Layer = "本命" | "大限" | "流年" | "流月" | "流日" | "流時";
export type PalaceName = "命宮" | "兄弟宮" | "夫妻宮" | "子女宮" | "財帛宮" | "疾厄宮" | "遷移宮" | "交友宮" | "官祿宮" | "田宅宮" | "福德宮" | "父母宮" | "身宮";
export type EarthBranch = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";
export type HeavenlyStem = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";
export type Transform = "化祿" | "化權" | "化科" | "化忌";
export type Relation = "入" | "沖" | "照";
export interface StarPresence {
    name: string;
    status?: string;
    notes?: string;
}
export interface PalaceSlot {
    layer: Layer;
    name: PalaceName;
    branch: EarthBranch;
    stem?: HeavenlyStem;
    mainStars: StarPresence[];
    assistStars: StarPresence[];
    transforms: Array<{
        from: PalaceName;
        to: PalaceName;
        star: string;
        type: Transform;
        isYearTransform?: boolean;
        yearStem?: HeavenlyStem;
    }>;
    decadeYears?: [number, number];
    flowYears?: number[];
    isDecadePalace?: boolean;
    isAnnualPalace?: boolean;
    isMonthlyPalace?: boolean;
    isDailyPalace?: boolean;
    isHourlyPalace?: boolean;
}
export interface ChartMeta {
    sex: Sex;
    solar: string;
    lunar?: string;
    current?: string;
    currentLunar?: string;
    doujunBranch?: EarthBranch;
    tz?: string;
    location?: {
        lat: number;
        lon: number;
        place?: string;
    };
    bodyPalaceBranch?: EarthBranch;
}
export interface ZwdsChart {
    meta: ChartMeta;
    palaces: Partial<Record<PalaceName, PalaceSlot>>;
}
export interface SearchQuery {
    from: {
        layer: Layer;
        palace: PalaceName | EarthBranch;
    };
    transform: Transform;
    relation: Relation;
    to: {
        layer: Layer;
        palace: PalaceName | EarthBranch;
    };
}
export interface SearchHit {
    display: string;
    details: {
        fromBranch: EarthBranch;
        toBranch: EarthBranch;
        decade?: [number, number];
        year?: number;
        star?: string;
    };
}
