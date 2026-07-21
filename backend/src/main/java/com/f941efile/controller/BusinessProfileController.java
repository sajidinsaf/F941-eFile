package com.f941efile.controller;

import com.f941efile.dto.request.BusinessProfileRequest;
import com.f941efile.dto.response.BusinessProfileResponse;
import com.f941efile.security.UserPrincipal;
import com.f941efile.service.BusinessProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class BusinessProfileController {

    private final BusinessProfileService businessProfileService;

    @GetMapping
    public ResponseEntity<List<BusinessProfileResponse>> getProfiles(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<BusinessProfileResponse> profiles = businessProfileService.getProfilesByUserId(principal.getId());
        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessProfileResponse> getProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        BusinessProfileResponse profile = businessProfileService.getProfileById(id, principal.getId());
        return ResponseEntity.ok(profile);
    }

    @PostMapping
    public ResponseEntity<BusinessProfileResponse> createProfile(
            @Valid @RequestBody BusinessProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BusinessProfileResponse profile = businessProfileService.createProfile(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(profile);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessProfileResponse> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody BusinessProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BusinessProfileResponse profile = businessProfileService.updateProfile(id, request, principal.getId());
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        businessProfileService.deleteProfile(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
