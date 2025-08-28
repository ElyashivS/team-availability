import { useState } from 'react';
import api from '../utils/api';
import { Box, TextField, Button, Typography, Container } from '@mui/material';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await api.post('/api/login', credentials);
      localStorage.setItem('token', response.data.token);
      window.location.href = '/status';
    } catch (error) {
      setError('Username or password is incorrect');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" mb={3}>Login</Typography>
        <Box sx={{ mb: 2, height: 28, display: 'flex', alignItems: 'center', width: '100%' }}>
          {error && (
            <Typography color="error">{error}</Typography>
          )}
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            label="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
