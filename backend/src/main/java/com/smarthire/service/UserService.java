package com.smarthire.service;

import com.smarthire.dto.user.UserProfileDto;
import com.smarthire.entity.User;
import com.smarthire.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public UserProfileDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    public UserProfileDto getUserProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    @Transactional
    public UserProfileDto updateUserProfile(String email, UserProfileDto dto, MultipartFile resumeFile) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setDob(dto.getDob());
        user.setProfileSummary(dto.getProfileSummary());
        user.setSkills(dto.getSkills());
        user.setEducation(dto.getEducation());
        user.setExperience(dto.getExperience());
        user.setLinkedinUrl(dto.getLinkedinUrl());
        user.setGithubUrl(dto.getGithubUrl());
        user.setPortfolioUrl(dto.getPortfolioUrl());

        if (resumeFile != null && !resumeFile.isEmpty()) {
            String resumePath = fileStorageService.storeFile(resumeFile);
            user.setResumeUrl(resumePath);
        }

        user = userRepository.save(user);
        return mapToDto(user);
    }

    private UserProfileDto mapToDto(User user) {
        return UserProfileDto.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dob(user.getDob())
                .profileSummary(user.getProfileSummary())
                .resumeUrl(user.getResumeUrl())
                .skills(user.getSkills())
                .education(user.getEducation())
                .experience(user.getExperience())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .portfolioUrl(user.getPortfolioUrl())
                .build();
    }
}
