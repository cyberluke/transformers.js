import { tool } from "ai";
import z from "zod";

export const searchWebTool = () => tool({
  description: `search the web for information.`,
  parameters: z.object({
    query: z.string().describe('the query to search the web for'),
  }),
  execute: async ({ query }) => {
    console.log(query, "query search");
    // writer.value?.write("0:\"Prohledávám web\"\n")

    let success: boolean = false;
    let data: any;

    try {
      const result = await fetch(`${process.env.SEARXNG_URL}/search?q=${query}&format=json`);
      data = await result.json();
      console.log(data, "data search");
      success = true;
    } catch (error) {
      console.log(error, "error search");
    }

    // Funkce pro získání obrázku z URL s rozlišením typu
    const getImageFromUrl = async (url: string): Promise<{ image: string; imgType: 'image' | 'favicon' }> => {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: AbortSignal.timeout(5000) // 5s timeout
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const html = await response.text();
        
        // Hledáme og:image nebo twitter:image
        const ogImageMatch = html.match(/<meta[^>]*property=['"](og:image|twitter:image)['"]\s*content=['"]([^'"]+)['"]/i);
        if (ogImageMatch && ogImageMatch[2]) {
          let imageUrl = ogImageMatch[2];
          // Pokud je relativní URL, převedeme na absolutní
          if (imageUrl.startsWith('/')) {
            const urlObj = new URL(url);
            imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
          }
          return { image: imageUrl, imgType: 'image' };
        }

        // Fallback na favicon
        const urlObj = new URL(url);
        return { 
          image: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`,
          imgType: 'favicon'
        };
      } catch (error) {
        // Fallback na favicon při chybě
        try {
          const urlObj = new URL(url);
          return { 
            image: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`,
            imgType: 'favicon'
          };
        } catch {
          return { image: '', imgType: 'favicon' };
        }
      }
    };

    // Optimalizace dat - vrácení pouze relevantních informací (omezeno na 5 výsledků)
    if (success && data?.results) {
      // console.log(JSON.stringify(data.results, null, 2), "data.results");
      // save to json file
      // fs.writeFileSync("data.json", JSON.stringify(data.results, null, 2));

      const limitedResults = data.results.slice(0, 5); // Omezení na prvních 5 výsledků
      
      // Paralelně získáme obrázky pro všechny výsledky
      const resultsWithImages = await Promise.all(
        limitedResults.map(async (result: any) => {
          const imageData = await getImageFromUrl(result.url);
          return {
            url: result.url,
            title: result.title,
            content: result.content,
            score: result.score,
            image: imageData.image,
            imgType: imageData.imgType
          };
        })
      );

      return { 
        success: true, 
        result: {
          query: data.query,
          results: resultsWithImages
        }
      };
    }

    return { success: false, result: null };
  },
});

// function createSearchWebTool(writer: any) {
