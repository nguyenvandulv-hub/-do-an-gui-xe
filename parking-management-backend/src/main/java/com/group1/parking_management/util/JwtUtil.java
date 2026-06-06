package com.group1.parking_management.util;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.group1.parking_management.exception.AppException;
import com.group1.parking_management.exception.ErrorCode;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtil {
    @Value("${spring.security.oauth2.resourceserver.jwt.secret-key}")
    private String secretKey;

    @Value("${spring.security.oauth2.resourceserver.jwt.valid-duration}")
    private long validDuration;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    public String generateToken(String username, String role) {

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .issuer(issuerUri)
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(validDuration, ChronoUnit.SECONDS).toEpochMilli()))
                .claim("scope", role)
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(secretKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new AppException(ErrorCode.JWT_GENERATION_ERROR);
        }
    }

    public boolean validateToken(String token) throws ParseException, JOSEException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secretKey.getBytes());
            boolean verified = signedJWT.verify(verifier);
            if (!verified) {
                log.warn("JWT signature verification failed");
                throw new AppException(ErrorCode.AUTH_UNAUTHENTICATED);
            }
            Date expireTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (!(verified && expireTime.after(new Date()))) {
                throw new AppException(ErrorCode.AUTH_UNAUTHENTICATED);
            }
            String issuer = signedJWT.getJWTClaimsSet().getIssuer();
            if (!issuerUri.equals(issuer)) {
                log.warn("JWT issuer invalid: {}", issuer);
                throw new AppException(ErrorCode.AUTH_UNAUTHENTICATED);
            }
            return true;
        } catch (ParseException e) {
            log.error("JWT parsing failed: {}", e.getMessage());
            throw new AppException(ErrorCode.JWT_INVALID);
        } catch (JOSEException e) {
            log.error("JWT verification error: {}", e.getMessage());
            throw new AppException(ErrorCode.AUTH_UNAUTHENTICATED);
        } catch (Exception e) {
            log.error("Unexpected JWT validation error: {}", e.getMessage());
            throw new AppException(ErrorCode.AUTH_UNAUTHENTICATED);
        }
    }

    public String getRole(String token) throws ParseException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return (String) signedJWT.getJWTClaimsSet().getClaim("scope");
        } catch (ParseException e) {
            log.error("Failed to parse JWT when extracting role: {}", e.getMessage());
            throw new AppException(ErrorCode.JWT_INVALID);
        }
    }

    public long getExpirationTime(String token) throws ParseException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expirationTime == null) {
                throw new AppException(ErrorCode.JWT_INVALID);
            }
            return expirationTime.getTime();
        } catch (ParseException e) {
            log.error("Failed to parse JWT when getting expiration time: {}", e.getMessage());
            throw new AppException(ErrorCode.JWT_INVALID);
        }
    }
}
