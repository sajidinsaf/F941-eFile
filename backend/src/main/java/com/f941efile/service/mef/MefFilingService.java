package com.f941efile.service.mef;

import com.f941efile.entity.Filing;
import com.f941efile.exception.BadRequestException;
import com.f941efile.exception.ResourceNotFoundException;
import com.f941efile.repository.FilingRepository;
import com.f941efile.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MefFilingService {

    private final FilingRepository filingRepository;
    private final Form941XmlGenerator xmlGenerator;
    private final MefSubmissionClient submissionClient;
    private final NotificationService notificationService;

    @Transactional
    public Map<String, Object> submitFiling(Long filingId, Long userId) {
        Filing filing = filingRepository.findByIdAndUserId(filingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Filing", "id", filingId));

        if (filing.getStatus() == Filing.FilingStatus.SUBMITTED ||
                filing.getStatus() == Filing.FilingStatus.ACCEPTED) {
            throw new BadRequestException("Filing has already been submitted. Current status: " + filing.getStatus());
        }

        String submissionId = "SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        filing.setSubmissionId(submissionId);

        String xml = xmlGenerator.generateXml(filing, filing.getBusinessProfile());

        log.info("Submitting filing {} with submission ID {}", filingId, submissionId);

        MefSubmissionClient.SubmissionResult result = submissionClient.submit(xml, submissionId);

        if (result.isSuccess()) {
            filing.setStatus(Filing.FilingStatus.SUBMITTED);
            filing.setReceiptId(result.getReceiptId());
            filing.setTransmissionUtid(result.getTransmissionUtid());
            filing.setMefErrors(null);
            filingRepository.save(filing);

            notificationService.sendFilingStatusEmail(
                    filing.getUser(),
                    filing,
                    "SUBMITTED",
                    "Your Form 941 filing has been submitted successfully."
            );

            log.info("Filing {} submitted successfully. Receipt ID: {}", filingId, result.getReceiptId());

            return Map.of(
                    "status", "SUBMITTED",
                    "submissionId", submissionId,
                    "receiptId", result.getReceiptId(),
                    "message", "Filing submitted successfully"
            );
        } else {
            filing.setMefErrors(result.getErrorMessage());
            filingRepository.save(filing);

            log.error("Filing {} submission failed: {}", filingId, result.getErrorMessage());

            return Map.of(
                    "status", "FAILED",
                    "submissionId", submissionId,
                    "error", result.getErrorMessage() != null ? result.getErrorMessage() : "Unknown error"
            );
        }
    }

    @Transactional
    public Map<String, Object> checkStatus(String receiptId, Long userId) {
        Filing filing = filingRepository.findByReceiptId(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Filing", "receiptId", receiptId));

        if (!filing.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Filing", "receiptId", receiptId);
        }

        MefSubmissionClient.StatusResult result = submissionClient.checkStatus(receiptId);

        if ("ACCEPTED".equals(result.getStatus())) {
            filing.setStatus(Filing.FilingStatus.ACCEPTED);
            filing.setMefErrors(null);
            filingRepository.save(filing);

            notificationService.sendFilingStatusEmail(
                    filing.getUser(),
                    filing,
                    "ACCEPTED",
                    "Your Form 941 filing has been accepted by the IRS."
            );
        } else if ("REJECTED".equals(result.getStatus())) {
            filing.setStatus(Filing.FilingStatus.REJECTED);
            filing.setMefErrors(result.getErrors());
            filingRepository.save(filing);

            notificationService.sendFilingStatusEmail(
                    filing.getUser(),
                    filing,
                    "REJECTED",
                    "Your Form 941 filing has been rejected. Errors: " + result.getErrors()
            );
        }

        return Map.of(
                "receiptId", receiptId,
                "status", result.getStatus(),
                "errors", result.getErrors() != null ? result.getErrors() : ""
        );
    }
}
