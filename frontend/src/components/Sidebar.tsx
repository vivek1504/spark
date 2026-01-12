import { ArrowUp } from "lucide-react";
import { useState } from "react";
export default function SideBar() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="h-screen bg-neutral-900 flex flex-col mt-2">
      <div className="flex justify-between items-center border-b">
        <div className="flex gap-1 p-2  pl-5">
          <span>
            <svg
              viewBox="0 0 24 24"
              fill="blue"
              className="w-5 h-5 text-primary-foreground"
              stroke="blue"
              strokeWidth="2.5"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </span>
          <span className="font-bold italic">Your Application</span>
        </div>
        <div></div>
      </div>

      <div className="flex justify-end mt-4 mr-3 px-2 py-4">
        <span className="inline-flex bg-[#FFFFFF12] p-2 text-white rounded-sm mr-1">
          create a todo app
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-white space-y-4 ml- mt-4">
        <p>
          I'll create a fully functional todo app with database persistence...
        </p>
        I'll create a fully functional todo app with database persistence. Let
        me break this down into steps: Plan Create database migration for todos
        table Set up Bolt Database client configuration Build todo app UI
        components Run build to verify everything works Plan completed Open
        details Your todo app is ready! Here's what was created: Database: Set
        up a secure todos table with user authentication. Each user can only
        access their own todos. Authentication: Built a complete sign-in and
        sign-up system. Users can create accounts and log in to access their
        todos. Features: Add new todos with a simple form Mark todos as complete
        or incomplete by clicking the icon Delete todos by hovering over them
        and clicking the trash icon Separate sections for active and completed
        todos Clean, modern design with smooth transitions The app automatically
        saves all todos to the database and displays them in real-time. Sign out
        functionality is available in the top-right corner.
      </div>

      <div className="p-4">
        <div className="w-full border border-white/50 rounded-2xl p-4 bg-zinc-950">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Let's build a dashboard to"
            className="w-full bg-transparent text-white placeholder:text-gray-400 resize-none outline-none text-base min-h-15"
            rows={2}
          />

          <div className="flex items-center justify-between gap-3 mt-3">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded-xl hover:bg-white/10 transition">
              <span className="text-sm text-gray-300">Qwen 3</span>
            </button>

            <button className="flex items-center gap-2 border-2 border-white/25 rounded-xl bg-blue-300 text-blue-900 font-semibold px-4 py-2">
              send
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
