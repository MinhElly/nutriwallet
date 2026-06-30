import { userInfo } from "./dashboardData";
import { budgetData, budgetResponse } from "./mockBudgetDta";
import { mealHistoryData, mealHistoryResponse } from "./mockMealHistoryData";

export const expenseCategoryLabelMap = {
  GROCERIES: "Tạp hóa",
  DINING_OUT: "Ăn ngoài",
  HEALTH: "Sức khỏe",
  TRANSPORTATION: "Di chuyển",
};

const expenseCreatedTimes = [
  "18:20:00",
  "12:55:00",
  "09:10:00",
  "08:40:00",
  "19:05:00",
];

export const profileResponse = {
  success: true,
  message: "Get profile successfully",
  data: {
    user: {
      id: 1,
      full_name: userInfo.name,
      email: userInfo.email,
      avatar_url: userInfo.avatar,
      role: "USER",
      status: "ACTIVE",
      provider: "LOCAL",
      created_at: "2024-02-10T10:20:00",
      updated_at: "2026-06-28T08:15:00",
      deleted_at: null,
    },
    email_verification: {
      token: "VER-8A2F-2024-EMAIL",
      expires_at: "2024-02-11T10:20:00",
      verified_at: "2024-02-10T10:22:00",
    },
    chatbot_profile: {
      id: 1,
      psid: "psid_1058829384",
      platform: userInfo.messengerPlatform,
      linked_at: "2024-02-10T10:25:00",
      guest_session_code: "GUEST-NW-2026",
    },
  },
};

export const settingsResponse = {
  success: true,
  message: "Get settings successfully",
  data: {
    sections: [
      {
        id: "account",
        title: "Tài khoản",
        description: "Tùy chỉnh thông tin tài khoản và cách đăng nhập.",
        items: [
          {
            setting_key: "display_name",
            label: "Tên hiển thị",
            description: "Tên sẽ xuất hiện trên hồ sơ và bảng điều khiển.",
            input_type: "text",
            value: userInfo.name,
          },
          {
            setting_key: "language",
            label: "Ngôn ngữ mặc định",
            description: "Ngôn ngữ dùng cho giao diện và báo cáo.",
            input_type: "select",
            value: "vi",
            options: [
              { label: "Tiếng Việt", value: "vi" },
              { label: "English", value: "en" },
            ],
          },
        ],
      },
      {
        id: "notifications",
        title: "Thông báo",
        description: "Quản lý cảnh báo về AI, ngân sách và tài khoản.",
        items: [
          {
            setting_key: "email_analysis_ready",
            label: "Email khi AI phân tích xong",
            description: "Gửi email khi một bữa ăn được AI xử lý hoàn tất.",
            input_type: "toggle",
            value: true,
          },
          {
            setting_key: "budget_warning_push",
            label: "Nhắc khi gần vượt ngân sách",
            description: "Thông báo khi mức chi tiêu chạm ngưỡng cảnh báo.",
            input_type: "toggle",
            value: true,
          },
        ],
      },
      {
        id: "ai",
        title: "Phân tích AI",
        description: "Các thiết lập liên quan đến mô hình phân tích bữa ăn.",
        items: [
          {
            setting_key: "default_model",
            label: "Mô hình mặc định",
            description: "Mô hình sẽ được dùng cho các lượt phân tích tiếp theo.",
            input_type: "select",
            value: "gpt-4o",
            options: [
              { label: "GPT-4o", value: "gpt-4o" },
              { label: "GPT-4.1 mini", value: "gpt-4.1-mini" },
            ],
          },
          {
            setting_key: "auto_create_expense",
            label: "Tự tạo khoản chi từ bữa ăn",
            description: "Sinh khoản chi tương ứng khi người dùng xác nhận bữa ăn.",
            input_type: "toggle",
            value: false,
          },
        ],
      },
      {
        id: "budget",
        title: "Ngân sách",
        description: "Thiết lập mặc định cho kỳ ngân sách đang hoạt động.",
        items: [
          {
            setting_key: "warning_threshold_percent",
            label: "Ngưỡng cảnh báo",
            description: "Phần trăm chi tiêu để bắt đầu hiển thị cảnh báo.",
            input_type: "number",
            value: budgetData.budget.warningThresholdPercent,
            suffix: "%",
          },
          {
            setting_key: "currency",
            label: "Tiền tệ mặc định",
            description: "Áp dụng cho các khoản chi mới được tạo.",
            input_type: "text",
            value: budgetData.budget.currency,
          },
        ],
      },
    ],
    system_settings: [
      {
        setting_key: "analysis.default_model",
        setting_value: "gpt-4o",
        description: "Mô hình AI mặc định cho phân tích bữa ăn",
      },
      {
        setting_key: "budget.warning_threshold_percent",
        setting_value: String(budgetData.budget.warningThresholdPercent),
        description: "Ngưỡng cảnh báo ngân sách toàn hệ thống",
      },
      {
        setting_key: "messenger.auto_link_guest_session",
        setting_value: "true",
        description: "Tự liên kết guest session với tài khoản Messenger",
      },
    ],
  },
};

function unwrapProfilePayload(response) {
  if (response?.data?.user) {
    return response.data;
  }

  if (response?.user) {
    return response;
  }

  return {
    user: null,
    email_verification: null,
    chatbot_profile: null,
  };
}

function unwrapSettingsPayload(response) {
  if (response?.data?.sections) {
    return response.data;
  }

  if (response?.sections) {
    return response;
  }

  return {
    sections: [],
    system_settings: [],
  };
}

