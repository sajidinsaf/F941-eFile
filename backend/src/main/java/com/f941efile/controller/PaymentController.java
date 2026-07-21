package com.f941efile.controller;

import com.f941efile.security.UserPrincipal;
import com.f941efile.service.payment.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout/{filingId}")
    public ResponseEntity<Map<String, String>> createCheckout(
            @PathVariable Long filingId,
            @AuthenticationPrincipal UserPrincipal principal) throws StripeException {
        Map<String, String> session = paymentService.createCheckoutSession(filingId, principal.getId());
        return ResponseEntity.ok(session);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        paymentService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("OK");
    }
}
