# AGENTS.md — ZWDS API (北派紫微斗數)

> 你（工程代理，如 ChatGPT Codex）將負責實作一個可供 GPTs / 任何 AI Chatbot 調用的 **紫微斗數起盤與斗數盤搜索 API**。請嚴格依本檔執行。本文同時是「作業計劃（plan）+ 任務模板 + 驗收規範」。

---

## 0. 目標與非目標
- **目標**：
  1) 實作 **Part A：起盤 API**（輸入：陽曆生日、時間、性別、時區/地點 → 輸出：標準 JSON + AI 可讀的 text 列表）
  2) 實作 **Part B：斗數盤搜索 API**（輸入：查詢語句框架 → 輸出：符合條件的 [發射宮位][四化落象][入/沖/照][目的宮位] 與對應大限/流年年份）
  3) **資料模型化** 北派紫微斗數核心元素（宮位、主/輔星、四化、行運層、本命/大限/流年/流月/流日/流時）
  4) 提供可驗證、可測試、可擴充之 **TypeScript 套件 + HTTP API**

- **非目標**：
  - 無依據的神秘推論；
  - 未經驗證的演算法硬編；
  - 與本規格不一致的自由發揮格式。

---

## 1. 技術棧與專案結構
- Node 20.x、TypeScript 5.x
- 套件管理：pnpm
- 測試：Vitest（覆蓋率門檻：行數 ≥ 85%，關鍵模組 ≥ 90%）
- Lint/格式：ESLint + Prettier（0 警告）
- HTTP：Fastify（或 Express）
- Monorepo（pnpm workspace）：
```
/zwds
  packages/
    core/           # 起盤演算法、星曜/四化資料表、行運計算、查詢引擎（純函式）
    api/            # Fastify API 層（HTTP I/O，無商業邏輯）
    cli/            # 本地測試命令列：起盤、查詢、印出 text 列表
  tests/            # 端到端與重點整合測試
  examples/         # 請求/回應樣本、Demo 腳本
  .github/workflows/ci.yml
  AGENTS.md         # 本檔
  README.md
  CHANGELOG.md
```

**Scripts**
```json
{
  "scripts": {
    "build": "pnpm -r --filter './packages/*' build",
    "typecheck": "tsc -b",
    "lint": "eslint .",
    "test": "vitest run --coverage",
    "dev:api": "pnpm --filter @zwds/api dev",
    "dev:cli": "pnpm --filter @zwds/cli dev"
  }
}
```

---

## 2. 資料模型（核心型別）
> 以 `packages/core/src/types.ts` 實作並輸出

