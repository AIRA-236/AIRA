import { DynamicCoevolutionProtocol } from '../../src/core/DCP';
import { MultiModalData } from '../../src/types';

describe('DynamicCoevolutionProtocol', () => {
  let dcp: DynamicCoevolutionProtocol;

  beforeEach(() => {
    dcp = new DynamicCoevolutionProtocol('test-key');
  });

  describe('encryptData', () => {
    it('should encrypt data with given sensitivity', async () => {
      const data = { test: 'data' };
      const result = await dcp.encryptData(data, 5);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('sensitivity', 5);
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('verifyConsensus', () => {
    it('should verify consensus for given data', async () => {
      const data = { proposal: 'test' };
      const result = await dcp.verifyConsensus(data);

      expect(result).toHaveProperty('achieved');
      expect(result).toHaveProperty('participants');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('updateTrustScore', () => {
    it('should update trust score for an agent', async () => {
      const agentId = 'test-agent';
      await dcp.updateTrustScore(agentId, 0.8);
      // Implementation specific tests would go here
    });
  });

  describe('processMultiModal', () => {
    it('should process multi-modal data', async () => {
      const data: MultiModalData = {
        text: 'test text',
        metadata: { source: 'test' }
      };
      const result = await dcp.processMultiModal(data);

      expect(result).toHaveProperty('processed', true);
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('timestamp');
    });
  });
}); 