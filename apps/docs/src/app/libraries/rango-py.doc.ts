import { LibraryDoc } from "../library-model";

export const rangoPyDoc: LibraryDoc = {
  id: "rango-py",
  name: "rango-py",
  pypiName: "rango-py",
  version: "0.1.0",
  tagline:
    "Typed client for the Rango Exchange universal cross-chain aggregator.",
  description:
    "A typed, batteries-included client for the Rango Exchange Basic API — a universal cross-chain DEX & bridge aggregator spanning EVM, Solana, Cosmos, Tron, UTXO, Starknet and more. Sync and async, built on httpx + pydantic v2.",
  category: "Bridge",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/rango-py",
  pypiUrl: "https://pypi.org/project/rango-py/",
  docsUrl: "https://docs.rango.exchange",
  install: `pip install rango-py`,
  quickstart: `from rango import RangoClient

with RangoClient(api_key="YOUR_API_KEY") as client:
    # Supported blockchains, tokens and swappers
    meta = client.get_meta()
    print(len(meta.blockchains), "blockchains supported")

    # Best route: 1 BNB on BSC -> USDC on Avalanche C-Chain
    quote = client.get_quote(
        from_asset="BSC.BNB",
        to_asset="AVAX_CCHAIN--0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
        amount="1000000000000000000",
        slippage=1.0,
    )
    print("result:", quote.result_type)

    # Create the signable transaction for the swap
    swap = client.get_swap(
        from_asset="BSC.BNB",
        to_asset="AVAX_CCHAIN--0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
        amount="1000000000000000000",
        from_address="0xYourAddress",
        to_address="0xYourAddress",
        slippage=1.0,
    )
    request_id = swap.request_id   # save this to track status
    tx = swap.tx                   # the transaction to sign and broadcast

    # After broadcasting, poll cross-chain status to a terminal state
    status = client.poll_status(request_id=request_id, tx_id="0xYourSourceTxHash")
    print(status.status)           # e.g. "success"`,
  features: [
    "Sync (RangoClient) and async (AsyncRangoClient) clients on httpx.",
    "Universal cross-chain aggregator: EVM, Solana, Cosmos, Tron, UTXO, Starknet and more.",
    "Quote a best route, build a signable swap transaction, and track it to completion.",
    "poll_status() blocks until a terminal (success / failed) state.",
    "Optional in-process TTL cache for the large /basic/meta payload (meta_cache_ttl).",
    "pydantic v2 type hints, mypy --strict clean.",
  ],
  api: [
    {
      title: "RangoClient / AsyncRangoClient",
      rows: [
        {
          name: "get_meta(force_refresh=False)",
          signature: "GET /basic/meta",
          description: "Supported blockchains, tokens and swappers.",
        },
        {
          name: "get_quote(...)",
          signature: "GET /basic/quote",
          description: "Best route for a from/to asset pair.",
        },
        {
          name: "get_swap(...)",
          signature: "GET /basic/swap",
          description: "Create the signable transaction for a swap.",
        },
        {
          name: "get_status(...)",
          signature: "GET /basic/status",
          description: "One-shot cross-chain status of a swap.",
        },
        {
          name: "is_approved(...)",
          signature: "GET /basic/is-approved",
          description: "Check whether an ERC-20 approval is in place.",
        },
        {
          name: "poll_status(request_id, tx_id, ...)",
          signature: "polls /basic/status to terminal",
          description: "Poll a swap until success or failed.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: a Rango API key is REQUIRED. It is sent as the apiKey query parameter; get a free key from the Rango dashboard. Requests without a key return 401. base_url defaults to https://api.rango.exchange.",
    'Assets use "BLOCKCHAIN.SYMBOL" (e.g. "BSC.BNB") or "BLOCKCHAIN--ADDRESS" form. Errors: RangoAPIError on a non-2xx response (carrying status_code, message, response_body) and StatusTimeoutError when poll_status does not reach a terminal state in time (carrying last_status). Both subclass RangoError.',
  ],
};
