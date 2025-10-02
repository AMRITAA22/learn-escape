import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    public socket: Socket | null = null;

    connect(): void {
        if (this.socket) return; // Prevent multiple connections
        this.socket = io(SOCKET_URL);
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('Socket disconnected');
        }
    }

    emit(event: string, data: any): void {
        this.socket?.emit(event, data);
    }

    on(event: string, callback: (data: any) => void): void {
        this.socket?.on(event, callback);
    }

    off(event: string): void {
        this.socket?.off(event);
    }
}

export const socketService = new SocketService();