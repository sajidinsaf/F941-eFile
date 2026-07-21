-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expiry DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_verification_token (email_verification_token),
    INDEX idx_users_reset_token (password_reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Business Profiles table
CREATE TABLE business_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ein VARCHAR(512) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    efin VARCHAR(20),
    etin VARCHAR(20),
    contact_name VARCHAR(200),
    contact_phone VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_business_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_business_profiles_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Filings table (Form 941)
CREATE TABLE filings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    business_profile_id BIGINT NOT NULL,
    tax_year INT NOT NULL,
    quarter INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    number_of_employees INT,
    wages_tips_compensation DECIMAL(15,2),
    federal_income_tax_withheld DECIMAL(15,2),
    social_security_wages DECIMAL(15,2),
    social_security_tax DECIMAL(15,2),
    social_security_tips DECIMAL(15,2),
    social_security_tips_tax DECIMAL(15,2),
    medicare_wages DECIMAL(15,2),
    medicare_tax DECIMAL(15,2),
    additional_medicare_wages DECIMAL(15,2),
    additional_medicare_tax DECIMAL(15,2),
    total_tax_before_adjustments DECIMAL(15,2),
    adjustment_fractions DECIMAL(15,2),
    adjustment_sick_pay DECIMAL(15,2),
    adjustment_tips DECIMAL(15,2),
    total_tax_after_adjustments DECIMAL(15,2),
    qualified_small_business_credit DECIMAL(15,2),
    total_tax_after_credits DECIMAL(15,2),
    total_deposits DECIMAL(15,2),
    balance_due DECIMAL(15,2),
    overpayment DECIMAL(15,2),
    deposit_schedule_type VARCHAR(20),
    month1_liability DECIMAL(15,2),
    month2_liability DECIMAL(15,2),
    month3_liability DECIMAL(15,2),
    submission_id VARCHAR(50),
    receipt_id VARCHAR(50),
    mef_errors TEXT,
    transmission_utid VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_filings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_filings_business_profile FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    INDEX idx_filings_user (user_id),
    INDEX idx_filings_status (status),
    INDEX idx_filings_receipt (receipt_id),
    INDEX idx_filings_submission (submission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    filing_id BIGINT,
    stripe_payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_filing FOREIGN KEY (filing_id) REFERENCES filings(id) ON DELETE SET NULL,
    INDEX idx_payments_user (user_id),
    INDEX idx_payments_stripe (stripe_payment_id),
    INDEX idx_payments_filing (filing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs table
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50),
    subject VARCHAR(255),
    body TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
