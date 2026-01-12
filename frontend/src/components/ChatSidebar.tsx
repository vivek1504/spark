import { useEffect, useState } from "react";
import { Send, Bot, User } from "lucide-react";
import axios from "axios";
import { getWebContainer } from "@/webContainer/webContainerManager";
import { applyEdit } from "@/webContainer/webContainerRuntime";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  const { getToken } = useAuth();
  const [webContainer, setWebcontainer] = useState<any>();
  const token = getToken();
  const navigate = useNavigate();

  useEffect(() => {
    getWebContainer().then(setWebcontainer);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const code = await webContainer.fs.readFile("/src/App.jsx", "utf-8");

      const res = await axios.post(
        `${BACKEND_URL}update`,
        {
          userPrompt: input,
          code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedCode = res.data.response;
      applyEdit("/src/App.jsx", updatedCode);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Got it! Here is your updated app",
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Something went wrong while updating the code",
        },
      ]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black/60 border-r border-white/5">
      <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <button className="flex items-center" onClick={() => navigate("/")}>
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <img
              src="/logo.png"
              alt="Spark"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-sm text-white">Spark</span>
        </button>
        <div>
          <UserButton></UserButton>
        </div>
      </div>

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
                message.role === "assistant" ? "bg-[#1f3dbc]/30" : "bg-white/5"
              }`}
            >
              {message.role === "assistant" ? (
                <Bot className="w-4 h-4 text-[#5b8aff]" />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div
              className={`flex-1 px-3 py-2 rounded-lg text-sm leading-relaxed ${
                message.role === "assistant"
                  ? "bg-white/5 text-gray-200"
                  : "bg-[#1f3dbc]/20 text-gray-200"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what to build..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1f3dbc]/50 focus:border-[#1f3dbc]/50 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#1f3dbc] text-white flex items-center justify-center hover:bg-[#2a4dd4] transition-colors disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
