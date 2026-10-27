# GrowthPrint Frontend - Architecture

## System Overview

GrowthPrint frontend is a Next.js 16 application with App Router that provides user interfaces for the GrowthPrint business management platform. It follows a feature-based architecture with clear separation between public, admin, and client portals.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│              (Chrome, Firefox, Safari, Edge)                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            │ JWT Authentication
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 16 Application                      │
│                      (Port 3000)                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Public      │  │    Admin      │  │    Client     │
│   Route Group │  │  Route Group  │  │  Route Group  │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Redux Store         │
              │   (Global State)      │
              └────────────┬───────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   API Client  │  │  Local State  │  │  Components  │
│   (lib/api)   │  │  (useState)  │  │  (React)     │
└───────┬───────┘  └───────────────┘  └───────────────┘
        │
        ▼
┌────────────────────────┐
│   Backend API           │
│   (Spring Boot)         │
│   (Port 8090)           │
└────────────────────────┘
```

## Module Structure

### Directory Organization

```
app/
├── (public)/              # Public route group
│   ├── layout.tsx         # Public layout
│   ├── page.tsx           # Public landing page
│   ├── error.tsx          # Public error page
│   ├── loading.tsx        # Public loading page
│   └── not-found.tsx      # Public 404 page
├── (admin)/               # Admin route group
│   ├── layout.tsx         # Admin layout
│   ├── page.tsx           # Admin dashboard
│   ├── login/             # Admin login
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── error.tsx          # Admin error page
│   ├── loading.tsx        # Admin loading page
│   └── not-found.tsx      # Admin 404 page
├── (portal)/              # Client route group
│   ├── layout.tsx         # Client layout
│   ├── page.tsx           # Client dashboard
│   ├── login/             # Client login
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── error.tsx          # Client error page
│   ├── loading.tsx        # Client loading page
│   └── not-found.tsx      # Client 404 page
├── error.tsx              # Global error page
├── layout.tsx             # Root layout
├── loading.tsx            # Global loading page
└── not-found.tsx          # Global 404 page

components/
├── ui/                    # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
├── public/                # Public-specific components
│   ├── HeroSection.tsx
│   ├── ServicesSection.tsx
│   └── ...
├── admin/                 # Admin-specific components
│   ├── AdminLayout.tsx
│   ├── AdminDashboard.tsx
│   └── ...
└── portal/                # Client-specific components
    ├── PortalLayout.tsx
    ├── PortalDashboard.tsx
    └── ...

features/
├── auth/                  # Authentication feature
│   ├── authSlice.ts       # Redux slice
│   └── authTypes.ts       # TypeScript types
├── agency/                # Agency management feature
│   ├── agencySlice.ts     # Redux slice
│   ├── agencyTypes.ts     # TypeScript types
│   └── components/        # Feature components
├── admin/                 # Admin feature
│   ├── components/        # Admin components
│   └── ...
└── portal/                # Client feature
    ├── components/        # Client components
    └── ...

lib/
├── api/                   # API client
│   └── client.ts          # API client implementation
├── utils/                 # Utility functions
│   └── ...
└── hooks/                 # Custom React hooks
    └── ...

store/
├── index.ts               # Redux store configuration
├── initialData.ts         # Mock data
└── store-contract.test.ts # Store contract tests

types/
├── agency.ts              # Agency types
└── ...
```

## Layer Responsibilities

### Component Layer

**Responsibilities:**
- Render UI based on props and state
- Handle user interactions
- Manage local component state (useState, useReducer)
- Dispatch actions to Redux store
- Subscribe to Redux store updates
- Perform client-side validation

**Example:**
```typescript
"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { fetchClients } from "@/features/agency/agencySlice";

export function ClientList() {
  const dispatch = useAppDispatch();
  const clients = useAppSelector((state) => state.agency.clients);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  return (
    <div>
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
```

### Redux Layer

**Responsibilities:**
- Manage global application state
- Handle async data fetching with thunks
- Provide typed hooks for components
- Persist state (optional)
- Reset state on logout

**Example:**
```typescript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchClients = createAsyncThunk(
  "agency/fetchClients",
  async () => {
    const response = await agencyApi.clients.getAll();
    return response;
  }
);

const agencySlice = createSlice({
  name: "agency",
  initialState: {
    clients: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Local actions
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      });
  },
});

