// ============================================
// WEBSOCKET SERVICE v3.0
// Simulated real-time connection
// ============================================

interface ConnectionStatus {
  isConnected: boolean;
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
}

type ConnectionHandler = (status: ConnectionStatus) => void;

class WebSocketService {
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private connected = false;
  private latency = 0;

  constructor() {
    this.connect();
  }

  connect() {
    setTimeout(() => {
      this.connected = true;
      this.latency = Math.floor(Math.random() * 30 + 10);
      this.notifyChange();
      
      // Periodic latency updates
      setInterval(() => {
        if (this.connected) {
          this.latency = Math.floor(Math.random() * 40 + 8);
          this.notifyChange();
        }
      }, 5000);
    }, 500);
  }

  private notifyChange() {
    const quality = this.latency < 20 ? 'excellent' : this.latency < 50 ? 'good' : this.latency < 100 ? 'fair' : 'poor';
    const status: ConnectionStatus = {
      isConnected: this.connected,
      latency: this.latency,
      quality: this.connected ? quality : 'disconnected'
    };
    this.connectionHandlers.forEach(h => h(status));
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    handler({ isConnected: this.connected, latency: this.latency, quality: this.connected ? 'good' : 'disconnected' });
    return () => { this.connectionHandlers.delete(handler); };
  }

  disconnect() {
    this.connected = false;
    this.notifyChange();
  }
}

export const webSocketService = new WebSocketService();
export default WebSocketService;
