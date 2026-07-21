package com.f941efile.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequestMapping("/api/mock-mef")
public class MockMefController {

    private final ConcurrentHashMap<String, String> submissions = new ConcurrentHashMap<>();

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submit(
            @RequestBody String xmlPayload,
            @RequestHeader(value = "X-Submission-ID", required = false) String submissionId) {

        String receiptId = "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String utid = "UTID-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        submissions.put(receiptId, "SUBMITTED");

        log.info("Mock MeF: Received submission {}. Receipt: {}", submissionId, receiptId);

        return ResponseEntity.ok(Map.of(
                "receiptId", receiptId,
                "transmissionUtid", utid,
                "status", "SUBMITTED",
                "message", "Submission received and queued for processing"
        ));
    }

    @GetMapping("/status/{receiptId}")
    public ResponseEntity<Map<String, Object>> status(@PathVariable String receiptId) {
        String currentStatus = submissions.getOrDefault(receiptId, "UNKNOWN");

        if ("SUBMITTED".equals(currentStatus)) {
            submissions.put(receiptId, "ACCEPTED");
            currentStatus = "ACCEPTED";
        }

        log.info("Mock MeF: Status check for {}. Status: {}", receiptId, currentStatus);

        return ResponseEntity.ok(Map.of(
                "receiptId", receiptId,
                "status", currentStatus,
                "errors", ""
        ));
    }
}