function mapExpenseRecord(expense, linkedMeal, index) {
  return {
    id: expense.id,
    userId: 1,
    mealRecordId: linkedMeal?.id ?? null,
    mealName: linkedMeal?.meal_name ?? null,
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category,
    expenseDate: expense.expense_date,
    description: expense.description,
    note: expense.note,
    createdAt: `${expense.expense_date}T${expenseCreatedTimes[index] ?? "10:00:00"}`,
    updatedAt: `${expense.expense_date}T${expenseCreatedTimes[index] ?? "10:00:00"}`,
  };
}

function mapProfileUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    role: user.role,
    status: user.status,
    provider: user.provider,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    deletedAt: user.deleted_at,
  };
}

function mapSettingsSection(section) {
  return {
    id: section.id,
    title: section.title,
    description: section.description,
    items: Array.isArray(section.items)
      ? section.items.map((item) => ({
          key: item.setting_key,
          label: item.label,
          description: item.description,
          type: item.input_type,
          value: item.value,
          options: item.options ?? [],
          suffix: item.suffix,
        }))
      : [],
  };
}

export function mapExpenseHistoryData(
  budgetApiResponse = budgetResponse,
  mealHistoryApiResponse = mealHistoryResponse,
) {
  const expenses = budgetApiResponse?.data?.expenses ?? [];
  const meals = mealHistoryApiResponse?.data ?? [];

  return expenses.map((expense, index) =>
    mapExpenseRecord(expense, meals[index] ?? null, index),
  );
}

export function mapProfileData(
  profileApiResponse = profileResponse,
  relatedData = {
    currentBudget: budgetData.budget.amount,
    mealCount: mealHistoryData.length,
    expenseCount: mapExpenseHistoryData().length,
  },
) {
  const payload = unwrapProfilePayload(profileApiResponse);

  return {
    user: mapProfileUser(payload.user),
    emailVerification: payload.email_verification
      ? {
          token: payload.email_verification.token,
          expiresAt: payload.email_verification.expires_at,
          verifiedAt: payload.email_verification.verified_at,
        }
      : null,
    chatbotProfile: payload.chatbot_profile
      ? {
          id: payload.chatbot_profile.id,
          psid: payload.chatbot_profile.psid,
          platform: payload.chatbot_profile.platform,
          linkedAt: payload.chatbot_profile.linked_at,
          guestSessionCode: payload.chatbot_profile.guest_session_code,
        }
      : null,
    stats: {
      mealCount: relatedData.mealCount,
      expenseCount: relatedData.expenseCount,
      currentBudget: relatedData.currentBudget,
      memberSince: "10/02/2024",
    },
  };
}

export function mapSettingsData(response = settingsResponse) {
  const payload = unwrapSettingsPayload(response);

  return {
    sections: Array.isArray(payload.sections)
      ? payload.sections.map(mapSettingsSection)
      : [],
    systemSettings: Array.isArray(payload.system_settings)
      ? payload.system_settings.map((item) => ({
          settingKey: item.setting_key,
          settingValue: item.setting_value,
          description: item.description,
        }))
      : [],
  };
}

export const expenseHistoryData = mapExpenseHistoryData();
export const profileData = mapProfileData();
export const settingsData = mapSettingsData();

function updateSectionItemValue(sectionList, itemKey, nextValue) {
  sectionList.forEach((section) => {
    section.items?.forEach((item) => {
      const currentKey = item.key ?? item.setting_key;

      if (currentKey === itemKey) {
        if ("key" in item) {
          item.value = nextValue;
        } else {
          item.value = nextValue;
        }
      }
    });
  });
}

export function applyProfileDataUpdates(updates) {
  if (updates.fullName !== undefined) {
    profileData.user.fullName = updates.fullName;
    profileResponse.data.user.full_name = updates.fullName;
    userInfo.name = updates.fullName;
    updateSectionItemValue(settingsData.sections, "display_name", updates.fullName);
    updateSectionItemValue(
      settingsResponse.data.sections,
      "display_name",
      updates.fullName,
    );
  }

  if (updates.email !== undefined) {
    profileData.user.email = updates.email;
    profileResponse.data.user.email = updates.email;
    userInfo.email = updates.email;
  }

  if (updates.avatarUrl !== undefined) {
    profileData.user.avatarUrl = updates.avatarUrl;
    profileResponse.data.user.avatar_url = updates.avatarUrl;
    userInfo.avatar = updates.avatarUrl;
  }
}

export function applySettingsState(settingsState) {
  Object.entries(settingsState).forEach(([key, value]) => {
    updateSectionItemValue(settingsData.sections, key, value);
    updateSectionItemValue(settingsResponse.data.sections, key, value);
  });

  const autoLinkSetting = settingsData.systemSettings.find(
    (item) => item.settingKey === "messenger.auto_link_guest_session",
  );
  if (autoLinkSetting) {
    autoLinkSetting.settingValue = String(
      settingsState.messenger_auto_link_guest_session,
    );
  }

  const autoLinkResponseSetting = settingsResponse.data.system_settings.find(
    (item) => item.setting_key === "messenger.auto_link_guest_session",
  );
  if (autoLinkResponseSetting) {
    autoLinkResponseSetting.setting_value = String(
      settingsState.messenger_auto_link_guest_session,
    );
  }

  if (settingsState.display_name !== undefined) {
    applyProfileDataUpdates({
      fullName: settingsState.display_name,
    });
  }

  if (settingsState.currency !== undefined) {
    budgetData.budget.currency = settingsState.currency;
    budgetResponse.data.budget.currency = settingsState.currency;
    profileData.stats.currentBudget = budgetData.budget.amount;
  }
}
