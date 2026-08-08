import { describe, it, expect } from 'vitest';
import { NETWORK_CONFIGS, isNetworkId, resolveNetwork, parseNetworkFlag } from '../src/network';

describe('ZK Campus Vault Infrastructure Tests', () => {
  describe('Network Configuration', () => {
    it('supports standard Midnight networks', () => {
      expect(NETWORK_CONFIGS.undeployed).toBeDefined();
      expect(NETWORK_CONFIGS.preview).toBeDefined();
      expect(NETWORK_CONFIGS.preprod).toBeDefined();
    });

    it('correctly validates network IDs', () => {
      expect(isNetworkId('undeployed')).toBe(true);
      expect(isNetworkId('preview')).toBe(true);
      expect(isNetworkId('preprod')).toBe(true);
      expect(isNetworkId('mainnet')).toBe(false);
      expect(isNetworkId(123)).toBe(false);
    });

    it('parses --network CLI flag', () => {
      expect(parseNetworkFlag(['node', 'script.js', '--network', 'preview'])).toBe('preview');
      expect(parseNetworkFlag(['node', 'script.js', '--network=preprod'])).toBe('preprod');
      expect(parseNetworkFlag(['node', 'script.js'])).toBeNull();
    });

    it('resolves default network as undeployed when no config or flag is passed', () => {
      const res = resolveNetwork({ argv: ['node', 'script.js'], cwd: '/tmp/nonexistent-path' });
      expect(res.network).toBe('undeployed');
      expect(res.config.node).toBe('ws://127.0.0.1:9944');
    });
  });

  describe('Credential Data Logic', () => {
    it('calculates GPA integer conversions accurately (x100)', () => {
      const gpaFloat = 3.85;
      const gpaX100 = Math.round(gpaFloat * 100);
      expect(gpaX100).toBe(385);

      const minGpaRequired = 3.50;
      const minGpaX100 = Math.round(minGpaRequired * 100);
      expect(gpaX100 >= minGpaX100).toBe(true);
    });

    it('correctly rejects GPA below threshold', () => {
      const gpaFloat = 3.20;
      const gpaX100 = Math.round(gpaFloat * 100);
      const minGpaRequired = 3.50;
      const minGpaX100 = Math.round(minGpaRequired * 100);
      expect(gpaX100 >= minGpaX100).toBe(false);
    });
  });
});
