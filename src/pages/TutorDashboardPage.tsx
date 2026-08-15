import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsApi, SessionSlot } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar, Clock, DollarSign, Laptop, LogOut, Video, User, GraduationCap, Plus
} from 'lucide-react';
import { formatPrice } from '@/utils/price';
import SEO from '@/components/SEO';

const TutorDashboardPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [slots, setSlots] = useState<SessionSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    date: '',
    time: '',
    topic: '',
    cost: 0
  });

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const slotsRes = await sessionsApi.getTutorSlots();
      if (slotsRes.success) setSlots(slotsRes.data);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error loading dashboard',
        description: 'Could not fetch your tutoring schedule.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login?redirect=/tutor-dashboard');
      } else if (user?.role !== 'tutor' || user?.tutorStatus !== 'approved') {
        navigate('/account');
        toast({
          title: 'Access Denied',
          description: 'Only approved tutors can view the Tutor Dashboard.',
          variant: 'destructive'
        });
      } else {
        loadDashboardData();
      }
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  // Slot handlers
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await sessionsApi.createSlot(slotForm);
      if (res.success) {
        toast({ title: 'Availability added', description: 'New 1-on-1 session slot added successfully.' });
        setSlots([...slots, res.data]);
        setIsSlotDialogOpen(false);
        setSlotForm({ date: '', time: '', topic: '', cost: 0 });
      }
    } catch (err) {
      toast({
        title: 'Failed to add slot',
        description: err instanceof Error ? err.message : 'Could not save slot',
        variant: 'destructive'
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const bookedSessions = slots.filter(s => s.status === 'booked');
  const availableSlots = slots.filter(s => s.status === 'available');

  return (
    <>
      <SEO title="Tutor Dashboard" description="Manage your tutoring availability." path="/tutor-dashboard" noIndex />
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row network-bg">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border/60 p-6 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              <div>
                <h2 className="font-bold text-sm">Innovative Hub</h2>
                <p className="text-xs text-muted-foreground">Tutor Workspace</p>
              </div>
            </div>
            <div className="border-t border-border/40 pt-4">
              <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border/40">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {user?.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <nav className="space-y-1">
              <Link to="/eshop" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
                <Laptop className="w-4 h-4" />
                Go to E-Shop
              </Link>
              <Link to="/account" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
                <User className="w-4 h-4" />
                Student Account
              </Link>
            </nav>
          </div>

          <Button variant="ghost" className="justify-start gap-2 text-destructive mt-6" onClick={() => navigate('/account?tab=logout')}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </aside>

        {/* Dashboard Work Area */}
        <main className="flex-1 p-6 md:p-10 space-y-6 overflow-x-hidden">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tutor Dashboard</h1>
            <p className="text-muted-foreground">Manage your bookable tutoring hours.</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">1-on-1 Sessions</h2>
              <Button className="gap-1 font-semibold" onClick={() => setIsSlotDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Availability
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Booked Sessions */}
              <Card className="lg:col-span-2 bg-card/50 border-border/60">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Video className="w-5 h-5 text-emerald-500" />
                    Booked Mentoring Sessions
                  </CardTitle>
                  <CardDescription>Upcoming virtual calls booked by students</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookedSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">No upcoming bookings yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookedSessions.map((session) => {
                        const student = session.bookedBy as any;
                        return (
                          <div key={session._id} className="p-4 border border-border/50 rounded-xl bg-background/20 space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/30 pb-2">
                              <h4 className="font-semibold text-sm">{session.topic}</h4>
                              <Badge variant="secondary" className="bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">Paid</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(session.date).toLocaleDateString()}</p>
                              <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {session.time}</p>
                              <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary" /> Student: {student?.name || 'User'}</p>
                              <p className="flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5 text-primary" /> {student?.email}</p>
                            </div>
                            {session.meetingLink && (
                              <Button size="sm" className="w-full gap-1.5 font-semibold mt-2" asChild>
                                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                                  <Video className="w-4 h-4" />
                                  Join Virtual Meeting
                                </a>
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Hours */}
              <Card className="lg:col-span-1 bg-card/50 border-border/60">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Available Slots
                  </CardTitle>
                  <CardDescription>Open slots for booking</CardDescription>
                </CardHeader>
                <CardContent>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">No available hours listed.</p>
                  ) : (
                    <div className="space-y-3">
                      {availableSlots.map((slot) => (
                        <div key={slot._id} className="p-3 border border-border/40 rounded-xl bg-background/10 text-xs space-y-1.5">
                          <p className="font-semibold text-foreground truncate">{slot.topic}</p>
                          <p className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(slot.date).toLocaleDateString()}</p>
                          <p className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {slot.time}</p>
                          <p className="text-muted-foreground flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-primary" /> {slot.cost === 0 ? 'Free' : `₹${formatPrice(slot.cost)}`}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Add Slot Dialog */}
          <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
            <DialogContent className="bg-card border-border/60 text-foreground max-w-md">
              <DialogHeader>
                <DialogTitle>Add Session Availability Slot</DialogTitle>
                <DialogDescription>List hours when students can book a 1-on-1 virtual mentoring session with you.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveSlot} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="s-date">Date</Label>
                    <Input id="s-date" type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="s-time">Time (e.g. 14:00 - 15:00)</Label>
                    <Input id="s-time" placeholder="14:00 - 15:00" value={slotForm.time} onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-topic">Topic Expertise (e.g. ROS Setup, CAD review)</Label>
                  <Input id="s-topic" placeholder="ROS Navigation, PCB Routing, etc." value={slotForm.topic} onChange={(e) => setSlotForm({ ...slotForm, topic: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-cost">Cost (₹, 0 = Free)</Label>
                  <Input id="s-cost" type="number" min="0" value={slotForm.cost} onChange={(e) => setSlotForm({ ...slotForm, cost: Number(e.target.value) || 0 })} required />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsSlotDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Slot</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </>
  );
};

export default TutorDashboardPage;
