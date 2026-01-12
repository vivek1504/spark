import { useEffect, useRef, useState } from "react";
import { ChatSidebar } from "../components/ChatSidebar";
import { CodeEditor } from "../components/CodeEditor";
import { Preview } from "../components/Preview";
import { Code, Eye, FolderTree, MessageSquareCode } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import {
  codeAtom,
  isLoadingCode,
  isWebcontainerLoadedAtom,
  promptAtom,
} from "../lib/Atoms";
import { applyEdit, startWorkspace } from "@/webContainer/webContainerRuntime";
import { Terminal, TerminalHandle } from "../components/Terminal";
import DownloadButton from "@/components/ui/DownloadButton";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { FileNode } from "@/lib/types";
import { getWebContainer } from "@/webContainer/webContainerManager";
import { buildTree, FileTree } from "../components/FileTree";

type ViewMode = "split" | "code" | "preview";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const BuilderLayout = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(true);
  const [terminalReady, setTerminalReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const terminalRef = useRef<TerminalHandle>(null);

  const code = useAtomValue(codeAtom);
  const [isWebcontainerLoaded] = useAtom(isWebcontainerLoadedAtom);

  const { isSignedIn } = useAuth();
  const [prompt = "", setPrompt] = useAtom(promptAtom);
  const [, setCode] = useAtom(codeAtom);
  const [, setLoading] = useAtom(isLoadingCode);
  const { getToken } = useAuth();

  const [searchParams] = useSearchParams();

  const [treeData, setTreeData] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    async function loadTree() {
      const wc = await getWebContainer();
      const tree = await buildTree(wc.fs);
      setTreeData(tree);
    }
    loadTree();
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;

    const storedPrompt = sessionStorage.getItem("pendingPrompt");
    if (!storedPrompt) return;

    setPrompt(storedPrompt ?? "");
    sessionStorage.removeItem("pendingPrompt");
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    if (!prompt.trim()) return;

    const sendPrompt = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const res = await axios.post(
          `${BACKEND_URL}chat`,
          { userPrompt: prompt },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCode(res.data.response);
      } finally {
        setLoading(false);
      }
    };

    sendPrompt();
  }, [isSignedIn, prompt]);

  useEffect(() => {
    if (!terminalReady) return;
    if (!terminalRef.current?.term) return;
    if (!iframeRef.current) return;
    startWorkspace(iframeRef.current, terminalRef.current.term).catch((e) =>
      console.error("WebContainer error:", e)
    );
  }, [terminalReady]);

  useEffect(() => {
    if (!isWebcontainerLoaded) {
      return;
    }
    if (!code.trim()) {
      return;
    }
    applyEdit("/src/App.jsx", code);
  }, [code, isWebcontainerLoaded]);

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(31,61,188,0.08) 0%, transparent 15%), hsl(220 20% 4%)",
      }}
    >
      <div
        className={`h-full flex-shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        <ChatSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isSidebarOpen
                  ? "text-[#5b8aff] bg-[#1f3dbc]/20 shadow-[0_0_12px_rgba(91,138,255,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="AI Chat"
            >
              <MessageSquareCode className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFileTreeOpen(!isFileTreeOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isFileTreeOpen
                  ? "text-[#5b8aff] bg-[#1f3dbc]/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="Toggle files"
            >
              <FolderTree className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-white/10 mx-1" />
            <span className="text-sm font-medium text-white">my-website</span>
          </div>

          <div className="flex items-center bg-white/5 rounded-lg p-1">
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

          <DownloadButton />
        </div>

        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div
            className={`flex flex-col transition-all duration-300 overflow-hidden ${
              viewMode === "preview"
                ? "w-0"
                : viewMode === "code"
                ? "flex-1"
                : "w-[60%]"
            } ${viewMode !== "preview" ? "border-r border-white/5" : ""}`}
          >
            <div className="flex-1 flex min-h-0 overflow-hidden">
              <div
                className={`flex-shrink-0 transition-all duration-300 ease-in-out border-r border-white/5 bg-black/20 overflow-hidden ${
                  isFileTreeOpen ? "w-56" : "w-0"
                }`}
              >
                <div className="h-full overflow-auto scrollbar-thin">
                  <FileTree
                    data={treeData}
                    selectedFile={selectedFile}
                    onFileSelect={(path) => setSelectedFile(path)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <CodeEditor selectedFile={selectedFile} />
              </div>
            </div>

            <Terminal
              ref={terminalRef}
              onReady={() => setTerminalReady(true)}
            />
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              viewMode === "code"
                ? "w-0"
                : viewMode === "preview"
                ? "flex-1"
                : "w-[40%]"
            }`}
          >
            <Preview iframeRef={iframeRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

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
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
      active
        ? "bg-[#1f3dbc] text-white"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`}
  >
    {icon}
    {label}
  </button>
);
