package com.f941efile.service.notification;

import com.f941efile.entity.Filing;
import com.f941efile.entity.Notification;
import com.f941efile.entity.User;
import com.f941efile.repository.NotificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService implements NotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final NotificationRepository notificationRepository;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@f941efile.com}")
    private String fromEmail;

    @Value("${app.name:F941 eFile}")
    private String appName;

    @Override
    @Async
    public void sendVerificationEmail(User user, String verificationToken) {
        String subject = "Verify your email - " + appName;
        String verificationLink = frontendUrl + "/verify-email?token=" + verificationToken;

        Context context = new Context();
        context.setVariable("userName", user.getFirstName());
        context.setVariable("verificationLink", verificationLink);
        context.setVariable("appName", appName);

        String body = templateEngine.process("email/verification", context);

        Notification notification = Notification.builder()
                .user(user)
                .type("EMAIL_VERIFICATION")
                .subject(subject)
                .body(body)
                .status(Notification.NotificationStatus.PENDING)
                .build();

        sendEmail(user.getEmail(), subject, body, notification);
    }

    @Override
    @Async
    public void sendPasswordResetEmail(User user, String resetToken) {
        String subject = "Reset your password - " + appName;
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        Context context = new Context();
        context.setVariable("userName", user.getFirstName());
        context.setVariable("resetLink", resetLink);
        context.setVariable("appName", appName);

        String body = templateEngine.process("email/password-reset", context);

        Notification notification = Notification.builder()
                .user(user)
                .type("PASSWORD_RESET")
                .subject(subject)
                .body(body)
                .status(Notification.NotificationStatus.PENDING)
                .build();

        sendEmail(user.getEmail(), subject, body, notification);
    }

    @Override
    @Async
    public void sendFilingStatusEmail(User user, Filing filing, String status, String message) {
        String subject = "Filing Status Update - Form 941 Q" + filing.getQuarter() + " " + filing.getTaxYear();

        Context context = new Context();
        context.setVariable("userName", user.getFirstName());
        context.setVariable("status", status);
        context.setVariable("message", message);
        context.setVariable("taxYear", filing.getTaxYear());
        context.setVariable("quarter", filing.getQuarter());
        context.setVariable("submissionId", filing.getSubmissionId());
        context.setVariable("appName", appName);
        context.setVariable("dashboardLink", frontendUrl + "/dashboard");

        String body = templateEngine.process("email/filing-status", context);

        Notification notification = Notification.builder()
                .user(user)
                .type("FILING_STATUS")
                .subject(subject)
                .body(body)
                .status(Notification.NotificationStatus.PENDING)
                .build();

        sendEmail(user.getEmail(), subject, body, notification);
    }

    private void sendEmail(String to, String subject, String htmlBody, Notification notification) {
        try {
            notification = notificationRepository.save(notification);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);

            notification.setStatus(Notification.NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);

            log.info("Email sent to: {} subject: {}", to, subject);

        } catch (MessagingException e) {
            log.error("Failed to send email to: {} subject: {}", to, subject, e);
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notificationRepository.save(notification);
        }
    }
}
