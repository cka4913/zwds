# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZWDS API Monorepo (北派紫微斗數) - A TypeScript-based implementation of Northern School Zi Wei Dou Shu (Chinese astrology) chart generation and query system, providing both HTTP API and CLI interfaces.

**Current Status**:
- ✅ Phase 0 Complete - Data tables established (see `PHASE0-SUMMARY.md`)
- ✅ Phase 1 Complete - Core utilities fully implemented (see `PHASE1-COMPLETE.md`)
  - 🎉 **100% tests passing** (51/51 tests)
  - All palace stem calculation issues resolved
- ✅ **Phase 2 Complete** - 14 main stars placement (see `PHASE2-SUMMARY.md`)
  - 🎉 **100% tests passing** (62/62 tests)
  - All 14 main stars positioned correctly with brightness annotations
  - Validated against fixture (1984-09-19 female case)
  - Core algorithms: Ziwei positioning, Tianfu mapping, star system placement
- 🔄 **Phase 3 Next** - Assist stars & Four Transformations
  - Phase 3a: Six auspicious stars (六吉星) + six inauspicious stars (六煞星)
  - Phase 3b: Four Transformations (四化飛星) - year stem & palace stem transformations

**⚠️ Important**: The current `makeChart()` and `renderText()` are **fixture-based stubs** that only work for the gold sample case (1984-09-19). Real algorithm integration is in Phase 3-5.

## Repository Structure

This is a pnpm workspace monorepo with three packages:

- `packages/core`: Core types, chart generation strategy (stub), text renderer, and search engine (stub)
- `packages/api`: Fastify HTTP API server exposing `/api/zwds/chart` and `/api/zwds/search` endpoints
- `packages/cli`: Simple CLI tool for chart generation
- `tests`: Vitest tests including gold sample validation (1984/09/19 06:00 female)

## Common Commands

### Development
```bash
# Install dependencies
pnpm i

# Start API server (default port 3000)
pnpm dev:api

# Run CLI with parameters
pnpm dev:cli -- --solar 1984-09-19T06:00:00 --sex female --tz Asia/Hong_Kong
```

### Building & Testing
```bash
# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Lint (currently allows errors with || true)
pnpm lint

# Run all tests with coverage
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test tests/stars.spec.ts

# Run tests without coverage (faster)
pnpm test --run
```

### Per-package Development
```bash
# Build specific package
pnpm --filter @zwds/core build

# Run specific package in dev mode
pnpm --filter @zwds/api dev
```

## Architecture & Key Concepts

### Core Design Philosophy

The project uses a **strategy pattern** for chart generation algorithms, allowing different schools/traditions to be plugged in. Data is separated from algorithms using JSON data tables in `packages/core/src/data/`.

### Data Tables (✅ Phase 0 Complete)

All astrological rules are stored as JSON data tables in `packages/core/src/data/`:

- **`stems-branches.json`**: 10 Heavenly Stems, 12 Earth Branches, opposites, san-fang-si-zheng mappings
- **`palace-order.json`**: 12 palace names, order, and opposite palaces
- **`transforms-year.json`**: Year stem transformations (化祿/化權/化科/化忌) for all 10 stems
- **`stars-main.json`**: 14 main stars with brightness (旺/廟/得/陷/平/利) for each branch
- **`stars-assist.json`**: Assist stars (吉星/煞星) with brightness tables

Access these through `packages/core/src/data.ts` utilities:
```typescript
import { getOppositeBranch, getYearTransforms, getStarBrightness } from "@zwds/core";
```

See `tests/data.spec.ts` for usage examples and `PHASE0-SUMMARY.md` for complete documentation.

### Phase 1 Utilities (✅ Complete)

**Calendar & Stem-Branch Calculations** (`packages/core/src/calendar.ts`):
- Solar-to-lunar conversion (fixture case supported)
- Year/month/day/hour stem-branch calculations
- ISO datetime parsing

**Palace Positioning** (`packages/core/src/palaces.ts`):
- Life palace (命宮) and body palace (身宮) positioning
- 12-palace arrangement with male-forward/female-reverse rule
- Palace stem calculation based on year stem
- **Key insight**: Female charts use reverse (逆) arrangement: 午→巳→辰...

