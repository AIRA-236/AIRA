import { AIAgent } from '../src/agents/AIAgent';
import { DynamicCoevolutionProtocol } from '../src/protocols/DynamicCoevolutionProtocol';
import { CognitiveNetworkFabric } from '../src/networks/CognitiveNetworkFabric';
import { IntelligentContractEvolutionSystem } from '../src/contracts/IntelligentContractEvolutionSystem';
import { Result } from '../src/utils/common';

describe('AIRA Integration Tests', () => {
  let agent: AIAgent;
  let protocol: DynamicCoevolutionProtocol;
  let network: CognitiveNetworkFabric;
  let contractSystem: IntelligentContractEvolutionSystem;

  beforeEach(() => {
    protocol = new DynamicCoevolutionProtocol({
      encryptionStrength: 2,
      validationRules: ['basic', 'advanced'],
      trustThreshold: 0.7
    });

    network = new CognitiveNetworkFabric();

    contractSystem = new IntelligentContractEvolutionSystem(
      process.env.ETHEREUM_RPC_URL || 'http://localhost:8545'
    );

    agent = new AIAgent(
      process.env.OPENAI_API_KEY || '',
      'test-agent',
      [
        {
          name: 'textAnalysis',
          description: 'Analyze text content',
          parameters: ['content'],
          confidence: 0.9
        }
      ]
    );
  });

  describe('Agent Collaboration', () => {
    test('should successfully initiate collaboration', async () => {
      const collaborationResult = await protocol.initiateCollaboration({
        agents: ['agent1', 'agent2'],
        task: 'Test collaboration task'
      });

      expect(collaborationResult).toHaveProperty('collaborationId');
      expect(collaborationResult.status).toBe('initiated');
      expect(collaborationResult.encryptedChannel).toBe(true);
    });

    test('should achieve consensus between agents', async () => {
      const consensusResult = await protocol.achieveConsensus(
        'Test task',
        ['agent1', 'agent2']
      );

      expect(consensusResult).toHaveProperty('confidence');
      expect(consensusResult.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('Cognitive Network', () => {
    test('should process thought chain', async () => {
      const thoughtChain = await network.processThoughtChain(
        'Analyze the impact of AI on society'
      );

      expect(thoughtChain).toHaveProperty('steps');
      expect(thoughtChain).toHaveProperty('finalConclusion');
      expect(thoughtChain.steps.length).toBeGreaterThan(0);
    });

    test('should generate neural signature', async () => {
      const signature = await network.generateNeuralSignature(
        'Test pattern'
      );

      expect(signature).toHaveProperty('pattern');
      expect(signature).toHaveProperty('strength');
      expect(signature.strength).toBeGreaterThan(0);
    });
  });

  describe('Contract Evolution', () => {
    const testAddress = '0x1234567890123456789012345678901234567890';

    test('should optimize contract', async () => {
      await expect(
        contractSystem.optimizeContract(testAddress)
      ).resolves.not.toThrow();
    });

    test('should verify contract intent', async () => {
      const intent = {
        purpose: 'Test contract',
        constraints: ['No external calls'],
        expectedBehavior: 'Simple storage',
        securityRequirements: ['Basic validation']
      };

      const result = await contractSystem.verifyIntent(testAddress, intent);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Utility Functions', () => {
    test('Result type should handle success case', () => {
      const result = Result.ok<number>(42);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(42);
    });

    test('Result type should handle error case', () => {
      const error = new Error('Test error');
      const result = Result.err<number, Error>(error);
      expect(result.isErr()).toBe(true);
      expect(() => result.unwrap()).toThrow(error);
    });

    test('Result type should support mapping', () => {
      const result = Result.ok<number>(42)
        .map(x => x * 2)
        .map(x => x.toString());
      
      expect(result.unwrap()).toBe('84');
    });
  });
}); 