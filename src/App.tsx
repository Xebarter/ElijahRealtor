import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

// Import pages
import Home from '@/pages/Home';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/components/property/PropertyDetail';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import VisitConfirmation from '@/pages/VisitConfirmation';
import Testimonials from '@/pages/Testimonials';
import SubmitTestimonial from '@/pages/SubmitTestimonial';
import MockPayment from '@/pages/MockPayment';
import PesaPalConfig from '@/pages/PesaPalConfig';
import About from '@/pages/About';

// Import blog pages
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import BlogCategory from '@/pages/BlogCategory';
import BlogTag from '@/pages/BlogTag';

// Import admin pages
import Dashboard from '@/pages/admin/Dashboard';
import PropertyManagement from '@/pages/admin/PropertyManagement';
import PropertyCreate from '@/components/admin/PropertyCreate';
import PropertyEdit from '@/components/admin/PropertyEdit';
import DeveloperManagement from '@/pages/admin/DeveloperManagement';
import PropertyVisits from '@/pages/admin/PropertyVisits';
import FinancingManagement from '@/pages/admin/FinancingManagement';
import TestimonialsManagement from '@/pages/admin/TestimonialsManagement';
import ContactMessages from '@/pages/admin/ContactMessages';
import BlogManagement from '@/pages/admin/BlogManagement';
import BlogPostCreate from '@/pages/admin/BlogPostCreate';
import BlogPostEdit from '@/pages/admin/BlogPostEdit';
import AboutUsManagement from '@/pages/admin/AboutUsManagement';

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
            </Route>

            {/* 404 page */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;