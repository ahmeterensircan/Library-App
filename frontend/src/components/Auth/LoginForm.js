import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
  useTheme
} from '@mui/material';
import { useSnackbar } from 'notistack';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const raw = await response.text();
      let data;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (_) {
        data = null;
      }

      if (response.ok) {
        const token = data?.token;
        const user = data?.user;
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          enqueueSnackbar('Başarıyla giriş yapıldı!', { variant: 'success' });
          onLogin(user, token);
        } else {
          enqueueSnackbar('Beklenmeyen yanıt alındı', { variant: 'warning' });
        }
      } else {
        const backendMessage =
          (data && (data.message || data.error)) ||
          (raw && raw.trim()) ||
          'Giriş yapılamadı';
        setError(backendMessage);
        enqueueSnackbar(backendMessage, { variant: 'error' });
      }
    } catch (err) {
      setError('Bağlantı hatası');
      enqueueSnackbar('Bağlantı hatası', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          background: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: theme.palette.mode === 'light' 
            ? '1px solid rgba(255, 255, 255, 0.2)' 
            : '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ 
          mb: 3,
          color: theme.palette.mode === 'light' ? '#1e293b' : '#f1f5f9',
          fontWeight: 600
        }}>
          Giriş Yap
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Kullanıcı Adı"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              },
              '& .MuiInputBase-input': {
                color: theme.palette.mode === 'light' ? '#1e293b' : '#f1f5f9',
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Şifre"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              },
              '& .MuiInputBase-input': {
                color: theme.palette.mode === 'light' ? '#1e293b' : '#f1f5f9',
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 2,
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
            {loading ? <CircularProgress size={24} /> : 'Giriş Yap'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ 
              color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8'
            }}>
              Hesabınız yok mu?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={onSwitchToRegister}
                sx={{ 
                  cursor: 'pointer',
                  color: theme.palette.mode === 'light' ? '#3b82f6' : '#60a5fa',
                  '&:hover': {
                    color: theme.palette.mode === 'light' ? '#1d4ed8' : '#3b82f6',
                  }
                }}
              >
                Kayıt Ol
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm; 