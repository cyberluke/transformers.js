'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function SearXNGTestPage() {
  const [query, setQuery] = useState('integrate x^2 from 0 to 10');
  const [engines, setEngines] = useState('wolframalpha');
  const [categories, setCategories] = useState('science');
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function testSearXNG() {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const params = new URLSearchParams({
        q: query,
        engines,
        categories,
        language,
        pageno: '1'
      });

      const response = await fetch(`/api/searxng-test?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při volání API');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba');
    } finally {
      setLoading(false);
    }
  }

  async function testSearXNGPost() {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/searxng-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          engines,
          categories,
          language,
          pageno: 1,
          safesearch: 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při volání API');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">SearXNG API Test</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Konfigurace vyhledávání</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Dotaz (q)</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="integrate x^2 from 0 to 10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Engines</label>
            <Input
              value={engines}
              onChange={(e) => setEngines(e.target.value)}
              placeholder="wolframalpha"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <Input
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="science"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <Input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="en"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={testSearXNG} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Načítání...' : 'Test GET Request'}
          </Button>
          
          <Button 
            onClick={testSearXNGPost} 
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            {loading ? 'Načítání...' : 'Test POST Request'}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Chyba</h3>
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {results && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Výsledky</h3>
          
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Meta informace</h4>
            <p><strong>Status:</strong> {results.status}</p>
            <p><strong>SearXNG URL:</strong> {results.searxng_url}</p>
            <p><strong>Timestamp:</strong> {results.timestamp}</p>
            <p><strong>Dotaz:</strong> {JSON.stringify(results.query, null, 2)}</p>
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Výsledky vyhledávání</h4>
            
            {results.results?.results && results.results.results.length > 0 ? (
              <div className="space-y-4">
                {results.results.results.slice(0, 5).map((result: any, index: number) => (
                  <div key={index} className="p-4 border rounded">
                    <h5 className="font-medium text-blue-600 mb-1">
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        {result.title}
                      </a>
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">{result.url}</p>
                    {result.content && (
                      <p className="text-sm">{result.content.substring(0, 200)}...</p>
                    )}
                    {result.engine && (
                      <p className="text-xs text-gray-500 mt-2">Engine: {result.engine}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Žádné výsledky k zobrazení</p>
            )}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Kompletní JSON odpověď</summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </Card>
      )}
    </div>
  );
}