package com.nutricash.api.storage.controller;

import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.storage.dto.UploadFileResponse;
import com.nutricash.api.storage.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/storage/images")
@RequiredArgsConstructor
@Tag(name = "Storage", description = "Authenticated image upload and deletion")
@SecurityRequirement(name = "bearerAuth")
public class FileStorageController {

    private final FileStorageService fileStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a meal image")
    public ApiResponse<UploadFileResponse> upload(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestPart("file") MultipartFile file) {
        return ApiResponse.success(
                "Image uploaded",
                fileStorageService.uploadImage(file, currentUser.getId())
        );
    }

    @DeleteMapping
    @Operation(summary = "Delete an uploaded meal image")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestParam String publicId) {
        fileStorageService.deleteImage(publicId, currentUser.getId());
        return ApiResponse.success("Image deleted", null);
    }
}
