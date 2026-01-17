# 🎨 TechnoCrats Frontend Documentation

A modern, responsive React frontend for the TechnoCrats Education Management System with Firebase authentication and real-time notifications.

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Development Stages](#-development-stages)
- [🎨 Components](#-components)
- [🔐 Authentication](#-authentication)
- [📱 Responsive Design](#-responsive-design)
- [🎯 Performance](#-performance)
- [🧪 Testing](#-testing)
- [🚀 Build & Deploy](#-build--deploy)

---

## 🌟 Overview

The TechnoCrats frontend is a comprehensive React application that provides an intuitive interface for educational management. It features modern design patterns, real-time updates, and seamless user experience across all devices.

### 🎯 Key Features
- **Multi-Role Authentication**: Admin, Department, Teacher, Student access
- **Firebase Integration**: Google, Email, Phone authentication
- **Real-time Notifications**: Web push notifications
- **Responsive Design**: Mobile-first approach
- **Modern UI/UX**: Beautiful animations and interactions
- **Data Visualization**: Interactive charts and analytics
- **QR Code Support**: Attendance tracking via QR codes

---

## 🛠️ Technology Stack

### Core Framework
- **React 18.3.1** - Modern UI framework with hooks
- **TypeScript 5.8.3** - Type-safe development
- **Vite 5.4.19** - Fast build tool and dev server

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Framer Motion 12.26.2** - Smooth animations
- **Lucide React 0.462.0** - Beautiful icons
- **next-themes 0.3.0** - Theme management

### State Management & Data
- **React Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form handling
- **@tanstack/react-query** - Data fetching and caching
- **Zod 3.25.76** - Schema validation

### Routing & Navigation
- **React Router DOM 6.30.1** - Client-side routing
- **@radix-ui/react-navigation-menu** - Navigation components

### Firebase Integration
- **Firebase** - Authentication and push notifications
- **Firebase Messaging** - Web push notifications
- **Firebase Auth** - Multi-provider authentication

### Charts & Visualization
- **Recharts 2.15.4** - Data visualization
- **@radix-ui/react-progress** - Progress indicators

### Development Tools
- **ESLint 9.32.0** - Code linting
- **Vitest 3.2.4** - Unit testing
- **@testing-library/react 16.0.0** - React testing

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project setup
- Git

### Installation

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

3. **Start development server**
```bash
npm run dev
```

4. **Access application**
- Development: http://localhost:5173
- API: http://localhost:5000

### Environment Variables

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# API Configuration
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=TechnoCrats
VITE_VERSION=1.0.0
```

---

## 📁 Project Structure

```
frontend/
├── 📁 public/                 # Static assets
│   ├── favicon.ico
│   └── index.html
├── 📁 src/
│   ├── 📁 components/          # Reusable components
│   │   ├── 📁 ui/            # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (30+ components)
│   │   ├── 📁 layout/         # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageHeader.tsx
│   │   └── NavLink.tsx         # Navigation component
│   ├── 📁 contexts/           # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── 📁 hooks/              # Custom hooks
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   ├── 📁 lib/                # Utilities
│   │   └── utils.ts           # Helper functions
│   ├── 📁 pages/              # Page components
│   │   ├── LandingPage.tsx     # Marketing landing page
│   │   ├── LoginPage.tsx       # Authentication page
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── AttendancePage.tsx   # Attendance management
│   │   ├── QRAttendancePage.tsx # QR code scanning
│   │   ├── TimetablePage.tsx    # Schedule management
│   │   ├── AnalyticsPage.tsx    # Data analytics
│   │   ├── FeedbackPage.tsx     # Feedback system
│   │   └── NotFound.tsx         # 404 page
│   ├── 📁 styles/             # Custom styles
│   │   └── animations.css     # Custom animations
│   ├── 📁 types/              # TypeScript types
│   │   └── auth.ts            # Authentication types
│   ├── 📁 test/               # Test files
│   │   ├── example.test.ts
│   │   └── setup.ts
│   ├── App.tsx                # Main App component
│   ├── main.tsx               # Application entry point
│   └── vite-env.d.ts         # Vite type definitions
├── 📄 package.json           # Dependencies and scripts
├── 📄 tailwind.config.ts     # Tailwind configuration
├── 📄 vite.config.ts        # Vite configuration
├── 📄 tsconfig.json         # TypeScript configuration
└── 📄 README_FRONTEND.md     # This file
```

---

## 🔧 Development Stages

### 📋 Stage 1: Foundation Setup ✅

#### Objectives
- Project initialization with Vite + React + TypeScript
- Basic structure creation
- Development environment setup
- Core technology integration

#### Completed Tasks
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS integration
- [x] shadcn/ui component library setup
- [x] Basic routing structure
- [x] Development environment configuration

#### Technical Implementation
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

#### Deliverables
- Working development environment
- Basic project structure
- Core dependencies installed

### 📋 Stage 2: Authentication System ✅

#### Objectives
- Firebase authentication integration
- Multi-provider authentication (Google, Email, Phone)
- Role-based access control
- Protected routes implementation

#### Completed Tasks
- [x] Firebase SDK integration
- [x] Authentication context creation
- [x] Multi-provider login implementation
- [x] Protected routes with role-based access
- [x] User session management
- [x] Token refresh mechanism

#### Technical Implementation
```typescript
// contexts/AuthContext.tsx
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut 
} from 'firebase/auth'

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      setUser(result.user)
    } catch (error) {
      console.error('Google login failed:', error)
    }
  }

  // ... other auth methods
}
```

#### Deliverables
- Firebase authentication system
- Multi-provider login support
- Protected route system

### 📋 Stage 3: Core UI Components ✅

#### Objectives
- Dashboard layout implementation
- Reusable component library
- Responsive design system
- Navigation and routing

#### Completed Tasks
- [x] DashboardLayout with sidebar and header
- [x] Responsive navigation system
- [x] Component library integration (shadcn/ui)
- [x] Form components with validation
- [x] Data visualization components
- [x] Mobile-responsive design

#### Technical Implementation
```typescript
// components/layout/DashboardLayout.tsx
import { Sidebar } from './Sidebar'
import { PageHeader } from './PageHeader'

export const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <PageHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### Deliverables
- Complete layout system
- Responsive design
- Component library

### 📋 Stage 4: Feature Pages ✅

#### Objectives
- Dashboard with widgets and analytics
- Attendance management interface
- QR code generation and scanning
- Timetable management
- Student feedback system

#### Completed Tasks
- [x] Dashboard with real-time widgets
- [x] Attendance tracking interface
- [x] QR code generation for attendance
- [x] Timetable management with drag-and-drop
- [x] Analytics dashboard with charts
- [x] Student feedback system
- [x] Profile management pages

#### Technical Implementation
```typescript
// pages/Dashboard.tsx
import { useQuery } from '@tanstack/react-query'
import { StatsCard } from '@/components/ui/stats-card'
import { AttendanceChart } from '@/components/charts'

export const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Students" value={stats?.totalStudents} />
        <StatsCard title="Attendance Rate" value={stats?.attendanceRate} />
        {/* ... more cards */}
      </div>
      <AttendanceChart data={stats?.attendanceData} />
    </div>
  )
}
```

#### Deliverables
- Complete feature pages
- Data visualization
- Interactive components

### 📋 Stage 5: Advanced Features ✅

#### Objectives
- Real-time notifications
- Advanced animations
- Performance optimization
- Progressive Web App features

#### Completed Tasks
- [x] Firebase Cloud Messaging integration
- [x] Real-time push notifications
- [x] Advanced animations with Framer Motion
- [x] PWA configuration
- [x] Offline support
- [x] Performance optimizations

#### Technical Implementation
```typescript
// Firebase Cloud Messaging
import { getMessaging, onMessage } from 'firebase/messaging'

const messaging = getMessaging()
onMessage(messaging, (payload) => {
  console.log('Received foreground message:', payload)
  // Show notification
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon
  })
})
```

#### Deliverables
- Real-time notification system
- PWA features
- Optimized performance

### 📋 Stage 6: Landing Page & Marketing ✅

#### Objectives
- Professional landing page
- Marketing content and features
- User onboarding flow
- SEO optimization

#### Completed Tasks
- [x] Stunning landing page design
- [x] Advanced animations and effects
- [x] Feature showcase section
- [x] Testimonials and social proof
- [x] Call-to-action optimization
- [x] SEO meta tags and optimization

#### Technical Implementation
```typescript
// pages/LandingPage.tsx
export const LandingPage = () => {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero section with animations */}
      <HeroSection />
      
      {/* Feature showcase */}
      <FeaturesSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Call to action */}
      <CTASection onGetStarted={() => navigate('/login')} />
    </div>
  )
}
```

#### Deliverables
- Professional marketing website
- User acquisition funnel
- SEO optimization

---

## 🎨 Components

### UI Components (shadcn/ui)

#### Form Components
- **Button**: Customizable with variants and sizes
- **Input**: Form inputs with validation states
- **Label**: Accessible form labels
- **Select**: Dropdown selection component
- **Checkbox**: Custom checkbox with animations
- **Radio Group**: Radio button groups
- **Textarea**: Multi-line text input

#### Layout Components
- **Card**: Content containers with styling variants
- **Dialog**: Modal dialogs and overlays
- **Sheet**: Slide-out panels
- **Dropdown Menu**: Contextual menus
- **Navigation Menu**: Site navigation
- **Sidebar**: Collapsible navigation

#### Data Display
- **Table**: Data tables with sorting/filtering
- **Badge**: Status indicators and labels
- **Avatar**: User profile images
- **Progress**: Progress bars and rings
- **Chart**: Data visualization components

#### Feedback Components
- **Toast**: Notification system
- **Alert**: Alert messages and warnings
- **Skeleton**: Loading placeholders
- **Spinner**: Loading indicators

### Custom Components

#### Layout Components
```typescript
// components/layout/DashboardLayout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  breadcrumbs?: BreadcrumbItem[]
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  breadcrumbs
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### Business Components
```typescript
// components/AttendanceCard.tsx
interface AttendanceCardProps {
  student: Student
  date: string
  status: 'present' | 'absent' | 'late'
  onMarkAttendance: (status: string) => void
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  student,
  date,
  status,
  onMarkAttendance
}) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{student.name}</h3>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMarkAttendance('present')}
          >
            Present
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMarkAttendance('absent')}
          >
            Absent
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

