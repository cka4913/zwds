import type { ZwdsChart, ChartMeta, PalaceName, PalaceSlot } from "./types.js";
import { FIXTURE_1984F_TEXT } from "./fixtures-1984f.js";
import { parseISODateTime, solarToLunar, getYearStemBranch, getMonthStemBranch, getDayStemBranch, getHourBranch, getHourStem } from "./calendar.js";
import { findLifePalaceBranch, findBodyPalaceBranch, findLifePalaceStem, arrangePalaces, arrangePalaceStems } from "./palaces.js";
import { getFiveElementBureau, findZiweiPosition, findTianfuPosition, placeAllMainStars } from "./stars.js";
import { placeAllAssistStars } from "./assist-stars.js";
import { calculateAllTransforms } from "./transforms.js";
import { calculateDecades, getAnnualYearsForPalace } from "./fortune.js";
import { PALACE_NAMES } from "./data.js";

// Export all types
export * from "./types.js";

// Export data utilities
export * from "./data.js";

// Export calendar utilities
export * from "./calendar.js";

// Export palace utilities
export * from "./palaces.js";

// Export star placement utilities
export * from "./stars.js";

// Export assist star utilities
export * from "./assist-stars.js";

// Export transform utilities
export * from "./transforms.js";

// Export fortune utilities
export * from "./fortune.js";

export function makeChart(meta: ChartMeta): ZwdsChart {
  const tz = meta.tz ?? "Asia/Hong_Kong";

  // 1. 解析阳历日期
  const solar = parseISODateTime(meta.solar);

  // 2. 转换为农历
  const lunar = solarToLunar(solar);
  const lunarISO = `${lunar.year.toString().padStart(4, '0')}-${lunar.month.toString().padStart(2, '0')}-${lunar.day.toString().padStart(2, '0')}T${lunar.hour.toString().padStart(2, '0')}:00:00`;

  // 3. 计算年月日时的干支
  const yearStemBranch = getYearStemBranch(lunar.year);
  const monthStemBranch = getMonthStemBranch(lunar.month, yearStemBranch.stem);
  const dayStemBranch = getDayStemBranch(solar);
  const hourBranch = getHourBranch(lunar.hour);
  const hourStem = getHourStem(hourBranch, dayStemBranch.stem);

  // 4. 计算命宫和身宫地支
  const lifePalaceBranch = findLifePalaceBranch(lunar.month, hourBranch);
  const bodyPalaceBranch = findBodyPalaceBranch(lunar.month, hourBranch);

  // 5. 计算命宫天干
  const lifePalaceStem = findLifePalaceStem(yearStemBranch.stem, lifePalaceBranch);

  // 6. 排列十二宫（获取每个宫位的地支）
  // 宫位一律逆时针排列（阴阳男女仅用于大限计算）
  const palaceBranches = arrangePalaces(lifePalaceBranch);

  // 7. 计算各宫的天干
  const palaceStems = arrangePalaceStems(yearStemBranch.stem, palaceBranches);

  // 8. 确定五行局
  const bureau = getFiveElementBureau(lifePalaceStem, lifePalaceBranch);

  // 9. 找到紫微星和天府星的位置
  const ziweiPosition = findZiweiPosition(bureau, lunar.day);
  const tianfuPosition = findTianfuPosition(ziweiPosition);

  // 10. 放置14主星
  const mainStarsMap = placeAllMainStars(ziweiPosition, tianfuPosition);

  // 11. 放置輔星
  const assistStarsMap = placeAllAssistStars(yearStemBranch.stem, yearStemBranch.branch, lunar.month, hourBranch);

  // 12. 构建宫位数据（先不含四化）
  const palaces: Partial<Record<PalaceName, PalaceSlot>> = {};

  const palaceNames = PALACE_NAMES.filter(p => p !== "身宮");
  for (const palaceName of palaceNames) {
    const branch = palaceBranches[palaceName];
    const stem = palaceStems[palaceName];
    const mainStars = mainStarsMap[branch] || [];
    const assistStars = assistStarsMap[branch] || [];

    palaces[palaceName] = {
      layer: "本命",
      name: palaceName,
      branch,
      stem,
      mainStars,
      assistStars,
      transforms: []
    };
  }

  // 13. 計算大限和流年
  const decades = calculateDecades(lifePalaceBranch, bureau, meta.sex, yearStemBranch.stem, palaceBranches);
  const birthYear = solar.year;

  for (const palaceName of palaceNames) {
    if (palaces[palaceName]) {
      const decade = decades[palaceName];
      if (decade) {
        // 大限年份
        const startYear = birthYear + decade.start - 1;
        const endYear = birthYear + decade.end - 1;
        palaces[palaceName]!.decadeYears = [startYear, endYear];

        // 流年年份（根据宫位地支计算）
        const palaceBranch = palaceBranches[palaceName];
        const annualYears = getAnnualYearsForPalace(
          palaceBranch,
          birthYear,
          12  // 显示12个年份（前后各6个周期）
        );
        palaces[palaceName]!.flowYears = annualYears;
      }
    }
  }

  // 14. 計算四化飛星
  const transformsMap = calculateAllTransforms(yearStemBranch.stem, palaceStems, palaces);

  // 15. 將四化添加到各宮
  for (const palaceName of palaceNames) {
    if (palaces[palaceName] && transformsMap[palaceName]) {
      palaces[palaceName]!.transforms = transformsMap[palaceName];
    }
  }

  return {
    meta: {
      sex: meta.sex,
      solar: meta.solar,
      lunar: lunarISO,
      tz,
      bodyPalaceBranch
    },
    palaces
  };
}