export const { reducer } = agencySlice;
```

### API Client Layer

**Responsibilities:**
- Make HTTP requests to backend API
- Handle request/response transformation
- Manage authentication headers
- Handle errors gracefully
- Support mock mode for development

**Example:**
```typescript
const apiClient = {
  get: async <T>(url: string): Promise<T> => {
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  },
};

export const agencyApi = {
  clients: {
    getAll: () => apiClient.get<Client[]>("/clients"),
    getById: (id: number) => apiClient.get<Client>(`/clients/${id}`),
  },
};
```

## Data Flow

### Request Flow (Redux)

```
1. User triggers action (e.g., clicks button)
2. Component dispatches thunk action
3. Thunk makes API call
4. API client sends HTTP request to backend
5. Backend processes request and returns response
6. Thunk receives response
7. Thunk dispatches success/failure action
8. Redux reducer updates state
9. Component re-renders with new state
```

### Request Flow (Local State)

```
1. User triggers action (e.g., types in input)
2. Component updates local state (useState)
3. Component re-renders with new state
4. User submits form
5. Component validates and dispatches Redux action
6. Redux makes API call
7. State updated and component re-renders
```

### Authentication Flow

```
1. User enters credentials on login page
2. Form validation with Zod
3. Component dispatches login thunk
4. Thunk calls POST /api/v1/auth/login
5. Backend validates credentials
6. Backend returns JWT token
7. Thunk stores token in localStorage
8. Thunk dispatches success action
9. Component redirects to dashboard
10. Protected routes check for token
11. API client includes token in Authorization header
```

## Module Boundaries

### Public Module

**Purpose:** Public-facing website and inquiry submission

**Components:**
- HeroSection
- ServicesSection
- CaseStudiesSection
- HowWeWorkSection
- FAQSection
- TrustSection
- PublicHeader
- PublicFooter
- QuoteInquiryModal

**State:**
- Local form state for inquiry
- No Redux state (simple interactions)

**API Calls:**
- POST /api/v1/public/inquiries (public endpoint)

**Exposed to:** None (leaf module)

### Admin Module

**Purpose:** Admin portal for agency operations

**Components:**
- AdminLayout
- AdminDashboard
- AdminLeadsView
- AdminClientsView
- AdminProjectsView
- AdminRequestsQueue
- AdminInvoicesView
- AdminOutreachStudio
- AdminAutomationView
- AdminActivityView

**State:**
- Redux slices: agency, auth
- Local state for modals and forms

**API Calls:**
- All admin endpoints (requires ADMIN role)
- Authentication endpoints

**Exposed to:** None (leaf module)

### Client Module

**Purpose:** Client portal for client-specific operations

**Components:**
- PortalLayout
- PortalDashboard
- PortalProjectsView
- PortalProposalsView
- PortalInvoicesView
- PortalRequestsView
- PortalMessagesView

**State:**
- Redux slices: agency, auth
- Local state for modals and forms

**API Calls:**
- Client-scoped endpoints (requires CLIENT role)
- Authentication endpoints

**Exposed to:** None (leaf module)

## Routing Architecture

### Route Groups

**Public Route Group `(public)`:**
- Path: `/`
- No authentication required
- Publicly accessible
- SEO-optimized

**Admin Route Group `(admin)`:**
- Path: `/admin`
- Authentication required (ADMIN role)
- Protected by middleware
- Not SEO-optimized

**Client Route Group `(portal)`:**
- Path: `/portal`
- Authentication required (CLIENT role)
- Protected by middleware
- Not SEO-optimized

### Route Protection

**Middleware Strategy:**
- Check for JWT token in localStorage
- Verify token with backend (optional)
- Redirect to login if not authenticated
- Redirect to appropriate dashboard based on role

**Example:**
```typescript
export function ProtectedRoute({ children, requiredRole }: Props) {
  const token = localStorage.getItem("token");
  const user = useAppSelector((state) => state.auth.user);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
```

## State Management

### Redux Store

**Slices:**
- `auth` - Authentication state (user, token, loading)
- `agency` - Agency data (clients, leads, projects, etc.)

**State Structure:**
```typescript
interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
  };
  agency: {
    clients: Client[];
    leads: Lead[];
    projects: Project[];
    supportRequests: SupportRequest[];
    invoices: Invoice[];
    loading: boolean;
    error: string | null;
  };
}
```

### Local State

**Use Cases:**
- Form inputs
- Modal open/close state
- UI component state (dropdowns, tabs)
- Temporary data not shared across components

**Example:**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<FormData>({});
```

