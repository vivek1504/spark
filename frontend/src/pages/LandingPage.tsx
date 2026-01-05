import Header from "../components/Header";
import HeroBadge from "../components/HeroBadge";
import ChatInput from "../components/ChatInput";
import Footer from "../components/Footer";
import { useAtomValue } from "jotai";
import { isLoadingCode } from "@/Atoms";
import Loader from "@/components/ui/Loader";

export default function LandingPage() {
  const loading = useAtomValue(isLoadingCode);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">

  {/* PAGE CONTENT */}
  <div className={`${loading ? "blur-sm pointer-events-none" : ""} transition-all duration-300`}>
    <Header />

    <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12 relative z-10">
      <div className="text-center max-w-4xl mx-auto">
        <div className="mb-8">
          <HeroBadge />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          What will you{" "}
          <span className="font-display italic text-[#19e6d5]">build</span>{" "}
          today?
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
          Create stunning apps & websites by chatting with AI.
        </p>

        <ChatInput />
      </div>
    </main>

    <Footer />
  </div>

  {loading && (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/30 backdrop-blur-sm">
      <Loader />
      <p className="text-sm text-muted-foreground">
        This usually takes a few seconds
      </p>
    </div>
  )}

</div>

  );
}


