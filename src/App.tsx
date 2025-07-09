import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import React, { Suspense } from 'react';

// Import pages
const Home = React.lazy(() => import('@/pages/Home'));
const Properties = React.lazy(() => import('@/pages/Properties'));
const PropertyDetail = React.lazy(() => import('@/components/property/PropertyDetail'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const Login = React.lazy(() => import('@/pages/Login'));
const VisitConfirmation = React.lazy(() => import('@/pages/VisitConfirmation'));
const Testimonials = React.lazy(() => import('@/pages/Testimonials'));
const SubmitTestimonial = React.lazy(() => import('@/pages/SubmitTestimonial'));
const MockPayment = React.lazy(() => import('@/pages/MockPayment'));
const PesaPalConfig = React.lazy(() => import('@/pages/PesaPalConfig'));
const About = React.lazy(() => import('@/pages/About'));

// Import blog pages
const Blog = React.lazy(() => import('@/pages/Blog'));
const BlogPost = React.lazy(() => import('@/pages/BlogPost'));
const BlogCategory = React.lazy(() => import('@/pages/BlogCategory'));
const BlogTag = React.lazy(() => import('@/pages/BlogTag'));

// Import admin pages
const Dashboard = React.lazy(() => import('@/pages/admin/Dashboard'));
const PropertyManagement = React.lazy(() => import('@/pages/admin/PropertyManagement'));
const PropertyCreate = React.lazy(() => import('@/components/admin/PropertyCreate'));
const PropertyEdit = React.lazy(() => import('@/components/admin/PropertyEdit'));
const DeveloperManagement = React.lazy(() => import('@/pages/admin/DeveloperManagement'));
const PropertyVisits = React.lazy(() => import('@/pages/admin/PropertyVisits'));
const FinancingManagement = React.lazy(() => import('@/pages/admin/FinancingManagement'));
const TestimonialsManagement = React.lazy(() => import('@/pages/admin/TestimonialsManagement'));
const ContactMessages = React.lazy(() => import('@/pages/admin/ContactMessages'));
const BlogManagement = React.lazy(() => import('@/pages/admin/BlogManagement'));
const BlogPostCreate = React.lazy(() => import('@/pages/admin/BlogPostCreate'));
const BlogPostEdit = React.lazy(() => import('@/pages/admin/BlogPostEdit'));
const AboutUsManagement = React.lazy(() => import('@/pages/admin/AboutUsManagement'));
const HeroImagesManagement = React.lazy(() => import('@/pages/admin/HeroImagesManagement'));

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const { initialize } = useAuthStore((state) => ({
    initialize: state.initialize
  }));

  useEffect(() => {
    try {
      if (typeof initialize === 'function') {
        initialize();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }, [initialize]);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>}>
            <Routes>
              {/* Public routes with layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/:id" element={<PropertyDetail />} />
                <Route path="contact" element={<Contact />} />
                <Route path="testimonials" element={<Testimonials />} />
                <Route path="submit-testimonial" element={<SubmitTestimonial />} />
                <Route path="about" element={<About />} />
                {/* Blog routes */}
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="blog/category/:slug" element={<BlogCategory />} />
                <Route path="blog/tag/:slug" element={<BlogTag />} />
              </Route>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/visit-confirmed" element={<VisitConfirmation />} />
              {/* Development/Testing routes */}
              <Route path="/mock-payment" element={<MockPayment />} />
              <Route path="/pesapal-config" element={<PesaPalConfig />} />
              {/* Protected admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="properties" element={<PropertyManagement />} />
                <Route path="properties/create" element={<PropertyCreate />} />
                <Route path="properties/:id/edit" element={<PropertyEdit />} />
                <Route path="developers" element={<DeveloperManagement />} />
                <Route path="visits" element={<PropertyVisits />} />
                <Route path="financing" element={<FinancingManagement />} />
                <Route path="testimonials" element={<TestimonialsManagement />} />
                <Route path="messages" element={<ContactMessages />} />
                <Route path="about-us" element={<AboutUsManagement />} />
                {/* Blog admin routes */}
                <Route path="blog" element={<BlogManagement />} />
                <Route path="blog/new" element={<BlogPostCreate />} />
                <Route path="blog/edit/:id" element={<BlogPostEdit />} />
                <Route path="settings" element={<div>Settings - Coming Soon</div>} />
                <Route path="hero-images" element={<HeroImagesManagement />} />
              </Route>
              {/* 404 page */}
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;