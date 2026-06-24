package com.group1.parking_management.dto.request;

import java.time.LocalDate;
import com.group1.parking_management.common.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterStaffRequest {
    @NotBlank
    @Size(min = 4, message = "AUTH_USERNAME_INVALID")
    private String username;

    @NotBlank
    @Size(min = 6, message = "AUTH_PASSWORD_INVALID")
    private String password;

    @NotBlank(message = "Identification is required")
    private String identification;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Date of birth is required")
    private LocalDate dob;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Email is required")
    @Email(message = "Email is invalid")
    private String email;

    @NotBlank(message = "OTP is required")
    private String otp;
}
