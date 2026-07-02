export default function RecentEvents({ events }) {
  const defaultEvents = [
    { text: "User mới đăng ký: hoang.long@gmail.com", time: "2 phút trước", color: "green" },
    { text: "AI model v2.4.1 deployed thành công", time: "15 phút trước", color: "blue" },
    { text: "Memory usage đạt 78% trên server-02", time: "32 phút trước", color: "yellow" },
    { text: "Post bị report và đã ẩn tự động (spam detected)", time: "1 giờ trước", color: "red" },
    { text: "thu.hang@gmail.com bị suspended theo yêu cầu admin", time: "2 giờ trước", color: "purple" }
  ];

  const list = events || defaultEvents;

  const colorMap = {
    green: { dot: "bg-emerald-400 shadow-emerald-500/50", text: "text-emerald-400" },
    blue: { dot: "bg-blue-400 shadow-blue-500/50", text: "text-blue-400" },
    yellow: { dot: "bg-amber-400 shadow-amber-500/50", text: "text-amber-400" },
    red: { dot: "bg-rose-400 shadow-rose-500/50", text: "text-rose-400" },
    purple: { dot: "bg-purple-400 shadow-purple-500/50", text: "text-purple-400" },
  };

  return (
    <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-white">
          Recent System Events
        </h3>
        <button type="button" className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-all cursor-pointer">
          Xem tất cả &rarr;
        </button>
      </div>

      <div className="space-y-4">
        {list.map((event, index) => {
          const classes = colorMap[event.color] || colorMap.blue;
          return (
            <div key={index} className="flex items-center justify-between gap-4 py-2 border-b border-[#25214d]/30 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`h-2 w-2 rounded-full shrink-0 shadow-sm ${classes.dot}`} />
                <span className="text-sm text-slate-300 truncate">
                  {event.text}
                </span>
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${classes.text}`}>
                {event.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
