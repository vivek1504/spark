import { Sparkle } from "lucide-react";

const HeroBadge = () => {
  return (
    <div className="inline-flex  items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border-white/30 shadow-lg">
      <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center">
        <Sparkle className="w-3 h-3 text-background" />
      </div>
      <span className="text-sm font-semibold text-foreground">Introducing{" "}
        <span className="text-[#19e6d5] italic animate-bounce">Spark</span> V2</span>
    </div>
  );
};

export default HeroBadge;
