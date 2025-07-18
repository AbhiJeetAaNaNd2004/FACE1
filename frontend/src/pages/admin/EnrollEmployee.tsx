import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid, Alert, Avatar } from '@mui/material';
import { Person as PersonIcon, Upload as UploadIcon } from '@mui/icons-material';
import { apiService } from '../../services/api';

const EnrollEmployee: React.FC = () => {
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    department: '',
    role: '',
    email: '',
    phone: '',
    date_joined: new Date().toISOString().split('T')[0]
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please select an image file');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const imageBase64 = await apiService.convertFileToBase64(imageFile);
      await apiService.enrollEmployee({
        employee: formData,
        image_data: imageBase64
      });
      setMessage('Employee enrolled successfully!');
      setFormData({
        employee_id: '',
        name: '',
        department: '',
        role: '',
        email: '',
        phone: '',
        date_joined: new Date().toISOString().split('T')[0]
      });
      setImageFile(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to enroll employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Enroll New Employee</Typography>
      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Card elevation={2}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Employee ID"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Date Joined"
                  type="date"
                  value={formData.date_joined}
                  onChange={(e) => setFormData({...formData, date_joined: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                  {imageFile ? imageFile.name : 'Upload Face Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<PersonIcon />}
                >
                  {loading ? 'Enrolling...' : 'Enroll Employee'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
export default EnrollEmployee;