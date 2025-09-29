import React, { useState } from 'react';
import { Plus, Search, Filter, BookTemplate, Star, Users, Building, Globe, Edit, Copy, Trash2, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';

interface TemplatesProps {
  onNavigate: (page: string, templateId?: string) => void;
}

const templates = [
  {
    id: '1',
    name: 'AWS Infrastructure Overview',
    description: 'Comprehensive documentation for AWS cloud infrastructure including EC2, RDS, VPC, and Lambda resources with architecture diagrams.',
    scope: 'Default',
    author: 'Root Team',
    compatibility: ['AWS', 'Manual'],
    lastModified: '2024-01-15',
    uses: 156,
    rating: 4.8,
    favorite: true,
    sections: 8,
    labels: 3,
    visuals: 12
  },
  {
    id: '2',
    name: 'API Service Documentation',
    description: 'Template for documenting REST APIs with endpoints, authentication, and code examples.',
    scope: 'Team',
    author: 'Alice Johnson',
    compatibility: ['GitHub', 'Manual'],
    lastModified: '2024-01-12',
    uses: 89,
    rating: 4.6,
    favorite: false,
    sections: 6,
    labels: 2,
    visuals: 4
  },
  {
    id: '3',
    name: 'Database Schema Documentation',
    description: 'Documents database structures, relationships, and constraints with ERD diagrams.',
    scope: 'Organization',
    author: 'Bob Smith',
    compatibility: ['Database', 'Manual'],
    lastModified: '2024-01-10',
    uses: 67,
    rating: 4.9,
    favorite: true,
    sections: 5,
    labels: 4,
    visuals: 8
  },
  {
    id: '4',
    name: 'Microservice Architecture',
    description: 'Template for documenting microservice ecosystems with service maps and communication patterns.',
    scope: 'Team',
    author: 'Carol Davis',
    compatibility: ['GitHub', 'AWS', 'GCP'],
    lastModified: '2024-01-08',
    uses: 134,
    rating: 4.7,
    favorite: false,
    sections: 10,
    labels: 5,
    visuals: 15
  }
];

const scopeIcons = {
  'Default': Globe,
  'Personal': Users,
  'Team': Users,
  'Organization': Building
};

export function Templates({ onNavigate }: TemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastModified');
  const [filterScope, setFilterScope] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = filterScope === 'all' || template.scope.toLowerCase() === filterScope;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'favorites' && template.favorite) ||
                      (activeTab === 'my' && template.author === 'John Doe');
    
    return matchesSearch && matchesScope && matchesTab;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'uses':
        return b.uses - a.uses;
      case 'rating':
        return b.rating - a.rating;
      case 'lastModified':
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Documentation Templates</h1>
            <p className="text-muted-foreground">Create and manage templates for documentation generation</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Template
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
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
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="uses">Most Used</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterScope} onValueChange={setFilterScope}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scopes</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="my">My Templates</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedTemplates.map((template) => {
          const ScopeIcon = scopeIcons[template.scope as keyof typeof scopeIcons];
          
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('template-viewer', template.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookTemplate className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight mb-1 truncate">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          <ScopeIcon className="h-3 w-3 mr-1" />
                          {template.scope}
                        </Badge>
                        {template.favorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-0.5">
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('template-viewer', template.id);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('template-editor', template.id);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        // Handle duplicate
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {template.description}
                </CardDescription>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {template.rating}
                  </span>
                  <span>{template.uses} uses</span>
                  <span>{template.sections} sections</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {template.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{template.author}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.compatibility.map((comp, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Modified {new Date(template.lastModified).toLocaleDateString()}
                  </span>
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('generate');
                  }}>
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedTemplates.length === 0 && (
        <div className="text-center py-12">
          <BookTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterScope !== 'all' || activeTab !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first template to get started'
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </div>
      )}
    </div>
  );
}