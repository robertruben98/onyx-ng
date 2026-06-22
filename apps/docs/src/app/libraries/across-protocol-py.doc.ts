import { LibraryDoc } from "../library-model";

export const acrossProtocolPyDoc: LibraryDoc = {
  id: "across-protocol-py",
  name: "across-protocol-py",
  pypiName: "across-protocol-py",
  version: "0.1.0",
  tagline:
    "Typed Python client for the Across Protocol bridge API (sync + async).",
  description:
    "A typed client for the Across Protocol cross-chain bridge API. Keyless quoting plus deposit tracking, sync and async, built on httpx + pydantic v2.",
  category: "Bridge",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/across-protocol-py",
  pypiUrl: "https://pypi.org/project/across-protocol-py/",
  docsUrl: "https://docs.across.to",
  install: `pip install across-protocol-py`,
  quickstart: `from across_protocol import AcrossClient

with AcrossClient() as client:
    quote = client.get_suggested_fees(
        input_token="0xA0b8...EB48",
        output_token="0x2791...4174",
        origin_chain_id=1,
        destination_chain_id=137,
        amount=10_000_000,
    )
    print(
        quote.output_amount,
        quote.total_relay_fee.total,
        quote.estimated_fill_time_sec,
    )`,
  features: [
    "Keyless quoting over the public Across endpoints.",
    "Sync (AcrossClient) and async (AsyncAcrossClient) clients on httpx.",
    "pydantic v2 models throughout.",
    "Poll-to-terminal deposit tracking via wait_for_deposit().",
    "uint256 values kept as decimal strings.",
  ],
  api: [
    {
      title: "AcrossClient / AsyncAcrossClient",
      rows: [
        {
          name: "get_suggested_fees(...)",
          signature: "GET /suggested-fees",
          description: "Bridge quote (fees + output amount + fill time).",
        },
        {
          name: "get_available_routes()",
          signature: "GET /available-routes",
          description: "Supported bridge routes.",
        },
        {
          name: "get_limits(...)",
          signature: "GET /limits",
          description: "Min/max transfer limits for a route.",
        },
        {
          name: "get_deposit_status(...)",
          signature: "GET /deposit/status",
          description: "Current status of a deposit.",
        },
        {
          name: "wait_for_deposit(...)",
          signature: "polls /deposit/status to terminal",
          description: "Poll a deposit until it reaches a terminal state.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: keyless — the covered quoting endpoints are public and need no API key. The default base URL is https://app.across.to/api and is configurable to any compatible endpoint.",
    "Errors raise AcrossError / AcrossAPIError (exposing .status_code and .response_body). There is no built-in retry.",
  ],
};