---

## 🔐 Authentication

### Firebase Authentication Setup

#### Configuration
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const messaging = getMessaging(app)
```

#### Authentication Methods
```typescript
// contexts/AuthContext.tsx
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Google Sign In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = await mapFirebaseUserToAppUser(result.user)
      setUser(user)
      return user
    } catch (error) {
      throw new Error('Google sign in failed')
    }
  }

  // Email Sign In
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = await mapFirebaseUserToAppUser(result.user)
      setUser(user)
      return user
    } catch (error) {
      throw new Error('Email sign in failed')
    }
  }

  // Phone Sign In
  const signInWithPhone = async (phoneNumber: string) => {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container')
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      return confirmationResult
    } catch (error) {
      throw new Error('Phone sign in failed')
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signInWithPhone,
    signOut: () => signOut(auth)
  }
}
```

### Role-Based Access Control

#### Protected Routes
```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback = <Navigate to="/login" />
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return fallback
  }

  if (requiredRole && user.role !== requiredRole) {
    return <div>Access denied</div>
  }

  return <>{children}</>
}
```

#### Role-Based UI
```typescript
// hooks/useRoleBasedUI.ts
export const useRoleBasedUI = () => {
  const { user } = useAuth()

  const canAccess = (resource: string) => {
    const permissions = {
      admin: ['users', 'attendance', 'analytics', 'settings'],
      department: ['attendance', 'analytics', 'students'],
      teacher: ['attendance', 'students', 'timetable'],
      student: ['attendance', 'timetable', 'feedback']
    }

    return permissions[user?.role]?.includes(resource) || false
  }

  return { canAccess }
}
```

---

## 📱 Responsive Design

### Breakpoint System

```css
/* tailwind.config.ts */
export default {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
}
```

### Mobile-First Approach

#### Navigation
```typescript
// components/layout/Sidebar.tsx
export const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        <nav className="p-4 space-y-2">
          {/* Navigation items */}
        </nav>
      </div>
    </>
  )
}
```

#### Responsive Grids
```typescript
// pages/Dashboard.tsx
export const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard />
        <StatsCard />
        <StatsCard />
        <StatsCard />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <PerformanceChart />
      </div>
    </div>
  )
}
```

---

## 🎯 Performance

### Optimization Strategies

#### Code Splitting
```typescript
// Lazy loading components
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => import('./pages/Analytics'))

