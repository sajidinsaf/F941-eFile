package com.f941efile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalFilings;
    private long draftFilings;
    private long submittedFilings;
    private long acceptedFilings;
    private long rejectedFilings;
    private BigDecimal totalTaxReported;
    private List<FilingResponse> recentFilings;
}
