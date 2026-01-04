import type { FileSystemTree } from "@webcontainer/api";
import { projectFiles } from "./projectFiles";
import axios from "axios";
import type { FixState } from "../types";
import { getWebContainer } from "./webContainerManager";
import { store } from "../store";
import { isWebcontainerLoadedAtom } from "../Atoms";
import {type Terminal } from "xterm";

const fixState : FixState = {
  isBusy :false,
  attempts: 0,
  maxAttempts: 3
}

let workspaceStarting = false;

export async function startWorkspace(previewIFrame:HTMLIFrameElement, terminal: Terminal){
    if(workspaceStarting) return
    workspaceStarting = true

    try {
        terminal.writeln("\r\n🚀 Starting workspace...\r\n");
        const webcontainer = await getWebContainer()

        await webcontainer.mount(projectFiles as unknown as FileSystemTree);

        terminal.writeln("\r\n📦 Installing dependencies...\r\n");

        const installProcess = await webcontainer.spawn(`npm`, ['install']);
        terminal.writeln("$ npm install");
        pipeProcessOutput(installProcess, terminal)
        const installExitCode = await installProcess.exit;
        
        if(installExitCode !== 0){
            terminal.writeln("\r\n❌ npm install failed")
            throw new Error('Unable to run npm install');
        }
        store.set(isWebcontainerLoadedAtom, true)
        terminal.writeln("\r\n✅ Dependencies installed");

        webcontainer.on("server-ready", (_,url)=>{
            previewIFrame.src = url;
          
        })

        terminal.writeln("\r\n  ▶ Starting dev server...\r\n");
        const devProcess = await webcontainer.spawn('npm', ['run', 'dev'])
        pipeProcessOutput(devProcess, terminal)
        workspaceStarting=false

      }catch(err){
        workspaceStarting=false
        store.set(isWebcontainerLoadedAtom,false)
        terminal.writeln(`\r\n❌ Error: ${(err as Error).message}`);
        throw err;
      }   
}

export async function applyEdit(path:string, newContents:string){
    const isWebContainerLoaded = store.get(isWebcontainerLoadedAtom)
    console.log("apply edit called")
    if (!isWebContainerLoaded){console.log("apply Edit skipped: webcontainer not ready"); return}
    if (fixState.isBusy){console.log("apply edit skipped: busy"); return}

    fixState.isBusy = true;

    const webcontainer = await getWebContainer()
    await webcontainer.fs.writeFile(path, newContents) 

    try {
      while (fixState.attempts < fixState.maxAttempts){
      fixState.attempts++
      const {exitCode, buildOutput} = await runBuild();
      console.log("exit code ---",exitCode)
      if (exitCode === 0) break

      const buildErrors = filterBuildError(buildOutput)
      const codeBeforeFix = await webcontainer.fs.readFile(path, 'utf-8')

      const fixedCode = await requestFix(codeBeforeFix,buildErrors)

      await webcontainer.fs.writeFile(path, fixedCode)
      }
    }finally{
      fixState.isBusy = false
      fixState.attempts = 0;
    }  
}

async function requestFix(code:string, error:string){
  const res = await axios.post('http://localhost:3000/fixError',{
    code,
    buildErrors : error
  }, {timeout : 45000})

  return res.data.response;
}

async function runBuild(){
  const webcontainer = await getWebContainer()
  const buildProcess = await webcontainer.spawn(`npm`,['run','build'])

  let buildOutput = ''

  buildProcess.output.pipeTo(new WritableStream({
    write(data){
      buildOutput += data;
    }
  }))

  const exitCode = await buildProcess.exit

  return {exitCode, buildOutput}
}

function filterBuildError(logContent : string) {
  const lines = logContent.split('\n');
  let errorLines = [];
  let isErrorBlock = false;
  let inCodeSnippet = false;

  // Keywords that indicate the start or continuation of the error block
  const errorTriggers = [
    '✗ Build failed',
    'error during build:',
    'ERROR:',
    'file:',
    'Expected ";"',
    '|', // This is crucial for capturing the code snippet lines
  ];

  // Keywords that indicate the end of the useful error block (start of stack trace)
  const stackTraceKeywords = ['at failureErrorWithLog', 'at eval', 'at handleIncomingPacket'];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 1. Start the error capture
    if (!isErrorBlock) {
      if (errorTriggers.some(trigger => line.includes(trigger))) {
        isErrorBlock = true;
      }
    }

    // 2. Stop the error capture (when stack trace begins)
    if (isErrorBlock && stackTraceKeywords.some(keyword => line.includes(keyword))) {
      break; // Exit the loop when the stack trace starts
    }

    // 3. Capture the content
    if (isErrorBlock) {
      
      // Determine if we are in the multi-line code snippet (starts with a number and '|')
      if (/^\s*\d+\s*\|\s*/.test(line) || line.includes('|')) {
        inCodeSnippet = true;
      } else if (inCodeSnippet && trimmedLine === '') {
        // Stop capturing snippet on the first blank line after the snippet
        inCodeSnippet = false;
        isErrorBlock = false; // The main error block has ended
      }

      // Only push lines that are not empty *unless* they are part of the snippet
      if (trimmedLine !== '' || inCodeSnippet) {
        // Clean up escape sequences common in shell output (like '[1G[0K')
        const cleanedLine = line.replace(/\u001b\[\d+G\u001b\[\d+K/g, '').trimRight();
        errorLines.push(cleanedLine);
      }

      // Early exit if the error block ends naturally
      if (isErrorBlock && trimmedLine === '') {
        isErrorBlock = false;
      }
    }
  }

  // Final cleanup: remove potential trailing empty lines
  while (errorLines.length > 0 && errorLines[errorLines.length - 1].trim() === '') {
    errorLines.pop();
  }
  
  return errorLines.join('\n');
}

function pipeProcessOutput(process: any, terminal: Terminal) {
  const decoder = new TextDecoder();

  if (process.output && typeof process.output.pipeTo === 'function') {
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(
            typeof data === 'string'
              ? data
              : decoder.decode(data, { stream: true })
          );
        },
      })
    );
    return;
  }

  if (process.stdout) {
    process.stdout.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(decoder.decode(data, { stream: true }));
        },
      })
    );
  }

  if (process.stderr) {
    process.stderr.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(decoder.decode(data, { stream: true }));
        },
      })
    );
  }
}

