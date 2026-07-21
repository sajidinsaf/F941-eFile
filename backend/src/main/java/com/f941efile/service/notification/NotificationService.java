package com.f941efile.service.notification;

import com.f941efile.entity.Filing;
import com.f941efile.entity.User;

public interface NotificationService {

    void sendVerificationEmail(User user, String verificationToken);

    void sendPasswordResetEmail(User user, String resetToken);

    void sendFilingStatusEmail(User user, Filing filing, String status, String message);
}
