// const BASE_URL = 'http://o2.mobile.idos.cz';
const BASE_URL = 'https://idos.cz/';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0'
};

interface Station {
  name: string;
  arrival: string;
}

interface SubRoute {
  type: string;
  stations: Station[];
  detail: string;
}

interface Summary {
  distance: string;
  duration: string;
  price: string;
}

interface Route {
  route: SubRoute[];
  summary: Summary;
}

interface PathResponse {
  next?: string;
  previous?: string;
  path: Route[];
}

interface DetailStation {
  name: string;
  arrival: string;
  marked: boolean;
}

export async function getPath(
  start: string = '',
  end: string = '',
  date?: string,
  time?: string,
  resource?: string,
  // defaultResource: string = '/pid/spojeni/'
  defaultResource: string = '/vlakyautobusymhdvse/spojeni/'
): Promise<PathResponse> {
  let formattedDate: string;
  let formattedTime: string;

  if (!date) {
    const now = new Date();
    formattedDate = formatDate(now);
  } else {
    formattedDate = date; // Assume it's already in correct format
  }

  if (!time) {
    const now = new Date();
    formattedTime = formatTime(now);
  } else {
    formattedTime = time; // Assume it's already in correct format
  }

  const data = new URLSearchParams({
    'FROM_0t': start,
    'TO_0t': end,
    'form-datum': formattedDate,
    'form-cas': formattedTime,
    'cmdSearch': 'Hledat'
  });

  let url: string;
  let requestInit: RequestInit;

  if (!resource) {
    url = BASE_URL + defaultResource;
    requestInit = {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data.toString()
    };
  } else {
    url = BASE_URL + resource;
    requestInit = {
      method: 'GET',
      headers: HEADERS
    };
  }

  const response = await fetch(url, requestInit);
  const html = await response.text();

  console.log(html);

  const result: PathResponse = {
    path: await parsePath(html)
  };

  // Parse navigation links using regex
  const botanch = html.match(/<div[^>]*class="botanch"[^>]*>([\s\S]*?)<\/div>/);
  if (botanch && botanch[1]) {
    const links = botanch[1].match(/<a[^>]*href="([^"]*)"[^>]*>/g);
    if (links && links.length >= 2) {
      const previousHref = links[0].match(/href="([^"]*)"/)?.[1];
      const nextHref = links[1].match(/href="([^"]*)"/)?.[1];
      
      if (previousHref) {
        result.previous = '/path?resource=' + encodeURIComponent(previousHref);
      }
      if (nextHref) {
        result.next = '/path?resource=' + encodeURIComponent(nextHref);
      }
    }
  }

  return result;
}

async function parsePath(html: string): Promise<Route[]> {
  const routes: Route[] = [];
  
  // Find all tables with class conntbl
  const tableMatches = html.match(/<table[^>]*class="conntbl"[^>]*>[\s\S]*?<\/table>/g);
  
  if (!tableMatches) return routes;
  
  for (const tableHtml of tableMatches) {
    const subroute: SubRoute[] = [];
    let stations: Station[] = [];
    
    // Parse summary from last row
    const rows = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
    const lastRow = rows[rows.length - 1] || '';
    const summaryText = lastRow.replace(/<[^>]*>/g, '');
    
    // Parse summary using regex
    const durationMatch = summaryText.match(/·(.*?),/);
    const distanceMatch = summaryText.match(/,(.*?),/);
    const priceMatch = summaryText.match(/km,(.*?)·/);
    
    const summary: Summary = {
      duration: durationMatch?.[1]?.trim() || '',
      distance: distanceMatch?.[1]?.trim() || '',
      price: priceMatch?.[1]?.trim() || ''
    };

    // Parse each row
    for (const row of rows) {
      // Find transport types
      const transportMatches = row.match(/<span[^>]*class="train"[^>]*>(.*?)<\/span>/g) || [];
      let detail = '';
      
      // Find detail links
      for (const transport of transportMatches) {
        const linkMatch = transport.match(/<a[^>]*href="([^"]*)"[^>]*>/);
        if (linkMatch?.[1]) {
          detail = '/detail?resource=' + encodeURIComponent(linkMatch[1]);
        }
      }
      
      const transportTypes = transportMatches.map(match => 
        match.replace(/<[^>]*>/g, '').trim()
      );
      
      // Find stations
      const stationMatches = row.match(/<td[^>]*class="ar"[^>]*>(.*?)<\/td>/g) || [];
      for (const stationMatch of stationMatches) {
        // Get previous sibling for station name (simplified approach)
        const arrival = stationMatch.replace(/<[^>]*>/g, '').trim();
        // This is a simplified approach - in real implementation would need better HTML parsing
        const name = ''; // Would need better parsing for station names
        if (arrival) {
          stations.push({ name, arrival });
        }
      }
      
      if (transportTypes.length > 0) {
        subroute.push({
          type: transportTypes[transportTypes.length - 1] || '',
          stations: stations,
          detail: detail
        });
        stations = [];
      }
    }
    
    routes.push({ route: subroute, summary });
  }
  
  return routes;
}

export async function getDetail(resource: string): Promise<DetailStation[]> {
  const detail: DetailStation[] = [];
  
  const response = await fetch(BASE_URL + resource, {
    method: 'GET',
    headers: HEADERS
  });
  
  const html = await response.text();
  
  // Parse stations using regex
  const stationMatches = html.match(/<tr[^>]*class="bbot"[^>]*>[\s\S]*?<\/tr>/g) || [];
  
  for (const stationHtml of stationMatches) {
    const cells = stationHtml.match(/<td[^>]*>[\s\S]*?<\/td>/g) || [];
    
    if (cells.length >= 2 && cells[0] && cells[1]) {
      const name = cells[0].replace(/<[^>]*>/g, '').trim();
      const arrival = cells[1].replace(/<[^>]*>/g, '').trim();
      const marked = stationHtml.includes('bold');
      
      detail.push({ name, arrival, marked });
    }
  }
  
  return detail;
}

// Helper functions
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
