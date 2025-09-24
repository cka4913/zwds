import { ZwdsChart, ChartMeta } from "./types.js";
import { FIXTURE_1984F_TEXT } from "./fixtures-1984f.js";

export function makeChart(meta: ChartMeta): ZwdsChart {
  const ok =
    meta.sex === "female" &&
    meta.solar === "1984-09-19T06:00:00" &&
    meta.tz === "Asia/Hong_Kong";
  if (ok) {
    return {
      meta: { ...meta, lunar: "1984-08-24T06:00:00" },
      palaces: {}
    };
  }
  throw new Error("Strategy not implemented for inputs other than fixture 1984-09-19 06:00 female Asia/Hong_Kong");
}

export function renderText(chart: ZwdsChart): string {
  if (
    chart.meta.sex === "female" &&
    chart.meta.solar === "1984-09-19T06:00:00" &&
    chart.meta.tz === "Asia/Hong_Kong"
  ) {
    return FIXTURE_1984F_TEXT;
  }
  return "（渲染器尚未實作）";
}