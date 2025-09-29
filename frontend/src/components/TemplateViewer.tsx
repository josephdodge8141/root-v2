import React, { useState } from 'react';
import { ArrowLeft, Edit, Copy, Star, MessageCircle, Calendar, User, Tag, BookTemplate, Settings, Eye, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TemplateViewerProps {
  templateId: string;
  onBack: () => void;
  onEdit: () => void;
  onUse: () => void;
}

// Mock template data
const mockTemplate = {
  id: '1',
  name: 'AWS Infrastructure Overview',
  description: 'Comprehensive documentation for AWS cloud infrastructure including EC2, RDS, VPC, and Lambda resources with architecture diagrams.',
  scope: 'Default',
  author: 'Root Team',
  authorAvatar: 'RT',
  compatibility: ['AWS', 'Manual'],
  lastModified: '2024-01-15',
  uses: 156,
  rating: 4.8,
  favorite: true,
  sections: 8,
  labels: 3,
  visuals: 12,
  status: 'published',
  structure: [
    {
      id: 'intro',
      title: 'Introduction',
      type: 'text',
      description: 'Overview of the AWS infrastructure and its purpose',
      required: true,
      order: 1
    },
    {
      id: 'architecture',
      title: 'Architecture Overview',
      type: 'diagram',
      description: 'High-level architecture diagram showing all AWS services',
      required: true,
      order: 2,
      hasVisual: true
    },
    {
      id: 'services',
      title: 'Service Documentation',
      type: 'repeating',
      description: 'Detailed documentation for each AWS service',
      required: true,
      order: 3,
      repeatFor: 'AWS Services'
    },
    {
      id: 'networking',
      title: 'Network Configuration',
      type: 'text',
      description: 'VPC, subnets, security groups, and routing configuration',
      required: true,
      order: 4
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      type: 'text',
      description: 'IAM policies, encryption settings, and compliance information',
      required: true,
      order: 5
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Logging',
      type: 'text',
      description: 'CloudWatch metrics, alarms, and logging configuration',
      required: false,
      order: 6
    },
    {
      id: 'costs',
      title: 'Cost Analysis',
      type: 'text',
      description: 'Resource costs and optimization recommendations',
      required: false,
      order: 7
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Guide',
      type: 'text',
      description: 'Common issues and their solutions',
      required: false,
      order: 8
    }
  ],
  labelCategories: [
    {
      name: 'Environment',
      values: ['Production', 'Staging', 'Development'],
      required: true
    },
    {
      name: 'Service Type',
      values: ['Compute', 'Storage', 'Database', 'Networking'],
      required: false
    },
    {
      name: 'Criticality',
      values: ['High', 'Medium', 'Low'],
      required: true
    }
  ],
  visualLibrary: [
    { name: 'AWS EC2', type: 'compute', category: 'AWS' },
    { name: 'AWS RDS', type: 'database', category: 'AWS' },
    { name: 'AWS VPC', type: 'networking', category: 'AWS' },
    { name: 'AWS Lambda', type: 'serverless', category: 'AWS' },
    { name: 'Load Balancer', type: 'networking', category: 'Generic' },
    { name: 'API Gateway', type: 'api', category: 'AWS' },
    { name: 'S3 Bucket', type: 'storage', category: 'AWS' },
    { name: 'CloudFront', type: 'cdn', category: 'AWS' },
    { name: 'Route 53', type: 'dns', category: 'AWS' },
    { name: 'IAM Role', type: 'security', category: 'AWS' },
    { name: 'Auto Scaling Group', type: 'scaling', category: 'AWS' },
    { name: 'CloudWatch', type: 'monitoring', category: 'AWS' }
  ],
  settings: {
    verbosity: 75,
    diagramAnnotations: 60,
    technicalDepth: 85,
    tone: 'Professional',
    includeCodeSnippets: true,
    includeTOC: true
  },
  exampleOutput: `# AWS Infrastructure Overview

## Introduction
This document provides a comprehensive overview of our AWS cloud infrastructure for the Project Phoenix production environment. The infrastructure is designed for high availability, scalability, and security.

## Architecture Overview
[Architecture Diagram would be here]

The infrastructure consists of:
- Multi-AZ deployment across us-east-1
- Auto-scaling compute resources
- Managed database services
- Content delivery network
- Comprehensive monitoring and logging

## Service Documentation

### EC2 Instances
- Instance Types: t3.medium, m5.large
- Auto Scaling Groups: 2-10 instances
- Security Groups: Web-tier, App-tier, DB-tier

### RDS Database
- Engine: PostgreSQL 14.9
- Instance Class: db.r6g.large
- Multi-AZ: Enabled
- Backup Retention: 7 days

[Additional sections would continue...]`
};

export function TemplateViewer({ templateId, onBack, onEdit, onUse }: TemplateViewerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const template = mockTemplate; // In real app, fetch by templateId

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'diagram': return '📊';
      case 'repeating': return '🔄';
      case 'text': default: return '📝';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-2">{template.name}</h1>
            <p className="text-muted-foreground mb-4">{template.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {template.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Updated {new Date(template.lastModified).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-yellow-500" />
                {template.rating}
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {template.uses} uses
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">
                <BookTemplate className="h-3 w-3 mr-1" />
                {template.scope}
              </Badge>
              {template.compatibility.map((comp, index) => (
                <Badge key={index} variant="secondary">
                  {comp}
                </Badge>
              ))}
              <Badge variant="outline">{template.sections} sections</Badge>
              <Badge variant="outline">{template.visuals} visuals</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Favorite
            </Button>
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={onUse}>
              <Eye className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {template.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Verbosity</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${template.settings.verbosity}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{template.settings.verbosity}%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Technical Depth</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${template.settings.technicalDepth}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{template.settings.technicalDepth}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Tone:</span>
                    <Badge variant="outline">{template.settings.tone}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Include Code Snippets:</span>
                    <Badge variant={template.settings.includeCodeSnippets ? 'default' : 'secondary'}>
                      {template.settings.includeCodeSnippets ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Include Table of Contents:</span>
                    <Badge variant={template.settings.includeTOC ? 'default' : 'secondary'}>
                      {template.settings.includeTOC ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Template Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Uses:</span>
                    <span className="font-medium">{template.uses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="font-medium">{template.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sections:</span>
                    <span className="font-medium">{template.sections}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Visual Assets:</span>
                    <span className="font-medium">{template.visuals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Label Categories:</span>
                    <span className="font-medium">{template.labels}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{template.authorAvatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{template.author}</p>
                      <p className="text-sm text-muted-foreground">Template Creator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Structure</CardTitle>
              <CardDescription>
                Sections that will be generated in the final documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {template.structure.map((section, index) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSectionIcon(section.type)}</span>
                        <div>
                          <h4 className="font-medium">{section.order}. {section.title}</h4>
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={section.required ? 'default' : 'outline'}>
                          {section.required ? 'Required' : 'Optional'}
                        </Badge>
                        <Badge variant="secondary">{section.type}</Badge>
                      </div>
                    </div>
                    
                    {section.repeatFor && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Repeats for:</span> {section.repeatFor}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Label Categories</CardTitle>
              <CardDescription>
                Categories used to tag and organize content in generated documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {template.labelCategories.map((category, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{category.name}</h4>
                      <Badge variant={category.required ? 'default' : 'outline'}>
                        {category.required ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.values.map((value, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visuals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Symbol Library</CardTitle>
              <CardDescription>
                Icons and symbols available for diagrams in this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {template.visualLibrary.map((visual, index) => (
                  <div key={index} className="border rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                      <span className="text-xs font-mono">{visual.type.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{visual.name}</p>
                      <p className="text-xs text-muted-foreground">{visual.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Example Output</CardTitle>
              <CardDescription>
                Preview of what documentation generated with this template looks like
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                {template.exampleOutput}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}