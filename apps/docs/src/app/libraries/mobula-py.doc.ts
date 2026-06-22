import { LibraryDoc } from "../library-model";

export const mobulaPyDoc: LibraryDoc = {
  id: "mobula-py",
  name: "mobula-py",
  pypiName: "mobula-py",
  version: "0.1.0",
  tagline:
    "A typed, modern Python client for the Mobula API (multi-chain market & on-chain data).",
  description:
    "A typed, modern client for the Mobula API — multi-chain market data, metadata, history, and wallet/portfolio data. Sync and async, with auto retry/backoff, built on httpx + pydantic v2.",
  category: "Market Data",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/mobula-py",
  pypiUrl: "https://pypi.org/project/mobula-py/",
  docsUrl: "https://docs.mobula.io",
  install: `pip install mobula-py`,
  quickstart: `from mobula import MobulaClient

with MobulaClient(api_key="your-api-key") as client:
    btc = client.get_market_data(asset="Bitcoin")
    print(btc.price, btc.market_cap)
    pf = client.get_wallet_portfolio(wallet="0x...")
    print(pf.total_wallet_balance)`,
  features: [
    "Sync (MobulaClient) and async clients on httpx.",
    "Market data + metadata + history + wallet/portfolio + transactions.",
    "Optional api_key (raw Authorization header).",
    "Auto retry/backoff on 429 and 5xx.",
    "pydantic v2 (extra=allow) for forward-compatibility.",
  ],
  api: [
    {
      title: "MobulaClient / AsyncMobulaClient",
      rows: [
        {
          name: "get_market_data(...)",
          signature: "GET /market/data",
          description: "Market data for a single asset.",
        },
        {
          name: "get_multi_market_data(...)",
          signature: "GET /market/multi-data",
          description: "Market data for multiple assets.",
        },
        {
          name: "get_metadata(...)",
          signature: "GET /metadata",
          description: "Asset metadata.",
        },
        {
          name: "get_market_history(...)",
          signature: "GET /market/history",
          description: "Historical market data.",
        },
        {
          name: "get_blockchains()",
          signature: "GET /market/blockchains",
          description: "Supported blockchains.",
        },
        {
          name: "get_wallet_portfolio(...)",
          signature: "GET /wallet/portfolio",
          description: "Portfolio for a wallet.",
        },
        {
          name: "get_wallet_transactions(...)",
          signature: "GET /wallet/transactions",
          description: "Transactions for a wallet.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: api_key is optional and sent as a raw `Authorization: <key>` header (no Bearer prefix). Without a key the demo tier is rate-limited (429). The base URL defaults to https://api.mobula.io/api/1.",
    "Errors raise MobulaError / MobulaAPIError / MobulaAuthError / MobulaRateLimitError (exposing .retry_after).",
  ],
};
