import { LibraryDoc } from "../library-model";

export const meteoraPyDoc: LibraryDoc = {
  id: "meteora-py",
  name: "meteora-py",
  pypiName: "meteora-py",
  version: "0.1.0",
  tagline: "Typed, read-only client for the Meteora DLMM Data API on Solana.",
  description:
    "A typed, read-only client for the Meteora DLMM Data API on Solana — list liquidity pools, read per-pool metrics (TVL, volume, fees, APR/APY), browse token-pair pool groups, and pull OHLCV candles and historical volume. Sync and async, built on httpx + pydantic v2.",
  category: "AMM",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/meteora-py",
  pypiUrl: "https://pypi.org/project/meteora-py/",
  docsUrl: "https://docs.meteora.ag",
  install: `pip install meteora-py`,
  quickstart: `from meteora import MeteoraClient

with MeteoraClient() as client:
    # Protocol-wide aggregates
    stats = client.get_protocol_metrics()
    print(f"TVL \${stats.total_tvl:,.0f} across {stats.total_pools:,} pools")

    # Page through pools (sorted server-side; sort_by is "<field>:<asc|desc>")
    page = client.get_pools(page=1, page_size=10, sort_by="tvl:desc")
    for pool in page.data:
        print(f"{pool.name:16} TVL \${pool.tvl:,.0f}  APR {pool.apr:.2%}")

    # A single pool by its on-chain address
    sol_usdc = client.get_pool("5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6")
    print(sol_usdc.token_x.symbol, sol_usdc.token_y.symbol, sol_usdc.current_price)

    # OHLCV candles and historical volume
    candles = client.get_pool_ohlcv(sol_usdc.address)
    history = client.get_pool_volume_history(sol_usdc.address)
    print(candles.data[-1].close, history.data[-1].fees)`,
  features: [
    "Sync (MeteoraClient) and async (AsyncMeteoraClient) clients on httpx.",
    "Read-only coverage of the DLMM Data API; it does not build or sign transactions.",
    "pydantic v2 models (extra=allow) for forward-compatibility as the API evolves.",
    "Offset pagination over pools and pool groups with server-side sorting.",
    "OHLCV candles and historical volume per pool.",
  ],
  api: [
    {
      title: "MeteoraClient / AsyncMeteoraClient",
      rows: [
        {
          name: "get_protocol_metrics()",
          signature: "GET /stats/protocol_metrics",
          description: "Protocol-wide aggregates (total TVL, pool count).",
        },
        {
          name: "get_pools(page, page_size, query, sort_by, filter_by)",
          signature: "GET /pools",
          description:
            'Page through pools; sort_by is a "<field>:<asc|desc>" expression.',
        },
        {
          name: "get_pool(address)",
          signature: "GET /pools/{address}",
          description: "A single pool by its on-chain address.",
        },
        {
          name: "get_pool_groups(page, page_size)",
          signature: "GET /pools/groups",
          description: "Browse token-pair pool groups.",
        },
        {
          name: "get_pool_ohlcv(address, from_, to, resolution)",
          signature: "GET /pools/{address}/ohlcv",
          description: "OHLCV candles for a pool.",
        },
        {
          name: "get_pool_volume_history(address)",
          signature: "GET /pools/{address}/volume/history",
          description: "Historical volume for a pool.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: the Meteora DLMM Data API is public and keyless (rate-limited to 30 requests/second). base_url defaults to https://dlmm.datapi.meteora.ag and is configurable to any compatible endpoint.",
    'sort_by must be a "<field>:<asc|desc>" expression (e.g. "tvl:desc"); a bare field name is rejected with HTTP 400. filter_by is a "<field>:<value>" filter passed through verbatim. Errors raise MeteoraAPIError (a subclass of MeteoraError) exposing .status_code and .message.',
  ],
};
