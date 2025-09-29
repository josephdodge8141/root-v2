import React, { useState } from 'react';
import { Users, Shield, Settings, BarChart3, Plug, Building, UserPlus, Edit, Trash2, Crown, Key, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';

interface AdminProps {
  onNavigate: (page: string, id?: string) => void;
}

const organizationStats = {
  totalUsers: 47,
  activeUsers: 42,
  totalTeams: 8,
  totalDocs: 234,
  totalTemplates: 45,
  monthlyGenerations: 1247,
  storageUsed: 68,
  apiCalls: 15678
};

const users = [
  { id: '1', name: 'Alice Johnson', email: 'alice@acmecorp.com', role: 'Team Admin', team: 'Engineering', status: 'active', lastActive: '2024-01-15' },
  { id: '2', name: 'Bob Smith', email: 'bob@acmecorp.com', role: 'Member', team: 'DevOps', status: 'active', lastActive: '2024-01-15' },
  { id: '3', name: 'Carol Davis', email: 'carol@acmecorp.com', role: 'Member', team: 'Engineering', status: 'active', lastActive: '2024-01-14' },
  { id: '4', name: 'David Lee', email: 'david@acmecorp.com', role: 'Viewer', team: 'QA', status: 'invited', lastActive: null },
  { id: '5', name: 'Eve Wilson', email: 'eve@acmecorp.com', role: 'Org Admin', team: 'Engineering', status: 'active', lastActive: '2024-01-15' }
];

const teams = [
  { id: '1', name: 'Engineering', members: 15, admins: ['Alice Johnson'], templates: 12, docs: 89 },
  { id: '2', name: 'DevOps', members: 8, admins: ['Bob Smith'], templates: 8, docs: 45 },
  { id: '3', name: 'QA', members: 6, admins: ['Carol Davis'], templates: 3, docs: 23 },
  { id: '4', name: 'Product', members: 12, admins: ['David Lee'], templates: 7, docs: 34 }
];

const integrations = [
  { id: '1', name: 'AWS', type: 'Cloud Provider', status: 'connected', accounts: 3, lastSync: '2024-01-15' },
  { id: '2', name: 'Google Cloud', type: 'Cloud Provider', status: 'connected', accounts: 1, lastSync: '2024-01-14' },
  { id: '3', name: 'GitHub', type: 'Code Repository', status: 'connected', accounts: 5, lastSync: '2024-01-15' },
  { id: '4', name: 'Confluence', type: 'Knowledge Base', status: 'connected', accounts: 1, lastSync: '2024-01-13' },
  { id: '5', name: 'Slack', type: 'Communication', status: 'disconnected', accounts: 0, lastSync: null }
];

const roles = [
  { id: '1', name: 'Org Admin', type: 'system', users: 2, permissions: ['Full access to all features', 'User management', 'Billing'] },
  { id: '2', name: 'Team Admin', type: 'system', users: 8, permissions: ['Manage team members', 'Create templates', 'Generate docs'] },
  { id: '3', name: 'Member', type: 'system', users: 32, permissions: ['Generate docs', 'Edit own content', 'View team content'] },
  { id: '4', name: 'Viewer', type: 'system', users: 5, permissions: ['View documentation', 'Comment on docs'] },
  { id: '5', name: 'External Contractor', type: 'custom', users: 0, permissions: ['Limited doc access', 'No template creation'] }
];

export function Admin({ onNavigate }: AdminProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Administration</h1>
        <p className="text-muted-foreground">Manage your organization, users, and settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Organization Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{organizationStats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-xs text-green-600">{organizationStats.activeUsers} active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{organizationStats.totalTeams}</p>
                    <p className="text-sm text-muted-foreground">Teams</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{organizationStats.monthlyGenerations}</p>
                    <p className="text-sm text-muted-foreground">Monthly Generations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Settings className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{organizationStats.storageUsed}%</p>
                    <p className="text-sm text-muted-foreground">Storage Used</p>
                    <Progress value={organizationStats.storageUsed} className="mt-1 h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>Monthly documentation generation trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documents Generated</span>
                    <span className="font-medium">{organizationStats.totalDocs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Templates Created</span>
                    <span className="font-medium">{organizationStats.totalTemplates}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Calls (Monthly)</span>
                    <span className="font-medium">{organizationStats.apiCalls.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite New Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Permissions
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Plug className="h-4 w-4 mr-2" />
                  Configure Integrations
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">User Management</h3>
              <p className="text-sm text-muted-foreground">Manage users in your organization</p>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-64"
                />
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="team-admin">Team Admin</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Invite User</Button>
              </div>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Org Admin' ? 'default' : 'secondary'}>
                        {user.role === 'Org Admin' && <Crown className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.team}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">⋮</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Team Management</h3>
              <p className="text-sm text-muted-foreground">Organize users into teams</p>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{team.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">⋮</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Team
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Members</span>
                      <span className="font-medium">{team.members}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Templates</span>
                      <span className="font-medium">{team.templates}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Documents</span>
                      <span className="font-medium">{team.docs}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Team Admins</Label>
                    <div className="mt-1">
                      {team.admins.map((admin, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {admin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Roles & Permissions</h3>
              <p className="text-sm text-muted-foreground">Define custom roles with specific permissions</p>
            </div>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>

          <div className="space-y-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {role.name}
                        {role.type === 'system' && <Badge variant="outline">System</Badge>}
                        {role.type === 'custom' && <Badge variant="secondary">Custom</Badge>}
                      </CardTitle>
                      <CardDescription>
                        {role.users} users assigned to this role
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">⋮</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={role.type === 'system'}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Assign Users
                        </DropdownMenuItem>
                        {role.type === 'custom' && (
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Role
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-sm font-medium">Permissions</Label>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {role.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Integration Management</h3>
              <p className="text-sm text-muted-foreground">Manage external service connections</p>
            </div>
            <Button>
              <Plug className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{integration.name}</CardTitle>
                      <CardDescription>{integration.type}</CardDescription>
                    </div>
                    <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                      {integration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Connected Accounts</span>
                      <span className="font-medium">{integration.accounts}</span>
                    </div>
                    {integration.lastSync && (
                      <div className="flex justify-between text-sm">
                        <span>Last Sync</span>
                        <span className="font-medium">
                          {new Date(integration.lastSync).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Configure
                    </Button>
                    <Button 
                      variant={integration.status === 'connected' ? 'destructive' : 'default'} 
                      size="sm" 
                      className="flex-1"
                    >
                      {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Organization Settings</h3>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic organization configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input id="org-name" defaultValue="Acme Corp" />
                    </div>
                    <div>
                      <Label htmlFor="org-domain">Domain</Label>
                      <Input id="org-domain" defaultValue="acmecorp.com" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require 2FA for all users</Label>
                      <p className="text-sm text-muted-foreground">Force two-factor authentication</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Single Sign-On (SSO)</Label>
                      <p className="text-sm text-muted-foreground">Enable SAML/OIDC authentication</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session timeout</Label>
                      <p className="text-sm text-muted-foreground">Automatic logout after inactivity</p>
                    </div>
                    <Select defaultValue="24h">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="8h">8 hours</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Settings</CardTitle>
                  <CardDescription>Control feature availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Community Template Access</Label>
                      <p className="text-sm text-muted-foreground">Allow users to browse community templates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-generation Scheduling</Label>
                      <p className="text-sm text-muted-foreground">Enable scheduled document updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>External Publishing</Label>
                      <p className="text-sm text-muted-foreground">Allow publishing to external platforms</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}