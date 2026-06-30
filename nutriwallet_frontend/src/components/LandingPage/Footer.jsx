

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-gray-400 text-xs py-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8 text-left">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">NW</div>
              <span className="font-bold text-xs text-white tracking-tight" style={{ fontFamily: "Psionic" }}>NutriWallet AI</span>
            </div>
            <p className="max-w-xs leading-relaxed">
              AI-powered nutrition and expense tracking for a healthier, wealthier life. Made with ❤️ in Vietnam.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[10px]">Product</h5>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Changelog</a></li>
              <li><a href="#" className="hover:text-white transition">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[10px]">Company</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[10px]">Legal</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;