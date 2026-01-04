import { RefreshCw, ExternalLink, Smartphone, Monitor, Tablet } from "lucide-react";
import { useRef, useState } from "react";

type ViewMode = "desktop" | "tablet" | "mobile";

export const Preview = ({iframeRef} : {iframeRef :any}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const getPreviewWidth = () => {
    switch (viewMode) {
      case "mobile":
        return "w-[375px]";
      case "tablet":
        return "w-[768px]";
      default:
        return "w-full";
    }
  };

  return (
    <div className="h-full flex flex-col bg-panel">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("desktop")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "desktop" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("tablet")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "tablet" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "mobile" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>localhost:5173</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-background/50 flex items-start justify-center p-4">
        <div
          className={`${getPreviewWidth()} h-full bg-background rounded-lg border border-border shadow-xl transition-all duration-300 overflow-hidden`}
        >
          {/* Simulated Website Preview */}
          <iframe ref={iframeRef} style={{ width: "100%", height: "80vh", border: "1px solid #ddd" }} />
        </div>
      </div>
    </div>
  );
};
