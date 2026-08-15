import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workshopsApi, Workshop } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, ExternalLink, AlertCircle, ArrowLeft, Linkedin } from 'lucide-react';
import SEO from '@/components/SEO';

const WorkshopDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchWorkshopDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await workshopsApi.getById(id);
      if (res.success && res.data) {
        setWorkshop(res.data);
      } else {
        toast({
          title: 'Not Found',
          description: 'Workshop details could not be retrieved.',
          variant: 'destructive',
        });
        navigate('/workshops');
      }
    } catch (err) {
      console.error('Failed to load workshop details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!isAuthenticated || !id) return;
    try {
      const res = await workshopsApi.getEnrolled();
      if (res.success && Array.isArray(res.data)) {
        const enrolled = res.data.some((w) => w._id === id);
        setIsEnrolled(enrolled);
      }
    } catch (err) {
      console.error('Failed to check enrollment:', err);
    }
  };

  useEffect(() => {
    fetchWorkshopDetails();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated) {
      checkEnrollmentStatus();
    }
  }, [isAuthenticated, id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to enroll in workshops.',
        variant: 'destructive',
      });
      navigate(`/login?redirect=/workshop/${id}`);
      return;
    }

    if (!id || !workshop) return;
    setIsActionLoading(true);
    try {
      const res = await workshopsApi.enroll(id);
      if (res.success) {
        toast({
          title: 'Successfully Enrolled!',
          description: 'You are registered for this workshop. Opening the registration form.',
        });
        setIsEnrolled(true);
        if (workshop.googleFormLink) {
          window.open(workshop.googleFormLink, '_blank');
        }
      }
    } catch (err: any) {
      toast({
        title: 'Enrollment Failed',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold">Workshop Not Found</h2>
          <Button asChild>
            <Link to="/workshops">Back to Workshops</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hostDetail = workshop.hostId && typeof workshop.hostId === 'object' ? workshop.hostId : null;

  return (
    <>
      <SEO 
        title={`${workshop.title} - Live Robotics Workshop`}
        description={workshop.description}
        path={`/workshop/${workshop._id}`}
      />
      
      <div className="network-bg min-h-screen py-10 sm:py-16 text-foreground">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Navigation */}
          <Link 
            to="/workshops" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workshops
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {workshop.thumbnail ? (
                <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden shadow-lg border border-border/30">
                  <img src={workshop.thumbnail} className="w-full h-full object-cover" alt={workshop.title} />
                </div>
              ) : (
                <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl flex items-center justify-center border border-border/30">
                  <Calendar className="w-16 h-16 text-primary/45 animate-pulse" />
                </div>
              )}

              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  {workshop.title}
                </h1>
                
                <div className="flex flex-wrap gap-2.5">
                  <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-bold tracking-wider py-1 px-2.5">
                    {workshop.duration}
                  </Badge>
                  {isEnrolled && (
                    <Badge className="bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider py-1 px-2.5">
                      Enrolled
                    </Badge>
                  )}
                </div>

                <div className="bg-card/40 backdrop-blur-sm border border-border/40 p-5 rounded-xl space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-primary">About this workshop</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {workshop.description}
                  </p>
                </div>

                {/* Host Details Section */}
                <div className="bg-card/30 border border-border/40 p-5 rounded-xl space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-primary">About the Host</h3>
                  <div className="flex gap-4">
                    {hostDetail?.profileImage ? (
                      <img src={hostDetail.profileImage} alt={workshop.hostName} className="w-14 h-14 rounded-full object-cover border border-border/60 shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground text-sm sm:text-base">{workshop.hostName}</h4>
                        {workshop.hostLinkedIn && (
                          <a 
                            href={workshop.hostLinkedIn} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:text-foreground transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {hostDetail?.bio || 'Expert instructor and practitioner in electronics and robotics development stacks.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Booking Sidebar Column */}
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/60 shadow-md sticky top-6">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-foreground uppercase tracking-wider text-center">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs text-muted-foreground block">Date</span>
                      <span className="font-medium text-foreground">{formatDate(workshop.date)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs text-muted-foreground block">Time & Duration</span>
                      <span className="font-medium text-foreground">{workshop.time} ({workshop.duration})</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-muted-foreground border-t border-border/40 pt-4">
                    <User className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs text-muted-foreground block">Host</span>
                      <span className="font-medium text-foreground">{workshop.hostName}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/40 bg-muted/5">
                  {isEnrolled ? (
                    <Button className="w-full gap-1.5 font-bold py-5 text-sm" asChild>
                      <a href={workshop.googleFormLink || workshop.meetingLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Join Workshop / Open Form
                      </a>
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleEnroll}
                      className="w-full font-bold py-5 text-sm"
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? 'Reserving...' : 'Reserve Seat (Free)'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkshopDetailPage;
