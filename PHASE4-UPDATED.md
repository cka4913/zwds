# Phase 4 更新：修正流年计算逻辑

## 问题发现

原先的流年计算逻辑错误：
- ❌ 错误实现：根据年龄从命宫开始顺逆走（类似大限的逻辑）
- ✅ 正确实现：根据年份的地支直接定位到对应宫位

## 修正内容

### 核心概念

**流年定位规则**：
- 流年取决于**该年的地支**，与年龄、性别无关
- 例如：2025年是乙巳年，所有人的流年都在命盘中"巳"地支所在的宫位
- 每个宫位每12年轮到一次流年（因为地支12年一个周期）

### 代码修改

#### 1. 新增 `getYearBranch()` 函数

```typescript
export function getYearBranch(year: number): EarthBranch {
  // 1984年是甲子年，地支为子（index=0）
  const baseYear = 1984;
  const offset = (year - baseYear) % 12;
  const branchIndex = (offset + 12) % 12;
  return getBranchByIndex(branchIndex);
}
```

根据年份计算该年的地支：
- 基准：1984年 = 甲子年（子=0）
- 地支按12年循环

#### 2. 重写 `getAnnualPalace()` 函数

```typescript
export function getAnnualPalace(
  currentYear: number,
  palaceBranches: Record<PalaceName, EarthBranch>
): PalaceName {
  // 获取该年份的地支
  const yearBranch = getYearBranch(currentYear);

  // 找到该地支对应的宫位
  for (const palaceName of palaces) {
    if (palaceBranches[palaceName] === yearBranch) {
      return palaceName;
    }
  }

  return "命宮";
}
```

直接根据年份地支找到对应的宫位。

#### 3. 重写 `getAnnualYearsForPalace()` 函数

```typescript
export function getAnnualYearsForPalace(
  palaceBranch: EarthBranch,
  birthYear: number,
  maxYears: number = 12
): number[] {
  // 根据宫位的地支，找出所有该地支对应的年份
  // 例如：宫位在"巳"，则返回所有巳年（2025, 2037, 2049...和2013, 2001, 1989...）

  const palaceBranchIndex = getBranchIndex(palaceBranch);
  const birthYearBranch = getYearBranch(birthYear);
  const birthYearBranchIndex = getBranchIndex(birthYearBranch);

  // 计算从出生年到目标地支的偏移
  let offset = (palaceBranchIndex - birthYearBranchIndex + 12) % 12;
  if (offset === 0 && birthYearBranch !== palaceBranch) {
    offset = 12;
  }

  // 找到第一个该地支的年份（>=出生年）
  const firstYear = birthYear + offset;

  // 生成前后的年份（12个周期）
  const halfYears = Math.floor(maxYears / 2);
  for (let i = -halfYears; i < maxYears - halfYears; i++) {
    const year = firstYear + i * 12;
    if (year > 1900 && year < 2200) {
      years.push(year);
    }
  }

  return years.sort((a, b) => a - b);
}
```

根据宫位的地支，计算所有该地支对应的年份。

## 验证结果

### 2025年（乙巳年）验证

所有命盘中"巳"地支所在的宫位，流年都包含2025年：

**案例1（1984女命）**：
- 兄弟宫在巳 → 流年：1917, 1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, **2025**, 2037, 2049 ✓

**案例2（1975男命）**：
- 父母宫在巳 → 流年：1905, 1917, 1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, **2025**, 2037 ✓

**案例3（1976男命）**：
- 疾厄宫在巳 → 流年：1905, 1917, 1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, **2025**, 2037 ✓

### 2026年（丙午年）验证

所有命盘中"午"地支所在的宫位，流年都包含2026年：

**案例1（1984女命）**：
- 命宫在午 → 流年：1918, 1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, **2026**, 2038, 2050 ✓

**案例3（1976男命）**：
- 财帛宫在午 → 流年：1906, 1918, 1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, **2026**, 2038 ✓

## 地支年份对照表

以1984年（甲子年）为基准：

| 地支 | Index | 年份举例 |
|------|-------|----------|
| 子   | 0     | 1984, 1996, 2008, 2020, 2032 |
| 丑   | 1     | 1985, 1997, 2009, 2021, 2033 |
| 寅   | 2     | 1986, 1998, 2010, 2022, 2034 |
| 卯   | 3     | 1987, 1999, 2011, 2023, 2035 |
| 辰   | 4     | 1988, 2000, 2012, 2024, 2036 |
| **巳** | **5** | **1989, 2001, 2013, 2025, 2037** |
| 午   | 6     | 1990, 2002, 2014, 2026, 2038 |
| 未   | 7     | 1991, 2003, 2015, 2027, 2039 |
| 申   | 8     | 1992, 2004, 2016, 2028, 2040 |
| 酉   | 9     | 1993, 2005, 2017, 2029, 2041 |
| 戌   | 10    | 1994, 2006, 2018, 2030, 2042 |
| 亥   | 11    | 1995, 2007, 2019, 2031, 2043 |

## 显示更新

- 每个宫位现在显示12个流年年份（前后各6个周期）
- 格式：`流年年份：YYYY,YYYY,YYYY,....<如此類推>....`

## 与大限的区别

| 特征 | 大限 | 流年 |
|------|------|------|
| 周期 | 10年 | 1年 |
| 计算依据 | 五行局 + 阴阳男女 | 年份地支 |
| 起始点 | 命宫 | 当年地支所在宫位 |
| 方向 | 阳男阴女顺，阴男阳女逆 | 无方向，直接定位 |
| 个人差异 | 同年出生不同性别不同 | 同年所有人相同 |

## 关键发现

1. **流年是全局的**：2025年（乙巳年），所有人的流年都在各自命盘的"巳"宫
2. **流年与年龄无关**：不需要计算虚岁或从命宫顺逆走
3. **流年只看地支**：天干虽然也变化，但流年定位只看地支
4. **每12年循环一次**：同一宫位每隔12年轮到一次流年

## 文件变更

### 修改
- `packages/core/src/fortune.ts` - 完全重写流年计算逻辑
- `packages/core/src/index.ts` - 更新流年函数调用和显示格式

### 测试
所有测试案例通过，流年年份正确对应地支。

## 下一步

✅ Phase 4 大限和流年计算已完成并修正
- ✅ 大限计算正确（根据五行局和阴阳男女）
- ✅ 流年计算正确（根据年份地支定位）
- ✅ 所有测试案例验证通过

可以继续下一阶段的开发。
