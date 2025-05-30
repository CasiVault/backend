import axios, { AxiosResponse } from 'axios';

export enum GameStatus {
  CREATED = 0,
  PLAYER_JOINED = 1,
  FINISHED = 2
}

export interface GameStatusNode {
  game_id: number;
  status: number;
  winner: string;
  p1: string;
  p2: string;
}

export interface GameStatusChangeEvent {
  game_id: number;
  status: GameStatus;
  winner: string;
  p1: string;
  p2: string;
}

interface GameStatusEdge {
  node: GameStatusNode;
}

interface GameStatusEventModels {
  totalCount: number;
  edges: GameStatusEdge[];
}

interface GraphQLResponse {
  data: {
    dojoStarterContainerModels: GameStatusEventModels;
  };
}

interface GameStatusListener {
  start(): void;
  stop(): void;
  onGameStatusChange?: (gameStatus: GameStatusNode[]) => void;
  onGameCreated?: (gameStatus: GameStatusNode) => void;
  onError?: (error: Error) => void;
}

class GameStatusListenerImpl implements GameStatusListener {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isListening = false;
  private pollingIntervalMs = 5000; // 5 seconds
  private httpUrl: string;
  private lastStatusMap: Map<number, GameStatusNode> = new Map();

  public onGameStatusChange?: (gameStatus: GameStatusNode[]) => void;
  public onGameCreated?: (gameStatus: GameStatusNode) => void;
  public onError?: (error: Error) => void;

  constructor(httpUrl: string = 'http://43.167.194.126:8080/graphql') {
    this.httpUrl = httpUrl;
    console.log(`[GameStatusListener] Will poll: ${httpUrl} every ${this.pollingIntervalMs}ms`);
  }

  start(): void {
    if (this.isListening) {
      console.log('GameStatusListener is already listening');
      return;
    }

    this.isListening = true;
    console.log('[GameStatusListener] Starting HTTP polling...');
    
    // Start immediately
    this.pollGameStatus();
    
    // Set up interval
    this.pollingInterval = setInterval(() => {
      this.pollGameStatus();
    }, this.pollingIntervalMs);
  }

  stop(): void {
    this.isListening = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    console.log('GameStatusListener stopped');
  }

