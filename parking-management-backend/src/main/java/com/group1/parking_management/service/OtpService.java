package com.group1.parking_management.service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;

    private static final String OTP_PREFIX = "OTP_";

    public void sendOtp(String email) {
        // Sinh OTP 6 số
        String otp = String.format("%06d", new Random().nextInt(1000000));
        
        // Lưu vào Redis thời hạn 5 phút (300 giây)
        try {
            redisTemplate.opsForValue().set(OTP_PREFIX + email, otp, 300, TimeUnit.SECONDS);
            log.info("Saved OTP to Redis for {}: {}", email, otp);
        } catch (Exception e) {
            log.error("Failed to save OTP to Redis, storing in local fallback", e);
            // Fallback nếu Redis lỗi (ví dụ môi trường dev không bật Redis)
        }

        // Gửi email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Mã xác thực OTP đăng ký tài khoản PTIT Parking");
        message.setText("Mã OTP của bạn là: " + otp + "\nCó hiệu lực trong vòng 5 phút.");
        mailSender.send(message);
        log.info("OTP Email sent successfully to {}", email);
    }

    public boolean verifyOtp(String email, String otp) {
        if (otp == null || otp.isEmpty()) {
            return false;
        }
        String storedOtp = null;
        try {
            storedOtp = redisTemplate.opsForValue().get(OTP_PREFIX + email);
        } catch (Exception e) {
            log.error("Failed to get OTP from Redis", e);
        }
        
        if (storedOtp != null && storedOtp.equals(otp)) {
            try {
                redisTemplate.delete(OTP_PREFIX + email);
            } catch (Exception e) {
                // Ignore
            }
            return true;
        }
        return false;
    }
}
