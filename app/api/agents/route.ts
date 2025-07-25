import { agents } from '@/lib/agents';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Extrahujeme jen potřebná data z agentů
    const agentsList = agents.map(agent => ({
      id: agent.id,
      title: agent.title,
      description: agent.description,
    }));

    return NextResponse.json({
      success: true,
      agents: agentsList,
      defaultAgent: agents[0]?.id || 'default-agent', // První agent jako default
    });
  } catch (error) {
    console.error('Chyba při načítání agentů:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Nepodařilo se načíst seznam agentů' 
      },
      { status: 500 }
    );
  }
} 