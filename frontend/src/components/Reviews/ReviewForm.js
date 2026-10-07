import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Rating,
  Alert,
  CircularProgress,
  Fade,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Star as StarIcon,
  Send as SendIcon,
  Edit as EditIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentDissatisfied as NegativeIcon,
  SentimentNeutral as NeutralIcon,
  Psychology as SentimentIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const ReviewForm = ({ bookId, userId, existingReview = null, userReviews = [], onSubmit, onCancel }) => {
  // Get JWT token from localStorage
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    comment: existingReview?.comment || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();



  // Birleştirilmiş değerlendirme ikonunu getir
  const getCombinedIcon = (combinedType) => {
    if (!combinedType) return <SentimentIcon sx={{ color: '#9e9e9e', fontSize: 16 }} />;
    
    switch (combinedType.toUpperCase()) {
      case 'EXCELLENT':
        return <PositiveIcon sx={{ color: '#4caf50', fontSize: 16 }} />;
      case 'VERY_GOOD':
        return <PositiveIcon sx={{ color: '#8bc34a', fontSize: 16 }} />;
      case 'GOOD':
        return <PositiveIcon sx={{ color: '#cddc39', fontSize: 16 }} />;
      case 'AVERAGE':
        return <NeutralIcon sx={{ color: '#ff9800', fontSize: 16 }} />;
      case 'BELOW_AVERAGE':
        return <NegativeIcon sx={{ color: '#ff5722', fontSize: 16 }} />;
      case 'POOR':
        return <NegativeIcon sx={{ color: '#f44336', fontSize: 16 }} />;
      case 'VERY_POOR':
        return <NegativeIcon sx={{ color: '#d32f2f', fontSize: 16 }} />;
      default:
        return <SentimentIcon sx={{ color: '#9e9e9e', fontSize: 16 }} />;
    }
  };



  // Birleştirilmiş değerlendirme rengini getir
  const getCombinedColor = (combinedType) => {
    if (!combinedType) return 'default';
    
    switch (combinedType.toUpperCase()) {
      case 'EXCELLENT':
        return 'success';
      case 'VERY_GOOD':
        return 'success';
      case 'GOOD':
        return 'success';
      case 'AVERAGE':
        return 'warning';
      case 'BELOW_AVERAGE':
        return 'warning';
      case 'POOR':
        return 'error';
      case 'VERY_POOR':
        return 'error';
      default:
        return 'default';
    }
  };



  // Birleştirilmiş değerlendirme etiketini getir
  const getCombinedLabel = (combinedType) => {
    if (!combinedType) return 'Analiz Yok';
    
    switch (combinedType.toUpperCase()) {
      case 'EXCELLENT':
        return 'Mükemmel';
      case 'VERY_GOOD':
        return 'Çok İyi';
      case 'GOOD':
        return 'İyi';
      case 'AVERAGE':
        return 'Orta';
      case 'BELOW_AVERAGE':
        return 'Orta Altı';
      case 'POOR':
        return 'Kötü';
      case 'VERY_POOR':
        return 'Çok Kötü';
      default:
        return 'Analiz Yok';
    }
  };

  // Birleştirilmiş puan rengini getir (0-10 arası)
  const getCombinedScoreColor = (score) => {
    if (score >= 8.5) return '#4caf50'; // Yeşil - Mükemmel
    if (score >= 7.5) return '#8bc34a'; // Açık yeşil - Çok iyi
    if (score >= 6.5) return '#cddc39'; // Sarı-yeşil - İyi
    if (score >= 5.5) return '#ff9800'; // Turuncu - Orta
    if (score >= 4.5) return '#ff5722'; // Kırmızı-turuncu - Orta altı
    if (score >= 3.5) return '#f44336'; // Kırmızı - Kötü
    return '#d32f2f'; // Koyu kırmızı - Çok kötü
  };

  // Gerçek zamanlı değerlendirme analizi
  useEffect(() => {
    const analyzeCombinedRating = async () => {
      // Minimum 3 karakter olsun ve yıldız puanı seçilmiş olsun
      if (formData.comment.trim().length < 3 || formData.rating === 0) {
        setAnalysisResult(null);
        return;
      }

      setAnalyzing(true);
      try {
        console.log('Birleştirilmiş değerlendirme isteği gönderiliyor:', formData.comment, 'Yıldız:', formData.rating);
        
        const response = await fetch('http://localhost:8080/reviews/analyze-combined', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            text: formData.comment,
            starRating: formData.rating
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Birleştirilmiş değerlendirme sonucu:', data);
          setAnalysisResult(data);
        } else {
          console.error('Birleştirilmiş değerlendirme hatası:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Birleştirilmiş değerlendirme hatası:', error);
      } finally {
        setAnalyzing(false);
      }
    };

    // Debounce ile değerlendirme analizi (500ms)
    const timeoutId = setTimeout(analyzeCombinedRating, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.comment, formData.rating, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setError('Lütfen bir puan verin');
      return;
    }
    
    if (!formData.comment.trim()) {
      setError('Yorum boş olamaz');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = existingReview 
        ? `http://localhost:8080/reviews/${existingReview.id}`
        : 'http://localhost:8080/reviews';
      
      const method = existingReview ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          bookId: bookId,
          rating: formData.rating,
          comment: formData.comment.trim()
        }),
      });

      let data;
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('Server response is not valid JSON: ' + responseText);
      }

      if (response.ok) {
        enqueueSnackbar(
          existingReview ? 'Yorum başarıyla güncellendi!' : 'Yeni yorum başarıyla eklendi!', 
          { variant: 'success' }
        );
        if (onSubmit) {
          onSubmit(data);
        }
      } else {
        setError(data || 'Bir hata oluştu');
        enqueueSnackbar(data || 'Bir hata oluştu', { variant: 'error' });
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setError('Bağlantı hatası: ' + err.message);
      enqueueSnackbar('Bağlantı hatası: ' + err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, rating: newValue }));
    if (error) setError('');
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
    if (error) setError('');
  };

  const isEditing = !!existingReview;

  return (
    <Fade in timeout={500}>
      <Paper 
        elevation={2}
        sx={{ 
          p: 3,
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          mb: 3
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon color="primary" />
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {isEditing ? 'Yorumunu Düzenle' : 'Yeni Yorum Ekle'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Existing User Reviews */}
        {userReviews.length > 0 && !existingReview && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
              Mevcut Yorumlarınız ({userReviews.length})
            </Typography>
            {userReviews.map((review) => (
              <Paper key={review.id} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#fbbf24',
                        },
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {review.rating}/5
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                  {review.comment}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <Box sx={{ mb: 3 }}>
            <Typography component="legend" sx={{ mb: 1, fontWeight: 500 }}>
              Puanınız *
            </Typography>
            <Rating
              name="rating"
              value={formData.rating}
              onChange={handleRatingChange}
              size="large"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#fbbf24',
                },
                '& .MuiRating-iconHover': {
                  color: '#f59e0b',
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {formData.rating === 0 && 'Lütfen bir puan seçin'}
              {formData.rating === 1 && 'Çok kötü'}
              {formData.rating === 2 && 'Kötü'}
              {formData.rating === 3 && 'Orta'}
              {formData.rating === 4 && 'İyi'}
              {formData.rating === 5 && 'Mükemmel'}
            </Typography>
          </Box>

          {/* Comment */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography component="legend" sx={{ fontWeight: 500 }}>
                Yorumunuz *
              </Typography>
              {analyzing && (
                <CircularProgress size={16} sx={{ ml: 1 }} />
              )}
            </Box>
            
            <TextField
              fullWidth
              label="Yorumunuz"
              name="comment"
              value={formData.comment}
              onChange={handleCommentChange}
              multiline
              rows={4}
              placeholder="Bu kitap hakkında düşüncelerinizi paylaşın (en az 1 karakter)..."
              helperText={`${formData.comment.length}/1000 karakter`}
              inputProps={{ maxLength: 1000 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            
            {/* Değerlendirme Sonucu */}
            {analysisResult && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Değerlendirme:
                </Typography>
                <Tooltip title={`Birleştirilmiş Skor: ${analysisResult.combinedScore?.toFixed(1) || 'N/A'}/10`}>
                  <Chip
                    icon={getCombinedIcon(analysisResult.type)}
                    label={getCombinedLabel(analysisResult.type)}
                    color={getCombinedColor(analysisResult.type)}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: getCombinedScoreColor(analysisResult.combinedScore),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    boxShadow: 1,
                  }}
                >
                  {analysisResult.combinedScore?.toFixed(1) || 'N/A'}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  /10
                </Typography>
              </Box>
            )}
          </Box>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                İptal
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading || formData.rating === 0}
              startIcon={loading ? <CircularProgress size={20} /> : (isEditing ? <EditIcon /> : <SendIcon />)}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              {loading ? 'Gönderiliyor...' : (isEditing ? 'Güncelle' : 'Gönder')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Fade>
  );
};

export default ReviewForm; 