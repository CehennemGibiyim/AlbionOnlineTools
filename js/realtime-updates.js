// realtime-updates.js - WebSocket & Real-time Updates
// Live kill events, price updates, territory changes

const RealtimeModule = {
    socket: null,
    connected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 3000,
    
    listeners: {},
    
    init(serverUrl = 'ws://localhost:3000') {
        console.log('[Realtime] WebSocket başlatılıyor...');
        this.connect(serverUrl);
    },
    
    connect(serverUrl) {
        try {
            // WebSocket server URL
            const wsUrl = serverUrl.replace('http', 'ws') + '/api/ws';
            
            this.socket = new WebSocket(wsUrl);
            
            this.socket.addEventListener('open', () => this.handleOpen());
            this.socket.addEventListener('message', (event) => this.handleMessage(event));
            this.socket.addEventListener('error', (event) => this.handleError(event));
            this.socket.addEventListener('close', () => this.handleClose());
            
        } catch (error) {
            console.error('[Realtime] WebSocket connection error:', error);
            this.attemptReconnect();
        }
    },
    
    handleOpen() {
        console.log('[Realtime] WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Send subscription to live events
        this.send({
            type: 'subscribe',
            channels: ['kills', 'prices', 'territories', 'gold']
        });
        
        // Toast bildirimini engelle - statik modda gerek yok
        console.log('[Realtime] Connected - toast disabled');
    },
    
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('[Realtime] Message:', data.type, data);
            
            // Emit to listeners
            this.emit(data.type, data.payload);
            
            // Handle specific message types
            switch (data.type) {
                case 'kill':
                    this.handleKillEvent(data.payload);
                    break;
                case 'price_update':
                    this.handlePriceUpdate(data.payload);
                    break;
                case 'territory_change':
                    this.handleTerritoryChange(data.payload);
                    break;
                case 'gold_price':
                    this.handleGoldPrice(data.payload);
                    break;
            }
        } catch (error) {
            console.error('[Realtime] Message parsing error:', error);
        }
    },
    
    handleKillEvent(kill) {
        // Update killboard in real-time
        console.log('[Realtime] New kill:', kill.Killer?.Name);
        
        // Emit to killboard module
        if (window.KillboardModule) {
            window.KillboardModule.addLiveKill(kill);
        }
        
        // Toast notification
        ToastManager.show(
            `💀 ${kill.Killer?.Name} killed ${kill.Victim?.Name} - ${kill.TotalVictimKillFame?.toLocaleString()} Fame`,
            'info'
        );
    },
    
    handlePriceUpdate(priceData) {
        console.log('[Realtime] Price update:', priceData.item);
        
        // Update market module
        if (window.MarketModule) {
            window.MarketModule.updatePrice(priceData);
        }
    },
    
    handleTerritoryChange(territoryData) {
        console.log('[Realtime] Territory change:', territoryData.territory);
        
        // Update territory map
        if (window.TerritoryMapModule) {
            window.TerritoryMapModule.updateTerritory(territoryData);
        }
        
        ToastManager.show(
            `🗺️ ${territoryData.territory} now owned by ${territoryData.newOwner}`,
            'info'
        );
    },
    
    handleGoldPrice(goldData) {
        console.log('[Realtime] Gold price update:', goldData.price);
        
        // Update gold panel
        if (window.GoldModule) {
            window.GoldModule.updatePrice(goldData);
        }
    },
    
    handleError(error) {
        console.error('[Realtime] WebSocket error:', error);
        
        // WebSocket hatalarını sessize al - bu normal durum
        // Statik sunucuda WebSocket çalışmaz
        if (error.type === 'error' && error.isTrusted) {
            // Bu tarayıcı güvenlik hatası, normal durum
            return;
        }
        
        // Sadece gerçek hataları göster
        if (error.message && !error.message.includes('NetworkError')) {
            ToastManager.show('Real-time connection error', 'error');
        }
    },
    
    handleClose() {
        console.log('[Realtime] WebSocket closed');
        this.connected = false;
        // Reconnect denemesini engelle - statik modda çalışmaz
        console.log('[Realtime] Reconnect disabled in static mode');
    },
    
    attemptReconnect() {
        // Statik modda reconnect denemesini tamamen engelle
        console.log('[Realtime] Reconnect disabled - using polling only');
        return;
    },
    
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('[Realtime] Socket not ready');
        }
    },
    
    // Event listener system
    on(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);
    },
    
    off(eventType, callback) {
        if (!this.listeners[eventType]) return;
        this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
    },
    
    emit(eventType, data) {
        if (!this.listeners[eventType]) return;
        this.listeners[eventType].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[Realtime] Error in ${eventType} handler:`, error);
            }
        });
    },
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // WebSocket'i tamamen devre dışı bırak
    console.log('[Realtime] WebSocket devre dışı - statik mod');
    RealtimeModule.connected = false;
    
    // Sadece polling modu aktif
    setInterval(() => {
        console.log('[Realtime] Using polling fallback');
        // Fetch latest events via HTTP
        fetch('https://gameinfo.albiononline.com/api/gameinfo/events?limit=10&offset=0')
            .then(r => r.json())
            .then(data => {
                if (data && data.length > 0) {
                    RealtimeModule.handleKillEvent(data[0]);
                }
            })
            .catch(e => console.error('[Realtime] Polling error:', e));
    }, 30000); // Poll every 30 seconds
});

window.RealtimeModule = RealtimeModule;
