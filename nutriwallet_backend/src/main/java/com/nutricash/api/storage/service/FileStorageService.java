package com.nutricash.api.storage.service;

import com.nutricash.api.storage.dto.UploadFileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    UploadFileResponse uploadImage(MultipartFile file, Long userId);
    void deleteImage(String publicId, Long userId);
}
