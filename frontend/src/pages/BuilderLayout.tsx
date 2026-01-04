import { useEffect, useRef, useState } from "react";
import { ChatSidebar } from "../components/ChatSidebar";
import { CodeEditor } from "../components/CodeEditor";
import { Preview } from "../components/Preview";
import { Code, Eye, PanelLeftClose, PanelLeft } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { codeAtom, isWebcontainerLoadedAtom } from "@/Atoms";
import { applyEdit, startWorkspace } from "@/webContainer/webContainerRuntime";
import { Terminal, TerminalHandle } from "../components/Terminal";
import DownloadButton from "@/components/ui/DownloadButton";
type ViewMode = "split" | "code" | "preview";

export const BuilderLayout = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [terminalReady, setTerminalReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const terminalRef = useRef<TerminalHandle>(null);

  const code = useAtomValue(codeAtom);
  const [isWebcontainerLoaded] = useAtom(isWebcontainerLoadedAtom);

  /* Boot WebContainer (runs ONCE, correctly) */
  useEffect(() => {
    if (!terminalReady) return;
    if (!terminalRef.current?.term) return;
    if (!iframeRef.current) return;
    startWorkspace(iframeRef.current, terminalRef.current.term).catch((e) =>
      console.error("WebContainer error:", e)
    );
  }, [terminalReady]);

  /* Apply AI edits */
  useEffect(() => {
    if (!isWebcontainerLoaded){
      console.log("returned due to webcontainer not loaded")
      return;
    };
    if (!code.trim()){ 
      console.log("due to code trim")
      return}
    applyEdit("/src/App.jsx", code);
  }, [code, isWebcontainerLoaded]);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Chat Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-[20%] min-w-[280px]" : "w-0"
        } overflow-hidden`}
      >
        <ChatSidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </button>

            <div className="h-6 w-px bg-border" />
            <span className="text-sm font-medium">my-website</span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-secondary/50 rounded-lg p-1">
            <ViewButton
              active={viewMode === "code"}
              onClick={() => setViewMode("code")}
              icon={<Code className="w-3.5 h-3.5" />}
              label="Code"
            />
            <ViewButton
              active={viewMode === "split"}
              onClick={() => setViewMode("split")}
              label="Split"
              icon={
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-3 bg-current rounded-sm" />
                  <div className="w-1.5 h-3 bg-current rounded-sm" />
                </div>
              }
            />
            <ViewButton
              active={viewMode === "preview"}
              onClick={() => setViewMode("preview")}
              icon={<Eye className="w-3.5 h-3.5" />}
              label="Preview"
            />
          </div>

          <DownloadButton></DownloadButton>
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 flex min-h-0">
          {/* Code */}
          <div
            className={`transition-all duration-300 ${
              viewMode === "preview"
                ? "w-0"
                : viewMode === "code"
                ? "w-full"
                : "w-1/2"
            } overflow-hidden border-r border-border`}
          >
            <CodeEditor />
          </div>

          {/* Preview */}
          <div
            className={`transition-all duration-300 ${
              viewMode === "code"
                ? "w-0"
                : viewMode === "preview"
                ? "w-full"
                : "w-1/2"
            } overflow-hidden`}
          >
            <Preview iframeRef={iframeRef} />
          </div>
        </div>

        {/* Terminal */}
        <Terminal
          ref={terminalRef}
          onReady={() => setTerminalReady(true)}
        />
      </div>
    </div>
  );
};

/* Helper */
const ViewButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {icon}
    {label}
  </button>
);
