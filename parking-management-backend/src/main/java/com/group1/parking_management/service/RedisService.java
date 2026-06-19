package com.group1.parking_management.service;

import java.util.concurrent.TimeUnit;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate redisTemplate;

    public void addToBlacklist(String token, long expirationTime) {
        try {
            redisTemplate.opsForValue().set(token, "Blacklisted", expirationTime, TimeUnit.SECONDS);
        } catch (Exception e) {
            // Ignore Redis errors
        }
    }

    public boolean isTokenBacklisted(String token) {
        if (token == null) return false;
        try {
            Boolean result = redisTemplate.hasKey(token);
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            // Ignore Redis connection errors and assume token is valid
            return false;
        }
    }
}
