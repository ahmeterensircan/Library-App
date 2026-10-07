package com.example.LibraryApp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Find reviews by book
    List<Review> findByBookIdOrderByCreatedAtDesc(Long bookId);
    
    // Find reviews by user
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find all reviews by user for a specific book
    List<Review> findByUserIdAndBookIdOrderByCreatedAtDesc(Long userId, Long bookId);
    
    // Get average rating for a book
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.id = :bookId")
    Double getAverageRatingByBookId(@Param("bookId") Long bookId);
    
    // Get review count for a book
    @Query("SELECT COUNT(r) FROM Review r WHERE r.book.id = :bookId")
    Long getReviewCountByBookId(@Param("bookId") Long bookId);
    
    // Get top rated books
    @Query("SELECT r.book, AVG(r.rating) as avgRating, COUNT(r) as reviewCount " +
           "FROM Review r " +
           "GROUP BY r.book " +
           "HAVING COUNT(r) >= 3 " +
           "ORDER BY avgRating DESC, reviewCount DESC")
    List<Object[]> getTopRatedBooks();
    
    // Get recent reviews
    List<Review> findTop10ByOrderByCreatedAtDesc();
} 