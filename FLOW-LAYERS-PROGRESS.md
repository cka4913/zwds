# 流月、流日、流时功能实现进度

**创建日期**: 2025-01-28
**状态**: Phase 1 完成，待继续 Phase 2-4

---

## 📋 功能需求总结

### 新增功能
添加流月（Flow Month）、流日（Flow Day）、流时（Flow Hour）的计算和显示功能。

### 输入参数
- **CLI**: 添加 `--current` 参数
  ```bash
  pnpm dev:cli -- --sex male --solar 1975-10-23T12:00:00 --current 2025-10-30T14:00:00
  ```

- **API**: 添加 `current` 字段
  ```json
  {
    "sex": "male",
    "solar": "1975-10-23T12:00:00",
    "current": "2025-10-30T14:00:00",
    "output": {"json": false, "text": true}
  }
  ```

### 参数规则
- `current` 为可选参数，默认为当前时间
- `current` 不能早于出生日期
- `current` 不能超过出生日期 + 120年

### 输出变化

1. **新增输出行**：
   ```
   設定日期：2025 年 10 月 30 日 14 時
   ```

2. **宫位标签**：
   - `【命宮/身宮：宮位在庚辰】`
   - `【財帛宮：宮位在戊子】【大限】`
   - `【疾厄宮：宮位在丁亥】【流月】【流時】`
   - `【官祿宮：宮位在甲申】【流日】`
   - `【父母宮：宮位在辛巳】【流年】`

3. **CLI 彩色标签** (要求)：
   - 标签使用不同颜色显示

---

## ✅ Phase 1: 已完成（2025-01-28）

### 1. 类型定义更新 (`packages/core/src/types.ts`)

**新增到 `ChartMeta`**:
```typescript
export interface ChartMeta {
  sex: Sex;
  solar: string;
  lunar?: string;
  current?: string;      // 新增：当前时间（ISO格式）
  currentLunar?: string; // 新增：当前时间的农历
  tz?: string;
  location?: { lat: number; lon: number; place?: string };
  bodyPalaceBranch?: EarthBranch;
}
```

**新增到 `PalaceSlot`**:
```typescript
export interface PalaceSlot {
  // ... 现有字段

  // 新增：当前时间标记
  isDecadePalace?: boolean;   // 是否为当前大限所在宫位
  isAnnualPalace?: boolean;   // 是否为当前流年所在宫位
  isMonthlyPalace?: boolean;  // 是否为当前流月所在宫位
  isDailyPalace?: boolean;    // 是否为当前流日所在宫位
  isHourlyPalace?: boolean;   // 是否为当前流时所在宫位
}
```

### 2. Fortune 计算函数扩展 (`packages/core/src/fortune.ts`)

**新增函数**:

```typescript
/**
 * 计算流月宫位
 * 规则：从流年宫位起，按农历月份顺时针数
 */
export function getMonthlyPalace(
  annualPalace: PalaceName,
  lunarMonth: number,
  palaceBranches: Record<PalaceName, EarthBranch>
): Exclude<PalaceName, "身宮">

/**
 * 计算流日宫位
 * 规则：从流月宫位起，按农历日期顺时针数
 */
export function getDailyPalace(
  monthlyPalace: PalaceName,
  lunarDay: number,
  palaceBranches: Record<PalaceName, EarthBranch>
): Exclude<PalaceName, "身宮">

/**
 * 计算流时宫位
 * 规则：从流日宫位起，按时辰地支顺时针数
 */
export function getHourlyPalace(
  dailyPalace: PalaceName,
  hourBranch: EarthBranch,
  palaceBranches: Record<PalaceName, EarthBranch>
): Exclude<PalaceName, "身宮">

/**
 * 根据当前年龄查找当前大限所在宫位
 */
export function getCurrentDecadePalace(
  age: number,
  decades: Record<PalaceName, DecadeRange>
): PalaceName | undefined
```

### 3. Git 提交记录

