interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Israel Government Procurement MCP — public tenders & exemption contracts (keyless).
 *
 * Wraps the Israeli open-data portal data.gov.il (CKAN datastore_search) for the
 * Government Procurement Administration (מנהל הרכש הממשלתי). Two official datasets:
 *   - Competitive tenders   — "דוח מכרזים"        resource 7038b3e6-a74d-442e-b16b-466c8196124a
 *   - Exemption contracts   — "דוח התקשרויות בפטור והליכים תחרותיים"
 *                                                 resource 65c8fced-c50c-400e-94fb-ef1a208c43e5
 *
 * Keyless. All tools return shaped, LLM-friendly objects (English keys; Hebrew
 * values passed through) and never throw — failures resolve to { error }.
 */


const BASE = 'https://data.gov.il/api/3/action';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const TENDERS_RESOURCE = '7038b3e6-a74d-442e-b16b-466c8196124a';
const EXEMPTIONS_RESOURCE = '65c8fced-c50c-400e-94fb-ef1a208c43e5';

const tools: McpToolExport['tools'] = [
  {
    name: 'israel_search_tenders',
    description:
      "Search Israeli government competitive tenders (מכרזים) from the official Government Procurement Administration dataset on data.gov.il. Returns each tender's publication number, name, publishing ministry and unit, procedure type, status, publication/closing dates, winning supplier, and subject area. Pass a free-text query (Hebrew or matching text) to filter, e.g. \"בריאות\" (health) or a ministry name; omit to browse the most recent records.",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text search across all fields (Hebrew works best), e.g. a ministry, subject, or supplier name. Omit to browse.' },
        limit: { type: ['number', 'string'], description: 'Max records to return (default 20, max 100).' },
        offset: { type: ['number', 'string'], description: 'Number of records to skip for pagination (default 0).' },
      },
    },
  },
  {
    name: 'israel_search_exemptions',
    description:
      "Search Israeli government exemption contracts and non-competitive procurement (התקשרויות בפטור והליכים תחרותיים) from the official Government Procurement Administration dataset on data.gov.il. Returns each contract's publication number, name, publishing ministry and unit, exemption regulation (תקנה), status, decision essence, approver, dates, supplier, monetary amount, currency, and subject. Pass a free-text query (Hebrew or matching text) to filter; omit to browse the most recent records.",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text search across all fields (Hebrew works best), e.g. a ministry, supplier, or subject. Omit to browse.' },
        limit: { type: ['number', 'string'], description: 'Max records to return (default 20, max 100).' },
        offset: { type: ['number', 'string'], description: 'Number of records to skip for pagination (default 0).' },
      },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  try {
    switch (name) {
      case 'israel_search_tenders':
        return await searchTenders(args);
      case 'israel_search_exemptions':
        return await searchExemptions(args);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

async function searchTenders(args: Record<string, unknown>): Promise<unknown> {
  const { records, total, limit, offset } = await datastoreSearch(TENDERS_RESOURCE, args);
  const tenders = records.map((r) => ({
    id: r['מספר פרסום'] ?? r['_id'],
    procedure_number: r['מספר הליך'] ?? null,
    title: r['שם הליך'] ?? null,
    ministry: r['שם המשרד'] ?? null,
    publishing_unit: r['שם יחידה מפרסמת'] ?? null,
    procedure_type: r['סוג הליך'] ?? null,
    status: r['סטטוס'] ?? null,
    publish_date: r['תאריך פרסום'] ?? null,
    update_date: r['תאריך עדכון'] ?? null,
    close_date: r['תאריך אחרון להגשת השגות'] ?? null,
    winning_supplier: r['שם ספק זוכה'] ?? null,
    contract_start: r['תאריך תחילת תקופת התקשרות'] ?? null,
    contract_end: r['תאריך סיום תקופת התקשרות'] ?? null,
    subject: r['נושאים'] ?? null,
  }));
  return { source: 'data.gov.il — דוח מכרזים (Government Procurement Administration)', total, limit, offset, count: tenders.length, tenders };
}

async function searchExemptions(args: Record<string, unknown>): Promise<unknown> {
  const { records, total, limit, offset } = await datastoreSearch(EXEMPTIONS_RESOURCE, args);
  const exemptions = records.map((r) => ({
    id: r['מספר פרסום'] ?? r['_id'],
    procedure_number: r['מספר הליך'] ?? null,
    title: r['שם הליך'] ?? null,
    ministry: r['שם המשרד'] ?? null,
    publishing_unit: r['שם יחידה מפרסמת'] ?? null,
    procedure_type: r['סוג הליך'] ?? null,
    regulation: r['תקנה'] ?? null,
    status: r['סטטוס'] ?? null,
    decision: r['מהות החלטה'] ?? null,
    approver: r['גורם מאשר'] ?? null,
    publish_date: r['תאריך פרסום'] ?? null,
    update_date: r['תאריך עדכון'] ?? null,
    supplier: r['שם ספק'] ?? null,
    amount: r['היקף כספי'] ?? null,
    currency: r['מטבע'] ?? null,
    contract_start: r['תאריך תחילת תקופת התקשרות'] ?? null,
    contract_end: r['תאריך סיום תקופת התקשרות'] ?? null,
    subject: r['נושאים'] ?? null,
  }));
  return { source: 'data.gov.il — דוח התקשרויות בפטור והליכים תחרותיים (Government Procurement Administration)', total, limit, offset, count: exemptions.length, exemptions };
}

async function datastoreSearch(
  resourceId: string,
  args: Record<string, unknown>,
): Promise<{ records: Record<string, any>[]; total: number; limit: number; offset: number }> {
  const limit = clampInt(args.limit, 20, 1, 100);
  const offset = clampInt(args.offset, 0, 0, 1_000_000);
  const params = new URLSearchParams({
    resource_id: resourceId,
    limit: String(limit),
    offset: String(offset),
  });
  const q = strArg(args.query);
  if (q) params.set('q', q);
  const data = (await ckanGet(`/datastore_search?${params.toString()}`)) as {
    success?: boolean;
    result?: { records?: Record<string, any>[]; total?: number };
  };
  if (data.success === false) throw new Error('data.gov.il datastore_search returned success=false');
  const result = data.result ?? {};
  return { records: result.records ?? [], total: result.total ?? 0, limit, offset };
}

async function ckanGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) {
    const body = await res.text().then((t) => t.slice(0, 200)).catch(() => '');
    throw new Error(`data.gov.il: ${res.status} ${body}`.trim());
  }
  return res.json();
}

function strArg(v: unknown): string | undefined {
  if (typeof v === 'string') {
    const t = v.trim();
    return t ? t : undefined;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return undefined;
}

function clampInt(v: unknown, def: number, min: number, max: number): number {
  let n: number;
  if (typeof v === 'number' && Number.isFinite(v)) n = Math.floor(v);
  else if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) n = Math.floor(Number(v));
  else return def;
  return Math.min(max, Math.max(min, n));
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
