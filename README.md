# mcp-israel-tenders

Israel Government Procurement MCP — public tenders & exemption contracts (keyless).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Israel Tenders data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
