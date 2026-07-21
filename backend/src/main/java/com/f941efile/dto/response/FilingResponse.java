package com.f941efile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilingResponse {

    private Long id;
    private Long businessProfileId;
    private String businessName;
    private String maskedEin;
    private Integer taxYear;
    private Integer quarter;
    private String status;
    private Integer numberOfEmployees;
    private BigDecimal wagesTipsCompensation;
    private BigDecimal federalIncomeTaxWithheld;
    private BigDecimal socialSecurityWages;
    private BigDecimal socialSecurityTax;
    private BigDecimal socialSecurityTips;
    private BigDecimal socialSecurityTipsTax;
    private BigDecimal medicareWages;
    private BigDecimal medicareTax;
    private BigDecimal additionalMedicareWages;
    private BigDecimal additionalMedicareTax;
    private BigDecimal totalTaxBeforeAdjustments;
    private BigDecimal adjustmentFractions;
    private BigDecimal adjustmentSickPay;
    private BigDecimal adjustmentTips;
    private BigDecimal totalTaxAfterAdjustments;
    private BigDecimal qualifiedSmallBusinessCredit;
    private BigDecimal totalTaxAfterCredits;
    private BigDecimal totalDeposits;
    private BigDecimal balanceDue;
    private BigDecimal overpayment;
    private String depositScheduleType;
    private BigDecimal month1Liability;
    private BigDecimal month2Liability;
    private BigDecimal month3Liability;
    private String submissionId;
    private String receiptId;
    private String mefErrors;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
