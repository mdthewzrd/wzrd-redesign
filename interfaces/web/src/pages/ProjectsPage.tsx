import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import {
  availableProjectsAtom,
  currentProjectAtom,
} from '@/stores/atoms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [availableProjects] = useAtom(availableProjectsAtom);
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  const [selectedProject, setSelectedProject] = React.useState<string | null>(null);

  const handleSelectProject = (projectKey: string) => {
    setSelectedProject(projectKey);
  };

  const handleGoToView = (projectKey: string) => {
    setCurrentProject(projectKey);
    setSelectedProject(null);
    // Navigate to overview with the new project selected
    navigate('/overview');
  };

  const currentProjectData = availableProjects.find(p => p.key === currentProject);

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gradient-gold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Independent projects with specialized agents
            {currentProjectData && ` • Viewing: ${currentProjectData.name}`}
          </p>
        </div>
        {selectedProject && (
          <Button
            variant="outline"
            onClick={() => setSelectedProject(null)}
          >
            Back to Overview
          </Button>
        )}
      </div>

      {/* Project Selection Grid */}
      {selectedProject === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableProjects.map((project) => {
            const isActive = currentProject === project.key;
            return (
              <Card
                key={project.key}
                onClick={() => handleSelectProject(project.key)}
                className={`cursor-pointer hover:border-primary/50 transition-all ${
                  isActive ? 'border-primary ring-2 ring-primary/30' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${project.color}20` }}
                    >
                      <div className="text-2xl" style={{ color: project.color }}>
                        {project.key === 'wzrd.dev' ? '⚡' :
                         project.key === 'edge.dev' ? '📈' :
                         project.key === 'dilution-agent' ? '📊' :
                         project.key === 'press-agent' ? '📰' : '📁'}
                      </div>
                    </div>
                    {isActive && (
                      <Badge variant="success" className="gap-1">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-4">{project.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Agent Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {project.agent[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Primary Agent</p>
                        <p className="font-medium">{project.agent}</p>
                      </div>
                    </div>

                    {/* Topics Count */}
                    <div className="flex items-center justify-between text-sm py-2 px-3 bg-secondary/30 rounded-lg">
                      <span className="text-muted-foreground">Topics</span>
                      <span className="font-medium">{project.topics.length} available</span>
                    </div>

                    {/* Go to View Button */}
                    <Button
                      className={`w-full ${
                        isActive
                          ? `border-2 border-${project.color.replace('#', '')}`
                          : ''
                      }`}
                      style={{
                        backgroundColor: isActive ? project.color : undefined,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToView(project.key);
                      }}
                    >
                      Go to {project.name} View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Project Detail View */
        <div className="animate-slide-in">
          {(() => {
            const project = availableProjects.find(p => p.key === selectedProject);
            if (!project) return null;

            return (
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: `${project.color}20` }}
                    >
                      <span className="text-3xl" style={{ color: project.color }}>
                        {project.key === 'wzrd.dev' ? '⚡' :
                         project.key === 'edge.dev' ? '📈' :
                         project.key === 'dilution-agent' ? '📊' :
                         project.key === 'press-agent' ? '📰' : '📁'}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{project.name}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {project.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Topics List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      Available Topics
                      <Badge variant="default">{project.topics.length}</Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {project.topics.map((topic) => (
                        <Card
                          key={topic.key}
                          className="p-4 bg-secondary/20 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                            <div>
                              <p className="font-medium">{topic.name}</p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {topic.description}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="default" className="text-xs">
                                  {topic.mode}
                                </Badge>
                                {topic.agent && (
                                  <Badge variant="default" className="text-xs">
                                    {topic.agent}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedProject(null)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-2"
                      style={{ backgroundColor: project.color }}
                      onClick={() => handleGoToView(project.key)}
                    >
                      Go to {project.name} View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
}
