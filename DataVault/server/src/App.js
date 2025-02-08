// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import DocumentView from './pages/DocumentView';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/document/:id" element={<DocumentView />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import DocumentUpload from '../components/DocumentUpload';
import api from '../utils/api';

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newDocument) => {
    setDocuments([...documents, newDocument]);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Your Documents
            </Typography>
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
            <List>
              {documents.map((doc) => (
                <ListItem
                  key={doc._id}
                  button
                  component={Link}
                  to={`/document/${doc._id}`}
                >
                  <ListItemText
                    primary={doc.name}
                    secondary={new Date(doc.updated).toLocaleDateString()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;

// client/src/components/DocumentUpload.js
import React, { useState } from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import api from '../utils/api';

function DocumentUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadIcon />}
          disabled={uploading}
        >
          Upload Document
        </Button>
      </label>
      {uploading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
}

export default DocumentUpload;