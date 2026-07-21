# IRS Form 941 MeF e-Filing Platform

## Project Overview

E-commerce web application for electronically filing IRS Form 941 (Employer's Quarterly Federal Tax Return) through the Modernized e-File (MeF) Application-to-Application (A2A) system. Built with Spring Boot 3.x (Java 17) backend and React 18 + TypeScript frontend.

## Tech Stack

- **Backend**: Spring Boot 3.4.1, Java 17, Maven, Spring Security 6.x, Spring Data JPA
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Zustand, React Hook Form + Zod
- **Database**: MySQL (prod), H2 (dev)
- **Payments**: Stripe
- **AI**: Spring AI with Anthropic Claude
- **Hosting**: MochaHost (Tomcat 9, JDK 17-19, Node.js v18/v20)
- **Domain**: subdomain of visibleai.com
- **Packaging**: WAR (deployed to Tomcat 9)

## Project Structure

```
f941-efile/
├── backend/                     # Spring Boot application
│   ├── pom.xml                  # Maven dependencies
│   └── src/main/java/com/f941efile/
│       ├── config/              # Security, CORS, app config
│       ├── controller/          # REST controllers
│       ├── dto/                 # Request/Response DTOs
│       ├── entity/              # JPA entities
│       ├── exception/           # Exception handling
│       ├── repository/          # Spring Data repositories
│       ├── security/            # JWT auth, UserPrincipal
│       ├── service/             # Business logic
│       │   ├── impl/            # Service implementations
│       │   ├── ai/              # Spring AI features
│       │   ├── mef/             # IRS MeF A2A integration
│       │   ├── payment/         # Stripe integration
│       │   └── notification/    # Email notifications
│       └── util/                # Encryption, helpers
├── frontend/                    # React SPA
│   └── src/
│       ├── components/          # React components
│       ├── pages/               # Route pages
│       ├── services/            # API client
│       ├── store/               # Zustand state
│       └── types/               # TypeScript types
└── docs/                        # IRS Publications (4163, 4164, 3112, 1474)
```

## Development

### Backend
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api` requests to `http://localhost:8080`.

## Key Rules

1. **Security First**: All EIN/SSN/TIN data must be encrypted with AES-256-GCM via `EncryptionUtil`. Never log or expose PII in plain text.
2. **IRS Compliance**: Follow IRS Publication 4557 for safeguarding taxpayer data. Follow Publication 4163 and 4164 for MeF specifications.
3. **MeF XML Generation**: Transmissions use XML (UTF-8, no BOM). Max 100MB per transmission. Use IRS XML Schema definitions for Form 941 family.
4. **Auth Flow**: JWT-based authentication with BCrypt password hashing (strength 12). Access tokens expire in 1 hour, refresh tokens in 7 days.
5. **API Prefix**: All backend endpoints are under `/api` context path.
6. **Database**: Use JPA entities with Lombok. Migrations in `db/migration/`. Dev profile uses H2 with `create-drop`.
7. **Notifications**: All email notifications are async (`@Async`). Use Thymeleaf templates in `templates/email/`.

## IRS MeF A2A Key Details

- **Transmission**: Via MeF A2A channel using SOAP/XML
- **Auth**: Strong authentication with SSL client certificates via e-Services
- **EFIN/ETIN**: Required identifiers for transmitters and originators
- **Form 941 Fields**: Federal income tax withheld, Social Security wages/tax, Medicare wages/tax, Additional Medicare Tax
- **Tax Period**: Quarterly (Q1=03, Q2=06, Q3=09, Q4=12)
- **Signature Methods**: Practitioner PIN (Form 8879-EMP), Scanned Form 8453-EMP, Reporting Agent PIN (Form 8655), 94x Online PIN
- **Amended Returns**: Filed via Form 941-X
- **Test environment**: Use MeF ATS (Assurance Testing System)
- **Schemas**: Available via IRS e-Services Secure Object Repository (SOR)

## Form 941 Specific Data

### Part 1 - Quarterly Tax Computation
- Line 1: Number of employees who received wages
- Line 2: Wages, tips, and other compensation
- Line 3: Federal income tax withheld
- Line 5a: Taxable Social Security wages (rate: 12.4% combined)
- Line 5b: Taxable Social Security tips
- Line 5c: Taxable Medicare wages & tips (rate: 2.9% combined)
- Line 5d: Taxable wages & tips subject to Additional Medicare Tax (rate: 0.9%)
- Line 6: Total taxes before adjustments
- Line 7-9: Tax adjustments
- Line 10: Total taxes after adjustments
- Line 11: Qualified small business payroll tax credit
- Line 12: Total taxes after adjustments and credits

### Part 2 - Deposit Schedule
- Monthly depositor: Report tax liability for each month
- Semi-weekly depositor: Attach Schedule B (Form 941)

### Part 3 - Business Information
- Business closure, seasonal employer status
- Third-party designee information

### Part 4 - Signature
- Sign and date

## Git Workflow

- `master` branch for production
- Feature branches for development
- Commit messages: conventional commits format
