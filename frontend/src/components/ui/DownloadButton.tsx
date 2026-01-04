import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { getWebContainer } from "@/webContainer/webContainerManager";

export default function DownloadButton() {
  const [webContainer, setWebContainer] = useState<any>(null);

  useEffect(() => {
    getWebContainer().then(setWebContainer);
  }, []);

  async function downloadProject(webContainer: any) {
    if (!webContainer) return;

    const zip = new JSZip();
    const files = await readAllFiles(webContainer);

    for (const file of files) {
      zip.file(file.path, file.content);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "project.zip");
  }

  return (
    <button
      disabled={!webContainer}
      onClick={() => downloadProject(webContainer)}
      className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
    >
      Download Project
    </button>
  );
}

async function readAllFiles(
  webContainer: any,
  base = "/"
): Promise<{ path: string; content: string }[]> {
  const result: { path: string; content: string }[] = [];

  async function walk(dir: string) {
    const entries = await webContainer.fs.readdir(dir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = dir === "/" ? `/${entry.name}` : `${dir}/${entry.name}`;

      if (entry.isFile()) {
        const content = await webContainer.fs.readFile(fullPath, "utf-8");
        result.push({
          path: fullPath.replace(/^\//, ""), // remove leading slash for zip
          content,
        });
      } else if (entry.isDirectory()) {
        // optional: skip node_modules
        if (entry.name === "node_modules") continue;

        await walk(fullPath);
      }
    }
  }

  await walk(base);
  return result;
}

