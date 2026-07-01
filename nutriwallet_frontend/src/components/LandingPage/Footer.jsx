import { Leaf } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  const productLinks = [
    { label: "Tính năng", href: "#features" },
    { label: "Nhật ký cập nhật", href: "#" },
    { label: "Lộ trình phát triển", href: "#" },
  ];

  const companyLinks = [
    { label: "Giới thiệu", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Tuyển dụng", href: "#" },
    { label: "Liên hệ", href: "#" },
  ];

  const legalLinks = [
    { label: "Bảo mật", href: "#" },
    { label: "Điều khoản", href: "#" },
    { label: "Bảo mật dữ liệu", href: "#" },
  ];

  return (
    <footer className="border-t border-white/5" style={{ background: "linear-gradient(160deg, #162032 0%, #1a2744 100%)" }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                <Leaf size={14} strokeWidth={2} className="text-white" />
              </div>
              <span
                className="font-bold text-sm text-white tracking-tight"
                style={{ fontFamily: "Psionic" }}
              >
                NutriWallet AI
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-[220px]">
              Theo dõi dinh dưỡng & chi tiêu bằng AI. Made with ❤️ in Vietnam.
            </p>
          </div>

          {/* Product */}
          <div>
            <h5 className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-4">Sản phẩm</h5>
            <ul className="space-y-3">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-white/50 hover:text-white transition-colors duration-150">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-4">Công ty</h5>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-white/50 hover:text-white transition-colors duration-150">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-4">Pháp lý</h5>
            <ul className="space-y-3">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-white/50 hover:text-white transition-colors duration-150">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {year} NutriWallet AI. Bảo lưu mọi quyền.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/30">Hệ thống hoạt động bình thường</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;