```
commit 9ad207d
feat(core): Add foundation for flow month/day/hour calculations

- Update types.ts: Add current/currentLunar to ChartMeta
- Update types.ts: Add palace markers (isDecadePalace, etc.)
- Update fortune.ts: Add getMonthlyPalace()
- Update fortune.ts: Add getDailyPalace()
- Update fortune.ts: Add getHourlyPalace()
- Update fortune.ts: Add getCurrentDecadePalace()
```

---

## 🔄 Phase 2: 待完成 - 核心逻辑更新

### 文件：`packages/core/src/index.ts`

**需要修改 `makeChart()` 函数**:

1. **处理 `current` 参数**:
   ```typescript
   export function makeChart(meta: ChartMeta): ZwdsChart {
     const tz = meta.tz ?? "Asia/Hong_Kong";

     // 1. 处理 current 参数（默认为当前时间）
     const currentTime = meta.current ?? new Date().toISOString();

     // 2. 验证 current 日期
     const solar = parseISODateTime(meta.solar);
     const current = parseISODateTime(currentTime);

     // 验证：current 不能早于出生日期
     const birthDate = new Date(meta.solar);
     const currentDate = new Date(currentTime);
     if (currentDate < birthDate) {
       throw new Error("Current date cannot be earlier than birth date");
     }

     // 验证：current 不能超过出生日期 + 120年
     const maxDate = new Date(birthDate);
     maxDate.setFullYear(birthDate.getFullYear() + 120);
     if (currentDate > maxDate) {
       throw new Error("Current date cannot be more than 120 years after birth date");
     }

     // 3. 转换 current 为农历
     const currentLunar = solarToLunar(current);
     const currentLunarISO = `${currentLunar.year...}`;

     // ... 现有逻辑
   }
   ```

2. **计算当前年龄**:
   ```typescript
   // 计算周岁年龄
   const birthYear = solar.year;
   const currentYear = current.year;
   const birthMonth = solar.month;
   const currentMonth = current.month;
   const birthDay = solar.day;
   const currentDay = current.day;

   let age = currentYear - birthYear;
   if (currentMonth < birthMonth ||
       (currentMonth === birthMonth && currentDay < birthDay)) {
     age--;
   }
   ```

3. **标记各宫位**:
   ```typescript
   // 找出当前大限宫位
   const decadePalace = getCurrentDecadePalace(age, decades);

   // 找出当前流年宫位
   const annualPalace = getAnnualPalace(currentYear, palaceBranches);

   // 找出当前流月宫位
   const monthlyPalace = getMonthlyPalace(
     annualPalace,
     currentLunar.month,
     palaceBranches
   );

   // 找出当前流日宫位
   const dailyPalace = getDailyPalace(
     monthlyPalace,
     currentLunar.day,
     palaceBranches
   );

   // 找出当前流时宫位
   const currentHourBranch = getHourBranch(currentLunar.hour);
   const hourlyPalace = getHourlyPalace(
     dailyPalace,
     currentHourBranch,
     palaceBranches
   );

   // 标记各宫位
   for (const palaceName of palaceNames) {
     if (palaces[palaceName]) {
       palaces[palaceName]!.isDecadePalace = (palaceName === decadePalace);
       palaces[palaceName]!.isAnnualPalace = (palaceName === annualPalace);
       palaces[palaceName]!.isMonthlyPalace = (palaceName === monthlyPalace);
       palaces[palaceName]!.isDailyPalace = (palaceName === dailyPalace);
       palaces[palaceName]!.isHourlyPalace = (palaceName === hourlyPalace);
     }
   }
   ```

4. **更新返回的 meta**:
   ```typescript
   return {
     meta: {
       sex: meta.sex,
       solar: meta.solar,
       lunar: lunarISO,
       current: currentTime,
       currentLunar: currentLunarISO,
       tz,
       bodyPalaceBranch
     },
     palaces
   };
   ```

---

## 🔄 Phase 3: 待完成 - 文本渲染更新

### 文件：`packages/core/src/index.ts` - `renderText()` 函数

**需要修改的地方**:

