import React, { useState } from 'react';
import { Bell, HelpCircle, Home, FileText, BookTemplate, Users, Archive, Settings, Menu, Search, TreePine, User, LogOut, ExternalLink, Book, MessageSquare, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string, id?: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview of activity and quick actions' },
  { id: 'generate', label: 'Generate Docs', icon: FileText, description: 'The documentation generation workflow' },
  { id: 'templates', label: 'Templates', icon: BookTemplate, description: 'Tools for creating and managing documentation templates' },
  { id: 'community', label: 'Community', icon: Users, description: 'Access to the community template marketplace' },
  { id: 'repository', label: 'Docs Repository', icon: Archive, description: 'Browse and search generated documentation' },
  { id: 'admin', label: 'Admin', icon: Settings, description: 'Administrative settings' },
];

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('dashboard')}
          >
            <TreePine className="h-6 w-6 text-primary" />
            <span className="text-xl font-medium">Root</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Notifications</h4>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Mark all read
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">API Documentation generated successfully</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <BookTemplate className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New community template: "K8s Deployment Guide"</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-2">
                      <Settings className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">AWS integration token expires in 7 days</p>
                        <p className="text-xs text-muted-foreground">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Help */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <div className="p-4">
                <h4 className="font-medium mb-3">Help & Support</h4>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Feature Requests
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Community Forum
                  </Button>
                </div>
                <Separator className="my-3" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Keyboard Shortcuts:</strong></p>
                  <p>G - Generate Docs</p>
                  <p>T - Templates</p>
                  <p>C - Community</p>
                  <p>R - Repository</p>
                  <p>A - Admin</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@acmecorp.com</p>
                <p className="text-xs text-muted-foreground">Acme Corp - Engineering Team</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate('profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Switch Organization
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } lg:relative absolute lg:translate-x-0 ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'} z-30 h-full`}>
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                  onClick={() => onNavigate(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Button>
              );
            })}
          </nav>

          {!sidebarCollapsed && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-3 bg-sidebar-accent rounded-lg">
                <p className="text-xs text-sidebar-accent-foreground font-medium mb-1">💡 Quick Tip</p>
                <p className="text-xs text-sidebar-accent-foreground/80">
                  Press "G" to quickly access Generate Docs
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}