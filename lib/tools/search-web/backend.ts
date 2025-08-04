import { tool } from "ai";
import z from "zod";
import fs from 'fs';

const dictEngines = [
  "dictzone",
  "lingva",
]

const webEngines = [
  "brave",
  "duckduckgo",
  "google",
  "presearch",
  "presearch_videos",
  "qwant",
  "startpage",
  "seznam",
]

const wikiEngines = [
  "wikibooks",
  "wikiquote",
]

const otherEngines = [
  "tineye",
  "wikidata",
  "wikipedia",
  "wolframalpha",
]

// ---------

const imageEngines = [
  "bing_images",
  "brave.images",
  "duckduckgo_images",
  "google_images",
  "presearch_images",
  "qwant_images",
  "startpage_images",

  "google_images",
  "imgur",
  "pinterest",
  "unsplash"
]

const videoEngines = [
  "bing_videos",
  "brave.videos",
  "duckduckgo_videos",
  "google_videos",
  "presearch_videos",

  "adobe_stock_video",
  "vimeo",
  "wikicommons.videos",
  "youtube",
]

const newsEngines = [
  "duckduckgo_news",
  "startpage_news",
  "wikinews",

  "bing_news",
  "brave.news",
  "google_news",
  "qwant_news",
  "yahoo_news"
]

const mapEngines = [
  "openstreetmap",
  "photon"
]

const musicEngines = [
  // "genius",
  // "radio_browser",
  // "adobe_stock_audio",
  // "bandcamp",
  // "deezer",
  // "mixcloud",
  // "soundcloud",
  "spotify",
  "youtube",
  // "wikicommons.audio",
] // asi zlepsit query at vice mainstrem veci je youtube a spotify etc a dalsi treba to ostatni prikalad query ktera ne uplne ideal funguje: podivej se mi na hudbu z the rookie serialu

const allEngines = [
  ...dictEngines,
  ...webEngines,
  ...wikiEngines,
  ...otherEngines,
  ...imageEngines,
  ...videoEngines,
  ...newsEngines,
  ...mapEngines,
  ...musicEngines,
]

const enginesMap = {	
  web: webEngines,
  dict: dictEngines,
  wiki: wikiEngines,
  other: otherEngines,
  image: imageEngines,
  video: videoEngines,
  news: newsEngines,
  map: mapEngines,
  music: musicEngines,
  all: allEngines,
}

export const searchWebTool = () => tool({
  description: `Vyhledávání na webu pomocí SearXNG meta-vyhledávače.

PROMPT PRO AI:
Tento nástroj používej pro získání aktuálních informací z internetu. Můžeš vyhledávat:
- Obecné webové informace (web)
- Slovníky a překladače (dict) 
- Wikipedia články (wiki)
- Specializované zdroje jako WolframAlpha (other)
- Obrázky (image)
- Videa (video) 
- Zprávy (news)
- Mapy (map)
- Hudbu (music)
- Nebo všechny dostupné zdroje najednou (all)

Vždy formuluj dotaz v angličtině pro lepší výsledky. Výsledky budou obsahovat title, content, URL a obrázek pro každý výsledek.`,
  parameters: z.object({
    query: z.string().describe('Vyhledávací dotaz (preferovaně v angličtině pro lepší výsledky)'),
    engineType: z.enum(['web', 'dict', 'wiki', 'other', 'image', 'video', 'news', 'map', 'music', 'all'])
      .default('web')
      .describe('Typ vyhledávačů: web=obecný web, dict=slovníky, wiki=wikipedia, other=WolframAlpha+další, image=obrázky, video=videa, news=zprávy, map=mapy, music=hudba, all=všechny'),
  }),
  execute: async ({ query, engineType }) => {
    console.log(query, "query search", engineType, "engine type");

    // Výběr engines podle typu
    let selectedEngines = enginesMap[engineType];
    const engineString = selectedEngines.join(",");
    console.log("Selected engines:", engineString);

    let success: boolean = false;
    let data: any;

    try {
      const result = await fetch(`${process.env.SEARXNG_URL}/search?q=${query}&format=json&engines=${engineString}`);
      data = await result.json();
      console.log(data, "data search");
      fs.writeFileSync("dataSearch.json", JSON.stringify(data, null, 2));
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
          engineType: engineType,
          selectedEngines: selectedEngines,
          results: resultsWithImages
        }
      };
    }

    return { success: false, result: null };
  },
});

// function createSearchWebTool(writer: any) {
