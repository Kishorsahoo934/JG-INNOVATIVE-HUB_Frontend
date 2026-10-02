import React, { useState } from 'react';
import { projectBookingApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const ProjectBookingForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    productName: '',
    productCategory: 'IoT',
    currentStage: 'Idea',
    estimatedBudget: '',
    expectedTimeline: '',
    problemStatement: '',
    detailedDescription: '',
    agreedToTerms: false
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must agree to the Terms & Conditions.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('company', formData.company);
      submitData.append('productName', formData.productName);
      submitData.append('productCategory', formData.productCategory);
      submitData.append('currentStage', formData.currentStage);
      submitData.append('estimatedBudget', formData.estimatedBudget);
      submitData.append('expectedTimeline', formData.expectedTimeline);
      submitData.append('problemStatement', formData.problemStatement);
      submitData.append('detailedDescription', formData.detailedDescription);
      
      const combinedMessage = `
Category: ${formData.productCategory}
Stage: ${formData.currentStage}
Budget: ${formData.estimatedBudget}
Timeline: ${formData.expectedTimeline}

Problem Statement:
${formData.problemStatement}

Detailed Description:
${formData.detailedDescription}
`;
      submitData.append('message', combinedMessage);
      submitData.append('subject', `Custom Project: ${formData.productName}`);

      documents.forEach(file => submitData.append('attachments', file));
      images.forEach(file => submitData.append('attachments', file));

      const res = await projectBookingApi.submit(submitData);
      if (res.success) {
        toast({ title: 'Success', description: 'Project requested successfully!' });
        setFormData({
          name: '', company: '', email: '', phone: '', productName: '',
          productCategory: 'IoT', currentStage: 'Idea', estimatedBudget: '',
          expectedTimeline: '', problemStatement: '', detailedDescription: '',
          agreedToTerms: false
        });
        setDocuments([]);
        setImages([]);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: res.message || 'Failed to submit project request' });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Submission error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-secondary/10 border-t border-border/40" id="project-booking">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-background rounded-2xl border border-border/50 shadow-xl overflow-hidden p-8">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-foreground mb-4">Order Your Custom Project</h3>
            <p className="text-base text-muted-foreground mb-8">
              Want us to build a complete project for you? Fill out the details below and reserve your slot with our engineering team.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Full Name *</label>
                  <Input required placeholder="Your name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Company (Optional)</label>
                  <Input placeholder="Company / Institution" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="bg-background" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email Address *</label>
                  <Input required type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Phone Number *</label>
                  <Input required placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-background" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Project Name *</label>
                <Input required placeholder="e.g. Smart Agriculture System" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} className="bg-background" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Project Category *</label>
                  <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.productCategory} onChange={(e) => setFormData({...formData, productCategory: e.target.value})}>
                    <option>IoT</option>
                    <option>Robotics</option>
                    <option>AI/ML</option>
                    <option>Hardware/PCB</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Current Stage *</label>
                  <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.currentStage} onChange={(e) => setFormData({...formData, currentStage: e.target.value})}>
                    <option>Idea</option>
                    <option>Prototype</option>
                    <option>MVP</option>
                    <option>Production Ready</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Estimated Budget</label>
                  <Input placeholder="e.g. ₹10,000" value={formData.estimatedBudget} onChange={(e) => setFormData({...formData, estimatedBudget: e.target.value})} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Expected Timeline</label>
                  <Input placeholder="e.g. 3-4 weeks" value={formData.expectedTimeline} onChange={(e) => setFormData({...formData, expectedTimeline: e.target.value})} className="bg-background" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Problem Statement *</label>
                <Textarea required placeholder="What problem does this project solve?" value={formData.problemStatement} onChange={(e) => setFormData({...formData, problemStatement: e.target.value})} className="min-h-[80px] bg-background" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Detailed Description *</label>
                <Textarea required placeholder="Describe features, users, constraints, references..." value={formData.detailedDescription} onChange={(e) => setFormData({...formData, detailedDescription: e.target.value})} className="min-h-[120px] bg-background" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Upload Documents (Optional)</label>
                  <Input type="file" multiple accept=".pdf,.doc,.docx,.txt" onChange={(e) => setDocuments(Array.from(e.target.files || []))} className="bg-background file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Upload Images (Optional)</label>
                  <Input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} className="bg-background file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border/50">
                <input type="checkbox" id="project_terms" required checked={formData.agreedToTerms} onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                <label htmlFor="project_terms" className="text-sm text-muted-foreground">
                  I agree to the <a href="/terms-conditions" className="text-primary hover:underline" target="_blank">Terms & Conditions</a> and <a href="/privacy-policy" className="text-primary hover:underline" target="_blank">Privacy Policy</a>
                </label>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full text-base font-semibold py-6">
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Submit Project Request
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectBookingForm;
