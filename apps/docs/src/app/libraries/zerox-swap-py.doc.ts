import { LibraryDoc } from "../library-model";

export const zeroxSwapPyDoc: LibraryDoc = {
  id: "zerox-swap-py",
  name: "zerox-swap-py",
  pypiName: "zerox-swap-py",
  version: "0.1.0",
  tagline: "Fully typed client for the 0x Swap API v2 DEX aggregator.",
  description:
    "A modern, fully typed client for the 0x Swap API v2 — the 0x DEX aggregator that sources liquidity across on-chain exchanges and returns ready-to-sign swap transactions. Supports both Permit2 and AllowanceHolder routing. Sync and async, built on httpx + pydantic v2.",
  category: "DEX Aggregator",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/zerox-swap-py",
  pypiUrl: "https://pypi.org/project/zerox-swap-py/",
  docsUrl: "https://0x.org/docs",
  install: `pip install zerox-swap-py
# optional signing/sending with web3.py:
pip install "zerox-swap-py[exec]"`,
  quickstart: `from zerox_swap import ZeroExClient, SwapParams

WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

with ZeroExClient(api_key="YOUR_KEY") as client:
    params = SwapParams(
        chain_id=1,                          # Ethereum mainnet
        sell_token=WETH,
        buy_token=USDC,
        sell_amount="1000000000000000000",   # 1 WETH, in wei
        taker="0x47E2D28169738039755586743E2dfCF3bd643f86",
    )

    # Indicative price (no transaction calldata):
    price = client.get_price(params)
    print(price.buy_amount, price.liquidity_available)

    # Firm quote (includes signable transaction calldata):
    quote = client.get_quote(params)
    if quote.transaction is not None:
        print(quote.transaction.to, quote.transaction.data)`,
  features: [
    "Sync (ZeroExClient) and async (AsyncZeroExClient) clients on httpx.",
    "Both routing flavours: Permit2 (gasless approvals) and AllowanceHolder (classic allowance).",
    "price (indicative) and quote (firm, with calldata) for each flavour.",
    "Multi-chain via chainId; discover supported chains with get_chains().",
    "Automatic retry with exponential backoff on HTTP 429 (honours Retry-After).",
    "pydantic v2 models (extra=allow), py.typed.",
  ],
  api: [
    {
      title: "ZeroExClient / AsyncZeroExClient",
      rows: [
        {
          name: "get_price(params)",
          signature: "GET /swap/permit2/price",
          description: "Indicative price (no transaction calldata).",
        },
        {
          name: "get_quote(params)",
          signature: "GET /swap/permit2/quote",
          description: "Firm quote with signable transaction calldata.",
        },
        {
          name: 'get_price(params, routing="allowance-holder")',
          signature: "GET /swap/allowance-holder/price",
          description: "Indicative price via the AllowanceHolder flow.",
        },
        {
          name: 'get_quote(params, routing="allowance-holder")',
          signature: "GET /swap/allowance-holder/quote",
          description: "Firm quote via the AllowanceHolder flow.",
        },
        {
          name: "get_chains()",
          signature: "GET /swap/chains",
          description: "List supported chains.",
        },
      ],
    },
    {
      title: "Models",
      rows: [
        {
          name: "SwapParams",
          signature: "request model",
          description:
            "chain_id, sell_token, buy_token, sell_amount, taker, ...",
        },
      ],
    },
  ],
  notes: [
    "Authentication: an API key is REQUIRED. Every request sends two headers: 0x-api-key (your key from dashboard.0x.org) and 0x-version: v2 (the client always sends this for you). Without a valid key the API responds 401 Unauthorized. base_url defaults to https://api.0x.org.",
    "Errors derive from ZeroExError: ZeroExRateLimitError on HTTP 429 after retries (inspect retry_after), and ZeroExAPIError for any other non-2xx (inspect status_code / body). AllowanceHolder responses omit the permit2 object; approve allowance_target instead.",
  ],
};