See `tests/calendar.spec.ts` and `tests/palaces.spec.ts` for usage. `PHASE1-SUMMARY.md` has full validation results showing 100% match with fixture data.

### Phase 2 Main Stars Placement (✅ Complete)

**14 Main Stars Algorithm** (`packages/core/src/stars.ts`):
- Five Element Bureau (五行局) determination from palace stem-branch
- Ziwei star (紫微星) positioning algorithm
- Tianfu star (天府星) position mapping
- Ziwei system stars placement (6 stars, counterclockwise)
- Tianfu system stars placement (8 stars, clockwise)
- Star brightness annotation (旺/廟/得/陷/平/利)

**New Data Tables**:
- `bureau.json`: Complete 60 Jiazi Nayin mapping to Five Element Bureau
- `ziwei-tianfu-map.json`: Fixed position relationships between Ziwei and Tianfu

See `tests/stars.spec.ts` for usage and `PHASE2-SUMMARY.md` for complete algorithm documentation and validation results.

### Key Source Files

**Core Package** (`packages/core/src/`):
- `types.ts` - All TypeScript type definitions (Layer, PalaceName, EarthBranch, HeavenlyStem, etc.)
- `data.ts` - Data table access utilities (20+ helper functions)
- `calendar.ts` - Solar-to-lunar conversion, stem-branch calculations
- `palaces.ts` - Palace positioning, stem calculation, 12-palace arrangement
- `stars.ts` - Main star placement algorithms (Ziwei/Tianfu systems)
- `fixtures-1984f.ts` - Gold sample fixture data (1984-09-19 female case)
- `index.ts` - Main exports and current `makeChart()`/`renderText()` stubs

**Data Tables** (`packages/core/src/data/`):
- `stems-branches.json` - Heavenly Stems, Earth Branches, opposites, san-fang-si-zheng
- `palace-order.json` - 12 palace names and order
- `bureau.json` - 60 Jiazi Nayin to Five Element Bureau mapping
- `ziwei-tianfu-map.json` - Fixed Ziwei-Tianfu position relationships
- `stars-main.json` - 14 main stars with brightness tables
- `stars-assist.json` - Assist stars with brightness tables
- `transforms-year.json` - Year stem Four Transformations

**Test Files** (`tests/`):
- `data.spec.ts` - Data table utility tests (15 tests)
- `calendar.spec.ts` - Calendar conversion tests (20 tests)
- `palaces.spec.ts` - Palace positioning tests (15 tests)
- `stars.spec.ts` - Main star placement tests (11 tests)
- `chart.spec.ts` - Gold sample integration test (1 test)

### Type System (`packages/core/src/types.ts`)

The core domain model includes:

- **Layer** (層): 本命 (natal), 大限 (decade), 流年 (year), 流月 (month), 流日 (day), 流時 (hour)
- **PalaceName** (宮位): 12 palaces (命宮, 兄弟宮, 夫妻宮, etc.)
- **EarthBranch** (地支): 12 branches (子丑寅卯辰巳午未申酉戌亥)
- **HeavenlyStem** (天干): 10 stems (甲乙丙丁戊己庚辛壬癸)
- **Transform** (四化): 化祿, 化權, 化科, 化忌
- **Relation** (關係): 入 (direct), 沖 (opposition), 照 (three-sided-four-aligned)

### Current Implementation Status

**IMPORTANT**: As of now, the implementation uses **fixtures** (hardcoded data) for the gold sample case (1984/09/19 06:00 female, Asia/Hong_Kong timezone). The real algorithms are stubs:

- `packages/core/src/index.ts`: `makeChart()` and `renderText()` only work for the exact fixture case
- `packages/core/src/fixtures-1984f.ts`: Contains the hardcoded FIXTURE_1984F_TEXT
- The search API endpoint returns placeholder data

### Text Output Format

The text renderer (`renderText()`) produces AI-readable output with this structure per palace:

