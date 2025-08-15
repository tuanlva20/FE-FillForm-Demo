declare module 'socket.io-client' {
  interface SocketOptions {
    path?: string;
    withCredentials?: boolean;
    transports?: string[];
    autoConnect?: boolean;
    forceNew?: boolean;
    timeout?: number;
    upgrade?: boolean;
    rememberUpgrade?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    maxReconnectionAttempts?: number;
    secure?: boolean;
    rejectUnauthorized?: boolean;
  }

  interface Socket {
    connected: boolean;
    id?: string;
    connect(): void;
    disconnect(): void;
    close(): void;
    emit(event: string, ...args: any[]): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback?: (...args: any[]) => void): void;
    io: {
      opts: SocketOptions;
    };
  }

  function io(url?: string, opts?: SocketOptions): Socket;
  export = io;
}
