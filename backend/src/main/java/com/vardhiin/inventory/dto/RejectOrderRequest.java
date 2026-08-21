package com.vardhiin.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectOrderRequest {
    @NotBlank
    private String note;
}
