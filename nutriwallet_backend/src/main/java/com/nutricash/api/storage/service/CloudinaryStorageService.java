package com.nutricash.api.storage.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.storage.dto.UploadFileResponse;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CloudinaryStorageService implements FileStorageService {

    private static final long MAX_IMAGE_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"
    );
    private static final String ROOT_FOLDER = "nutriwallet/users/";

    private final Cloudinary cloudinary;

    @Override
    public UploadFileResponse uploadImage(MultipartFile file, Long userId) {
        validate(file);
        String folder = userFolder(userId) + "/meals";
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "use_filename", true,
                    "unique_filename", true,
                    "overwrite", false
            ));
            return new UploadFileResponse(
                    stringValue(result, "public_id"),
                    stringValue(result, "secure_url"),
                    stringValue(result, "format"),
                    longValue(result, "bytes"),
                    intValue(result, "width"),
                    intValue(result, "height")
            );
        } catch (IOException | RuntimeException exception) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public void deleteImage(String publicId, Long userId) {
        if (publicId == null || !publicId.startsWith(userFolder(userId) + "/")) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", "image",
                    "invalidate", true
            ));
            String status = stringValue(result, "result");
            if (!"ok".equals(status) && !"not found".equals(status)) {
                throw new AppException(ErrorCode.FILE_DELETE_FAILED);
            }
        } catch (IOException | RuntimeException exception) {
            if (exception instanceof AppException appException) {
                throw appException;
            }
            throw new AppException(ErrorCode.FILE_DELETE_FAILED);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new AppException(ErrorCode.FILE_TYPE_NOT_ALLOWED);
        }
    }

    private String userFolder(Long userId) {
        return ROOT_FOLDER + userId;
    }

    private String stringValue(Map<?, ?> result, String key) {
        Object value = result.get(key);
        return value == null ? null : value.toString();
    }

    private long longValue(Map<?, ?> result, String key) {
        Object value = result.get(key);
        return value instanceof Number number ? number.longValue() : 0L;
    }

    private int intValue(Map<?, ?> result, String key) {
        Object value = result.get(key);
        return value instanceof Number number ? number.intValue() : 0;
    }
}
