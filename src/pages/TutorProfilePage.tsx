import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tutorsApi, sessionsApi, User, SessionSlot } from '../services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, BookOpen, ChevronLeft, CalendarPlus, Video } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '@/constants/media';
import { formatPrice } from '@/utils/price';
import SEO from '@/components/SEO';

const TutorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [tutor, setTutor] = useState<User | null>(null);
  const [slots, setSlots] = useState<SessionSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  useEffect(() => {
    const loadTutorAndSlots = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [tutorRes, slotsRes] = await Promise.all([
          tutorsApi.getById(id),
          sessionsApi.getAvailableSlots(id)
        ]);

        if (tutorRes.success) {
          setTutor(tutorRes.data);
        }
        if (slotsRes.success) {
          setSlots(slotsRes.data);
        }
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to load tutor profile details.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTutorAndSlots();
  }, [id, toast]);

  const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });

  const handleBookSlot = async (slot: SessionSlot) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to book a mentoring session.',
        variant: 'destructive'
      });
      navigate(`/login?redirect=/tutor/${id}`);
      return;
    }

    setBookingSlotId(slot._id);
    try {
      const res = await sessionsApi.bookSlot(slot._id);
      
      // Case 1: Free session
      if (res.booked) {
        toast({
          title: 'Session Booked!',
          description: `Successfully booked "${slot.topic}" with ${tutor?.name}. Check your account dashboard for join links.`
        });
        setSlots(slots.filter(s => s._id !== slot._id));
        setBookingSlotId(null);
        return;
      }

      // Case 2: Paid session
      await loadRazorpay();
      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        order_id: res.data.orderId,
        name: 'Innovative Hub',
        description: `1-on-1 Robotics Session: ${slot.topic}`,
        handler: async (response: any) => {
          try {
            const verifyRes = await sessionsApi.verifyBooking(slot._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.success) {
              toast({
                title: 'Session Booked!',
                description: `Payment verified. Successfully booked session with ${tutor?.name}.`
              });
              setSlots(slots.filter(s => s._id !== slot._id));
            }
          } catch (err) {
            toast({
              title: 'Verification failed',
              description: 'Payment verification failed. Please contact support.',
              variant: 'destructive'
            });
          } finally {
            setBookingSlotId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setBookingSlotId(null);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast({
        title: 'Booking failed',
        description: err instanceof Error ? err.message : 'Could not proceed with booking.',
        variant: 'destructive'
      });
      setBookingSlotId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md min-h-[60vh] flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-2">Tutor Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested tutor profile is not available or is pending approval.</p>
        <Button onClick={() => navigate('/tutor-directory')}>Back to Tutors</Button>
      </div>
    );
  }

  return (
    <>
      <SEO title={`${tutor.name} - Robotics Tutor`} description={`Book 1-on-1 mentoring sessions with ${tutor.name}.`} path={`/tutor/${id}`} />
      <div className="network-bg min-h-screen py-6 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate('/tutor-directory')}>
            <ChevronLeft className="w-4 h-4" />
            Back to Directory
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Profile Info */}
            <div className="md:col-span-1 bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6 text-center space-y-4">
              <img
                src={tutor.profileImage || PLACEHOLDER_IMAGE}
                alt={tutor.name}
                className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-primary/45"
              />
              <div>
                <h2 className="text-xl font-bold text-foreground">{tutor.name}</h2>
                <p className="text-xs text-primary font-semibold flex items-center justify-center gap-1 mt-1">
                  <Video className="w-3.5 h-3.5" />
                  1-on-1 Robotics Mentor
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center pt-2">
                {tutor.expertise?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] bg-secondary/50 border border-border/50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Biography & Session Booking */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio Card */}
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    About the Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{tutor.bio}</p>
                </CardContent>
              </Card>

              {/* Sessions Slots Card */}
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Available Mentoring Slots
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {slots.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-border/60 rounded-lg">
                      <CalendarPlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No slots are currently listed by this mentor.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {slots.map((slot) => (
                        <div
                          key={slot._id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border/60 hover:bg-muted/10 rounded-xl gap-4 transition-colors"
                        >
                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm text-foreground">{slot.topic}</h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                {formatDate(slot.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                {slot.time}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <DollarSign className="w-3.5 h-3.5 text-primary" />
                                {slot.cost === 0 ? 'Free' : `₹${formatPrice(slot.cost)}`}
                              </span>
                            </div>
                          </div>
                          <Button
                            className="w-full sm:w-auto font-semibold"
                            onClick={() => handleBookSlot(slot)}
                            disabled={bookingSlotId === slot._id}
                          >
                            {bookingSlotId === slot._id ? 'Booking...' : 'Book Session'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorProfilePage;
