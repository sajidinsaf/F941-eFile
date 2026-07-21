package com.f941efile.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilingRequest {

    @NotNull(message = "Business profile ID is required")
    private Long businessProfileId;

    @NotNull(message = "Tax year is required")
    @Min(value = 2020, message = "Tax year must be 2020 or later")
    private Integer taxYear;

    @NotNull(message = "Quarter is required")
    @Min(value = 1, message = "Quarter must be between 1 and 4")
    @Max(value = 4, message = "Quarter must be between 1 and 4")
    private Integer quarter;

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
}
