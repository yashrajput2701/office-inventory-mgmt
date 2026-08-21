package com.vardhiin.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteOrderRequest {
    @NotBlank
    private String txnReference;
}
