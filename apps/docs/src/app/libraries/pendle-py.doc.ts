import { LibraryDoc } from "../library-model";

export const pendlePyDoc: LibraryDoc = {
  id: "pendle-py",
  name: "pendle-py",
  pypiName: "pendle-py",
  version: "0.1.0",
  tagline: "Typed client for the Pendle Finance v2 yield API (PT/YT/SY/LP).",
  description:
    "A typed client for the Pendle Finance v2 API — read PT/YT/SY/LP markets, asset metadata and APY history, and build swap / liquidity / mint / redeem calldata. Sync and async, with full type hints, built on httpx + pydantic v2.",
  category: "Lending",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/pendle-py",
  pypiUrl: "https://pypi.org/project/pendle-py/",
  docsUrl: "https://api-v2.pendle.finance/core/docs",
  install: `pip install pendle-py
# optional signing/broadcasting helpers:
pip install "pendle-py[exec]"`,
  quickstart: `from pendle import PendleClient
from pendle.constants import ChainId

with PendleClient() as client:
    # List active Ethereum markets with their implied APY
    active = client.get_active_markets(ChainId.ETHEREUM)
    for m in active.markets[:5]:
        implied = (m.details.implied_apy or 0) * 100
        print(f"{m.name:<12} implied APY {implied:5.2f}%")

    # Build swap calldata: spend SY -> receive PT
    market = client.get_markets(ChainId.ETHEREUM, limit=1).results[0]
    resp = client.swap(
        ChainId.ETHEREUM,
        token_in=market.sy.address,
        amount_in="1000000000000000000",   # 1.0 (18 decimals), in wei
        token_out=market.pt.address,
        receiver="0xYourAddress",
        slippage=0.01,                      # 1%
    )
    print(resp.action)                      # "swap"
    tx = resp.routes[0].tx                  # unsigned tx to sign & broadcast
    print(tx.to, tx.data, tx.value)`,
  features: [
    "Sync (PendleClient) and async (AsyncPendleClient) clients on httpx.",
    "Read PT/YT/SY/LP markets, asset metadata, and APY history.",
    "Build swap / liquidity / mint / redeem calldata via the unified convert() endpoint.",
    "convert() is Pendle's universal calldata route; named wrappers infer the action from the tokens.",
    "pydantic v2 type hints (py.typed); chain-id args accept int or ChainId.",
    "Optional [exec] extra: web3.py for signing and broadcasting.",
  ],
  api: [
    {
      title: "PendleClient / AsyncPendleClient",
      rows: [
        {
          name: "get_markets(chain_id, limit, skip)",
          signature: "GET /v1/{chainId}/markets",
          description: "Paginated list of markets for a chain.",
        },
        {
          name: "get_market(chain_id, address)",
          signature: "GET /v1/{chainId}/markets/{address}",
          description: "A single market by address.",
        },
        {
          name: "get_active_markets(chain_id)",
          signature: "GET /v1/{chainId}/markets/active",
          description: "Active markets for a chain.",
        },
        {
          name: "get_assets(chain_id)",
          signature: "GET /v1/{chainId}/assets/all",
          description: "Asset metadata for a chain.",
        },
        {
          name: "get_historical_data(chain_id, address, time_frame)",
          signature: "GET /v3/{chainId}/markets/{address}/historical-data",
          description: "APY / price history for a market.",
        },
        {
          name: "convert(chain_id, receiver, slippage, inputs, outputs, ...)",
          signature: "POST /v3/sdk/{chainId}/convert",
          description: "Universal SDK calldata endpoint.",
        },
        {
          name: "swap / add_liquidity / remove_liquidity / mint_py / redeem_py",
          signature: "wrappers over convert",
          description:
            "Ergonomic wrappers that build calldata for each action.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: the Pendle v2 API is public and keyless. Signing and broadcasting the returned transaction is left to you (optionally via the [exec] extra, which pulls in web3.py). base_url defaults to the v2 core API and is configurable to any compatible endpoint.",
    "SDK endpoint: Pendle consolidated its per-action SDK routes into a single POST /v3/sdk/{chainId}/convert; this library exposes it as convert() with named wrappers. Errors raise PendleAPIError (a subclass of PendleError) exposing .status_code, .error and .message.",
  ],
};
