import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Cloud, Github, Database, Upload, CheckCircle, AlertTriangle, Settings, Play, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

interface GenerateDocsProps {
  onNavigate: (page: string, id?: string) => void;
}

const inputSources = [
  {
    id: 'aws',
    name: 'AWS Cloud Environment',
    icon: Cloud,
    description: 'Connect to your AWS account to document cloud infrastructure',
    supported: true
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    icon: Cloud,
    description: 'Document your Google Cloud Platform resources',
    supported: true
  },
  {
    id: 'github',
    name: 'GitHub Repository',
    icon: Github,
    description: 'Generate docs from your codebase and repositories',
    supported: true
  },
  {
    id: 'database',
    name: 'Database Schema',
    icon: Database,
    description: 'Document database structures and relationships',
    supported: true
  },
  {
    id: 'manual',
    name: 'Manual Input/Upload',
    icon: Upload,
    description: 'Upload files or provide manual input for documentation',
    supported: true
  }
];

const templates = [
  {
    id: 'aws-infra',
    name: 'AWS Infrastructure Overview',
    description: 'Documents AWS EC2, RDS, and VPC resources in an architecture diagram',
    scope: 'Default',
    compatibility: ['aws'],
    rating: 4.8,
    recommended: true
  },
  {
    id: 'api-service',
    name: 'API Service Documentation',
    description: 'Comprehensive API documentation with endpoints and examples',
    scope: 'Team',
    compatibility: ['github', 'manual'],
    rating: 4.6,
    recommended: false
  },
  {
    id: 'microservice',
    name: 'Microservice Architecture',
    description: 'Documents microservice structure and communication patterns',
    scope: 'Organization',
    compatibility: ['github', 'aws', 'gcp'],
    rating: 4.9,
    recommended: false
  }
];

const outputDestinations = [
  { id: 'confluence', name: 'Confluence', connected: true },
  { id: 'gdocs', name: 'Google Docs', connected: false },
  { id: 'guru', name: 'Guru', connected: true },
  { id: 'webhook', name: 'Webhook Export', connected: false }
];

export function GenerateDocs({ onNavigate }: GenerateDocsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(['root']);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [updateFrequency, setUpdateFrequency] = useState('daily');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const steps = [
    { id: 1, title: 'Select Input Sources', description: 'Choose where to pull documentation from' },
    { id: 2, title: 'Choose Template', description: 'Pick a template for your documentation' },
    { id: 3, title: 'Output Settings', description: 'Configure destinations and automation' },
    { id: 4, title: 'Generate', description: 'Review and generate your documentation' }
  ];

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleDestinationToggle = (destId: string) => {
    if (destId === 'root') return; // Always enabled
    
    setSelectedDestinations(prev => 
      prev.includes(destId) 
        ? prev.filter(id => id !== destId)
        : [...prev, destId]
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          onNavigate('repository');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedSources.length > 0;
      case 2: return selectedTemplate !== '';
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const getCompatibleTemplates = () => {
    if (selectedSources.length === 0) return templates;
    return templates.filter(template => 
      template.compatibility.some(comp => selectedSources.includes(comp))
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Generate Documentation</h1>
          <p className="text-muted-foreground">Create AI-powered documentation from your sources</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep === step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : currentStep > step.id 
                      ? 'bg-green-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Step 1: Select Input Sources */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Choose Documentation Sources</h3>
                  <p className="text-muted-foreground mb-4">
                    Select one or more input sources for your documentation
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inputSources.map((source) => {
                    const Icon = source.icon;
                    const isSelected = selectedSources.includes(source.id);
                    
                    return (
                      <Card 
                        key={source.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                        }`}
                        onClick={() => handleSourceToggle(source.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{source.name}</h4>
                              <p className="text-sm text-muted-foreground">{source.description}</p>
                            </div>
                            {isSelected && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedSources.length > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected Sources:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSources.map(sourceId => {
                        const source = inputSources.find(s => s.id === sourceId);
                        return (
                          <Badge key={sourceId} variant="secondary">
                            {source?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Choose Template */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Select Documentation Template</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a template that defines how your documentation will be structured
                  </p>
                </div>

                <div className="space-y-4">
                  {getCompatibleTemplates().map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate === template.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{template.name}</h4>
                              {template.recommended && (
                                <Badge variant="secondary">Recommended</Badge>
                              )}
                              <Badge variant="outline">{template.scope}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Rating: {template.rating}/5</span>
                              <span>Compatible: {template.compatibility.join(', ')}</span>
                            </div>
                          </div>
                          {selectedTemplate === template.id && (
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Output Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Output Destination & Automation</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure where your documentation will be saved and published
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Publication Destinations</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Checkbox checked disabled />
                          <span className="font-medium">Root Docs (versioned)</span>
                        </div>
                        <Badge variant="secondary">Always enabled</Badge>
                      </div>
                      
                      {outputDestinations.map((dest) => (
                        <div key={dest.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={selectedDestinations.includes(dest.id)}
                              onCheckedChange={() => handleDestinationToggle(dest.id)}
                              disabled={!dest.connected}
                            />
                            <span className={dest.connected ? '' : 'text-muted-foreground'}>
                              {dest.name}
                            </span>
                          </div>
                          {dest.connected ? (
                            <Badge variant="outline" className="text-green-600">Connected</Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">Not connected</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Auto-Update Settings</h4>
                      <Switch 
                        checked={autoUpdate}
                        onCheckedChange={setAutoUpdate}
                      />
                    </div>
                    
                    {autoUpdate && (
                      <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                        <div>
                          <Label htmlFor="frequency">Update Frequency</Label>
                          <Select value={updateFrequency} onValueChange={setUpdateFrequency}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily at 9:00 AM</SelectItem>
                              <SelectItem value="weekly">Weekly (Monday 9:00 AM)</SelectItem>
                              <SelectItem value="monthly">Monthly (1st day, 9:00 AM)</SelectItem>
                              <SelectItem value="onchange">On source changes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your document will be automatically regenerated when changes are detected in the source. 
                          Each regeneration will create a new version in Root.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Generate */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Review & Generate</h3>
                  <p className="text-muted-foreground mb-4">
                    Review your configuration and generate your documentation
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-3">Configuration Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Sources: </span>
                        {selectedSources.map(id => inputSources.find(s => s.id === id)?.name).join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">Template: </span>
                        {templates.find(t => t.id === selectedTemplate)?.name}
                      </div>
                      <div>
                        <span className="font-medium">Destinations: </span>
                        Root{selectedDestinations.length > 1 ? `, ${selectedDestinations.filter(d => d !== 'root').map(id => outputDestinations.find(dest => dest.id === id)?.name).join(', ')}` : ' only'}
                      </div>
                      {autoUpdate && (
                        <div>
                          <span className="font-medium">Auto-Update: </span>
                          {updateFrequency.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {isGenerating ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 mb-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="font-medium">Generating documentation...</span>
                        </div>
                        <Progress value={generationProgress} className="mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {generationProgress < 30 ? 'Connecting to sources...' :
                           generationProgress < 60 ? 'Analyzing data...' :
                           generationProgress < 90 ? 'Compiling documentation with AI...' :
                           'Finalizing document...'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleGenerate}
                      size="lg" 
                      className="w-full"
                      disabled={!canProceed()}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Generate Documentation
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || isGenerating}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < 4 && (
              <Button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={!canProceed() || isGenerating}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}