import { WebClient } from "@slack/web-api";

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate?: boolean;
}

export interface SlackMessage {
  ts: string;
  text?: string;
  user?: string;
  channel?: string;
}

export class SlackConnector {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  /**
   * List channels the bot/user has access to.
   */
  async listChannels(): Promise<SlackChannel[]> {
    try {
      const response = await this.client.conversations.list({
        types: "public_channel,private_channel",
        limit: 200,
      });

      const channels = response.channels ?? [];
      return channels
        .filter((c): c is typeof c & { id: string; name: string } => !!c.id && !!c.name)
        .map((c) => ({
          id: c.id,
          name: c.name,
          isPrivate: c.is_private ?? undefined,
        }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to list channels";
      throw new Error(`Slack listChannels failed: ${message}`);
    }
  }

  /**
   * Search messages across the workspace.
   */
  async searchMessages(query: string, count = 20): Promise<SlackMessage[]> {
    try {
      const response = await this.client.search.messages({
        query,
        count,
      });

      const messages = response.messages?.matches ?? [];
      return messages
        .filter((m): m is typeof m & { ts: string } => !!m.ts)
        .map((m) => {
          const ch = m.channel as { id?: string; name?: string } | undefined;
          return {
            ts: m.ts,
            text: m.text ?? undefined,
            user: m.user ?? undefined,
            channel: ch?.id ?? ch?.name ?? undefined,
          };
        });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to search messages";
      throw new Error(`Slack searchMessages failed: ${message}`);
    }
  }

  /**
   * Post a message to a channel.
   */
  async postMessage(channel: string, text: string): Promise<string> {
    try {
      const response = await this.client.chat.postMessage({
        channel,
        text,
      });

      return response.ts ?? "";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post message";
      throw new Error(`Slack postMessage failed: ${message}`);
    }
  }

  /**
   * Get replies in a thread.
   */
  async getThread(channel: string, threadTs: string): Promise<SlackMessage[]> {
    try {
      const response = await this.client.conversations.replies({
        channel,
        ts: threadTs,
        limit: 100,
      });

      const messages = response.messages ?? [];
      return messages
        .filter((m): m is typeof m & { ts: string } => !!m.ts)
        .map((m) => ({
          ts: m.ts,
          text: m.text ?? undefined,
          user: m.user ?? undefined,
          channel,
        }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get thread";
      throw new Error(`Slack getThread failed: ${message}`);
    }
  }
}
