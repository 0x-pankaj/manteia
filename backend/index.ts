import type { ServerWebSocket } from "bun";
import WebSocket from "ws";

const clients = new Set<ServerWebSocket>();

// MagicBlock / Pyth Config
const WS_URL = "wss://mainnet.magicblock.app";
const PRICE_FEED_PUBKEY = "ENYwebBThHzmzwPLAQvCucUTsjyfBSZdD9ViXksS4jPu"; // SOL/USD

interface PriceData {
    price: number;
    conf: number;
    exponent: number;
    publishTime: number;
}

function parsePriceUpdateV2(buffer: Buffer): PriceData | null {
    try {
        // Offsets verified from price-poller
        const price = buffer.readBigInt64LE(73);
        const conf = buffer.readBigUInt64LE(81);
        const exponent = buffer.readInt32LE(89);
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

function calculatePrice(priceData: PriceData): number {
    return priceData.price * Math.pow(10, -Math.abs(priceData.exponent));
}

// Connect to MagicBlock
let magicBlockWs: WebSocket | null = null;

function connectToMagicBlock() {
    console.log('🔌 Connecting to MagicBlock (Solana)...');
    try {
        magicBlockWs = new WebSocket(WS_URL);

        magicBlockWs.onopen = () => {
            console.log('✅ Connected to MagicBlock');
            // Subscribe to SOL/USD feed
            const subscribeMsg = {
                jsonrpc: "2.0",
                id: 1,
                method: "accountSubscribe",
                params: [
                    PRICE_FEED_PUBKEY,
                    { encoding: "jsonParsed", commitment: "confirmed" },
                ],
            };
            if (magicBlockWs) {
                magicBlockWs.send(JSON.stringify(subscribeMsg));
            }
        };

        magicBlockWs.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data.toString());

                if (msg.method === "accountNotification") {
                    const rawBase64 = msg.params.result.value.data[0];
                    const buffer = Buffer.from(rawBase64, "base64");
                    const priceData = parsePriceUpdateV2(buffer);

                    if (priceData) {
                        const finalPrice = calculatePrice(priceData);

                        // Broadcast standardized format to clients
                        const update = JSON.stringify({
                            type: 'price_update',
                            source: 'magicblock',
                            data: {
                                price: finalPrice,
                                timestamp: priceData.publishTime * 1000,
                                symbol: 'SOL/USD'
                            }
                        });

                        for (const client of clients) {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(update);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error processing message:', err);
            }
        };

        magicBlockWs.onclose = () => {
            console.log('❌ Disconnected from MagicBlock, reconnecting in 1s...');
            setTimeout(connectToMagicBlock, 1000);
        };

        magicBlockWs.onerror = (error) => {
            console.error('MagicBlock WS Error:', error);
        };
    } catch (err) {
        console.error('Failed to connect:', err);
        setTimeout(connectToMagicBlock, 1000);
    }
}

// Start connection
connectToMagicBlock();

// Create local WebSocket server
const server = Bun.serve({
    port: 3001,
    hostname: '0.0.0.0',
    fetch(req, server) {
        // upgrade the request to a WebSocket
        if (server.upgrade(req)) {
            return; // do not return a Response
        }
        return new Response("WebSocket server currently running", { status: 200 });
    },
    websocket: {
        open(ws) {
            console.log('Client connected');
            clients.add(ws);
        },
        message(ws, message) {
            // We don't expect messages from clients, but if we get any, we could handle them here
        },
        close(ws) {
            console.log('Client disconnected');
            clients.delete(ws);
        },
    },
});

console.log(`Listening on localhost:${server.port}`);