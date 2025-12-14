import EventEmitter from 'eventemitter3';
import { PricePoint } from '../types/price';

class PriceFeedClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  start() {
    this.connect();
  }

  private connect() {
    try {
      console.log('🔌 Connecting to WebSocket...');
      this.ws = new WebSocket('wss://thepriceisright.xyz');

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Only process pyth data
          if (message.type === 'price_update' && message.source === 'switchboard') {
            const pricePoint: PricePoint = {
              price: message.data.price,
              timestamp: message.data.timestamp,
            };

            console.log('📊 Pyth Price update:', {
              price: pricePoint.price.toFixed(2),
              timestamp: new Date(pricePoint.timestamp).toLocaleTimeString(),
              confidence: message.data.confidence,
              latency: message.data.latency,
            });

            this.emit('price', pricePoint);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  stop() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }
}

let client: PriceFeedClient | null = null;

export function startPriceFeed(): PriceFeedClient {
  if (client) {
    client.stop();
  }
  
  client = new PriceFeedClient();
  client.start();
  return client;
}

export function stopPriceFeed() {
  if (client) {
    client.stop();
    client = null;
  }
}