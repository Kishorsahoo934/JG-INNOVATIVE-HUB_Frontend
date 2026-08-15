import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tutorsApi, User } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, Compass, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '@/constants/media';
import SEO from '@/components/SEO';

const EXPERTISE_TAGS = [
  'Arduino',
  'Raspberry Pi',
  'ROS (Robot Operating System)',
  'IoT & Wireless',
  '3D Printing & CAD',
  'PCB Design',
  'Embedded C/Python',
  'Robotic Kinematics',
  'Computer Vision (OpenCV)'
];

const TutorDirectoryPage = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');

  useEffect(() => {
    const fetchTutors = async () => {
      setIsLoading(true);
      try {
        const res = await tutorsApi.getAll({
          search: search.trim() || undefined,
          expertise: selectedExpertise || undefined
        });
        if (res.success) {
          setTutors(res.data);
        }
      } catch (err) {
        console.error('Failed to load tutors:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const delayDebounce = setTimeout(() => {
      fetchTutors();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedExpertise]);

  const handleToggleTag = (tag: string) => {
    setSelectedExpertise(selectedExpertise === tag ? '' : tag);
  };

  return (
    <>
      <SEO title="Find Robotics Tutors" description="Browse and connect with verified robotics, IoT, and embedded systems tutors." path="/tutor-directory" />
      <div className="network-bg min-h-screen py-10 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Robotics Mentors & Tutors</h1>
            <p className="text-muted-foreground">
              Book 1-on-1 personalized sessions with verified robotics engineers and embedded systems experts to accelerate your hardware projects.
            </p>
          </div>



          {/* Filters Bar */}
          <div className="space-y-4 mb-8">
            <div className="relative w-full max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tutors by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card/50 backdrop-blur-sm border-border w-full py-6 text-sm"
              />
            </div>

            {/* Tags list */}
            <div className="flex flex-wrap gap-2 justify-center py-2 max-w-3xl mx-auto">
              {EXPERTISE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    selectedExpertise === tag
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-card/40 border-border/80 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Tutor Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-16 bg-card/35 border border-border/60 rounded-xl max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No tutors found</h3>
              <p className="text-sm text-muted-foreground">Try clearing filters or checking back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor) => (
                <Card
                  key={tutor._id}
                  className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/60 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <img
                      src={tutor.profileImage || PLACEHOLDER_IMAGE}
                      alt={tutor.name}
                      className="w-16 h-16 rounded-full object-cover border border-border group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <CardTitle className="text-lg font-bold truncate">{tutor.name}</CardTitle>
                      <p className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
                        <Compass className="w-3 h-3" />
                        Robotics Tutor
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 py-0 flex-1">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {tutor.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tutor.expertise?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] py-0.5 px-2 bg-secondary/60 text-secondary-foreground border border-border/55">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-6 border-t border-border/40 mt-4 flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2" asChild>
                      <Link to={`/tutor/${tutor._id}`}>
                        <Calendar className="w-4 h-4" />
                        Book Slot
                      </Link>
                    </Button>
                    <Button className="flex-1 gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold" asChild>
                      <Link to={`/tutor/${tutor._id}`}>
                        <BookOpen className="w-4 h-4" />
                        View Profile
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TutorDirectoryPage;
