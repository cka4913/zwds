import Fastify from "fastify";
import { makeChart, renderText } from "@zwds/core";
import type { ChartMeta } from "@zwds/core/src/types";

const app = Fastify();

app.get("/api/health", async () => ({ ok: true }));

app.post("/api/zwds/chart", async (req, reply) => {
  const body = (req.body ?? {}) as Partial<ChartMeta> & { output?: { text?: boolean; json?: boolean } };
  const meta = {
    sex: body.sex ?? "female",
    solar: body.solar ?? "1984-09-19T06:00:00"
  } as ChartMeta;
  const chart = makeChart(meta);
  const res: any = { meta: chart.meta };
  if (!body.output || body.output.json) (res as any).chart = chart;
  if (!body.output || body.output.text) (res as any).text = renderText(chart);
  return res;
});

app.post("/api/zwds/search", async (req, reply) => {
  return { hits: [], text: "（搜索尚未實作）" };
});

const port = Number(process.env.PORT || 3000);
app.listen({ port, host: "0.0.0.0" })
  .then(() => console.log(`ZWDS API listening on :${port}`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });