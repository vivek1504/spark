import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {BuilderLayout} from "./pages/BuilderLayout";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import SignInPage from "./pages/SignInPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/chat" element={<>
            <SignedIn>
              <BuilderLayout/>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn/>
            </SignedOut>
          </>} />
          <Route path="sign-in" element={<SignInPage/>}/>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
