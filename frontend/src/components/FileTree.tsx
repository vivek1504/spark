import type { FileNode } from "../lib/types";
import { type FileSystemAPI } from "@webcontainer/api";
import { Tree, type NodeRendererProps } from "react-arborist";
import { Folder, FolderOpen, FileCode, FileJson, FileText } from "lucide-react";

type Props = {
  data: FileNode[];
  onFileSelect: (path: string) => void;
  selectedFile: any;
};

export async function buildTree(
  fs: FileSystemAPI,
  dir: string = "/"
): Promise<FileNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const nodes: FileNode[] = [];

  for (const entry of entries) {
    const fullPath = dir === "/" ? `/${entry.name}` : `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      nodes.push({
        id: fullPath,
        name: entry.name,
        type: "directory",
        path: fullPath,
        children: await buildTree(fs, fullPath),
      });
    } else {
      nodes.push({
        id: fullPath,
        name: entry.name,
        type: "file",
        path: fullPath,
      });
    }
  }
  return nodes;
}

export function FileTree({ data, onFileSelect, selectedFile }: Props) {
  return (
    <div className="h-full w-full pt-2">
      <Tree
        data={data}
        openByDefault={false}
        width="100%"
        height={800}
        indent={12}
        rowHeight={28}
        onSelect={(nodes) => {
          const node = nodes[0];
          if (node?.data.type === "file") {
            onFileSelect(node.data.path);
          }
        }}
      >
        {Node}
      </Tree>
    </div>
  );
}

function Node({ node, style }: NodeRendererProps<FileNode>) {
  //@ts-ignore
  const isSelected = node.data.path === node.tree.props.selectedFile;
  const Icon = getIcon(node.data, node.isOpen);
  return (
    <div
      style={style}
      className={`
        flex items-center gap-2 px-3 cursor-pointer rounded-md mx-1 text-sm
        ${
          isSelected
            ? "bg-[#1f3dbc]/30 text-[#5b8aff]"
            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
        }
      `}
      onClick={() => {
        if (node.data.type === "directory") {
          node.toggle();
        }
      }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{node.data.name}</span>
    </div>
  );
}

function getIcon(node: FileNode, isOpen: boolean) {
  if (node.type === "directory") {
    return isOpen ? FolderOpen : Folder;
  }

  if (node.name.endsWith(".ts") || node.name.endsWith(".tsx")) return FileCode;
  if (node.name.endsWith(".js") || node.name.endsWith(".jsx")) return FileCode;
  if (node.name.endsWith(".json")) return FileJson;
  if (node.name.endsWith(".css")) return FileText;
  if (node.name.endsWith(".html")) return FileCode;

  return FileText;
}
