export interface IProtocolService {
    name: string;
    getAPY(): Promise<number>;
    getTreasuryBalance(): Promise<number>;
    deposit(): Promise<string>;
    withdraw(): Promise<string>;
  }
  