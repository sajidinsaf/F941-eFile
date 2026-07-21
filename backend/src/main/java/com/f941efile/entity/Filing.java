package com.f941efile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "filings")
public class Filing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_profile_id", nullable = false)
    private BusinessProfile businessProfile;

    @Column(name = "tax_year", nullable = false)
    private Integer taxYear;

    @Column(nullable = false)
    private Integer quarter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FilingStatus status = FilingStatus.DRAFT;

    @Column(name = "number_of_employees")
    private Integer numberOfEmployees;

    @Column(name = "wages_tips_compensation", precision = 15, scale = 2)
    private BigDecimal wagesTipsCompensation;

    @Column(name = "federal_income_tax_withheld", precision = 15, scale = 2)
    private BigDecimal federalIncomeTaxWithheld;

    @Column(name = "social_security_wages", precision = 15, scale = 2)
    private BigDecimal socialSecurityWages;

    @Column(name = "social_security_tax", precision = 15, scale = 2)
    private BigDecimal socialSecurityTax;

    @Column(name = "social_security_tips", precision = 15, scale = 2)
    private BigDecimal socialSecurityTips;

    @Column(name = "social_security_tips_tax", precision = 15, scale = 2)
    private BigDecimal socialSecurityTipsTax;

    @Column(name = "medicare_wages", precision = 15, scale = 2)
    private BigDecimal medicareWages;

    @Column(name = "medicare_tax", precision = 15, scale = 2)
    private BigDecimal medicareTax;

    @Column(name = "additional_medicare_wages", precision = 15, scale = 2)
    private BigDecimal additionalMedicareWages;

    @Column(name = "additional_medicare_tax", precision = 15, scale = 2)
    private BigDecimal additionalMedicareTax;

    @Column(name = "total_tax_before_adjustments", precision = 15, scale = 2)
    private BigDecimal totalTaxBeforeAdjustments;

    @Column(name = "adjustment_fractions", precision = 15, scale = 2)
    private BigDecimal adjustmentFractions;

    @Column(name = "adjustment_sick_pay", precision = 15, scale = 2)
    private BigDecimal adjustmentSickPay;

    @Column(name = "adjustment_tips", precision = 15, scale = 2)
    private BigDecimal adjustmentTips;

    @Column(name = "total_tax_after_adjustments", precision = 15, scale = 2)
    private BigDecimal totalTaxAfterAdjustments;

    @Column(name = "qualified_small_business_credit", precision = 15, scale = 2)
    private BigDecimal qualifiedSmallBusinessCredit;

    @Column(name = "total_tax_after_credits", precision = 15, scale = 2)
    private BigDecimal totalTaxAfterCredits;

    @Column(name = "total_deposits", precision = 15, scale = 2)
    private BigDecimal totalDeposits;

    @Column(name = "balance_due", precision = 15, scale = 2)
    private BigDecimal balanceDue;

    @Column(precision = 15, scale = 2)
    private BigDecimal overpayment;

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_schedule_type", length = 20)
    private DepositScheduleType depositScheduleType;

    @Column(name = "month1_liability", precision = 15, scale = 2)
    private BigDecimal month1Liability;

    @Column(name = "month2_liability", precision = 15, scale = 2)
    private BigDecimal month2Liability;

    @Column(name = "month3_liability", precision = 15, scale = 2)
    private BigDecimal month3Liability;

    @Column(name = "submission_id", length = 50)
    private String submissionId;

    @Column(name = "receipt_id", length = 50)
    private String receiptId;

    @Column(name = "mef_errors", columnDefinition = "TEXT")
    private String mefErrors;

    @Column(name = "transmission_utid", length = 100)
    private String transmissionUtid;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum FilingStatus {
        DRAFT, VALIDATED, SUBMITTED, ACCEPTED, REJECTED
    }

    public enum DepositScheduleType {
        MONTHLY, SEMIWEEKLY
    }
}
