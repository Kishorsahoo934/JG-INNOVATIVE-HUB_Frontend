import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";

// Frontend Components (Layout + above-the-fold kept eager for fast FCP)
import Layout from "./components/Layout";
import AcademyLayout from "./components/AcademyLayout";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import EShopHomePage from "./pages/EShopHomePage";

// Route-level code splitting: lazy load pages for smaller initial bundle
const ProductListingPage = lazy(() => import("./pages/ProductListingPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ComingSoonPage = lazy(() => import("./pages/ComingSoonPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const TutorRegisterPage = lazy(() => import("./pages/TutorRegisterPage"));
const TutorDirectoryPage = lazy(() => import("./pages/TutorDirectoryPage"));
const TutorProfilePage = lazy(() => import("./pages/TutorProfilePage"));
const TutorDashboardPage = lazy(() => import("./pages/TutorDashboardPage"));
const ProductDevelopmentPage = lazy(() => import("./pages/ProductDevelopmentPage"));
const WorkshopsPage = lazy(() => import("./pages/WorkshopsPage"));
const WorkshopDetailPage = lazy(() => import("./pages/WorkshopDetailPage"));
const InternshipsPage = lazy(() => import("./pages/InternshipsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsConditionsPage = lazy(() => import("./pages/TermsConditionsPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const ProjectsConsultancyPage = lazy(() => import("./pages/ProjectsConsultancyPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" aria-hidden />
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Loading JG Innovative Hub — robotics, IoT and electronics for students and makers.
      </p>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Layout><HomePage /></Layout>} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/eshop" element={<EShopHomePage />} />
                  <Route path="/eshop/products" element={<ProductListingPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/order/:orderId" element={<OrderDetailPage />} />
                  <Route path="/order-tracking" element={<OrderTrackingPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/tutor-directory" element={<AcademyLayout><TutorDirectoryPage /></AcademyLayout>} />
                  <Route path="/tutor/:id" element={<AcademyLayout><TutorProfilePage /></AcademyLayout>} />
                  <Route path="/tutor-registration" element={<AcademyLayout><TutorRegisterPage /></AcademyLayout>} />
                  <Route path="/tutor-dashboard" element={<TutorDashboardPage />} />
                  <Route path="/workshops" element={<Layout><WorkshopsPage /></Layout>} />
                  <Route path="/workshop/:id" element={<Layout><WorkshopDetailPage /></Layout>} />
                  <Route path="/internships" element={<Layout><InternshipsPage /></Layout>} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-conditions" element={<TermsConditionsPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/product-development" element={<ProductDevelopmentPage />} />
                  <Route path="/project-kits" element={<ProjectsConsultancyPage />} />
                  <Route path="/project/:id" element={<ProjectDetailPage />} />
                  <Route path="/profile/:userId" element={<Layout><UserProfilePage /></Layout>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
