import { IProtocolService } from "./IProtocolService";

export async function getBestProtocol(protocols: IProtocolService[]): Promise<IProtocolService> {
  let best = protocols[0];
  let maxAPY = await best.getAPY();

  for (const p of protocols.slice(1)) {
    const apy = await p.getAPY();
    if (apy > maxAPY) {
      best = p;
      maxAPY = apy;
    }
  }

  console.log(`Best protocol: ${best.name} with APY: ${maxAPY}`);
  return best;
}
