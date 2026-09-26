import { config } from '../config';
import { logger } from '../utils/logger';

export class FabricClient {
  private isConnected: boolean = false;
  private channelName: string;
  private chaincodeName: string;

  constructor() {
    this.channelName = config.FABRIC_CHANNEL || 'votechannel';
    this.chaincodeName = config.FABRIC_CHAINCODE || 'votechain';
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    logger.info(
      `Initializing Fabric Client connection to channel '${this.channelName}' with chaincode '${this.chaincodeName}'`
    );
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    logger.info('Disconnecting Fabric Client');
    this.isConnected = false;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const fabricClient = new FabricClient();
