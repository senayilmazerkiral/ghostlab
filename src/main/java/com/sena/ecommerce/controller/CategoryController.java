package com.sena.ecommerce.controller;

import com.sena.ecommerce.entity.Category;
import com.sena.ecommerce.exception.ResourceNotFoundException;
import com.sena.ecommerce.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(
            @PathVariable Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Kategori bulunamadı: " + id
                        )
                );

        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category) {

        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Kategori bulunamadı: " + id
                        )
                );

        existingCategory.setName(category.getName());

        return ResponseEntity.ok(
                categoryRepository.save(existingCategory)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id) {

        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Kategori bulunamadı: " + id
            );
        }

        categoryRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}