import { LibraryDoc } from "../library-model";

export const kaminoPyDoc: LibraryDoc = {
  id: "kamino-py",
  name: "kamino-py",
  pypiName: "kamino-py",
  version: "0.1.0",
  tagline:
    "Typed Python client for the Kamino Finance public API (Solana lending, vaults, metrics).",
  description:
    "A typed, read-only client for the Kamino Finance public API — Solana lending markets, vaults, oracle prices, and metrics. Sync and async, built on httpx + pydantic v2.",
  category: "Lending",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/kamino-py",
  pypiUrl: "https://pypi.org/project/kamino-py/",
  docsUrl: "https://docs.kamino.finance",
  install: `pip install kamino-py`,
  quickstart: `from kamino import KaminoClient

with KaminoClient() as client:
    markets = client.get_markets()
    for r in client.get_reserve_metrics(markets[0].lending_market)[:5]:
        print(r.liquidity_token, r.supply_apy, r.borrow_apy)
    for p in client.get_oracle_prices(markets="main")[:5]:
        print(p.name, p.price)`,
  features: [
    "Keyless, read-only data layer over the Kamino public API (Solana).",
    "Sync (KaminoClient) and async clients on httpx.",
    "High-precision values kept as strings.",
    "pydantic v2 (extra=allow) for forward-compatibility.",
  ],
  api: [
    {
      title: "KaminoClient / AsyncKaminoClient",
      rows: [
        {
          name: "get_markets()",
          signature: "GET /v2/kamino-market",
          description: "List lending markets.",
        },
        {
          name: "get_market(pubkey)",
          signature: "GET /v2/kamino-market/{pubkey}",
          description: "A single lending market.",
        },
        {
          name: "get_reserve_metrics(pubkey)",
          signature: "GET /kamino-market/{pubkey}/reserves/metrics",
          description: "Per-reserve metrics for a market.",
        },
        {
          name: "get_vaults()",
          signature: "GET /kvaults/vaults",
          description: "List vaults.",
        },
        {
          name: "get_vault(pubkey)",
          signature: "GET /kvaults/vaults/{pubkey}",
          description: "A single vault.",
        },
        {
          name: "get_vault_metrics(pubkey)",
          signature: "GET /kvaults/vaults/{pubkey}/metrics",
          description: "Metrics for a vault.",
        },
        {
          name: "get_oracle_prices(markets)",
          signature: "GET /oracles/prices",
          description: 'Oracle prices (markets = "main" or "all").',
        },
        {
          name: "get_staking_yields()",
          signature: "GET /v2/staking-yields",
          description: "Staking yields.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: keyless and v1 read-only — no transaction building. The base URL defaults to https://api.kamino.finance.",
    'get_oracle_prices accepts only markets="main" (default) or markets="all". Errors raise KaminoError / KaminoAPIError (exposing .status_code and .response_text).',
  ],
};
