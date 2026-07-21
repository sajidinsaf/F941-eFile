package com.f941efile.service.payment;

import com.f941efile.entity.Filing;
import com.f941efile.entity.Payment;
import com.f941efile.entity.User;
import com.f941efile.exception.BadRequestException;
import com.f941efile.exception.ResourceNotFoundException;
import com.f941efile.repository.FilingRepository;
import com.f941efile.repository.PaymentRepository;
import com.f941efile.repository.UserRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final FilingRepository filingRepository;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.payment.filing-fee:4.99}")
    private BigDecimal filingFee;

    @Transactional
    public Map<String, String> createCheckoutSession(Long filingId, Long userId) throws StripeException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Filing filing = filingRepository.findByIdAndUserId(filingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Filing", "id", filingId));

        if (paymentRepository.findByFilingId(filingId).isPresent()) {
            Payment existingPayment = paymentRepository.findByFilingId(filingId).get();
            if (existingPayment.getStatus() == Payment.PaymentStatus.COMPLETED) {
                throw new BadRequestException("Payment already completed for this filing");
            }
        }

        long amountInCents = filingFee.multiply(new BigDecimal("100")).longValue();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomerEmail(user.getEmail())
                .setSuccessUrl(frontendUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/payment/cancel")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(amountInCents)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Form 941 e-Filing - Q" + filing.getQuarter() + " " + filing.getTaxYear())
                                        .setDescription("IRS Form 941 electronic filing service")
                                        .build())
                                .build())
                        .build())
                .putMetadata("filingId", String.valueOf(filingId))
                .putMetadata("userId", String.valueOf(userId))
                .build();

        Session session = Session.create(params);

        Payment payment = Payment.builder()
                .user(user)
                .filing(filing)
                .stripePaymentId(session.getId())
                .amount(filingFee)
                .currency("usd")
                .status(Payment.PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);

        log.info("Checkout session created: {} for filing: {}", session.getId(), filingId);

        return Map.of(
                "sessionId", session.getId(),
                "url", session.getUrl()
        );
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed", e);
            throw new BadRequestException("Invalid webhook signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow(() -> new BadRequestException("Unable to deserialize webhook event"));

            paymentRepository.findByStripePaymentId(session.getId()).ifPresent(payment -> {
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                paymentRepository.save(payment);
                log.info("Payment completed: {} for filing: {}", session.getId(), payment.getFiling().getId());
            });
        } else if ("checkout.session.expired".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow(() -> new BadRequestException("Unable to deserialize webhook event"));

            paymentRepository.findByStripePaymentId(session.getId()).ifPresent(payment -> {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepository.save(payment);
                log.info("Payment expired: {}", session.getId());
            });
        }
    }
}
