import { LibraryDoc } from "../library-model";

export const odosPyDoc: LibraryDoc = {
  id: "odos-py",
  name: "odos-py",
  pypiName: "odos-py",
  version: "0.1.1",
  tagline: "Typed client for the Odos DEX aggregator API.",
  description:
    "A modern, fully-typed client for the Odos DEX aggregator. Quote returns a pathId, assemble turns it into ready-to-sign calldata, and the swap() helper chains both. mypy --strict clean with a py.typed marker.",
  category: "DEX Aggregator",
  tier: "stable",
  githubUrl: "https://github.com/robertruben98/odos-py",
  pypiUrl: "https://pypi.org/project/odos-py/",
  docsUrl: "https://docs.odos.xyz/build/api-docs",
  install: `pip install odos-py
# optional signing/sending with web3.py:
pip install "odos-py[exec]"`,
  quickstart: `from odos_py import OdosClient, QuoteRequest, InputToken, OutputToken

client = OdosClient()

# swap() chains quote -> assemble in one call
quote, assembled = client.swap(QuoteRequest(
    chain_id=1,
    input_tokens=[InputToken(token_address="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",  # WETH
                             amount="1000000000000000000")],                              # 1 WETH (wei)
    output_tokens=[OutputToken(token_address="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",  # USDC
                               proportion=1)],
    user_addr="0x47E2D28169738039755586743E2dfCF3bd643f86",
    slippage_limit_percent=0.3,
))
print(quote.path_id, assembled.transaction.to)`,
  features: [
    "Sync (OdosClient) and async (AsyncOdosClient) clients built on httpx.",
    "pydantic v2 models for all requests and responses.",
    "Two-step quote -> assemble flow, plus a swap() helper that chains both.",
    "Automatic HTTP 429 handling with exponential backoff and Retry-After.",
    "Configurable base URL and API-key header; mypy --strict clean.",
  ],
  api: [
    {
      title: "OdosClient / AsyncOdosClient",
      rows: [
        {
          name: "quote(request)",
          signature: "POST /sor/quote/v2",
          description: "Get a route and a pathId for an input/output set.",
        },
        {
          name: "assemble(user_addr=, path_id=)",
          signature: "POST /sor/assemble",
          description: "Turn a pathId into ready-to-sign transaction calldata.",
        },
        {
          name: "execute(user_addr=, path_id=)",
          signature: "POST /sor/execute",
          description: "Execute an assembled path.",
        },
        {
          name: "swap(request) / quote_and_assemble(request)",
          signature: "quote then assemble",
          description: "Convenience helpers that chain both steps.",
        },
        {
          name: "get_chains()",
          signature: "GET /info/chains",
          description: "List supported chains.",
        },
        {
          name: "get_tokens(chain_id)",
          signature: "GET /info/tokens/{chainId}",
          description: "List tokens for a chain.",
        },
        {
          name: "get_token_price(chain_id, token_address)",
          signature: "GET /pricing/token/{chainId}/{tokenAddress}",
          description: "Spot price for a token.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: there is a free keyless tier, but it is heavily rate-limited — POST /sor/quote/v2 returns 429 quickly without a key. Pass api_key to raise limits; the header name is configurable (api_key_header, default x-api-key) since it is not publicly documented.",
    "Rate limits: 429 responses are retried with exponential backoff honoring Retry-After, raising OdosRateLimitError once retries are exhausted. Tune with max_retries and backoff_base.",
  ],
};
