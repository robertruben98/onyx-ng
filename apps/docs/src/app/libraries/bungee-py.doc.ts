import { LibraryDoc } from "../library-model";

export const bungeePyDoc: LibraryDoc = {
  id: "bungee-py",
  name: "bungee-py",
  pypiName: "bungee-py",
  version: "0.1.0",
  tagline:
    "Typed client for the current Bungee bridge & swap aggregator API (successor to Socket).",
  description:
    "A typed, async-friendly client for the current Bungee API — the cross-chain bridge and swap aggregator that succeeds Socket. Quote a cross-chain swap, get a ready-to-broadcast transaction, and poll the bridge to completion. Targets the live keyless public API. Sync and async, built on httpx + pydantic v2.",
  category: "Bridge",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/bungee-py",
  pypiUrl: "https://pypi.org/project/bungee-py/",
  docsUrl: "https://docs.bungee.exchange",
  install: `pip install bungee-py
# optional execution helpers (broadcast with web3):
pip install "bungee-py[exec]"`,
  quickstart: `from bungee import BungeeClient
from bungee.constants import ChainId, NATIVE_TOKEN_ADDRESS

with BungeeClient() as client:
    # 1. Quote bridging 0.01 ETH on Ethereum to USDC on Optimism.
    quote = client.get_quote(
        user_address="0xYourWallet",
        origin_chain_id=ChainId.ETHEREUM,
        destination_chain_id=ChainId.OPTIMISM,
        input_token=NATIVE_TOKEN_ADDRESS,                       # native ETH
        output_token="0x0b2c639c533813f4aa9d7837caf62653d097ff85",  # USDC on OP
        input_amount="10000000000000000",                      # 0.01 ETH (wei)
    )

    route = quote.auto_route            # the headline single-signature route
    print(route.output.amount)          # expected USDC out (smallest unit)
    print(route.tx_data.to, route.tx_data.value, route.tx_data.data)

    # 2. Sign & broadcast route.tx_data, then poll to completion.
    final = client.poll_status(route.request_hash)
    print(final.is_success(), final.bungee_status_code)  # e.g. True 4 (SETTLED)`,
  features: [
    "Sync (BungeeClient) and async (AsyncBungeeClient) clients on httpx.",
    "Quote, build a ready-to-broadcast transaction, and poll the bridge to completion.",
    "auto_route is a fully built single-signature route; enable_manual=True adds alternatives.",
    "build_tx() turns a manual route's quote_id into a transaction.",
    "Terminality judged from the integer bungeeStatusCode, not the status string.",
    "pydantic v2 (forward-compatible), py.typed; optional [exec] extra for web3.",
  ],
  api: [
    {
      title: "BungeeClient / AsyncBungeeClient",
      rows: [
        {
          name: "get_tokens(chain_id=None)",
          signature: "GET /tokens/list",
          description: "Token list (optionally for one chain).",
        },
        {
          name: "get_supported_chains()",
          signature: "GET /supported-chains",
          description: "List supported chains.",
        },
        {
          name: "get_quote(...)",
          signature: "GET /bungee/quote",
          description: "Quote a cross-chain swap; returns auto_route.",
        },
        {
          name: "build_tx(quote_id)",
          signature: "GET /bungee/build-tx",
          description: "Build the transaction for a manual route's quote_id.",
        },
        {
          name: "get_status(request_hash)",
          signature: "GET /bungee/status",
          description: "Current status of a transfer.",
        },
        {
          name: "poll_status(request_hash, ...)",
          signature: "GET /bungee/status (polled)",
          description: "Poll a transfer until it is terminal.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: the current public Bungee API is keyless. The client targets https://public-backend.bungee.exchange/api/v1 (not the legacy Socket Liquidity Layer API). It unwraps Bungee's {success, statusCode, result, message} envelope and raises BungeeAPIError on any API error, including the per-IP rate limit returned as HTTP 429.",
    "Terminality is judged from the integer bungeeStatusCode (FULFILLED/SETTLED = success; EXPIRED/CANCELLED/REFUND_PENDING/REFUNDED = unsuccessful), not from destinationData.status (which only reports PENDING or COMPLETED). Call final.is_success() to check the outcome.",
  ],
};
