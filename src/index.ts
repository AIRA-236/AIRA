import 'dotenv/config';
import express from 'express';
import { AIAgent } from './agents/AIAgent';
import { DynamicCoevolutionProtocol } from './protocols/DynamicCoevolutionProtocol';
import { CognitiveNetworkFabric } from './networks/CognitiveNetworkFabric';
import { IntelligentContractEvolutionSystem } from './contracts/IntelligentContractEvolutionSystem';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize core components
const protocol = new DynamicCoevolutionProtocol({
  encryptionStrength: 2,
  validationRules: ['basic', 'advanced'],
  trustThreshold: 0.7
});

const network = new CognitiveNetworkFabric();

const contractSystem = new IntelligentContractEvolutionSystem(
  process.env.ETHEREUM_RPC_URL || 'http://localhost:8545'
);

// Create initial AI agent
const agent = new AIAgent(
  process.env.OPENAI_API_KEY || '',
  'primary-agent',
  [
    {
      name: 'textAnalysis',
      description: 'Analyze text content',
      parameters: ['content'],
      confidence: 0.9
    },
    {
      name: 'patternRecognition',
      description: 'Identify patterns in data',
      parameters: ['data'],
      confidence: 0.85
    }
  ]
);

// API Routes
app.post('/tasks', async (req, res) => {
  try {
    const result = await agent.processTask(req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/agents', async (req, res) => {
  try {
    const newAgent = new AIAgent(
      process.env.OPENAI_API_KEY || '',
      req.body.id,
      req.body.capabilities
    );
    res.json({ success: true, agent: newAgent });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/collaborate', async (req, res) => {
  try {
    const result = await protocol.initiateCollaboration({
      agents: req.body.agents,
      task: req.body.task
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/contracts/optimize', async (req, res) => {
  try {
    await contractSystem.optimizeContract(req.body.address);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/contracts/verify', async (req, res) => {
  try {
    const result = await contractSystem.verifyIntent(
      req.body.address,
      req.body.intent
    );
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Event listeners
agent.on('error', (error: Error) => {
  console.error('Agent error:', error);
});

agent.on('taskCompleted', (result: any) => {
  console.log('Task completed:', result);
});

network.on('newKnowledge', (data: { pattern: string; source: string }) => {
  console.log('New knowledge acquired:', data);
});

contractSystem.on('contractOptimized', (data: { contractAddress: string; optimizations: any[] }) => {
  console.log('Contract optimized:', data);
}); 