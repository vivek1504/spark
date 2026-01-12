export type FixState = {
    isBusy : boolean,
    attempts : number,
    maxAttempts : number
}

export type FileNode = {
    id: string
    name: string
    type: "file" | "directory"
    children? : FileNode[]
    path:string
}