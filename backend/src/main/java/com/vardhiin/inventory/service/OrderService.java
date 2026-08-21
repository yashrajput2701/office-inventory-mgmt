package com.vardhiin.inventory.service;

import com.vardhiin.inventory.dto.*;
import com.vardhiin.inventory.entity.Order;
import com.vardhiin.inventory.entity.OrderItem;
import com.vardhiin.inventory.entity.User;
import com.vardhiin.inventory.enums.OrderStatus;
import com.vardhiin.inventory.exception.ApiException;
import com.vardhiin.inventory.repository.OrderRepository;
import com.vardhiin.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // Orders in these statuses "occupy" an item-set combination.
    private static final List<OrderStatus> ACTIVE_STATUSES = List.of(OrderStatus.SUBMITTED, OrderStatus.COMPLETED);

    // ---------- Helpers ----------

    private User currentUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Order getOrderOr404(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found: " + id));
    }

    /** Deterministic fingerprint of item names (sorted, lower-cased, qty-independent). */
    private String computeItemSetHash(List<OrderItemDto> items) {
        String combined = items.stream()
                .map(i -> i.getItemName().trim().toLowerCase())
                .distinct()
                .sorted()
                .collect(Collectors.joining("|"));
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(combined.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ---------- Queries ----------

    @Transactional(readOnly = true)
    public List<OrderResponse> listForCurrentUser(Authentication auth) {
        User user = currentUser(auth);
        List<Order> orders = switch (user.getRole()) {
            // Creator sees only their own orders (all statuses, including drafts).
            case CREATOR -> orderRepository.findByCreatedById(user.getId());
            // Purchaser sees everything that has left DRAFT state (their queue + history).
            case PURCHASER -> orderRepository.findByStatusIn(
                    List.of(OrderStatus.SUBMITTED, OrderStatus.COMPLETED, OrderStatus.REJECTED));
        };
        return orders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOne(Long id, Authentication auth) {
        Order order = getOrderOr404(id);
        User user = currentUser(auth);

        // A creator may only view their own orders; a purchaser may view anything non-draft.
        boolean isOwner = order.getCreatedBy().getId().equals(user.getId());
        boolean purchaserCanSee = user.getRole().name().equals("PURCHASER") && order.getStatus() != OrderStatus.DRAFT;

        if (!isOwner && !purchaserCanSee) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this order");
        }
        return new OrderResponse(order);
    }

    // ---------- Creator actions ----------

    @Transactional
    public OrderResponse createDraft(OrderRequest request, Authentication auth) {
        User user = currentUser(auth);

        Order order = new Order();
        order.setCreatedBy(user);
        order.setStatus(OrderStatus.DRAFT);
        order.setExpiryDate(request.getExpiryDate());
        applyItems(order, request.getItems());

        return new OrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateDraft(Long id, OrderRequest request, Authentication auth) {
        Order order = getOrderOr404(id);
        User user = currentUser(auth);

        if (!order.getCreatedBy().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the creator can edit this order");
        }
        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new ApiException(HttpStatus.CONFLICT, "Only DRAFT orders can be edited");
        }

        order.setExpiryDate(request.getExpiryDate());
        applyItems(order, request.getItems());

        return new OrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse submit(Long id, Authentication auth) {
        Order order = getOrderOr404(id);
        User user = currentUser(auth);

        if (!order.getCreatedBy().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the creator can submit this order");
        }
        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new ApiException(HttpStatus.CONFLICT, "Only DRAFT orders can be submitted");
        }
        if (order.getItems().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot submit an order with no items");
        }

        String hash = computeItemSetHash(order.getItems().stream().map(i -> {
            OrderItemDto d = new OrderItemDto();
            d.setItemName(i.getItemName());
            d.setQuantity(i.getQuantity());
            return d;
        }).collect(Collectors.toList()));

        if (orderRepository.existsByItemSetHashAndStatusInAndIdNot(hash, ACTIVE_STATUSES, order.getId())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Another active order already contains this exact set of items");
        }

        order.setItemSetHash(hash);
        order.setStatus(OrderStatus.SUBMITTED);
        order.setSubmittedAt(LocalDateTime.now());

        return new OrderResponse(orderRepository.save(order));
    }

    private void applyItems(Order order, List<OrderItemDto> itemDtos) {
        order.getItems().clear();
        for (OrderItemDto dto : itemDtos) {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setItemName(dto.getItemName().trim());
            item.setQuantity(dto.getQuantity());
            order.getItems().add(item);
        }
    }

    // ---------- Purchaser actions ----------

    @Transactional
    public OrderResponse complete(Long id, CompleteOrderRequest request, Authentication auth) {
        Order order = getOrderOr404(id);
        requirePurchaser(auth);

        if (order.getStatus() != OrderStatus.SUBMITTED) {
            throw new ApiException(HttpStatus.CONFLICT, "Only SUBMITTED orders can be completed");
        }

        order.setStatus(OrderStatus.COMPLETED);
        order.setTxnReference(request.getTxnReference());
        order.setResolvedBy(currentUser(auth));
        order.setResolvedAt(LocalDateTime.now());

        return new OrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse reject(Long id, RejectOrderRequest request, Authentication auth) {
        Order order = getOrderOr404(id);
        requirePurchaser(auth);

        if (order.getStatus() != OrderStatus.SUBMITTED) {
            throw new ApiException(HttpStatus.CONFLICT, "Only SUBMITTED orders can be rejected");
        }

        order.setStatus(OrderStatus.REJECTED);
        order.setPurchaserNote(request.getNote());
        order.setResolvedBy(currentUser(auth));
        order.setResolvedAt(LocalDateTime.now());
        // Free up the item-set combination now that this order is no longer active.
        order.setItemSetHash(null);

        return new OrderResponse(orderRepository.save(order));
    }

    private void requirePurchaser(Authentication auth) {
        User user = currentUser(auth);
        if (user.getRole() != com.vardhiin.inventory.enums.Role.PURCHASER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only a purchaser can perform this action");
        }
    }
}
