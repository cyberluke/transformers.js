'use client';

import { SearchResultWithImage } from "./search-result-with-image";
import { SearchResultCompact } from "./search-result-compact";

interface SearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  image: string;
  imgType: 'image' | 'favicon';
}

interface SearchResultItemProps {
  result: SearchResult;
  index: number;
}

export function SearchResultItem({ result, index }: SearchResultItemProps) {
  return (
    <a
      key={index}
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-200"
    >
      {result.imgType === 'image' && result.image ? (
        <SearchResultWithImage result={result} />
      ) : (
        <SearchResultCompact result={result} />
      )}
    </a>
  );
} 