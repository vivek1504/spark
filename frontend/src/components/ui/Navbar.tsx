"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 px-6 py-4 backdrop-blur-md border-b border-white/5 bg-black/40">
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <img
              src="/logo.png"
              alt="Spark"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white font-semibold">Spark</span>
        </button>

        <div className="flex items-center gap-1">
          <a
            href="https://github.com/vivek1504/spark"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>

          <div className="h-5 w-px bg-white/10" />

          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
