import React, { useState } from 'react';
import { ArrowLeft, Edit, Save, Camera, Mail, Calendar, MapPin, Building, Users, FileText, BookTemplate, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

interface UserProfileProps {
  onBack: () => void;
}

const userProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john@acmecorp.com',
  avatar: null,
  title: 'Senior Software Engineer',
  department: 'Engineering',
  organization: 'Acme Corp',
  team: 'Engineering Team',
  location: 'San Francisco, CA',
  joinDate: '2023-03-15',
  lastActive: '2024-01-15T14:30:00Z',
  bio: 'Passionate software engineer with 8+ years of experience in full-stack development. I love building scalable systems and contributing to open source projects.',
  role: 'Team Admin',
  permissions: ['Generate Docs', 'Create Templates', 'Manage Team', 'View Analytics'],
  stats: {
    documentsGenerated: 47,
    templatesCreated: 12,
    templatesUsed: 89,
    favoriteTemplates: 23,
    totalViews: 1247,
    contributions: 156
  },
  preferences: {
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    mentionNotifications: true,
    theme: 'system',
    language: 'en',
    timezone: 'America/Los_Angeles',
    defaultDocView: 'reader'
  },
  recentActivity: [
    { id: '1', type: 'document', title: 'API Service Documentation', action: 'generated', date: '2024-01-15' },
    { id: '2', type: 'template', title: 'React Component Docs', action: 'created', date: '2024-01-14' },
    { id: '3', type: 'comment', title: 'Database Schema Guide', action: 'commented', date: '2024-01-13' },
    { id: '4', type: 'template', title: 'AWS Infrastructure', action: 'used', date: '2024-01-12' }
  ]
};

export function UserProfile({ onBack }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(userProfile);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = () => {
    setIsEditing(false);
    // In real app, save to backend
  };

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updatePreferences = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback className="text-xl">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button size="sm" variant="outline" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Camera className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-semibold">{profile.name}</h1>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {profile.email}
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {profile.title} at {profile.organization}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {profile.team}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Joined {new Date(profile.joinDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="mt-4">
              <Badge variant="outline">{profile.role}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{profile.stats.documentsGenerated}</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookTemplate className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{profile.stats.templatesCreated}</p>
                <p className="text-sm text-muted-foreground">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{profile.stats.favoriteTemplates}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{profile.stats.totalViews}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.name.split(' ')[0]}
                    disabled={!isEditing}
                    onChange={(e) => {
                      const lastName = profile.name.split(' ')[1] || '';
                      updateProfile('name', `${e.target.value} ${lastName}`.trim());
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.name.split(' ')[1] || ''}
                    disabled={!isEditing}
                    onChange={(e) => {
                      const firstName = profile.name.split(' ')[0];
                      updateProfile('name', `${firstName} ${e.target.value}`.trim());
                    }}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled={!isEditing}
                  onChange={(e) => updateProfile('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={profile.title}
                  disabled={!isEditing}
                  onChange={(e) => updateProfile('title', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  disabled={!isEditing}
                  onChange={(e) => updateProfile('location', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  disabled={!isEditing}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role & Permissions</CardTitle>
              <CardDescription>Your current role and access permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Role</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="text-sm">{profile.role}</Badge>
                </div>
              </div>
              
              <div>
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.permissions.map((permission, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions in Root</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-muted rounded">
                      {activity.type === 'document' && <FileText className="h-4 w-4" />}
                      {activity.type === 'template' && <BookTemplate className="h-4 w-4" />}
                      {activity.type === 'comment' && <Star className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action} • {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={profile.preferences.emailNotifications}
                  onCheckedChange={(checked) => updatePreferences('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch
                  checked={profile.preferences.pushNotifications}
                  onCheckedChange={(checked) => updatePreferences('pushNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Weekly summary of activity</p>
                </div>
                <Switch
                  checked={profile.preferences.weeklyDigest}
                  onCheckedChange={(checked) => updatePreferences('weeklyDigest', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mention Notifications</Label>
                  <p className="text-sm text-muted-foreground">When someone mentions you</p>
                </div>
                <Switch
                  checked={profile.preferences.mentionNotifications}
                  onCheckedChange={(checked) => updatePreferences('mentionNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance & Behavior</CardTitle>
              <CardDescription>Customize your Root experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Theme</Label>
                  <Select value={profile.preferences.theme} onValueChange={(value) => updatePreferences('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Language</Label>
                  <Select value={profile.preferences.language} onValueChange={(value) => updatePreferences('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Timezone</Label>
                <Select value={profile.preferences.timezone} onValueChange={(value) => updatePreferences('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="Europe/London">GMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Default Document View</Label>
                <Select value={profile.preferences.defaultDocView} onValueChange={(value) => updatePreferences('defaultDocView', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reader">Reader Mode</SelectItem>
                    <SelectItem value="edit">Edit Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Change Password</Label>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active Sessions</Label>
                  <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                </div>
                <Button variant="outline" size="sm">
                  View Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}