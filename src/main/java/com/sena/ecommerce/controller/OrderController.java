package com.sena.ecommerce.controller;

import com.sena.ecommerce.dto.OrderItemRequest;
import com.sena.ecommerce.dto.OrderRequest;
import com.sena.ecommerce.entity.Order;
import com.sena.ecommerce.entity.OrderItem;
import com.sena.ecommerce.entity.OrderStatus;
import com.sena.ecommerce.entity.Product;
import com.sena.ecommerce.entity.User;
import com.sena.ecommerce.repository.OrderRepository;
import com.sena.ecommerce.repository.ProductRepository;
import com.sena.ecommerce.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderController(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // SİPARİŞ OLUŞTUR
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createOrder(
            Authentication authentication,
            @Valid @RequestBody OrderRequest request) {

        // JWT'den giriş yapan kullanıcının email adresini al
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body("Kullanıcı bulunamadı.");
        }

        Order order = new Order();

        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);

        double totalPrice = 0;

        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemRequest : request.getItems()) {

            Product product = productRepository
                    .findById(itemRequest.getProductId())
                    .orElse(null);

            if (product == null) {
                return ResponseEntity.badRequest().body(
                        "Ürün bulunamadı: "
                                + itemRequest.getProductId()
                );
            }

            if (itemRequest.getQuantity() <= 0) {
                return ResponseEntity.badRequest().body(
                        "Ürün miktarı 0'dan büyük olmalıdır."
                );
            }

            if (product.getStock() < itemRequest.getQuantity()) {
                return ResponseEntity.badRequest().body(
                        "Yetersiz stok: " + product.getName()
                );
            }

            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setOrder(order);

            orderItems.add(orderItem);

            totalPrice +=
                    product.getPrice()
                            * itemRequest.getQuantity();

            // Stoktan düş
            product.setStock(
                    product.getStock()
                            - itemRequest.getQuantity()
            );

            productRepository.save(product);
        }

        order.setItems(orderItems);
        order.setTotalPrice(totalPrice);

        Order savedOrder = orderRepository.save(order);

        return ResponseEntity.ok(savedOrder);
    }


    // =========================================================
    // TÜM SİPARİŞLER
    // SADECE ADMIN
    // =========================================================

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }


    // =========================================================
    // TEK SİPARİŞ
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body("Kullanıcı bulunamadı.");
        }

        Order order = orderRepository.findById(id)
                .orElse(null);

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        // ADMIN her siparişi görebilir
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(order);
        }

        // USER sadece kendi siparişini görebilir
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403)
                    .body("Bu siparişi görüntüleme yetkiniz yok.");
        }

        return ResponseEntity.ok(order);
    }


    // =========================================================
    // KULLANICININ KENDİ SİPARİŞLERİ
    // =========================================================

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body("Kullanıcı bulunamadı.");
        }

        return ResponseEntity.ok(
                orderRepository.findByUser(user)
        );
    }


    // =========================================================
    // SİPARİŞ DURUMUNU DEĞİŞTİR
    // SADECE ADMIN
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        Order order = orderRepository.findById(id)
                .orElse(null);

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        // CONFIRMED -> CANCELLED yasak
        if (order.getStatus() == OrderStatus.CONFIRMED
                && status == OrderStatus.CANCELLED) {

            return ResponseEntity.badRequest()
                    .body("CONFIRMED sipariş iptal edilemez.");
        }

        // CANCELLED sipariş tekrar değiştirilemez
        if (order.getStatus() == OrderStatus.CANCELLED) {

            return ResponseEntity.badRequest()
                    .body(
                            "İptal edilmiş siparişin durumu değiştirilemez."
                    );
        }

        // PENDING -> CANCELLED
        // Ürünleri tekrar stoğa ekle
        if (status == OrderStatus.CANCELLED
                && order.getStatus() == OrderStatus.PENDING) {

            for (OrderItem item : order.getItems()) {

                Product product = item.getProduct();

                product.setStock(
                        product.getStock()
                                + item.getQuantity()
                );

                productRepository.save(product);
            }
        }

        order.setStatus(status);

        return ResponseEntity.ok(
                orderRepository.save(order)
        );
    }
}