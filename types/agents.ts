export interface AgentListItem {
  id: string;
  title: string;
  description: string | null;
}

export interface AgentsApiResponse {
  success: boolean;
  agents: AgentListItem[];
  defaultAgent: string;
  error?: string;
} 