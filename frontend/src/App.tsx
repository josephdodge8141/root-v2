import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { GenerateDocs } from './components/GenerateDocs';
import { Templates } from './components/Templates';
import { Community } from './components/Community';
import { DocsRepository } from './components/DocsRepository';
import { Admin } from './components/Admin';
import { DocumentViewer } from './components/DocumentViewer';
import { TemplateViewer } from './components/TemplateViewer';
import { UserProfile } from './components/UserProfile';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedId, setSelectedId] = useState<string>('');

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      
      switch (e.key.toLowerCase()) {
        case 'g':
          setCurrentPage('generate');
          break;
        case 't':
          setCurrentPage('templates');
          break;
        case 'c':
          setCurrentPage('community');
          break;
        case 'r':
          setCurrentPage('repository');
          break;
        case 'a':
          setCurrentPage('admin');
          break;
        case 'h':
        case 'd':
          setCurrentPage('dashboard');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
    if (id) {
      setSelectedId(id);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'generate':
        return <GenerateDocs onNavigate={handleNavigate} />;
      case 'templates':
        return <Templates onNavigate={handleNavigate} />;
      case 'community':
        return <Community onNavigate={handleNavigate} />;
      case 'repository':
        return <DocsRepository onNavigate={handleNavigate} />;
      case 'admin':
        return <Admin onNavigate={handleNavigate} />;
      case 'document-viewer':
        return (
          <DocumentViewer 
            documentId={selectedId} 
            onBack={() => setCurrentPage('repository')}
            onEdit={() => setCurrentPage('document-editor')}
          />
        );
      case 'template-viewer':
        return (
          <TemplateViewer 
            templateId={selectedId}
            onBack={() => setCurrentPage('templates')}
            onEdit={() => setCurrentPage('template-editor')}
            onUse={() => setCurrentPage('generate')}
          />
        );
      case 'profile':
        return <UserProfile onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </Layout>
    </div>
  );
}