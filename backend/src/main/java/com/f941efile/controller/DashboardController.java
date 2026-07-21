package com.f941efile.controller;

import com.f941efile.dto.response.DashboardSummaryResponse;
import com.f941efile.dto.response.FilingResponse;
import com.f941efile.entity.Filing;
import com.f941efile.repository.FilingRepository;
import com.f941efile.security.UserPrincipal;
import com.f941efile.service.FilingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final FilingRepository filingRepository;
    private final FilingService filingService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @AuthenticationPrincipal UserPrincipal principal) {

        Long userId = principal.getId();

        long total = filingRepository.countByUserId(userId);
        long drafts = filingRepository.countByUserIdAndStatus(userId, Filing.FilingStatus.DRAFT);
        long submitted = filingRepository.countByUserIdAndStatus(userId, Filing.FilingStatus.SUBMITTED);
        long accepted = filingRepository.countByUserIdAndStatus(userId, Filing.FilingStatus.ACCEPTED);
        long rejected = filingRepository.countByUserIdAndStatus(userId, Filing.FilingStatus.REJECTED);

        List<Filing> allFilings = filingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        BigDecimal totalTax = allFilings.stream()
                .map(f -> f.getTotalTaxAfterCredits() != null ? f.getTotalTaxAfterCredits() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<FilingResponse> recentFilings = filingRepository
                .findTop5ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(f -> filingService.getFilingById(f.getId(), userId))
                .toList();

        DashboardSummaryResponse summary = DashboardSummaryResponse.builder()
                .totalFilings(total)
                .draftFilings(drafts)
                .submittedFilings(submitted)
                .acceptedFilings(accepted)
                .rejectedFilings(rejected)
                .totalTaxReported(totalTax)
                .recentFilings(recentFilings)
                .build();

        return ResponseEntity.ok(summary);
    }
}
