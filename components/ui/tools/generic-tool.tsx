'use client';

interface GenericToolProps {
  toolInvocation: any;
  index: number;
}

export function GenericTool({ toolInvocation, index }: GenericToolProps) {
  const isComplete = toolInvocation.state === 'result';
  const isSuccess = isComplete && toolInvocation.result?.success;

  return (
    <div key={index} className="mb-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-lg">
      {/* Tool Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🔧</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">
            {toolInvocation.toolName}
          </div>
          {toolInvocation.args && Object.keys(toolInvocation.args).length > 0 && (
            <div className="text-xs text-white/60 mt-0.5">
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
            <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
              isSuccess 
                ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                : 'bg-red-400/20 text-red-300 border border-red-400/30'
            }`}>
              {isSuccess ? '✅ Dokončeno' : '❌ Chyba'}
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-400/20 backdrop-blur-sm text-blue-300 border border-blue-400/30">
              ⏳ Zpracovávám...
            </span>
          )}
        </div>
      </div>

      {/* Generic Results */}
      {isComplete && toolInvocation.result && (
        <div className="mt-2 text-xs text-white/70">
          <details>
            <summary className="cursor-pointer hover:text-white transition-colors">
              Zobrazit výsledek
            </summary>
            <pre className="mt-2 p-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded text-xs overflow-auto text-white/80">
              {JSON.stringify(toolInvocation.result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

