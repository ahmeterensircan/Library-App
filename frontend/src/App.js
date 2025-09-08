import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Switch,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  LibraryBooks as LibraryIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import BookList from './components/BookList';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('light');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [anchorEl, setAnchorEl] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const API_BASE_URL = 'http://localhost:8080/books';

  // Tema oluşturma
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#2563eb' : '#60a5fa',
      },
      secondary: {
        main: mode === 'light' ? '#7c3aed' : '#a78bfa',
      },
      background: {
        default: mode === 'light' ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' : 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
        paper: mode === 'light' ? '#ffffff' : '#1f2937',
      },
      text: {
        primary: mode === 'light' ? '#1e293b' : '#f1f5f9',
        secondary: mode === 'light' ? '#64748b' : '#94a3b8',
      },
      divider: mode === 'light' ? '#e2e8f0' : '#334155',
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h4: {
        fontWeight: 600,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: mode === 'light' 
              ? '0 8px 32px rgba(0,0,0,0.1)' 
              : '0 8px 32px rgba(0,0,0,0.3)',
            border: mode === 'light' 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' 
              ? '0 8px 25px rgba(37, 99, 235, 0.3)' 
              : '0 8px 25px rgba(96, 165, 250, 0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            border: mode === 'light' 
              ? '1px solid #e2e8f0' 
              : '1px solid #334155',
          },
        },
      },
    },
  });

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchBooks();
    }
  }, [user, token]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Kitaplar yüklenirken hata oluştu');
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });
      
      if (!response.ok) {
        throw new Error('Kitap eklenirken hata oluştu');
      }
      
      await fetchBooks();
      enqueueSnackbar('Kitap başarıyla eklendi!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });
      
      if (!response.ok) {
        throw new Error('Kitap güncellenirken hata oluştu');
      }
      
      await fetchBooks();
      enqueueSnackbar('Kitap başarıyla güncellendi!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  const deleteBook = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Kitap silinirken hata oluştu');
      }
      
      await fetchBooks();
      enqueueSnackbar('Kitap başarıyla silindi!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  const toggleColorMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleRegister = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setAnchorEl(null);
    enqueueSnackbar('Başarıyla çıkış yapıldı', { variant: 'success' });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // If user is not authenticated, show auth forms
  if (!user || !token) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          minHeight: '100vh', 
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          backgroundAttachment: 'fixed',
          position: 'relative'
        }}>
          {/* Theme Toggle Button for Auth Screens */}
          <Box sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            zIndex: 1000 
          }}>
            <IconButton
              onClick={toggleColorMode}
              sx={{
                background: mode === 'light' 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(10px)',
                border: mode === 'light' 
                  ? '1px solid rgba(255, 255, 255, 0.2)' 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                color: mode === 'light' ? '#3b82f6' : '#60a5fa',
                '&:hover': {
                  background: mode === 'light' 
                    ? 'rgba(255, 255, 255, 0.95)' 
                    : 'rgba(15, 23, 42, 0.95)',
                }
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Box>
          
          {authMode === 'login' ? (
            <LoginForm 
              onLogin={handleLogin}
              onSwitchToRegister={() => setAuthMode('register')}
            />
          ) : (
            <RegisterForm 
              onRegister={handleRegister}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
              <Box sx={{ 
          minHeight: '100vh', 
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          backgroundAttachment: 'fixed'
        }}>
        {/* App Bar */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: mode === 'light' 
              ? 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)'
              : 'linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Toolbar>
            <LibraryIcon sx={{ 
              mr: 2, 
              color: mode === 'light' ? '#3b82f6' : '#60a5fa',
              fontSize: 28
            }} />
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1, 
              color: mode === 'light' ? '#1e293b' : '#f1f5f9',
              fontWeight: 600
            }}>
              Kütüphane Yönetim Sistemi
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ 
                color: mode === 'light' ? '#64748b' : '#94a3b8'
              }}>
                Hoş geldin, {user.username}!
              </Typography>
              <IconButton
                onClick={handleMenuOpen}
                sx={{ color: mode === 'light' ? '#3b82f6' : '#60a5fa' }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: mode === 'light' ? '#3b82f6' : '#60a5fa' }}>
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    background: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: mode === 'light' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Çıkış Yap
                </MenuItem>
              </Menu>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {mode === 'light' ? (
                  <LightModeIcon sx={{ color: '#fbbf24', fontSize: 20 }} />
                ) : (
                  <DarkModeIcon sx={{ color: '#60a5fa', fontSize: 20 }} />
                )}
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleColorMode}
                  sx={{
                    width: 44,
                    height: 24,
                    padding: 0,
                    '& .MuiSwitch-switchBase': {
                      margin: 0.5,
                      padding: 0,
                      transform: 'translateX(0px)',
                      '&.Mui-checked': {
                        color: '#fff',
                        transform: 'translateX(20px)',
                        '& + .MuiSwitch-track': {
                          backgroundColor: '#334155',
                          opacity: 1,
                          border: 0,
                        },
                      },
                    },
                    '& .MuiSwitch-thumb': {
                      boxSizing: 'border-box',
                      width: 20,
                      height: 20,
                      backgroundColor: mode === 'dark' ? '#ffffff' : '#ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 12,
                      backgroundColor: mode === 'dark' ? '#475569' : '#fbbf24',
                      opacity: 1,
                      transition: 'background-color 500ms',
                      border: mode === 'dark' ? '1px solid #64748b' : '1px solid #f59e0b',
                    },
                  }}
                />
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <BookList 
            books={books} 
            loading={loading}
            onAdd={addBook}
            onUpdate={updateBook}
            onDelete={deleteBook}
            userId={user?.id}
            userRole={user?.role}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
