package com.example.LibraryApp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    @GetMapping("/main")
    public List<Category> getMainCategories() {
        return categoryRepository.findByParentCategoryIsNull();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/subcategories")
    public List<Category> getSubcategories(@PathVariable Long id) {
        return categoryRepository.findByParentCategoryId(id);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Category createCategory(@Valid @RequestBody Category category) {
        return categoryRepository.save(category);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @Valid @RequestBody Category categoryDetails) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setName(categoryDetails.getName());
                    category.setDescription(categoryDetails.getDescription());
                    category.setParentCategory(categoryDetails.getParentCategory());
                    return ResponseEntity.ok(categoryRepository.save(category));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    categoryRepository.delete(category);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 