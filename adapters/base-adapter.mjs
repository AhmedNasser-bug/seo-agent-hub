/**
 * Base Agent Adapter Interface
 * Defines the contract for all agent execution engines (Antigravity, Jules, and future pluggable agents).
 */
export class BaseAgentAdapter {
  constructor(config = {}) {
    this.name = config.name || 'unnamed-agent';
    this.displayName = config.displayName || this.name;
    this.type = config.type || 'generic'; // 'remote_session' | 'cli_extension' | 'local_mcp'
    this.status = config.status || 'active'; // 'active_primary' | 'sunsetting' | 'experimental' | 'inactive'
    this.sunsetScheduled = Boolean(config.sunsetScheduled);
    this.sunsetNotice = config.sunsetNotice || null;
    this.supportedRoles = config.supportedRoles || ['orchestrator', 'research', 'appearance', 'validation'];
    this.metadata = config.metadata || {};
  }

  isSunsetting() {
    return this.sunsetScheduled;
  }

  getCapabilities() {
    return {
      name: this.name,
      displayName: this.displayName,
      type: this.type,
      status: this.status,
      sunsetScheduled: this.sunsetScheduled,
      sunsetNotice: this.sunsetNotice,
      supportedRoles: this.supportedRoles,
      metadata: this.metadata
    };
  }

  async healthCheck() {
    return {
      healthy: true,
      adapter: this.name,
      status: this.status,
      sunsetScheduled: this.sunsetScheduled
    };
  }

  /**
   * Execute an agent turn or session
   * @param {Object} params
   * @param {string} params.role - 'orchestrator' | 'research' | 'appearance' | 'validation'
   * @param {string} params.message - User prompt or task description
   * @param {Object} params.context - Context metadata, insights, database references
   * @returns {Promise<{reply: string, metadata: Object}>}
   */
  async executeSession({ role, message, context = {} }) {
    throw new Error(`executeSession() must be implemented by adapter subclass: ${this.name}`);
  }
}
