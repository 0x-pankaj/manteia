
                                import WebSocket from "ws";
import { PublicKey } from "@solana/web3.js";

// Config Sol/usdc price
const WS_URL = "wss://mainnet.magicblock.app";
const PRICE_FEED_PUBKEY = "ENYwebBThHzmzwPLAQvCucUTsjyfBSZdD9ViXksS4jPu";

interface PriceData {
  price: number;
  conf: number;
  exponent: number;
  publishTime: number;
}

function parsePriceUpdateV2(buffer: Buffer): PriceData | null {
  try {
    // PriceUpdateV2 structure:
    // 8 bytes: discriminator
    // 32 bytes: write_authority (Pubkey)
    // 2 bytes: verification_level
    // PriceFeedMessage starts at offset 42

    // PriceFeedMessage structure (at offset 42):
    // 32 bytes: feed_id
    // 8 bytes: price (i64)
    // 8 bytes: conf (u64)
    // 4 bytes: exponent (i32)
    // 8 bytes: publish_time (i64) - THIS IS THE TIMESTAMP
    // 8 bytes: prev_publish_time (i64)
    // 8 bytes: ema_price (i64)
    // 8 bytes: ema_conf (u64)

    const PRICE_MESSAGE_OFFSET = 42;
    const FEED_ID_OFFSET = PRICE_MESSAGE_OFFSET; // 42
    const PRICE_OFFSET = PRICE_MESSAGE_OFFSET + 32; // 74
    const CONF_OFFSET = PRICE_OFFSET + 8; // 82
    const EXPONENT_OFFSET = CONF_OFFSET + 8; // 90
    const PUBLISH_TIME_OFFSET = EXPONENT_OFFSET + 4; // 94

    // Read price (signed 64-bit at offset 74, but you had 73 - let's try both)
    const price = buffer.readBigInt64LE(73); // Your original offset
    const conf = buffer.readBigUInt64LE(81);
    const exponent = buffer.readInt32LE(89);

    // Read publish_time (Unix timestamp in seconds)
    const publishTime = buffer.readBigInt64LE(93);

    return {
      price: Number(price),
      conf: Number(conf),
      exponent: exponent,
      publishTime: Number(publishTime),
    };
  } catch (error) {
    console.error("Error parsing price update:", error);
    return null;
  }
}

function calculatePriceInUsd(priceData: PriceData): number {
  return priceData.price * Math.pow(10, priceData.exponent);
}

// Main WebSocket logic
function main() {
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("Connected to WebSocket");
    ws.send(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "accountSubscribe",
        params: [
          PRICE_FEED_PUBKEY,
          { encoding: "jsonParsed", commitment: "confirmed" },
        ],
      }),
    );
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.method === "accountNotification") {
      const rawBase64 = msg.params.result.value.data[0];
      const buffer = Buffer.from(rawBase64, "base64");

      console.log("\n=== New Price Update ===");
      console.log("Buffer length:", buffer.length);

      const priceData = parsePriceUpdateV2(buffer);

      if (priceData) {
        const priceUsd = calculatePriceInUsd(priceData);
        const timestampDate = new Date(priceData.publishTime * 1000);
        const now = Date.now() / 1000;
        const ageSeconds = Math.floor(now - priceData.publishTime);

        console.log(`\nSOL/USD Price: $${priceUsd.toFixed(4)}`);
        // console.log(
        //   `Confidence: ±$${(priceData.conf * Math.pow(10, priceData.exponent)).toFixed(4)}`,
        // );
        // console.log(`Exponent: ${priceData.exponent}`);
        // console.log(`\nPublish Time: ${timestampDate.toISOString()}`);
        console.log(`Publish Time (Unix): ${priceData.publishTime}`);
        console.log(`Age: ${ageSeconds}s ago`);

        // Additional detailed output
        console.log(`\nRaw Values:`);
        console.log(`  Price: ${priceData.price / 100_000_000}`);
        // console.log(`  Conf: ${priceData.conf}`);
      }
    }
  });

  ws.on("error", (err) => console.error("WebSocket Error:", err.message));
  ws.on("close", () => console.log("WebSocket Closed"));
}

// Run
main();

/*
=== New Price Update ===
Buffer length: 134

SOL/USD Price: $1996709774700000000.0000
Confidence: ±$0.0000
Exponent: 8

Publish Time: 2025-10-27T20:11:20.000Z
Publish Time (Unix): 1761595880
Age: 1s ago

Raw Values:
  Price: 19967097747
  Conf: 0

*/
