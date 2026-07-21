package com.f941efile.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessProfileRequest {

    @NotBlank(message = "EIN is required")
    @Size(min = 9, max = 10, message = "EIN must be 9 digits")
    private String ein;

    @NotBlank(message = "Business name is required")
    @Size(max = 255, message = "Business name must be at most 255 characters")
    private String businessName;

    @Size(max = 255, message = "Trade name must be at most 255 characters")
    private String tradeName;

    private String address;
    private String city;

    @Size(max = 2, message = "State must be a 2-letter code")
    private String state;

    @Size(max = 10, message = "Zip code must be at most 10 characters")
    private String zipCode;

    private String phone;
    private String efin;
    private String etin;
    private String contactName;
    private String contactPhone;
}
