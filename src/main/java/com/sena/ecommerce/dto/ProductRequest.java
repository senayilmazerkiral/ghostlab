package com.sena.ecommerce.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ProductRequest {
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    @NotBlank(message = "Ürün adı boş bırakılamaz.")
    private String name;

    @DecimalMin(value = "0.0", inclusive = false,
            message = "Fiyat 0'dan büyük olmalıdır.")
    private double price;

    @Min(value = 0,
            message = "Stok 0 veya daha büyük olmalıdır.")
    private int stock;

    private Long categoryId;
}
