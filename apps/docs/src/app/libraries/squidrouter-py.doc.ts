import { LibraryDoc } from "../library-model";

export const squidrouterPyDoc: LibraryDoc = {
  id: "squidrouter-py",
  name: "squidrouter-py",
  pypiName: "squidrouter-py",
  version: "0.1.0",
  tagline:
    "Typed Python client for the Squid Router API (Axelar cross-chain swap & bridge aggregator).",
  description:
    "A typed client for the Squid Router API, the Axelar-powered cross-chain swap and bridge aggregator. Sync and async, with route quoting and status polling, built on httpx + pydantic v2.",
  category: "Bridge",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/squidrouter-py",
  pypiUrl: "https://pypi.org/project/squidrouter-py/",
  docsUrl: "https://docs.squidrouter.com",
  install: `pip install squidrouter-py`,
  quickstart: `import os
from squidrouter import SquidClient, RouteRequest

with SquidClient(integrator_id=os.environ["SQUID_INTEGRATOR_ID"]) as client:
    chains = client.get_chains()
    route = client.get_route(
        RouteRequest(
            from_chain="56",
            from_token="0x55d3...7955",
            from_amount="1000000000000000",
            to_chain="42161",
            to_token="0xaf88...5831",
            from_address="0x...",
            to_address="0x...",
            slippage=1.0,
        )
    )
    print(route.route.estimate.to_amount)`,
  features: [
    "Sync (SquidClient) and async clients on httpx.",
    "Requires an x-integrator-id header (free from the Squid portal).",
    "Route quoting across chains.",
    "poll_status() polls a route to a terminal state.",
    "pydantic v2 (extra=allow) for forward-compatibility.",
  ],
  api: [
    {
      title: "SquidClient / AsyncSquidClient",
      rows: [
        {
          name: "get_chains()",
          signature: "GET /v2/chains",
          description: "Supported chains.",
        },
        {
          name: "get_tokens()",
          signature: "GET /v2/tokens",
          description: "Supported tokens.",
        },
        {
          name: "get_route(request)",
          signature: "POST /v2/route",
          description: "Quote and build a cross-chain swap/bridge route.",
        },
        {
          name: "get_status(...)",
          signature: "GET /v2/status",
          description: "Current status of a route execution.",
        },
        {
          name: "poll_status(...)",
          signature: "polls /v2/status to terminal",
          description: "Poll a route until it settles (retries 404).",
        },
      ],
    },
  ],
  notes: [
    "Authentication: integrator_id is required and sent as the x-integrator-id header (the header name is configurable). Get one free from the Squid portal. The base URL defaults to https://apiplus.squidrouter.com.",
    "Terminal statuses are success, partial_success, needs_gas, and not_found; poll_status retries on 404. Errors raise SquidError / SquidAPIError (exposing .status_code, .message, .request_id) / StatusTimeoutError.",
  ],
};
