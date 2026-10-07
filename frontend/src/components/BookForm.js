import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  CircularProgress,
  Fade,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import {
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Language as LanguageIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

const BookForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publicationYear: '',
    categoryId: '',
    pageCount: '',
    language: 'Türkçe',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
              setFormData({
          title: initialData.title || '',
          author: initialData.author || '',
          publicationYear: initialData.publicationYear || '',
          categoryId: initialData.category?.id || null,
          pageCount: initialData.pageCount || '',
          language: initialData.language || 'Türkçe',
          description: initialData.description || ''
        });
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Kitap adı zorunludur';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Kitap adı en az 2 karakter olmalıdır';
    }
    
    if (!formData.author.trim()) {
      newErrors.author = 'Yazar adı zorunludur';
    } else if (formData.author.trim().length < 2) {
      newErrors.author = 'Yazar adı en az 2 karakter olmalıdır';
    }
    
    if (formData.pageCount && formData.pageCount <= 0) {
      newErrors.pageCount = 'Sayfa sayısı pozitif olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoryId' ? (value ? parseInt(value) : null) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      
      // Reset form if not editing
      if (!initialData) {
                 setFormData({
           title: '',
           author: '',
           publicationYear: '',
           categoryId: '',
           pageCount: '',
           language: 'Türkçe',
           description: ''
         });
      }
    } catch (err) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!initialData;

  return (
    <Fade in timeout={500}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookIcon color="primary" />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {isEditing ? 'Kitap Düzenle' : 'Yeni Kitap Ekle'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Kitap Adı */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kitap Adı"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BookIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Yazar */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Yazar"
                name="author"
                value={formData.author}
                onChange={handleChange}
                error={!!errors.author}
                helperText={errors.author}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Yayın Yılı */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Yayın Yılı (Opsiyonel)"
                name="publicationYear"
                type="number"
                value={formData.publicationYear}
                onChange={handleChange}
                error={!!errors.publicationYear}
                helperText={errors.publicationYear}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>



            {/* Kategori */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel>Kategori</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Kategori"
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon color="action" />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="">
                    <em>Kategori Seçin</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <FormHelperText>{errors.categoryId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Sayfa Sayısı */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sayfa Sayısı (Opsiyonel)"
                name="pageCount"
                type="number"
                value={formData.pageCount}
                onChange={handleChange}
                error={!!errors.pageCount}
                helperText={errors.pageCount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BookIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Dil */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dil</InputLabel>
                <Select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  label="Dil"
                  startAdornment={
                    <InputAdornment position="start">
                      <LanguageIcon color="action" />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="Türkçe">Türkçe</MenuItem>
                  <MenuItem value="İngilizce">İngilizce</MenuItem>
                  <MenuItem value="Almanca">Almanca</MenuItem>
                  <MenuItem value="Fransızca">Fransızca</MenuItem>
                  <MenuItem value="İspanyolca">İspanyolca</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>





            {/* Açıklama */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama (Opsiyonel)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {onCancel && (
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={loading}
                    startIcon={<CancelIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    İptal
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : (isEditing ? <SaveIcon /> : <AddIcon />)}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                  }}
                >
                  {loading ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Ekle')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Fade>
  );
};

export default BookForm; 