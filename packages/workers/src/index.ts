import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { makeChart, renderText } from '@zwds/core';
import type { ChartMeta } from '@zwds/core';

const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ ok: true });
});

// Chart generation endpoint
app.post('/api/zwds/chart', async (c) => {
  try {
    const body = await c.req.json<Partial<ChartMeta> & { output?: { text?: boolean; json?: boolean } }>();

    const meta: ChartMeta = {
      sex: body.sex ?? 'female',
      solar: body.solar ?? '1984-09-19T06:00:00',
      tz: body.tz
    };

    const chart = makeChart(meta);
    const res: any = { meta: chart.meta };

    // Add chart JSON if requested (default: true)
    if (!body.output || body.output.json !== false) {
      res.chart = chart;
    }

    // Add text output if requested (default: true)
    if (!body.output || body.output.text !== false) {
      res.text = renderText(chart);
    }

    return c.json(res);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Search endpoint (placeholder)
app.post('/api/zwds/search', async (c) => {
  return c.json({ hits: [], text: '（搜索尚未實作）' });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'ZWDS API',
    version: '0.1.0',
    endpoints: {
      health: 'GET /api/health',
      chart: 'POST /api/zwds/chart',
      search: 'POST /api/zwds/search'
    }
  });
});

export default app;
