import { makeChart, renderText } from "@zwds/core";

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i];
  const v = process.argv[i + 1];
  if (k && v) args.set(k.replace(/^--/, ""), v);
}
const sex = (args.get("sex") || "female") as any;
const solar = args.get("solar") || "1984-09-19T06:00:00";
const tz = args.get("tz") || "Asia/Hong_Kong";

const chart = makeChart({ sex, solar, tz });
console.log(renderText(chart));