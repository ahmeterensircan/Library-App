import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Alert,
  Skeleton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategoryId: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      enqueueSnackbar('Kategoriler yüklenirken hata oluştu', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentCategoryId: ''
    });
    setDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentCategoryId: category.parentCategory?.id || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`http://localhost:8080/categories/${categoryId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          enqueueSnackbar('Kategori başarıyla silindi!', { variant: 'success' });
          fetchCategories();
        } else {
          enqueueSnackbar('Kategori silinirken hata oluştu', { variant: 'error' });
        }
      } catch (error) {
        enqueueSnackbar('Bağlantı hatası', { variant: 'error' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      enqueueSnackbar('Kategori adı zorunludur', { variant: 'error' });
      return;
    }

    try {
      const url = editingCategory 
        ? `http://localhost:8080/categories/${editingCategory.id}`
        : 'http://localhost:8080/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentCategory: formData.parentCategoryId ? { id: parseInt(formData.parentCategoryId) } : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        enqueueSnackbar(
          editingCategory ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla eklendi!', 
          { variant: 'success' }
        );
        setDialogOpen(false);
        fetchCategories();
      } else {
        const error = await response.text();
        enqueueSnackbar(error || 'Bir hata oluştu', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Bağlantı hatası', { variant: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentCategoryId: ''
    });
  };

  const getMainCategories = () => {
    return categories.filter(cat => !cat.parentCategory);
  };

  const getSubCategories = (parentId) => {
    return categories.filter(cat => cat.parentCategory?.id === parentId);
  };

  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category) => (
      <Box key={category.id}>
        <ListItem
          sx={{
            pl: level * 3 + 2,
            borderLeft: level > 0 ? '2px solid #e2e8f0' : 'none',
            ml: level > 0 ? 2 : 0
          }}
        >
          <CategoryIcon sx={{ mr: 2, color: 'primary.main' }} />
          <ListItemText
            primary={category.name}
            secondary={
              <Box>
                {category.description && (
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                )}
                {category.parentCategory && (
                  <Chip 
                    label={`Alt kategori: ${category.parentCategory.name}`} 
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={() => handleEditCategory(category)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              edge="end"
              onClick={() => handleDeleteCategory(category.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        {getSubCategories(category.id).length > 0 && (
          <Box sx={{ ml: 2 }}>
            {renderCategoryTree(getSubCategories(category.id), level + 1)}
          </Box>
        )}
      </Box>
    ));
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>Kategori Yönetimi</Typography>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Kategori Yönetimi</Typography>

      {categories.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Henüz kategori bulunmuyor. İlk kategoriyi ekleyin!
        </Alert>
      ) : (
        <Paper sx={{ mb: 3 }}>
          <List>
            {renderCategoryTree(getMainCategories())}
          </List>
        </Paper>
      )}

      {/* Add Category FAB */}
      <Fab
        color="primary"
        aria-label="add category"
        onClick={handleAddCategory}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Kategori Adı"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Açıklama (Opsiyonel)"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              label="Üst Kategori (Opsiyonel)"
              fullWidth
              variant="outlined"
              value={formData.parentCategoryId}
              onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
            >
              <MenuItem value="">
                <em>Ana Kategori</em>
              </MenuItem>
              {categories
                .filter(cat => !cat.parentCategory && (!editingCategory || cat.id !== editingCategory.id))
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              İptal
            </Button>
            <Button type="submit" variant="contained">
              {editingCategory ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CategoryManager; 