import { WebContainer } from "@webcontainer/api";

let webcontainer : WebContainer | null = null;
let bootPromise : Promise<WebContainer> | null = null

export async function getWebContainer() {
    if (webcontainer) return webcontainer

    if (!bootPromise){
        bootPromise = WebContainer.boot().then((wc)=>{
            webcontainer = wc
            return wc
        })
    }
    return bootPromise
}

export function isWebContainerReady(){
    return webcontainer !== null
}