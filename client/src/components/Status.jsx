import { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Select, MenuItem, TextField,
  List, ListItem, ListItemText, Paper, FormControl, InputLabel,
  Button
} from '@mui/material';
import api from '../utils/api';

const Status = () => {
  const [currentUser, setCurrentUser] = useState({ username: '', status: '' });
  const [employees, setEmployees] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [error, setError] = useState(' ');
  
  // Fetch current user and all employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(' ');
        const [statusRes, userRes, optionsRes] = await Promise.all([
          api.get('/api/status'),
          api.get('/api/user/me'),
          api.get('/api/status/options')
        ]);

        const employees = statusRes.data;
        const currentUser = employees.find(emp => emp.username === userRes.data.username) || {};

        setAvailableStatuses(optionsRes.data.options || []);
        setCurrentUser(currentUser);
        setEmployees(employees);
      } catch (err) {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  // Update user status
  const handleStatusUpdate = async (newStatus) => {
    try {
      setError('');
      await api.put('/api/status', { status: newStatus });
      setCurrentUser(prev => ({ ...prev, status: newStatus }));
      // Refresh employee list to show updated status
      const statusRes = await api.get('/api/status');
      setEmployees(statusRes.data);
    } catch (error) {
      setError('Failed to update status');
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    if (emp.username === currentUser.username) return false;
    const nameMatch = emp.username.toLowerCase().includes(nameFilter.toLowerCase());
    const statusMatch = statusFilter.length === 0 || statusFilter.includes(emp.status);
    return nameMatch && statusMatch;
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {error && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Hello {currentUser.username}, you are {currentUser.status || 'not set'}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Status Update */}
        <FormControl fullWidth sx={{ mt: 2, mb: 4 }}>
          <InputLabel>Update My Current Status</InputLabel>
          <Select
            value={currentUser.status || ''}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            label="Update My Current Status"
          >
            {availableStatuses.map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>List of Employees</Typography>
        
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ width: 260 }}>
            <InputLabel>Filter By Status</InputLabel>
            <Select
              multiple
              value={statusFilter}
              onChange={(e) => setStatusFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              label="Filter By Status"
              renderValue={(selected) => (selected.length === 0 ? 'All' : selected.join(', '))}
            >
              {availableStatuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Employee List */}
        <Paper elevation={2}>
          {filteredEmployees.length > 0 ? (
            <List>
              {filteredEmployees.map((emp, index) => (
                <ListItem key={emp.username} divider={index !== filteredEmployees.length - 1}>
                  <ListItemText
                    primary={emp.username}
                    secondary={`Status: ${emp.status || 'Not set'}`}
                    secondaryTypographyProps={{ sx: { color: emp.status === 'On Vacation' ? 'text.disabled' : 'text.secondary' } }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No users found
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Status;
