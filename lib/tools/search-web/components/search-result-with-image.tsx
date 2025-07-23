'use client';

import { ExternalLinkIcon } from "lucide-react";

interface SearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  image: string;
  imgType: 'image' | 'favicon';
}

interface SearchResultWithImageProps {
  result: SearchResult;
}

export function SearchResultWithImage({ result }: SearchResultWithImageProps) {
  return (
    <div className="space-y-3">
      <img 
        src={result.image} 
        alt={result.title}
        className="w-full h-32 object-cover rounded-md"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {result.title}
          </h4>
          <ExternalLinkIcon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {result.content}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new URL(result.url).hostname}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            {Math.round(result.score)}%
          </span>
        </div>
      </div>
    </div>
  );
} 