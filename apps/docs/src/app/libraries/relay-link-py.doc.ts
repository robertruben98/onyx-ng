import { LibraryDoc } from "../library-model";

export const relayLinkPyDoc: LibraryDoc = {
  id: "relay-link-py",
  name: "relay-link-py",
  pypiName: "relay-link-py",
  version: "0.1.0",
  tagline: "Typed client for the Relay Protocol crosschain bridge/swap API.",
  description:
    "A typed client for the Relay Protocol — a fast crosschain bridge and swap protocol. Sync and async, pydantic v2 models, py.typed, with no network needed to import.",
  category: "Bridge",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/relay-link-py",
  pypiUrl: "https://pypi.org/project/relay-link-py/",
  docsUrl: "https://docs.relay.link/references/api/overview",
  install: `pip install relay-link-py
# optional web3 / solders signing helpers:
pip install "relay-link-py[exec]"`,
  quickstart: `from relay_link import RelayClient, TradeType

NATIVE = "0x0000000000000000000000000000000000000000"

with RelayClient() as client:
    # List supported chains (no API key required)
    chains = client.get_chains()
    print(f"{len(chains)} chains supported")

    # Executable quote: bridge 1 ETH from Base (8453) to Optimism (10)
    quote = client.get_quote(
        user="0x03508bb71268bba25ecacc8f620e01866650532c",
        origin_chain_id=8453,
        destination_chain_id=10,
        origin_currency=NATIVE,
        destination_currency=NATIVE,
        amount="1000000000000000000",  # 1 ETH in wei
        trade_type=TradeType.EXACT_INPUT,
    )
    for step in quote.steps:
        print(step.kind, step.id, step.action)`,
  features: [
    "Sync (RelayClient) and async (AsyncRelayClient) clients on httpx.",
    "Executable quotes whose steps include the transactions to sign.",
    "poll_status() polls a requestId until success / failure / refund.",
    "pydantic v2 models with full type hints; importable with no network.",
    "Typed exception hierarchy (RelayError, RelayAPIError, RelayRateLimitError, ...).",
    "Optional web3 / solders extra for signing the returned steps.",
  ],
  api: [
    {
      title: "RelayClient / AsyncRelayClient",
      rows: [
        {
          name: "get_chains()",
          signature: "GET /chains",
          description: "List supported chains.",
        },
        {
          name: "get_quote(...)",
          signature: "POST /quote/v2",
          description: "Executable bridge/swap/call quote with steps.",
        },
        {
          name: "get_price(...)",
          signature: "POST /price",
          description: "Non-executable price estimate.",
        },
        {
          name: "get_status(request_id=) / poll_status(request_id=)",
          signature: "GET /intents/status/v3",
          description: "Execution status; poll_status backs off to terminal.",
        },
        {
          name: "get_requests(...)",
          signature: "GET /requests",
          description: "List relay requests.",
        },
        {
          name: "get_token_price(address=, chain_id=)",
          signature: "GET /currencies/token/price",
          description: "Token USD price.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: quotes are public and need no API key. An optional api_key is sent on every request when provided, with a configurable api_key_header (default x-api-key) and base_url (default https://api.relay.link).",
    "Rate limits & errors: 429 and transient 5xx responses are retried up to max_retries with exponential backoff, honoring Retry-After. Exceptions: RelayError -> RelayAPIError (status_code, message, body) -> RelayRateLimitError (retry_after); plus RelayConnectionError and RelayTimeoutError.",
  ],
};