```ts
export type Sex = "male" | "female";
export type Layer = "本命" | "大限" | "流年" | "流月" | "流日" | "流時";
export type PalaceName =
  | "命宮" | "兄弟宮" | "夫妻宮" | "子女宮" | "財帛宮" | "疾厄宮"
  | "遷移宮" | "僕役宮" | "官祿宮" | "田宅宮" | "福德宮" | "父母宮" | "身宮";
export type EarthBranch = "子"|"丑"|"寅"|"卯"|"辰"|"巳"|"午"|"未"|"申"|"酉"|"戌"|"亥";
export type HeavenlyStem = "甲"|"乙"|"丙"|"丁"|"戊"|"己"|"庚"|"辛"|"壬"|"癸";
export type Transform = "化祿" | "化權" | "化科" | "化忌";
export type Relation = "入" | "沖" | "照"; // 入=直入目標、沖=對宮、照=三方四正

export interface StarPresence {
  name: string;         // e.g. 紫微、天機、太陽…（含主/輔星）
  status?: string;      // 旺/廟/得/陷/平/利（若適用）
  notes?: string;
}

export interface PalaceSlot {
  layer: Layer;               // 該層（本命/大限/流年…）
  name: PalaceName;           // 宮名
  branch: EarthBranch;        // 宮位地支（e.g. 命宮：宮位在庚午 → branch=午, stem=庚）
  stem?: HeavenlyStem;        // 宮干（若需要）
  mainStars: StarPresence[];  // 主星
  assistStars: StarPresence[];// 輔星
  transforms: Array<{
    from: PalaceName;         // 發射宮名（同本 Palace）
    to: PalaceName;           // 落象之宮名
    star: string;             // 哪顆星化祿/權/科/忌
    type: Transform;
  }>;
  decadeYears?: [number, number]; // 大限 10 年區間（如 1998-2007）
  flowYears?: number[];           // 與此宮對應之流年（如樣例）
}

export interface ChartMeta {
  sex: Sex;
  solar: string;    // ISO 日期時間（出生地時區）
  lunar?: string;   // （可選）農曆 YYYY-MM-DD HH:mm（若輸入陽曆，系統會換算）
  tz: string;       // IANA timezone（例：Asia/Hong_Kong）
  location?: { lat: number; lon: number; place?: string };
}

export interface ZwdsChart {
  meta: ChartMeta;
  palaces: Record<PalaceName, PalaceSlot>;
}

export interface SearchQuery {
  from: { layer: Layer; palace: PalaceName | EarthBranch };
  transform: Transform;
  relation: Relation; // 入/沖/照
  to: { layer: Layer; palace: PalaceName | EarthBranch };
}

export interface SearchHit {
  display: string; // 例：子宮化祿照午宮 ：1998-2007大限，2003年流年
  details: {
    fromBranch: EarthBranch; toBranch: EarthBranch;
    decade?: [number, number];
    year?: number;
    star?: string;
  };
}
```

---

## 3. API 介面（HTTP）
> `packages/api` 提供 JSON/文本雙輸出；所有邏輯呼叫 `@zwds/core`

### 3.1 起盤（Part A）
**POST** `/api/zwds/chart`
- **Request (JSON)**
```json
{
  "sex": "female",
  "solar": "1984-09-19T06:00:00",
  "tz": "Asia/Hong_Kong",
  "output": { "text": true, "json": true }
}
```
- **Response (JSON)**
```json
{
  "meta": {"sex":"female","solar":"1984-09-19T06:00:00","lunar":"1984-08-24T06:00:00","tz":"Asia/Hong_Kong"},
  "palaces": { /* 見 types.ZwdsChart */ },
  "text": "性別：女\n陽曆生日：1984 年 9 月 19 日 6 時\n農曆生日：1984 年 8 月 24 日 卯 時\n\n【命宮：宮位在庚午】\n大限年份：1988-1997\n流年年份：1988,2000,2012,2024,2036,2048,2060,2072,2084,2098\n主星有：無\n輔星有：無\n四化：\n．命宮庚干飛入財帛宮太陽化祿\n．命宮庚干飛入疾厄宮武曲化權\n...（其餘 11 宮，格式一致）"
}
```
> 文本輸出必須 **逐宮塊** 與範例一致，利於 AI 讀取；同時 JSON 提供機器可解析欄位。

### 3.2 搜索（Part B）
**POST** `/api/zwds/search`
- **Request (JSON)**
```json
{
  "chartInput": {"sex":"female","solar":"1984-09-19T06:00:00","tz":"Asia/Hong_Kong"},
  "queries": [
    {"from":{"layer":"本命","palace":"命宮"},"transform":"化忌","relation":"入","to":{"layer":"本命","palace":"遷移宮"}},
    {"from":{"layer":"流年","palace":"夫妻宮"},"transform":"化祿","relation":"照","to":{"layer":"大限","palace":"官祿宮"}}
  ],
  "options": {"returnText": true}
}
```
- **Response (JSON)**
```json
{
  "hits": [
    {
      "display": "子宮化忌入午宮",
      "details": {"fromBranch":"子","toBranch":"午","star":"太陰","year":null}
    },
    {
      "display": "子宮化祿照午宮 ：1998-2007大限，2003年流年",
      "details": {"fromBranch":"子","toBranch":"午","decade":[1998,2007],"year":2003}
    }
  ],
  "text": "例2 結果：\n子宮化祿照午宮 ：1998-2007大限，2003年流年\n..."
}
```

