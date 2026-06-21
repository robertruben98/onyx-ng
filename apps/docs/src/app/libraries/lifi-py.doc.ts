import { LibraryDoc } from "../library-model";

export const lifiPyDoc: LibraryDoc = {
  id: "lifi-py",
  name: "lifi-py",
  pypiName: "lifi-py",
  version: "0.1.1",
  tagline: "Typed client for the LI.FI bridge + DEX aggregator API.",
  description:
    "A typed client for the LI.FI any-to-any cross-chain swap and bridge API across 74 chains. get_quote() returns a ready-to-sign transactionRequest directly — one call, no separate assemble step.",
  category: "Bridge",
  tier: "stable",
  githubUrl: "https://github.com/robertruben98/lifi-py",
  pypiUrl: "https://pypi.org/project/lifi-py/",
  docsUrl: "https://docs.li.fi/api-reference/introduction",
  install: `pip install lifi-py
# with web3 signing helpers:
pip install 'lifi-py[exec]'`,
  quickstart: `from lifi_py import LifiClient

quote = LifiClient().get_quote(
    from_chain=42161, to_chain=8453,                                  # Arbitrum -> Base
    from_token="0xaf88d065e77c8cC2239327C5EDb3A432268e5831",          # USDC (Arbitrum)
    to_token="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",            # USDC (Base)
    from_amount="1000000", from_address="0x47E2D28169738039755586743E2dfCF3bd643f86",
)
print(quote.estimate.to_amount, quote.transaction_request.to)  # ready-to-sign tx

# Track the bridge to completion
client = LifiClient()
status = client.poll_status(tx_hash="0x...", bridge=quote.tool)  # polls until DONE/FAILED
print(status.status, status.is_done)`,
  features: [
    "Sync (LifiClient) and async (AsyncLifiClient) clients on top of httpx.",
    "get_quote() returns a ready-to-sign transactionRequest in one call.",
    "All responses parsed into pydantic v2 models with full type hints.",
    "Built-in rate-limit awareness: reads ratelimit-* headers and throttles proactively.",
    "Retries 429s with backoff respecting the reset window.",
    "Optional web3.py integration for signing/sending the returned transaction.",
  ],
  api: [
    {
      title: "LifiClient / AsyncLifiClient",
      rows: [
        {
          name: "get_quote(...)",
          signature: "GET /quote",
          description:
            "Best single-step route + ready-to-sign transactionRequest.",
        },
        {
          name: "get_status(...) / poll_status(...)",
          signature: "GET /status",
          description:
            "Track a transfer; poll_status backs off until terminal.",
        },
        {
          name: "get_routes(...)",
          signature: "POST /advanced/routes",
          description: "Multiple candidate routes.",
        },
        {
          name: "get_step_transaction(step)",
          signature: "POST /advanced/stepTransaction",
          description: "Calldata for one step of an advanced route.",
        },
        {
          name: "get_chains() / get_tokens()",
          signature: "GET /chains, GET /tokens",
          description: "Supported chains and tokens.",
        },
        {
          name: "get_tools() / get_connections(...)",
          signature: "GET /tools, GET /connections",
          description: "Available bridges + exchanges and connectivity.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: an API key is optional — every endpoint works keyless; a key only raises rate limits. Passed as x-lifi-api-key by default, with a configurable api_key_header and base_url.",
    "Rate limits: the client reads ratelimit-limit / ratelimit-remaining / ratelimit-reset headers (exposed via client.rate_limit), pauses when the quota is exhausted, and retries 429s with backoff respecting the reset window, raising LifiRateLimitError once retries are exhausted (max_retries, default 3).",
  ],
};
