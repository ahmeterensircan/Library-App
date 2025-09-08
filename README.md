# 📚 LibraryApp - Library Management System

Modern bir kütüphane yönetim sistemi. Kullanıcılar kitap ekleyebilir, yorum yapabilir ve **AI destekli duygu analizi** ile yorumlarını analiz edebilir.

## 🚀 Özellikler

### 📖 Kitap Yönetimi
- ✅ Kitap ekleme, düzenleme, silme (Admin only)
- ✅ Kategori bazlı filtreleme
- ✅ Arama ve sıralama
- ✅ Detaylı kitap bilgileri

### 👥 Kullanıcı Yönetimi
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Role-based access control (ADMIN, USER)
- ✅ Güvenli şifre hashleme
- ✅ Kullanıcı kayıt ve giriş

### 💬 Yorum Sistemi
- ✅ Kitap yorumları ve puanlama
- ✅ **AI destekli duygu analizi**
- ✅ Real-time analiz

### 🤖 AI Sentiment Analysis

#### **AI Model Entegrasyonu**
- **Model**: `savasy/bert-base-turkish-sentiment-cased`
- **Platform**: Hugging Face Inference API
- **Dil**: Türkçe için özel eğitilmiş
- **Doğruluk**: %87+ güven skoru

#### **Nasıl Çalışıyor?**
1. **Kullanıcı yorum yazar** → Frontend
2. **Real-time analiz** → Backend API çağrısı
3. **AI API'ye istek** → Hugging Face modeli
4. **Sentiment sonucu** → Pozitif/Negatif/Nötr
5. **Combined rating** → AI skoru + Yıldız puanı
6. **Renkli gösterim** → Frontend'de görsel feedback

#### **Combined Rating Sistemi**
```
AI Duygu Analizi (%60) + Yıldız Puanı (%40) = Birleştirilmiş Skor

Örnek:
- Yorum: "Bu kitap çok güzel"
- AI Analizi: Pozitif (9.4/10)
- Yıldız: 4/5 (6.0/10)
- Birleştirilmiş Skor: 8.0/10 → "Çok İyi"
```

#### **Rating Türleri**
- 🟢 **Mükemmel** (8.5+) - Yeşil
- 🟢 **Çok İyi** (7.5+) - Açık yeşil  
- 🟡 **İyi** (6.5+) - Sarı
- 🟠 **Orta** (5.5+) - Turuncu
- 🟠 **Orta Altı** (4.5+) - Kırmızı-turuncu
- 🔴 **Kötü** (3.5+) - Kırmızı
- 🔴 **Çok Kötü** (<3.5) - Koyu kırmızı

#### **Fallback Sistemi**
AI API çalışmadığında keyword-based analiz:
```java
Pozitif kelimeler: "güzel", "harika", "mükemmel", "süper", "iyi"
Negatif kelimeler: "kötü", "berbat", "rezalet", "korkunç"
```

## 🛠️ Teknoloji Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Security**: Spring Security + JWT
- **Database**: MySQL + JPA/Hibernate
- **AI Integration**: Hugging Face API
- **Build Tool**: Maven

### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: Fetch API
- **State Management**: React Hooks

### AI/ML
- **Platform**: Hugging Face
- **Model**: BERT-based Turkish Sentiment Analysis
- **API**: RESTful HTTP calls
- **Fallback**: Keyword-based analysis

## 📋 Kurulum

### 1. Gereksinimler
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

### 2. Database Kurulumu
```sql
CREATE DATABASE library_db;
```

### 3. Backend Kurulumu
```bash
cd backend

# Bağımlılıkları yükle
./mvnw clean install

# Uygulamayı başlat
./mvnw spring-boot:run
```

### 4. Frontend Kurulumu
```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npm start
```

### 5. AI Sentiment Analysis Kurulumu