  private async pollGameStatus(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      console.log('[GameStatusListener] Polling for game status updates...');
      
      const response: AxiosResponse<GraphQLResponse> = await axios.post(
        this.httpUrl,
        {
          query: `query DojostarterGameStatusEventEvents {
            dojoStarterContainerModels {
              totalCount
              edges {
                node {
                  game_id
                  status
                  winner
                  p1
                  p2
                }
              }
            }
          }`
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data && response.data.data) {
        this.processGameStatusData(response.data.data.dojoStarterContainerModels);
      } else {
        console.warn('[GameStatusListener] No data received from GraphQL endpoint');
      }

    } catch (error) {
      console.error('[GameStatusListener] Polling error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        statusText: axios.isAxiosError(error) ? error.response?.statusText : undefined,
      });
      
      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error('Unknown polling error'));
      }
    }
  }

  private processGameStatusData(gameStatusModels: GameStatusEventModels): void {
    if (!gameStatusModels || !gameStatusModels.edges) {
      return;
    }

    const currentStatuses = gameStatusModels.edges.map(edge => edge.node);
    const changedStatuses: GameStatusNode[] = [];
    const newGames: GameStatusNode[] = [];

    // Check for status changes
    currentStatuses.forEach(gameStatus => {
      const lastGameStatus = this.lastStatusMap.get(gameStatus.game_id);
      
      if (lastGameStatus === undefined) {
        // New game detected
        console.log(`[GameStatusListener] New game detected: ${gameStatus.game_id} with status ${gameStatus.status}`);
        newGames.push(gameStatus);
        changedStatuses.push(gameStatus);
        
        // If status is 0 (CREATED), trigger game creation
        if (gameStatus.status === GameStatus.CREATED) {
          console.log(`[GameStatusListener] Game ${gameStatus.game_id} needs to be created in database`);
          if (this.onGameCreated) {
            this.onGameCreated(gameStatus);
          }
        }
      } else if (this.hasGameStatusChanged(lastGameStatus, gameStatus)) {
        // Status changed
        console.log(`[GameStatusListener] Game ${gameStatus.game_id} status changed:`, {
          from: { status: lastGameStatus.status, p1: lastGameStatus.p1, p2: lastGameStatus.p2, winner: lastGameStatus.winner },
          to: { status: gameStatus.status, p1: gameStatus.p1, p2: gameStatus.p2, winner: gameStatus.winner }
        });
        changedStatuses.push(gameStatus);
      }

      // Update last known status
      this.lastStatusMap.set(gameStatus.game_id, { ...gameStatus });
    });

    // Log summary
    console.log(`[GameStatusListener] Total games: ${currentStatuses.length}, New: ${newGames.length}, Changed: ${changedStatuses.length}`);
    
    if (currentStatuses.length > 0) {
      const statusSummary = currentStatuses.map(gs => {
        const statusName = this.getStatusName(gs.status);
        const hasP2 = gs.p2 !== "0x0";
        return `${gs.game_id}:${statusName}${hasP2 ? '(2P)' : '(1P)'}`;
      }).join(', ');
      console.log('[GameStatusListener] Current game statuses:', statusSummary);
    }

    // Call callback for all changed statuses
    if (changedStatuses.length > 0 && this.onGameStatusChange) {
      this.onGameStatusChange(changedStatuses);
    }
  }

  private hasGameStatusChanged(oldStatus: GameStatusNode, newStatus: GameStatusNode): boolean {
    return (
      oldStatus.status !== newStatus.status ||
      oldStatus.p1 !== newStatus.p1 ||
      oldStatus.p2 !== newStatus.p2 ||
      oldStatus.winner !== newStatus.winner
    );
  }

  private getStatusName(status: number): string {
    switch (status) {
      case GameStatus.CREATED:
        return 'Created';
      case GameStatus.PLAYER_JOINED:
        return 'Player Joined';
      case GameStatus.FINISHED:
        return 'Finished';
      default:
        return `Unknown(${status})`;
    }
  }

  // Method to get current connection status
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' {
    return this.isListening ? 'connected' : 'disconnected';
  }

  // Method to manually trigger a poll (useful for testing)
  async triggerPoll(): Promise<void> {
    await this.pollGameStatus();
  }

  // Method to get current polling interval
  getPollingInterval(): number {
    return this.pollingIntervalMs;
  }

  // Method to change polling interval
  setPollingInterval(intervalMs: number): void {
    this.pollingIntervalMs = intervalMs;
    
    if (this.isListening) {
      // Restart with new interval
      this.stop();
      this.start();
    }
    
    console.log(`[GameStatusListener] Polling interval changed to ${intervalMs}ms`);
  }

  // Method to get last known statuses
  getLastKnownStatuses(): Map<number, GameStatusNode> {
    return new Map(this.lastStatusMap);
  }

  // Method to get games by status
  getGamesByStatus(status: GameStatus): GameStatusNode[] {
    return Array.from(this.lastStatusMap.values()).filter(game => game.status === status);
  }

  // Method to get created games (status = 0)
  getCreatedGames(): GameStatusNode[] {
    return this.getGamesByStatus(GameStatus.CREATED);
  }
}

// Create and export a singleton instance
const gameStatusListener = new GameStatusListenerImpl();

export { gameStatusListener, GameStatusListener };

// Helper function to convert status
export function parseGameStatus(statusString: string): GameStatus | null {
  const statusCode = parseInt(statusString);
  if (Object.values(GameStatus).includes(statusCode)) {
    return statusCode as GameStatus;
  }
  return null;
}

export function getGameStatusName(status: GameStatus): string {
  switch (status) {
    case GameStatus.CREATED:
      return 'Created';
    case GameStatus.PLAYER_JOINED:
      return 'Player Joined';
    case GameStatus.FINISHED:
      return 'Finished';
    default:
      return 'Unknown';
  }
}

// Remove auto-start and process handlers since server will manage these
// gameStatusListener.start();
// 
// gameStatusListener.onGameStatusChange = (gameStatuses: GameStatusNode[]) => {
//   gameStatuses.forEach(gameStatus => {
//     console.log(`Game ${gameStatus.game_id} status changed to: ${gameStatus.status}`);
//   });
// };
// 
// gameStatusListener.onError = (error: Error) => {
//   console.error('GameStatusListener error:', error.message);
// };
// 
// process.on('SIGINT', () => {
//   console.log('Shutting down GameStatusListener...');
//   gameStatusListener.stop();
//   process.exit(0);
// });
// 
// process.on('SIGTERM', () => {
//   console.log('Shutting down GameStatusListener...');
//   gameStatusListener.stop();
//   process.exit(0);
// });