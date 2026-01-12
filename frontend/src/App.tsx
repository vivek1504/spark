import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BuilderLayout } from "./pages/BuilderLayout";
import NotFound from "./pages/NotFound";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { LandingPage } from "./pages/Landingpage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/chat"
            element={
              <>
                <SignedIn>
                  <BuilderLayout />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route path="sign-in/*" element={<SignInPage />} />
          <Route path="sign-up/*" element={<SignUpPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<LandingPage></LandingPage>}></Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
