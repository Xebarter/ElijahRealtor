# Elijah Realtor - Project Structure

## Overview
A modern real estate platform built with React, TypeScript, Vite, and Supabase, featuring property listings, blog management, admin dashboard, and payment integration.

## Root Directory Structure

```
elijah-realtor/
├── 📁 .git/                          # Git repository
├── 📁 .vscode/                       # VS Code settings
├── 📁 .bolt/                         # Bolt configuration
├── 📁 api/                           # API endpoints and proxies
├── 📁 dist/                          # Build output (generated)
├── 📁 node_modules/                  # Dependencies (generated)
├── 📁 public/                        # Static assets
├── 📁 scripts/                       # Build and utility scripts
├── 📁 src/                           # Source code
├── 📁 supabase/                      # Database migrations and config
├── 📄 .gitignore                     # Git ignore rules
├── 📄 .vercelignore                  # Vercel deployment ignore
├── 📄 components.json                 # ShadCN UI configuration
├── 📄 eslint.config.js               # ESLint configuration
├── 📄 index.html                     # Entry HTML file
├── 📄 package.json                   # Project dependencies and scripts
├── 📄 package-lock.json              # Locked dependencies
├── 📄 postcss.config.js              # PostCSS configuration
├── 📄 PESAPAL_SETUP.md              # Payment setup documentation
├── 📄 server.cjs                     # Express server for development
├── 📄 server.js                      # Server entry point
├── 📄 server-package.json            # Server dependencies
├── 📄 setup-pesapal.bat              # Payment setup script
├── 📄 tailwind.config.js             # Tailwind CSS configuration
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 tsconfig.app.json              # App TypeScript config
├── 📄 tsconfig.node.json             # Node TypeScript config
├── 📄 update-env.bat                 # Environment update script
└── 📄 vite.config.ts                 # Vite build configuration
```

## Source Code Structure (`src/`)

