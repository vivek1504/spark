import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { getTerminal } from "@/lib/terminalSingleton";

export interface TerminalHandle {
  term: XTerm | null;
}

interface TerminalProps {
  onReady?: () => void;
}

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  ({ onReady }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const termRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useImperativeHandle(ref, () => ({
      term: termRef.current,
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const { terminal, isOpened, markOpened } = getTerminal();

      if (!isOpened) {
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        terminal.open(containerRef.current);
        fitAddon.fit();

        fitAddonRef.current = fitAddon;
        markOpened();
        onReady?.();
      } else {
        fitAddonRef.current?.fit();
      }

      termRef.current = terminal;

      const resize = () => fitAddonRef.current?.fit();
      window.addEventListener("resize", resize);

      const resizeObserver = new ResizeObserver(() => {
        setTimeout(() => fitAddonRef.current?.fit(), 50);
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        window.removeEventListener("resize", resize);
        resizeObserver.disconnect();
      };
    }, [onReady]);

    return (
      <div className="flex-shrink-0 border-t border-white/5 bg-black/30">
        <div ref={containerRef} className="h-40 w-full" />
      </div>
    );
  }
);

Terminal.displayName = "Terminal";
