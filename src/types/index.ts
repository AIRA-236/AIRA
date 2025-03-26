/**
 * Core type definitions for AIRA project
 */

export interface EncryptedData {
  data: string;
  sensitivity: number;
  timestamp: number;
}

export interface ConsensusResult {
  achieved: boolean;
  participants: string[];
  timestamp: number;
}

export interface MultiModalData {
  text?: string;
  image?: Buffer;
  audio?: Buffer;
  metadata: Record<string, unknown>;
}

export interface ProcessedData {
  processed: boolean;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  version: string;
  requirements: string[];
}

export interface Task {
  id: string;
  type: string;
  input: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  error?: string;
  created: number;
  updated: number;
}

export interface Agent {
  id: string;
  name: string;
  capabilities: AgentCapability[];
  trustScore: number;
  status: 'active' | 'inactive' | 'suspended';
  created: number;
  updated: number;
} 