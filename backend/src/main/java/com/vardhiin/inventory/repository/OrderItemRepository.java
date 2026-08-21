package com.vardhiin.inventory.repository;

import com.vardhiin.inventory.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
