import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  HeartPulse,
  Wallet,
  PersonStanding,
  Sprout,
} from "lucide-react";

import LoginFloatingCard from "./LoginFloatingCard";
import { useAuth } from "../../hooks/useAuth";

function LoginForm() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithFacebook } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      setError("");
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Lỗi đăng nhập Google.");
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setError("Đăng nhập bằng Google thất bại.");
    },
  });

  const loadFacebookSDK = () => {
    return new Promise((resolve) => {
      if (window.FB) {
        resolve(window.FB);
        return;
      }
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'mock-fb-app-id',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        resolve(window.FB);
      };
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    });
  };

  const handleFacebookLogin = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const FB = await loadFacebookSDK();
      FB.login((response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          loginWithFacebook(accessToken)
            .then(() => {
              navigate("/dashboard", { replace: true });
            })
            .catch((err) => {
              setError(err?.response?.data?.message || err?.message || "Lỗi đăng nhập Facebook.");
              setIsSubmitting(false);
            });
        } else {
          setError("Người dùng đã hủy đăng nhập hoặc không cấp quyền.");
          setIsSubmitting(false);
        }
      }, { scope: 'email,public_profile' });
    } catch (err) {
      console.error("Failed to initialize Facebook SDK login:", err);
      setError("Không thể khởi tạo SDK Facebook.");
      setIsSubmitting(false);
    }
  };
  return (
    <main
      className="relative h-screen overflow-hidden bg-[#F0FDF4] text-[#0F172A]"
      style={{ fontFamily: "Inter, Manrope, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .page-bg {
          background:
            radial-gradient(circle at 50% 18%, rgba(34,197,94,.18), transparent 28%),
            radial-gradient(circle at 20% 75%, rgba(187,247,208,.75), transparent 32%),
            radial-gradient(circle at 80% 70%, rgba(187,247,208,.65), transparent 30%),
            linear-gradient(180deg, #F8FFFB 0%, #ECFDF5 52%, #F8FAFC 100%);
        }

        .cloud {
          position: absolute;
          width: 420px;
          height: 120px;
          background: rgba(255,255,255,.72);
          filter: blur(28px);
          border-radius: 999px;
        }

        .orbit {
          position: absolute;
          width: 760px;
          height: 760px;
          border: 1px solid rgba(34,197,94,.18);
          border-radius: 999px;
        }

        .orbit-2 {
          width: 580px;
          height: 580px;
          border-color: rgba(34,197,94,.12);
        }

        .login-card {
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
        }

        .btn-gradient {
          background: linear-gradient(135deg, #16A34A 0%, #22C55E 100%);
          transition: .25s ease;
        }

        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 35px -18px rgba(34,197,94,.75);
        }
      `}</style>

      <div className="page-bg absolute inset-0" />

      <div className="cloud left-[-80px] bottom-[120px]" />
      <div className="cloud right-[-120px] bottom-[150px]" />
      <div className="cloud left-[35%] bottom-[-40px] w-[620px]" />

      <div className="orbit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="orbit orbit-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <header className="relative z-10 flex items-center gap-3 px-8 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#16A34A] text-xs font-extrabold text-white shadow-lg">
          NW
        </div>
        <span className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "Psionic" }}>NutriWallet AI</span>
      </header>

      <section className="relative z-10 flex h-[calc(100vh-80px)] items-center justify-center px-4 pb-8">
        <LoginFloatingCard
          icon={<HeartPulse size={26} />}
          title="AI Score"
          value="94.2%"
          className="left-[14%] top-[35%] w-[160px]"
        />

        <LoginFloatingCard
          icon={<Wallet size={26} />}
          title="Budget"
          value="200.000đ"
          desc="/ ngày"
          className="left-[13%] bottom-[25%] w-[170px]"
        />

        <LoginFloatingCard
          icon={<HeartPulse size={26} />}
          title="Health Score"
          value="94.2%"
          className="right-[14%] top-[31%] w-[170px]"
        />

        <LoginFloatingCard
          icon={<PersonStanding size={26} />}
          title="Calories"
          value="1.500 kcal"
          desc="Hôm nay"
          className="right-[12%] bottom-[24%] w-[180px]"
        />

        <div className="absolute bottom-[7%] left-1/2 hidden h-[170px] w-[480px] -translate-x-1/2 rounded-[50%] bg-[#BBF7D0]/45 blur-2xl lg:block" />

        <div className="login-card relative w-full max-w-[420px] rounded-[30px] border border-white/80 px-9 py-8 shadow-[0_30px_100px_rgba(15,23,42,0.14)]">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#16A34A] shadow-[0_16px_35px_rgba(15,23,42,0.12)]">
            <Sprout size={30} strokeWidth={2.4} />
          </div>

          <div className="text-center">
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#0F172A]">
              Chào mừng <span className="text-[#16A34A]">trở lại!</span>
            </h1>

            <p className="mx-auto mt-3 max-w-[310px] text-[14px] leading-6 text-[#64748B]">
              Đăng nhập để tiếp tục hành trình chăm sóc sức khỏe và quản lý tài
              chính thông minh.
            </p>
          </div>

          {error && (
            <p className="mt-5 text-[13px] text-red-500 text-center">{error}</p>
          )}

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => triggerGoogleLogin()}
              disabled={isSubmitting}
              className="flex h-[50px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white/80 text-[14px] font-semibold text-[#0F172A] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#22C55E] hover:bg-white hover:shadow-lg disabled:opacity-50"
            >
              <GoogleIcon />
              Tiếp tục với Google
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={isSubmitting}
              className="flex h-[50px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#1877F2] text-[14px] font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#166FE5] hover:shadow-lg disabled:opacity-50"
            >
              <FacebookIcon />
              Tiếp tục với Facebook
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default LoginForm;
