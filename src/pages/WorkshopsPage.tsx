import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workshopsApi, Workshop } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, ExternalLink, HelpCircle, AlertCircle, PlusCircle, Linkedin } from 'lucide-react';
import SEO from '@/components/SEO';

const WorkshopsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'explore' | 'enrolled'>('explore');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [enrolledWorkshops, setEnrolledWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const fetchWorkshops = async () => {
    setIsLoading(true);
    try {
      const res = await workshopsApi.getAll();
      if (res.success) {
        setWorkshops(res.data);
      }
    } catch (err) {
      console.error('Failed to load workshops:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrolledWorkshops = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await workshopsApi.getEnrolled();
      if (res.success) {
        setEnrolledWorkshops(res.data);
      }
    } catch (err) {
      console.error('Failed to load enrolled workshops:', err);
    }
  };

  useEffect(() => {
    fetchWorkshops();
    if (isAuthenticated) {
      fetchEnrolledWorkshops();
    }
  }, [isAuthenticated]);

  const handleEnroll = async (workshopId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to enroll in workshops.',
        variant: 'destructive',
      });
      navigate(`/login?redirect=/workshops`);
      return;
    }

    setIsActionLoading(workshopId);
    try {
      const res = await workshopsApi.enroll(workshopId);
      if (res.success) {
        toast({
          title: 'Successfully Enrolled!',
          description: 'You are registered for this workshop. The meeting details are unlocked.',
        });
        
        // Open Google Form link if available
        const workshop = workshops.find((w) => w._id === workshopId);
        if (workshop && workshop.googleFormLink) {
          window.open(workshop.googleFormLink, '_blank');
        }

        // Refresh catalogs
        await Promise.all([fetchWorkshops(), fetchEnrolledWorkshops()]);
      }
    } catch (err: any) {
      toast({
        title: 'Enrollment Failed',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUserEnrolled = (workshopId: string) => {
    return enrolledWorkshops.some((w) => w._id === workshopId);
  };

  return (
    <>
      <SEO 
        title="Robotics & Embedded Systems Workshops" 
        description="Join our live interactive robotics and IoT workshops. Learn firmware, ROS, CAD modeling, and PCB designing live from industry experts." 
        path="/workshops" 
      />
      
      <div className="network-bg min-h-screen py-10 sm:py-16 md:py-20 text-foreground">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 border-b border-border/40 pb-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Robotics Workshops</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Interactive live coding and building sessions. Register to reserve your seat and access virtual room keys.
              </p>
            </div>
          </div>

          {/* Catalog Tab Sections */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'explore' | 'enrolled')} className="space-y-6">
            {isAuthenticated && (
              <TabsList className="bg-[#0c121e] border border-border/60 p-1">
                <TabsTrigger value="explore" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs px-4">
                  Upcoming Workshops
                </TabsTrigger>
                <TabsTrigger value="enrolled" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs px-4">
                  My Enrolled ({enrolledWorkshops.length})
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="explore" className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : workshops.length === 0 ? (
                <Card className="bg-card/40 border-border/60 py-16 text-center max-w-md mx-auto">
                  <CardContent className="space-y-3">
                    <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground" />
                    <h3 className="font-bold text-lg text-foreground">No active workshops</h3>
                    <p className="text-sm text-muted-foreground">We are planning new workshops soon. Check back shortly!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workshops.map((workshop) => {
                    const enrolled = isUserEnrolled(workshop._id);
                    return (
                      <Card 
                        key={workshop._id} 
                        className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden shadow-md group text-left"
                      >
                        <Link to={`/workshop/${workshop._id}`} className="flex-1 flex flex-col justify-between">
                          {workshop.thumbnail ? (
                            <div className="w-full h-40 overflow-hidden relative">
                              <img src={workshop.thumbnail} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={workshop.title} />
                            </div>
                          ) : (
                            <div className="w-full h-40 bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center text-muted-foreground relative">
                              <Calendar className="w-8 h-8 opacity-40 text-primary animate-pulse" />
                            </div>
                          )}
                          <CardHeader className="pb-3 pt-4">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none text-[10px] uppercase font-bold tracking-wider">
                                {workshop.duration}
                              </Badge>
                              {enrolled && (
                                <Badge className="bg-emerald-600 text-white border-none text-[10px] uppercase font-bold tracking-wider">
                                  Enrolled
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-base font-bold line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                              {workshop.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 flex-1">
                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {workshop.description}
                            </p>
                            
                            <div className="space-y-2 text-xs text-muted-foreground border-t border-border/40 pt-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <span>{formatDate(workshop.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span>{workshop.time}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-primary" />
                                  <span>Host: <span className="font-semibold text-foreground">{workshop.hostName}</span></span>
                                </div>
                                {workshop.hostLinkedIn && (
                                  <a 
                                    href={workshop.hostLinkedIn} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-primary hover:text-foreground transition-colors p-1"
                                    title="LinkedIn Profile"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Linkedin className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Link>
                        
                        <CardFooter className="pt-3 pb-5 border-t border-border/40 bg-muted/5 flex flex-col gap-2">
                          {enrolled ? (
                            <Button className="w-full gap-1.5 font-bold" asChild>
                              <a href={workshop.googleFormLink || workshop.meetingLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                                Join Virtual Room
                              </a>
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleEnroll(workshop._id)}
                              className="w-full font-semibold"
                              disabled={isActionLoading === workshop._id}
                            >
                              {isActionLoading === workshop._id ? 'Enrolling...' : 'Reserve Seat (Free)'}
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="enrolled" className="space-y-6">
              {enrolledWorkshops.length === 0 ? (
                <Card className="bg-card/40 border-border/60 py-16 text-center max-w-md mx-auto">
                  <CardContent className="space-y-3">
                    <Calendar className="w-10 h-10 mx-auto text-muted-foreground" />
                    <h3 className="font-bold text-lg text-foreground">No enrollments</h3>
                    <p className="text-sm text-muted-foreground">You haven't registered for any upcoming workshops yet.</p>
                    <Button onClick={() => setActiveTab('explore')} size="sm">Browse Workshops</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledWorkshops.map((workshop) => (
                    <Card 
                      key={workshop._id} 
                      className="bg-card/50 border-primary/40 flex flex-col justify-between overflow-hidden shadow-md group text-left"
                    >
                      <Link to={`/workshop/${workshop._id}`} className="flex-1 flex flex-col justify-between">
                        {workshop.thumbnail ? (
                          <div className="w-full h-40 overflow-hidden relative">
                            <img src={workshop.thumbnail} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={workshop.title} />
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center text-muted-foreground relative">
                            <Calendar className="w-8 h-8 opacity-40 text-primary" />
                          </div>
                        )}
                        <CardHeader className="pb-3 pt-4">
                          <Badge className="bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider w-fit mb-2">
                            Ready to Join
                          </Badge>
                          <CardTitle className="text-base font-bold line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                            {workshop.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1">
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {workshop.description}
                          </p>
                          <div className="space-y-2 text-xs text-muted-foreground border-t border-border/40 pt-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              <span>{formatDate(workshop.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span>{workshop.time}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-primary" />
                                <span>Host: {workshop.hostName}</span>
                              </div>
                              {workshop.hostLinkedIn && (
                                <a 
                                  href={workshop.hostLinkedIn} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-primary hover:text-foreground transition-colors p-1"
                                  title="LinkedIn Profile"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Linkedin className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                      <CardFooter className="pt-3 pb-5 border-t border-border/40 bg-emerald-600/5">
                        <Button className="w-full gap-1.5 font-bold" asChild>
                          <a href={workshop.googleFormLink || workshop.meetingLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            Join Virtual Room
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default WorkshopsPage;
