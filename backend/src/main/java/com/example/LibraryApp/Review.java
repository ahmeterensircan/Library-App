package com.example.LibraryApp;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    @NotNull
    private Book book;
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating; // 1-5 yıldız
    
    @NotBlank
    @Size(min = 1, max = 1000)
    @Column(length = 1000)
    private String comment;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    private boolean isEdited = false;
    
    // Duygu analizi alanları
    @Column(name = "sentiment_type")
    private String sentimentType; // String olarak saklayacağız
    
    @Column(name = "sentiment_score")
    private Double sentimentScore;
    
    @Column(name = "sentiment_explanation", length = 500)
    private String sentimentExplanation;
    
    // Birleştirilmiş değerlendirme alanları
    @Column(name = "combined_rating_type")
    private String combinedRatingType; // String olarak saklayacağız
    
    @Column(name = "combined_score")
    private Double combinedScore;
    
    @Column(name = "combined_explanation", length = 1000)
    private String combinedExplanation;
    
    // Constructors
    public Review() {}
    
    public Review(User user, Book book, Integer rating, String comment) {
        this.user = user;
        this.book = book;
        this.rating = rating;
        this.comment = comment;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isEdited() { return isEdited; }
    public void setEdited(boolean edited) { isEdited = edited; }
    
    // Duygu analizi getter ve setter'ları
    public String getSentimentType() { return sentimentType; }
    public void setSentimentType(String sentimentType) { this.sentimentType = sentimentType; }
    
    public Double getSentimentScore() { return sentimentScore; }
    public void setSentimentScore(Double sentimentScore) { this.sentimentScore = sentimentScore; }
    
    public String getSentimentExplanation() { return sentimentExplanation; }
    public void setSentimentExplanation(String sentimentExplanation) { this.sentimentExplanation = sentimentExplanation; }
    
    // Birleştirilmiş değerlendirme getter ve setter'ları
    public String getCombinedRatingType() { return combinedRatingType; }
    public void setCombinedRatingType(String combinedRatingType) { this.combinedRatingType = combinedRatingType; }
    
    public Double getCombinedScore() { return combinedScore; }
    public void setCombinedScore(Double combinedScore) { this.combinedScore = combinedScore; }
    
    public String getCombinedExplanation() { return combinedExplanation; }
    public void setCombinedExplanation(String combinedExplanation) { this.combinedExplanation = combinedExplanation; }
} 