import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { projectsApi, Project } from '../services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '@/constants/media';
import { formatPrice } from '@/utils/price';
import SEO from '@/components/SEO';
import EShopLayout from '../components/EShopLayout';

const ProjectsConsultancyPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const difficultyParam = searchParams.get('difficulty') || '';
  const searchParam = searchParams.get('search') || '';

  // Filter states
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [difficulty, setDifficulty] = useState(() => searchParams.get('difficulty') || '');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  // Sync state with URL parameter changes
  useEffect(() => {
    setSearchTerm(searchParam);
  }, [searchParam]);

  useEffect(() => {
    setDifficulty(difficultyParam);
  }, [difficultyParam]);

  // Sync URL search parameters with states
  useEffect(() => {
    const trimmed = searchTerm.trim();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) next.set('search', trimmed);
        else next.delete('search');

        if (difficulty) next.set('difficulty', difficulty);
        else next.delete('difficulty');

        return next;
      },
      { replace: true }
    );
  }, [searchTerm, difficulty, setSearchParams]);

  // Load Projects catalog
  useEffect(() => {
    const loadCatalog = async () => {
      setIsProjectsLoading(true);
      try {
        const projRes = await projectsApi.getAll({
          search: searchTerm.trim() || undefined,
          difficulty: difficulty || undefined
        });

        if (projRes.success) {
          setProjects(projRes.data);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setIsProjectsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      loadCatalog();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, difficulty]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDifficulty('');
  };

  const difficulties = [
    { label: 'All Kits', value: '' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' }
  ];

  return (
    <EShopLayout searchQuery={searchTerm} onSearchChange={setSearchTerm}>
      <SEO
        title="Project Kits Catalog"
        description="Explore robotics kits to build your custom IoT, embedded systems, and automation projects."
        path="/project-kits"
      />
      <div className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-12">
        {/* Breadcrumb */}
        <nav
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground mb-4 sm:mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-foreground whitespace-nowrap min-h-[44px] inline-flex items-center px-1 -mx-1 rounded-md touch-manipulation"
          >
            Home
          </Link>
          <span className="text-muted-foreground/80" aria-hidden>
            /
          </span>
          <span className="text-foreground font-medium min-h-[44px] inline-flex items-center">
            Project Kits
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Project Kits</h1>
            <p className="text-sm text-muted-foreground">
              {isProjectsLoading
                ? 'Loading…'
                : `${projects.length} project kit${projects.length === 1 ? '' : 's'} found`}
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => setDifficulty(diff.value)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-colors ${difficulty === diff.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-foreground hover:bg-secondary'
                }`}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {/* Grid / Listing */}
        {isProjectsLoading && projects.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-card/35 border border-border/60 rounded-2xl max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1.5">No Projects Found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              We couldn't find any projects matching your search query or filters.
            </p>
            <Button onClick={handleResetFilters} variant="outline" size="sm">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {projects.map((project) => (
              <Card
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
                className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                  <img
                    src={(project.images && project.images[0]) || PLACEHOLDER_IMAGE}
                    alt={project.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                    <Badge className="bg-primary/95 text-white border-none text-[9px] uppercase tracking-wider font-semibold">
                      {project.projectType === 'combo_components' ? 'Kit Combo' : 'Ready Made'}
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary/95 text-white border-border/50 text-[9px] capitalize">
                      {project.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium text-foreground line-clamp-1">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Build time: {project.estimatedBuildTime || 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-0 flex-1">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {project.shortDescription}
                  </p>
                  {project.components && project.components.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {project.components.slice(0, 3).map((comp) => (
                        <Badge key={comp} variant="outline" className="text-[10px] py-0 px-2 font-medium bg-secondary/30 border-border/60 text-white">
                          {comp}
                        </Badge>
                      ))}
                      {project.components.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center ml-1">
                          +{project.components.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 border-t border-border mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground line-through">
                      ₹{formatPrice(project.mrp)}
                    </span>
                    <span className="font-bold text-sm sm:text-base text-primary">
                      ₹{formatPrice(project.price)}
                    </span>
                  </div>
                  <Button size="sm" className="font-bold gap-1 rounded-full px-4 text-xs">
                    View Kit
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EShopLayout>
  );
};

export default ProjectsConsultancyPage;
