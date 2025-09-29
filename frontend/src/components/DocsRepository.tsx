import React, { useState } from 'react';
import { Search, Filter, FileText, Eye, Edit, Download, Share, Calendar, User, Tag, Star, MoreHorizontal, Clock, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface DocsRepositoryProps {
  onNavigate: (page: string, docId?: string) => void;
}

const documents = [
  {
    id: '1',
    title: 'User Management Service Documentation',
    description: 'Comprehensive documentation for the user authentication and management microservice',
    version: 'v3.2',
    createdBy: 'Alice Johnson',
    lastModified: '2024-01-15',
    template: 'Microservice Doc',
    labels: ['Project Phoenix', 'Module: Auth', 'High Priority'],
    status: 'active',
    autoUpdate: true,
    views: 234,
    hasVisuals: true,
    size: 'Large'
  },
  {
    id: '2',
    title: 'AWS Infrastructure Overview',
    description: 'Production AWS environment documentation with architecture diagrams',
    version: 'v1.5',
    createdBy: 'Bob Smith',
    lastModified: '2024-01-14',
    template: 'AWS Infrastructure',
    labels: ['Infrastructure', 'Production', 'Public'],
    status: 'active',
    autoUpdate: true,
    views: 189,
    hasVisuals: true,
    size: 'Medium'
  },
  {
    id: '3',
    title: 'API Gateway Configuration Guide',
    description: 'Setup and configuration documentation for the API gateway service',
    version: 'v2.1',
    createdBy: 'Carol Davis',
    lastModified: '2024-01-12',
    template: 'API Documentation',
    labels: ['API', 'Configuration', 'Internal'],
    status: 'active',
    autoUpdate: false,
    views: 156,
    hasVisuals: false,
    size: 'Small'
  },
  {
    id: '4',
    title: 'Database Schema Reference',
    description: 'Complete database schema documentation with ERD diagrams',
    version: 'v4.0',
    createdBy: 'David Lee',
    lastModified: '2024-01-10',
    template: 'Database Schema',
    labels: ['Database', 'Schema', 'Reference'],
    status: 'archived',
    autoUpdate: false,
    views: 98,
    hasVisuals: true,
    size: 'Large'
  },
  {
    id: '5',
    title: 'Frontend Component Library',
    description: 'React component library documentation with usage examples',
    version: 'v1.8',
    createdBy: 'Eve Wilson',
    lastModified: '2024-01-08',
    template: 'Component Docs',
    labels: ['Frontend', 'React', 'Components'],
    status: 'active',
    autoUpdate: true,
    views: 267,
    hasVisuals: false,
    size: 'Medium'
  }
];

const stats = {
  total: documents.length,
  active: documents.filter(d => d.status === 'active').length,
  autoUpdate: documents.filter(d => d.autoUpdate).length,
  withVisuals: documents.filter(d => d.hasVisuals).length
};

export function DocsRepository({ onNavigate }: DocsRepositoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastModified');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.labels.some(label => label.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesTemplate = filterTemplate === 'all' || doc.template === filterTemplate;
    
    return matchesSearch && matchesStatus && matchesTemplate;
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'views':
        return b.views - a.views;
      case 'version':
        return b.version.localeCompare(a.version);
      case 'lastModified':
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });

  const templates = Array.from(new Set(documents.map(d => d.template)));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Documentation Repository</h1>
        <p className="text-muted-foreground">Browse and manage your generated documentation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Docs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.autoUpdate}</p>
                <p className="text-sm text-muted-foreground">Auto-Updating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.withVisuals}</p>
                <p className="text-sm text-muted-foreground">With Visuals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastModified">Last Modified</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="version">Version</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTemplate} onValueChange={setFilterTemplate}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template} value={template}>{template}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDocs.map((doc) => (
                <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onNavigate('document-viewer', doc.id)}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.title}</span>
                        {doc.hasVisuals && <Eye className="h-3 w-3 text-blue-500" />}
                        {doc.autoUpdate && <Zap className="h-3 w-3 text-green-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {doc.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {doc.labels.slice(0, 2).map((label, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                        {doc.labels.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{doc.labels.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{doc.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{doc.template}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {doc.createdBy.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{doc.createdBy}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(doc.lastModified)}</span>
                    <div className="text-xs text-muted-foreground">{doc.views} views</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doc.status === 'active' ? 'default' : 'secondary'}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('document-viewer', doc.id);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('document-editor', doc.id);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          // Handle export
                        }}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          // Handle share
                        }}>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDocs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('document-viewer', doc.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight mb-1 line-clamp-2">
                        {doc.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {doc.version}
                        </Badge>
                        <Badge variant={doc.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {doc.status}
                        </Badge>
                        {doc.autoUpdate && (
                          <Zap className="h-3 w-3 text-green-500" title="Auto-updating" />
                        )}
                        {doc.hasVisuals && (
                          <Eye className="h-3 w-3 text-blue-500" title="Contains visuals" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('document-viewer', doc.id);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('document-editor', doc.id);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        // Handle export
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        // Handle share
                      }}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed line-clamp-2">
                  {doc.description}
                </CardDescription>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{doc.views} views</span>
                  <span>{doc.template}</span>
                  <span>{formatDate(doc.lastModified)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {doc.createdBy.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{doc.createdBy}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {doc.labels.slice(0, 3).map((label, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                  {doc.labels.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{doc.labels.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('document-viewer', doc.id);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('document-editor', doc.id);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {sortedDocs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterStatus !== 'all' || filterTemplate !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Generate your first document to get started'
            }
          </p>
          <Button onClick={() => onNavigate('generate')}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Documentation
          </Button>
        </div>
      )}
    </div>
  );
}