```
src/
├── 📄 App.tsx                        # Main application component
├── 📄 App.css                        # App-specific styles
├── 📄 heroImages.ts                  # Auto-generated hero images
├── 📄 index.css                      # Global styles
├── 📄 main.tsx                       # Application entry point
├── 📄 vite-env.d.ts                  # Vite environment types
├── 📄 vite.config.ts                 # Vite configuration
│
├── 📁 components/                     # Reusable UI components
│   ├── 📁 admin/                     # Admin-specific components
│   │   ├── 📁 blog/                  # Blog management components
│   │   │   ├── 📄 BlogCommentManager.tsx
│   │   │   ├── 📄 BlogPostForm.tsx
│   │   │   ├── 📄 BlogPostTable.tsx
│   │   │   ├── 📄 CategoryForm.tsx
│   │   │   ├── 📄 CategoryTagManager.tsx
│   │   │   └── 📄 TagForm.tsx
│   │   ├── 📁 layout/                # Admin layout components
│   │   │   └── 📄 AdminLayout.tsx
│   │   ├── 📄 DeveloperSelector.tsx  # Developer selection component
│   │   ├── 📄 LocationInput.tsx      # Location input component
│   │   ├── 📄 PropertyCreate.tsx     # Property creation form
│   │   ├── 📄 PropertyEdit.tsx       # Property editing form
│   │   ├── 📄 PropertyFeatureImageUpload.tsx
│   │   ├── 📄 PropertyImageUpload.tsx
│   │   └── 📄 VideoUpload.tsx        # Video upload component
│   │
│   ├── 📁 blog/                      # Blog-related components
│   │   ├── 📄 BlogCard.tsx           # Blog post card
│   │   ├── 📄 BlogCommentForm.tsx    # Comment form
│   │   ├── 📄 BlogCommentList.tsx    # Comment list
│   │   └── 📄 BlogSidebar.tsx        # Blog sidebar
│   │
│   ├── 📁 common/                    # Shared components
│   │   ├── 📄 LoadingSpinner.tsx     # Loading spinner
│   │   ├── 📄 PesaPalConfigChecker.tsx
│   │   ├── 📄 ProtectedRoute.tsx     # Route protection
│   │   └── 📄 SEO.tsx                # SEO component
│   │
│   ├── 📁 home/                      # Home page components
│   │   ├── 📄 DevelopersSection.tsx  # Developers showcase
│   │   ├── 📄 FeaturedProperties.tsx # Featured properties
│   │   ├── 📄 HeroSection.tsx        # Hero banner
│   │   ├── 📄 ServicesSection.tsx    # Services showcase
│   │   └── 📄 TestimonialsSection.tsx # Testimonials
│   │
│   ├── 📁 layout/                    # Layout components
│   │   ├── 📄 AdminLayout.tsx        # Admin layout
│   │   ├── 📄 Footer.tsx             # Site footer
│   │   ├── 📄 Header.tsx             # Site header
│   │   └── 📄 Layout.tsx             # Main layout
│   │
│   ├── 📁 property/                  # Property-related components
│   │   ├── 📄 FinancingModal.tsx     # Financing modal
│   │   ├── 📄 PropertyCard.tsx       # Property card
│   │   ├── 📄 PropertyDetail.tsx     # Property details
│   │   ├── 📄 PropertyFeatureCarousel.tsx
│   │   ├── 📄 PropertyFeatureGallery.tsx
│   │   ├── 📄 PropertyFilters.tsx    # Property filters
│   │   ├── 📄 PropertyMap.tsx        # Property map
│   │   ├── 📄 PropertyVideoPlayer.tsx # Video player
│   │   ├── 📄 ScheduleVisitModal.tsx # Visit scheduling
│   │   └── 📄 VisitBookingModal.tsx  # Visit booking
│   │
│   └── 📁 ui/                        # ShadCN UI components
│       ├── 📄 accordion.tsx          # Accordion component
│       ├── 📄 alert-dialog.tsx       # Alert dialog
│       ├── 📄 alert.tsx              # Alert component
│       ├── 📄 aspect-ratio.tsx       # Aspect ratio
│       ├── 📄 avatar.tsx             # Avatar component
│       ├── 📄 badge.tsx              # Badge component
│       ├── 📄 breadcrumb.tsx         # Breadcrumb navigation
│       ├── 📄 button.tsx             # Button component
│       ├── 📄 calendar.tsx           # Calendar component
│       ├── 📄 card.tsx               # Card component
│       ├── 📄 carousel.tsx           # Carousel component
│       ├── 📄 chart.tsx              # Chart component
│       ├── 📄 checkbox.tsx           # Checkbox component
│       ├── 📄 collapsible.tsx        # Collapsible component
│       ├── 📄 command.tsx            # Command component
│       ├── 📄 context-menu.tsx       # Context menu
│       ├── 📄 dialog.tsx             # Dialog component
│       ├── 📄 drawer.tsx             # Drawer component
│       ├── 📄 dropdown-menu.tsx      # Dropdown menu
│       ├── 📄 form.tsx               # Form component
│       ├── 📄 hover-card.tsx         # Hover card
│       ├── 📄 input-otp.tsx          # OTP input
│       ├── 📄 input.tsx              # Input component
│       ├── 📄 label.tsx              # Label component
│       ├── 📄 menubar.tsx            # Menu bar
│       ├── 📄 navigation-menu.tsx    # Navigation menu
│       ├── 📄 pagination.tsx         # Pagination
│       ├── 📄 popover.tsx            # Popover component
│       ├── 📄 progress.tsx           # Progress bar
│       ├── 📄 radio-group.tsx        # Radio group
│       ├── 📄 resizable.tsx          # Resizable component
│       ├── 📄 scroll-area.tsx        # Scroll area
│       ├── 📄 select.tsx             # Select component
│       ├── 📄 separator.tsx          # Separator
│       ├── 📄 sheet.tsx              # Sheet component
│       ├── 📄 skeleton.tsx           # Skeleton loader
│       ├── 📄 slider.tsx             # Slider component
│       ├── 📄 sonner.tsx             # Toast notifications
│       ├── 📄 switch.tsx             # Switch component
│       ├── 📄 table.tsx              # Table component
│       ├── 📄 tabs.tsx               # Tabs component
│       ├── 📄 textarea.tsx           # Textarea component
│       ├── 📄 toast.tsx              # Toast component
│       ├── 📄 toaster.tsx            # Toaster component
│       ├── 📄 toggle-group.tsx       # Toggle group
│       ├── 📄 toggle.tsx             # Toggle component
│       └── 📄 tooltip.tsx            # Tooltip component
│
├── 📁 hooks/                         # Custom React hooks
│   ├── 📄 use-toast.ts               # Toast hook
│   ├── 📄 useBlog.ts                 # Blog data hook
│   ├── 📄 useDashboard.ts            # Dashboard data hook
│   ├── 📄 useDevelopers.ts           # Developers data hook
│   ├── 📄 useMessaging.ts            # Messaging hook
│   ├── 📄 useProperties.ts           # Properties data hook
│   ├── 📄 usePropertyMedia.ts        # Property media hook
│   ├── 📄 usePropertyVisits.ts       # Property visits hook
│   ├── 📄 useTestimonials.ts         # Testimonials hook
│   └── 📄 useVisits.ts               # Visits data hook
│
├── 📁 lib/                           # Utility libraries
│   ├── 📄 countries.ts               # Countries data
│   ├── 📄 mockPesaPal.ts            # Payment mock
│   ├── 📄 payment.ts                 # Payment integration
│   ├── 📄 supabase.ts                # Database client
│   ├── 📄 utils.ts                   # Utility functions
│   └── 📄 validations.ts             # Form validations
│
├── 📁 pages/                         # Page components
│   ├── 📁 admin/                     # Admin pages
│   │   ├── 📄 AboutUsManagement.tsx  # About us management
│   │   ├── 📄 BlogManagement.tsx     # Blog management
│   │   ├── 📄 BlogPostCreate.tsx     # Create blog post
│   │   ├── 📄 BlogPostEdit.tsx       # Edit blog post
│   │   ├── 📄 ContactMessages.tsx    # Contact messages
│   │   ├── 📄 Dashboard.tsx          # Admin dashboard
│   │   ├── 📄 DeveloperManagement.tsx # Developer management
│   │   ├── 📄 FinancingManagement.tsx # Financing management
│   │   ├── 📄 HeroImagesManagement.tsx # Hero images
│   │   ├── 📄 PropertyCreate.tsx     # Create property
│   │   ├── 📄 PropertyEdit.tsx       # Edit property
│   │   ├── 📄 PropertyManagement.tsx # Property management
│   │   ├── 📄 PropertyVisits.tsx     # Property visits
│   │   ├── 📄 TestimonialsManagement.tsx # Testimonials
│   │   ├── 📄 VisitBookings.tsx      # Visit bookings
│   │   └── 📄 VisitManagement.tsx    # Visit management
│   │
│   ├── 📄 About.tsx                  # About page
│   ├── 📄 Blog.tsx                   # Blog listing
│   ├── 📄 BlogCategory.tsx           # Blog category
│   ├── 📄 BlogPost.tsx               # Blog post detail
│   ├── 📄 BlogTag.tsx                # Blog tag
│   ├── 📄 Contact.tsx                # Contact page
│   ├── 📄 Home.tsx                   # Home page
│   ├── 📄 Login.tsx                  # Login page
│   ├── 📄 MockPayment.tsx            # Payment testing
│   ├── 📄 PaymentCallback.tsx        # Payment callback
│   ├── 📄 PesaPalConfig.tsx          # Payment config
│   ├── 📄 Properties.tsx             # Properties listing
│   ├── 📄 SubmitTestimonial.tsx      # Submit testimonial
│   ├── 📄 Testimonials.tsx           # Testimonials page
│   └── 📄 VisitConfirmation.tsx      # Visit confirmation
│
├── 📁 store/                         # State management
│   └── 📄 auth.ts                    # Authentication store
│
└── 📁 types/                         # TypeScript type definitions
    ├── 📄 blog.ts                    # Blog types
    ├── 📄 index.ts                   # Main types
    └── 📄 messaging.ts               # Messaging types
```

