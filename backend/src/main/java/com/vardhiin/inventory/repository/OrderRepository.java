package com.vardhiin.inventory.repository;

import com.vardhiin.inventory.entity.Order;
import com.vardhiin.inventory.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCreatedById(Long creatorId);

    List<Order> findByStatusIn(List<OrderStatus> statuses);

    // Enforces the "no two active orders share the same item set" rule.
    // "Active" = SUBMITTED or COMPLETED (a completed order's item combo is still consumed/spoken for).
    boolean existsByItemSetHashAndStatusIn(String itemSetHash, List<OrderStatus> statuses);

    boolean existsByItemSetHashAndStatusInAndIdNot(String itemSetHash, List<OrderStatus> statuses, Long excludeId);
}