// Route configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    )
  }
])
```

#### Image Optimization
```typescript
// components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className
}) => {
  return (
    <picture>
      <source
        srcSet={`${src}?w=${width * 2}&h=${height * 2}&format=webp`}
        type="image/webp"
      />
      <img
        src={`${src}?w=${width}&h=${height}`}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
      />
    </picture>
  )
}
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npm run preview

# Bundle analyzer
npm install --save-dev rollup-plugin-visualizer
```

---

## 🧪 Testing

### Unit Testing

#### Component Testing
```typescript
// test/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Integration Testing
```typescript
// test/integration/Auth.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoginPage } from '@/pages/LoginPage'

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('Authentication Flow', () => {
  it('allows user to sign in with Google', async () => {
    renderWithAuth(<LoginPage />)
    
    const googleButton = screen.getByText('Sign in with Google')
    fireEvent.click(googleButton)
    
    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled()
    })
  })
})
```

### E2E Testing Setup

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Configure tests
# tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can sign in and access dashboard', async ({ page }) => {
  await page.goto('/')
  
  await page.click('[data-testid="sign-in-button"]')
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'password')
  await page.click('[data-testid="submit-button"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

---

## 🚀 Build & Deploy

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Build analysis
npm run build -- --analyze
```

### Environment Configuration

#### Development
```bash
# .env.development
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=dev-api-key
VITE_FIREBASE_PROJECT_ID=dev-project-id
```

#### Production
```bash
# .env.production
VITE_API_URL=https://api.technocrats.com
VITE_FIREBASE_API_KEY=prod-api-key
VITE_FIREBASE_PROJECT_ID=prod-project-id
```

### Deployment Options

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# vercel.json configuration
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

#### Netlify
```bash
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

#### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📝 Development Guidelines

### Code Standards
- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Use Tailwind for styling
- Write meaningful commit messages

### Git Workflow
```bash
# Feature branch
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# Review and merge to main
```

### Performance Budgets
- JavaScript: < 250KB compressed
- CSS: < 50KB compressed
- Images: WebP format, lazy loaded
- Fonts: < 100KB compressed

---

## 🔗 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

### Tools & Libraries
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Query](https://tanstack.com/query)
- [Recharts](https://recharts.org/)

---

**🎨 Frontend development completed successfully!**

*Last updated: January 2026*
