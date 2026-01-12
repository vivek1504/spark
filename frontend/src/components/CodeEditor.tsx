import { useEffect, useState } from "react";
import { getWebContainer } from "@/webContainer/webContainerManager";
import Editor from "@monaco-editor/react";
import { defineTheme } from "@/lib/customTheme";

interface CodeEditorProps {
  selectedFile: string | null;
}

export const CodeEditor = ({ selectedFile }: CodeEditorProps) => {
  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    async function loadFile() {
      if (!selectedFile) return;
      const wc = await getWebContainer();
      const content = await wc.fs.readFile(selectedFile, "utf-8");
      setFileContent(content);
    }
    loadFile();
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile) return;

    const timeout = setTimeout(async () => {
      const wc = await getWebContainer();
      await wc.fs.writeFile(selectedFile, fileContent);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fileContent, selectedFile]);

  return (
    <div className="h-full flex flex-col bg-[hsl(220,20%,4%)]">
      {selectedFile && (
        <div className="h-9 flex items-center px-3 border-b border-white/5 bg-black/20">
          <span className="text-xs text-gray-400 font-mono">
            {selectedFile.split("/").pop()}
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {selectedFile ? (
          <Editor
            height="100%"
            path={selectedFile}
            value={fileContent}
            language={getLanguageFromPath(selectedFile)}
            theme="spark-dark"
            beforeMount={defineTheme}
            onChange={(value) => setFileContent(value ?? "")}
            options={{
              fontSize: 13,
              fontFamily: "JetBrains Mono, Fira Code, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              renderLineHighlight: "none",
              overviewRulerBorder: false,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  );
};

function getLanguageFromPath(path: string | null) {
  if (!path) return "plaintext";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".jsx")) return "javascript";
  if (path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  return "plaintext";
}