1. **添加"設定日期"输出**:
   ```typescript
   export function renderText(chart: ZwdsChart): string {
     const lines: string[] = [];

     const solar = parseISODateTime(chart.meta.solar);
     const lunar = chart.meta.lunar ? parseISODateTime(chart.meta.lunar) : null;

     // 新增：解析 current 日期
     const current = chart.meta.current ? parseISODateTime(chart.meta.current) : null;

     // 性别和生日信息
     lines.push(`性別：${chart.meta.sex === "male" ? "男" : "女"}`);
     lines.push(`陽曆生日：${solar.year} 年 ${solar.month} 月 ${solar.day} 日 ${solar.hour} 時`);

     if (lunar) {
       const hourName = hourNames[Math.floor(lunar.hour / 2) % 12];
       lines.push(`農曆生日：${lunar.year} 年 ${lunar.month} 月 ${lunar.day} 日 ${hourName} 時`);
     }

     // 新增：設定日期
     if (current) {
       lines.push(`設定日期：${current.year} 年 ${current.month} 月 ${current.day} 日 ${current.hour} 時`);
     }

     // 命局信息...
     lines.push(`命局：${bureauName}，${yinYangSex}`);
     lines.push("");

     // ... 其余代码
   }
   ```

2. **宫位标题添加标签**:
   ```typescript
   for (const palaceName of palaceOrder) {
     const palace = chart.palaces[palaceName];
     if (!palace) continue;

     // 基础标题
     let palaceTitle = palaceName === bodyPalaceName
       ? `${palaceName}/身宮`
       : palaceName;

     // 新增：添加流层标签
     const labels: string[] = [];
     if (palace.isDecadePalace) labels.push("【大限】");
     if (palace.isAnnualPalace) labels.push("【流年】");
     if (palace.isMonthlyPalace) labels.push("【流月】");
     if (palace.isDailyPalace) labels.push("【流日】");
     if (palace.isHourlyPalace) labels.push("【流時】");

     const labelText = labels.join("");

     lines.push(`【${palaceTitle}：宮位在${palace.stem}${palace.branch}】${labelText}`);

     // ... 其余内容
   }
   ```

---

## 🔄 Phase 4: 待完成 - CLI & API 更新

### 4.1 CLI 更新 (`packages/cli/src/index.ts`)

**需要修改**:

1. **添加 `--current` 参数**:
   ```typescript
   import { program } from 'commander';

   program
     .option('--sex <sex>', 'Sex: male or female')
     .option('--solar <datetime>', 'Birth datetime (ISO 8601)')
     .option('--current <datetime>', 'Current datetime (ISO 8601), optional, defaults to now')
     .option('--tz <timezone>', 'Timezone (IANA format), optional')
     .parse();

   const options = program.opts();

   const chartInput = {
     sex: options.sex,
     solar: options.solar,
     current: options.current, // 新增
     tz: options.tz
   };
   ```

2. **彩色标签显示**（使用 chalk 或类似库）:
   ```typescript
   import chalk from 'chalk';

   // 在渲染输出时为标签添加颜色
   // 例如：
   // 【大限】 - 红色
   // 【流年】 - 蓝色
   // 【流月】 - 绿色
   // 【流日】 - 黄色
   // 【流時】 - 紫色

   const output = renderText(chart);
   const coloredOutput = output
     .replace(/【大限】/g, chalk.red('【大限】'))
     .replace(/【流年】/g, chalk.blue('【流年】'))
     .replace(/【流月】/g, chalk.green('【流月】'))
     .replace(/【流日】/g, chalk.yellow('【流日】'))
     .replace(/【流時】/g, chalk.magenta('【流時】'));

   console.log(coloredOutput);
   ```

### 4.2 API 更新 (`packages/api/src/index.ts`)

**需要修改**:

1. **接受 `current` 字段**:
   ```typescript
   app.post('/api/zwds/chart', async (request, reply) => {
     const { sex, solar, current, tz, output } = request.body as {
       sex: 'male' | 'female';
       solar: string;
       current?: string;  // 新增
       tz?: string;
       output?: { text?: boolean; json?: boolean };
     };

     // 验证必需参数
     if (!sex || !solar) {
       return reply.code(400).send({ error: 'Missing required fields: sex, solar' });
     }

     try {
       const chart = makeChart({ sex, solar, current, tz });
       // ...
     } catch (error) {
       return reply.code(400).send({ error: error.message });
     }
   });
   ```

