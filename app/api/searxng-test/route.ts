export const maxDuration = 30;

// Test API endpoint pro SearXNG vyhledávání
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || 'integrate x^2 from 0 to 10';
    const engines = url.searchParams.get('engines') || 'wolframalpha';
    const categories = url.searchParams.get('categories') || 'science';
    const language = url.searchParams.get('language') || 'en';
    const pageno = url.searchParams.get('pageno') || '1';

    // Zkontrolujeme jestli máme SEARXNG_URL v environment variables
    const searxngUrl = process.env.SEARXNG_URL;
    if (!searxngUrl) {
      return Response.json({
        error: 'SEARXNG_URL není nastaveno v environment variables',
        status: 'error'
      }, { status: 500 });
    }

    console.log(`Volám SearXNG API s dotazem: ${query}`);

    // Sestavíme parametry pro SearXNG API
    const searchParams = new URLSearchParams({
      q: query,
      format: 'json',
      engines,
      categories,
      language,
      pageno
    });

    // Provedeme požadavek na SearXNG API
    const searxngResponse = await fetch(`${searxngUrl}/search?${searchParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NanotrikAI/1.0'
      }
    });

    if (!searxngResponse.ok) {
      console.error('SearXNG API error:', searxngResponse.status, searxngResponse.statusText);
      const errorText = await searxngResponse.text();
      console.error('SearXNG error details:', errorText);
      
      return Response.json({
        error: `Chyba při volání SearXNG API: ${searxngResponse.status} ${searxngResponse.statusText}`,
        details: errorText,
        status: 'error'
      }, { status: searxngResponse.status });
    }

    const searchResults = await searxngResponse.json();

    // Vrátíme výsledky s některými meta informacemi
    return Response.json({
      status: 'success',
      query: {
        q: query,
        engines,
        categories,
        language,
        pageno: parseInt(pageno)
      },
      searxng_url: searxngUrl,
      results: searchResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chyba při zpracování SearXNG požadavku:', error);
    
    return Response.json({
      error: 'Vnitřní chyba serveru při zpracování SearXNG požadavku',
      details: error instanceof Error ? error.message : 'Neznámá chyba',
      status: 'error'
    }, { status: 500 });
  }
}

// POST endpoint pro pokročilejší vyhledávání s více parametry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      q: query = 'integrate x^2 from 0 to 10',
      engines = 'wolframalpha',
      categories = 'science',
      language = 'en',
      pageno = 1,
      time_range,
      safesearch
    } = body;

    const searxngUrl = process.env.SEARXNG_URL;
    if (!searxngUrl) {
      return Response.json({
        error: 'SEARXNG_URL není nastaveno v environment variables',
        status: 'error'
      }, { status: 500 });
    }

    console.log(`POST požadavek na SearXNG s dotazem: ${query}`);

    // Sestavíme parametry pro SearXNG API
    const searchParams = new URLSearchParams({
      q: query,
      format: 'json',
      engines,
      categories,
      language,
      pageno: pageno.toString()
    });

    // Přidáme volitelné parametry pokud jsou specifikované
    if (time_range) {
      searchParams.append('time_range', time_range);
    }
    if (safesearch !== undefined) {
      searchParams.append('safesearch', safesearch.toString());
    }

    const searxngResponse = await fetch(`${searxngUrl}/search?${searchParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NanotrikAI/1.0'
      }
    });

    if (!searxngResponse.ok) {
      console.error('SearXNG API error:', searxngResponse.status, searxngResponse.statusText);
      const errorText = await searxngResponse.text();
      
      return Response.json({
        error: `Chyba při volání SearXNG API: ${searxngResponse.status} ${searxngResponse.statusText}`,
        details: errorText,
        status: 'error'
      }, { status: searxngResponse.status });
    }

    const searchResults = await searxngResponse.json();

    return Response.json({
      status: 'success',
      query: {
        q: query,
        engines,
        categories,
        language,
        pageno,
        time_range,
        safesearch
      },
      searxng_url: searxngUrl,
      results: searchResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chyba při zpracování POST SearXNG požadavku:', error);
    
    return Response.json({
      error: 'Vnitřní chyba serveru při zpracování SearXNG požadavku',
      details: error instanceof Error ? error.message : 'Neznámá chyba',
      status: 'error'
    }, { status: 500 });
  }
}