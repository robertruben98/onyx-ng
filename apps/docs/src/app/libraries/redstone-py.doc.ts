import { LibraryDoc } from "../library-model";

export const redstonePyDoc: LibraryDoc = {
  id: "redstone-py",
  name: "redstone-py",
  pypiName: "redstone-py",
  version: "0.1.0",
  tagline:
    "Typed Python client for the RedStone oracle HTTP API (pull price feeds).",
  description:
    "A typed client for the RedStone oracle HTTP API. Single, multi, and historical pull price feeds, sync and async, built on httpx + pydantic v2.",
  category: "Price Oracle",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/redstone-py",
  pypiUrl: "https://pypi.org/project/redstone-py/",
  docsUrl: "https://docs.redstone.finance",
  install: `pip install redstone-py`,
  quickstart: `from redstone import RedStoneClient

client = RedStoneClient()
print(client.get_latest_value("ETH"))            # plain float
prices = client.get_prices(["BTC", "ETH"])        # dict[str, PricePoint]`,
  features: [
    "Keyless over the public RedStone endpoints.",
    "Sync (RedStoneClient) and async (AsyncRedStoneClient) clients on httpx.",
    "Single, multi, and historical prices.",
    'provider defaulted to "redstone" (required by the API).',
  ],
  api: [
    {
      title: "RedStoneClient / AsyncRedStoneClient",
      rows: [
        {
          name: "get_price(symbol)",
          signature: "GET /prices (single symbol)",
          description: "Price for a single symbol.",
        },
        {
          name: "get_latest_value(symbol)",
          signature: "helper",
          description: "Latest price of a single symbol as a float.",
        },
        {
          name: "get_prices(symbols)",
          signature: "GET /prices (multi)",
          description: "Prices for multiple symbols as a dict.",
        },
        {
          name: "get_historical_prices(...)",
          signature: "GET /prices",
          description:
            "Historical prices (fromTimestamp/toTimestamp/interval in ms).",
        },
      ],
    },
  ],
  notes: [
    'Authentication: keyless, but the provider param is required by the API (default "redstone") — omitting it returns an empty list. The base URL defaults to https://api.redstone.finance.',
    "Errors raise RedStoneError / RedStoneAPIError (exposing .status_code) / RedStoneNotFoundError.",
  ],
};
