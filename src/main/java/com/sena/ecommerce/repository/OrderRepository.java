package com.sena.ecommerce.repository;

import com.sena.ecommerce.entity.Order;
import com.sena.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);
}