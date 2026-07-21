package com.f941efile.repository;

import com.f941efile.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Payment> findByStripePaymentId(String stripePaymentId);

    Optional<Payment> findByFilingId(Long filingId);
}
