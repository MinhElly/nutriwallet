/**
 * Mapper và helper functions cho profile, settings, expense data.
 * Mock data đã được xóa — dữ liệu thực lấy từ backend.
 */

export const expenseCategoryLabelMap = {
  BREAKFAST: "Bữa sáng",
  LUNCH: "Bữa trưa",
  DINNER: "Bữa tối",
  SNACK: "Bữa phụ",
  DRINK: "Đồ uống",
  OTHER: "Khác",
};

// ─── Profile mappers ────────────────────────────────────────────────────────

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

export function mapExpenseHistoryData(expenses = [], meals = []) {
  return expenses.map((expense, index) => ({
    id: expense.id,
    userId: expense.userId ?? null,
    mealRecordId: expense.mealRecordId ?? null,
    mealName: expense.mealName ?? null,
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category,
    expenseDate: expense.expenseDate ?? expense.expense_date,
    description: expense.description ?? "",
    note: expense.note ?? "",
    createdAt: expense.createdAt ?? "",
    updatedAt: expense.updatedAt ?? "",
  }));
}

export function mapProfileData(profileApiResponse, relatedData = {}) {
  if (!profileApiResponse?.data?.user) {
    return {
      user: null,
      emailVerification: null,
      chatbotProfile: null,
      stats: {
        mealCount: relatedData.mealCount ?? 0,
        expenseCount: relatedData.expenseCount ?? 0,
        currentBudget: relatedData.currentBudget ?? 0,
        memberSince: "—",
      },
    };
  }

  const payload = profileApiResponse.data;

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
      mealCount: relatedData.mealCount ?? 0,
      expenseCount: relatedData.expenseCount ?? 0,
      currentBudget: relatedData.currentBudget ?? 0,
      memberSince: payload.user.created_at
        ? new Date(payload.user.created_at).toLocaleDateString("vi-VN", {
            month: "2-digit",
            year: "numeric",
          })
        : "—",
    },
  };
}

export function mapSettingsData(response) {
  const payload = response?.data?.sections
    ? response.data
    : response?.sections
      ? response
      : { sections: [], system_settings: [] };

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

// ─── Empty fallback exports ─────────────────────────────────────────────────

/** Empty fallback — hiển thị trạng thái trống khi API thất bại */
export const expenseHistoryData = [];

export const profileData = {
  user: null,
  emailVerification: null,
  chatbotProfile: null,
  stats: { mealCount: 0, expenseCount: 0, currentBudget: 0, memberSince: "—" },
};

export const settingsData = { sections: [], systemSettings: [] };

// ─── Mutable state helpers (dùng cho in-memory sync) ───────────────────────

function updateSectionItemValue(sectionList, itemKey, nextValue) {
  sectionList.forEach((section) => {
    section.items?.forEach((item) => {
      const currentKey = item.key ?? item.setting_key;
      if (currentKey === itemKey) {
        item.value = nextValue;
      }
    });
  });
}

export function applyProfileDataUpdates(updates) {
  if (updates.fullName !== undefined && profileData.user) {
    profileData.user.fullName = updates.fullName;
  }
  if (updates.email !== undefined && profileData.user) {
    profileData.user.email = updates.email;
  }
  if (updates.avatarUrl !== undefined && profileData.user) {
    profileData.user.avatarUrl = updates.avatarUrl;
  }
}

export function applySettingsState(settingsState) {
  Object.entries(settingsState).forEach(([key, value]) => {
    updateSectionItemValue(settingsData.sections, key, value);
  });

  if (settingsState.display_name !== undefined) {
    applyProfileDataUpdates({ fullName: settingsState.display_name });
  }
}
