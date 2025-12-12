import EventEmitter from 'eventemitter3';
import { PricePoint } from '../types/price';

class PriceFeedClient extends EventEmitter {
  private interval: NodeJS.Timeout | null = null;
  private currentPrice: number = 3820;
  private startTime: number = Date.now();
  private tickCount: number = 0;

  start() {
    this.startTime = Date.now();
    this.tickCount = 0;
    
    // Generate price every 1 second
    this.interval = setInterval(() => {
      this.tickCount++;
      
      // Random walk for price
      const change = (Math.random() - 0.5) * 10; // +/- 5 units
      this.currentPrice += change;
      
      // Keep price in reasonable range
      this.currentPrice = Math.max(3700, Math.min(3900, this.currentPrice));

      const pricePoint: PricePoint = {
        price: this.currentPrice,
        timestamp: Date.now(), // Use actual current time
      };

      console.log('📊 Price update:', {
        price: pricePoint.price.toFixed(2),
        timestamp: new Date(pricePoint.timestamp).toLocaleTimeString(),
        tickCount: this.tickCount,
      });

      this.emit('price', pricePoint);
    }, 300); // Every 1 second
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
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