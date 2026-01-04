import { ArrowRight } from "lucide-react";
import { useAtom } from "jotai";
import { codeAtom, isLoadingCode, promptAtom } from "@/Atoms";
import axios from "axios";
import { useNavigate } from "react-router";


const BACKEND_URL=import.meta.env.VITE_BACKEND_URL

const ChatInput = () => {
  const [prompt, setPrompt] = useAtom(promptAtom);
  const navigate = useNavigate()
  const [_, setCode] = useAtom(codeAtom)
  const [__, setLoading] = useAtom(isLoadingCode)

  const sendPrompt = async ()=> {
      try {
          setLoading(true)
          const res = await axios.post(`${BACKEND_URL}/chat`, {
              userPrompt : prompt
          });
          const generatedCode = res.data.response
          setCode(generatedCode)
          setLoading(false)
      }catch(err){
          console.error(err)
      }
  }

  return (
    <div className="w-full max-w-2xl mx-auto border border-white/50 rounded-2xl mb bg-zinc-900 mb-20">
      <div className="glass-card rounded-2xl p-4 shadow-2xl shadow-primary/5">
        <div className="mb-4 ">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Let's build a dashboard to"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-base min-h-15"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 border border-white/20 rounded-xl">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-background" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Qwen 3</span>
            </button>
          </div>

                  
            <button className="flex justify-between gap-2 items-center border-2 border-white/25 rounded-xl bg-[#19e6d5] text-black font-semibold px-4 py-2 cursor-pointer" 
              onClick={async()=>{
                await sendPrompt();
                navigate("/chat")
              }}>
              <div>Build now</div>
              <ArrowRight className="w-4 h-4" />
            </button>
          
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

