import { parseISODateTime, solarToLunar, getYearStemBranch, getMonthStemBranch, getDayStemBranch, getHourBranch, getHourStem } from "./calendar.js";
import { findLifePalaceBranch, findBodyPalaceBranch, findLifePalaceStem, arrangePalaces, arrangePalaceStems } from "./palaces.js";
import { getFiveElementBureau, findZiweiPosition, findTianfuPosition, placeAllMainStars } from "./stars.js";
import { placeAllAssistStars } from "./assist-stars.js";
import { calculateAllTransforms } from "./transforms.js";
import { calculateDecades, getAnnualYearsForPalace, getCurrentDecadePalace, getAnnualPalace, getMonthlyPalace, getDailyPalace, getHourlyPalace, getDoujunBranch } from "./fortune.js";
import { PALACE_NAMES, getBranchIndex, getBranchByIndex } from "./data.js";
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
export function makeChart(meta) {
    // 使用系统本地时区，而不是硬编码 Asia/Hong_Kong
    const tz = meta.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    // 1. 解析阳历日期
    const solar = parseISODateTime(meta.solar);
    // 1.5 处理 current 参数（用于流月、流日、流时计算）
    // 如果没有提供 current，使用本地时间（而不是 UTC）
    let currentTime;
    if (meta.current) {
        currentTime = meta.current;
    }
    else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        currentTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }
    const current = parseISODateTime(currentTime);
    // 验证 current 日期
    const birthDate = new Date(meta.solar);
    const currentDate = new Date(currentTime);
    if (currentDate < birthDate) {
        throw new Error("Current date cannot be earlier than birth date");
    }
    const maxDate = new Date(birthDate);
    maxDate.setFullYear(birthDate.getFullYear() + 120);
    if (currentDate > maxDate) {
        throw new Error("Current date cannot be more than 120 years after birth date");
    }
    // 2. 转换为农历
    const lunar = solarToLunar(solar);
    const lunarISO = `${lunar.year.toString().padStart(4, '0')}-${lunar.month.toString().padStart(2, '0')}-${lunar.day.toString().padStart(2, '0')}T${lunar.hour.toString().padStart(2, '0')}:00:00`;
    // 2.5 转换 current 为农历
    const currentLunar = solarToLunar(current);
    const currentLunarISO = `${currentLunar.year.toString().padStart(4, '0')}-${currentLunar.month.toString().padStart(2, '0')}-${currentLunar.day.toString().padStart(2, '0')}T${currentLunar.hour.toString().padStart(2, '0')}:00:00`;
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
    const palaces = {};
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
                palaces[palaceName].decadeYears = [startYear, endYear];
                // 流年年份（根据宫位地支计算）
                const palaceBranch = palaceBranches[palaceName];
                const annualYears = getAnnualYearsForPalace(palaceBranch, birthYear, 12 // 显示12个年份（前后各6个周期）
                );
                palaces[palaceName].flowYears = annualYears;
            }
        }
    }
    // 14. 計算四化飛星
    const transformsMap = calculateAllTransforms(yearStemBranch.stem, palaceStems, palaces);
    // 15. 將四化添加到各宮
    for (const palaceName of palaceNames) {
        if (palaces[palaceName] && transformsMap[palaceName]) {
            palaces[palaceName].transforms = transformsMap[palaceName];
        }
    }
    // 16. 计算并标记当前流层宫位
    // 计算当前年龄（虚岁，使用农历年份差）
    let nominalAge = currentLunar.year - lunar.year;
    // 如果还没过农历生日，虚岁已经是正确的
    // 如果已过农历生日，需要加1岁
    if (currentLunar.month > lunar.month ||
        (currentLunar.month === lunar.month && currentLunar.day >= lunar.day)) {
        nominalAge++;
    }
    // 找出当前大限宫位（使用虚岁）
    const decadePalace = getCurrentDecadePalace(nominalAge, decades);
    // 计算流年斗君（使用农历年）
    const currentYearStemBranch = getYearStemBranch(currentLunar.year);
    const doujunBranch = getDoujunBranch(lunar.month, hourBranch, yearStemBranch.branch, currentYearStemBranch.branch);
    // 找出当前流年宫位
    const annualPalace = getAnnualPalace(current.year, palaceBranches);
    // 计算流月地支：斗君 + (农历月 - 1)
    const doujunIndex = getBranchIndex(doujunBranch);
    const monthlyBranchIndex = (doujunIndex + currentLunar.month - 1) % 12;
    const monthlyBranch = getBranchByIndex(monthlyBranchIndex);
    // 找出当前流月宫位
    const monthlyPalace = getMonthlyPalace(doujunBranch, currentLunar.month, palaceBranches);
    // 计算流日地支：流月地支 + (农历日 - 1)
    const dailyBranchIndex = (monthlyBranchIndex + currentLunar.day - 1) % 12;
    const dailyBranch = getBranchByIndex(dailyBranchIndex);
    // 找出当前流日宫位
    const dailyPalace = getDailyPalace(monthlyBranch, currentLunar.day, palaceBranches);
    // 计算流时地支：流日地支 + 时辰地支索引
    const currentHourBranch = getHourBranch(current.hour);
    const currentHourIndex = getBranchIndex(currentHourBranch);
    const hourlyBranchIndex = (dailyBranchIndex + currentHourIndex) % 12;
    const hourlyBranch = getBranchByIndex(hourlyBranchIndex);
    // 找出当前流时宫位
    const hourlyPalace = getHourlyPalace(dailyBranch, currentHourBranch, palaceBranches);
    // 标记各宫位
    for (const palaceName of palaceNames) {
        if (palaces[palaceName]) {
            palaces[palaceName].isDecadePalace = (palaceName === decadePalace);
            palaces[palaceName].isAnnualPalace = (palaceName === annualPalace);
            palaces[palaceName].isMonthlyPalace = (palaceName === monthlyPalace);
            palaces[palaceName].isDailyPalace = (palaceName === dailyPalace);
            palaces[palaceName].isHourlyPalace = (palaceName === hourlyPalace);
        }
    }
    return {
        meta: {
            sex: meta.sex,
            solar: meta.solar,
            lunar: lunarISO,
            current: currentTime,
            currentLunar: currentLunarISO,
            doujunBranch,
            tz,
            bodyPalaceBranch
        },
        palaces
    };
}
export function renderText(chart) {
    const lines = [];
    // 解析日期
    const solar = parseISODateTime(chart.meta.solar);
    const lunar = chart.meta.lunar ? parseISODateTime(chart.meta.lunar) : null;
    const current = chart.meta.current ? parseISODateTime(chart.meta.current) : null;
    // 时辰名称映射
    const hourNames = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    const hourName = lunar ? hourNames[Math.floor(lunar.hour / 2) % 12] : "";
    // 性别和生日信息
    lines.push(`性別：${chart.meta.sex === "male" ? "男" : "女"}`);
    lines.push(`陽曆生日：${solar.year} 年 ${solar.month} 月 ${solar.day} 日 ${solar.hour} 時`);
    if (lunar) {
        lines.push(`農曆生日：${lunar.year} 年 ${lunar.month} 月 ${lunar.day} 日 ${hourName} 時`);
    }
    // 設定日期（如果有 current）
    if (current) {
        const doujunInfo = chart.meta.doujunBranch ? ` 【斗君：${chart.meta.doujunBranch}】` : "";
        lines.push(`設定日期：${current.year} 年 ${current.month} 月 ${current.day} 日 ${current.hour} 時${doujunInfo}`);
    }
    // 计算并显示五行局数和阴阳男女（用于debug）
    if (chart.palaces.命宮) {
        const lifePalace = chart.palaces.命宮;
        // 获取五行局
        const bureau = getFiveElementBureau(lifePalace.stem, lifePalace.branch);
        const bureauNames = {
            2: "水二局",
            3: "木三局",
            4: "金四局",
            5: "土五局",
            6: "火六局"
        };
        const bureauName = bureauNames[bureau] || `${bureau}局`;
        // 判断阴阳男女
        const yearStem = getYearStemBranch(lunar.year).stem;
        const yangStems = ["甲", "丙", "戊", "庚", "壬"];
        const yearIsYang = yangStems.includes(yearStem);
        let yinYangSex = "";
        if (chart.meta.sex === "male") {
            yinYangSex = yearIsYang ? "陽男" : "陰男";
        }
        else {
            yinYangSex = yearIsYang ? "陽女" : "陰女";
        }
        lines.push(`命局：${bureauName}，${yinYangSex}`);
    }
    lines.push("");
    // 找出身宫所在的宫位
    let bodyPalaceName = null;
    if (chart.meta.bodyPalaceBranch) {
        for (const [name, palace] of Object.entries(chart.palaces)) {
            if (palace && palace.branch === chart.meta.bodyPalaceBranch) {
                bodyPalaceName = name;
                break;
            }
        }
    }
    // 宫位顺序（按照fixture格式）
    const palaceOrder = [
        "命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮",
        "遷移宮", "交友宮", "官祿宮", "田宅宮", "福德宮", "父母宮"
    ];
    // 宫位简称映射
    const palaceAbbrev = {
        "命宮": "命", "兄弟宮": "兄", "夫妻宮": "夫", "子女宮": "子",
        "財帛宮": "財", "疾厄宮": "疾", "遷移宮": "遷", "交友宮": "友",
        "官祿宮": "官", "田宅宮": "田", "福德宮": "福", "父母宮": "父"
    };
    // 计算当前宫位在每个流层中的位置
    function getLayerPalace(currentPalaceName, layerEntryPalace) {
        if (!layerEntryPalace)
            return "";
        const currentIndex = palaceOrder.indexOf(currentPalaceName);
        const entryIndex = palaceOrder.indexOf(layerEntryPalace);
        // 从流层命宫逆数（backwards）到当前宫位
        const offset = (entryIndex - currentIndex + 12) % 12;
        const layerPalaceName = palaceOrder[offset];
        return palaceAbbrev[layerPalaceName] || "";
    }
    // 找出各个流层的命宫
    let decadePalaceName;
    let annualPalaceName;
    let monthlyPalaceName;
    let dailyPalaceName;
    let hourlyPalaceName;
    for (const pName of palaceOrder) {
        const p = chart.palaces[pName];
        if (p?.isDecadePalace)
            decadePalaceName = pName;
        if (p?.isAnnualPalace)
            annualPalaceName = pName;
        if (p?.isMonthlyPalace)
            monthlyPalaceName = pName;
        if (p?.isDailyPalace)
            dailyPalaceName = pName;
        if (p?.isHourlyPalace)
            hourlyPalaceName = pName;
    }
    for (const palaceName of palaceOrder) {
        const palace = chart.palaces[palaceName];
        if (!palace)
            continue;
        // 如果当前宫位是身宫所在位置，显示"宮名/身宮"
        let palaceTitle = palaceName === bodyPalaceName
            ? `${palaceName}/身宮`
            : palaceName;
        // 添加流层标签
        const labels = [];
        if (palace.isDecadePalace)
            labels.push("【大限】");
        if (palace.isAnnualPalace)
            labels.push("【流年】");
        if (palace.isMonthlyPalace)
            labels.push("【流月】");
        if (palace.isDailyPalace)
            labels.push("【流日】");
        if (palace.isHourlyPalace)
            labels.push("【流時】");
        const labelText = labels.join("");
        lines.push(`【${palaceTitle}：宮位在${palace.stem}${palace.branch}】${labelText}`);
        // 流层宫位指示（显示当前宫位在各个流层中的位置）
        const layerIndicators = [];
        // 本命：当前宫位就是本命的该宫位
        const natalPalace = palaceAbbrev[palaceName] || "";
        layerIndicators.push(`本${natalPalace}`);
        // 大限
        const decadePalace = getLayerPalace(palaceName, decadePalaceName);
        if (decadePalace) {
            layerIndicators.push(`大${decadePalace}`);
        }
        // 流年
        const annualPalace = getLayerPalace(palaceName, annualPalaceName);
        if (annualPalace) {
            layerIndicators.push(`年${annualPalace}`);
        }
        // 流月
        const monthlyPalace = getLayerPalace(palaceName, monthlyPalaceName);
        if (monthlyPalace) {
            layerIndicators.push(`月${monthlyPalace}`);
        }
        // 流日
        const dailyPalace = getLayerPalace(palaceName, dailyPalaceName);
        if (dailyPalace) {
            layerIndicators.push(`日${dailyPalace}`);
        }
        // 流时
        const hourlyPalace = getLayerPalace(palaceName, hourlyPalaceName);
        if (hourlyPalace) {
            layerIndicators.push(`時${hourlyPalace}`);
        }
        if (layerIndicators.length > 0) {
            lines.push(`【${layerIndicators.join("｜")}】`);
        }
        // 大限年份
        if (palace.decadeYears) {
            const [start, end] = palace.decadeYears;
            lines.push(`大限年份：${start}-${end}`);
        }
        else {
            lines.push("大限年份：（未計算）");
        }
        // 流年年份（显示全部12个）
        if (palace.flowYears && palace.flowYears.length > 0) {
            const yearsText = palace.flowYears.join(",");
            lines.push(`流年年份：${yearsText}`);
        }
        else {
            lines.push("流年年份：（無）");
        }
        // 主星
        if (palace.mainStars && palace.mainStars.length > 0) {
            const starTexts = palace.mainStars.map(s => {
                const brightness = s.status ? s.status : "";
                return `${s.name}${brightness}`;
            });
            lines.push(`主星有：${starTexts.join("．")}`);
        }
        else {
            lines.push("主星有：無");
        }
        // 辅星
        if (palace.assistStars && palace.assistStars.length > 0) {
            const assistTexts = palace.assistStars.map(s => {
                const brightness = s.status ? s.status : "";
                return `${s.name}${brightness}`;
            });
            lines.push(`輔星有：${assistTexts.join("．")}`);
        }
        else {
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
        const outgoingTransforms = [];
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
