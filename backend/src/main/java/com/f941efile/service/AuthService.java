package com.f941efile.service;

import com.f941efile.dto.request.LoginRequest;
import com.f941efile.dto.request.RegisterRequest;
import com.f941efile.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);

    void verifyEmail(String token);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);
}
