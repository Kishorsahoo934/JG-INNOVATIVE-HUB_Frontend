import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useState } from 'react';

const CONTACT_NUMBER = '7008999645';

/** In production (e.g. Vercel) there is no proxy: use backend URL from env. In dev, proxy forwards /api to backend. */
const API_BASE = typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL.trim()
  ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, '')
  : '';

const ContactPage = () => {
  const [searchParams] = useSearchParams();
  const fromOrder = searchParams.get('fromOrder') === '1';
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFilesChange = (selected: FileList | null) => {
    if (!selected) return;
    const list = Array.from(selected);
    setFiles(list);
    const initial: Record<string, number> = {};
    list.forEach((file) => {
      initial[file.name] = 0;
    });
    setProgress(initial);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    if (!fullName || !form.email.trim() || !form.message.trim()) {
      setErrorMessage('Name, email, and message are required.');
      return;
    }
    setIsSubmitting(true);
    setSuccessMessage('');
    const timers: number[] = [];
    files.forEach((file) => {
      let current = 0;
      const timer = window.setInterval(() => {
        current = Math.min(100, current + 10);
        setProgress((prev) => ({ ...prev, [file.name]: current }));
        if (current >= 100) {
          window.clearInterval(timer);
        }
      }, 120);
      timers.push(timer);
    });
    const submit = async () => {
      try {
        const payload = new FormData();
        payload.append('name', fullName);
        payload.append('email', form.email.trim());
        if (form.subject.trim()) payload.append('subject', form.subject.trim());
        payload.append('message', form.message.trim());
        files.forEach((file) => payload.append('files', file));
        const res = await fetch(`${API_BASE}/api/contact`, { method: 'POST', body: payload });
        if (!res.ok) {
          const text = await res.text();
          let message = 'Your message could not be sent. Please try again or contact us by phone.';
          try {
            const data = JSON.parse(text);
            if (typeof data?.message === 'string' && data.message.trim()) {
              message = data.message;
            }
          } catch {
            if (res.status === 503) {
              message = 'Email service is temporarily unavailable. Please try again later or contact us by phone.';
            }
          }
          throw new Error(message);
        }
        setSuccessMessage('Your message and files have been sent successfully');
        setForm({ firstName: '', lastName: '', email: '', subject: '', message: '' });
        setFiles([]);
        setProgress({});
      } catch (err) {
        const msg = (err as Error).message;
        setErrorMessage(
          msg && msg !== 'Failed to fetch'
            ? msg
            : 'Could not reach the server. Check your connection and try again.'
        );
      } finally {
        timers.forEach((t) => window.clearInterval(t));
        setIsSubmitting(false);
      }
    };
    submit();
  };

  return (
    <Layout>
      <SEO
        title="Contact — Support & 3D Printing"
        description="Contact Innovative Hub in Bhubaneswar for order support, 3D printing inquiries, bulk orders, and technical help. Phone, email, and form — we aim to respond within 24 hours."
        path="/contact"
      />
      <div className="network-bg py-10 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-4 max-w-full">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions or need assistance? We'd love to hear from you.
            </p>
            {fromOrder && (
              <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-left max-w-2xl mx-auto">
                <p className="font-semibold text-foreground mb-2">You’ve paid for the order — Contact Us is now open.</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the form below to send your 3D printing inquiry, or contact us directly on the number given below for faster assistance.
                </p>
                <p className="text-sm font-medium text-foreground">
                  You can also contact us on: <a href={`tel:${CONTACT_NUMBER}`} className="text-primary hover:underline">{CONTACT_NUMBER}</a>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto" role="main">
            {/* Contact Form */}
            <section className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6 md:p-8" aria-labelledby="contact-form-heading">
              <h2 id="contact-form-heading" className="text-xl font-semibold text-foreground mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5" aria-label="Contact form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="How can we help?" 
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more about your inquiry..." 
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments</Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.stl,.obj,.step,.stp,.iges,.igs"
                    onChange={(e) => handleFilesChange(e.target.files)}
                    className="bg-background/50"
                  />
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div key={file.name} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{file.name}</span>
                            <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                          </div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${progress[file.name] || 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {successMessage && (
                  <div className="text-sm text-success bg-success/10 border border-success/20 rounded-lg p-3">
                    {successMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    {errorMessage}
                  </div>
                )}
                <Button type="submit" className="w-full rounded-lg">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </section>

            {/* Contact Information */}
            <section className="space-y-6" aria-labelledby="contact-info-heading">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6">
                <h2 id="contact-info-heading" className="text-xl font-semibold text-foreground mb-6">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Address</h3>
                      <p className="text-sm text-muted-foreground">
                        Innovative Hub,
                  
                        Near Gothapatana Square, Malipada, Bhubaneswar, Odisha, India - 751003
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Phone</h3>
                      <p className="text-sm text-muted-foreground">
                        <a href={`tel:${CONTACT_NUMBER}`} className="text-primary hover:underline">{CONTACT_NUMBER}</a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        <a href="mailto:supportinnovativehub@gmail.com" className="text-primary hover:underline">
                          supportinnovativehub@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Business Hours</h3>
                      <p className="text-sm text-muted-foreground">
                        Monday - Saturday: 9:00 AM - 8:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Note */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                <p className="text-sm text-foreground">
                  <strong>Quick Response Guarantee:</strong> We typically respond to all inquiries within 24 hours during business days.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