### 3.3 查詢語句解析（可選）
**POST** `/api/zwds/parse`
- 輸入一行中文（如：「流年夫妻宮化祿照大限官祿宮」）→ 回傳 `SearchQuery` 結構。

---

## 4. 起盤演算法（北派，可插拔）
> 先以 **策略介面** 封裝，資料表與演算分離；允許之後替換/校準。

### 4.1 介面
```ts
export interface ChartStrategy {
  // 陽曆→農曆換算、取得年干支、月支、時支、命宮/身宮定位等
  computeMeta(input: ChartMeta): Promise<Required<ChartMeta> & { yearStem: HeavenlyStem; yearBranch: EarthBranch }>;

  // 12 宮（命→父母），含「宮位在 X」之 stem/branch，主/輔星排布，四化飛星（以年干與各宮宮干/星曜規則）
  buildPalaces(meta: Required<ChartMeta> & { yearStem: HeavenlyStem; yearBranch: EarthBranch }): Promise<Record<PalaceName, PalaceSlot>>;

  // 行運：大限/流年/流月/流日/流時 的對應與年份列舉
  attachFortunes(chart: ZwdsChart): Promise<ZwdsChart>;
}
```

### 4.2 預設策略 `NORTH_TRAD`
- **農曆換算**：以可替換的曆法模組（內建演算法或外掛表）。
- **命宮/身宮定位**：依北派規則（以出生月/時、性別、年干支等推算），輸出 `branch` 與（如需）`stem`。
- **主星/輔星排盤**：14 主星（紫微、天機、太陽、武曲、天同、廉貞、天府、太陰、貪狼、巨門、天相、天梁、七殺、破軍）+ 常見輔星（擎羊、陀羅、火星、鈴星、文昌、文曲、左輔、右弼、天魁、天鉞、地空、地劫、天馬…）。以資料表（JSON）驅動。
- **四化**：以 **年干四化表** + **宮干/星曜飛化規則** 產生 `transforms`（例：某宮庚干 → 飛入財帛宮太陽化祿）。
- **大限/流年**：以北派起限法（依性別/順逆/起限度數）換算；回傳每宮 `decadeYears` 與 `flowYears`（可含樣例中年份列）。

> **注意**：起盤算法具流派差異，本專案先以資料表+介面封裝，並以 **「校準用範例」**（見 §7）作驗收；未確定處以 TODO+註解標示，後續由資料表修正，測試即時驗證。

---

## 5. 文本輸出規格（AI 可讀列表）
- 每宮獨立區塊，格式 **與需求範例一致**：
```
【{宮名}：宮位在{stem}{branch}】
大限年份：{YYYY-YYYY}
流年年份：{YYYY,YYYY,...}
主星有：{主星（含旺/廟/…）或「無」}
輔星有：{輔星或「無」}
四化：
．{發射宮}{stem}干飛入{目的宮}{星曜}{化象}
．（逐條列出）
```
- 文件頂部需輸出：性別、陽曆生日、農曆生日（含地支時刻）。

---

## 6. 搜索語法與邏輯（Part B）

### 6.1 語法
- 中文一行：`[發射層+宮][四化][入|沖|照][目的層+宮]`
- 層：`本命|大限|流年|流月|流日|流時`
- 宮：`父母宮|命宮|兄弟宮|夫妻宮|子女宮|財帛宮|疾厄宮|遷移宮|僕役宮|官祿宮|田宅宮|福德宮|身宮|(子|丑|...|亥)宮`
- 四化：`化祿|化權|化科|化忌`

