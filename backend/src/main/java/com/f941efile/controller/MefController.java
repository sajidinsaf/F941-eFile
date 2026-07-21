package com.f941efile.controller;

import com.f941efile.security.UserPrincipal;
import com.f941efile.service.mef.MefFilingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mef")
@RequiredArgsConstructor
public class MefController {

    private final MefFilingService mefFilingService;

    @PostMapping("/submit/{filingId}")
    public ResponseEntity<Map<String, Object>> submitFiling(
            @PathVariable Long filingId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> result = mefFilingService.submitFiling(filingId, principal.getId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status/{receiptId}")
    public ResponseEntity<Map<String, Object>> checkStatus(
            @PathVariable String receiptId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> result = mefFilingService.checkStatus(receiptId, principal.getId());
        return ResponseEntity.ok(result);
    }
}
