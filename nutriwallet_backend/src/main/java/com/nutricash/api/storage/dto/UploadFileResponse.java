package com.nutricash.api.storage.dto;

public record UploadFileResponse(
        String publicId,
        String url,
        String format,
        long bytes,
        int width,
        int height
) {
}
