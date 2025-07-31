package com.example.LibraryApp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    // Basic search methods
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByAuthorContainingIgnoreCase(String author);
    List<Book> findByCategoryId(Long categoryId);
    List<Book> findByLanguage(String language);
    
    // Advanced search with multiple criteria
    @Query("SELECT b FROM Book b WHERE " +
           "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
           "(:categoryId IS NULL OR b.category.id = :categoryId) AND " +
           "(:language IS NULL OR b.language = :language)")
    List<Book> searchBooks(@Param("title") String title, 
                          @Param("author") String author, 
                          @Param("categoryId") Long categoryId, 
                          @Param("language") String language);
    
    // Find books by publication year range
    List<Book> findByPublicationYearBetween(Integer startYear, Integer endYear);
} 