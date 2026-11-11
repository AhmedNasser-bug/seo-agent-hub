import { BaseAgentAdapter } from './base-adapter.mjs';

/**
 * Generic Pluggable Agent Adapter
 * Provides a blueprint for adding future agents (e.g., Claude Code, Gemini CLI, Codex, OpenOperator)
 * with zero modifications to the core SEO Agent Hub orchestration layer.
 */
export class GenericAgentAdapter extends BaseAgentAdapter {
  constructor(config = {}) {
    super({
      name: config.name || 'custom-agent',
      displayName: config.displayName || 'Custom Pluggable Agent',
      type: config.type || 'pluggable_driver',
      status: config.status || 'experimental',
      sunsetScheduled: false,
      sunsetNotice: null,
      supportedRoles: config.supportedRoles || ['orchestrator', 'research', 'appearance', 'validation'],
      metadata: {
        pluggable: true,
        handler: config.handler || null,
        ...config.metadata
      }
    });
    this.customHandler = config.handler || null;
  }

  async healthCheck() {
    return {
      healthy: true,
      adapter: this.name,
      status: this.status,
      type: this.type,
      pluggable: true
    };
  }

  async executeSession({ role, message, context = {} }) {
    if (typeof this.customHandler === 'function') {
      return await this.customHandler({ role, message, context });
    }
    return {
      adapter: this.name,
      role,
      reply: `[${this.displayName}] Processed prompt: "${message}".`,
      timestamp: new Date().toISOString(),
      metadata: context
    };
  }
}
