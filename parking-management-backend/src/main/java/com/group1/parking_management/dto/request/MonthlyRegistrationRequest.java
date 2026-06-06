package com.group1.parking_management.dto.request;

import java.time.LocalDate;

import org.springframework.util.StringUtils;

import com.group1.parking_management.common.CustomerType;
import com.group1.parking_management.common.Gender;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyRegistrationRequest {
    @NotNull
    private Integer durationInMonths;

    @NotNull
    private CustomerType customerType;

    @NotBlank
    private String name;

    @NotNull
    private Gender gender;

    @NotNull
    private LocalDate dob;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String address;

    @NotBlank
    @Email(message = "AUTH_EMAIL_INVALID")
    private String email;

    private String lecturerId;

    private String studentId;
    private String faculty;
    private String major;
    private String classInfo;

    @NotBlank
    private String licensePlate;

    @NotNull
    private String vehicleTypeId;

    @NotBlank
    private String brand;

    @NotBlank
    private String color;

    @AssertTrue(message = "LECTURER_INPUT_ERROR")
    private boolean isValidLecturer() {
        if (customerType != null && customerType == CustomerType.LECTURER) {
            return StringUtils.hasText(lecturerId) &&
                   !StringUtils.hasText(studentId) &&
                   !StringUtils.hasText(faculty) &&
                   !StringUtils.hasText(major) &&
                   !StringUtils.hasText(classInfo);
        }
        return true;
    }

    @AssertTrue(message = "STUDENT_INPUT_ERROR")
    private boolean isValidStudent() {
        if (customerType != null && customerType == CustomerType.STUDENT) {
            return StringUtils.hasText(studentId) &&
                   StringUtils.hasText(faculty) &&
                   StringUtils.hasText(major) &&
                   StringUtils.hasText(classInfo) &&
                   !StringUtils.hasText(lecturerId);
        }
        return true;
    }
}