#### **Hugging Face API Key**
1. [Hugging Face](https://huggingface.co/) hesabı oluştur
2. API Key al: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. `backend/src/main/resources/application.properties` dosyasına ekle:
```properties
huggingface.api.key=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### **Model Konfigürasyonu**
```properties
# Türkçe sentiment analysis modeli
huggingface.api.url=https://router.huggingface.co/hf-inference/models/savasy/bert-base-turkish-sentiment-cased

# AI ayarları
ai.sentiment.enabled=true
ai.sentiment.fallback.enabled=true
```

### 6. Gizli Anahtarlar ve Ortam Değişkenleri

- Bu repo, gizli bilgileri commit etmez. `backend/src/main/resources/application.example.properties` dosyasını yerelinizde kopyalayıp doldurun (dosyanın adı `application.properties` olmalı ve commit etmeyin).

PowerShell (Windows) için hızlı kurulum:
```powershell
# Backend'i çalıştırmadan önce tek seferlik (oturum bazlı) ayarlar
$env:SPRING_DATASOURCE_PASSWORD="<mysql_password>"
$env:HUGGINGFACE_API_KEY="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
$env:JWT_SECRET="<uzun_guclu_bir_anahtar>"
$env:JWT_EXPIRATION="86400000"
```

Yerel dosya ile çalışmak isterseniz:
```bash
cp backend/src/main/resources/application.example.properties backend/src/main/resources/application.properties
# ardından değerleri doldurun (bu dosyayı commit ETMEYİN)
```

## 🔧 Konfigürasyon

### Database Ayarları
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/library_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### JWT Ayarları
```properties
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000
```

### AI Model Ayarları
```properties
# Hugging Face API
huggingface.api.key=your_api_key
huggingface.api.url=https://router.huggingface.co/hf-inference/models/savasy/bert-base-turkish-sentiment-cased

# AI Sentiment Analysis
ai.sentiment.enabled=true
ai.sentiment.fallback.enabled=true
```

## 👤 Varsayılan Kullanıcılar

Uygulama başlatıldığında otomatik oluşturulur:

| Kullanıcı Adı | Şifre | Rol |
|---------------|-------|-----|
| admin  | admin123 | ADMIN |
| user | user123 | USER |

## 🔐 Güvenlik

### Role-Based Access Control
- **ADMIN**: Tüm işlemler (kitap ekleme/silme/güncelleme, kategori yönetimi, yorum yapma)
- **USER**: Kitap görüntüleme, yorum yapma

### API Endpoints
```
GET    /books/**          - Tüm kullanıcılar
POST   /books/**          - ADMIN only
PUT    /books/**          - ADMIN only
DELETE /books/**          - ADMIN only

GET    /reviews/**        - Tüm kullanıcılar
POST   /reviews/**        - USER, ADMIN
PUT    /reviews/**        - USER, ADMIN
DELETE /reviews/**        - USER, ADMIN

POST   /reviews/analyze-sentiment    - Tüm kullanıcılar
POST   /reviews/analyze-combined     - Tüm kullanıcılar
```

## 🤖 AI Sentiment Analysis Detayları

### Model Özellikleri
- **Model**: `savasy/bert-base-turkish-sentiment-cased`
- **Mimari**: BERT (Bidirectional Encoder Representations from Transformers)
- **Dil**: Türkçe
- **Sınıflandırma**: Pozitif, Negatif, Nötr
- **Çıktı Formatı**: JSON array with confidence scores

### API Yanıt Formatı
```json
[
  [
    {
      "label": "positive",
      "score": 0.8707315921783447
    },
    {
      "label": "negative", 
      "score": 0.12926837801933289
    }
  ]
]
```

### Backend Implementation
```java
@Service
public class AISentimentAnalysisService {
    
    public SentimentResult analyzeSentimentWithAI(String text) {
        // HTTP headers hazırla
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.setBearerAuth(huggingfaceApiKey);
        
        // API'ye istek gönder
        ResponseEntity<String> response = restTemplate.postForEntity(
            modelUrl, request, String.class
        );
        
        // Yanıtı parse et
        return parseAIResponse(response.getBody(), text);
    }
}
```

### Frontend Integration
```javascript
// Real-time sentiment analysis
const analyzeCombinedRating = useCallback(
    debounce(async (text, rating) => {
        const response = await fetch('/api/reviews/analyze-combined', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text, starRating: rating })
        });
        
        const result = await response.json();
        setAnalysisResult(result);
    }, 500),
    [token]
);
```

## 📊 Veri Akışı

```
1. Kullanıcı yorum yazar
   ↓
2. Frontend real-time analiz isteği
   ↓
3. Backend API endpoint
   ↓
4. Hugging Face AI API
   ↓
5. BERT model analizi
   ↓
6. Sentiment sonucu (Pozitif/Negatif/Nötr)
   ↓
7. Combined rating hesaplama
   ↓
8. Frontend'de renkli gösterim
   ↓
9. Kullanıcı kaydet
   ↓
10. Database'e kaydet
```

## 🎯 Kullanım Senaryoları

### Senaryo 1: Pozitif Yorum
- **Yorum**: "Bu kitap harika, çok beğendim!"
- **AI Analizi**: Pozitif (%95 güven)
- **Yıldız**: 5/5
- **Combined Score**: 9.7/10 → Mükemmel (Yeşil)

### Senaryo 2: Negatif Yorum
- **Yorum**: "Bu kitap çok sıkıcı ve kötü"
- **AI Analizi**: Negatif (%98 güven)
- **Yıldız**: 1/5
- **Combined Score**: 2.1/10 → Çok Kötü (Kırmızı)

### Senaryo 3: Karışık Yorum
- **Yorum**: "Kitap iyi ama biraz uzun"
- **AI Analizi**: Pozitif (%65 güven)
- **Yıldız**: 3/5
- **Combined Score**: 6.2/10 → İyi (Sarı)

## 🔧 Sorun Giderme

### AI API Hatası
```
Hata: 400 Bad Request
Çözüm: Accept header'ı kontrol et
```

### Model Yanıt Hatası
```
Hata: Parse error
Çözüm: Yanıt formatını kontrol et
```

### Fallback Sistemi
AI API çalışmadığında otomatik keyword-based analiz devreye girer.

## 📈 Performans

- **AI Response Time**: ~500ms
- **Fallback Response Time**: ~50ms
- **Combined Rating Calculation**: ~10ms
- **Database Operations**: ~100ms

