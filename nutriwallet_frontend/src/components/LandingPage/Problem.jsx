
const Problem = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Bạn đang gặp vấn đề này?</h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-14">Hầu hết người trẻ đều gặp 3 vấn đề này mỗi tháng</p>
        
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-xl mb-6">👛</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cháy túi cuối tháng</h3>
            <p className="text-gray-500 leading-relaxed text-sm">Không kiểm soát được chi phí ăn uống. Trà sữa, ăn hàng vô tội vạ khiến ví tiền báo động.</p>
          </div>
          <div className="p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-xl mb-6">💛</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tăng cân không kiểm soát</h3>
            <p className="text-gray-500 leading-relaxed text-sm">Ăn không theo kế hoạch, calo nạp vào vượt mức mà không hề hay biết do lười tính toán thủ công.</p>
          </div>
          <div className="p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl mb-6">🕒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quên ghi chép thủ công</h3>
            <p className="text-gray-500 leading-relaxed text-sm">Các ứng dụng khác yêu cầu nhập tay quá phức tạp, dễ gây chán nản và bỏ cuộc chỉ sau vài ngày.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;