---

## 🧪 测试用例

### 测试用例 1: 1975-10-23 男命，current=2025-10-30T14:00:00

**输入**:
```bash
pnpm dev:cli -- --sex male --solar 1975-10-23T12:00:00 --current 2025-10-30T14:00:00
```

**预期输出**（部分）:
```
性別：男
陽曆生日：1975 年 10 月 23 日 12 時
農曆生日：1975 年 9 月 19 日 午 時
設定日期：2025 年 10 月 30 日 14 時
命局：金四局，陰男

【命宮/身宮：宮位在庚辰】
大限年份：1978-1987
...

【財帛宮：宮位在戊子】【大限】
大限年份：2018-2027
...

【疾厄宮：宮位在丁亥】【流月】【流時】
大限年份：2028-2037
...

【官祿宮：宮位在甲申】【流日】
大限年份：2058-2067
...

【父母宮：宮位在辛巳】【流年】
大限年份：2088-2097
...
```

### 测试用例 2: 错误处理

**测试 1: current 早于出生日期**
```bash
pnpm dev:cli -- --sex male --solar 1975-10-23T12:00:00 --current 1970-01-01T12:00:00
```
预期：报错 "Current date cannot be earlier than birth date"

**测试 2: current 超过120年**
```bash
pnpm dev:cli -- --sex male --solar 1975-10-23T12:00:00 --current 2100-01-01T12:00:00
```
预期：报错 "Current date cannot be more than 120 years after birth date"

### 测试用例 3: 默认 current（使用当前时间）

```bash
pnpm dev:cli -- --sex male --solar 1975-10-23T12:00:00
```
预期：使用系统当前时间作为 current

---

## 📝 关键计算逻辑

### 流月计算
从流年宫位起，按农历月份**顺时针**数。

例如：
- 流年在父母宫（index=11）
- 农历3月
- 流月 = (11 + 3 - 1) % 12 = 13 % 12 = 1 = 兄弟宫

### 流日计算
从流月宫位起，按农历日期**顺时针**数。

例如：
- 流月在疾厄宫（index=5）
- 农历19日
- 流日 = (5 + 19 - 1) % 12 = 23 % 12 = 11 = 父母宫

### 流时计算
从流日宫位起，按时辰地支的索引**顺时针**数。

例如：
- 流日在官禄宫（index=8）
- 申时（地支=申，index=8）
- 流时 = (8 + 8) % 12 = 16 % 12 = 4 = 子女宫

### 大限查找
根据当前年龄，查找 `decadeYears` 范围匹配的宫位。

例如：
- 出生：1975年
- 当前：2025年
- 年龄：50岁
- 查找：哪个宫位的 decadeYears 包含 50
- 结果：财帛宫（2018-2027 → 年龄 44-53）

---

## 📚 参考资料

### 完整预期输出（来自用户）

用户提供的完整示例输出在上面的测试用例中。关键点：
1. 設定日期在農曆生日之后
2. 标签紧跟在宫位标题之后，无空格
3. 一个宫位可能有多个标签（如：【流月】【流時】）
4. CLI 需要彩色显示标签

---

## 🎯 下一步行动

**Phase 2-4 实施顺序**:
1. 先完成 Phase 2（核心逻辑）
2. 再完成 Phase 3（文本渲染）
3. 测试 core 功能是否正确
4. 最后完成 Phase 4（CLI & API）
5. 完整端到端测试

**建议测试流程**:
1. 先用 makeChart() 直接测试，检查宫位标记是否正确
2. 再测试 renderText()，检查输出格式
3. 最后测试 CLI 和 API

---

## 📦 依赖安装

如果需要彩色输出，可能需要安装：
```bash
pnpm add chalk
pnpm add -D @types/chalk
```

---

**下个 session 继续时，请告诉我从哪个 Phase 开始！**
