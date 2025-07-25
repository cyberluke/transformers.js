'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Bot, Copy, Download, ChevronLeft, ChevronRight, Upload, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { AgentData } from '@/types/agent';

type AgentDataClient = Omit<AgentData, 'chatModel'>

interface ParseResult {
  agents: AgentDataClient[];
  totalAgents: number;
  successfullyParsed: number;
  errors: string[];
}

export default function AgentPocPage() {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [currentAgent, setCurrentAgent] = useState(0);
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({});
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      const parseResult = parseAgentsFromJson(jsonData);
      setResult(parseResult);
      setCurrentAgent(0);
    } catch (error) {
      setResult({
        agents: [],
        totalAgents: 0,
        successfullyParsed: 0,
        errors: [`Chyba při parsování JSON: ${error instanceof Error ? error.message : 'Neznámá chyba'}`]
      });
    } finally {
      setUploading(false);
    }
  };

  const parseAgentsFromJson = (jsonData: any): ParseResult => {
    const errors: string[] = [];
    const agents: AgentDataClient[] = [];
    
    try {
      const agentsArray = jsonData?.data?.agents || [];
      
      agentsArray.forEach((agent: any, index: number) => {
        try {
          // Přeskočit agenty bez title
          if (!agent.title || agent.title.trim() === '') {
            return;
          }
          
          const agentData: AgentDataClient = {
            id: agent.title.toLowerCase().replace(/ /g, '-'),
            title: agent.title,
            description: agent.description || null,
            model: agent.model || 'gpt-4o',
            provider: agent.provider || 'openai',
            params: {
              temperature: agent.params?.temperature ?? 1,
              top_p: agent.params?.top_p ?? 1,
              presence_penalty: agent.params?.presence_penalty ?? 0,
              frequency_penalty: agent.params?.frequency_penalty ?? 0,
              ...(agent.params?.reasoning_effort && { reasoning_effort: agent.params.reasoning_effort })
            },
            systemRole: agent.systemRole || '',
            chatConfig: {
              searchMode: agent.chatConfig?.searchMode || 'off',
              historyCount: agent.chatConfig?.historyCount ?? 8,
              enableReasoning: agent.chatConfig?.enableReasoning ?? true
            },
            openingMessage: agent.openingMessage || null,
            openingQuestions: agent.openingQuestions || [],
            tts: {
              voice: agent.tts?.voice || {},
              sttLocale: agent.tts?.sttLocale || 'cs-CZ',
              ttsService: agent.tts?.ttsService || 'openai'
            },
            originalId: agent.id || `agent_${index}`
          };
          
          agents.push(agentData);
        } catch (err) {
          errors.push(`Chyba při parsování agenta ${index + 1}: ${err instanceof Error ? err.message : 'Neznámá chyba'}`);
        }
      });
      
      return {
        agents,
        totalAgents: agentsArray.length,
        successfullyParsed: agents.length,
        errors
      };
    } catch (err) {
      return {
        agents: [],
        totalAgents: 0,
        successfullyParsed: 0,
        errors: [`Chyba při zpracování dat: ${err instanceof Error ? err.message : 'Neznámá chyba'}`]
      };
    }
  };

  // Funkce pro konverzi objektu na JS format (bez uvozovek u klíčů)
  const objectToJsString = (obj: any, indent = 2, parentKey?: string): string => {
    const spaces = ' '.repeat(indent);
    
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'string') {
      // SystemRole používá template literals (backticks)
      if (parentKey === 'systemRole') {
        return `\`${obj.replace(/`/g, '\\`')}\``;
      }
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const items = obj.map(item => `${spaces}  ${objectToJsString(item, indent + 2, parentKey)}`);
      return `[\n${items.join(',\n')}\n${spaces}]`;
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '{}';
      
      const entries = keys.map(key => {
        const value = objectToJsString(obj[key], indent + 2, key);
        return `${spaces}  ${key}: ${value}`;
      });
      
      return `{\n${entries.join(',\n')}\n${spaces}}`;
    }
    
    return String(obj);
  };

  const handleCopyAgent = async (agentIndex: number) => {
    if (!result?.agents[agentIndex]) return;
    
    const agent = result.agents[agentIndex];
    const jsObject = `const agent = ${objectToJsString(agent, 0)};`;
    
    try {
      await navigator.clipboard.writeText(jsObject);
      setCopiedStates(prev => ({ ...prev, [agentIndex]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [agentIndex]: false }));
      }, 2000);
    } catch (err) {
      console.error('Chyba při kopírování:', err);
    }
  };

  const handleDownloadAllAgents = () => {
    if (!result?.agents) return;
    
    const allAgents = result.agents.map((agent, index) => 
      `// Agent ${index + 1}: ${agent.title}\nconst agent${index + 1} = ${objectToJsString(agent, 0)};\n\n`
    ).join('');
    
    const blob = new Blob([allAgents], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-agents.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAgentChange = (newAgent: number) => {
    if (result && newAgent >= 0 && newAgent < result.agents.length) {
      setCurrentAgent(newAgent);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět na hlavní stránku
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Agent PoC
              </h1>
              <p className="text-muted-foreground">
                Extrakce dat pro AI agenty z JSON konfigurace
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="p-6 mb-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20">
          <div className="flex items-start space-x-4">
            <Bot className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-2">Jak to funguje</h2>
              <p className="text-muted-foreground mb-3">
                Nahrajte JSON soubor s konfigurací agentů a aplikace automaticky extrahuje 
                relevantní data pro každého AI agenta.
              </p>
              <div className="text-sm text-muted-foreground">
                <strong>Extrahovaná data:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 ml-4">
                  <li>Základní info (title, description)</li>
                  <li>Model a provider nastavení</li>
                  <li>Parametry (temperature, top_p, penalties)</li>
                  <li>System prompt (systemRole)</li>
                  <li>Chat konfigurace (searchMode, historyCount, enableReasoning)</li>
                  <li>Úvodní zprávy a otázky</li>
                  <li>TTS nastavení</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="p-6 mb-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20">
          <h3 className="text-lg font-semibold mb-4">Upload JSON souboru</h3>
          <div className="border-2 border-dashed border-accent/50 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Vyberte JSON soubor s konfigurací agentů
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
              />
            </div>
            {uploading && (
              <p className="text-sm text-muted-foreground mt-2">Zpracovávám...</p>
            )}
          </div>
        </Card>

        {/* Results */}
        {result && (
          <Card className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Extrahovaní agenti</h3>
              {result.agents.length > 0 && (
                <Button onClick={handleDownloadAllAgents} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Stáhnout všechny
                </Button>
              )}
            </div>
            
            {/* Summary */}
            <div className="bg-accent/30 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Celkem agentů:</span>
                  <p className="font-medium">{result.totalAgents}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Úspěšně zpracováno:</span>
                  <p className="font-medium text-green-600">{result.successfullyParsed}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Chyby:</span>
                  <p className="font-medium text-red-600">{result.errors.length}</p>
                </div>
              </div>
              
              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-accent/50">
                  <h4 className="font-medium text-red-600 mb-2">Chyby při zpracování:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Agent Navigation */}
            {result.agents.length > 1 && (
              <div className="flex items-center justify-between mb-4 p-3 bg-accent/20 rounded-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAgentChange(currentAgent - 1)}
                  disabled={currentAgent === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Předchozí
                </Button>
                
                <span className="text-sm font-medium">
                  Agent {currentAgent + 1} z {result.agents.length}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAgentChange(currentAgent + 1)}
                  disabled={currentAgent === result.agents.length - 1}
                >
                  Další
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Current Agent */}
            {result.agents[currentAgent] && (
              <div className="bg-background/80 rounded-lg p-4">
                <div className="flex items-center justify-between border-b border-accent/30 pb-4 mb-4">
                  <div>
                    <h4 className="font-semibold">
                      {result.agents[currentAgent].title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      ID: {result.agents[currentAgent].originalId}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyAgent(currentAgent)}
                    className="min-w-[100px]"
                  >
                    {copiedStates[currentAgent] ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Zkopírováno
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Kopírovat
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-4 text-sm">
                  <pre className="bg-accent/10 rounded-md p-3 overflow-x-auto text-xs">
                    <code>{`const agent = ${objectToJsString(result.agents[currentAgent], 0)};`}</code>
                  </pre>
                </div>
              </div>
            )}

            {result.agents.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nebyli nalezeni žádní agenti k zobrazení.
              </p>
            )}
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Agent PoC pro{' '}
            <span className="font-medium">nanotrik.ai</span>
            {' '} • Extrakce konfigurace AI agentů
          </p>
        </div>
      </div>
    </div>
  );
} 