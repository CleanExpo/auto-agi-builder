import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Chip, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Pagination,
  LinearProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  FilterList as FilterIcon, 
  Clear as ClearIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewGridIcon,
  AutoAwesome as AIProcessIcon,
  Description as DocumentIcon,
  PictureAsPdf as PDFIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  UploadFile as UploadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { documentService } from '../../services/documentService';
import DocumentUpload from './DocumentUpload';
import LoadingIndicator from '../common/LoadingIndicator';
import EmptyState from '../common/EmptyState';

const DocumentList = ({ projectId }) => {
  // State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [documentToPreview, setDocumentToPreview] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 12,
  });
  const [filters, setFilters] = useState({
    document_type: '',
    is_processed: ''
  });
  
  // Fetch documents
  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId, pagination.page]);
  
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '') {
          if (key === 'is_processed') {
            cleanFilters[key] = filters[key] === 'true';
          } else {
            cleanFilters[key] = filters[key];
          }
        }
      });
      
      const data = await documentService.getDocumentsByProject(
        projectId,
        cleanFilters,
        pagination.page,
        pagination.pageSize
      );
      
      setDocuments(data.items);
      setPagination({
        ...pagination,
        total: data.total
      });
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handlers
  const handlePageChange = (event, value) => {
    setPagination({
      ...pagination,
      page: value
    });
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const applyFilters = () => {
    setPagination({
      ...pagination,
      page: 1 // Reset to first page when filters change
    });
    fetchDocuments();
  };
  
  const clearFilters = () => {
    setFilters({
      document_type: '',
      is_processed: ''
    });
    setPagination({
      ...pagination,
      page: 1
    });
    fetchDocuments();
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };
  
  const handleUploadClose = () => {
    setUploadDialogOpen(false);
  };
  
  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    fetchDocuments();
  };
  
  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      setLoading(true);
      try {
        await documentService.deleteDocument(documentToDelete.id);
        fetchDocuments();
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Failed to delete document. Please try again.');
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
      }
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };
  
  const handlePreviewClick = (document) => {
    setDocumentToPreview(document);
    setPreviewDialogOpen(true);
  };
  
  const handlePreviewClose = () => {
    setPreviewDialogOpen(false);
    setDocumentToPreview(null);
  };
  
  const handleDownload = async (document) => {
    try {
      await documentService.downloadDocument(document.id);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document. Please try again.');
    }
  };
  
  const handleProcessDocument = async (document) => {
    try {
      await documentService.processDocument(document.id);
      fetchDocuments();
    } catch (err) {
      console.error('Error processing document:', err);
      setError('Failed to process document. Please try again.');
    }
  };
  
  // Helper functions
  const getDocumentIcon = (docType) => {
    switch (docType) {
      case 'pdf':
        return <PDFIcon />;
      case 'image':
        return <ImageIcon />;
      case 'code':
        return <CodeIcon />;
      default:
        return <DocumentIcon />;
    }
  };
  
  const getDocumentTypeLabel = (docType) => {
    switch (docType) {
      case 'pdf':
        return 'PDF';
      case 'image':
        return 'Image';
      case 'code':
        return 'Code';
      case 'text':
        return 'Text';
      case 'spreadsheet':
        return 'Spreadsheet';
      case 'presentation':
        return 'Presentation';
      default:
        return 'Document';
    }
  };
  
  // Render functions
  const renderGridView = () => (
    <Grid container spacing={3}>
      {documents.map(document => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
          <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box 
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: 'background.subtle',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Box sx={{ mr: 1, color: 'primary.main' }}>
                {getDocumentIcon(document.document_type)}
              </Box>
              <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1 }}>
                {document.title}
              </Typography>
              <Chip 
                size="small" 
                label={getDocumentTypeLabel(document.document_type)} 
                color="primary"
                variant="outlined"
              />
            </Box>
            
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  mb: 2, 
                  height: 60, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical' 
                }}
              >
                {document.description || 'No description available.'}
              </Typography>
              
              <Typography variant="caption" color="textSecondary" display="block">
                Uploaded: {format(new Date(document.created_at), 'MMM d, yyyy')}
              </Typography>
              
              <Typography variant="caption" color="textSecondary" display="block">
                Size: {document.file_size ? `${(document.file_size / 1024).toFixed(2)} KB` : 'Unknown'}
              </Typography>
              
              {document.is_processed && (
                <Chip 
                  size="small" 
                  label="AI Processed" 
                  color="success"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            </CardContent>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1, pt: 0 }}>
              <Tooltip title="Preview">
                <IconButton size="small" onClick={() => handlePreviewClick(document)}>
                  <PreviewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton size="small" onClick={() => handleDownload(document)}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {!document.is_processed && (
                <Tooltip title="Process with AI">
                  <IconButton size="small" onClick={() => handleProcessDocument(document)}>
                    <AIProcessIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => handleDeleteClick(document)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
  
  const renderListView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Upload Date</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Processed</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map(document => (
            <TableRow key={document.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1, color: 'primary.main' }}>
                    {getDocumentIcon(document.document_type)}
                  </Box>
                  {document.title}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  size="small" 
                  label={getDocumentTypeLabel(document.document_type)} 
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {format(new Date(document.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {document.file_size ? `${(document.file_size / 1024).toFixed(2)} KB` : 'Unknown'}
              </TableCell>
              <TableCell>
                {document.is_processed ? (
                  <Chip 
                    size="small" 
                    label="Processed" 
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Chip 
                    size="small" 
                    label="Not Processed" 
                    variant="outlined"
                  />
                )}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Preview">
                  <IconButton size="small" onClick={() => handlePreviewClick(document)}>
                    <PreviewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton size="small" onClick={() => handleDownload(document)}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {!document.is_processed && (
                  <Tooltip title="Process with AI">
                    <IconButton size="small" onClick={() => handleProcessDocument(document)}>
                      <AIProcessIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDeleteClick(document)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  return (
    <Box>
      {/* Header and controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Project Documents
          <Badge 
            color="primary" 
            badgeContent={pagination.total} 
            sx={{ ml: 1 }} 
            max={999}
          />
        </Typography>
        
        <Box>
          <Button 
            variant="contained" 
            startIcon={<UploadIcon />} 
            onClick={handleUploadClick}
            sx={{ mr: 1 }}
          >
            Upload Document
          </Button>
          
          <Button 
            variant={showFilters ? "contained" : "outlined"}
            color={showFilters ? "primary" : "default"}
            startIcon={showFilters ? <ClearIcon /> : <FilterIcon />}
            onClick={toggleFilters}
            sx={{ mr: 1 }}
          >
            {showFilters ? "Hide Filters" : "Filters"}
          </Button>
          
          <Box sx={{ display: 'inline-flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Tooltip title="Grid View">
              <IconButton 
                color={viewMode === 'grid' ? 'primary' : 'default'} 
                onClick={() => handleViewModeChange('grid')}
              >
                <ViewGridIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton 
                color={viewMode === 'list' ? 'primary' : 'default'} 
                onClick={() => handleViewModeChange('list')}
              >
                <ViewListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-label">Document Type</InputLabel>
                <Select
                  labelId="type-label"
                  name="document_type"
                  value={filters.document_type}
                  onChange={handleFilterChange}
                  label="Document Type"
                >
                  <MenuItem value="">Any Type</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="code">Code</MenuItem>
                  <MenuItem value="spreadsheet">Spreadsheet</MenuItem>
                  <MenuItem value="presentation">Presentation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth size="small">
                <InputLabel id="processed-label">Processing Status</InputLabel>
                <Select
                  labelId="processed-label"
                  name="is_processed"
                  value={filters.is_processed}
                  onChange={handleFilterChange}
                  label="Processing Status"
                >
                  <MenuItem value="">Any Status</MenuItem>
                  <MenuItem value="true">Processed by AI</MenuItem>
                  <MenuItem value="false">Not Processed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={applyFilters}
                sx={{ mr: 1 }}
              >
                Apply
              </Button>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Main content */}
      {loading ? (
        <LoadingIndicator message="Loading documents..." />
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={fetchDocuments}
          >
            Try Again
          </Button>
        </Box>
      ) : documents.length === 0 ? (
        <EmptyState 
          title="No documents found"
          description="Upload documents to extract requirements and generate prototypes."
          actionLabel="Upload Document"
          onAction={handleUploadClick}
          icon="document"
        />
      ) : (
        <>
          {/* View mode toggle & content */}
          <Box sx={{ mb: 3 }}>
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </Box>
          
          {/* Pagination */}
          {pagination.total > pagination.pageSize && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={Math.ceil(pagination.total / pagination.pageSize)} 
                page={pagination.page} 
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadClose} maxWidth="md" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <DocumentUpload 
            projectId={projectId}
            onClose={handleUploadClose}
            onSuccess={handleUploadSuccess}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the document "{documentToDelete?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={handlePreviewClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {documentToPreview?.title}
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />} 
              onClick={() => handleDownload(documentToPreview)}
            >
              Download
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ minHeight: '70vh', position: 'relative' }}>
          {/* Document preview would be implemented based on document type */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Document preview will be implemented in the next iteration.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentList;
