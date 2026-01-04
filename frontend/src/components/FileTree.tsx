import type { FileNode } from "../../types";
import { type FileSystemAPI} from "@webcontainer/api"
import {Tree, type NodeRendererProps} from "react-arborist"

type Props= {
    data:FileNode[]
    onFileSelect: (path:string)=> void
}

export async function buildTree(fs:FileSystemAPI, dir: string="/"): Promise<FileNode[]>{
    const entries = await fs.readdir(dir,{withFileTypes:true})

    const nodes:FileNode[] = []

    for(const entry of entries){
        const fullPath = dir==="/" ? `/${entry.name}` :`${dir}/${entry.name}`
        if(entry.isDirectory()){
            nodes.push({
                id:fullPath,
                name:entry.name,
                type:"directory",
                path:fullPath,
                children: await buildTree(fs, fullPath)
            })
        }
        else{
            nodes.push({
                id:fullPath,
                name:entry.name,
                type:"file",
                path:fullPath
            })
        }
    }
    return nodes
}


export function FileTree({data, onFileSelect}:Props){
    return (
        <Tree
            data={data}
            openByDefault={false}
            width={260}
            height={600}
            indent={15}
            rowHeight={28}
            onSelect={(nodes)=>{
                const node = nodes[0];
                if(node?.data.type === "file"){
                    onFileSelect(node.data.path)
                }
            }}>
                {Node}
        </Tree>
        
    )
}

function Node({node, style}:NodeRendererProps<FileNode>){
    return(
        <div
            style={style}
            className="flex items-center gap-2 px-2 cursor-pointer hover:bg-gray-800"
            onClick={()=>{
                if(node.data.type === "directory"){
                    node.toggle()
                }
            }}
        >
            <span>
                {node.data.type === "directory" ? "📁" : "📄"}
            </span>
            <span>{node.data.name}</span>
        </div>
    )
}