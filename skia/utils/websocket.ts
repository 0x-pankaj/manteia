// //utils/websocket.ts
// import { PricePoint } from '../types/price';

// type MessageHandler = (data: any) => void;
// type ConnectionHandler = () => void;

// /**
//  * Mock WebSocket client for price feed
//  */
// export class PriceFeedClient {
//   private handlers: Map<string, MessageHandler[]> = new Map();
//   private connected = false;
//   private reconnectTimer: NodeJS.Timeout | null = null;
//   private feedTimer:  NodeJS.Timeout | null = null;
  
//   private currentPrice = 3820;
//   private volatility = 0.001; // smaller volatility for less vertical movement

//   constructor() {
//     this.connect();
//   }

//   connect() {
//     // Simulate connection delay
//     setTimeout(() => {
//       this.connected = true;
//       this.emit('connected', {});
//       this.startFeed();
//     }, 100);
//   }

//   disconnect() {
//     this.connected = false;
//     if (this.feedTimer) {
//       clearInterval(this.feedTimer);
//       this.feedTimer = null;
//     }
//     if (this.reconnectTimer) {
//       clearTimeout(this.reconnectTimer);
//       this.reconnectTimer = null;
//     }
//   }

//   on(event: string, handler: MessageHandler) {
//     if (!this.handlers.has(event)) {
//       this.handlers.set(event, []);
//     }
//     this.handlers.get(event)!.push(handler);
//   }

//   off(event: string, handler: MessageHandler) {
//     const handlers = this.handlers.get(event);
//     if (handlers) {
//       const index = handlers.indexOf(handler);
//       if (index > -1) {
//         handlers.splice(index, 1);
//       }
//     }
//   }

//   private emit(event: string, data: any) {
//     const handlers = this.handlers.get(event);
//     if (handlers) {
//       handlers.forEach(handler => handler(data));
//     }
//   }

//   private startFeed() {
//     // Generate price points every 200-300ms
//     const generateTick = () => {
//       if (!this.connected) return;

//       // Random walk with mean reversion
//       const change = (Math.random() - 0.5) * this.volatility * this.currentPrice;
//       const meanReversion = (3820 - this.currentPrice) * 0.001; // revert to 3820, not 100
      
//       this.currentPrice += change + meanReversion;
      
//       const pricePoint: PricePoint = {
//         timestamp: Date.now(),
//         price: this.currentPrice,
//       };

//       this.emit('price', pricePoint);

//       // Schedule next tick (200-300ms)
//       const delay = 200 + Math.random() * 100;
//       this.feedTimer = setTimeout(generateTick, delay);
//     };

//     generateTick();
//   }

//   reconnect() {
//     if (this.connected) return;
    
//     this.reconnectTimer = setTimeout(() => {
//       this.connect();
//     }, 2000);
//   }
// }