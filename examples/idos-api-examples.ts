// Příklady použití IDOS API endpointu
import React, { useState } from 'react';

// 1. Základní GET požadavek - spojení z Prahy do Brna
const example1 = async () => {
  const response = await fetch('/api/idos?start=Praha&end=Brno');
  const result = await response.json();
  console.log('Spojení Praha → Brno:', result);
};

// 2. GET s konkrétním datem a časem
const example2 = async () => {
  const response = await fetch('/api/idos?start=Praha&end=Ostrava&date=25.12.2024&time=10:30');
  const result = await response.json();
  console.log('Spojení Praha → Ostrava na konkrétní čas:', result);
};

// 3. POST požadavek s více parametry
const example3 = async () => {
  const response = await fetch('/api/idos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      start: 'Brno',
      end: 'Liberec',
      date: '01.01.2025',
      time: '14:00'
    })
  });
  const result = await response.json();
  console.log('Spojení Brno → Liberec:', result);
};

// 4. Získání detailů o konkrétním spoji
const example4 = async () => {
  const response = await fetch('/api/idos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'detail',
      resource: '/pid/spojeni/vysledek/...' // URL resource z předchozího výsledku
    })
  });
  const result = await response.json();
  console.log('Detail spoje:', result);
};

// 5. Funkce pro jednoduché volání s TypeScript typy
interface IdosQuery {
  start: string;
  end: string;
  date?: string;
  time?: string;
}

const searchConnection = async (query: IdosQuery) => {
  const params = new URLSearchParams({
    start: query.start,
    end: query.end,
    ...(query.date && { date: query.date }),
    ...(query.time && { time: query.time })
  });

  const response = await fetch(`/api/idos?${params}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};

// 6. Příklad použití s error handlingem
const example6 = async () => {
  try {
    const result = await searchConnection({
      start: 'Plzeň',
      end: 'České Budějovice',
      date: '31.12.2024',
      time: '18:00'
    });
    
    console.log('Počet nalezených spojení:', result.data.path.length);
    
    // Projdeme všechna nalezená spojení
    result.data.path.forEach((route: any, index: number) => {
      console.log(`Spojení ${index + 1}:`);
      console.log(`- Doba jízdy: ${route.summary.duration}`);
      console.log(`- Vzdálenost: ${route.summary.distance}`);
      console.log(`- Cena: ${route.summary.price}`);
      
      route.route.forEach((segment: any, segIndex: number) => {
        console.log(`  Úsek ${segIndex + 1}: ${segment.type}`);
        segment.stations.forEach((station: any) => {
          console.log(`    ${station.name} - ${station.arrival}`);
        });
      });
    });
    
  } catch (error) {
    console.error('Chyba při hledání spojení:', error);
  }
};

// 7. Reakce na pagination (další/předchozí výsledky)
const example7 = async () => {
  const firstPage = await fetch('/api/idos?start=Praha&end=Brno');
  const firstResult = await firstPage.json();
  
  if (firstResult.data.next) {
    // Získáme další stránku výsledků
    const nextPage = await fetch(`/api/idos?resource=${encodeURIComponent(firstResult.data.next)}`);
    const nextResult = await nextPage.json();
    console.log('Další stránka výsledků:', nextResult);
  }
};

// 8. Komplexní příklad s React komponentou
const IdosSearch = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (start: string, end: string, date?: string, time?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await searchConnection({ start, end, date, time });
      setResults(result.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', null, 'UI komponenty zde');
};

// Export pro použití
export {
  example1,
  example2,
  example3,
  example4,
  example6,
  example7,
  searchConnection,
  IdosSearch
}; 