

import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">NW</div>
            <span className="font-bold text-lg tracking-tight text-gray-900" style={{ fontFamily: "Psionic" }}>NutriWallet AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-green-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-green-600 transition">How It Works</a>
            <a href="#community" className="hover:text-green-600 transition">Community</a>
            <a href="#pricing" className="hover:text-green-600 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-green-600 transition">Login</Link>
            <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1 transition shadow-sm shadow-green-200">
              Sign Up Free 
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;