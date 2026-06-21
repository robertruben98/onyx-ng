import { LibraryDoc } from "../library-model";

export const pythHermesDoc: LibraryDoc = {
  id: "pyth-hermes",
  name: "pyth-hermes",
  pypiName: "pyth-hermes",
  version: "0.1.1",
  tagline: "Typed client for the Pyth Network Hermes price-oracle API.",
  description:
    "Sync and async clients for the Pyth Network Hermes price oracle, with Server-Sent-Events price streaming, auto-reconnect, and a Decimal price helper. mypy --strict clean and fully type-hinted.",
  category: "Price Oracle",
  tier: "stable",
  githubUrl: "https://github.com/robertruben98/pyth-hermes",
  pypiUrl: "https://pypi.org/project/pyth-hermes/",
  docsUrl: "https://pyth.network",
  install: `pip install pyth-hermes
# with the optional pandas helper:
pip install "pyth-hermes[pandas]"`,
  quickstart: `from pyth_hermes import HermesClient

client = HermesClient()
feed_id = client.get_feed_id("Crypto.BTC/USD")   # exact-symbol lookup
print(client.get_price_decimal(feed_id))         # -> Decimal("63952.82...")

# Async + SSE streaming
import asyncio
from pyth_hermes import AsyncHermesClient

BTC = "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"

async def main():
    async with AsyncHermesClient() as client:
        async for update in client.stream_prices([BTC]):
            print(update.parsed[0].to_decimal())

asyncio.run(main())`,
  features: [
    "Sync (HermesClient) and async (AsyncHermesClient) APIs over httpx.",
    "SSE price streaming with reconnect and exponential backoff.",
    "Exact Decimal pricing from Pyth's integer price + exponent.",
    "Exact-symbol feed-id lookup that skips deprecated variant feeds.",
    "Graceful 429 handling that respects the 60s rate-limit window.",
    "Configurable base URL (production, beta, paid providers) and optional API key.",
  ],
  api: [
    {
      title: "HermesClient / AsyncHermesClient",
      rows: [
        {
          name: "get_feed_id(symbol)",
          signature: "GET /v2/price_feeds",
          description: "Resolve a feed id by exact attributes.symbol.",
        },
        {
          name: "get_latest_price(ids)",
          signature: "GET /v2/updates/price/latest",
          description: "Latest price update for one or more feed ids.",
        },
        {
          name: "get_price_decimal(id)",
          signature: "helper",
          description: "Latest price of a single feed as a Decimal.",
        },
        {
          name: "get_price_at(timestamp, ids)",
          signature: "GET /v2/updates/price/{timestamp}",
          description: "Historical price at a unix timestamp.",
        },
        {
          name: "stream_prices(ids)",
          signature: "SSE /v2/updates/price/stream",
          description: "Stream live updates with auto-reconnect.",
        },
      ],
    },
    {
      title: "Helpers & models",
      rows: [
        {
          name: "price_to_decimal(price, expo)",
          signature: "price * 10**expo",
          description: "Exact Decimal from Pyth's integer price + exponent.",
        },
        {
          name: "ParsedPriceUpdate / RpcPrice",
          signature: "pydantic v2",
          description: "Parsed responses; .to_decimal() convenience wrappers.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: the public endpoint currently needs no API key, but from 2026-07-31 a key becomes mandatory. The client accepts one today via api_key=, with configurable api_key_header and api_key_scheme.",
    "Rate limits: 10 requests / 10 seconds per IP; exceeding it returns 429 for 60s. The client retries 429 and 5xx with backoff + jitter, honoring Retry-After and never exceeding the 60s window. Tune via max_retries, backoff_base, backoff_cap.",
    "TWAP endpoints are intentionally omitted (the API returns HTTP 400, deprecated).",
  ],
};
