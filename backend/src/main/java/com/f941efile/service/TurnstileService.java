package com.f941efile.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class TurnstileService {

    @Value("${app.turnstile.secret-key:}")
    private String secretKey;

    @Value("${app.turnstile.verify-url:https://challenges.cloudflare.com/turnstile/v0/siteverify}")
    private String verifyUrl;

    @Value("${app.turnstile.enabled:false}")
    private boolean enabled;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean verify(String token) {
        if (!enabled) {
            return true;
        }

        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("secret", secretKey);
            body.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            TurnstileResponse response = restTemplate.postForObject(verifyUrl, request, TurnstileResponse.class);

            if (response != null && response.isSuccess()) {
                return true;
            }

            log.warn("Turnstile verification failed: {}", response);
            return false;
        } catch (Exception e) {
            log.error("Turnstile verification error", e);
            return false;
        }
    }

    @Data
    private static class TurnstileResponse {
        private boolean success;

        @JsonProperty("error-codes")
        private String[] errorCodes;
    }
}
