package com.f941efile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessProfileResponse {

    private Long id;
    private String maskedEin;
    private String businessName;
    private String tradeName;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String phone;
    private String efin;
    private String etin;
    private String contactName;
    private String contactPhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