### 6.2 關係定義
- **入**：`transform.to === 目的宮`
- **沖**：`transform.to === 對宮(目的宮)`（對宮對映：子-午、丑-未、寅-申、卯-酉、辰-戌、巳-亥）
- **照**：`transform.to ∈ 三方四正(目的宮)`（含同宮、對宮、兩個三合宮）

### 6.3 行運範圍
- 查詢若含 `大限`/`流年` 等層：引擎需 **逐大限/逐年份** 展開匹配；
- 命中時輸出格式：`{fromBranch}宮{四化} {入|沖|照} {toBranch}宮 ：{大限起訖}大限，{流年}年`（視情況省略大限/流年片段）。

---

## 7. 校準用範例與測試（Acceptance）
> 以使用者提供之樣例作 **金樣**，初期允許以 fixture 生成，以後再以演算法推得相同輸出。

### 7.1 金樣輸入
```json
{
  "sex": "female",
  "solar": "1984-09-19T06:00:00",
  "tz": "Asia/Hong_Kong"
}
```

### 7.2 金樣文本（節錄）
- 文首身份/生日/時辰（見需求）
- 【命宮：宮位在庚午】 ...（與需求提供之各宮塊逐字比對）

### 7.3 測試項目
- `tests/chart.spec.ts`
  - 生成 JSON 與文本；
  - 文本快照比對（Snapshot）；
  - JSON 結構與欄位完整性。
- `tests/search.spec.ts`
  - **例1**：`本命命宮化忌入本命遷移宮` → 顯示 `子宮化忌入午宮`
  - **例2**：`流年夫妻宮化祿照大限官祿宮` → 顯示 `子宮化祿照午宮 ：1998-2007大限，2003年流年`
  - **例3**：`大限命宮化忌沖流年田宅宮` → 顯示 `子宮化忌沖午宮 ：1998-2007大限，2003年流年`
  - **例4**：`流年父母宮化忌沖流年遷移宮` → 顯示 `子宮化忌沖午宮 ：1998-2007大限，2003年流年`

> 初版允許以 fixture（固定映射）保證金樣測試通過；演算法完成後將 fixture 改為動態計算，測試仍須通過。

---

## 8. 任務工作流（你應該怎麼做）
1) **規劃輸出**：提交「實作計劃 + 檔案樹 + 型別定義草案」（本檔已提供，多補充即可）。
2) **M0 — 專案腳手架**：pnpm workspace、ESLint/Prettier、Vitest、Fastify、CI。
3) **M1 — types & 資料表**：`types.ts` + 星曜/四化/對宮/三方四正表、地支序、宮名映射表。
4) **M2 — 文本渲染器**：給定 `ZwdsChart` → 輸出 **精確符合範例** 的文本；Snapshot 測試。
5) **M3 — 搜索引擎**：
   - 解析器：中文查詢 → `SearchQuery`
   - 關係計算：`入/沖/照`
   - 行運展開：逐大限/流年迭代；輸出 `SearchHit` 陣列
6) **M4 — API 層**：`/api/zwds/chart`、`/api/zwds/search`、（可選）`/api/zwds/parse`
7) **M5 — 北派策略初版**：
   - 農曆換算與年干支推算（可以資料表/演算法模組）
   - 命宮/身宮定位、主/輔星排布、四化飛化產生
   - 大限/流年計算（順逆、起限）
   - 以 **金樣** 驗證輸出一致
8) **M6 — 文件化與發佈**：README、OpenAPI 摘要、版本釋出、CHANGELOG。

> **每步提交**：附 `pnpm typecheck && pnpm lint && pnpm test` 輸出重點；PR 模板見 §11。

---

## 9. 重要資料表（置於 `packages/core/src/data/`）
- `stems-branches.json`：十天干、十二地支、對宮映射、三方四正映射
- `palace-order.json`：十二宮循環與對應地支（命→父母）
- `stars.json`：主星/輔星名錄與性質（含旺/廟/得/陷/平/利等標註）
- `transforms-year.json`：**年干四化** 對應星曜（e.g. 甲祿廉貞、…）
- `transforms-palace.json`：**宮干飛化規則**（某宮某干 → 飛入某宮某星化祿/權/科/忌）
- `fixtures/`：金樣輸出所需的對應（初版允許）

