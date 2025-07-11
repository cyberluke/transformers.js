import { getPath, getDetail } from '@/lib/tools/idos';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

// GET /api/idos?start=Praha&end=Brno&date=25.12.2024&time=10:30
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const start = searchParams.get('start') || '';
    const end = searchParams.get('end') || '';
    const date = searchParams.get('date') || undefined;
    const time = searchParams.get('time') || undefined;
    const resource = searchParams.get('resource') || undefined;
    
    if (!start || !end) {
      return NextResponse.json(
        { error: 'Parametry start a end jsou povinné' },
        { status: 400 }
      );
    }

    const result = await getPath(start, end, date, time, resource);
    
    return NextResponse.json({
      success: true,
      data: result,
      query: {
        start,
        end,
        date: date || 'aktuální datum',
        time: time || 'aktuální čas'
      }
    });

  } catch (error) {
    console.error('IDOS API Error:', error);
    return NextResponse.json(
      { 
        error: 'Chyba při získávání dat z IDOS',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    );
  }
}

// POST /api/idos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start, end, date, time, resource, action } = body;

    if (action === 'detail') {
      if (!resource) {
        return NextResponse.json(
          { error: 'Resource je povinný pro detail' },
          { status: 400 }
        );
      }

      const detail = await getDetail(resource);
      return NextResponse.json({
        success: true,
        data: detail,
        query: { resource }
      });
    }

    // Default action - get path
    if (!start || !end) {
      return NextResponse.json(
        { error: 'Parametry start a end jsou povinné' },
        { status: 400 }
      );
    }

    const result = await getPath(start, end, date, time, resource);
    
    return NextResponse.json({
      success: true,
      data: result,
      query: {
        start,
        end,
        date: date || 'aktuální datum',
        time: time || 'aktuální čas'
      }
    });

  } catch (error) {
    console.error('IDOS API Error:', error);
    return NextResponse.json(
      { 
        error: 'Chyba při získávání dat z IDOS',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    );
  }
} 