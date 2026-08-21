package com.vardhiin.inventory.controller;

import com.vardhiin.inventory.dto.*;
import com.vardhiin.inventory.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> list(Authentication auth) {
        return ResponseEntity.ok(orderService.listForCurrentUser(auth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOne(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.getOne(id, auth));
    }

    // Creator: save as draft
    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest request, Authentication auth) {
        return ResponseEntity.ok(orderService.createDraft(request, auth));
    }

    // Creator: edit an existing draft
    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody OrderRequest request,
                                                 Authentication auth) {
        return ResponseEntity.ok(orderService.updateDraft(id, request, auth));
    }

    // Creator: lock the draft and send to purchaser queue
    @PostMapping("/{id}/submit")
    public ResponseEntity<OrderResponse> submit(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.submit(id, auth));
    }

    // Purchaser: mark complete with a txn reference
    @PostMapping("/{id}/complete")
    public ResponseEntity<OrderResponse> complete(@PathVariable Long id,
                                                   @Valid @RequestBody CompleteOrderRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(orderService.complete(id, request, auth));
    }

    // Purchaser: reject with a note
    @PostMapping("/{id}/reject")
    public ResponseEntity<OrderResponse> reject(@PathVariable Long id,
                                                 @Valid @RequestBody RejectOrderRequest request,
                                                 Authentication auth) {
        return ResponseEntity.ok(orderService.reject(id, request, auth));
    }
}