> 後續以權威資料修訂表格，測試即反映差異。

---

## 10. 文本渲染（Renderer）
- `renderText(chart: ZwdsChart): string`
- 必須：
  - 文首三行：性別、陽曆生日、農曆生日（含地支時）
  - 12 宮塊按固定順序列印；
  - 無資料時以「無」表示；
  - 四化逐條 `．{發射宮}{stem}干飛入{目的宮}{星曜}{化象}`。

---

## 11. PR 模板（必填）
- 變更摘要：
- 受影響範圍：core/api/cli/docs
- 測試：貼上 `pnpm test --coverage` 摘要（覆蓋率數字）
- 驗收清單：
  - [ ] typecheck 通過
  - [ ] ESLint 0 警告
  - [ ] 文本快照一致
  - [ ] 搜索四例通過
  - [ ] README/CHANGELOG 更新

---

## 12. 安全、效能、國際化
- **安全**：不引入外部金鑰；CLI/HTTP 禁止任意檔案存取。
- **效能**：核心演算純函式、可預計算/快取；單次起盤目標 < 30ms（不含 I/O）。
- **i18n**：文本輸出預設繁體中文，考慮加入 `lang`（zh-TW/zh-CN/en）。

---

## 13. 發佈與整合
- 以 `@zwds/core`、`@zwds/api` 發佈 npm（private/public 依策略）
- API 提供簡明 `OpenAPI` 檔案（examples/zwds.openapi.json）
- GPTs / 其他 Chatbot 可直接呼叫 `/api/zwds/*` 或在工具中引入 SDK。

---

## 14. 快速任務範本（給 Codex 直接用）

### 任務 1：建立專案腳手架
> 在 repo 根目錄建立 monorepo 結構、設定 pnpm workspace、ESLint/Prettier/Vitest、Fastify 骨架與 CI。

**交付**：
- 目錄與 scripts 可運行；
- `pnpm typecheck && pnpm lint && pnpm test` 無錯；
- `/api/health` 回 200。

### 任務 2：型別與資料表
> 完成 `types.ts` 與初版資料表（含對宮/三方四正映射）。

**交付**：
- 單元測試覆蓋所有映射；
- `examples/branches.test.json` 通過。

### 任務 3：文本渲染器
> 依 §5 規格將 `ZwdsChart` 渲染為文本；以 fixture 驗證金樣。

**交付**：
- `renderText` 與 Snapshot 測試通過。

### 任務 4：搜索引擎
> 解析查詢、關係計算、行運展開；通過 §7 的 4 個例子。

**交付**：
- `search.ts`、`parse.ts`、`search.spec.ts` 全綠。

### 任務 5：北派策略初版
> 完成 `NORTH_TRAD`：命/身宮定位、主/輔星與四化飛化生成；大限/流年計算（先以資料表+演算法結合）。

**交付**：
- `strategy-north.ts`；
- 以金樣輸出比對一致；
- 主要函式具備測試（含邊界時刻）。

### 任務 6：API 與文件
> 完成 `/api/zwds/chart`、`/api/zwds/search`；撰寫 README 與 OpenAPI；Examples 腳本。

**交付**：
- `curl` 範例可得與規格一致的輸出；
- README 有「部署到 Vercel/Render/自架」說明。

---

## 15. 其它注意
- **時區與地點**：所有時間以出生地時區計算；輸入需提供 `tz`（IANA）。
- **精度/流派差異**：以策略與資料表分離降低爭議；任何公式未確定處以 TODO 標示並連結測試。
- **可替換曆法模組**：若第三方曆法不可用，內建備援（近年段表）。

> 完成後，請在 PR 說明「本命/大限/流年」的具體起算規則來源（如資料表名/段落），並附上對應測試案例。

