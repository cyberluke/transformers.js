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

interface AgentCardProps {
  agent: AgentListItem;
  isSelected: boolean;
  onSelect: () => void;
}

function AgentCardSkeleton() {
  return (
    <Card className="p-4 animate-pulse bg-white/5 backdrop-blur-sm border border-white/20 h-20">
      <div className="flex items-center space-x-3 h-full">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-white/20 rounded w-3/4 mb-2" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    </Card>
  );
}

function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  const cardClasses = isSelected
    ? 'border-emerald-400/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
    : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10';

  const iconClasses = isSelected
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-white/10 text-white/70';

  return (
    <Card
      onClick={onSelect}
      className={`relative p-4 cursor-pointer transition-all duration-200 hover:shadow-md backdrop-blur-sm border h-20 ${cardClasses}`}
    >
      <div className="flex items-center space-x-3 h-full">
        <div className={`flex-shrink-0 p-2 rounded-lg ${iconClasses}`}>
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm leading-tight mb-1 pr-6 text-white">
            {agent.title}
          </h4>
          {agent.description && (
            <p className="text-xs text-white/60 line-clamp-2">
              {agent.description}
            </p>
          )}
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 backdrop-blur-sm border border-emerald-400/30">
            <Check className="w-3 h-3" />
          </div>
        </div>
      )}
    </Card>
  );
}

export function AgentSelector({ selectedAgent, onAgentSelect, className }: AgentSelectorProps) {
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/agents');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AgentsApiResponse = await response.json();
        
        if (data.success) {
          setAgents(data.agents);
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

    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-white text-center">Vyberte AI asistenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2].map((i) => <AgentCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30">
          <p className="text-red-200 text-sm">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-2xl font-semibold text-center text-white text-shadow-lg">Vyberte AI asistenta</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedAgent === agent.id}
            onSelect={() => onAgentSelect(agent.id)}
          />
        ))}
      </div>
    </div>
  );
} 