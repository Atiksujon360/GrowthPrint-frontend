# GrowthPrint Frontend - Project Overview

## Purpose

GrowthPrint frontend is a Next.js 16 application that provides user interfaces for the GrowthPrint business management platform. It serves both agency administrators and clients with role-based access to lead management, project tracking, support ticketing, invoicing, and operational workflows.

## Target Users

**Primary Users:**
- Agency administrators (manage leads, clients, projects, invoices, outreach)
- Agency clients (view projects, proposals, invoices, submit support requests)

**Secondary Users:**
- Sales team (CRM lead pipeline management)
- Project managers (project and milestone tracking)
- Support staff (handle support requests and estimates)

## Core Features

### Implemented Features

**Public Website (Route Group: `(public)`)**
- Landing page with hero section
- Services overview
- Case studies showcase
- How we work section
- FAQ section
- Trust indicators
- Public inquiry/quote request form
- Responsive design with Tailwind CSS

**Admin Portal (Route Group: `(admin)`)**
- Admin dashboard with KPI metrics
- Lead management (CRM leads pipeline)
- Client management (view and update clients)
- Project management (create, track, update status)
- Support requests queue (classify, estimate, approve)
- Invoice management (view, mark paid)
- Outreach studio (draft, approve, send emails)
- Automation workflows (view, trigger)
- Activity log (audit trail)
- Admin authentication (login/logout)

**Client Portal (Route Group: `(portal)`)**
- Client dashboard with filtered KPIs
- Project view (client's projects only)
- Proposal view (client's proposals only)
- Invoice view (client's invoices only)
- Support requests (view and create)
- Messages (in-app messaging)
- Client authentication (login/logout)

### Planned Features

**Enhanced Dashboard**
- Real-time data updates
- Advanced filtering and search
- Customizable KPI widgets
- Data export functionality

**Advanced Project Management**
- Gantt chart view
- Resource allocation
- Time tracking integration
- File attachments

**Collaboration Features**
- Comments on projects and tasks
- @mentions and notifications
- Document sharing
- Real-time collaboration

**Reporting**
- Custom report generation
- Data visualization
- Export to PDF/Excel
- Scheduled reports

## Requirements

### Functional Requirements

**Authentication**
- Users must log in with email and password
- JWT tokens stored securely
- Admin users redirected to admin portal
- Client users redirected to client portal
- Logout clears tokens and state

**Admin Portal**
- Admin users can view all leads, clients, projects
- Admin users can create and update entities
- Admin users can approve estimates and invoices
- Admin users can manage outreach campaigns
- Admin users can view activity audit log

**Client Portal**
- Client users can only view their own data
- Client users can create support requests
- Client users can approve estimates (planned)
- Client users can mark invoices as paid (planned)
- Client users can view messages

**Public Website**
- Public users can submit inquiries without authentication
- Public website accessible without login
- Inquiry form validates input
- Inquiry submission shows confirmation

### Non-Functional Requirements

**Performance**
- Initial page load < 2 seconds
- Route transitions < 500ms
- Bundle size optimized (code splitting)
- Images optimized and lazy-loaded

**User Experience**
- Responsive design (mobile, tablet, desktop)
- Accessible (WCAG 2.1 AA compliant)
- Loading states for async operations
- Error messages user-friendly
- Dark mode support

**Security**
- JWT tokens stored securely (httpOnly cookies or localStorage)
- CSRF protection for form submissions
- XSS prevention via React escaping
- HTTPS required in production
- Input validation on client and server

**Maintainability**
- Feature-based architecture
- Component reusability
- TypeScript strict mode
- Comprehensive test coverage
- Clear code organization

## Project Scope

### In Scope

**Frontend Development**
- Next.js 16 App Router application
- React 19 components
- TypeScript 7 strict mode
- Tailwind CSS 4 styling
- Redux Toolkit state management
- API client for backend integration
- Form handling with React Hook Form and Zod
- Responsive and accessible UI

**User Interfaces**
- Public landing page
- Admin portal (all admin features)
- Client portal (all client features)
- Authentication pages (login)
- Error and loading pages

**State Management**
- Redux Toolkit for global state
- Feature-specific slices
- Async thunks for API calls
- Local state for component-specific data

**Testing**
- Unit tests for components and utilities
- Integration tests for Redux slices
- E2E tests (not yet implemented)

### Out of Scope

**Backend Development**
- Backend is separate Spring Boot repository
- API contracts defined in API_COVERAGE_MATRIX.md
- Backend endpoints provide data

**Infrastructure**
- CI/CD pipeline configuration (not yet implemented)
- Deployment automation (not yet implemented)
- Monitoring and error tracking (not yet implemented)
- Performance monitoring (not yet implemented)

**External Integrations**
- Email service integration (handled by backend)
- Payment gateway integration (handled by backend)
- Third-party CRM integration (not yet implemented)
- File storage service (not yet implemented)

## Constraints

**Technical Constraints**
- Next.js 16.4.2 framework
- React 19.0.1
- TypeScript 7.0.2
- Node.js environment
- Browser compatibility (modern browsers)

**Business Constraints**
- Mock mode enabled by default (may hide API issues)
- No current production deployment
- No staging environment
- API contract dependencies on backend

**Security Constraints**
- JWT tokens must be handled securely
- API calls must use HTTPS in production
- User input must be validated
- Sensitive data must not be exposed in URLs

## Success Criteria

**Technical Success**
- All unit tests pass
- TypeScript compilation succeeds
- Bundle size optimized
- No console errors in production
- Lighthouse score > 90

**Business Success**
- All planned features implemented
- UI matches design specifications
- User workflows complete
- Performance requirements met
- Accessibility requirements met

**User Success**
- Admin users can efficiently manage operations
- Client users can easily access their data
- Public users can submit inquiries
- System is intuitive and responsive
- Error recovery is graceful

## Dependencies

**Internal Dependencies**
- Backend Spring Boot API (data source)
- Redux Toolkit (state management)
- React Hook Form (forms)
- Zod (validation)
- Tailwind CSS (styling)

**External Dependencies**
- Next.js framework
- React library
- TypeScript compiler
- Motion (animations)
- Recharts (charts)
- Lucide React (icons)

## Risks

**Technical Risks**
- Mock mode may hide API integration issues
- No E2E testing (not yet implemented)
- No CI/CD pipeline for automated testing
- Bundle size may grow large
- Performance issues with large datasets

**Security Risks**
- JWT token exposure in localStorage
- XSS vulnerabilities in user-generated content
- CSRF attacks on form submissions
- API endpoint exposure without authentication

**Business Risks**
- API contract mismatches with backend
- Scope creep with additional features
- UX issues affecting adoption
- Performance issues at scale

## Mitigation Strategies

**Technical Mitigations**
- Test real API integration before disabling mock mode
- Implement E2E testing with Playwright
- Implement CI/CD pipeline with GitHub Actions
- Optimize bundle with code splitting
- Implement pagination and virtualization for large datasets

**Security Mitigations**
- Use httpOnly cookies for JWT tokens
- Sanitize user-generated content
- Implement CSRF protection
- Require authentication for protected routes
- Validate all API responses

**Business Mitigations**
- Maintain API_COVERAGE_MATRIX.md for contract tracking
- Prioritize P0 and P1 features first
- Conduct user testing before production
- Performance test with realistic data volumes
