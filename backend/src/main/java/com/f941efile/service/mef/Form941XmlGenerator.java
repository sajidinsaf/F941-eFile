package com.f941efile.service.mef;

import com.f941efile.entity.BusinessProfile;
import com.f941efile.entity.Filing;
import com.f941efile.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import java.io.StringWriter;
import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class Form941XmlGenerator {

    private static final String IRS_NAMESPACE = "http://www.irs.gov/efile";

    private final EncryptionUtil encryptionUtil;

    public String generateXml(Filing filing, BusinessProfile profile) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.newDocument();

            Element root = doc.createElementNS(IRS_NAMESPACE, "Return");
            root.setAttribute("xmlns", IRS_NAMESPACE);
            root.setAttribute("returnVersion", "2024v1.0");
            doc.appendChild(root);

            Element returnHeader = doc.createElementNS(IRS_NAMESPACE, "ReturnHeader");
            root.appendChild(returnHeader);

            appendElement(doc, returnHeader, "ReturnTs", java.time.Instant.now().toString());
            appendElement(doc, returnHeader, "TaxYr", String.valueOf(filing.getTaxYear()));
            appendElement(doc, returnHeader, "TaxPeriodBeginDt", getTaxPeriodBeginDate(filing));
            appendElement(doc, returnHeader, "TaxPeriodEndDt", getTaxPeriodEndDate(filing));
            appendElement(doc, returnHeader, "ReturnTypeCd", "941");

            Element filer = doc.createElementNS(IRS_NAMESPACE, "Filer");
            returnHeader.appendChild(filer);

            String decryptedEin = encryptionUtil.decrypt(profile.getEin());
            appendElement(doc, filer, "EIN", decryptedEin);

            Element businessName = doc.createElementNS(IRS_NAMESPACE, "BusinessName");
            filer.appendChild(businessName);
            appendElement(doc, businessName, "BusinessNameLine1Txt", profile.getBusinessName());
            if (profile.getTradeName() != null && !profile.getTradeName().isBlank()) {
                appendElement(doc, businessName, "BusinessNameLine2Txt", profile.getTradeName());
            }

            Element address = doc.createElementNS(IRS_NAMESPACE, "USAddress");
            filer.appendChild(address);
            appendElement(doc, address, "AddressLine1Txt", profile.getAddress());
            appendElement(doc, address, "CityNm", profile.getCity());
            appendElement(doc, address, "StateAbbreviationCd", profile.getState());
            appendElement(doc, address, "ZIPCd", profile.getZipCode());

            Element returnData = doc.createElementNS(IRS_NAMESPACE, "ReturnData");
            root.appendChild(returnData);

            Element irs941 = doc.createElementNS(IRS_NAMESPACE, "IRS941");
            returnData.appendChild(irs941);

            appendElement(doc, irs941, "EmployeeCnt", String.valueOf(safeInt(filing.getNumberOfEmployees())));
            appendElement(doc, irs941, "WagesAmt", formatAmount(filing.getWagesTipsCompensation()));
            appendElement(doc, irs941, "FederalIncomeTaxWithheldAmt", formatAmount(filing.getFederalIncomeTaxWithheld()));
            appendElement(doc, irs941, "TxblSocSecWagesAmt", formatAmount(filing.getSocialSecurityWages()));
            appendElement(doc, irs941, "TxblSocSecTaxAmt", formatAmount(filing.getSocialSecurityTax()));
            appendElement(doc, irs941, "TxblSocSecTipsAmt", formatAmount(filing.getSocialSecurityTips()));
            appendElement(doc, irs941, "TaxOnSocSecTipsAmt", formatAmount(filing.getSocialSecurityTipsTax()));
            appendElement(doc, irs941, "TxblMedWagesAndTipsAmt", formatAmount(filing.getMedicareWages()));
            appendElement(doc, irs941, "TaxOnMedWagesAndTipsAmt", formatAmount(filing.getMedicareTax()));
            appendElement(doc, irs941, "TxblAddlMedWagesAndTipsAmt", formatAmount(filing.getAdditionalMedicareWages()));
            appendElement(doc, irs941, "TaxOnAddlMedWagesAmt", formatAmount(filing.getAdditionalMedicareTax()));
            appendElement(doc, irs941, "TotalTaxBeforeAdjustmentAmt", formatAmount(filing.getTotalTaxBeforeAdjustments()));
            appendElement(doc, irs941, "CurrentQtrFractionsCentsAmt", formatAmount(filing.getAdjustmentFractions()));
            appendElement(doc, irs941, "CurrentQuarterSickPaymentAmt", formatAmount(filing.getAdjustmentSickPay()));
            appendElement(doc, irs941, "CurrQtrTipGrpTermLifeInsAdjAmt", formatAmount(filing.getAdjustmentTips()));
            appendElement(doc, irs941, "TotalTaxAfterAdjustmentAmt", formatAmount(filing.getTotalTaxAfterAdjustments()));
            appendElement(doc, irs941, "TotalTaxAfterCreditAmt", formatAmount(filing.getTotalTaxAfterCredits()));
            appendElement(doc, irs941, "TotalTaxDepositAmt", formatAmount(filing.getTotalDeposits()));
            appendElement(doc, irs941, "BalanceDueAmt", formatAmount(filing.getBalanceDue()));
            appendElement(doc, irs941, "OverpaymentAmt", formatAmount(filing.getOverpayment()));

            if (filing.getDepositScheduleType() == Filing.DepositScheduleType.MONTHLY) {
                Element monthlyDeposit = doc.createElementNS(IRS_NAMESPACE, "MonthlyDepositorGrp");
                irs941.appendChild(monthlyDeposit);
                appendElement(doc, monthlyDeposit, "TaxLiabilityMonth1Amt", formatAmount(filing.getMonth1Liability()));
                appendElement(doc, monthlyDeposit, "TaxLiabilityMonth2Amt", formatAmount(filing.getMonth2Liability()));
                appendElement(doc, monthlyDeposit, "TaxLiabilityMonth3Amt", formatAmount(filing.getMonth3Liability()));
                BigDecimal total = safeBigDecimal(filing.getMonth1Liability())
                        .add(safeBigDecimal(filing.getMonth2Liability()))
                        .add(safeBigDecimal(filing.getMonth3Liability()));
                appendElement(doc, monthlyDeposit, "TotalQuarterlyTaxLiabilityAmt", formatAmount(total));
            }

            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(doc), new StreamResult(writer));

            return writer.toString();

        } catch (Exception e) {
            log.error("Error generating Form 941 XML", e);
            throw new RuntimeException("Failed to generate Form 941 XML", e);
        }
    }

    private void appendElement(Document doc, Element parent, String name, String value) {
        Element element = doc.createElementNS(IRS_NAMESPACE, name);
        element.setTextContent(value != null ? value : "0");
        parent.appendChild(element);
    }

    private String formatAmount(BigDecimal amount) {
        return amount != null ? amount.toPlainString() : "0.00";
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }

    private BigDecimal safeBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String getTaxPeriodBeginDate(Filing filing) {
        int month = (filing.getQuarter() - 1) * 3 + 1;
        return String.format("%d-%02d-01", filing.getTaxYear(), month);
    }

    private String getTaxPeriodEndDate(Filing filing) {
        int month = filing.getQuarter() * 3;
        int day = switch (month) {
            case 3, 12 -> 31;
            case 6, 9 -> 30;
            default -> 30;
        };
        return String.format("%d-%02d-%02d", filing.getTaxYear(), month, day);
    }
}
