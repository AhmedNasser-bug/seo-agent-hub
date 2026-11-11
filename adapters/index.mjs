import { AntigravityAdapter } from './antigravity-adapter.mjs';
import { JulesAdapter } from './jules-adapter.mjs';
import { GenericAgentAdapter } from './generic-adapter.mjs';

/**
 * Universal Agent Registry & Router
 * Decouples the SEO Agent Hub from single-agent dependencies.
 * Manages Antigravity remote sessions (active primary), Google Jules (sunsetting),
 * and future pluggable agents.
 */
class AgentRegistry {
  constructor() {
    this.adapters = new Map();
    this.activeAdapterName = process.env.PRIMARY_AGENT_ADAPTER || 'antigravity';

    // Register built-in adapters
    this.register(new AntigravityAdapter());
    this.register(new JulesAdapter());
  }

  /**
   * Register a new agent adapter
   * @param {import('./base-adapter.mjs').BaseAgentAdapter} adapter
   */
  register(adapter) {
    if (!adapter || !adapter.name) {
      throw new Error('Adapter must provide a valid name');
    }
    this.adapters.set(adapter.name, adapter);
  }

  get(name) {
    return this.adapters.get(name);
  }

  has(name) {
    return this.adapters.has(name);
  }

  getActiveAdapter() {
    let adapter = this.adapters.get(this.activeAdapterName);
    if (!adapter) {
      console.warn(`[AgentRegistry] Active adapter '${this.activeAdapterName}' not found. Falling back to 'antigravity'.`);
      adapter = this.adapters.get('antigravity');
      this.activeAdapterName = 'antigravity';
    }
    return adapter;
  }

  setActiveAdapter(name) {
    if (!this.adapters.has(name)) {
      throw new Error(`Cannot set active adapter: '${name}' is not registered. Available: ${Array.from(this.adapters.keys()).join(', ')}`);
    }
    const previous = this.activeAdapterName;
    this.activeAdapterName = name;
    return {
      previous,
      current: name,
      adapter: this.adapters.get(name).getCapabilities()
    };
  }

  listAdapters() {
    const list = [];
    for (const [name, adapter] of this.adapters.entries()) {
      list.push({
        ...adapter.getCapabilities(),
        isActive: name === this.activeAdapterName
      });
    }
    return list;
  }

  async healthCheckAll() {
    const results = {};
    for (const [name, adapter] of this.adapters.entries()) {
      results[name] = await adapter.healthCheck();
    }
    return {
      activePrimary: this.activeAdapterName,
      adapters: results
    };
  }

  /**
   * Execute an agent session with automatic fallback
   */
  async executeSession({ role, message, context = {} }) {
    const primary = this.getActiveAdapter();
    try {
      return await primary.executeSession({ role, message, context });
    } catch (err) {
      console.error(`[AgentRegistry] Error executing session on '${primary.name}': ${err.message}. Triggering fallback to 'antigravity'.`);
      const fallback = this.get('antigravity');
      if (fallback && fallback !== primary) {
        return await fallback.executeSession({
          role,
          message,
          context: { ...context, fallback_from: primary.name, fallback_reason: err.message }
        });
      }
      throw err;
    }
  }
}

export const agentRegistry = new AgentRegistry();
export { AntigravityAdapter, JulesAdapter, GenericAgentAdapter };
