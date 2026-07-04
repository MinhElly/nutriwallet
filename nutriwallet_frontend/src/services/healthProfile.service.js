import api, { createApiError, unwrapApiData } from "./api";

export function normalizeHealthProfile(value = {}) {
  return {
    id: value.id ?? null,
    consentGiven: Boolean(value.consentGiven),
    conditions: Array.isArray(value.conditions) ? value.conditions : [],
    allergies: Array.isArray(value.allergies) ? value.allergies : [],
    foodRestrictions: Array.isArray(value.foodRestrictions) ? value.foodRestrictions : [],
    firstCompletedAt: value.firstCompletedAt ?? null,
    lastReviewedAt: value.lastReviewedAt ?? null,
    nextQuarterlyReviewAt: value.nextQuarterlyReviewAt ?? null,
    nextAnnualReviewAt: value.nextAnnualReviewAt ?? null,
    profileVersion: Number(value.profileVersion ?? 0),
    classification: value.classification ?? null,
  };
}

export async function getHealthProfile() {
  try {
    return normalizeHealthProfile(unwrapApiData(await api.get("/api/health-profile")));
  } catch (error) {
    throw createApiError(error, "Không thể tải hồ sơ sức khỏe.");
  }
}

export async function updateHealthProfile(profile) {
  try {
    const response = await api.put("/api/health-profile", {
      consentGiven: Boolean(profile.consentGiven),
      conditions: profile.conditions ?? [],
      allergies: profile.allergies ?? [],
      foodRestrictions: profile.foodRestrictions ?? [],
      expectedProfileVersion: profile.profileVersion,
    });
    return normalizeHealthProfile(unwrapApiData(response));
  } catch (error) {
    throw createApiError(error, "Không thể cập nhật hồ sơ sức khỏe.");
  }
}

export async function startHealthAssessment(channel, type) {
  return unwrapApiData(await api.post("/api/health-profile/assessments", { channel, type }));
}

export async function updateHealthAssessment(id, currentStep, answers, expectedVersion) {
  return unwrapApiData(await api.patch(`/api/health-profile/assessments/${id}`, {
    currentStep, answers, expectedVersion,
  }));
}

export async function completeHealthAssessment(id, profile, expectedSessionVersion) {
  const response = await api.post(`/api/health-profile/assessments/${id}/complete`, {
    profile: {
      consentGiven: Boolean(profile.consentGiven),
      conditions: profile.conditions ?? [],
      allergies: profile.allergies ?? [],
      foodRestrictions: profile.foodRestrictions ?? [],
      expectedProfileVersion: profile.profileVersion,
    },
    expectedSessionVersion,
  });
  return normalizeHealthProfile(unwrapApiData(response));
}
