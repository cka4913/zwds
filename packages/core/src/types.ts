export type Sex = "male" | "female";
export type Layer = "本命" | "大限" | "流年" | "流月" | "流日" | "流時";
export type PalaceName =
  | "命宮" | "兄弟宮" | "夫妻宮" | "子女宮" | "財帛宮" | "疾厄宮"
  | "遷移宮" | "交友宮" | "官祿宮" | "田宅宮" | "福德宮" | "父母宮" | "身宮";
export type EarthBranch = "子"|"丑"|"寅"|"卯"|"辰"|"巳"|"午"|"未"|"申"|"酉"|"戌"|"亥";
export type HeavenlyStem = "甲"|"乙"|"丙"|"丁"|"戊"|"己"|"庚"|"辛"|"壬"|"癸";
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
    isYearTransform?: boolean;  // 是否為生年四化
    yearStem?: HeavenlyStem;    // 如果是生年四化，記錄年干
  }>;
  decadeYears?: [number, number];
  flowYears?: number[];
  // 当前时间标记（用于显示 【大限】【流年】等标签）
  isDecadePalace?: boolean;   // 是否为当前大限所在宫位
  isAnnualPalace?: boolean;   // 是否为当前流年所在宫位
  isMonthlyPalace?: boolean;  // 是否为当前流月所在宫位
  isDailyPalace?: boolean;    // 是否为当前流日所在宫位
  isHourlyPalace?: boolean;   // 是否为当前流时所在宫位
}

export interface ChartMeta {
  sex: Sex;
  solar: string; // ISO, local time at tz
  lunar?: string;
  current?: string; // ISO, 当前时间（用于计算流年、流月、流日、流时），可选，默认为当前时间
  currentLunar?: string; // 当前时间的农历
  doujunBranch?: EarthBranch; // 流年斗君地支
  tz?: string; // IANA timezone (默认: Asia/Hong_Kong)
  location?: { lat: number; lon: number; place?: string };
  bodyPalaceBranch?: EarthBranch; // 身宫地支
}

export interface ZwdsChart {
  meta: ChartMeta;
  palaces: Partial<Record<PalaceName, PalaceSlot>>;
}

export interface SearchQuery {
  from: { layer: Layer; palace: PalaceName | EarthBranch };
  transform: Transform;
  relation: Relation;
  to: { layer: Layer; palace: PalaceName | EarthBranch };
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