package com.f941efile.service;

import com.f941efile.dto.request.BusinessProfileRequest;
import com.f941efile.dto.response.BusinessProfileResponse;
import com.f941efile.entity.BusinessProfile;
import com.f941efile.entity.User;
import com.f941efile.exception.ResourceNotFoundException;
import com.f941efile.repository.BusinessProfileRepository;
import com.f941efile.repository.UserRepository;
import com.f941efile.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessProfileService {

    private final BusinessProfileRepository businessProfileRepository;
    private final UserRepository userRepository;
    private final EncryptionUtil encryptionUtil;

    @Transactional(readOnly = true)
    public List<BusinessProfileResponse> getProfilesByUserId(Long userId) {
        return businessProfileRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BusinessProfileResponse getProfileById(Long id, Long userId) {
        BusinessProfile profile = businessProfileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("BusinessProfile", "id", id));
        return toResponse(profile);
    }

    @Transactional
    public BusinessProfileResponse createProfile(BusinessProfileRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        BusinessProfile profile = BusinessProfile.builder()
                .user(user)
                .ein(encryptionUtil.encrypt(request.getEin().replaceAll("-", "")))
                .businessName(request.getBusinessName())
                .tradeName(request.getTradeName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .phone(request.getPhone())
                .efin(request.getEfin())
                .etin(request.getEtin())
                .contactName(request.getContactName())
                .contactPhone(request.getContactPhone())
                .build();

        profile = businessProfileRepository.save(profile);
        log.info("Business profile created: {} for user: {}", profile.getId(), userId);
        return toResponse(profile);
    }

    @Transactional
    public BusinessProfileResponse updateProfile(Long id, BusinessProfileRequest request, Long userId) {
        BusinessProfile profile = businessProfileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("BusinessProfile", "id", id));

        profile.setEin(encryptionUtil.encrypt(request.getEin().replaceAll("-", "")));
        profile.setBusinessName(request.getBusinessName());
        profile.setTradeName(request.getTradeName());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setZipCode(request.getZipCode());
        profile.setPhone(request.getPhone());
        profile.setEfin(request.getEfin());
        profile.setEtin(request.getEtin());
        profile.setContactName(request.getContactName());
        profile.setContactPhone(request.getContactPhone());

        profile = businessProfileRepository.save(profile);
        log.info("Business profile updated: {} for user: {}", profile.getId(), userId);
        return toResponse(profile);
    }

    @Transactional
    public void deleteProfile(Long id, Long userId) {
        BusinessProfile profile = businessProfileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("BusinessProfile", "id", id));
        businessProfileRepository.delete(profile);
        log.info("Business profile deleted: {} for user: {}", id, userId);
    }

    private BusinessProfileResponse toResponse(BusinessProfile profile) {
        String decryptedEin = encryptionUtil.decrypt(profile.getEin());
        String maskedEin = "***-**-" + decryptedEin.substring(Math.max(0, decryptedEin.length() - 4));

        return BusinessProfileResponse.builder()
                .id(profile.getId())
                .maskedEin(maskedEin)
                .businessName(profile.getBusinessName())
                .tradeName(profile.getTradeName())
                .address(profile.getAddress())
                .city(profile.getCity())
                .state(profile.getState())
                .zipCode(profile.getZipCode())
                .phone(profile.getPhone())
                .efin(profile.getEfin())
                .etin(profile.getEtin())
                .contactName(profile.getContactName())
                .contactPhone(profile.getContactPhone())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
