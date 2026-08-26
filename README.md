# mcp-israel-tenders

Israel Government Procurement MCP — public tenders & exemption contracts (keyless).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `israel_search_tenders` | Search Israeli government competitive tenders (מכרזים) from the official Government Procurement Administration dataset on data.gov.il. Returns each tender's publication number, name, publishing ministry and unit, procedure type, status, publication/closing dates, winning supplier, and subject area. Pass a free-text query (Hebrew or matching text) to filter, e.g. "בריאות" (health) or a ministry name; omit to browse the most recent records. |
| `israel_search_exemptions` | Search Israeli government exemption contracts and non-competitive procurement (התקשרויות בפטור והליכים תחרותיים) from the official Government Procurement Administration dataset on data.gov.il. Returns each contract's publication number, name, publishing ministry and unit, exemption regulation (תקנה), status, decision essence, approver, dates, supplier, monetary amount, currency, and subject. Pass a free-text query (Hebrew or matching text) to filter; omit to browse the most recent records. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "israel-tenders": {
      "url": "https://gateway.pipeworx.io/israel-tenders/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/israel-tenders/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Israel Tenders data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