export function renderText(chart: ZwdsChart): string {
  const lines: string[] = [];

  // 解析日期
  const solar = parseISODateTime(chart.meta.solar);
  const lunar = chart.meta.lunar ? parseISODateTime(chart.meta.lunar) : null;

  // 时辰名称映射
  const hourNames = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const hourName = lunar ? hourNames[Math.floor(lunar.hour / 2) % 12] : "";

  // 性别和生日信息
  lines.push(`性別：${chart.meta.sex === "male" ? "男" : "女"}`);
  lines.push(`陽曆生日：${solar.year} 年 ${solar.month} 月 ${solar.day} 日 ${solar.hour} 時`);
  if (lunar) {
    lines.push(`農曆生日：${lunar.year} 年 ${lunar.month} 月 ${lunar.day} 日 ${hourName} 時`);
  }

  // 计算并显示五行局数和阴阳男女（用于debug）
  if (chart.palaces.命宮) {
    const lifePalace = chart.palaces.命宮;

    // 获取五行局
    const bureau = getFiveElementBureau(lifePalace.stem!, lifePalace.branch);
    const bureauNames: Record<number, string> = {
      2: "水二局",
      3: "木三局",
      4: "金四局",
      5: "土五局",
      6: "火六局"
    };
    const bureauName = bureauNames[bureau] || `${bureau}局`;

    // 判断阴阳男女
    const yearStem = getYearStemBranch(lunar!.year).stem;
    const yangStems = ["甲", "丙", "戊", "庚", "壬"];
    const yearIsYang = yangStems.includes(yearStem);

    let yinYangSex = "";
    if (chart.meta.sex === "male") {
      yinYangSex = yearIsYang ? "陽男" : "陰男";
    } else {
      yinYangSex = yearIsYang ? "陽女" : "陰女";
    }

    lines.push(`命局：${bureauName}，${yinYangSex}`);
  }

  lines.push("");

  // 找出身宫所在的宫位
  let bodyPalaceName: PalaceName | null = null;
  if (chart.meta.bodyPalaceBranch) {
    for (const [name, palace] of Object.entries(chart.palaces)) {
      if (palace && palace.branch === chart.meta.bodyPalaceBranch) {
        bodyPalaceName = name as PalaceName;
        break;
      }
    }
  }

  // 宫位顺序（按照fixture格式）
  const palaceOrder: PalaceName[] = [
    "命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮",
    "遷移宮", "僕役宮", "官祿宮", "田宅宮", "福德宮", "父母宮"
  ];

  for (const palaceName of palaceOrder) {
    const palace = chart.palaces[palaceName];
    if (!palace) continue;

    // 如果当前宫位是身宫所在位置，显示"宮名/身宮"
    const palaceTitle = palaceName === bodyPalaceName
      ? `${palaceName}/身宮`
      : palaceName;

    lines.push(`【${palaceTitle}：宮位在${palace.stem}${palace.branch}】`);

    // 大限年份
    if (palace.decadeYears) {
      const [start, end] = palace.decadeYears;
      lines.push(`大限年份：${start}-${end}`);
    } else {
      lines.push("大限年份：（未計算）");
    }

    // 流年年份（显示全部12个）
    if (palace.flowYears && palace.flowYears.length > 0) {
      const yearsText = palace.flowYears.join(",");
      lines.push(`流年年份：${yearsText}`);
    } else {
      lines.push("流年年份：（無）");
    }

    // 主星
    if (palace.mainStars && palace.mainStars.length > 0) {
      const starTexts = palace.mainStars.map(s => {
        const brightness = s.status ? s.status : "";
        return `${s.name}${brightness}`;
      });
      lines.push(`主星有：${starTexts.join("．")}`);
    } else {
      lines.push("主星有：無");
    }

    // 辅星
    if (palace.assistStars && palace.assistStars.length > 0) {
      const assistTexts = palace.assistStars.map(s => {
        const brightness = s.status ? s.status : "";
        return `${s.name}${brightness}`;
      });
      lines.push(`輔星有：${assistTexts.join("．")}`);
    } else {
      lines.push("輔星有：無");
    }

    // 四化（分三個部分：生年四化、宮位四化、飛入四化）
    // 1. 生年四化（飛入當前宮位的生年四化）
    const yearTransforms = (palace.transforms || []).filter(t => t.isYearTransform);
    if (yearTransforms.length > 0) {
      lines.push("生年四化：");
      for (const t of yearTransforms) {
        lines.push(`．生年${t.yearStem}干${t.star}${t.type}`);
      }
    }

    // 2. 宮位四化（當前宮位的天干產生的四化，飛向其他宮位）
    const currentPalaceStem = palace.stem;
    const outgoingTransforms: typeof palace.transforms = [];

    // 遍歷所有宮位，找出從當前宮位發出的四化
    if (currentPalaceStem) {
      for (const targetPalaceName of palaceOrder) {
        const targetPalace = chart.palaces[targetPalaceName];
        if (targetPalace && targetPalace.transforms) {
          for (const t of targetPalace.transforms) {
            if (!t.isYearTransform && t.from === palaceName) {
              outgoingTransforms.push(t);
            }
          }
        }
      }
    }

    if (outgoingTransforms.length > 0) {
      lines.push("宮位四化：");
      for (const t of outgoingTransforms) {
        const fromPalace = chart.palaces[t.from];
        const fromStem = fromPalace?.stem || "";
        const isSelfTransform = t.from === t.to;
        const selfNote = isSelfTransform ? `（自${t.type.slice(1)}）` : "";
        lines.push(`．${t.from}${fromStem}干${t.star}${t.type}入${t.to}${selfNote}`);
      }
    }

    // 3. 飛入四化（其他宮位飛入當前宮位的四化，不含生年四化和自化）
    const incomingTransforms = (palace.transforms || []).filter(t => !t.isYearTransform && t.from !== t.to);
    if (incomingTransforms.length > 0) {
      lines.push("飛入四化：");
      for (const t of incomingTransforms) {
        const fromPalace = chart.palaces[t.from];
        const fromStem = fromPalace?.stem || "";
        lines.push(`．${t.from}${fromStem}干${t.star}${t.type}入${t.to}`);
      }
    }

    // 如果三個部分都沒有，顯示無
    const totalTransforms = yearTransforms.length + outgoingTransforms.length + incomingTransforms.length;
    if (totalTransforms === 0) {
      lines.push("四化：");
      lines.push("．（無）");
    }
  }

  return lines.join("\n");
}