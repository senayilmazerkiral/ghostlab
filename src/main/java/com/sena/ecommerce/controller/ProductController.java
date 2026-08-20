package com.sena.ecommerce.controller;

import com.sena.ecommerce.dto.ProductRequest;
import com.sena.ecommerce.entity.Category;
import com.sena.ecommerce.entity.Product;
import com.sena.ecommerce.repository.CategoryRepository;
import com.sena.ecommerce.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sena.ecommerce.specification.ProductSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.sena.ecommerce.exception.ResourceNotFoundException;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductController(ProductRepository productRepository,
                             CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody @Valid ProductRequest request) {

        if (request.getCategoryId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Long categoryId = request.getCategoryId();

        Category category = categoryRepository.findById(categoryId)
                .orElse(null);

        if (category == null) {
            return ResponseEntity.badRequest().build();
        }

        Product product = new Product();

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);

        return ResponseEntity.ok(
                productRepository.save(product)
        );
    }

    @GetMapping
    public Page<Product> getAllProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection =
                direction.equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, sortBy)
        );

        Specification<Product> specification = null;

        if (name != null && !name.isBlank()) {
            specification = ProductSpecification.hasName(name);
        }

        if (categoryId != null) {
            Specification<Product> categorySpec =
                    ProductSpecification.hasCategoryId(categoryId);

            specification = specification == null
                    ? categorySpec
                    : specification.and(categorySpec);
        }

        if (minPrice != null) {
            Specification<Product> minPriceSpec =
                    ProductSpecification.priceGreaterThanOrEqual(minPrice);

            specification = specification == null
                    ? minPriceSpec
                    : specification.and(minPriceSpec);
        }

        if (maxPrice != null) {
            Specification<Product> maxPriceSpec =
                    ProductSpecification.priceLessThanOrEqual(maxPrice);

            specification = specification == null
                    ? maxPriceSpec
                    : specification.and(maxPriceSpec);
        }

        if (specification == null) {
            return productRepository.findAll(pageable);
        }

        return productRepository.findAll(specification, pageable);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ürün bulunamadı: " + id
                        )
                );

        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody @Valid ProductRequest request) {

        return productRepository.findById(id)
                .map(existingProduct -> {

                    existingProduct.setName(request.getName());
                    existingProduct.setPrice(request.getPrice());
                    existingProduct.setStock(request.getStock());

                    if (request.getCategoryId() != null) {

                        Category category = categoryRepository
                                .findById(request.getCategoryId())
                                .orElse(null);

                        if (category == null) {
                            return ResponseEntity.badRequest()
                                    .<Product>build();
                        }

                        existingProduct.setCategory(category);
                    }

                    return ResponseEntity.ok(
                            productRepository.save(existingProduct)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        productRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}