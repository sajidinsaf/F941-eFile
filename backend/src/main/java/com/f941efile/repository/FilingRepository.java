package com.f941efile.repository;

import com.f941efile.entity.Filing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FilingRepository extends JpaRepository<Filing, Long> {

    List<Filing> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Filing> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, Filing.FilingStatus status);

    Optional<Filing> findByReceiptId(String receiptId);

    Optional<Filing> findBySubmissionId(String submissionId);

    List<Filing> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
}