```
【{宮名}：宮位在{stem}{branch}】
大限年份：{YYYY-YYYY}
流年年份：{YYYY,YYYY,...}
主星有：{stars or "無"}
輔星有：{assist stars or "無"}
四化：
．{發射宮}{stem}干飛入{目的宮}{星曜}{化象}
```

### API Endpoints

**POST** `/api/zwds/chart`
- Input: `{ sex, solar, tz, output?: { text?, json? } }`
- Output: `{ meta, chart?, text? }` depending on output flags
- Currently only works with fixture parameters

**POST** `/api/zwds/search`
- Input: `{ chartInput, queries[], options? }`
- Output: `{ hits[], text? }`
- Currently returns stub/placeholder

**GET** `/api/health`
- Health check endpoint returning `{ ok: true }`

### Search Query Logic (Planned)

Search queries follow the pattern: `[发射层+宫][四化][入|冲|照][目的层+宫]`

Relations defined as:
- **入** (direct): transform.to === target palace
- **沖** (opposition): transform.to === opposite palace (子-午, 丑-未, 寅-申, 卯-酉, 辰-戌, 巳-亥)
- **照** (three-sided-four-aligned): transform.to ∈ san-fang-si-zheng of target palace

## Development Guidance

### When Implementing New Features

1. **Always reference AGENTS.md** for detailed specifications - it serves as the complete implementation plan, task template, and acceptance criteria
2. **Maintain the data/algorithm separation**: Use JSON data tables in `packages/core/src/data/` for astrological rules
3. **Update tests**: The gold sample test in `tests/chart.spec.ts` validates against `FIXTURE_1984F_TEXT`
4. **Coverage targets**: Aim for ≥85% line coverage (≥90% for critical modules)

### Algorithm Implementation Priority (per AGENTS.md §8)

The phased implementation approach:
1. ✅ **Phase 0: Data tables foundation** (COMPLETED)
   - 5 JSON data tables with astrological rules
   - 20+ utility functions for data access
   - See `PHASE0-SUMMARY.md`

2. ✅ **Phase 1: Core utilities** (COMPLETED)
   - Calendar conversion & stem-branch calculations
   - Palace positioning with male/female rules
   - 100% validation against fixture
   - See `PHASE1-SUMMARY.md`

3. ✅ **Phase 2: Main star placement** (COMPLETED)
   - Main 14 stars (紫微/天府 systems)
   - Five Element Bureau (五行局) determination
   - Ziwei/Tianfu positioning algorithms
   - Star brightness annotation
   - See `PHASE2-SUMMARY.md` for details

4. **Phase 3a: Assist star placement** (NEXT)
   - Six auspicious stars (六吉星): 文昌、文曲、左輔、右弼、天魁、天鉞
   - Six inauspicious stars (六煞星): 擎羊、陀羅、火星、鈴星、地空、地劫
   - Additional assist stars: 祿存、天馬、天刑、天姚, etc.

5. **Phase 3b: Four Transformations**
   - Year stem transformations (年干四化)
   - Palace stem transformations (宮干飛化)
   - Transform tracking (化祿/化權/化科/化忌)

6. **Phase 4: Fortune timing**
   - Decade (大限) calculations
   - Annual (流年) calculations
   - Starting age by Five Element Bureau

7. **Phase 5: Text renderer**
   - Replace fixture-based renderText()
   - Dynamic text generation from chart data

8. **Phase 6: Search engine**
   - Query parser (中文→SearchQuery)
   - Relation calculator (入/沖/照)
   - Multi-layer search

9. **Phase 7: Integration & optimization**
   - Replace makeChart() stub
   - Performance optimization (<30ms target)
   - Documentation & examples

### Testing Philosophy

- Use Vitest for all tests
- Gold sample validation: `tests/chart.spec.ts` ensures output matches `FIXTURE_1984F_TEXT` exactly
- Initially fixtures are acceptable; later replace with algorithmic calculation that produces identical output
- Run `pnpm test --coverage` to check coverage meets thresholds
- Each phase has dedicated test files that should maintain 100% passing rate

### Common Development Workflows

