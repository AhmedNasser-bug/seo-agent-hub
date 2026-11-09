/**
 * GrowthBook A/B Testing & Stitch Page Injection SDK
 * Version: 2.0.0 (WAF SEC-01, REL-01, REL-04 Compliant)
 * 
 * Provides zero-backend client-side A/B experimentation across the 6 demographic cohorts:
 * 18-24 (Primary Testing Cohort), 25-34, 35-44, 45-54, 55-64, 65+
 */

(function () {
  'use strict';

  // Read config from script tag dataset
  const currentScript = document.currentScript || document.querySelector('script[data-client-key]');
  const API_HOST = (currentScript && currentScript.dataset.apiHost) || 'http://localhost:4325';
  const CLIENT_KEY = (currentScript && currentScript.dataset.clientKey) || 'sdk-dual-shield';
  const DEFAULT_COHORT = (currentScript && currentScript.dataset.defaultCohort) || '18-24';
  const TIMEOUT_MS = 5000; // REL-01 mandatory timeout

  // Cohort definitions
  const COHORTS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

  // Determine active cohort from URL param, localStorage, or default
  function resolveCohort() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCohort = urlParams.get('cohort');
      if (urlCohort && COHORTS.includes(urlCohort)) {
        localStorage.setItem('jules_stitch_cohort', urlCohort);
        return urlCohort;
      }
      const savedCohort = localStorage.getItem('jules_stitch_cohort');
      if (savedCohort && COHORTS.includes(savedCohort)) {
        return savedCohort;
      }
    } catch (e) {
      // Ignore localStorage errors in restricted contexts
    }
    return DEFAULT_COHORT;
  }

  // Generate or retrieve persistent anonymous user id for deterministic A/B hashing
  function getAnonymousId() {
    try {
      let id = localStorage.getItem('growthbook_anon_id');
      if (!id) {
        id = 'usr_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        localStorage.setItem('growthbook_anon_id', id);
      }
      return id;
    } catch (e) {
      return 'usr_ephemeral_' + Math.random().toString(36).substring(2, 9);
    }
  }

  const activeCohort = resolveCohort();
  const anonUserId = getAnonymousId();

  // Simple, deterministic Murmur-like hash for 50/50 traffic split
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // Fetch active experiment and Stitch variant from local Observation Deck / Mutation proxy
  async function initExperimentation() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(`${API_HOST}/api/experiments?cohort=${encodeURIComponent(activeCohort)}&user_id=${encodeURIComponent(anonUserId)}`, {
        signal: controller.signal,
        headers: { 'X-Client-Key': CLIENT_KEY }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return; // Graceful fallback: maintain control page unmodified
      }

      const data = await response.json();
      if (!data || !data.experiment || !data.variant) {
        return; // No active variant for this cohort, show control
      }

      const { experiment, variant } = data;

      // Deterministic traffic split (default 50/50)
      const bucket = hashString(anonUserId + experiment.experiment_key) % 100;
      const isVariantAssigned = bucket < (experiment.traffic_pct || 50);

      // Record impression
      recordTelemetry('impression', {
        experiment_key: experiment.experiment_key,
        cohort: activeCohort,
        variant_assigned: isVariantAssigned ? 'variant_b_stitch' : 'control_a',
        user_id: anonUserId
      });

      if (isVariantAssigned && variant.generated_html) {
        applyStitchMutation(variant);
      }

      // Attach floating inspector for testing cohort switching
      renderCohortInspector(activeCohort, isVariantAssigned, variant);

    } catch (err) {
      // REL-04 Graceful degradation: never break host page on network/proxy failure
      console.warn('[GrowthBook-Stitch] Experiencing offline mode or timeout, serving control page.', err.message);
    }
  }

  // Apply Stitch MCP generated DOM mutation cleanly
  function applyStitchMutation(variant) {
    if (!variant || !variant.generated_html) return;

    // Support targeting specific containers or full page injection
    const targetSelector = variant.target_selector || '.hero-title';
    const targetElement = document.querySelector(targetSelector);

    if (targetElement) {
      // If targeting hero container or specific block, replace inner content
      if (variant.page_type === 'landing_variant') {
        const wrapper = document.createElement('div');
        wrapper.className = 'stitch-variant-container';
        wrapper.innerHTML = variant.generated_html;

        // Apply smooth transition
        wrapper.style.opacity = '0';
        wrapper.style.transition = 'opacity 0.25s ease-in-out';
        
        targetElement.parentNode.insertBefore(wrapper, targetElement);
        targetElement.style.display = 'none';
        
        requestAnimationFrame(() => {
          wrapper.style.opacity = '1';
        });
      }
    }
  }

  // Lead capture auto-interceptor for forms on the host landing page
  function attachLeadInterceptors() {
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;

      const nameInput = form.querySelector('input[type="text"]');
      const emailInput = form.querySelector('input[type="email"]');
      const institutionInput = form.querySelectorAll('input[type="text"]')[1];
      const selectType = form.querySelector('select');

      const leadData = {
        name: (nameInput && nameInput.value) || 'Visitor',
        email: (emailInput && emailInput.value) || '',
        institution: (institutionInput && institutionInput.value) || 'Direct Website Outreach',
        inquiry_type: (selectType && selectType.value) || 'Clinical Pilot Inquiry',
        cohort: activeCohort,
        source: window.location.pathname
      };

      if (leadData.email) {
        // Send telemetry & lead record asynchronously
        recordTelemetry('conversion', {
          cohort: activeCohort,
          user_id: anonUserId,
          lead: leadData
        });

        fetch(`${API_HOST}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData)
        }).catch(() => {});
      }
    }, true);
  }

  // Record Telemetry to local proxy
  function recordTelemetry(eventType, payload) {
    try {
      fetch(`${API_HOST}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          ...payload
        })
      }).catch(() => {});
    } catch (e) {}
  }

  // Render floating inspection badge allowing one-click cohort switching
  function renderCohortInspector(currentCohort, isVariant, variantData) {
    if (document.getElementById('growthbook-stitch-inspector')) return;

    const badge = document.createElement('div');
    badge.id = 'growthbook-stitch-inspector';
    badge.style.cssText = `
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      font-size: 12px;
      line-height: 1.4;
      background: rgba(11, 28, 48, 0.95);
      backdrop-filter: blur(8px);
      color: #FFFFFF;
      padding: 0.625rem 1rem;
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      gap: 0.625rem;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
    `;

    const statusDot = isVariant ? '#10B981' : '#60A5FA';
    const statusText = isVariant ? 'Stitch Variant B' : 'Control A';

    badge.innerHTML = `
      <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusDot}; box-shadow: 0 0 8px ${statusDot};"></span>
      <span style="font-weight: 600; color: #F1F5F9;">Cohort: ${currentCohort}</span>
      <span style="color: #94A3B8;">|</span>
      <span style="color: ${statusDot}; font-weight: 500;">${statusText}</span>
      <span style="font-size: 10px; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; color: #E2E8F0;">Switch</span>
    `;

    badge.addEventListener('click', function () {
      const nextIndex = (COHORTS.indexOf(currentCohort) + 1) % COHORTS.length;
      const nextCohort = COHORTS[nextIndex];
      try {
        localStorage.setItem('jules_stitch_cohort', nextCohort);
      } catch (e) {}
      const url = new URL(window.location.href);
      url.searchParams.set('cohort', nextCohort);
      window.location.href = url.toString();
    });

    document.body.appendChild(badge);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initExperimentation();
      attachLeadInterceptors();
    });
  } else {
    initExperimentation();
    attachLeadInterceptors();
  }

})();
