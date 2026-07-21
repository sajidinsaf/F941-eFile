package com.f941efile.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Mock MeF (Modernized e-File) endpoints that simulate IRS A2A behavior.
 * Mirrors the pattern from the irs1099 MockIrsController.
 *
 * Endpoints:
 *   POST /mock-mef/auth/token       - OAuth2 token endpoint
 *   POST /mock-mef/submit           - Form 941 XML submission
 *   GET  /mock-mef/status/{receiptId} - Acknowledgement/status lookup
 *
 * Processing simulation:
 *   - Submissions stay in PROCESSING for 10 seconds
 *   - After 10 seconds: 90% ACCEPTED, 10% REJECTED (deterministic by receiptId hash)
 */
@Slf4j
@RestController
@RequestMapping("/mock-mef")
public class MockMefController {

    private record Transmission(String receiptId, String utid, String submissionId,
                                String xmlSnippet, Instant submittedAt) {}

    private final ConcurrentHashMap<String, Transmission> byReceiptId = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Transmission> byUtid = new ConcurrentHashMap<>();

    // ── OAuth Token ──────────────────────────────────────────────────────

    @PostMapping(value = "/auth/token", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> token(
            @RequestParam(value = "grant_type", required = false) String grantType,
            @RequestParam(value = "client_id", required = false) String clientId) {

        log.info("Mock MeF: Token request (grant_type={}, client_id={})", grantType, clientId);

        return ResponseEntity.ok(Map.of(
                "access_token", "mock-" + UUID.randomUUID(),
                "token_type", "Bearer",
                "expires_in", 3600,
                "refresh_token", "mock-refresh-" + UUID.randomUUID()
        ));
    }

    // ── Submit Form 941 ──────────────────────────────────────────────────

    @PostMapping(value = "/submit", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> submit(
            @RequestBody String xmlPayload,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Submission-ID", required = false) String submissionId,
            @RequestHeader(value = "X-ETIN", required = false) String etin) {

        // Validate auth header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Mock MeF: Missing or invalid Authorization header");
            return ResponseEntity.status(401).body(Map.of(
                    "error", "UNAUTHORIZED",
                    "message", "Missing or invalid Authorization header"
            ));
        }

        // Validate XML payload
        if (xmlPayload == null || xmlPayload.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "INVALID_PAYLOAD",
                    "message", "XML payload is empty"
            ));
        }

        // Extract UTID from XML if present
        String utid = extractElement(xmlPayload, "UniqueTransmissionId");
        if (utid == null || utid.isBlank()) {
            utid = UUID.randomUUID().toString().toUpperCase() + ":MeF:000000::A";
        }

        // Check for duplicate UTID
        if (byUtid.containsKey(utid)) {
            log.warn("Mock MeF: Duplicate UTID detected: {}", utid);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "DUPLICATE_TRANSMISSION",
                    "message", "A transmission with this UTID has already been received",
                    "utid", utid
            ));
        }

        String receiptId = "MeF-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        if (submissionId == null) {
            submissionId = "SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        String snippet = xmlPayload.substring(0, Math.min(200, xmlPayload.length()));
        Transmission tx = new Transmission(receiptId, utid, submissionId, snippet, Instant.now());
        byReceiptId.put(receiptId, tx);
        byUtid.put(utid, tx);

        log.info("Mock MeF: Received Form 941 submission. SubmissionId={}, ReceiptId={}, UTID={}, ETIN={}",
                submissionId, receiptId, utid, etin);

        String timestamp = DateTimeFormatter.ISO_INSTANT.format(Instant.now().atOffset(ZoneOffset.UTC));

        return ResponseEntity.ok(Map.of(
                "receiptId", receiptId,
                "transmissionUtid", utid,
                "submissionId", submissionId,
                "status", "SUBMITTED",
                "timestamp", timestamp,
                "message", "Submission received and queued for processing"
        ));
    }

    // ── Status / Acknowledgement ─────────────────────────────────────────

    @GetMapping(value = "/status/{receiptId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> status(@PathVariable String receiptId) {

        Transmission tx = byReceiptId.get(receiptId);
        if (tx == null) {
            log.warn("Mock MeF: Status request for unknown receipt: {}", receiptId);
            return ResponseEntity.status(404).body(Map.of(
                    "receiptId", receiptId,
                    "status", "UNKNOWN",
                    "message", "No submission found for this receipt ID"
            ));
        }

        long elapsed = Instant.now().getEpochSecond() - tx.submittedAt().getEpochSecond();

        // Simulate processing delay (10 seconds)
        if (elapsed < 10) {
            log.info("Mock MeF: Status for {} = PROCESSING ({} seconds elapsed)", receiptId, elapsed);
            return ResponseEntity.ok(Map.of(
                    "receiptId", receiptId,
                    "transmissionUtid", tx.utid(),
                    "status", "PROCESSING",
                    "message", "Submission is being processed",
                    "errors", ""
            ));
        }

        // Deterministic outcome: 90% accepted, 10% rejected based on receiptId hash
        boolean accepted = Math.abs(receiptId.hashCode() % 10) != 0;
        String status = accepted ? "ACCEPTED" : "REJECTED";
        String errors = accepted ? "" : "Business Rule R0000-500: Invalid EIN format; Business Rule R0000-902: Schedule B required for semi-weekly depositors";

        log.info("Mock MeF: Status for {} = {} ({}s elapsed)", receiptId, status, elapsed);

        return ResponseEntity.ok(Map.of(
                "receiptId", receiptId,
                "transmissionUtid", tx.utid(),
                "submissionId", tx.submissionId(),
                "status", status,
                "errors", errors,
                "acceptedRecordCount", accepted ? 1 : 0,
                "rejectedRecordCount", accepted ? 0 : 1,
                "timestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now().atOffset(ZoneOffset.UTC))
        ));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private String extractElement(String xml, String elementName) {
        String startTag = "<" + elementName + ">";
        String endTag = "</" + elementName + ">";
        int start = xml.indexOf(startTag);
        int end = xml.indexOf(endTag);
        if (start >= 0 && end > start) {
            return xml.substring(start + startTag.length(), end).trim();
        }
        return null;
    }
}
