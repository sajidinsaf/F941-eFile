package com.f941efile.controller;

import com.f941efile.dto.request.FilingRequest;
import com.f941efile.dto.response.FilingResponse;
import com.f941efile.security.UserPrincipal;
import com.f941efile.service.FilingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/filings")
@RequiredArgsConstructor
public class FilingController {

    private final FilingService filingService;

    @GetMapping
    public ResponseEntity<List<FilingResponse>> getFilings(@AuthenticationPrincipal UserPrincipal principal) {
        List<FilingResponse> filings = filingService.getFilingsByUserId(principal.getId());
        return ResponseEntity.ok(filings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FilingResponse> getFiling(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        FilingResponse filing = filingService.getFilingById(id, principal.getId());
        return ResponseEntity.ok(filing);
    }

    @PostMapping
    public ResponseEntity<FilingResponse> createFiling(
            @Valid @RequestBody FilingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        FilingResponse filing = filingService.createFiling(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(filing);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FilingResponse> updateFiling(
            @PathVariable Long id,
            @Valid @RequestBody FilingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        FilingResponse filing = filingService.updateFiling(id, request, principal.getId());
        return ResponseEntity.ok(filing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFiling(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        filingService.deleteFiling(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<FilingResponse> validateFiling(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        FilingResponse filing = filingService.validateFiling(id, principal.getId());
        return ResponseEntity.ok(filing);
    }
}
