package com.example.LibraryApp;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.HashMap;
import java.util.Map;
import java.util.Collections;

// Duygu türleri
enum SentimentType {
    POSITIVE("Pozitif"),
    NEGATIVE("Negatif"),
    NEUTRAL("Nötr");
    
    private final String displayName;
    
    SentimentType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}

// Birleştirilmiş değerlendirme türleri
enum CombinedRatingType {
    EXCELLENT("Mükemmel", "Bu kitap hem yorumlarda hem de puanlamada çok yüksek değerlendirildi"),
    VERY_GOOD("Çok İyi", "Bu kitap genel olarak çok beğenildi"),
    GOOD("İyi", "Bu kitap olumlu değerlendirildi"),
    AVERAGE("Orta", "Bu kitap orta seviyede değerlendirildi"),
    BELOW_AVERAGE("Orta Altı", "Bu kitap biraz düşük değerlendirildi"),
    POOR("Kötü", "Bu kitap olumsuz değerlendirildi"),
    VERY_POOR("Çok Kötü", "Bu kitap hem yorumlarda hem de puanlamada çok düşük değerlendirildi");
    
    private final String displayName;
    private final String description;
    
    CombinedRatingType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}

// Duygu analizi sonucu sınıfı
class SentimentResult {
    private final SentimentType type;
    private final double score;
    private final String explanation;
    
    public SentimentResult(SentimentType type, double score, String explanation) {
        this.type = type;
        this.score = score;
        this.explanation = explanation;
    }
    
    public SentimentType getType() {
        return type;
    }
    
    public double getScore() {
        return score;
    }
    
    public String getExplanation() {
        return explanation;
    }
    
    public String getTypeDisplayName() {
        return type.getDisplayName();
    }
}

// Birleştirilmiş değerlendirme sonucu sınıfı
class CombinedRatingResult {
    private final CombinedRatingType type;
    private final double combinedScore;
    private final String explanation;
    private final SentimentResult sentimentResult;
    private final int starRating;
    
    public CombinedRatingResult(CombinedRatingType type, double combinedScore, String explanation, 
                              SentimentResult sentimentResult, int starRating) {
        this.type = type;
        this.combinedScore = combinedScore;
        this.explanation = explanation;
        this.sentimentResult = sentimentResult;
        this.starRating = starRating;
    }
    
    public CombinedRatingType getType() {
        return type;
    }
    
    public double getCombinedScore() {
        return combinedScore;
    }
    
    public String getExplanation() {
        return explanation;
    }
    
    public SentimentResult getSentimentResult() {
        return sentimentResult;
    }
    
    public int getStarRating() {
        return starRating;
    }
    
    public String getTypeDisplayName() {
        return type.getDisplayName();
    }
    
    public String getTypeDescription() {
        return type.getDescription();
    }
}

@Service
public class AISentimentAnalysisService {
    
    @Value("${huggingface.api.key:}")
    private String huggingfaceApiKey;
    
    @Value("${huggingface.api.url:https://api-inference.huggingface.co/models/savasy/bert-base-turkish-sentiment}")
    private String modelUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * AI tabanlı duygu analizi yapar
     * @param text Analiz edilecek metin
     * @return Duygu analizi sonucu
     */
    public SentimentResult analyzeSentimentWithAI(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new SentimentResult(SentimentType.NEUTRAL, 0.0, "Metin boş");
        }
        
