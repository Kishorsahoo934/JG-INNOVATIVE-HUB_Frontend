import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { internshipsApi, InternshipApplication } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, Cpu, Layers, Code, FileText, Link2, 
  User, Mail, Phone, CheckCircle2, AlertCircle, 
  ExternalLink, Calendar, GraduationCap, ChevronRight,
  Sparkles, Award, Wallet, Star, ShieldCheck, ArrowRight
} from 'lucide-react';
import SEO from '@/components/SEO';
import ScrollReveal from '@/components/ScrollReveal';

const SKILL_OPTIONS = [
  'C/C++ Programming',
  'Python Programming',
  'Arduino & ESP32 Microcontrollers',
  'STM32 & ARM Cortex-M',
  'PCB Designing (KiCad / Altium)',
  'ROS / ROS2 (Robot Operating System)',
  'IoT Protocols (MQTT, HTTP, WebSockets)',
  'Autonomous Navigation & SLAM',
  '3D CAD Modeling (Fusion360/SolidWorks)',
  'Embedded Linux (Raspberry Pi/Yocto)'
];

const InternshipsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'details' | 'my-applications'>('details');
  const [selectedCategory, setSelectedCategory] = useState<'paid' | 'self-funded'>('paid');
  const [selectedTier, setSelectedTier] = useState<'1-month' | '45-days' | '2-month'>('1-month');
  const [showForm, setShowForm] = useState(false);

  const handleApplyClick = (category: 'paid' | 'self-funded', tier?: '1-month' | '45-days' | '2-month') => {
    setSelectedCategory(category);
    if (category === 'self-funded' && tier) {
      setSelectedTier(tier);
    }
    setForm(prev => ({ ...prev, yearOfStudy: '3rd-year' }));
    setShowForm(true);
    
    // Smooth scroll and focus on name field
    setTimeout(() => {
      const element = document.getElementById('application-form-card');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      const nameInput = document.getElementById('i-name');
      if (nameInput) {
        nameInput.focus();
      }
    }, 100);
  };
  
  const [myApplications, setMyApplications] = useState<InternshipApplication[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    skills: '',
    resumeUrl: '',
    coverLetter: '', // optional cover letter / notes
    githubUrl: '',
    linkedinUrl: '',
    personalPortfolioUrl: '',
    yearOfStudy: '3rd-year' // default
  });

  // Load user data into form when logged in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || ''
      }));
    }
  }, [user]);

  // Load user applications
  const fetchMyApplications = async () => {
    if (!isAuthenticated) return;
    setIsLoadingApps(true);
    try {
      const res = await internshipsApi.getMyApplications();
      if (res.success) {
        setMyApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyApplications();
    }
  }, [isAuthenticated]);



  const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit your internship application.',
        variant: 'destructive'
      });
      navigate('/login?redirect=/internships');
      return;
    }

    // Validation
    if (!form.name.trim() || !form.email.trim() || !form.mobile.trim() || !form.resumeUrl.trim()) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill out all mandatory fields (Name, Email, Mobile, Resume URL).',
        variant: 'destructive'
      });
      return;
    }

    const parsedSkills = form.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (parsedSkills.length === 0) {
      toast({
        title: 'Skills Required',
        description: 'Please enter at least one skill.',
        variant: 'destructive'
      });
      return;
    }

    if (!/^https?:\/\/.+/.test(form.resumeUrl.trim())) {
      toast({
        title: 'Invalid Resume Link',
        description: 'Resume link must be a valid URL (Google Drive, Dropbox, etc.) starting with http:// or https://',
        variant: 'destructive'
      });
      return;
    }

    // Validation specific to category
    if (selectedCategory === 'paid') {
      if (form.yearOfStudy !== '3rd-year' && form.yearOfStudy !== '4th-year') {
        toast({
          title: 'Stipend Application Restrained',
          description: 'Paid internships are restricted to 3rd year & 4th year students only.',
          variant: 'destructive'
        });
        return;
      }
    }

    setIsSubmitting(true);

    if (selectedCategory === 'self-funded') {
      try {
        await loadRazorpay();
        const paymentRes = await internshipsApi.createPayment(selectedTier);
        if (!paymentRes.success || !paymentRes.data) {
          throw new Error(paymentRes.message || 'Failed to create payment order.');
        }
        const orderData = paymentRes.data;

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.orderId,
          name: 'JG Innovative Hub',
          description: `Self-Funded Internship - ${selectedTier === '1-month' ? '1 Month' : selectedTier === '45-days' ? '45 Days' : '2 Months'}`,
          prefill: {
            name: form.name.trim(),
            email: form.email.trim(),
            contact: form.mobile.trim(),
          },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              setIsSubmitting(true);
              const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                mobile: form.mobile.trim(),
                skills: parsedSkills,
                resumeUrl: form.resumeUrl.trim(),
                coverLetter: form.coverLetter.trim() || `Self-funded internship application.`,
                githubUrl: form.githubUrl.trim() || undefined,
                linkedinUrl: form.linkedinUrl.trim() || undefined,
                personalPortfolioUrl: form.personalPortfolioUrl.trim() || undefined,
                category: selectedCategory,
                tier: selectedTier,
                yearOfStudy: form.yearOfStudy,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              };

              const res = await internshipsApi.apply(payload);
              if (res.success) {
                toast({
                  title: 'Application & Payment Successful!',
                  description: 'Your self-funded internship application has been successfully recorded.'
                });
                // Reset form
                setForm(prev => ({
                  ...prev,
                  skills: '',
                  resumeUrl: '',
                  coverLetter: '',
                  githubUrl: '',
                  linkedinUrl: '',
                  personalPortfolioUrl: '',
                  yearOfStudy: '3rd-year'
                }));
                setShowForm(false);
                await fetchMyApplications();
                setActiveTab('my-applications');
              }
            } catch (err: any) {
              toast({
                title: 'Verification Failed',
                description: err.message || 'Verification of application failed. Contact support with payment ID.',
                variant: 'destructive'
              });
            } finally {
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              toast({
                title: 'Payment Dismissed',
                description: 'You closed the payment popup. The application has not been submitted.',
                variant: 'destructive'
              });
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new ((window as any).Razorpay)(options);
        rzp.open();
      } catch (err: any) {
        toast({
          title: 'Payment Order Failed',
          description: err.message || 'Could not initiate payment order. Please try again.',
          variant: 'destructive'
        });
        setIsSubmitting(false);
      }
    } else {
      // Paid internship - directly submit
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        skills: parsedSkills,
        resumeUrl: form.resumeUrl.trim(),
        coverLetter: form.coverLetter.trim() || `Paid internship application.`,
        githubUrl: form.githubUrl.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        personalPortfolioUrl: form.personalPortfolioUrl.trim() || undefined,
        category: selectedCategory,
        yearOfStudy: form.yearOfStudy
      };

      try {
        const res = await internshipsApi.apply(payload);
        if (res.success) {
          toast({
            title: 'Application Submitted!',
            description: 'Your internship application has been successfully recorded.'
          });
          // Reset form
          setForm(prev => ({
            ...prev,
            skills: '',
            resumeUrl: '',
            coverLetter: '',
            githubUrl: '',
            linkedinUrl: '',
            personalPortfolioUrl: '',
            yearOfStudy: '3rd-year'
          }));
          setShowForm(false);
          await fetchMyApplications();
          setActiveTab('my-applications');
        }
      } catch (err: any) {
        toast({
          title: 'Application Failed',
          description: err.message || 'Something went wrong during submission.',
          variant: 'destructive'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getStatusBadge = (status: InternshipApplication['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending Review</Badge>;
      case 'under-review':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border border-blue-500/20">Under Review</Badge>;
      case 'shortlisted':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-rose-500/10 text-rose-500 border border-rose-500/20">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <SEO 
        title="Robotics & IoT Internship Program" 
        description="Apply for live hands-on internships in Robotics Firmware, PCB Design, IoT Architectures, and Autonomous Navigation with ROS at Innovative Hub." 
        path="/internships" 
      />

      <div className="network-bg min-h-screen py-10 sm:py-16 md:py-20 text-foreground">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Main Tabs switcher */}
          <div className="flex justify-center mb-8">
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full max-w-xs">
              <TabsList className="bg-[#0c121e] border border-border/60 p-1 w-full grid grid-cols-2">
                <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs py-2">
                  Internships
                </TabsTrigger>
                <TabsTrigger 
                  value="my-applications" 
                  disabled={!isAuthenticated}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs py-2"
                >
                  My Applications ({myApplications.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === 'details' ? (
            <div className="space-y-12">
              {/* Paid Internship Section */}
              <ScrollReveal>
                <div className="bg-card/45 backdrop-blur-md rounded-2xl p-6 sm:p-8 md:p-10 border border-border/60 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-8 space-y-6">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit block">
                          Category 1: Sponsored Stipend
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-black">
                          Paid Internship Program
                        </h2>
                        <p className="text-sm text-black leading-relaxed text-justify">
                          Work directly on our industry-grade firmware development, PCB design layouts, and control system routing for mobile robots at our Odisha R&D Center. Get mentorship from senior hardware engineers and earn a competitive monthly stipend.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-black">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Monthly salary / stipend from company</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Industry-sponsored real product R&D</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-black">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <span>Eligibility: 3rd & 4th Year B.Tech/MCA/M.Sc students only</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Certificate of Completion + Project Letter</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-4 flex justify-center md:justify-end">
                      <Button 
                        onClick={() => handleApplyClick('paid')}
                        className="w-full sm:w-auto font-bold px-8 py-6 rounded-xl gap-2 text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all"
                      >
                        Apply for Paid Intern
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Self-Funded Internship Section */}
              <div className="space-y-8">
                <ScrollReveal>
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full w-fit mx-auto block">
                      Category 2: Research & Training
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-black">Self-Funded Research Internship</h2>
                    <p className="text-sm text-black">
                      Gain hands-on experience, microcontroller component kits, and official engineering certifications. Open to 1st, 2nd, 3rd, and 4th Year students.
                    </p>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      id: '1-month',
                      duration: '1 Month Research Program',
                      price: '₹299',
                      tagline: 'Certificate Track',
                      benefits: [
                        'Official Verification Certificate',
                        'Basic Hardware Components Access',
                        'Online Resource Access',
                        'Standard Lab Projects'
                      ]
                    },
                    {
                      id: '45-days',
                      duration: '45 Days Research Program',
                      price: '₹399',
                      tagline: 'Certificate + LOR Track',
                      benefits: [
                        'Official Verification Certificate',
                        'Official Letter of Recommendation (LOR)',
                        'Embedded System Components Kit',
                        'Intermediate Project Guidance'
                      ]
                    },
                    {
                      id: '2-month',
                      duration: '2 Months Research Program',
                      price: '₹499',
                      tagline: 'Career Accelerator Track',
                      benefits: [
                        'Official Verification Certificate',
                        'Official Letter of Recommendation (LOR)',
                        'IoT & Autonomous Robotics Kits',
                        'Placement Guidance & Reference Reviews',
                        'Direct Hiring Consideration'
                      ]
                    }
                  ].map((tier) => (
                    <div 
                      key={tier.id}
                      className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/60 hover:border-blue-500/50 flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 uppercase font-bold tracking-wider mb-2">
                            {tier.tagline}
                          </Badge>
                          <h3 className="text-lg font-bold text-black leading-snug">{tier.duration}</h3>
                          <p className="text-3xl font-black text-primary font-mono mt-2">{tier.price}</p>
                        </div>

                        <ul className="space-y-2 border-t border-border/20 pt-4 text-[11px] text-black leading-relaxed min-h-[140px]">
                          {tier.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6">
                        <Button
                          onClick={() => handleApplyClick('self-funded', tier.id as any)}
                          variant="outline"
                          className="w-full text-xs font-bold py-4 border-blue-500/30 hover:bg-blue-500 hover:text-black hover:border-blue-500 transition-colors shadow-sm"
                        >
                          Apply Now ({tier.price})
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                {/* Application Form Section */}
                {showForm && (
                  <ScrollReveal>
                    <div id="application-form-card" className="max-w-2xl mx-auto scroll-mt-24 pt-4">
                      <Card className="bg-card/60 backdrop-blur-sm border-primary/30 shadow-2xl relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowForm(false)}
                          className="absolute top-4 right-4 text-xs text-black hover:text-black"
                        >
                          Close Form
                        </Button>
                        <CardHeader>
                          <CardTitle className="text-xl font-bold flex items-center gap-2 text-black">
                            <Briefcase className="w-5 h-5 text-primary" />
                            Apply for {selectedCategory === 'paid' ? 'Paid Internship (Stipend)' : `Self-Funded Internship (${selectedTier === '1-month' ? '1 Month' : selectedTier === '45-days' ? '45 Days' : '2 Months'})`}
                          </CardTitle>
                          <CardDescription className="text-black text-xs">
                            {selectedCategory === 'paid' 
                              ? 'This is a sponsored position. You will receive a stipend/salary from company. Restricted to 3rd & 4th Year B.Tech/MCA/M.Sc students only.'
                              : `Training tier fee: ${selectedTier === '1-month' ? '₹299' : selectedTier === '45-days' ? '₹399' : '₹499'} payable upon verification.`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Name */}
                            <div className="space-y-1.5">
                              <Label htmlFor="i-name" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <User className="w-3.5 h-3.5 text-primary" /> Full Name
                              </Label>
                              <Input
                                id="i-name"
                                placeholder="Your Full Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                className="bg-background/50 border-border rounded-lg text-sm text-foreground"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Email */}
                              <div className="space-y-1.5">
                                <Label htmlFor="i-email" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                  <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
                                </Label>
                                <Input
                                  id="i-email"
                                  type="email"
                                  placeholder="you@example.com"
                                  value={form.email}
                                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                                  required
                                  className="bg-background/50 border-border rounded-lg text-sm text-foreground"
                                />
                              </div>
                              {/* Mobile */}
                              <div className="space-y-1.5">
                                <Label htmlFor="i-mobile" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                  <Phone className="w-3.5 h-3.5 text-primary" /> Mobile / Phone Number
                                </Label>
                                <Input
                                  id="i-mobile"
                                  placeholder="e.g. +91 9876543210"
                                  value={form.mobile}
                                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                  required
                                  className="bg-background/50 border-border rounded-lg text-sm text-foreground"
                                />
                              </div>
                            </div>

                            {/* Year of study select block */}
                            <div className="space-y-1.5">
                              <Label htmlFor="i-year" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <GraduationCap className="w-3.5 h-3.5 text-primary" /> Current Year of Study
                              </Label>
                              <select
                                id="i-year"
                                value={form.yearOfStudy}
                                onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })}
                                className="w-full bg-background border border-border px-3 py-2 text-sm rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                {selectedCategory === 'paid' ? (
                                  <>
                                    <option value="3rd-year">3rd Year (B.Tech / MCA / M.Sc)</option>
                                    <option value="4th-year">4th Year (B.Tech / MCA / M.Sc)</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="1st-year">1st Year (B.Tech / MCA / M.Sc / Diploma)</option>
                                    <option value="2nd-year">2nd Year (B.Tech / MCA / M.Sc / Diploma)</option>
                                    <option value="3rd-year">3rd Year (B.Tech / MCA / M.Sc / Diploma)</option>
                                    <option value="4th-year">4th Year (B.Tech / MCA / M.Sc)</option>
                                  </>
                                )}
                              </select>
                              {selectedCategory === 'paid' && (
                                <p className="text-[10px] text-black font-medium">Note: Paid internships require active enrollment in 3rd or 4th year.</p>
                              )}
                            </div>

                            {/* Skills Input */}
                            <div className="space-y-1.5">
                              <Label htmlFor="i-skills" className="flex items-center gap-1.5 text-xs font-semibold text-black">
                                <Code className="w-3.5 h-3.5 text-primary" /> Core Skills
                              </Label>
                              <Input
                                id="i-skills"
                                placeholder="e.g. C/C++, Python, Arduino, PCB Designing (comma-separated)"
                                value={form.skills}
                                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                                required
                                className="bg-background/50 border-border rounded-lg text-sm text-black placeholder:text-slate-500"
                              />
                              <p className="text-[10px] text-black">
                                Please type your core skills, separated by commas.
                              </p>
                            </div>

                            {/* Resume link */}
                            <div className="space-y-1.5">
                              <Label htmlFor="i-resume" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <Link2 className="w-3.5 h-3.5 text-primary" /> Resume URL
                              </Label>
                              <Input
                                id="i-resume"
                                type="url"
                                placeholder="https://drive.google.com/... (Sharing set to 'Anyone with link')"
                                value={form.resumeUrl}
                                onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                                required
                                className="bg-background/50 border-border rounded-lg text-sm text-foreground"
                              />
                              <p className="text-[10px] text-black">
                                Please upload your CV/Resume to Google Drive or Dropbox and paste the public link here.
                              </p>
                            </div>

                            {/* Social Links Block */}
                            <div className="space-y-4 border-t border-border/40 pt-4">
                              <Label className="font-bold text-foreground text-xs flex items-center gap-2">
                                <Link2 className="w-3.5 h-3.5 text-primary" /> Profile & Portfolio Links
                              </Label>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* LinkedIn */}
                                <div className="space-y-1">
                                  <Label htmlFor="i-linkedin" className="text-[10px] text-black uppercase font-semibold">LinkedIn Profile</Label>
                                  <Input
                                    id="i-linkedin"
                                    type="url"
                                    placeholder="https://linkedin.com/in/username"
                                    value={form.linkedinUrl}
                                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                                    className="bg-background/50 border-border rounded-lg text-xs text-foreground"
                                  />
                                </div>

                                {/* GitHub */}
                                <div className="space-y-1">
                                  <Label htmlFor="i-github" className="text-[10px] text-black uppercase font-semibold">GitHub Profile</Label>
                                  <Input
                                    id="i-github"
                                    type="url"
                                    placeholder="https://github.com/username"
                                    value={form.githubUrl}
                                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                                    className="bg-background/50 border-border rounded-lg text-xs text-foreground"
                                  />
                                </div>

                                {/* Personal Portfolio */}
                                <div className="space-y-1">
                                  <Label htmlFor="i-portfolio" className="text-[10px] text-black uppercase font-semibold">Personal Portfolio</Label>
                                  <Input
                                    id="i-portfolio"
                                    type="url"
                                    placeholder="https://myportfolio.com"
                                    value={form.personalPortfolioUrl}
                                    onChange={(e) => setForm({ ...form, personalPortfolioUrl: e.target.value })}
                                    className="bg-background/50 border-border rounded-lg text-xs text-foreground"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Optional notes cover letter */}
                            <div className="space-y-1.5">
                              <Label htmlFor="i-cover" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <FileText className="w-3.5 h-3.5 text-primary" /> Cover Letter / Motivation Note (Optional)
                              </Label>
                              <Textarea
                                id="i-cover"
                                placeholder="Tell us why you want to join our internship team..."
                                value={form.coverLetter}
                                onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                                className="min-h-[80px] bg-background/50 border-border rounded-lg text-xs text-foreground"
                              />
                            </div>

                            <Button 
                              type="submit" 
                              className="w-full py-5 font-bold mt-2 rounded-xl text-sm" 
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollReveal>
                )}
              </div>
          ) : (
            /* TAB: Applications list */
            <div className="space-y-6 focus-visible:outline-none">
              {isLoadingApps ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : myApplications.length === 0 ? (
                <Card className="bg-card/40 border-border/60 py-16 text-center max-w-md mx-auto">
                  <CardContent className="space-y-3">
                    <AlertCircle className="w-10 h-10 mx-auto text-black" />
                    <h3 className="font-bold text-lg text-foreground">No applications found</h3>
                    <p className="text-sm text-black">You haven't submitted any internship applications yet.</p>
                    <Button onClick={() => setActiveTab('details')} size="sm">Browse Internships</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {myApplications.map((app) => (
                    <Card key={app._id} className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/20 transition-all shadow-md">
                      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span>
                              {app.category === 'paid' 
                                ? 'Paid Stipend Internship' 
                                : `Self-Funded Internship (${app.tier === '1-month' ? '1 Month' : app.tier === '45-days' ? '45 Days' : '2 Months'})`}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-[10px] mt-1">
                            Applied on {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Year of Study: <span className="capitalize">{app.yearOfStudy?.replace('-', ' ')}</span>
                          </CardDescription>
                        </div>
                        <div className="self-start sm:self-center">
                          {getStatusBadge(app.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div>
                          <span className="text-[10px] text-black block mb-1.5 font-bold uppercase tracking-wider">Skills Selected:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {app.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-slate-900 border border-border/60 text-[10px] py-0 px-2.5">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {app.coverLetter && (
                          <div className="border-t border-border/40 pt-3">
                            <span className="text-[10px] text-black block mb-1 font-bold uppercase tracking-wider">Cover Letter:</span>
                            <p className="text-xs text-black leading-relaxed">
                              {app.coverLetter}
                            </p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t border-border/40 py-3 bg-muted/5 flex flex-wrap gap-x-6 gap-y-2">
                        <a 
                          href={app.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Resume CV
                        </a>
                        {app.linkedinUrl && (
                          <a 
                            href={app.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            LinkedIn
                          </a>
                        )}
                        {app.githubUrl && (
                          <a 
                            href={app.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            GitHub
                          </a>
                        )}
                        {app.personalPortfolioUrl && (
                          <a 
                            href={app.personalPortfolioUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Portfolio
                          </a>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InternshipsPage;
