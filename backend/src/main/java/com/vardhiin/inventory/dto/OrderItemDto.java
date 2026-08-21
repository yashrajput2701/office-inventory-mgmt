package com.vardhiin.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemDto {
    private Long id; // null when creating

    @NotBlank
    private String itemName;

    @Min(1)
    private Integer quantity;
}
