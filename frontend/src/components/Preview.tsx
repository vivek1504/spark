import { RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

export const Preview = ({ iframeRef }: { iframeRef: any }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(220,20%,4%)]">
      <div className="h-8 flex-shrink-0 flex items-center justify-between px-3 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded text-xs text-gray-500">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isLoading ? "bg-yellow-500 animate-pulse" : "bg-[#22c55e]"
            }`}
          />
          <span className="font-mono">localhost:5173</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(220,20%,6%)] z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[#1f3dbc]/20 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#5b8aff] animate-spin" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-gray-300">
                  Starting preview...
                </span>
                <span className="text-xs text-gray-500">
                  Building your application
                </span>
              </div>

              <div className="flex gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[#5b8aff] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[#5b8aff] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[#5b8aff] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          className="w-full h-full bg-white"
          style={{ border: "none" }}
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
};
