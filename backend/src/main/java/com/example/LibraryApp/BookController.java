package com.example.LibraryApp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/books")
@CrossOrigin(origins = "http://localhost:3000")
public class BookController {

    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createBook(@Valid @RequestBody BookRequest bookRequest) {
        try {
            Book book = new Book();
            book.setTitle(bookRequest.getTitle());
            book.setAuthor(bookRequest.getAuthor());
            book.setPublicationYear(bookRequest.getPublicationYear());
            book.setPageCount(bookRequest.getPageCount());
            book.setLanguage(bookRequest.getLanguage());
            book.setDescription(bookRequest.getDescription());
            
            // Set category if categoryId is provided
            if (bookRequest.getCategoryId() != null) {
                Category category = categoryRepository.findById(bookRequest.getCategoryId())
                    .orElse(null);
                if (category != null) {
                    book.setCategory(category);
                }
            }
            
            Book savedBook = bookRepository.save(book);
            return ResponseEntity.ok(savedBook);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating book: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    @GetMapping("/search")
    public List<Book> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String language) {
        return bookRepository.searchBooks(title, author, categoryId, language);
    }
    
    @GetMapping("/category/{categoryId}")
    public List<Book> getBooksByCategory(@PathVariable Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequest bookRequest) {
        return bookRepository.findById(id).map(existingBook -> {
            try {
                existingBook.setTitle(bookRequest.getTitle());
                existingBook.setAuthor(bookRequest.getAuthor());
                existingBook.setPublicationYear(bookRequest.getPublicationYear());
                existingBook.setPageCount(bookRequest.getPageCount());
                existingBook.setLanguage(bookRequest.getLanguage());
                existingBook.setDescription(bookRequest.getDescription());
                
                // Set category if categoryId is provided
                if (bookRequest.getCategoryId() != null) {
                    Category category = categoryRepository.findById(bookRequest.getCategoryId())
                        .orElse(null);
                    if (category != null) {
                        existingBook.setCategory(category);
                    }
                } else {
                    existingBook.setCategory(null);
                }
                
                Book savedBook = bookRepository.save(existingBook);
                return ResponseEntity.ok(savedBook);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error updating book: " + e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

// Request DTO for Book operations
class BookRequest {
    private String title;
    private String author;
    private Integer publicationYear;
    private Long categoryId;
    private Integer pageCount;
    private String language;
    private String description;
    
    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
} 