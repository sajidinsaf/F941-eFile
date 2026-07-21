package com.f941efile.service.mef;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
public class MefSubmissionClient {

    @Value("${app.mef.base-url}")
    private String mefBaseUrl;

    @Value("${app.mef.etin:}")
    private String etin;

    private final RestTemplate restTemplate = new RestTemplate();

    public SubmissionResult submit(String xmlContent, String submissionId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_XML);
            headers.set("X-ETIN", etin);
            headers.set("X-Submission-ID", submissionId);

            HttpEntity<String> request = new HttpEntity<>(xmlContent, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    mefBaseUrl + "/submit",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null) {
                SubmissionResult result = new SubmissionResult();
                result.setSuccess(true);
                result.setReceiptId((String) body.get("receiptId"));
                result.setTransmissionUtid((String) body.get("transmissionUtid"));
                result.setStatus((String) body.get("status"));
                return result;
            }

            SubmissionResult errorResult = new SubmissionResult();
            errorResult.setSuccess(false);
            errorResult.setErrorMessage("Empty response from MeF");
            return errorResult;

        } catch (Exception e) {
            log.error("MeF submission failed", e);
            SubmissionResult errorResult = new SubmissionResult();
            errorResult.setSuccess(false);
            errorResult.setErrorMessage(e.getMessage());
            return errorResult;
        }
    }

    public StatusResult checkStatus(String receiptId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-ETIN", etin);

            HttpEntity<?> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    mefBaseUrl + "/status/" + receiptId,
                    HttpMethod.GET,
                    request,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null) {
                StatusResult result = new StatusResult();
                result.setStatus((String) body.get("status"));
                result.setErrors((String) body.get("errors"));
                result.setAccepted("ACCEPTED".equals(result.getStatus()));
                return result;
            }

            StatusResult errorResult = new StatusResult();
            errorResult.setStatus("UNKNOWN");
            return errorResult;

        } catch (Exception e) {
            log.error("MeF status check failed", e);
            StatusResult errorResult = new StatusResult();
            errorResult.setStatus("ERROR");
            errorResult.setErrors(e.getMessage());
            return errorResult;
        }
    }

    @Data
    public static class SubmissionResult {
        private boolean success;
        private String receiptId;
        private String transmissionUtid;
        private String status;
        private String errorMessage;
    }

    @Data
    public static class StatusResult {
        private String status;
        private boolean accepted;
        private String errors;
    }
}
