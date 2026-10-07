import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Fade,
  Slide,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LibraryBooks as LibraryIcon,
  Language as LanguageIcon,
  Category as CategoryIcon,
  Comment as CommentIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import BookForm from './BookForm';
import ReviewList from './Reviews/ReviewList';
import ReviewForm from './Reviews/ReviewForm';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BookList = ({ books, loading, onAdd, onUpdate, onDelete, userId, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    language: '',
    yearFrom: '',
    yearTo: ''
  });
  const [categories, setCategories] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewingBook, setReviewingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const theme = useTheme();

  // Check if user is admin
  const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const filteredBooks = books.filter(book => {
    // Search filter
    const matchesSearch = !searchTerm || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = !filters.category || 
      (book.category && book.category.id.toString() === filters.category);

    // Language filter
    const matchesLanguage = !filters.language || 
      book.language === filters.language;

    // Year range filter
    const matchesYear = (!filters.yearFrom && !filters.yearTo) || 
      ((!filters.yearFrom || (book.publicationYear && book.publicationYear >= parseInt(filters.yearFrom))) &&
       (!filters.yearTo || (book.publicationYear && book.publicationYear <= parseInt(filters.yearTo))));

    return matchesSearch && matchesCategory && matchesLanguage && matchesYear;
  });

  const handleEdit = (book) => {
    if (!isAdmin) {
      alert('Sadece admin kullanıcılar kitap düzenleyebilir!');
      return;
    }
    setEditingBook(book);
    setShowEditDialog(true);
  };

  const handleEditSubmit = async (bookData) => {
    await onUpdate(editingBook.id, bookData);
    setShowEditDialog(false);
    setEditingBook(null);
  };

  const handleAddSubmit = async (bookData) => {
    await onAdd(bookData);
    setShowAddDialog(false);
  };

  const handleAddReview = (book) => {
    setReviewingBook(book);
    setShowReviewDialog(true);
  };

  const handleDelete = (book) => {
    if (!isAdmin) {
      alert('Sadece admin kullanıcılar kitap silebilir!');
      return;
    }
    setDeletingBook(book);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    await onDelete(deletingBook.id);
    setShowDeleteDialog(false);
    setDeletingBook(null);
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LibraryIcon color="primary" />
            Kitap Koleksiyonu
          </Typography>
          <Chip label="Yükleniyor..." color="primary" variant="outlined" />
        </Box>
        
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={80} height={36} />
                  <Skeleton variant="rectangular" width={80} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
             {/* Header */}
       <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
         <Typography variant="h4" component="h1" sx={{ 
           display: 'flex', 
           alignItems: 'center', 
           gap: 1,
           color: theme.palette.mode === 'light' ? '#1e293b' : '#f1f5f9'
         }}>
           <LibraryIcon color="primary" />
           Kitap Koleksiyonu
         </Typography>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
           <Chip 
             label={`${books.length} kitap`} 
             color="primary" 
             variant="outlined"
             icon={<BookIcon />}
           />
           {isAdmin && (
             <Button
               variant="contained"
               startIcon={<AddIcon />}
               onClick={() => setShowAddDialog(true)}
               sx={{
                 borderRadius: 2,
                 px: 3,
                 py: 1,
                 background: theme.palette.mode === 'light' 
                   ? 'linear-gradient(45deg, #3b82f6, #1d4ed8)' 
                   : 'linear-gradient(45deg, #60a5fa, #3b82f6)',
                 '&:hover': {
                   background: theme.palette.mode === 'light' 
                     ? 'linear-gradient(45deg, #1d4ed8, #1e40af)' 
                     : 'linear-gradient(45deg, #3b82f6, #2563eb)',
                 }
               }}
             >
               Kitap Ekle
             </Button>
           )}
           {isAdmin && (
             <Chip 
               label="Admin" 
               color="secondary" 
               icon={<AdminIcon />}
               variant="filled"
             />
           )}
         </Box>
       </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Kitap adı veya yazar ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                label="Kategori"
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Tümü</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Language Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Dil</InputLabel>
              <Select
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                label="Dil"
                startAdornment={
                  <InputAdornment position="start">
                    <LanguageIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Tümü</em>
                </MenuItem>
                <MenuItem value="Türkçe">Türkçe</MenuItem>
                <MenuItem value="İngilizce">İngilizce</MenuItem>
                <MenuItem value="Almanca">Almanca</MenuItem>
                <MenuItem value="Fransızca">Fransızca</MenuItem>
                <MenuItem value="İspanyolca">İspanyolca</MenuItem>
                <MenuItem value="Diğer">Diğer</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Year Range */}
          <Grid item xs={12} sm={6} md={1}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Yıl"
              label="Başlangıç"
              type="number"
              value={filters.yearFrom}
              onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Yıl"
              label="Bitiş"
              type="number"
              value={filters.yearTo}
              onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <Fade in timeout={500}>
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <BookIcon sx={{ 
              fontSize: 80, 
              color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8', 
              mb: 2 
            }} />
            <Typography variant="h5" sx={{ 
              color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8',
              mb: 2
            }}>
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz kitap eklenmemiş'}
            </Typography>
            <Typography variant="body1" sx={{ 
              color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8'
            }}>
              {searchTerm 
                ? `"${searchTerm}" için sonuç bulunamadı. Farklı bir arama yapmayı deneyin.`
                : (isAdmin 
                  ? 'İlk kitabınızı eklemek için sağ üstteki + butonuna tıklayın.'
                  : 'Henüz kitap eklenmemiş. Admin kullanıcı kitap ekleyebilir.')
              }
            </Typography>
          </Box>
        </Fade>
      ) : (
        <Grid container spacing={2}>
          {filteredBooks.map((book, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <Fade in timeout={300 + index * 100}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    background: theme.palette.mode === 'light' 
                      ? 'rgba(255, 255, 255, 0.9)' 
                      : 'rgba(30, 41, 59, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: theme.palette.mode === 'light' 
                      ? '1px solid rgba(255, 255, 255, 0.2)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.palette.mode === 'light' 
                        ? '0 8px 32px rgba(0, 0, 0, 0.1)' 
                        : '0 8px 32px rgba(0, 0, 0, 0.3)',
                      background: theme.palette.mode === 'light' 
                        ? 'rgba(255, 255, 255, 0.95)' 
                        : 'rgba(30, 41, 59, 0.95)',
                    },
                  }}
                >
                  <CardContent sx={{ 
                    flexGrow: 1,
                    color: theme.palette.mode === 'light' ? '#1e293b' : '#f1f5f9'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                      <BookIcon color="primary" sx={{ mt: 0.5 }} />
                      <Typography variant="h6" component="h2" sx={{ 
                        fontWeight: 600, 
                        lineHeight: 1.3,
                        color: theme.palette.mode === 'light' ? '#1e293b' : '#f1f5f9'
                      }}>
                        {book.title}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8'
                      }}>
                        {book.author}
                      </Typography>
                    </Box>
                    
                    {book.publicationYear && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Chip 
                          label={book.publicationYear} 
                          size="small" 
                          variant="outlined"
                          color="secondary"
                        />
                      </Box>
                    )}

                    {book.category && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CategoryIcon fontSize="small" color="action" />
                        <Chip 
                          label={book.category.name} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                    )}

                    {book.language && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LanguageIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8'
                        }}>
                          {book.language}
                        </Typography>
                      </Box>
                    )}

                    {book.pageCount && (
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8',
                        mb: 1 
                      }}>
                        {book.pageCount} sayfa
                      </Typography>
                    )}


                  </CardContent>
                  
                                     <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                     <Box>
                       <Button
                         size="small"
                         onClick={() => {
                           setSelectedBook(book);
                           setShowBookDetails(true);
                         }}
                         variant="outlined"
                         color="primary"
                         sx={{ mr: 1 }}
                       >
                         Detaylar
                       </Button>
                       <Button
                         size="small"
                         startIcon={<CommentIcon />}
                         onClick={() => handleAddReview(book)}
                         variant="outlined"
                         color="secondary"
                       >
                         Yorum
                       </Button>
                     </Box>
                     {isAdmin && (
                       <Box>
                         <Button
                           size="small"
                           startIcon={<EditIcon />}
                           onClick={() => handleEdit(book)}
                           variant="outlined"
                           color="primary"
                           sx={{ mr: 1 }}
                         >
                           Düzenle
                         </Button>
                         <Button
                           size="small"
                           startIcon={<DeleteIcon />}
                           onClick={() => handleDelete(book)}
                           variant="outlined"
                           color="error"
                         >
                           Sil
                         </Button>
                       </Box>
                     )}
                   </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

             {/* Add Dialog */}
       <Dialog 
         open={showAddDialog} 
         onClose={() => setShowAddDialog(false)}
         maxWidth="sm"
         fullWidth
         TransitionComponent={Transition}
       >
         <DialogTitle>Yeni Kitap Ekle</DialogTitle>
         <DialogContent>
           <BookForm
             onSubmit={handleAddSubmit}
             onCancel={() => setShowAddDialog(false)}
           />
         </DialogContent>
       </Dialog>

               {/* Edit Dialog */}
        <Dialog 
          open={showEditDialog} 
          onClose={() => setShowEditDialog(false)}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Transition}
        >
          <DialogTitle>Kitap Düzenle</DialogTitle>
          <DialogContent>
            <BookForm
              initialData={editingBook}
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog 
          open={showReviewDialog} 
          onClose={() => setShowReviewDialog(false)}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Transition}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CommentIcon color="primary" />
              <Typography variant="h6">
                {reviewingBook?.title} - Yorum Ekle
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <ReviewForm
              bookId={reviewingBook?.id}
              userId={userId}
              onSubmit={() => {
                setShowReviewDialog(false);
                setReviewingBook(null);
              }}
              onCancel={() => {
                setShowReviewDialog(false);
                setReviewingBook(null);
              }}
            />
          </DialogContent>
        </Dialog>

      {/* Book Details Dialog */}
      <Dialog 
        open={showBookDetails} 
        onClose={() => setShowBookDetails(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BookIcon color="primary" />
            <Typography variant="h6">{selectedBook?.title}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBook && (
            <Box>
                             <Grid container spacing={3}>
                 <Grid item xs={12}>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {selectedBook.title}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Yazar:</strong> {selectedBook.author}
                  </Typography>
                  
                  {selectedBook.publicationYear && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Yayın Yılı:</strong> {selectedBook.publicationYear}
                    </Typography>
                  )}
                  
                  
                  
                  {selectedBook.category && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Kategori:</strong> {selectedBook.category.name}
                    </Typography>
                  )}
                  
                  {selectedBook.language && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Dil:</strong> {selectedBook.language}
                    </Typography>
                  )}
                  
                  {selectedBook.pageCount && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Sayfa Sayısı:</strong> {selectedBook.pageCount}
                    </Typography>
                  )}
                  
                  
                  
                  {selectedBook.description && (
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Açıklama:</strong>
                    </Typography>
                  )}
                  
                  {selectedBook.description && (
                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {selectedBook.description}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              
              {/* Reviews Section */}
              {userId && (
                <ReviewList 
                  bookId={selectedBook.id} 
                  userId={userId}
                  onReviewUpdate={() => {
                    // Refresh book data if needed
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookDetails(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Kitap Sil</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              "{deletingBook?.title}" kitabını silmek istediğinizden emin misiniz?
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Bu işlem geri alınamaz.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            İptal
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookList; 