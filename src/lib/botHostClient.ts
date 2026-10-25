/**
 * Render 1 Management API Client (Server-Side Only)
 * Securely communicates over HTTPS with Render 1 where Discord bot processes run.
 * Handles bot provisioning, startup, shutdown, restarts, telemetry, and log retrieval.
 * Never leaks API keys or bot tokens to the client.
 */

export interface RemoteBotStatus {
  id: string;
  displayName: string;
  applicationId?: string;
  botId?: string;
  username?: string;
  avatarUrl?: string;
  ownerAccount?: string;
  desiredEnabled: boolean;
  observedState: 'online' | 'offline' | 'connecting' | 'error' | 'stopped';
  statusText: string;
  statusType?: string;
  prefix: string;
  assignedCommands: string[];
  enabledModules: string[];
  version: string;
  gatewayStatus: 'connected' | 'connecting' | 'disconnected';
  uptimeSeconds: number | null;
  pingMs: number | null;
  guildCount: number;
  lastStartedAt: string | null;
  lastStatusUpdateAt: string;
  lastError: string | null;
  configuredInEnv: boolean;
  resourceUsage?: {
    memoryMb: number;
  };
}

export interface SanitizedLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

class BotHostClient {
  private get baseUrl(): string {
    return (process.env.BOT_HOST_API_URL || 'http://localhost:4000').replace(/\/$/, '');
  }

  private get apiKey(): string {
    return process.env.BOT_HOST_API_KEY || 'ongrywolf_secret_host_key';
  }

  private async fetchWithTimeout(endpoint: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          ...(options.headers || {}),
        },
        cache: 'no-store',
      });
      return res;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Health probe for Render 1 Bot Hosting
   */
  public async checkHealth(): Promise<{
    ok: boolean;
    uptimeSeconds?: number;
    totalBots?: number;
    onlineBots?: number;
    error?: string;
  }> {
    try {
      const res = await this.fetchWithTimeout('/health', { method: 'GET' }, 3000);
      if (!res.ok) {
        return { ok: false, error: `Remote host responded with HTTP ${res.status}` };
      }
      const data = await res.json();
      return {
        ok: true,
        uptimeSeconds: data.uptimeSeconds,
        totalBots: data.totalBots,
        onlineBots: data.onlineBots,
      };
    } catch (err: any) {
      return { ok: false, error: err.name === 'AbortError' ? 'Host connection timed out' : err.message };
    }
  }

  /**
   * Lists all bots running on Render 1
   */
  public async listBots(): Promise<{
    success: boolean;
    bots: RemoteBotStatus[];
    remoteAvailable: boolean;
    error?: string;
  }> {
    try {
      const res = await this.fetchWithTimeout('/api/managed-bots', { method: 'GET' });
      if (!res.ok) {
        return { success: false, bots: [], remoteAvailable: false, error: `HTTP ${res.status}` };
      }
      const data = await res.json();
      return {
        success: true,
        bots: data.bots || [],
        remoteAvailable: true,
      };
    } catch (err: any) {
      return {
        success: false,
        bots: [],
        remoteAvailable: false,
        error: err.name === 'AbortError' ? 'Remote host timed out' : err.message,
      };
    }
  }

  /**
   * Gets single bot runtime status from Render 1
   */
  public async getBot(id: string): Promise<{
    success: boolean;
    bot?: RemoteBotStatus;
    remoteAvailable: boolean;
    error?: string;
  }> {
    try {
      const res = await this.fetchWithTimeout(`/api/managed-bots/${id}`, { method: 'GET' });
      if (!res.ok) {
        return { success: false, remoteAvailable: false, error: `HTTP ${res.status}` };
      }
      const data = await res.json();
      return { success: true, bot: data.bot, remoteAvailable: true };
    } catch (err: any) {
      return {
        success: false,
        remoteAvailable: false,
        error: err.name === 'AbortError' ? 'Remote host timed out' : err.message,
      };
    }
  }

  /**
   * Registers/provisions a new Discord bot to run on Render 1
   */
  public async registerBot(payload: {
    id?: string;
    displayName: string;
    applicationId: string;
    token: string;
    defaultPrefix?: string;
    defaultStatusText?: string;
    ownerAccount?: string;
    enabledModules?: string[];
    desiredEnabled?: boolean;
  }): Promise<{ success: boolean; bot?: RemoteBotStatus; error?: string }> {
    try {
      const res = await this.fetchWithTimeout('/api/managed-bots', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || `HTTP ${res.status}` };
      }
      return { success: true, bot: data.bot };
    } catch (err: any) {
      return {
        success: false,
        error: err.name === 'AbortError' ? 'Remote host timed out during provisioning' : err.message,
      };
    }
  }

  /**
   * Starts an idle or stopped bot on Render 1
   */
  public async startBot(id: string): Promise<{ success: boolean; status?: RemoteBotStatus; error?: string }> {
    try {
      const res = await this.fetchWithTimeout(`/api/managed-bots/${id}/start`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || `HTTP ${res.status}` };
      return { success: true, status: data.status };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Stops a running bot on Render 1
   */
  public async stopBot(id: string): Promise<{ success: boolean; status?: RemoteBotStatus; error?: string }> {
    try {
      const res = await this.fetchWithTimeout(`/api/managed-bots/${id}/stop`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || `HTTP ${res.status}` };
      return { success: true, status: data.status };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Restarts a bot process on Render 1
   */
  public async restartBot(id: string): Promise<{ success: boolean; status?: RemoteBotStatus; error?: string }> {
    try {
      const res = await this.fetchWithTimeout(`/api/managed-bots/${id}/restart`, { method: 'POST' }, 8000);
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || `HTTP ${res.status}` };
      return { success: true, status: data.status };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Updates configuration on Render 1
   */
  public async updateConfig(
    id: string,
    updates: {
      displayName?: string;
      statusText?: string;
      prefix?: string;
      token?: string;
      enabledModules?: string[];
      desiredEnabled?: boolean;
    }
  ): Promise<{ success: boolean; status?: RemoteBotStatus; error?: string }> {
    try {
      const res = await this.fetchWithTimeout(`/api/managed-bots/${id}/config`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || `HTTP ${res.status}` };
      return { success: true, status: data.status };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Retrieves sanitized recent logs from Render 1
   */
  public async getLogs(id: string): Promise<{ success: boolean; logs: SanitizedLogEntry[]; error?: string }> {
    try {
      const res = await this.fetchWithTimeout(`/api/managed-bots/${id}/logs`, { method: 'GET' });
      const data = await res.json();
      if (!res.ok) return { success: false, logs: [], error: data.error || `HTTP ${res.status}` };
      return { success: true, logs: data.logs || [] };
    } catch (err: any) {
      return { success: false, logs: [], error: err.message };
    }
  }

  /**
   * Permanently deletes a bot from Render 1
   */
  public async deleteBot(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.fetchWithTimeout(`/api/managed-bots/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || `HTTP ${res.status}` };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const botHostClient = new BotHostClient();
