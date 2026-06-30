import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/75 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2C4.24 2 2 4.24 2 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm.75 7.5h-1.5v-4h1.5v4zm0-5.5h-1.5V2.5h1.5V4z" fill="white"/>
              </svg>
            </div>
            <span
              className="font-bold text-[15px] tracking-[-0.02em] text-gray-900"
              style={{ fontFamily: "Psionic" }}
            >
              NutriWallet AI
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-gray-500">
            <a href="#features" className="hover:text-green-600 transition-colors duration-150">Tính năng</a>
            <a href="#how-it-works" className="hover:text-green-600 transition-colors duration-150">Cách hoạt động</a>
            <a href="#community" className="hover:text-green-600 transition-colors duration-150">Cộng đồng</a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:block text-[13.5px] font-medium text-gray-500 hover:text-green-600 transition-colors duration-150"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[13.5px] font-medium px-4 py-2 rounded-lg transition-colors duration-150 shadow-sm shadow-green-200"
            >
              Bắt đầu
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
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