import { LibraryDoc } from "../library-model";

export const mayanPyDoc: LibraryDoc = {
  id: "mayan-py",
  name: "mayan-py",
  pypiName: "mayan-py",
  version: "0.1.0",
  tagline: "Typed client for the Mayan Finance cross-chain swap API.",
  description:
    "A typed client for the Mayan Finance API — cross-chain swaps and bridging across Solana, EVM chains and Sui. get_quote() returns the best route (expected output, fees, ETA) across all of Mayan's protocols (MCTP, Swift, Wormhole). Sync and async, built on httpx + pydantic v2.",
  category: "Bridge",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/mayan-py",
  pypiUrl: "https://pypi.org/project/mayan-py/",
  docsUrl: "https://docs.mayan.finance",
  install: `pip install mayan-py`,
  quickstart: `from mayan import MayanClient

quote = MayanClient().get_quote(
    amount="100",                                              # 100 USDC (whole units)
    from_token="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", # USDC (Solana)
    from_chain="solana",
    to_token="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",     # USDC (Ethereum)
    to_chain="ethereum",
)
print(quote.type, quote.expected_amount_out, quote.client_eta)  # MCTP 97.97 "1 min"

# After broadcasting the source-chain tx, poll its status to completion
client = MayanClient()
status = client.get_swap_status(tx_hash="0x5eaa...")     # one-shot lookup
print(status.client_status, status.status)

final = client.poll_swap_status(tx_hash="0x5eaa...")     # blocks until terminal
assert final.is_terminal                                  # is_completed or is_refunded`,
  features: [
    "Sync (MayanClient) and async (AsyncMayanClient) clients on httpx.",
    "Best route across Mayan's protocols (MCTP, Swift, Wormhole) with get_quote().",
    "Multi-ecosystem: Solana, EVM and Sui — addresses and amounts kept as strings.",
    "get_quotes() returns every candidate route (one per protocol) plus the min SDK version.",
    "poll_swap_status() polls a swap to a terminal (COMPLETED / REFUNDED) state.",
    "pydantic v2 models tolerate unknown fields (py.typed).",
  ],
  api: [
    {
      title: "MayanClient / AsyncMayanClient",
      rows: [
        {
          name: "get_quote(...)",
          signature: "GET price-api /quote",
          description: "Best cross-chain route (expected output, fees, ETA).",
        },
        {
          name: "get_quotes(...)",
          signature: "GET price-api /quote",
          description: "Every candidate route (one per protocol).",
        },
        {
          name: "get_tokens(chain)",
          signature: "GET price-api /tokens",
          description: "Supported tokens for a chain.",
        },
        {
          name: "get_swap_status(tx_hash)",
          signature: "GET explorer-api",
          description: "One-shot status of a swap by source tx hash.",
        },
        {
          name: "list_swaps(...)",
          signature: "GET explorer-api",
          description: "List swaps from the explorer API.",
        },
        {
          name: "poll_swap_status(tx_hash)",
          signature: "polls explorer-api to terminal",
          description: "Poll a swap until it settles (exponential backoff).",
        },
      ],
    },
  ],
  notes: [
    'Authentication: all endpoints work keyless (an optional api_key raises limits). Requests send a referer header (default "mayan-py") to identify your app, and quotes/tokens require an sdkVersion the client supplies. base_url defaults to https://price-api.mayan.finance; swap status uses a separate explorer-api host (status_base_url).',
    "Errors: MayanAPIError on a non-2xx response (e.g. HTTP 406 ROUTE_NOT_FOUND when no route exists), carrying status_code and response_body; MayanRateLimitError on HTTP 429 after retries, carrying retry_after. Both subclass MayanError.",
  ],
};