## Database Structure (`supabase/`)

```
supabase/
└── 📁 migrations/                    # Database migrations
    ├── 📄 20250702075122_shy_coral.sql
    ├── 📄 20250702081425_falling_peak.sql
    ├── 📄 20250702081951_mellow_recipe.sql
    ├── 📄 20250702093806_sweet_sound.sql
    ├── 📄 20250702160232_precious_trail.sql
    ├── 📄 20250702174440_stark_brook.sql
    ├── 📄 20250703083853_shiny_snowflake.sql
    ├── 📄 20250703090509_velvet_art.sql
    ├── 📄 20250703093248_crimson_scene.sql
    ├── 📄 20250703125809_small_water.sql
    ├── 📄 20250704074022_quiet_dust.sql
    ├── 📄 20250707_hero_images.sql
    └── 📄 20250707000000_about_us.sql
```

## API Structure (`api/`)

```
api/
├── 📁 pesapal-proxy/                 # Payment proxy endpoints
│   └── 📄 [...path].js               # Dynamic payment routes
├── 📄 pesapal-proxy.js               # Payment proxy handler
└── 📄 test.js                        # API testing
```

## Scripts (`scripts/`)

```
scripts/
└── 📄 generateHeroImages.ts          # Hero images generator
```

## Key Features

### 🏠 **Property Management**
- Property listings with advanced filtering
- Property details with image galleries and videos
- Property visits and booking system
- Developer management

### 📝 **Blog System**
- Blog posts with categories and tags
- Comment system
- Rich text editing with React Quill
- SEO optimization

### 👨‍💼 **Admin Dashboard**
- Comprehensive property management
- User management and authentication
- Analytics and reporting
- Content management system

### 💳 **Payment Integration**
- PesaPal payment gateway
- Payment callbacks and webhooks
- Mock payment system for testing

### 🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS
- ShadCN UI components
- Smooth animations and transitions
- Dark/light theme support

### 🔧 **Technical Stack**
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + ShadCN UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: PesaPal integration
- **Deployment**: Vercel
- **State Management**: Zustand + React Query

## Build & Deployment

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Deployment
- **Platform**: Vercel
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Node Version**: 18.x

### Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `PESAPAL_CONSUMER_KEY` - PesaPal consumer key
- `PESAPAL_CONSUMER_SECRET` - PesaPal consumer secret
- `PESAPAL_ENVIRONMENT` - PesaPal environment (sandbox/live)

## File Size Analysis
Based on the build output, the largest files are:
- `AboutUsManagement-DOiixfYm.js` (239.90 kB)
- `index-DDLCIrg7.js` (404.44 kB) - Main bundle
- `BlogPost-CxXthUpe.js` (128.24 kB)
- `PropertyEdit-CD3LPjcs.js` (69.04 kB)

The build process includes code splitting and chunk optimization for better performance. 