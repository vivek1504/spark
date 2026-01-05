import { SignedIn, SignInButton, SignOutButton, useAuth, UserButton } from "@clerk/clerk-react";

const Header = () => {
  const {isSignedIn} = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-5 h-5 text-primary-foreground"
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-semibold text-foreground">Spark</span>
        </div>

        {/* Social Icons */}
        <div className="hidden md:flex items-center gap-1">
          {isSignedIn ? <UserButton/> : <div  className="flex justify-between gap-2 items-center border-2 border-white/25 rounded bg-[#19e6d5] text-black font-semibold px-3 py-1 cursor-pointer" >
          <SignInButton/>
          </div>}
        </div>
      </div>
    </header>
  );
};

export default Header;