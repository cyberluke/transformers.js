'use client';

interface GenericToolProps {
  toolInvocation: any;
  index: number;
}

export function GenericTool({ toolInvocation, index }: GenericToolProps) {
  const isComplete = toolInvocation.state === 'result';
  const isSuccess = isComplete && toolInvocation.result?.success;

  return (
    <div key={index} className="mb-4 rounded-lg border bg-muted/50 p-4">
      {/* Tool Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🔧</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">
            {toolInvocation.toolName}
          </div>
          {toolInvocation.args && Object.keys(toolInvocation.args).length > 0 && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {Object.entries(toolInvocation.args).map(([key, value]) => (
                <span key={key} className="mr-2">
                  {key}: "{String(value)}"
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isComplete ? (
            <span className={`text-xs px-2 py-1 rounded-full ${
              isSuccess 
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {isSuccess ? '✅ Dokončeno' : '❌ Chyba'}
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              ⏳ Zpracovávám...
            </span>
          )}
        </div>
      </div>

      {/* Generic Results */}
      {isComplete && toolInvocation.result && (
        <div className="mt-2 text-xs text-muted-foreground">
          <details>
            <summary className="cursor-pointer hover:text-foreground">
              Zobrazit výsledek
            </summary>
            <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
              {JSON.stringify(toolInvocation.result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
} 