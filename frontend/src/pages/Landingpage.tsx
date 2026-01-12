import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export type HeroWaveProps = {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
};

const MATRIX_CHARS =
  "{}[]()<>=/\\|;:,.!@#$%^&*+-~`01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

interface Particle {
  x: number;
  y: number;
  char: string;
  speed: number;
  opacity: number;
  targetOpacity: number;
  size: number;
  column: number;
  trail: { y: number; char: string; opacity: number }[];
  hue: number;
}

export const LandingPage = ({
  className,
  style,
  title = "Build with AI.",
  subtitle = "The AI Fullstack Engineer. Build prototypes, apps, and websites",
  placeholder = "Describe what you want to create...",
  buttonText = "Generate",
}: HeroWaveProps) => {
  const [prompt, setPrompt] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Typing placeholder animation
  const basePlaceholder = "Make me a";
  const suggestionsRef = useRef<string[]>([
    " fitness app",
    " recipe generator",
    " marketing landing page",
    " travel itinerary planner",
    " blog engine",
    " customer support chatbot",
    " personal finance dashboard",
  ]);
  const [animatedPlaceholder, setAnimatedPlaceholder] =
    useState<string>(basePlaceholder);
  const typingStateRef = useRef({
    suggestionIndex: 0,
    charIndex: 0,
    deleting: false,
    running: true,
  });
  const timersRef = useRef<number[]>([]);

  // Placeholder typing effect
  useEffect(() => {
    typingStateRef.current.running = true;
    const typeSpeed = 70;
    const deleteSpeed = 40;
    const pauseAtEnd = 1200;
    const pauseBetween = 500;

    function schedule(fn: () => void, delay: number) {
      const id = window.setTimeout(fn, delay);
      timersRef.current.push(id);
    }

    function clearTimers() {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    }

    function step() {
      if (!typingStateRef.current.running) return;
      if (prompt !== "") {
        setAnimatedPlaceholder(basePlaceholder);
        schedule(step, 300);
        return;
      }

      const state = typingStateRef.current;
      const suggestions = suggestionsRef.current;
      const current =
        suggestions[state.suggestionIndex % suggestions.length] || "";

      if (!state.deleting) {
        const nextIndex = state.charIndex + 1;
        const next = current.slice(0, nextIndex);
        setAnimatedPlaceholder(basePlaceholder + next);
        state.charIndex = nextIndex;
        if (nextIndex >= current.length) {
          schedule(() => {
            state.deleting = true;
            step();
          }, pauseAtEnd);
        } else {
          schedule(step, typeSpeed);
        }
      } else {
        const nextIndex = Math.max(0, state.charIndex - 1);
        const next = current.slice(0, nextIndex);
        setAnimatedPlaceholder(basePlaceholder + next);
        state.charIndex = nextIndex;
        if (nextIndex <= 0) {
          state.deleting = false;
          state.suggestionIndex =
            (state.suggestionIndex + 1) % suggestions.length;
          schedule(step, pauseBetween);
        } else {
          schedule(step, deleteSpeed);
        }
      }
    }

    clearTimers();
    schedule(step, 400);
    return () => {
      typingStateRef.current.running = false;
      clearTimers();
    };
  }, [prompt]);

  // Matrix rain effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const particles: Particle[] = [];
    const COLUMN_WIDTH = 20;
    const TRAIL_LENGTH = 15;

    function getRandomChar() {
      return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    }

    function resize() {
      const container = containerRef.current;
      if (!container || !canvas) return;

      const dpr = Math.min(window.devicePixelRatio, 2);
      width = container.clientWidth;
      height = container.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);

      // Initialize particles for each column
      const columnCount = Math.ceil(width / COLUMN_WIDTH);

      // Only reinitialize if column count changed significantly
      if (
        Math.abs(particles.length - columnCount) > 5 ||
        particles.length === 0
      ) {
        particles.length = 0;

        for (let i = 0; i < columnCount; i++) {
          const x = i * COLUMN_WIDTH + COLUMN_WIDTH / 2;
          particles.push({
            x,
            y: Math.random() * height * 2 - height, // Start at random positions
            char: getRandomChar(),
            speed: 1 + Math.random() * 3,
            opacity: 0,
            targetOpacity: 0.3 + Math.random() * 0.7,
            size: 12 + Math.random() * 4,
            column: i,
            trail: [],
            hue: 200 + Math.random() * 40, // Blue-ish hue range
          });
        }
        particlesRef.current = particles;
      }
    }

    function updateParticle(
      p: Particle,
      mouseX: number,
      mouseY: number,
      isMouseActive: boolean
    ) {
      // Update position
      p.y += p.speed;

      // Reset when off screen
      if (p.y > height + 50) {
        p.y = -50;
        p.speed = 1 + Math.random() * 3;
        p.trail = [];
        p.hue = 200 + Math.random() * 40;
      }

      // Occasionally change character
      if (Math.random() < 0.02) {
        p.char = getRandomChar();
      }

      // Update trail
      p.trail.unshift({
        y: p.y,
        char: p.char,
        opacity: p.opacity,
      });

      if (p.trail.length > TRAIL_LENGTH) {
        p.trail.pop();
      }

      // Mouse interaction - particles glow brighter near cursor
      if (isMouseActive) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;

        if (dist < maxDist) {
          const influence = 1 - dist / maxDist;
          p.targetOpacity = Math.min(1, 0.5 + influence * 0.5);
          // Speed boost near cursor
          p.speed = Math.min(6, p.speed + influence * 0.1);
          // Shift hue towards cyan/green when near cursor
          p.hue = 200 + influence * 60;
        } else {
          p.targetOpacity = 0.3 + Math.random() * 0.4;
        }
      }

      // Smooth opacity transition
      p.opacity += (p.targetOpacity - p.opacity) * 0.1;
    }

    function drawParticle(p: Particle) {
      if (!ctx) return;

      // Draw trail
      for (let i = p.trail.length - 1; i >= 0; i--) {
        const t = p.trail[i];
        const trailOpacity = p.opacity * (1 - i / TRAIL_LENGTH) * 0.6;
        const trailSize = p.size * (1 - (i / TRAIL_LENGTH) * 0.3);

        // Trail color fades from bright to dark blue
        const lightness = 60 - (i / TRAIL_LENGTH) * 30;
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${lightness}%, ${trailOpacity})`;
        ctx.font = `${trailSize}px "Fira Code", "JetBrains Mono", monospace`;
        ctx.textAlign = "center";
        ctx.fillText(t.char, p.x, t.y);
      }

      // Draw main character (brightest)
      const glowOpacity = p.opacity;

      // Outer glow
      ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${glowOpacity * 0.8})`;
      ctx.shadowBlur = 15;

      // Main character
      ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${glowOpacity})`;
      ctx.font = `bold ${p.size}px "Fira Code", "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(p.char, p.x, p.y);

      // Reset shadow
      ctx.shadowBlur = 0;
    }

    function animate() {
      if (!ctx || !canvas) return;

      // Clear with fade effect for smoother trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // Update and draw all particles
      for (const p of particlesRef.current) {
        updateParticle(p, mouse.x, mouse.y, mouse.active);
        drawParticle(p);
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    // Event handlers

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }

    function handleMouseLeave() {
      mouseRef.current.active = false;
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) {
        const rect = canvas!.getBoundingClientRect();
        mouseRef.current.x = e.touches[0].clientX - rect.left;
        mouseRef.current.y = e.touches[0].clientY - rect.top;
        mouseRef.current.active = true;
      }
    }

    function handleTouchEnd() {
      mouseRef.current.active = false;
    }

    // Initialize
    resize();

    // Initial clear
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, width, height);

    animate();

    // Event listeners
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    // Visibility handling
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationRef.current);
      } else {
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    sessionStorage.setItem("pendingPrompt", prompt);

    if (!isSignedIn) {
      navigate(`/sign-in?redirect_url=/chat`);
      return;
    }
    navigate(`/chat`);
  };

  return (
    <section
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#000",
        ...style,
      }}
      aria-label="Animated hero"
    >
      <Navbar />
      {/* Matrix canvas background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          opacity: 0.85,
        }}
      />
      {/* Content overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          padding: "24px",
        }}
      >
        <div
          className="max-w-3xl w-full text-center"
          style={{ pointerEvents: "auto" }}
        >
          <h1 className="text-white text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow-[0_1px_8px_rgba(31,61,188,0.25)]">
            {title}
          </h1>
          <p className="text-gray-300/90 mt-3 sm:mt-4 text-sm sm:text-base">
            {subtitle}
          </p>
          <form
            className="mt-6 sm:mt-8 flex items-center justify-center"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="relative w-full sm:w-[720px]">
              <div className="relative rounded-2xl p-[2px] shadow-[0_1px_2px_0_rgba(0,0,0,0.06)] bg-gradient-to-br from-white/10 via-white/5 to-black/20">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={animatedPlaceholder}
                  rows={5}
                  className="w-full h-32 sm:h-36 resize-none rounded-2xl bg-[rgba(15,15,20,0.75)] border border-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#1f3dbc]/40 focus:border-[#1f3dbc]/40 backdrop-blur-md px-4 py-4 pr-16"
                />
              </div>
              <button
                type="submit"
                aria-label={buttonText}
                className="absolute right-3 bottom-3 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f0f2ff] text-black hover:bg-white transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Footer */}
      <footer
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 4,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>© 2026 Spark. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Discord
            </a>
            <span className="hidden sm:inline text-gray-700">|</span>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
};