## Form Handling

### React Hook Form + Zod

**Pattern:**
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
});

const onSubmit = (data: FormData) => {
  dispatch(createSupportRequest(data));
};

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <Input {...form.register("name")} />
    <Button type="submit">Submit</Button>
  </form>
);
```

**Validation:**
- Client-side validation with Zod
- Server-side validation (backend)
- Error display inline
- Form submission disabled on invalid

## Styling Architecture

### Tailwind CSS 4

**Approach:**
- Utility-first CSS
- Responsive design with breakpoints
- Dark mode support
- Custom theme configuration

**Example:**
```typescript
<div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

### Component Styling

**Pattern:**
- Colocate styles with components
- Use Tailwind utility classes
- Extract repeated patterns to components
- Use shadcn/ui for complex components

## Performance Considerations

### Code Splitting

**Next.js Automatic:**
- Route-based code splitting
- Dynamic imports for large components
- Lazy loading for non-critical components

**Example:**
```typescript
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <LoadingSpinner />,
});
```

### Image Optimization

**Next.js Image Component:**
- Automatic optimization
- Responsive images
- Lazy loading
- WebP conversion

**Example:**
```typescript
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>
```

### Bundle Optimization

**Strategies:**
- Tree shaking (automatic with Next.js)
- Code splitting (automatic with Next.js)
- Import optimization (use specific imports)
- External libraries (use CDN if appropriate)

## Security Architecture

### Authentication

**JWT Token Storage:**
- Current: localStorage (development)
- Recommended: httpOnly cookies (production)
- Token included in Authorization header

### Input Validation

**Layers:**
1. Client-side validation (Zod)
2. Server-side validation (backend)
3. Type safety (TypeScript)

### XSS Prevention

**Strategies:**
- React automatic escaping
- Sanitize user-generated content
- Use React dangerouslySetInnerHTML sparingly
- Validate and sanitize all inputs

### CSRF Protection

**Current Status:** Not implemented

**Recommendation:**
- Implement CSRF tokens for state-changing operations
- Use httpOnly cookies for JWT tokens

## Testing Architecture

### Unit Tests

**Framework:** Node.js native test runner with --experimental-strip-types

**What to Test:**
- Component rendering
- Redux reducers
- Utility functions
- API client functions

### Integration Tests

**What to Test:**
- Redux slices with thunks
- API client with mock backend
- Form validation

### E2E Tests

**Framework:** Playwright (recommended, not yet implemented)

**What to Test:**
- User flows (login, create lead, etc.)
- Navigation
- Form submissions
- API integration

## Accessibility Architecture

### WCAG 2.1 AA Compliance

**Features:**
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast
- Screen reader support

### Testing

**Tools:**
- Lighthouse accessibility audit
- axe DevTools
- Manual keyboard testing
- Screen reader testing

## External Integrations

### Current Integrations

- Backend API (Spring Boot)
- Motion (animations)
- Recharts (charts)
- Lucide React (icons)

### Planned Integrations

- Error tracking (Sentry)
- Analytics (Google Analytics)
- Email service (for outreach)
- File storage (for attachments)

## Architecture Principles

1. **Feature-Based Architecture:** Group related code by feature
2. **Component Reusability:** Build reusable UI components
3. **Type Safety:** Use TypeScript strict mode
4. **Performance First:** Optimize bundle size and loading
5. **Accessibility First:** Build accessible by default
6. **Security First:** Validate all inputs, sanitize outputs
7. **Test-Driven:** Write tests for critical paths
8. **Progressive Enhancement:** Enhance experience with JavaScript
9. **Mobile-First:** Responsive design for all devices
10. **Developer Experience:** Use modern tooling and patterns
