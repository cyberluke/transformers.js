'use client';

import { useState, useEffect } from 'react';
import { Bot, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AgentListItem, AgentsApiResponse } from '@/types/agents';

interface AgentSelectorProps {
  selectedAgent: string | null;
  onAgentSelect: (agentId: string) => void;
  className?: string;
}

export function AgentSelector({ selectedAgent, onAgentSelect, className }: AgentSelectorProps) {
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      const data: AgentsApiResponse = await response.json();
      
      if (data.success) {
        setAgents(data.agents);
        // Pokud není vybraný agent, vyber defaultního
        if (!selectedAgent) {
          onAgentSelect(data.defaultAgent);
        }
      } else {
        setError(data.error || 'Nepodařilo se načíst agenty');
      }
    } catch (err) {
      setError('Chyba při komunikaci se serverem');
      console.error('Chyba při načítání agentů:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Vyberte AI asistenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600 text-sm">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-center">Vyberte AI asistenta</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            onClick={() => onAgentSelect(agent.id)}
            className={`relative p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedAgent === agent.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 p-2 rounded-lg ${
                selectedAgent === agent.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm leading-tight mb-1 pr-6">
                  {agent.title}
                </h4>
                {agent.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {agent.description}
                  </p>
                )}
              </div>
              {selectedAgent === agent.id && (
                <div className="absolute top-2 right-2">
                  <div className="bg-primary text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 