import { useEffect, useState } from "react";
import { Send, Sparkles, Bot, User, Zap } from "lucide-react";
import axios from "axios";
import { getWebContainer } from "@/webContainer/webContainerManager";
import { applyEdit } from "@/webContainer/webContainerRuntime";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Your app is ready. Suggest changes or additions",
  },
];

export const ChatSidebar = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [webContainer, setWebcontainer] = useState<any>()

  useEffect(()=>{
    getWebContainer().then(setWebcontainer)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev)=> [...prev, userMessage])
    setInput("")

    try{
    const code =await webContainer.fs.readFile("/src/App.jsx","utf-8")

    const res = await axios.post(`${BACKEND_URL}/update`,{
      userPrompt : input,
      code
    })

    const updatedCode = res.data.response;
    applyEdit("/src/App.jsx", updatedCode)

    setMessages((prev)=>[...prev,{id:(Date.now()).toString(),
      role:"assistant",
      content:"Got it! Here is your updated app"
    }])
  }catch(e){
    setMessages((prev)=>[...prev,{
      id:(Date.now()).toString(),
      role:"assistant",
      content:"Something went wrong while updating the code"
    }])
  }
  };

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-border">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">Spark</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-fade-in ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                message.role === "assistant"
                  ? "bg-primary/20"
                  : "bg-secondary"
              }`}
            >
              {message.role === "assistant" ? (
                <Bot className="w-4 h-4 text-primary" />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div
              className={`flex-1 px-3 py-2 rounded-lg text-sm leading-relaxed ${
                message.role === "assistant"
                  ? "bg-secondary/50 text-foreground"
                  : "bg-primary/10 text-foreground"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what to build..."
            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
