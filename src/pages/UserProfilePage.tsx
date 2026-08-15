import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User as UserIcon, BookOpen, GraduationCap, Linkedin, Award, 
  Globe, Edit3, Save, X, Upload, ArrowLeft, Calendar, Sparkles, Mail, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { publicProfileApi, userApi, User } from '../services/api';
import { toast } from 'sonner';

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    name: '',
    mobile: '',
    bio: '',
    expertise: '',
    college: '',
    course: '',
    graduationYear: '',
    linkedin: '',
    googleScholar: '',
    orcid: '',
    medium: '',
    profileImage: ''
  });

  const isSelf = currentUser && (currentUser._id === userId || currentUser.id === userId);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await publicProfileApi.getProfile(userId!);
      if (profileRes.success && profileRes.data) {
        const u = profileRes.data;
        setProfileUser(u);
        
        setEditForm({
          name: u.name || '',
          mobile: u.mobile || '',
          bio: u.bio || '',
          expertise: u.expertise ? u.expertise.join(', ') : '',
          college: u.education?.college || '',
          course: u.education?.course || '',
          graduationYear: u.education?.graduationYear ? String(u.education.graduationYear) : '',
          linkedin: u.socials?.linkedin || '',
          googleScholar: u.socials?.googleScholar || '',
          orcid: u.socials?.orcid || '',
          medium: u.socials?.medium || '',
          profileImage: u.profileImage || ''
        });
      } else {
        toast.error('User not found');
        navigate('/');
        return;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await userApi.uploadAvatar(file);
      if (res.success && res.data.url) {
        setEditForm(prev => ({ ...prev, profileImage: res.data.url }));
        toast.success('Avatar uploaded successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        mobile: editForm.mobile.trim() || undefined,
        bio: editForm.bio.trim(),
        profileImage: editForm.profileImage,
        expertise: editForm.expertise.split(',').map(s => s.trim()).filter(Boolean),
        socials: {
          linkedin: editForm.linkedin.trim(),
          googleScholar: editForm.googleScholar.trim(),
          orcid: editForm.orcid.trim(),
          medium: editForm.medium.trim()
        },
        education: {
          college: editForm.college.trim(),
          course: editForm.course.trim(),
          graduationYear: editForm.graduationYear ? parseInt(editForm.graduationYear, 10) : undefined
        }
      };

      const res = await userApi.updateProfile(payload);
      if (res.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        fetchProfileData();
        await refreshUser();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading && !profileUser) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div className="network-bg min-h-screen py-10 sm:py-16 md:py-20 text-foreground">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 pt-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Profile Details Header Card */}
        <div className="bg-card/60 border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            
            {/* Avatar Column */}
            <div className="relative group shrink-0 mx-auto md:mx-0">
              <img 
                src={profileUser.profileImage || PLACEHOLDER_IMAGE} 
                alt={profileUser.name} 
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-primary/45 shadow-md"
              />
              <span className="absolute bottom-1.5 right-1.5 p-1 bg-primary border border-border rounded-full text-white text-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 text-center md:text-left space-y-3.5 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
                    {profileUser.name}
                    {profileUser.role === 'admin' && (
                      <span className="bg-primary/20 border border-primary/30 text-primary text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">Admin</span>
                    )}
                  </h1>
                  <p className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    {profileUser.role || 'Student'} Member
                  </p>
                </div>

                {isSelf && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all self-center md:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Bio */}
              <p className="text-sm text-foreground font-medium leading-relaxed max-w-2xl italic">
                {profileUser.bio ? `"${profileUser.bio}"` : "This user hasn't written a biography yet."}
              </p>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border-t border-border/40 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>Joined: {formatDate(profileUser.createdAt)}</span>
                </div>
                {profileUser.education?.college && (
                  <div className="flex items-center justify-center md:justify-start gap-2 col-span-1 sm:col-span-2">
                    <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">
                      {profileUser.education.course} • {profileUser.education.college} ({profileUser.education.graduationYear})
                    </span>
                  </div>
                )}
              </div>

              {/* Social handles & expertise tags */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-border/40 pt-4">
                
                {/* Socials */}
                <div className="flex items-center gap-3">
                  {profileUser.socials?.linkedin && (
                    <a href={profileUser.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted hover:bg-[#0077b5]/20 hover:text-[#0077b5] border border-border rounded-xl transition-all" title="LinkedIn Profile">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profileUser.socials?.googleScholar && (
                    <a href={profileUser.socials.googleScholar} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted hover:bg-[#34a853]/20 hover:text-[#34a853] border border-border rounded-xl transition-all" title="Google Scholar">
                      <BookOpen className="w-4 h-4" />
                    </a>
                  )}
                  {profileUser.socials?.orcid && (
                    <a href={profileUser.socials.orcid} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted hover:bg-[#a62626]/20 hover:text-[#a62626] border border-border rounded-xl transition-all" title="ORCID ID">
                      <Award className="w-4 h-4" />
                    </a>
                  )}
                  {profileUser.socials?.medium && (
                    <a href={profileUser.socials.medium} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted hover:bg-muted hover:text-foreground border border-border rounded-xl transition-all" title="Medium Blog">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {!profileUser.socials?.linkedin && !profileUser.socials?.googleScholar && !profileUser.socials?.orcid && !profileUser.socials?.medium && (
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">No social profiles linked</span>
                  )}
                </div>

                {/* Expertise tags */}
                {profileUser.expertise && profileUser.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-end">
                    {profileUser.expertise.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>

        {/* Private Contact info */}
        {isSelf && (
          <div className="bg-card/60 border border-border/80 rounded-2xl p-6 shadow-lg max-w-md mx-auto space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Private Account Info</h3>
            <div className="space-y-2.5 border-t border-border pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{currentUser?.email}</span>
              </div>
              {currentUser?.mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{currentUser.mobile}</span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2 italic">This section is private to you. Other makers only see your public socials and education.</p>
            </div>
          </div>
        )}

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in animate-duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative text-sm text-foreground">
            
            {/* Close */}
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-2 bg-muted/65 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-foreground mb-5 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Edit Public Profile Details
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Avatar Selector */}
              <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
                <div className="relative group w-16 h-16 shrink-0">
                  <img 
                    src={editForm.profileImage || PLACEHOLDER_IMAGE} 
                    alt="avatar preview" 
                    className="w-full h-full rounded-full object-cover border border-border"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Profile Picture
                  </button>
                  <p className="text-[10px] text-muted-foreground">Supports PNG, JPG, or WEBP. Uploaded directly to Cloudinary.</p>
                </div>
              </div>

              {/* Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold uppercase">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold uppercase">Mobile Number (Indian format)</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-bold uppercase">Bio / Tagline</label>
                <textarea
                  placeholder="Tell other makers about yourself, your tech focus, or your interest areas..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={2}
                  className="w-full bg-background border border-input rounded-xl p-4 text-xs outline-none focus:border-primary text-foreground resize-none placeholder-muted-foreground"
                />
              </div>

              {/* Education details */}
              <div className="space-y-1 bg-muted/30 p-4 border border-border rounded-2xl">
                <h4 className="text-xs text-foreground font-bold mb-3 uppercase tracking-wide">Education Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">College / University</label>
                    <input
                      type="text"
                      placeholder="e.g. National Institute of Technology"
                      value={editForm.college}
                      onChange={(e) => setEditForm(prev => ({ ...prev, college: e.target.value }))}
                      className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Graduation Year</label>
                    <input
                      type="number"
                      placeholder="e.g. 2026"
                      value={editForm.graduationYear}
                      onChange={(e) => setEditForm(prev => ({ ...prev, graduationYear: e.target.value }))}
                      className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Course / Major</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech in Electronics & Telecommunication"
                      value={editForm.course}
                      onChange={(e) => setEditForm(prev => ({ ...prev, course: e.target.value }))}
                      className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Social handles */}
              <div className="space-y-1 bg-muted/30 p-4 border border-border rounded-2xl">
                <h4 className="text-xs text-foreground font-bold mb-3 uppercase tracking-wide">Social Handles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">LinkedIn URL</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/username"
                      value={editForm.linkedin}
                      onChange={(e) => setEditForm(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Google Scholar Link</label>
                    <input
                      type="text"
                      placeholder="scholar.google.com/citations?user=..."
                      value={editForm.googleScholar}
                      onChange={(e) => setEditForm(prev => ({ ...prev, googleScholar: e.target.value }))}
                      className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">ORCID iD Link</label>
                    <input
                      type="text"
                      placeholder="orcid.org/0000-0000-0000-0000"
                      value={editForm.orcid}
                      onChange={(e) => setEditForm(prev => ({ ...prev, orcid: e.target.value }))}
                      className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Medium Blog Link</label>
                    <input
                      type="text"
                      placeholder="medium.com/@username"
                      value={editForm.medium}
                      onChange={(e) => setEditForm(prev => ({ ...prev, medium: e.target.value }))}
                      className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Expertise tags */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-bold uppercase">Expertise & Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Embedded Systems, ROS, PCB Design, Computer Vision"
                  value={editForm.expertise}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expertise: e.target.value }))}
                  className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary placeholder-muted-foreground"
                />
              </div>

              {/* Save Buttons */}
              <div className="flex gap-3 justify-end border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-transparent border border-border hover:border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/95 disabled:opacity-50 text-primary-foreground px-5 py-2.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-md"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
