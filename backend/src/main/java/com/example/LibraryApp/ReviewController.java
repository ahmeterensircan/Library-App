package com.example.LibraryApp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AISentimentAnalysisService aiSentimentAnalysisService;
    
    @GetMapping("/book/{bookId}")
    public List<Review> getReviewsByBook(@PathVariable Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }
    
    @GetMapping("/user/{userId}")
    public List<Review> getReviewsByUser(@PathVariable Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @GetMapping("/recent")
    public List<Review> getRecentReviews() {
        return reviewRepository.findTop10ByOrderByCreatedAtDesc();
    }
    
    @GetMapping("/top-rated")
    public List<Object[]> getTopRatedBooks() {
        return reviewRepository.getTopRatedBooks();
    }
    
    @GetMapping("/book/{bookId}/stats")
    public ResponseEntity<Map<String, Object>> getBookReviewStats(@PathVariable Long bookId) {
        Double avgRating = reviewRepository.getAverageRatingByBookId(bookId);
        Long reviewCount = reviewRepository.getReviewCountByBookId(bookId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        stats.put("reviewCount", reviewCount != null ? reviewCount : 0);
        
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequest request) {
        // Check if user exists
        User user = userRepository.findById(request.getUserId())
                .orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        // Check if book exists
        Book book = bookRepository.findById(request.getBookId())
                .orElse(null);
        if (book == null) {
            return ResponseEntity.badRequest().body("Book not found");
        }
        
        // Create review
        Review review = new Review(user, book, request.getRating(), request.getComment());
        
        // Perform AI-based combined analysis (sentiment + star rating)
        CombinedRatingResult combinedResult = 
            aiSentimentAnalysisService.analyzeCombinedRatingWithAI(request.getComment(), request.getRating());
        
        // Set sentiment analysis results
        review.setSentimentType(combinedResult.getSentimentResult().getType().name());
        review.setSentimentScore(combinedResult.getSentimentResult().getScore());
        review.setSentimentExplanation(combinedResult.getSentimentResult().getExplanation());
        
        // Set combined rating results
        review.setCombinedRatingType(combinedResult.getType().name());
        review.setCombinedScore(combinedResult.getCombinedScore());
        review.setCombinedExplanation(combinedResult.getExplanation());
        
        Review savedReview = reviewRepository.save(review);
        
        return ResponseEntity.ok(savedReview);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        return reviewRepository.findById(id)
                .map(review -> {
                    // Check if user owns this review or is admin
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    User currentUser = (User) auth.getPrincipal();
                    
                    if (!review.getUser().getId().equals(request.getUserId()) && 
                        !currentUser.getRole().equals(UserRole.ADMIN)) {
                        return ResponseEntity.badRequest().body("You can only edit your own reviews");
                    }
                    
                    review.setRating(request.getRating());
                    review.setComment(request.getComment());
                    review.setUpdatedAt(LocalDateTime.now());
                    review.setEdited(true);
                    
                    // Update AI-based combined analysis
                    CombinedRatingResult combinedResult = 
                        aiSentimentAnalysisService.analyzeCombinedRatingWithAI(request.getComment(), request.getRating());
                    
                    // Update sentiment analysis results
                    review.setSentimentType(combinedResult.getSentimentResult().getType().name());
                    review.setSentimentScore(combinedResult.getSentimentResult().getScore());
                    review.setSentimentExplanation(combinedResult.getSentimentResult().getExplanation());
                    
                    // Update combined rating results
                    review.setCombinedRatingType(combinedResult.getType().name());
                    review.setCombinedScore(combinedResult.getCombinedScore());
                    review.setCombinedExplanation(combinedResult.getExplanation());
                    
                    return ResponseEntity.ok(reviewRepository.save(review));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, @RequestParam Long userId) {
        return reviewRepository.findById(id)
                .map(review -> {
                    // Check if user owns this review or is admin
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    User currentUser = (User) auth.getPrincipal();
                    
                    if (!review.getUser().getId().equals(userId) && 
                        !currentUser.getRole().equals(UserRole.ADMIN)) {
                        return ResponseEntity.badRequest().body("You can only delete your own reviews");
                    }
                    
                    reviewRepository.delete(review);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}/book/{bookId}")
    public ResponseEntity<List<Review>> getUserReviewsForBook(@PathVariable Long userId, @PathVariable Long bookId) {
        List<Review> reviews = reviewRepository.findByUserIdAndBookIdOrderByCreatedAtDesc(userId, bookId);
        return ResponseEntity.ok(reviews);
    }
    
    // Duygu analizi endpoint'i
    @PostMapping("/analyze-sentiment")
    public ResponseEntity<?> analyzeSentiment(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Text is required");
        }
        
        System.out.println("Duygu analizi isteği alındı: '" + text + "'");
        
        SentimentResult result = aiSentimentAnalysisService.analyzeSentimentWithAI(text);
        
        System.out.println("Duygu analizi sonucu: " + result.getType() + " (skor: " + result.getScore() + ")");
        
        Map<String, Object> response = new HashMap<>();
        response.put("type", result.getType().name());
        response.put("typeDisplayName", result.getTypeDisplayName());
        response.put("score", result.getScore());
        response.put("explanation", result.getExplanation());
        
        return ResponseEntity.ok(response);
    }
    
    // Birleştirilmiş değerlendirme endpoint'i
    @PostMapping("/analyze-combined")
    public ResponseEntity<?> analyzeCombinedRating(@RequestBody Map<String, Object> request) {
        String text = (String) request.get("text");
        Integer starRating = (Integer) request.get("starRating");
        
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Text is required");
        }
        
        if (starRating == null || starRating < 1 || starRating > 5) {
            return ResponseEntity.badRequest().body("Star rating must be between 1 and 5");
        }
        
        System.out.println("Birleştirilmiş değerlendirme isteği alındı: '" + text + "' (yıldız: " + starRating + ")");
        
        CombinedRatingResult result = 
            aiSentimentAnalysisService.analyzeCombinedRatingWithAI(text, starRating);
        
        System.out.println("Birleştirilmiş değerlendirme sonucu: " + result.getType() + " (skor: " + result.getCombinedScore() + ")");
        
        Map<String, Object> response = new HashMap<>();
        response.put("type", result.getType().name());
        response.put("typeDisplayName", result.getTypeDisplayName());
        response.put("typeDescription", result.getTypeDescription());
        response.put("combinedScore", result.getCombinedScore());
        response.put("explanation", result.getExplanation());
        response.put("sentimentType", result.getSentimentResult().getType().name());
        response.put("sentimentScore", result.getSentimentResult().getScore());
        response.put("sentimentExplanation", result.getSentimentResult().getExplanation());
        
        return ResponseEntity.ok(response);
    }
}

class ReviewRequest {
    private Long userId;
    private Long bookId;
    private Integer rating;
    private String comment;
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
} 