**Adding a new algorithm function**:
1. Define types in `types.ts` if needed
2. Create the function in appropriate module (`calendar.ts`, `palaces.ts`, `stars.ts`, etc.)
3. Add comprehensive unit tests in corresponding test file
4. Export from `index.ts` if it's part of the public API
5. Run `pnpm typecheck && pnpm lint && pnpm test` to verify
6. Update relevant PHASE-SUMMARY.md documentation

**Debugging a failed test**:
1. Run the specific test file: `pnpm test tests/[filename].spec.ts`
2. Check test output for expected vs actual values
3. For gold sample mismatches, compare against fixture data in `fixtures-1984f.ts`
4. Use `console.log()` in test or source for debugging (Vitest shows console output)
5. Verify data tables in `packages/core/src/data/` have correct values

**Validating against gold sample**:
- Input: Female, 1984-09-19 06:00, Asia/Hong_Kong timezone
- Expected lunar: 1984-08-24 06:00 (卯時)
- Life palace: 庚午 (stem=庚, branch=午)
- All outputs must match `FIXTURE_1984F_TEXT` exactly
- Any deviation indicates algorithm error or data table issue

### Code Style

- TypeScript 5.x with strict type checking
- ESLint configured (currently lint errors are allowed)
- Use ES modules (`"type": "module"` in all package.json)
- Prefer pure functions in core package
- API layer should contain no business logic (call `@zwds/core` only)

### Key Algorithm Relationships

Understanding how the pieces fit together:

1. **Birth Data → Calendar Layer**:
   - Solar datetime + timezone → Lunar datetime conversion
   - Extract year/month/day/hour stems and branches
   - Year stem is critical for Four Transformations

2. **Calendar + Sex → Palace Layer**:
   - Life palace positioning: month + birth hour → branch position
   - Body palace positioning: month + birth hour → branch position
   - Palace stem calculation: year stem + palace branch → each palace's stem
   - Male: clockwise (順), Female: counterclockwise (逆) arrangement

3. **Palace + Lunar Day → Star Layer**:
   - Life palace stem + branch → Five Element Bureau (五行局) via Nayin
   - Bureau + lunar day → Ziwei star position (complex algorithm)
   - Ziwei position → Tianfu position (fixed mapping)
   - Ziwei position → 6 Ziwei system stars (counterclockwise)
   - Tianfu position → 8 Tianfu system stars (clockwise)
   - Each star + branch → brightness status (旺/廟/得/陷/平/利)

4. **Year Stem + Palace Stems → Transformation Layer** (Phase 3b):
   - Year stem → 4 star transformations (化祿/化權/化科/化忌)
   - Each palace stem → 4 star transformations from that palace
   - Track: from palace → to palace → star → transformation type

5. **Bureau → Fortune Timing Layer** (Phase 4):
   - Five Element Bureau → starting age for decades
   - Decade calculations: 10-year periods per palace
   - Annual calculations: which years correspond to which palace

### Important Constraints from AGENTS.md

- **No unsubstantiated mystical inference** - all algorithms must be based on verified rules
- **Timezone awareness**: All calculations use birth location timezone (IANA format)
- **Performance target**: Single chart generation < 30ms (excluding I/O)
- **Northern School specific**: This implementation follows 北派 (Northern School) rules, not Southern School
- **Data-driven**: All astrological rules stored in JSON tables, algorithms reference these tables

### Testing with Known Data

The gold sample parameters are:
```json
{
  "sex": "female",
  "solar": "1984-09-19T06:00:00",
  "tz": "Asia/Hong_Kong"
}
```

Expected lunar conversion: `1984-08-24T06:00:00`

### Adding New Chart Strategies

Implement the `ChartStrategy` interface (defined in AGENTS.md §4.1):
- `computeMeta()`: Solar-to-lunar conversion, year stem/branch calculation
- `buildPalaces()`: 12-palace construction with stems, branches, stars, and transforms
- `attachFortunes()`: Decade/year/month/day/hour timing calculations

## Multi-language Context

This project mixes Chinese and English:
- Documentation and specifications are primarily in Traditional Chinese
- Code comments may be in Chinese for domain-specific concepts
- API I/O includes Chinese text output for palace names and astrological terms
- Keep English for technical/programming terms, Chinese for domain terminology
