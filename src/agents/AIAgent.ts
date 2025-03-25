import { Configuration, OpenAIApi } from 'openai';
import { EventEmitter } from 'events';
import { ThoughtChain } from '../networks/CognitiveNetworkFabric';
import { DynamicCoevolutionProtocol } from '../protocols/DynamicCoevolutionProtocol';

export interface AgentCapability {
  name: string;
  description: string;
  parameters: string[];
  confidence: number;
}

export interface AgentState {
  id: string;
  capabilities: AgentCapability[];
  trustScore: number;
  learningProgress: number;
  lastUpdate: Date;
}

interface AgentEvents {
  'error': (error: Error) => void;
  'taskCompleted': (result: any) => void;
  'newCapability': (capability: AgentCapability) => void;
}

export class AIAgent extends EventEmitter {
  private state: AgentState;
  private openai: OpenAIApi;
  private protocol: DynamicCoevolutionProtocol;
  private thoughtHistory: ThoughtChain[];
  private learningRate: number;
  private experiencePool: Map<string, any>;

  constructor(
    apiKey: string,
    agentId: string,
    initialCapabilities: AgentCapability[]
  ) {
    super();
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
    
    this.state = {
      id: agentId,
      capabilities: initialCapabilities,
      trustScore: 0.5,
      learningProgress: 0,
      lastUpdate: new Date()
    };

    this.protocol = new DynamicCoevolutionProtocol({
      encryptionStrength: 2,
      validationRules: ['basic', 'advanced'],
      trustThreshold: 0.7
    });

    this.thoughtHistory = [];
    this.learningRate = 0.1;
    this.experiencePool = new Map();
  }

  public on<K extends keyof AgentEvents>(event: K, listener: AgentEvents[K]): this {
    return super.on(event, listener);
  }

  public emit<K extends keyof AgentEvents>(event: K, ...args: Parameters<AgentEvents[K]>): boolean {
    return super.emit(event, ...args);
  }

  // 核心功能
  public async processTask(task: any): Promise<any> {
    try {
      // 任务分析
      const capability = this.findBestCapability(task);
      if (!capability) {
        throw new Error('No suitable capability found for the task');
      }

      // 执行任务
      const result = await this.executeCapability(capability, task);

      // 学习和改进
      await this.learnFromExperience(task, result);

      this.emit('taskCompleted', result);
      return result;
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  // 能力管理
  public async learnNewCapability(capability: AgentCapability): Promise<void> {
    // 验证新能力
    if (await this.validateCapability(capability)) {
      this.state.capabilities.push(capability);
      this.state.learningProgress += 0.1;
      this.state.lastUpdate = new Date();
      this.emit('newCapability', capability);
    }
  }

  // 协作接口
  public async collaborateWith(partner: AIAgent, task: any): Promise<any> {
    // 验证合作伙伴的能力
    const combinedCapabilities = this.evaluateCollaboration(partner);
    if (!this.isCollaborationViable(combinedCapabilities)) {
      throw new Error('Collaboration not viable');
    }

    // 执行协作任务
    const result = await this.executeCollaborativeTask(partner, task);
    
    // 更新经验池
    this.updateExperiencePool(task, result, partner.getId());

    return result;
  }

  // 状态管理
  public getState(): AgentState {
    return { ...this.state };
  }

  public getId(): string {
    return this.state.id;
  }

  // 私有辅助方法
  private findBestCapability(task: any): AgentCapability | null {
    return this.state.capabilities.reduce((best, current) => {
      const score = this.calculateCapabilityScore(current, task);
      return score > (best ? this.calculateCapabilityScore(best, task) : 0)
        ? current
        : best;
    }, null as AgentCapability | null);
  }

  private async executeCapability(capability: AgentCapability, task: any): Promise<any> {
    const prompt = this.buildPrompt(capability, task);
    
    const response = await this.openai.createCompletion({
      model: 'gpt-4',
      prompt,
      max_tokens: 1000
    });

    return this.processResponse(response.data.choices[0].text || '');
  }

  private async learnFromExperience(task: any, result: any): Promise<void> {
    const experience = {
      task,
      result,
      timestamp: Date.now()
    };

    this.experiencePool.set(`exp-${Date.now()}`, experience);

    // 根据经验调整能力
    await this.adjustCapabilities(experience);
  }

  private evaluateCollaboration(partner: AIAgent): AgentCapability[] {
    return [...this.state.capabilities, ...partner.getState().capabilities];
  }

  private isCollaborationViable(capabilities: AgentCapability[]): boolean {
    const totalConfidence = capabilities.reduce((sum, cap) => sum + cap.confidence, 0);
    return totalConfidence / capabilities.length > 0.7;
  }

  private async executeCollaborativeTask(partner: AIAgent, task: any): Promise<any> {
    // 简单的任务分配策略
    const myCapability = this.findBestCapability(task);
    const partnerCapability = partner.findBestCapability(task);

    if (!myCapability || !partnerCapability) {
      throw new Error('No suitable capabilities found for collaboration');
    }

    // 并行执行任务
    const [myResult, partnerResult] = await Promise.all([
      this.executeCapability(myCapability, task),
      partner.executeCapability(partnerCapability, task)
    ]);

    // 合并结果
    return this.mergeResults(myResult, partnerResult);
  }

  private updateExperiencePool(task: any, result: any, partnerId: string): void {
    const experience = {
      task,
      result,
      partnerId,
      timestamp: Date.now()
    };

    this.experiencePool.set(`collab-${Date.now()}`, experience);
  }

  private async validateCapability(capability: AgentCapability): Promise<boolean> {
    // 基本验证
    if (!capability.name || !capability.description || !capability.parameters) {
      return false;
    }

    // 重复检查
    if (this.state.capabilities.some(cap => cap.name === capability.name)) {
      return false;
    }

    return true;
  }

  private calculateCapabilityScore(capability: AgentCapability, task: any): number {
    // 简单的相似度计算
    const taskStr = JSON.stringify(task).toLowerCase();
    const capStr = capability.description.toLowerCase();
    
    const commonWords = capStr.split(' ').filter(word => taskStr.includes(word));
    return (commonWords.length / capStr.split(' ').length) * capability.confidence;
  }

  private buildPrompt(capability: AgentCapability, task: any): string {
    return `
Using the capability "${capability.name}":
${capability.description}

Process the following task:
${JSON.stringify(task, null, 2)}

Parameters required:
${capability.parameters.join(', ')}

Please provide a detailed response.
    `.trim();
  }

  private processResponse(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }

  private async adjustCapabilities(experience: any): Promise<void> {
    for (const capability of this.state.capabilities) {
      if (this.isCapabilityRelevant(capability, experience.task)) {
        capability.confidence = this.updateConfidence(
          capability.confidence,
          this.calculateSuccessRate(experience)
        );
      }
    }
  }

  private isCapabilityRelevant(capability: AgentCapability, task: any): boolean {
    return this.calculateCapabilityScore(capability, task) > 0.5;
  }

  private updateConfidence(currentConfidence: number, successRate: number): number {
    return currentConfidence + this.learningRate * (successRate - currentConfidence);
  }

  private calculateSuccessRate(experience: any): number {
    // 简单的成功率计算
    return experience.result ? 1 : 0;
  }

  private mergeResults(result1: any, result2: any): any {
    // 简单的结果合并
    return {
      combined: true,
      results: [result1, result2]
    };
  }
} 