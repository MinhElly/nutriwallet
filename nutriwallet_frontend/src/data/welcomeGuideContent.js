export const welcomeGuideContent = {
  steps: [
    {
      id: "welcome",
      eyebrow: "NutriWallet AI",
      title: "👋 Chào mừng đến với NutriWallet AI",
      description:
        "NutriWallet AI giúp bạn theo dõi dinh dưỡng, chi tiêu ăn uống và thói quen ăn lành mạnh chỉ bằng cách trò chuyện với AI.",
      secondaryActionLabel: "Để sau",
      primaryActionLabel: "Tiếp tục",
      features: [
        {
          id: "nutrition",
          icon: "🥗",
          title: "Theo Dõi Dinh Dưỡng Thông Minh",
          description: "Tự động ước tính calories và dinh dưỡng từ tin nhắn của bạn.",
        },
        {
          id: "expense",
          icon: "💰",
          title: "Theo Dõi Chi Tiêu",
          description: "Ghi nhận chi tiêu ăn uống tự nhiên mà không cần nhập tay.",
        },
        {
          id: "assistant",
          icon: "🤖",
          title: "Trợ Lý AI",
          description: "Trò chuyện tự nhiên và nhận gợi ý dinh dưỡng ngay lập tức.",
        },
      ],
    },
    {
      id: "messenger-preview",
      eyebrow: "Cách hoạt động",
      title: "Trò chuyện với AI qua Messenger",
      description:
        "Để sử dụng NutriWallet AI, bạn chỉ cần gửi tin nhắn qua Messenger.",
      secondaryActionLabel: "Quay lại",
      primaryActionLabel: "Tiếp tục",
      conversations: [
        {
          id: "nutrition-example",
          userMessage: "🍜 Hôm nay tôi ăn Phở vào bữa trưa.",
          aiLines: [
            "Calories ước tính:",
            "620 kcal",
            "Protein:",
            "32 g",
            "Tinh bột:",
            "70 g",
            "Chất béo:",
            "18 g",
            "Chi phí đã ghi nhận:",
            "55.000 VND",
          ],
        },
        {
          id: "expense-example",
          userMessage: "🥤 Tôi mua trà sữa hết 45k.",
          aiLines: [
            "Đã ghi nhận chi tiêu thành công.",
            "Ngân sách còn lại hôm nay:",
            "155.000 VND.",
          ],
        },
      ],
    },
    {
      id: "connect-messenger",
      eyebrow: "Bước tiếp theo",
      title: "Kết nối Messenger của bạn",
      description:
        "Để bắt đầu dùng chatbot, bạn cần nhắn tin cho chatbot để lấy mã xác thực, sau đó quay lại NutriWallet nhập mã và xác nhận liên kết.",
      secondaryActionLabel: "Quay lại",
      primaryActionLabel: "Hoàn tất",
      highlightedActionLabel: "Đi đến Cài đặt",
      note:
        "Sau khi tài khoản Messenger được kết nối, hướng dẫn này sẽ không xuất hiện lại nữa.",
      guideSteps: [
        "Mở Cài đặt.",
        "Nhấn Nhắn tin cho Chatbot để lấy mã xác thực.",
        "Quay lại NutriWallet và nhập mã xác thực vào ô mã liên kết.",
        "Nhấn Xác nhận liên kết để hoàn tất kết nối.",
        "Bắt đầu trò chuyện với NutriWallet AI trên Messenger.",
      ],
    },
  ],
};
