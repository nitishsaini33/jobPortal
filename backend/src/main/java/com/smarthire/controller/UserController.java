package com.smarthire.controller;

import com.smarthire.dto.user.UserProfileDto;
import com.smarthire.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserProfile(authentication.getName()));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<UserProfileDto> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserProfileById(id));
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestPart("profile") UserProfileDto profileDto,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateUserProfile(authentication.getName(), profileDto, resume));
    }
}
