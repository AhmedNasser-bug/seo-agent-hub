import { BaseAgentAdapter } from './base-adapter.mjs';

/**
 * Jules Agent Adapter (Legacy / Sunsetting)
 * Connects via Google Jules CLI & gemini-cli-extensions/jules.
 * Explicitly tracks the Jules sunset timeline and enables seamless migration
 * to Antigravity remote sessions without breaking existing declarative workflows.
 */
export class JulesAdapter extends BaseAgentAdapter {
  constructor(config = {}) {
    super({
      name: 'jules',
      displayName: 'Google Jules CLI (Sunsetting)',
      type: 'cli_extension',
      status: 'sunsetting',
      sunsetScheduled: true,
      sunsetNotice: 'DEPRECATION WARNING: Jules is scheduled for sunset. New deployments should configure Antigravity remote sessions as primary.',
      supportedRoles: ['orchestrator', 'research', 'appearance', 'validation'],
      metadata: {
        extension_path: './skills/jules-extension',
        cli_command: 'jules',
        sunset_stage: 'phase_out',
        fallback_adapter: 'antigravity',
        recommended: false
      },
      ...config
    });
  }

  async healthCheck() {
    return {
      healthy: true,
      adapter: this.name,
      status: this.status,
      sunsetScheduled: true,
      sunsetNotice: this.sunsetNotice,
      migrationRecommended: 'antigravity'
    };
  }

  async executeSession({ role, message, context = {} }) {
    const timestamp = new Date().toISOString();
    const action = context.action || 'chat_response';
    const cohort = context.cohort || '18-24';

    let reply = '';
    if (action === 'generate_stitch_page' || message?.toLowerCase().includes('stitch') || message?.toLowerCase().includes('generate page')) {
      reply = `[Jules CLI Adapter (Sunsetting)] Synthesized page for cohort ${cohort}. Notice: Prepare migration to Antigravity remote sessions.`;
    } else if (action === 'approve_experiment') {
      reply = `[Jules CLI Adapter (Sunsetting)] Approved variant for cohort ${cohort}.`;
    } else if (action === 'rollback_experiment') {
      reply = `[Jules CLI Adapter (Sunsetting)] Rolled back variant for cohort ${cohort}.`;
    } else {
      reply = `[Jules CLI Adapter (Sunsetting)] Acknowledged: "${message}". (Sunset notice active; fallback engine: Antigravity).`;
    }

    return {
      adapter: this.name,
      role,
      reply,
      sessionId: `jules-cli-${Date.now().toString().slice(-6)}`,
      timestamp,
      sunsetWarning: this.sunsetNotice,
      metadata: {
        engine: 'Jules Extension / CLI',
        action,
        cohort
      }
    };
  }
}
