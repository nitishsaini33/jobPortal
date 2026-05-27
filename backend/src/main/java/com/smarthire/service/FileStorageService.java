package com.smarthire.service;

import com.smarthire.config.FileStorageConfig;
import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Service for storing and retrieving resume files on the local file system.
 * 
 * - Validates file type (PDF, DOCX only)
 * - Generates unique filenames to prevent collisions
 * - Stores files under the configured upload directory
 * - Provides download as a Spring Resource
 */
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx", "doc");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
    );

    private final FileStorageConfig fileStorageConfig;

    /**
     * Stores a resume file and returns the stored filename.
     * 
     * @param file the uploaded multipart file
     * @return the unique filename used for storage
     */
    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot upload empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        // Validate file extension
        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException(
                    "Invalid file type. Only PDF and DOCX files are allowed. Got: " + extension);
        }

        // Validate content type
        if (file.getContentType() != null && !ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Invalid file content type: " + file.getContentType());
        }

        // Generate unique filename: UUID_originalname.ext
        String storedFilename = UUID.randomUUID().toString() + "_" + originalFilename;

        try {
            Path targetLocation = fileStorageConfig.getUploadPath().resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return storedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalFilename, e);
        }
    }

    /**
     * Loads a stored resume file as a downloadable Resource.
     * 
     * @param filename the stored filename
     * @return Spring Resource for file download
     */
    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = fileStorageConfig.getUploadPath().resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Resume file not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Resume file not found: " + filename);
        }
    }

    /**
     * Deletes a stored file (used when an application is withdrawn/deleted).
     */
    public void deleteFile(String filename) {
        try {
            Path filePath = fileStorageConfig.getUploadPath().resolve(filename).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't fail — file cleanup is best-effort
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0) {
            return "";
        }
        return filename.substring(dotIndex + 1);
    }
}
