import api, { createApiError, extractApiMessage, unwrapApiData } from "./api";

export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    return unwrapApiData(
      await api.post("/api/storage/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  } catch (error) {
    throw createApiError(error, "Không thể tải ảnh lên.");
  }
}

export async function deleteImage(publicId) {
  try {
    await api.delete("/api/storage/images", {
      params: { publicId },
    });
  } catch (error) {
    throw createApiError(error, "Không thể xóa ảnh.");
  }
}

export async function uploadImageSafe(file) {
  try {
    return {
      data: await uploadImage(file),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: extractApiMessage(error, "Không thể tải ảnh lên."),
    };
  }
}
