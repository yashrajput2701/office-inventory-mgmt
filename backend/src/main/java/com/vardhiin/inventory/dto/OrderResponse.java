package com.vardhiin.inventory.dto;

import com.vardhiin.inventory.entity.Order;
import com.vardhiin.inventory.enums.OrderStatus;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class OrderResponse {
    private final Long id;
    private final OrderStatus status;
    private final LocalDate expiryDate;
    private final LocalDateTime createdAt;
    private final LocalDateTime submittedAt;
    private final LocalDateTime resolvedAt;
    private final String createdByUsername;
    private final String createdByFullName;
    private final Long createdById;
    private final String resolvedByUsername;
    private final String txnReference;
    private final String purchaserNote;
    private final List<OrderItemDto> items;

    public OrderResponse(Order o) {
        this.id = o.getId();
        this.status = o.getStatus();
        this.expiryDate = o.getExpiryDate();
        this.createdAt = o.getCreatedAt();
        this.submittedAt = o.getSubmittedAt();
        this.resolvedAt = o.getResolvedAt();
        this.createdByUsername = o.getCreatedBy().getUsername();
        this.createdByFullName = o.getCreatedBy().getFullName();
        this.createdById = o.getCreatedBy().getId();
        this.resolvedByUsername = o.getResolvedBy() != null ? o.getResolvedBy().getUsername() : null;
        this.txnReference = o.getTxnReference();
        this.purchaserNote = o.getPurchaserNote();
        this.items = o.getItems().stream().map(i -> {
            OrderItemDto dto = new OrderItemDto();
            dto.setId(i.getId());
            dto.setItemName(i.getItemName());
            dto.setQuantity(i.getQuantity());
            return dto;
        }).collect(Collectors.toList());
    }
}
