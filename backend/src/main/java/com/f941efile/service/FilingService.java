package com.f941efile.service;

import com.f941efile.dto.request.FilingRequest;
import com.f941efile.dto.response.FilingResponse;
import com.f941efile.entity.BusinessProfile;
import com.f941efile.entity.Filing;
import com.f941efile.entity.User;
import com.f941efile.exception.BadRequestException;
import com.f941efile.exception.ResourceNotFoundException;
import com.f941efile.repository.BusinessProfileRepository;
import com.f941efile.repository.FilingRepository;
import com.f941efile.repository.UserRepository;
import com.f941efile.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FilingService {

    private static final BigDecimal SS_TAX_RATE = new BigDecimal("0.124");
    private static final BigDecimal SS_TIPS_TAX_RATE = new BigDecimal("0.124");
    private static final BigDecimal MEDICARE_TAX_RATE = new BigDecimal("0.029");
    private static final BigDecimal ADDITIONAL_MEDICARE_RATE = new BigDecimal("0.009");

    private final FilingRepository filingRepository;
    private final UserRepository userRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final EncryptionUtil encryptionUtil;

    @Transactional(readOnly = true)
    public List<FilingResponse> getFilingsByUserId(Long userId) {
        return filingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FilingResponse getFilingById(Long id, Long userId) {
        Filing filing = filingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Filing", "id", id));
        return toResponse(filing);
    }

    @Transactional
    public FilingResponse createFiling(FilingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        BusinessProfile businessProfile = businessProfileRepository
                .findByIdAndUserId(request.getBusinessProfileId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("BusinessProfile", "id", request.getBusinessProfileId()));

        Filing filing = Filing.builder()
                .user(user)
                .businessProfile(businessProfile)
                .taxYear(request.getTaxYear())
                .quarter(request.getQuarter())
                .status(Filing.FilingStatus.DRAFT)
                .build();

        populateFilingFields(filing, request);
        calculateTaxes(filing);

        filing = filingRepository.save(filing);
        log.info("Filing created: {} for user: {}", filing.getId(), userId);
        return toResponse(filing);
    }

    @Transactional
    public FilingResponse updateFiling(Long id, FilingRequest request, Long userId) {
        Filing filing = filingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Filing", "id", id));

        if (filing.getStatus() == Filing.FilingStatus.SUBMITTED ||
                filing.getStatus() == Filing.FilingStatus.ACCEPTED) {
            throw new BadRequestException("Cannot edit a filing that has been submitted or accepted");
        }

        if (request.getBusinessProfileId() != null &&
                !request.getBusinessProfileId().equals(filing.getBusinessProfile().getId())) {
            BusinessProfile newProfile = businessProfileRepository
                    .findByIdAndUserId(request.getBusinessProfileId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("BusinessProfile", "id", request.getBusinessProfileId()));
            filing.setBusinessProfile(newProfile);
        }

        filing.setTaxYear(request.getTaxYear());
        filing.setQuarter(request.getQuarter());

        populateFilingFields(filing, request);
        calculateTaxes(filing);

        filing.setStatus(Filing.FilingStatus.DRAFT);
        filing = filingRepository.save(filing);
        log.info("Filing updated: {} for user: {}", filing.getId(), userId);
        return toResponse(filing);
    }

    @Transactional
    public void deleteFiling(Long id, Long userId) {
        Filing filing = filingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Filing", "id", id));

        if (filing.getStatus() == Filing.FilingStatus.SUBMITTED ||
                filing.getStatus() == Filing.FilingStatus.ACCEPTED) {
            throw new BadRequestException("Cannot delete a filing that has been submitted or accepted");
        }

        filingRepository.delete(filing);
        log.info("Filing deleted: {} for user: {}", id, userId);
    }

    @Transactional
    public FilingResponse validateFiling(Long id, Long userId) {
        Filing filing = filingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Filing", "id", id));

        validateFilingData(filing);

        filing.setStatus(Filing.FilingStatus.VALIDATED);
        filing = filingRepository.save(filing);
        log.info("Filing validated: {} for user: {}", filing.getId(), userId);
        return toResponse(filing);
    }

    private void populateFilingFields(Filing filing, FilingRequest request) {
        filing.setNumberOfEmployees(request.getNumberOfEmployees());
        filing.setWagesTipsCompensation(request.getWagesTipsCompensation());
        filing.setFederalIncomeTaxWithheld(request.getFederalIncomeTaxWithheld());
        filing.setSocialSecurityWages(request.getSocialSecurityWages());
        filing.setSocialSecurityTips(request.getSocialSecurityTips());
        filing.setMedicareWages(request.getMedicareWages());
        filing.setAdditionalMedicareWages(request.getAdditionalMedicareWages());
        filing.setAdjustmentFractions(request.getAdjustmentFractions());
        filing.setAdjustmentSickPay(request.getAdjustmentSickPay());
        filing.setAdjustmentTips(request.getAdjustmentTips());
        filing.setQualifiedSmallBusinessCredit(request.getQualifiedSmallBusinessCredit());
        filing.setTotalDeposits(request.getTotalDeposits());

        if (request.getDepositScheduleType() != null) {
            filing.setDepositScheduleType(
                    Filing.DepositScheduleType.valueOf(request.getDepositScheduleType().toUpperCase()));
        }

        filing.setMonth1Liability(request.getMonth1Liability());
        filing.setMonth2Liability(request.getMonth2Liability());
        filing.setMonth3Liability(request.getMonth3Liability());
    }

    private void calculateTaxes(Filing filing) {
        BigDecimal ssTax = safeBigDecimal(filing.getSocialSecurityWages())
                .multiply(SS_TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        filing.setSocialSecurityTax(ssTax);

        BigDecimal ssTipsTax = safeBigDecimal(filing.getSocialSecurityTips())
                .multiply(SS_TIPS_TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        filing.setSocialSecurityTipsTax(ssTipsTax);

        BigDecimal medicareTax = safeBigDecimal(filing.getMedicareWages())
                .multiply(MEDICARE_TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        filing.setMedicareTax(medicareTax);

        BigDecimal addlMedicareTax = safeBigDecimal(filing.getAdditionalMedicareWages())
                .multiply(ADDITIONAL_MEDICARE_RATE).setScale(2, RoundingMode.HALF_UP);
        filing.setAdditionalMedicareTax(addlMedicareTax);

        BigDecimal totalBeforeAdj = safeBigDecimal(filing.getFederalIncomeTaxWithheld())
                .add(ssTax)
                .add(ssTipsTax)
                .add(medicareTax)
                .add(addlMedicareTax);
        filing.setTotalTaxBeforeAdjustments(totalBeforeAdj);

        BigDecimal totalAfterAdj = totalBeforeAdj
                .add(safeBigDecimal(filing.getAdjustmentFractions()))
                .subtract(safeBigDecimal(filing.getAdjustmentSickPay()))
                .subtract(safeBigDecimal(filing.getAdjustmentTips()));
        filing.setTotalTaxAfterAdjustments(totalAfterAdj);

        BigDecimal totalAfterCredits = totalAfterAdj
                .subtract(safeBigDecimal(filing.getQualifiedSmallBusinessCredit()));
        filing.setTotalTaxAfterCredits(totalAfterCredits.max(BigDecimal.ZERO));

        BigDecimal difference = filing.getTotalTaxAfterCredits()
                .subtract(safeBigDecimal(filing.getTotalDeposits()));
        if (difference.compareTo(BigDecimal.ZERO) > 0) {
            filing.setBalanceDue(difference);
            filing.setOverpayment(BigDecimal.ZERO);
        } else {
            filing.setBalanceDue(BigDecimal.ZERO);
            filing.setOverpayment(difference.abs());
        }
    }

    private void validateFilingData(Filing filing) {
        if (filing.getNumberOfEmployees() == null || filing.getNumberOfEmployees() < 0) {
            throw new BadRequestException("Number of employees is required and must be non-negative");
        }
        if (filing.getWagesTipsCompensation() == null) {
            throw new BadRequestException("Wages, tips, and compensation is required");
        }
        if (filing.getFederalIncomeTaxWithheld() == null) {
            throw new BadRequestException("Federal income tax withheld is required");
        }
        if (filing.getTaxYear() == null || filing.getQuarter() == null) {
            throw new BadRequestException("Tax year and quarter are required");
        }
    }

    private BigDecimal safeBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private FilingResponse toResponse(Filing filing) {
        String maskedEin = "";
        try {
            String decryptedEin = encryptionUtil.decrypt(filing.getBusinessProfile().getEin());
            maskedEin = "***-**-" + decryptedEin.substring(Math.max(0, decryptedEin.length() - 4));
        } catch (Exception e) {
            maskedEin = "***-**-****";
        }

        return FilingResponse.builder()
                .id(filing.getId())
                .businessProfileId(filing.getBusinessProfile().getId())
                .businessName(filing.getBusinessProfile().getBusinessName())
                .maskedEin(maskedEin)
                .taxYear(filing.getTaxYear())
                .quarter(filing.getQuarter())
                .status(filing.getStatus().name())
                .numberOfEmployees(filing.getNumberOfEmployees())
                .wagesTipsCompensation(filing.getWagesTipsCompensation())
                .federalIncomeTaxWithheld(filing.getFederalIncomeTaxWithheld())
                .socialSecurityWages(filing.getSocialSecurityWages())
                .socialSecurityTax(filing.getSocialSecurityTax())
                .socialSecurityTips(filing.getSocialSecurityTips())
                .socialSecurityTipsTax(filing.getSocialSecurityTipsTax())
                .medicareWages(filing.getMedicareWages())
                .medicareTax(filing.getMedicareTax())
                .additionalMedicareWages(filing.getAdditionalMedicareWages())
                .additionalMedicareTax(filing.getAdditionalMedicareTax())
                .totalTaxBeforeAdjustments(filing.getTotalTaxBeforeAdjustments())
                .adjustmentFractions(filing.getAdjustmentFractions())
                .adjustmentSickPay(filing.getAdjustmentSickPay())
                .adjustmentTips(filing.getAdjustmentTips())
                .totalTaxAfterAdjustments(filing.getTotalTaxAfterAdjustments())
                .qualifiedSmallBusinessCredit(filing.getQualifiedSmallBusinessCredit())
                .totalTaxAfterCredits(filing.getTotalTaxAfterCredits())
                .totalDeposits(filing.getTotalDeposits())
                .balanceDue(filing.getBalanceDue())
                .overpayment(filing.getOverpayment())
                .depositScheduleType(filing.getDepositScheduleType() != null ?
                        filing.getDepositScheduleType().name() : null)
                .month1Liability(filing.getMonth1Liability())
                .month2Liability(filing.getMonth2Liability())
                .month3Liability(filing.getMonth3Liability())
                .submissionId(filing.getSubmissionId())
                .receiptId(filing.getReceiptId())
                .mefErrors(filing.getMefErrors())
                .createdAt(filing.getCreatedAt())
                .updatedAt(filing.getUpdatedAt())
                .build();
    }
}
