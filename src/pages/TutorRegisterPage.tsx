import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tutorsApi } from '../services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, UserCheck, ShieldAlert, Award, Plus, X, GraduationCap, Link2 } from 'lucide-react';
import SEO from '@/components/SEO';

const EXPERTISE_OPTIONS = [
  'Arduino',
  'Raspberry Pi',
  'ROS',
  'IoT & Wireless',
  '3D Printing & CAD',
  'PCB Design',
  'Embedded C/Python',
  'Robotic Kinematics',
  'Computer Vision (OpenCV)',
  'Machine Learning & AI',
  'Control Systems',
  'Sensors & Actuators',
  'Microcontrollers (ESP32/STM32)',
  'Robotics Simulation (Gazebo/Webots)'
];

const TutorRegisterPage = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Social fields
  const [linkedin, setLinkedin] = useState('');
  const [googleScholar, setGoogleScholar] = useState('');
  const [orcid, setOrcid] = useState('');
  const [medium, setMedium] = useState('');

  // Education fields
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  // Custom skills fields
  const [customSkill, setCustomSkill] = useState('');
  const [customSkillsList, setCustomSkillsList] = useState<string[]>([]);

  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: 30 }, (_, i) => currentYear + 5 - i); // Dynamic year range dropdown

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      setSelectedExpertise([...selectedExpertise, option]);
    } else {
      setSelectedExpertise(selectedExpertise.filter(item => item !== option));
    }
  };

  const handleAddCustomSkill = (e: React.MouseEvent) => {
    e.preventDefault();
    const skill = customSkill.trim();
    if (!skill) return;

    if (EXPERTISE_OPTIONS.includes(skill) || customSkillsList.includes(skill)) {
      toast({
        title: 'Skill already exists',
        description: 'This skill is already in your selected list.',
        variant: 'destructive'
      });
      return;
    }

    setCustomSkillsList([...customSkillsList, skill]);
    setSelectedExpertise([...selectedExpertise, skill]);
    setCustomSkill('');
  };

  const handleRemoveCustomSkill = (skill: string) => {
    setCustomSkillsList(customSkillsList.filter(s => s !== skill));
    setSelectedExpertise(selectedExpertise.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to submit your tutor application.',
        variant: 'destructive'
      });
      navigate('/login?redirect=/tutor-registration');
      return;
    }

    if (!bio.trim() || bio.trim().length < 50) {
      toast({
        title: 'Detailed bio required',
        description: 'Please write a bio of at least 50 characters describing your tutor background.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedExpertise.length === 0) {
      toast({
        title: 'Select expertise',
        description: 'Please select or add at least one area of expertise.',
        variant: 'destructive'
      });
      return;
    }

    if (!linkedin.trim()) {
      toast({
        title: 'LinkedIn Required',
        description: 'Please provide your LinkedIn profile URL.',
        variant: 'destructive'
      });
      return;
    }

    if (!college.trim()) {
      toast({
        title: 'Education details required',
        description: 'Please enter your College/University name.',
        variant: 'destructive'
      });
      return;
    }

    if (!course.trim()) {
      toast({
        title: 'Education details required',
        description: 'Please enter your Course or Major.',
        variant: 'destructive'
      });
      return;
    }

    if (!graduationYear) {
      toast({
        title: 'Education details required',
        description: 'Please select a valid graduation year.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        bio,
        expertise: selectedExpertise,
        socials: {
          linkedin: linkedin.trim(),
          googleScholar: googleScholar.trim() || undefined,
          orcid: orcid.trim() || undefined,
          medium: medium.trim() || undefined
        },
        education: {
          college: college.trim(),
          course: course.trim(),
          graduationYear: Number(graduationYear)
        }
      };

      const res = await tutorsApi.apply(payload);
      if (res.success) {
        await refreshUser();
        toast({
          title: 'Application Submitted!',
          description: 'Your tutor profile application is pending admin approval.'
        });
        navigate('/account?tab=settings');
      }
    } catch (err) {
      toast({
        title: 'Application failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md min-h-[60vh] flex flex-col justify-center">
        <ShieldAlert className="w-12 h-12 mx-auto text-warning mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please Login</h2>
        <p className="text-muted-foreground mb-6">You must have an account to register as a robotics tutor.</p>
        <Button onClick={() => navigate('/login?redirect=/tutor-registration')}>Log In</Button>
      </div>
    );
  }

  if (user?.role === 'tutor') {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md min-h-[60vh] flex flex-col justify-center">
        <UserCheck className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Already Registered</h2>
        {user.tutorStatus === 'approved' ? (
          <>
            <p className="text-muted-foreground mb-6">Your tutor profile is approved! You can now start creating courses and booking sessions.</p>
            <Button onClick={() => navigate('/tutor-dashboard')}>Go to Tutor Dashboard</Button>
          </>
        ) : user.tutorStatus === 'pending' ? (
          <p className="text-muted-foreground">Your tutor application is currently pending administrator approval. We will review it shortly.</p>
        ) : (
          <p className="text-muted-foreground">Your tutor application was rejected or suspended. Please contact support.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <SEO title="Become a Robotics Tutor" description="Apply to become a robotics tutor on Innovative Hub." path="/tutor-registration" noIndex />
      <div className="network-bg py-10 sm:py-16 md:py-20 min-h-screen">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <Award className="w-12 h-12 mx-auto text-primary mb-3" />
            <h1 className="text-3xl font-bold tracking-tight mb-2">Join as a Robotics Tutor</h1>
            <p className="text-muted-foreground">Share your knowledge with robotics learners, build courses, and conduct 1-on-1 sessions.</p>
          </div>

          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6 sm:p-10 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Bio */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/60 pb-2">1. Tutor Biography</h3>
                <Label htmlFor="bio">Professional Bio <span className="text-destructive">*</span></Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your background, experience in robotics or IoT, teaching style, or projects you have built. (Min. 50 characters)"
                  className="min-h-[120px] bg-background/50"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Character count: <span className={bio.trim().length >= 50 ? 'text-emerald-500 font-semibold' : 'text-amber-500'}>{bio.trim().length}</span> / 50 minimum
                </p>
              </div>

              {/* Education Background */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/60 pb-2 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  2. Educational Background
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="college">College / University Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="college"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Indian Institute of Technology, Delhi"
                      className="bg-background/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <Label htmlFor="course">Course / Major <span className="text-destructive">*</span></Label>
                      <Input
                        id="course"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="e.g. B.Tech in Mechanical Engineering"
                        className="bg-background/50"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="graduationYear">Graduation Year <span className="text-destructive">*</span></Label>
                      <select
                        id="graduationYear"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">Select Year</option>
                        {YEARS.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills and Expertise */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/60 pb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  3. Skills & Area of Expertise
                </h3>
                
                <Label>Select areas of expertise <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXPERTISE_OPTIONS.map((option) => (
                    <div key={option} className="flex items-start space-x-2 bg-background/30 p-2.5 rounded-lg border border-border/40 hover:bg-background/50 transition-colors">
                      <Checkbox
                        id={`exp-${option}`}
                        checked={selectedExpertise.includes(option)}
                        onCheckedChange={(checked) => handleCheckboxChange(option, !!checked)}
                      />
                      <Label htmlFor={`exp-${option}`} className="text-sm font-medium leading-none cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Custom Skills Adding */}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="custom-skill">Add Custom Skill</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-skill"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="e.g. Robot Operating System (ROS 2), Gazebo Sim"
                      className="bg-background/50 flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const btn = document.getElementById('add-custom-skill-btn');
                          if (btn) btn.click();
                        }
                      }}
                    />
                    <Button
                      id="add-custom-skill-btn"
                      type="button"
                      variant="outline"
                      onClick={handleAddCustomSkill}
                      className="shrink-0 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                  
                  {/* Custom skills badges display */}
                  {customSkillsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {customSkillsList.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSkill(skill)}
                            className="text-muted-foreground hover:text-foreground focus:outline-none rounded-full p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Social and Professional Profiles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/60 pb-2 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  4. Professional Profiles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="linkedin">LinkedIn Profile URL <span className="text-destructive">*</span></Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="bg-background/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="googleScholar">Google Scholar URL <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                    <Input
                      id="googleScholar"
                      type="url"
                      value={googleScholar}
                      onChange={(e) => setGoogleScholar(e.target.value)}
                      placeholder="https://scholar.google.com/citations?user=..."
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="orcid">ORCID iD URL <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                    <Input
                      id="orcid"
                      type="url"
                      value={orcid}
                      onChange={(e) => setOrcid(e.target.value)}
                      placeholder="https://orcid.org/0000-0000-0000-0000"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="medium">Medium Profile URL <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                    <Input
                      id="medium"
                      type="url"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      placeholder="https://medium.com/@username"
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full py-6 text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Application...' : 'Submit Tutor Application'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorRegisterPage;
