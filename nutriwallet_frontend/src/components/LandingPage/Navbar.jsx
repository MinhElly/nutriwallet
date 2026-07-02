import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const navLinks = [
  { id: "features", label: "Tính năng" },
  { id: "how-it-works", label: "Cách hoạt động" },
  { id: "community", label: "Cộng đồng" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Standard transition class based on prompt requirements
  const trans = "transition-all duration-500 ease-in-out";

  return (
    <div className="fixed left-0 top-0 w-full z-50 flex justify-center pointer-events-none">
      <nav
        className={`pointer-events-auto relative flex justify-center overflow-hidden ${trans} ${
          isScrolled
            ? "mt-[15px] h-[70px] w-[90vw] max-w-[1240px] rounded-full bg-white/75 backdrop-blur-[24px] border border-gray-200/50 shadow-[0_18px_50px_rgba(0,0,0,0.12)] px-6"
            : "mt-0 h-[90px] w-full max-w-none rounded-none bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-none px-12"
        }`}
      >
        <div className="w-full max-w-6xl flex items-center justify-between h-full relative">
        {/* LEFT: Logo & Brand */}
        <div className={`flex items-center flex-shrink-0 z-10 ${trans} ${isScrolled ? "gap-0" : "gap-3.5"}`}>
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <Leaf size={18} strokeWidth={2} className="text-white" />
          </div>
          <div
            className={`whitespace-nowrap overflow-hidden ${trans} ${
              isScrolled ? "max-w-0 opacity-0 -translate-x-4" : "max-w-[200px] opacity-100 translate-x-0"
            }`}
          >
            <span
              className="font-bold text-[17px] tracking-[-0.02em] text-gray-900"
              style={{ fontFamily: "Psionic" }}
            >
              NutriWallet AI
            </span>
          </div>
        </div>

        {/* CENTER: Menu items */}
        {/* Absolute position ensures it remains perfectly centered even when the logo collapses */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center z-0 ${trans} ${
            isScrolled ? "gap-7" : "gap-8"
          }`}
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="group relative text-[14.5px] font-medium text-gray-500 hover:text-green-600 transition-colors duration-[250ms]"
            >
              {link.label}
              <span className="absolute -bottom-[6px] left-[15%] h-[3px] w-[70%] rounded-full bg-gradient-to-r from-[#FFD84D] via-[#22C55E] to-[#38BDF8] opacity-0 scale-x-0 origin-center transition-all duration-[250ms] ease-out pointer-events-none group-hover:scale-x-100 group-hover:opacity-100" />
            </a>
          ))}
        </div>

        {/* RIGHT: Auth & Language (Language omitted per original UI, CTA kept) */}
        <div className={`flex items-center flex-shrink-0 z-10 ${trans} ${isScrolled ? "gap-4" : "gap-5"}`}>
          <Link
            to="/login"
            className="hidden sm:block text-[14.5px] font-medium text-gray-500 hover:text-green-600 transition-colors duration-250"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className={`inline-flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full shadow-sm shadow-green-200 ${trans} ${
              isScrolled ? "h-[46px] px-5 text-[13.5px]" : "h-[54px] px-7 text-[14.5px]"
            }`}
          >
            Bắt đầu
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`${trans} ${isScrolled ? "w-3.5 h-3.5" : "w-4 h-4"}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;