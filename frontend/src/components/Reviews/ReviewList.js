import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Skeleton,
  Alert,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentDissatisfied as NegativeIcon,
  SentimentNeutral as NeutralIcon,
  Psychology as SentimentIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import ReviewForm from './ReviewForm';

const ReviewList = ({ bookId, userId, onReviewUpdate }) => {
  // Get JWT token from localStorage
  const token = localStorage.getItem('token');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchReviews();
    fetchUserReviews();
  }, [bookId, userId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/reviews/book/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8080/reviews/user/${userId}/book/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserReviews(data);
      }
    } catch (error) {
      // User hasn't reviewed this book yet
    }
  };

  const handleMenuOpen = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const handleEditReview = () => {
    setEditingReview(selectedReview);
    setShowReviewForm(true);
    handleMenuClose();
  };

  const handleDeleteReview = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDeleteReview = async () => {
    try {
      const response = await fetch(`http://localhost:8080/reviews/${selectedReview.id}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        enqueueSnackbar('Yorum başarıyla silindi!', { variant: 'success' });
        fetchUserReviews();
        fetchReviews();
        if (onReviewUpdate) onReviewUpdate();
      } else {
        enqueueSnackbar('Yorum silinirken hata oluştu', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Bağlantı hatası', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleReviewSubmit = (reviewData) => {
    if (editingReview) {
      // Update existing review
      setReviews(prev => prev.map(review => 
        review.id === reviewData.id ? reviewData : review
      ));
      setUserReviews(prev => prev.map(review => 
        review.id === reviewData.id ? reviewData : review
      ));
      setEditingReview(null);
    } else {
      // Add new review
      setReviews(prev => [reviewData, ...prev]);
      setUserReviews(prev => [reviewData, ...prev]);
    }
    setShowReviewForm(false);
    if (onReviewUpdate) onReviewUpdate();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  // Birleştirilmiş değerlendirme ikonunu getir
  const getCombinedIcon = (combinedType) => {
    // String olarak gelen değeri kontrol et
    if (!combinedType) return <SentimentIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />;
    
    switch (combinedType.toUpperCase()) {
      case 'EXCELLENT':
        return <PositiveIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
      case 'VERY_GOOD':
        return <PositiveIcon sx={{ color: '#8bc34a', fontSize: 20 }} />;
      case 'GOOD':
        return <PositiveIcon sx={{ color: '#cddc39', fontSize: 20 }} />;
      case 'AVERAGE':
        return <NeutralIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
      case 'BELOW_AVERAGE':
        return <NegativeIcon sx={{ color: '#ff5722', fontSize: 20 }} />;
      case 'POOR':
        return <NegativeIcon sx={{ color: '#f44336', fontSize: 20 }} />;
      case 'VERY_POOR':
        return <NegativeIcon sx={{ color: '#d32f2f', fontSize: 20 }} />;
      default:
        return <SentimentIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />;
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

  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Yorumlar</Typography>
        {[1, 2, 3].map((item) => (
          <Paper key={item} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Yorumlar ({reviews.length})</Typography>

      {/* User Review Form */}
      {!showReviewForm && (
        <Button
          variant="contained"
          onClick={() => setShowReviewForm(true)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          Yeni Yorum Ekle {userReviews.length > 0 && `(${userReviews.length} mevcut)`}
        </Button>
      )}

      {showReviewForm && (
        <ReviewForm
          bookId={bookId}
          userId={userId}
          existingReview={editingReview}
          userReviews={userReviews}
          onSubmit={handleReviewSubmit}
          onCancel={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Bu kitap için henüz yorum bulunmuyor. İlk yorumu siz yapın!
        </Alert>
      ) : (
        reviews.map((review) => (
          <Paper key={review.id} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {review.user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {review.user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(review.createdAt)}
                    {review.isEdited && (
                      <Chip 
                        label="Düzenlendi" 
                        size="small" 
                        sx={{ ml: 1, fontSize: '0.7rem' }}
                      />
                    )}
                  </Typography>
                </Box>
              </Box>
              
              {review.user.id === userId && (
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, review)}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
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
              
              {/* Birleştirilmiş Puan Gösterimi */}
              {review.combinedScore && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: getCombinedScoreColor(review.combinedScore),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      boxShadow: 2,
                    }}
                  >
                    {review.combinedScore.toFixed(1)}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    /10
                  </Typography>
                </Box>
              )}
              
              {/* Değerlendirme Gösterimi */}
              {review.combinedRatingType && (
                <Tooltip title={`Değerlendirme: ${review.combinedExplanation || 'Analiz tamamlandı'}`}>
                  <Chip
                    icon={getCombinedIcon(review.combinedRatingType)}
                    label={getCombinedLabel(review.combinedRatingType)}
                    color={getCombinedColor(review.combinedRatingType)}
                    size="small"
                    variant="filled"
                    sx={{ ml: 1 }}
                  />
                </Tooltip>
              )}
            </Box>

            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {review.comment}
            </Typography>
          </Paper>
        ))
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <MenuItem onClick={handleEditReview}>
          <EditIcon sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={handleDeleteReview} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Yorumu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            İptal
          </Button>
          <Button onClick={confirmDeleteReview} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewList; 