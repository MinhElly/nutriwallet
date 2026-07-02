import { useState } from "react";
import {
  Flag,
  Check,
  Trash2,
  AlertTriangle,
  Ban,
  FileText,
  Heart,
  MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";

export default function ContentModerationTab() {
  // Counters states
  const [flagPending, setFlagPending] = useState(4);
  const [approvedToday, setApprovedToday] = useState(127);
  const [deletedToday, setDeletedToday] = useState(8);
  const [totalReports, setTotalReports] = useState(312);

  // Moderation tab state: 'reported', 'all', 'deleted'
  const [subTab, setSubTab] = useState("reported");

  // Reported Posts State
  const [reportedPosts, setReportedPosts] = useState([
    {
      id: 1,
      author: "Thu Hằng",
      avatarText: "TH",
      avatarColor: "from-purple-500 to-indigo-500",
      status: "Flagged",
      content: "Cơm tấm Sài Gòn không bao giờ nhàm 🥩 Hôm nay cheat meal một chút nhé!",
      calories: "650 kcal",
      likes: "31 likes",
      comments: "6 comments",
      warningReason: "Bị báo cáo: Nội dung không phù hợp - 3 lần báo cáo",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      author: "Hoàng Long",
      avatarText: "HL",
      avatarColor: "from-blue-500 to-cyan-500",
      status: "Flagged",
      content: "Bí quyết tăng cơ siêu nhanh bằng cách lạm dụng thực phẩm chức năng tự chế! 💪",
      calories: "820 kcal",
      likes: "15 likes",
      comments: "2 comments",
      warningReason: "Bị báo cáo: Thông tin y tế sai lệch - 2 lần báo cáo",
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=60"
    }
  ]);

  // Deleted Posts State
  const [deletedPosts, setDeletedPosts] = useState([
    {
      id: 99,
      author: "Minh Tuấn",
      avatarText: "MT",
      avatarColor: "from-amber-500 to-orange-500",
      content: "Quảng cáo thuốc giảm cân không rõ nguồn gốc xuất xứ tại đây...",
      calories: "0 kcal",
      likes: "2 likes",
      comments: "15 comments",
      deletedTime: "10 phút trước"
    }
  ]);

  // All Posts State (for display under "Tất cả bài")
  const [allPosts, setAllPosts] = useState([
    {
      id: 201,
      author: "Thu Hằng",
      avatarText: "TH",
      avatarColor: "from-purple-500 to-indigo-500",
      content: "Cơm tấm Sài Gòn không bao giờ nhàm 🥩 Hôm nay cheat meal một chút nhé!",
      calories: "650 kcal",
      likes: "31 likes",
      comments: "6 comments"
    },
    {
      id: 202,
      author: "Ngọc Vy",
      avatarText: "NV",
      avatarColor: "from-rose-500 to-pink-500",
      content: "Salad ức gà healthy cho bữa trưa giảm cân nhẹ bụng 🥗 Chỉ mất 10 phút chuẩn bị!",
      calories: "320 kcal",
      likes: "89 likes",
      comments: "12 comments"
    }
  ]);

  // Action Handlers
  const handleApprove = (postId) => {
    const post = reportedPosts.find((p) => p.id === postId);
    if (!post) return;

    setReportedPosts((prev) => prev.filter((p) => p.id !== postId));
    setFlagPending((c) => Math.max(0, c - 1));
    setApprovedToday((c) => c + 1);
    
    // Add to all posts if not already present
    if (!allPosts.some((p) => p.id === postId)) {
      setAllPosts((prev) => [post, ...prev]);
    }

    toast.success(`Đã duyệt bài viết của ${post.author} (Giữ lại bài viết)`);
  };

  const handleReject = (postId) => {
    const post = reportedPosts.find((p) => p.id === postId);
    if (!post) return;

    setReportedPosts((prev) => prev.filter((p) => p.id !== postId));
    setFlagPending((c) => Math.max(0, c - 1));
    setDeletedToday((c) => c + 1);
    
    // Add to deleted posts
    setDeletedPosts((prev) => [
      {
        ...post,
        deletedTime: "Vừa xong"
      },
      ...prev
    ]);

    toast.error(`Đã ẩn và xóa bài viết vi phạm của ${post.author}`);
  };

  const handleBanUser = (postId, authorName) => {
    const post = reportedPosts.find((p) => p.id === postId);
    
    setReportedPosts((prev) => prev.filter((p) => p.id !== postId));
    setFlagPending((c) => Math.max(0, c - 1));
    setDeletedToday((c) => c + 1);

    if (post) {
      setDeletedPosts((prev) => [
        {
          ...post,
          deletedTime: "Vừa xong"
        },
        ...prev
      ]);
    }

    toast.success(`Đã khóa tài khoản người dùng ${authorName} thành công`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title & Status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Content Moderation
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Review và kiểm duyệt nội dung cộng đồng
          </p>
        </div>

        {flagPending > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/30 border border-rose-900/30 px-3 py-1.5 text-xs text-rose-400 font-semibold w-fit">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
            <span>{flagPending} chờ xử lý</span>
          </div>
        )}
      </div>

      {/* Moderation Colored Boxes Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Box 1: Red */}
        <div className="rounded-[24px] border border-[#4a1f2b] bg-[#22131b] p-6 shadow-md text-center flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tight text-rose-400">
            {flagPending}
          </span>
          <span className="mt-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            Flag đang chờ
          </span>
        </div>

        {/* Box 2: Green */}
        <div className="rounded-[24px] border border-[#1a4034] bg-[#11231e] p-6 shadow-md text-center flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tight text-emerald-400">
            {approvedToday}
          </span>
          <span className="mt-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Đã duyệt hôm nay
          </span>
        </div>

        {/* Box 3: Yellow */}
        <div className="rounded-[24px] border border-[#42391e] bg-[#231e13] p-6 shadow-md text-center flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tight text-amber-500">
            {deletedToday}
          </span>
          <span className="mt-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
            Đã xóa hôm nay
          </span>
        </div>

        {/* Box 4: Purple */}
        <div className="rounded-[24px] border border-[#30214a] bg-[#181227] p-6 shadow-md text-center flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tight text-purple-400">
            {totalReports}
          </span>
          <span className="mt-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            Tổng báo cáo tháng
          </span>
        </div>
      </div>

      {/* Tab Filter segment selector */}
      <div className="flex items-center gap-1 rounded-2xl border border-[#25214d] bg-[#171530] p-1 w-fit">
        <button
          type="button"
          onClick={() => setSubTab("reported")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            subTab === "reported"
              ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Flag size={14} />
          <span>Bị report</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("all")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            subTab === "all"
              ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText size={14} />
          <span>Tất cả bài</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("deleted")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            subTab === "deleted"
              ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Trash2 size={14} />
          <span>Đã xóa</span>
        </button>
      </div>

      {/* Lists display depending on Active subTab */}
      <div className="space-y-4">
        
        {/* SUBTAB: REPORTED POSTS */}
        {subTab === "reported" && (
          reportedPosts.length === 0 ? (
            <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-12 text-center text-slate-400">
              <Check className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <span className="font-bold block text-white text-base">Không có nội dung chờ duyệt</span>
              <p className="text-xs text-slate-400 mt-1">Hộp thư kiểm duyệt sạch sẽ! Cảm ơn bạn.</p>
            </div>
          ) : (
            reportedPosts.map((post) => (
              <div
                key={post.id}
                className="overflow-hidden rounded-[24px] border border-[#25214d] bg-[#171530] shadow-md flex flex-col"
              >
                {/* Main Post Section */}
                <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex gap-4 items-start min-w-0 flex-1">
                    {/* Food Image */}
                    <img
                      src={post.imageUrl}
                      alt={post.author}
                      className="h-20 w-20 rounded-2xl object-cover shrink-0 ring-2 ring-purple-600/20"
                    />

                    {/* Author + Text */}
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${post.avatarColor} text-[10px] font-bold text-white`}>
                          {post.avatarText}
                        </div>
                        <h4 className="font-bold text-white text-sm">
                          {post.author}
                        </h4>
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/40 border border-rose-900/30 px-2 py-0.5 text-[9px] font-black text-rose-400 uppercase tracking-wide">
                          {post.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-300 font-medium">
                        {post.content}
                      </p>

                      {/* Food & Stats Metadata Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-xl bg-[#221f42]/40 border border-[#2d2859]/30 px-3 py-1 text-xs font-semibold text-slate-300">
                          {post.calories}
                        </span>
                        <span className="rounded-xl bg-[#221f42]/40 border border-[#2d2859]/30 px-3 py-1 text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <Heart size={10} className="fill-slate-400 text-slate-400" />
                          {post.likes}
                        </span>
                        <span className="rounded-xl bg-[#221f42]/40 border border-[#2d2859]/30 px-3 py-1 text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <MessageSquare size={10} className="text-slate-400" />
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex flex-row md:flex-col items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(post.id)}
                      className="inline-flex w-24 items-center justify-center gap-1 rounded-xl bg-emerald-950/30 border border-emerald-900/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(post.id)}
                      className="inline-flex w-24 items-center justify-center gap-1 rounded-xl bg-rose-950/30 border border-rose-900/30 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                    >
                      Xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBanUser(post.id, post.author)}
                      className="inline-flex w-24 items-center justify-center gap-1 rounded-xl border border-[#3a3568] px-3 py-2 text-xs font-bold text-slate-300 hover:bg-rose-600 hover:border-rose-600 hover:text-white transition-all cursor-pointer"
                    >
                      Ban user
                    </button>
                  </div>
                </div>

                {/* Flag Alert Warning bar */}
                <div className="bg-[#29141c] border-t border-[#4a1a27]/55 py-2.5 px-6 flex items-center gap-2 text-xs font-semibold text-rose-400">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{post.warningReason}</span>
                </div>
              </div>
            ))
          )
        )}

        {/* SUBTAB: ALL POSTS */}
        {subTab === "all" && (
          allPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md flex items-start gap-4 min-w-0"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr ${post.avatarColor || 'from-purple-500 to-indigo-500'} text-xs font-bold text-white shrink-0`}>
                {post.avatarText}
              </div>
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{post.author}</h4>
                  <span className="text-[10px] text-slate-500">Đã đăng</span>
                </div>
                <p className="text-sm text-slate-300 font-medium">{post.content}</p>
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                  <span className="rounded-xl bg-[#221f42]/40 border border-[#2d2859]/30 px-3 py-1">{post.calories}</span>
                  <span className="rounded-xl bg-[#221f42]/40 border border-[#2d2859]/30 px-3 py-1">{post.likes}</span>
                  <span className="rounded-xl bg-[#221f42]/40 border border-[#2d2859]/30 px-3 py-1">{post.comments}</span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* SUBTAB: DELETED POSTS */}
        {subTab === "deleted" && (
          deletedPosts.length === 0 ? (
            <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-12 text-center text-slate-500">
              <span>Hộp thư trống</span>
            </div>
          ) : (
            deletedPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-[24px] border border-[#2d1b24] bg-[#1a1118] p-6 shadow-md opacity-75 flex items-start justify-between gap-4"
              >
                <div className="flex gap-4 items-start min-w-0">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr ${post.avatarColor || 'from-rose-500 to-red-500'} text-xs font-bold text-white shrink-0`}>
                    {post.avatarText}
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-300 text-sm">{post.author}</h4>
                      <span className="rounded-full bg-rose-950/40 border border-rose-900/30 px-2 py-0.5 text-[9px] font-extrabold text-rose-400 uppercase tracking-wide">
                        Đã xóa
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-through italic font-medium">{post.content}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  {post.deletedTime}
                </span>
              </div>
            ))
          )
        )}

      </div>
    </div>
  );
}
