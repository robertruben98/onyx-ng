import { LibraryDoc } from "../library-model";

export const debridgePyDoc: LibraryDoc = {
  id: "debridge-py",
  name: "debridge-py",
  pypiName: "debridge-py",
  version: "0.1.0",
  tagline: "Typed client for the deBridge DLN cross-chain order API.",
  description:
    "A typed client for the deBridge DLN cross-chain swap/order API. Works across 19+ EVM chains and Solana, sync and async, with full type hints, built on httpx + pydantic v2.",
  category: "Bridge",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/debridge-py",
  pypiUrl: "https://pypi.org/project/debridge-py/",
  docsUrl: "https://docs.debridge.com/",
  install: `pip install debridge-py
# optional signing helpers:
pip install "debridge-py[exec]"`,
  quickstart: `from debridge import DebridgeClient
from debridge.constants import ChainId

with DebridgeClient() as client:
    # quote + build a cross-chain order (10 USDC Base -> USDC Arbitrum)
    order = client.create_order(
        src_chain_id=ChainId.BASE,
        src_chain_token_in="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        src_chain_token_in_amount="10000000",          # 10 USDC (6 decimals)
        dst_chain_id=ChainId.ARBITRUM,
        dst_chain_token_out="0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        dst_chain_token_out_amount="auto",              # API quotes the output
        dst_chain_token_out_recipient="0xYourRecipient",
        sender_address="0xYourSender",
    )
    print(order.tx.to, order.tx.value, order.tx.data)   # tx to sign & send

    # after broadcasting order.tx, poll until the order settles
    final = client.poll_status(order.order_id, interval=5, timeout=600)
    print(final.status)  # e.g. "Fulfilled"`,
  features: [
    "Sync (DebridgeClient) and async (AsyncDebridgeClient) clients on httpx.",
    "Covers the public, no-auth data endpoints to quote and track orders.",
    "Works across 19+ EVM chains and Solana — addresses/amounts kept as strings.",
    "Returned tx adapts to the source chain (EVM call vs. serialized Solana tx).",
    "poll_status() polls an order to a terminal state.",
    "Optional [exec] extra: web3.py for EVM, solders for Solana signing.",
  ],
  api: [
    {
      title: "DebridgeClient / AsyncDebridgeClient",
      rows: [
        {
          name: "get_supported_chains()",
          signature: "GET /supported-chains-info",
          description: "List supported chains.",
        },
        {
          name: "get_token_list(chain_id)",
          signature: "GET /token-list",
          description: "Tokens available on a chain.",
        },
        {
          name: "create_order(...)",
          signature: "GET /dln/order/create-tx",
          description: "Quote and build a cross-chain order + tx to sign.",
        },
        {
          name: "get_order_status(order_id)",
          signature: "GET /dln/order/{id}/status",
          description: "Current status of an order.",
        },
        {
          name: "get_order(order_id)",
          signature: "GET /dln/order/{id}",
          description: "Full order details.",
        },
        {
          name: "poll_status(order_id, interval, timeout)",
          signature: "polls to terminal",
          description: "Poll an order until it settles.",
        },
      ],
    },
  ],
  notes: [
    "Authentication: the covered endpoints are public and need no API key. Signing and broadcasting the returned transaction is left to you (optionally via the [exec] extra). base_url defaults to https://dln.debridge.finance/v1.0 and is configurable to any compatible endpoint.",
    "EVM vs. Solana: addresses and amounts are strings so the same models cover 0x-hex (EVM) and base58 (Solana). Errors raise DebridgeAPIError exposing .error_id, .error_code, .message, .req_id, .status_code — including compliance blocks the API returns with HTTP 200.",
  ],
};