        try {
            // Hugging Face API'ye istek gönder
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            if (huggingfaceApiKey != null && !huggingfaceApiKey.isEmpty()) {
                headers.setBearerAuth(huggingfaceApiKey);
            }
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("inputs", text);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            System.out.println("AI API'ye istek gönderiliyor: " + text);
            
            ResponseEntity<String> response = restTemplate.postForEntity(
                modelUrl, 
                request, 
                String.class
            );
            
            System.out.println("AI API yanıtı: " + response.getStatusCode() + " - " + response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return parseAIResponse(response.getBody(), text);
            } else {
                System.err.println("AI API hatası: " + response.getStatusCode());
                return fallbackSentimentAnalysis(text);
            }
            
        } catch (Exception e) {
            System.err.println("AI duygu analizi hatası: " + e.getMessage());
            return fallbackSentimentAnalysis(text);
        }
    }
    
    /**
     * Fallback sentiment analysis (keyword-based)
     */
    private SentimentResult fallbackSentimentAnalysis(String text) {
        String lowerText = text.toLowerCase();
        
        // Pozitif kelimeler
        String[] positiveWords = {"güzel", "harika", "mükemmel", "süper", "iyi", "beğendim", "sevdi", "hoş"};
        // Negatif kelimeler  
        String[] negativeWords = {"kötü", "berbat", "rezalet", "korkunç", "sıkıcı", "beğenmedim", "sevmedim"};
        
        int positiveCount = 0;
        int negativeCount = 0;
        
        for (String word : positiveWords) {
            if (lowerText.contains(word)) {
                positiveCount++;
            }
        }
        
        for (String word : negativeWords) {
            if (lowerText.contains(word)) {
                negativeCount++;
            }
        }
        
        SentimentType type;
        double score;
        String explanation;
        
        if (positiveCount > negativeCount) {
            type = SentimentType.POSITIVE;
            score = 0.7;
            explanation = "Pozitif kelimeler tespit edildi (Fallback)";
        } else if (negativeCount > positiveCount) {
            type = SentimentType.NEGATIVE;
            score = -0.7;
            explanation = "Negatif kelimeler tespit edildi (Fallback)";
        } else {
            type = SentimentType.NEUTRAL;
            score = 0.0;
            explanation = "Nötr yorum (Fallback)";
        }
        
        return new SentimentResult(type, score, explanation);
    }
    
    /**
     * AI API yanıtını parse eder
     */
    private SentimentResult parseAIResponse(String responseBody, String originalText) {
        try {
            JsonNode response = objectMapper.readTree(responseBody);
            
            // savasy/bert-base-turkish-sentiment-cased modeli yanıtını parse et
            // Format: [[{"label":"negative","score":0.9987760186195374},{"label":"positive","score":0.001223976374603808}]]
            if (response.isArray() && response.size() > 0) {
                // İlk array'i al (çift array formatı)
                JsonNode firstArray = response.get(0);
                
                if (firstArray.isArray() && firstArray.size() > 0) {
                    // En yüksek skora sahip sonucu bul
                    JsonNode bestResult = firstArray.get(0);
                    double bestScore = bestResult.get("score").asDouble();
                    
                    for (int i = 1; i < firstArray.size(); i++) {
                        JsonNode currentResult = firstArray.get(i);
                        double currentScore = currentResult.get("score").asDouble();
                        if (currentScore > bestScore) {
                            bestResult = currentResult;
                            bestScore = currentScore;
                        }
                    }
                    
                    String label = bestResult.get("label").asText().toLowerCase();
                    double score = bestScore;
                    
                    // Label'ları sentiment türlerine çevir
                    SentimentType sentimentType;
                    double normalizedScore;
                    
                    switch (label) {
                        case "positive":
                            sentimentType = SentimentType.POSITIVE;
                            normalizedScore = score;
                            break;
                        case "negative":
                            sentimentType = SentimentType.NEGATIVE;
                            normalizedScore = -score;
                            break;
                        case "neutral":
                        default:
                            sentimentType = SentimentType.NEUTRAL;
                            normalizedScore = 0.0;
                            break;
                    }
                    
                    String explanation = String.format(
                        "AI Analizi: %s (güven: %.2f%%)", 
                        sentimentType.getDisplayName(),
                        score * 100
                    );
                    
                    return new SentimentResult(sentimentType, normalizedScore, explanation);
                }
            }
            
        } catch (Exception e) {
            System.err.println("AI yanıt parse hatası: " + e.getMessage());
        }
        
        throw new RuntimeException("AI yanıtı parse edilemedi");
    }
    
    /**
     * AI tabanlı birleştirilmiş değerlendirme
     */
    public CombinedRatingResult analyzeCombinedRatingWithAI(String text, int starRating) {
        // AI ile duygu analizi yap
        SentimentResult sentimentResult = analyzeSentimentWithAI(text);
        
        // Duygu skorunu 0-10 arasına normalize et (-1 ile 1 arasından)
        double normalizedSentimentScore = ((sentimentResult.getScore() + 1) / 2.0) * 10;
        
        // Yıldız puanını 0-10 arasına normalize et
        double normalizedStarRating = (starRating - 1) / 4.0 * 10;
        
        // Birleştirilmiş skor hesapla (AI duygu analizi %60, yıldız %40 ağırlık)
        double combinedScore = (normalizedSentimentScore * 0.6) + (normalizedStarRating * 0.4);
        
        // Birleştirilmiş değerlendirme türünü belirle (0-10 arası)
        CombinedRatingType combinedType;
        String combinedExplanation;
        
        if (combinedScore >= 8.5) {
            combinedType = CombinedRatingType.EXCELLENT;
        } else if (combinedScore >= 7.5) {
            combinedType = CombinedRatingType.VERY_GOOD;
        } else if (combinedScore >= 6.5) {
            combinedType = CombinedRatingType.GOOD;
        } else if (combinedScore >= 5.5) {
            combinedType = CombinedRatingType.AVERAGE;
        } else if (combinedScore >= 4.5) {
            combinedType = CombinedRatingType.BELOW_AVERAGE;
        } else if (combinedScore >= 3.5) {
            combinedType = CombinedRatingType.POOR;
        } else {
            combinedType = CombinedRatingType.VERY_POOR;
        }
        
        combinedExplanation = String.format(
            "AI Duygu Analizi: %s (%.1f/10), Yıldız: %d/5 (%.1f/10), Birleştirilmiş Skor: %.1f/10",
            sentimentResult.getType().getDisplayName(),
            normalizedSentimentScore,
            starRating,
            normalizedStarRating,
            combinedScore
        );
        
        return new CombinedRatingResult(
            combinedType,
            combinedScore,
            combinedExplanation,
            sentimentResult,
            starRating
        );
    }
} 