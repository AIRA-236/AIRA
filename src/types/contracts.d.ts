declare module 'ethers' {
  export class JsonRpcProvider {
    constructor(url: string);
    getCode(address: string): Promise<string>;
    getHistory(address: string): Promise<any[]>;
  }

  export class Provider {
    getCode(address: string): Promise<string>;
    getHistory(address: string): Promise<any[]>;
  }
}

declare module 'events' {
  export class EventEmitter {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    emit(event: string | symbol, ...args: any[]): boolean;
  }
} 