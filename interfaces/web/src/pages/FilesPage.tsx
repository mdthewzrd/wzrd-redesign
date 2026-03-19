import React, { useState, useEffect } from 'react';
import { Folder, File, Loader2, Search, ChevronRight, ChevronDown, FileCode, Terminal, Maximize2, Minimize2, Copy, Eye, FolderOpen } from 'lucide-react';
import { useAtom } from 'jotai';
import { ecosystemFilesAtom, loadingEcosystemFilesAtom, selectedFileAtom, currentProjectAtom } from '@/stores/atoms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  fileCount?: number;
  dirCount?: number;
  children?: FileItem[];
  expanded?: boolean;
}

interface ProjectOption {
  key: string;
  name: string;
  color: string;
}

export function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading] = useAtom(loadingEcosystemFilesAtom);
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom) as any;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [previewMode, setPreviewMode] = useState<'modal' | 'split'>('modal');
  const [selectedProject, setSelectedProject] = useAtom(currentProjectAtom);

  const availableProjects: ProjectOption[] = [
    { key: 'wzrd.dev', name: 'WZRD.dev', color: '#fbbf24' },
    { key: 'edge.dev', name: 'edge.dev', color: '#10b981' },
    { key: 'dilution-agent', name: 'Dilution Agent', color: '#8b5cf6' },
    { key: 'press-agent', name: 'Press Agent', color: '#f472b6' },
  ];

  useEffect(() => {
    loadEcosystemFiles();
  }, [selectedProject]);

  useEffect(() => {
    if (files.length === 0) {
      loadEcosystemFiles();
    }
  }, [files.length]);

  useEffect(() => {
    if (files.length > 0 && expandedFolders.size === 0) {
      setExpandedFolders(new Set(files.filter(f => f.type === 'dir').slice(0, 3).map(f => f.path)));
    }
  }, [files]);

  const loadEcosystemFiles = async () => {
    try {
      const response = await fetch('/api/ecosystem-files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error('Failed to load ecosystem files:', e);
    }
  };

  const openFile = async (path: string, name: string) => {
    try {
      const response = await fetch(`/api/file-content?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedFile({ name, path, content: data.content || 'No content available' });
      }
    } catch (e) {
      setSelectedFile({ name, path, content: 'Failed to load file content' });
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleAllFolders = () => {
    if (expandedFolders.size > 0) {
      setExpandedFolders(new Set());
    } else {
      setExpandedFolders(new Set(files.filter(f => f.type === 'dir').map(f => f.path)));
    }
  };

  const filterFiles = (items: FileItem[], query: string): FileItem[] => {
    if (!query) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery)
    );
  };

  const getFileIcon = (item: FileItem | { name: string; path: string; content: string }) => {
    if ('type' in item && item.type === 'dir') {
      return expandedFolders.has(item.path) ? <FolderOpen className="w-4 h-4 text-amber-400" /> : <Folder className="w-4 h-4 text-primary" />;
    }
    return <File className="w-4 h-4 text-blue-400" />;
  };

  const countItems = (items: FileItem[]) => {
    let files = 0;
    let dirs = 0;

    for (const item of items) {
      if (item.type === 'file') files++;
      else if (item.type === 'dir') {
        dirs++;
        if (item.children) countItems(item.children);
      }
    }

    return { files, dirs };
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="file-tree">
        {items
          .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item, idx) => {
            const dirCount = item.dirCount !== undefined ? item.dirCount : 0;
            const fileCount = item.fileCount !== undefined ? item.fileCount : 0;

            return (
              <div key={`${item.path}-${idx}`} className="file-item">
                <div
                  className={`file-node ${item.type === 'dir' ? 'folder' : ''} ${
                    expandedFolders.has(item.path) ? 'expanded' : ''
                  }`}
                  style={{ paddingLeft: `${depth * 24 + 12}px` }}
                >
                  <div
                    className="file-icon-wrapper"
                    onClick={() => item.type === 'dir' && toggleFolder(item.path)}
                  >
                    {getFileIcon(item)}
                  </div>
                  <div className="file-info">
                    <span className="file-name">{item.name}</span>
                    {item.type === 'dir' && (dirCount > 0 || fileCount > 0) && (
                      <span className="file-count">
                        {dirCount} dirs, {fileCount} files
                      </span>
                    )}
                  </div>
                  {item.type === 'file' && item.size !== undefined && (
                    <span className="file-size">{formatBytes(item.size)}</span>
                  )}
                </div>

                {/* Nested directories */}
                {item.type === 'dir' && item.children && expandedFolders.has(item.path) && (
                  <div className="nested-tree">
                    {renderFileTree(item.children, depth + 1)}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    );
  };

  const counts = countItems(files);
  const filteredFiles = filterFiles(files, searchQuery);

  return (
    <div className="files-page">
      {/* Header */}
      <div className="files-header">
        <div className="header-left">
          <h1 className="page-title">Files</h1>
          <p className="page-subtitle">
            {availableProjects.find(p => p.key === selectedProject)?.name || 'WZRD.dev'} • {counts.files} files, {counts.dirs} directories
          </p>
        </div>
        <div className="header-actions">
          {/* Project Selector */}
          <div className="project-dropdown">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="project-select"
              style={{
                backgroundColor: availableProjects.find(p => p.key === selectedProject)?.color + '20' || undefined,
                borderColor: availableProjects.find(p => p.key === selectedProject)?.color + '40' || undefined,
              }}
            >
              {availableProjects.map(project => (
                <option key={project.key} value={project.key}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <Button
            variant={viewMode === 'tree' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode(viewMode === 'tree' ? 'grid' : 'tree')}
          >
            {viewMode === 'tree' ? <Terminal className="w-4 h-4 mr-2" /> : <FolderOpen className="w-4 h-4 mr-2" />}
            {viewMode === 'tree' ? 'Tree View' : 'Grid View'}
          </Button>

          {/* Preview Mode Toggle */}
          <Button
            variant={previewMode === 'modal' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode(previewMode === 'modal' ? 'split' : 'modal')}
          >
            {previewMode === 'modal' ? <Eye className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
            {previewMode === 'modal' ? 'Modal Preview' : 'Split View'}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <div className="relative">
          <Search className="search-icon" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`files-content ${previewMode === 'split' && selectedFile ? 'split-view' : ''}`}>
        {/* File Tree */}
        <div className={`file-tree-container ${previewMode === 'modal' ? 'modal-mode' : 'split-mode'}`}>
          <Card>
            <CardHeader>
              <div className="card-header-content">
                <div>
                  <CardTitle className="card-title">Ecosystem Files</CardTitle>
                  <CardDescription>Browse WZRD.dev project structure</CardDescription>
                </div>
                <div className="tree-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllFolders}
                    title={expandedFolders.size > 0 ? 'Collapse all' : 'Expand all'}
                  >
                    {expandedFolders.size > 0 ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="card-content">
              {loading ? (
                <div className="loading-state">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p>Loading files...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="empty-state">
                  <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p>No files found</p>
                </div>
              ) : (
                renderFileTree(filteredFiles)
              )}
            </CardContent>
          </Card>
        </div>

        {/* File Preview (Modal) */}
        {previewMode === 'modal' && selectedFile && (
          <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
            <DialogContent className="file-preview-dialog">
              <DialogHeader>
                <DialogTitle className="file-preview-title">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile)}
                    <span className="file-name-truncate">{selectedFile.name}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="file-preview-content">
                <pre className="file-code-preview">{selectedFile.content}</pre>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* File Preview (Split View) */}
        {previewMode === 'split' && (
          <Card className={`file-preview-card ${!selectedFile ? 'hidden' : 'visible'}`}>
            <CardHeader>
              <div className="preview-header">
                <div className="preview-title">
                  {selectedFile ? (
                    <>
                      <div className="flex items-center gap-2">
                        {getFileIcon(selectedFile)}
                        <span className="file-name-truncate">{selectedFile.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          title="Close preview"
                        >
                          <Minimize2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="preview-badges">
                        <span className="preview-badge path">{selectedFile.path}</span>
                        {'size' in selectedFile && selectedFile.size ? <span className="preview-badge size">{formatBytes(selectedFile.size as number)}</span> : null}
                      </div>
                    </>
                  ) : (
                    <div className="empty-preview">
                      <FileCode className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p>Select a file to preview</p>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedFile ? (
                <pre className="file-code-preview">{selectedFile.content}</pre>
              ) : (
                <div className="empty-preview-state">
                  <p>No file selected</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
