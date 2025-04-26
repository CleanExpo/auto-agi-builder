import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  Paper,
  LinearProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  Clear as ClearIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Description as FileIcon,
  PictureAsPdf as PDFIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { documentService } from '../../services/documentService';

const DocumentUpload = ({ projectId, onClose, onSuccess }) => {
  // State for file selection and upload
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState({});
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Handle file selection from the system file dialog
  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    
    // Clear the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle removing a file from the list
  const handleRemoveFile = (fileToRemove) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    
    // Also remove from progress and results if present
    if (uploadProgress[fileToRemove.name]) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileToRemove.name];
        return newProgress;
      });
    }
    
    if (uploadResults[fileToRemove.name]) {
      setUploadResults(prev => {
        const newResults = { ...prev };
        delete newResults[fileToRemove.name];
        return newResults;
      });
    }
  };
  
  // Detect document type from file
  const detectDocumentType = (file) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      return 'pdf';
    } else if (/\.(jpeg|jpg|png|gif|bmp|svg)$/.test(fileName)) {
      return 'image';
    } else if (/\.(doc|docx|odt|rtf|txt|md)$/.test(fileName)) {
      return 'text';
    } else if (/\.(xls|xlsx|csv|ods)$/.test(fileName)) {
      return 'spreadsheet';
    } else if (/\.(ppt|pptx|odp)$/.test(fileName)) {
      return 'presentation';
    } else if (/\.(js|ts|py|java|c|cpp|cs|html|css|php|rb|go|rust|swift|json|xml)$/.test(fileName)) {
      return 'code';
    } else {
      return 'other';
    }
  };
  
  // Get icon for a file type
  const getFileIcon = (file) => {
    const docType = detectDocumentType(file);
    
    switch (docType) {
      case 'pdf':
        return <PDFIcon />;
      case 'image':
        return <ImageIcon />;
      case 'code':
        return <CodeIcon />;
      default:
        return <FileIcon />;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }
    
    setError(null);
    setUploading(true);
    
    // Initialize progress for each file
    const initialProgress = {};
    files.forEach(file => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);
    
    // Initialize results object
    const results = {};
    
    try {
      // Upload each file
      for (const file of files) {
        try {
          // Prepare form data with file metadata
          const formData = new FormData();
          formData.append('file', file);
          formData.append('project_id', projectId);
          formData.append('title', file.name);
          formData.append('description', description);
          formData.append('document_type', documentType || detectDocumentType(file));
          
          // Upload the file with progress tracking
          const result = await documentService.uploadDocument(
            formData,
            (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: percentCompleted
              }));
            }
          );
          
          // Store successful result
          results[file.name] = { success: true, data: result };
        } catch (err) {
          console.error(`Error uploading ${file.name}:`, err);
          // Store error result
          results[file.name] = { success: false, error: err.message || 'Upload failed' };
        }
      }
      
      setUploadResults(results);
      
      // Check if all uploads were successful
      const allSuccessful = Object.values(results).every(result => result.success);
      if (allSuccessful) {
        if (onSuccess) {
          // Wait a moment to show success state before closing
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error in upload process:', err);
      setError('An error occurred during the upload process. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Check if any upload is complete
  const isAnyUploadComplete = Object.values(uploadResults).length > 0;
  
  // Check if all files were successfully uploaded
  const allUploadsSuccessful = 
    isAnyUploadComplete && 
    Object.values(uploadResults).every(result => result.success);
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {allUploadsSuccessful && (
        <Alert severity="success" sx={{ mb: 3 }}>
          All files uploaded successfully!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Drop zone for files */}
        <Grid item xs={12}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="file-upload-input"
          />
          <label htmlFor="file-upload-input">
            <Paper
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                mb: 2,
                backgroundColor: 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
              component="div"
            >
              <UploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drag and drop files here
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                or click to browse files
              </Typography>
              <Button 
                variant="contained" 
                component="span" 
                sx={{ mt: 2 }}
                startIcon={<UploadIcon />}
                disabled={uploading}
              >
                Select Files
              </Button>
            </Paper>
          </label>
        </Grid>
        
        {/* Document type selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={uploading}>
            <InputLabel id="document-type-label">Document Type (Optional)</InputLabel>
            <Select
              labelId="document-type-label"
              id="document-type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              label="Document Type (Optional)"
            >
              <MenuItem value="">Auto-detect</MenuItem>
              <MenuItem value="pdf">PDF Document</MenuItem>
              <MenuItem value="text">Text Document</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="spreadsheet">Spreadsheet</MenuItem>
              <MenuItem value="presentation">Presentation</MenuItem>
              <MenuItem value="code">Code/Source File</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {/* Description field */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="description"
            label="Document Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
          />
        </Grid>
        
        {/* File list */}
        {files.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            <Paper variant="outlined">
              <List>
                {files.map((file, index) => (
                  <React.Fragment key={file.name + index}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        {getFileIcon(file)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                      
                      {/* Show progress, result or delete button based on state */}
                      <ListItemSecondaryAction>
                        {uploadResults[file.name] ? (
                          // Show success/error status
                          uploadResults[file.name].success ? (
                            <Chip 
                              icon={<SuccessIcon />} 
                              label="Uploaded" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              icon={<ErrorIcon />} 
                              label="Failed" 
                              color="error" 
                              size="small" 
                            />
                          )
                        ) : uploading && uploadProgress[file.name] !== undefined ? (
                          // Show progress during upload
                          <Box sx={{ width: 100, mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={uploadProgress[file.name]} 
                            />
                            <Typography variant="caption" align="center" display="block">
                              {uploadProgress[file.name]}%
                            </Typography>
                          </Box>
                        ) : (
                          // Show delete button before upload
                          <IconButton 
                            edge="end" 
                            onClick={() => handleRemoveFile(file)}
                            disabled={uploading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onClose} 
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={uploading || files.length === 0}
          startIcon={uploading ? null : <UploadIcon />}
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </Box>
      
      {/* Overall upload progress */}
      {uploading && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default DocumentUpload;
