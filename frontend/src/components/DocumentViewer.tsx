import React, { useState } from 'react';
import { ArrowLeft, Edit, Download, Share, Star, MessageCircle, Calendar, User, Tag, RefreshCw, Clock, FileText, Image } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';

interface DocumentViewerProps {
  documentId: string;
  onBack: () => void;
  onEdit: () => void;
}

// Mock document data - in a real app this would come from an API
const mockDocument = {
  id: '1',
  title: 'User Management Service Documentation',
  description: 'Comprehensive documentation for the user authentication and management microservice',
  version: 'v3.2',
  createdBy: 'Alice Johnson',
  createdDate: '2024-01-10',
  lastModified: '2024-01-15',
  template: 'Microservice Doc',
  labels: ['Project Phoenix', 'Module: Auth', 'High Priority'],
  status: 'active',
  autoUpdate: true,
  views: 234,
  content: {
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        type: 'text',
        content: `The User Management Service is a critical microservice responsible for handling user authentication, authorization, and profile management within the Project Phoenix ecosystem. This service provides secure user registration, login, role-based access control, and user profile operations.

**Key Features:**
- JWT-based authentication
- Role-based authorization (RBAC)
- User profile management
- Password reset functionality
- Multi-factor authentication (MFA)
- Account lockout protection`
      },
      {
        id: 'architecture',
        title: 'Architecture Overview',
        type: 'diagram',
        content: 'A system architecture diagram showing the User Management Service and its connections to other services',
        hasVisual: true
      },
      {
        id: 'endpoints',
        title: 'API Endpoints',
        type: 'code',
        content: `## Authentication Endpoints

### POST /auth/login
Authenticates a user and returns JWT tokens.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role": "user"
  }
}
\`\`\`

### POST /auth/register
Creates a new user account.

**Request Body:**
\`\`\`json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
\`\`\``
      },
      {
        id: 'database',
        title: 'Database Schema',
        type: 'text',
        content: `The User Management Service uses a PostgreSQL database with the following key tables:

**Users Table:**
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- password_hash (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- role (ENUM: admin, user, viewer)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)

**Sessions Table:**
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- refresh_token (VARCHAR)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)`
      },
      {
        id: 'deployment',
        title: 'Deployment Configuration',
        type: 'code',
        content: `## Docker Configuration

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
\`\`\`

## Environment Variables

\`\`\`bash
DATABASE_URL=postgresql://user:password@localhost:5432/userdb
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
PORT=3001
\`\`\``
      }
    ]
  },
  comments: [
    {
      id: '1',
      author: 'Bob Smith',
      content: 'Great documentation! The API examples are very helpful.',
      timestamp: '2024-01-14T10:30:00Z',
      resolved: false
    },
    {
      id: '2',
      author: 'Carol Davis',
      content: 'Should we add information about rate limiting?',
      timestamp: '2024-01-13T15:45:00Z',
      resolved: false
    }
  ]
};

export function DocumentViewer({ documentId, onBack, onEdit }: DocumentViewerProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const doc = mockDocument; // In real app, fetch by documentId

  const renderContent = (section: any) => {
    switch (section.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{section.content}</div>
          </div>
        );
      case 'code':
        return (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
              {section.content}
            </div>
          </div>
        );
      case 'diagram':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 p-8 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Image className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Architecture Diagram</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 max-w-md">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return <div>{section.content}</div>;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Repository
          </Button>
        </div>
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-2">{doc.title}</h1>
            <p className="text-muted-foreground mb-4">{doc.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {doc.createdBy}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Last updated {new Date(doc.lastModified).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary">{doc.version}</Badge>
              </div>
              {doc.autoUpdate && (
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">Auto-updating</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {doc.labels.map((label, index) => (
                <Badge key={index} variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Comments ({doc.comments.length})
            </Button>
            <Button variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Watch
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Table of Contents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {doc.content.sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block py-1 text-sm hover:text-primary transition-colors"
                  >
                    {index + 1}. {section.title}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Document Sections */}
          {doc.content.sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary">{index + 1}.</span>
                    {section.title}
                    {section.hasVisual && <Image className="h-4 w-4 text-blue-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderContent(section)}
                </CardContent>
              </Card>
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Template:</span>
                <p className="text-muted-foreground">{doc.template}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">Status:</span>
                <Badge variant="default" className="ml-2">{doc.status}</Badge>
              </div>
              <div className="text-sm">
                <span className="font-medium">Views:</span>
                <p className="text-muted-foreground">{doc.views}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">Created:</span>
                <p className="text-muted-foreground">{new Date(doc.createdDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          {showComments && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {doc.comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {comment.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">{comment.content}</p>
                    <Separator />
                  </div>
                ))}
                
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button size="sm" className="w-full">
                    Post Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}