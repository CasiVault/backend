export interface IProtocolService {
  name: string;
  getAPY(): Promise<number>;
  getTreasuryBalance(): Promise<number>;
  getStakedBalance(): Promise<number>;
  deposit(): Promise<string>;
  withdraw(): Promise<string>;
  transferAllToProtocol(protocols: IProtocolService[]): Promise<void>;
}
