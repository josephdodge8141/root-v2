import React, { useState } from 'react';
import { Search, Filter, Star, Download, Heart, MessageCircle, TrendingUp, Verified, Flag, Github } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';

interface CommunityProps {
  onNavigate: (page: string, templateId?: string) => void;
}

const featuredTemplate = {
  id: 'featured-1',
  name: 'Kubernetes Deployment Documentation',
  description: 'Comprehensive K8s deployment documentation with YAML configs, service meshes, and monitoring setup. Perfect for DevOps teams.',
  author: {
    name: 'JaneDoe',
    avatar: 'JD',
    verified: true
  },
  stats: {
    uses: 2147,
    rating: 4.9,
    comments: 89,
    likes: 345
  },
  tags: ['DevOps', 'Kubernetes', 'Infrastructure'],
  trending: true,
  featured: true,
  preview: 'This template generates comprehensive Kubernetes deployment documentation...'
};

const communityTemplates = [
  {
    id: '1',
    name: 'API Documentation Generator',
    description: 'Automatically generates REST API docs with interactive examples and authentication guides.',
    author: {
      name: 'TechGuru',
      avatar: 'TG',
      verified: false
    },
    stats: {
      uses: 1523,
      rating: 4.7,
      comments: 42,
      likes: 156
    },
    tags: ['API', 'REST', 'Development'],
    trending: false,
    category: 'Software'
  },
  {
    id: '2',
    name: 'Database Schema Visualizer',
    description: 'Creates beautiful ERD diagrams and documents database relationships with migration guides.',
    author: {
      name: 'DataWiz',
      avatar: 'DW',
      verified: true
    },
    stats: {
      uses: 892,
      rating: 4.8,
      comments: 28,
      likes: 134
    },
    tags: ['Database', 'Schema', 'ERD'],
    trending: true,
    category: 'Database'
  },
  {
    id: '3',
    name: 'React Component Library Docs',
    description: 'Perfect for documenting React component libraries with props, examples, and usage patterns.',
    author: {
      name: 'ReactPro',
      avatar: 'RP',
      verified: false
    },
    stats: {
      uses: 756,
      rating: 4.6,
      comments: 31,
      likes: 98
    },
    tags: ['React', 'Components', 'Frontend'],
    trending: false,
    category: 'Software'
  },
  {
    id: '4',
    name: 'AWS Architecture Blueprint',
    description: 'Documents AWS cloud architectures with cost analysis, security recommendations, and scaling guides.',
    author: {
      name: 'CloudArchitect',
      avatar: 'CA',
      verified: true
    },
    stats: {
      uses: 1245,
      rating: 4.9,
      comments: 67,
      likes: 203
    },
    tags: ['AWS', 'Cloud', 'Architecture'],
    trending: true,
    category: 'Infrastructure'
  },
  {
    id: '5',
    name: 'Machine Learning Pipeline Docs',
    description: 'Template for documenting ML workflows, model performance, and deployment strategies.',
    author: {
      name: 'MLExpert',
      avatar: 'ML',
      verified: false
    },
    stats: {
      uses: 634,
      rating: 4.5,
      comments: 19,
      likes: 87
    },
    tags: ['ML', 'AI', 'Pipeline'],
    trending: false,
    category: 'AI/ML'
  },
  {
    id: '6',
    name: 'Security Audit Report',
    description: 'Generates comprehensive security audit reports with vulnerability assessments and remediation plans.',
    author: {
      name: 'SecureTech',
      avatar: 'ST',
      verified: true
    },
    stats: {
      uses: 423,
      rating: 4.8,
      comments: 15,
      likes: 76
    },
    tags: ['Security', 'Audit', 'Compliance'],
    trending: false,
    category: 'Security'
  }
];

const trendingTemplates = communityTemplates.filter(t => t.trending).slice(0, 3);

export function Community({ onNavigate }: CommunityProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filteredTemplates = communityTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id.localeCompare(a.id);
      case 'rating':
        return b.stats.rating - a.stats.rating;
      case 'popular':
      default:
        return b.stats.uses - a.stats.uses;
    }
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Community Templates</h1>
        <p className="text-muted-foreground">Discover and share documentation templates with the community</p>
      </div>

      {/* Featured Template */}
      <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="bg-primary">
              ⭐ Featured
            </Badge>
            {featuredTemplate.trending && (
              <Badge variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl">{featuredTemplate.name}</CardTitle>
          <CardDescription className="text-base">
            {featuredTemplate.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{featuredTemplate.author.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{featuredTemplate.author.name}</span>
                  {featuredTemplate.author.verified && (
                    <Verified className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    {featuredTemplate.stats.rating}
                  </span>
                  <span>{featuredTemplate.stats.uses.toLocaleString()} uses</span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {featuredTemplate.stats.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {featuredTemplate.stats.comments}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={(e) => {
                e.stopPropagation();
                // Handle like
              }}>
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button size="sm" onClick={(e) => {
                e.stopPropagation();
                onNavigate('generate');
              }}>
                <Download className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {featuredTemplate.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort by</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Trending This Week */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTemplates.map((template, index) => (
                  <div key={template.id} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-primary">#{index + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-tight">{template.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.stats.uses} uses this week
                        </p>
                      </div>
                    </div>
                    {index < trendingTemplates.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('template-viewer', template.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{template.author.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{template.author.name}</span>
                      {template.author.verified && (
                        <Verified className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    {template.trending && (
                      <Badge variant="secondary" className="text-xs">
                        🔥 Trending
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      {template.stats.rating}
                    </span>
                    <span>{template.stats.uses} uses</span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {template.stats.likes}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={(e) => {
                      e.stopPropagation();
                      // Handle like
                    }}>
                      <Heart className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                    <Button size="sm" className="flex-1" onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('generate');
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedTemplates.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find templates
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}