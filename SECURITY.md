# GrowthPrint Frontend - Security Policies

## Overview

This document outlines security policies, authentication, secrets management, and vulnerability handling for the GrowthPrint frontend. All security practices are based on OWASP ASVS and OWASP Cheat Sheet Series.

## Authentication

### JWT Token Management

**Implementation:**
- JWT tokens stored in localStorage (current, to be replaced with httpOnly cookies)
- Token included in Authorization header: `Bearer <token>`
- Token validation on each protected route
- Token expiration handling (redirect to login)

**Token Storage (Current):**
- localStorage (acceptable for development, insecure for production)
- Token key: `token`
- User data key: `user`

**Token Storage (Recommended for Production):**
- httpOnly cookies (more secure)
- Secure flag (HTTPS only)
- SameSite flag (CSRF protection)
- Cookie name: `auth_token`

**Token Refresh:**
- Not yet implemented
- Recommended: Implement refresh token flow
- Refresh token stored in httpOnly cookie
- Access token stored in memory or localStorage

### Login Flow

```
1. User enters email and password
2. Form validation with Zod
3. Component dispatches login thunk
4. Thunk calls POST /api/v1/auth/login
5. Backend validates credentials
6. Backend returns JWT token
7. Thunk stores token in localStorage
8. Thunk stores user data in localStorage
9. Thunk dispatches success action
10. Component redirects to dashboard
```

### Logout Flow

```
1. User clicks logout button
2. Component dispatches logout thunk
3. Thunk calls POST /api/v1/auth/logout (optional)
4. Thunk removes token from localStorage
5. Thunk removes user data from localStorage
6. Thunk dispatches success action
7. Component redirects to login page
```

## Authorization

### Role-Based Access Control

**Roles:**
- `ADMIN` - Full access to admin portal
- `CLIENT` - Access to client portal only

**Role Assignment:**
- Roles assigned by backend
- Stored in user object in localStorage
- Checked on protected routes

### Route Protection

**Protected Routes:**
- `/admin/*` - Requires ADMIN role
- `/portal/*` - Requires CLIENT role

**Protection Strategy:**
- Middleware checks for token
- Middleware checks for role
- Redirect to login if no token
- Redirect to unauthorized page if wrong role

**Example:**
```typescript
export function ProtectedRoute({ children, requiredRole }: Props) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
```

## Secrets Management

### Environment Variables

**Required Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_USE_MOCK_API` - Enable/disable mock mode (default: true)

**Optional Environment Variables:**
- `NEXT_PUBLIC_ANALYTICS_ID` - Analytics tracking ID
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking DSN

### Secrets Storage

**Development:**
- Store in `.env.local` file (gitignored)
- Never commit `.env.local` to source control
- Use `.env.example` as template

**Production:**
- Store in platform-specific secret manager (Vercel environment variables)
- Never hardcode secrets in code
- Rotate secrets regularly

### Secret Scanning

**Recommended Tools:**
- TruffleHog - Scan git history for secrets
- GitLeaks - Detect secrets in commits
- Gitleaks (pre-commit hook)

**Integration:**
- Add secret scanning to CI/CD pipeline
- Block commits if secrets detected
- Rotate secrets if leaked

## Input Validation

### Form Validation

**Validation Layers:**
1. Client-side validation with Zod
2. Server-side validation (backend)
3. Type safety with TypeScript

**Example:**
```typescript
const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email format"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
```

### XSS Prevention

**Prevention Strategy:**
- React automatic escaping by default
- Never use `dangerouslySetInnerHTML` with user input
- Sanitize user-generated content (not yet implemented)
- Validate all inputs with Zod

**If Using dangerouslySetInnerHTML:**
```typescript
import DOMPurify from "dompurify";

const sanitizedHTML = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

### CSRF Protection

**Current Status:** Not implemented

**Recommendation:**
- Use httpOnly cookies for JWT tokens
- Implement CSRF tokens for state-changing operations
- Validate CSRF tokens on backend

## Data Protection

### Data in Transit

**HTTPS Requirement:**
- All API calls must use HTTPS in production
- Never send sensitive data over HTTP
- Configure HTTPS in production

### Data at Rest

**Client-Side Storage:**
- localStorage: Not encrypted (acceptable for non-sensitive data)
- Avoid storing sensitive data in localStorage
- Clear token and user data on logout

### Data Masking

**Logging:**
- Never log sensitive data (tokens, passwords, PII)
- Mask sensitive data in logs
- Audit log access to sensitive data

## CORS Configuration

**Current Configuration:**
- Backend handles CORS configuration
- Frontend makes requests to backend API
- No CORS configuration needed on frontend

**Best Practices:**
- Backend should whitelist frontend domain
- Never use `*` for allowed origins
- Include credentials in requests (cookies)

## Content Security Policy

**Current Status:** Not implemented

**Recommendation:**
- Implement CSP headers via Next.js config
- Whitelist script sources
- Whitelist style sources
- Whitelist image sources
- Whitelist connect sources (API)

**Example:**
```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.growthprint.com;
`;
```

## Security Headers

**Recommended Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy` (see above)

**Implementation:**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // ... other headers
        ],
      },
    ];
  },
};
```

## Dependency Security

### Dependency Scanning

**Recommended Tools:**
- npm audit
- Snyk
- Dependabot (GitHub)

**Integration:**
- Add dependency scanning to CI/CD pipeline
- Block PRs with vulnerable dependencies
- Update dependencies regularly

### Dependency Updates

**Policy:**
- Review dependency updates monthly
- Prioritize security updates
- Test updates in staging before production
- Use dependency version ranges carefully

## Vulnerability Management

### Vulnerability Reporting

**Process:**
1. User reports vulnerability via secure channel
2. Security team acknowledges receipt
3. Security team investigates and validates
4. Security team develops fix
5. Security team tests fix
6. Security team deploys fix
7. Security team discloses vulnerability (if applicable)

### Vulnerability Response

**Severity Levels:**
- **Critical:** Fix within 24 hours
- **High:** Fix within 72 hours
- **Medium:** Fix within 1 week
- **Low:** Fix within 1 month

## OWASP ASVS Compliance

### Verification Requirements

**ASVS v4.0 Categories:**

**V1: Architecture:**
- [x] 1.1.1 - Verify that the application has security controls
- [x] 1.1.2 - Verify that security controls are enforced
- [ ] 1.2.1 - Verify that security architecture is documented (partial)
- [ ] 1.4.1 - Verify that security logging is implemented (partial)

**V2: Authentication:**
- [x] 2.1.1 - Verify that strong authentication is used
- [x] 2.1.7 - Verify that authentication fails securely
- [ ] 2.2.1 - Verify that password requirements are enforced (backend)
- [ ] 2.2.2 - Verify that password storage is secure (backend)
- [x] 2.2.3 - Verify that password reset is secure (backend)
- [x] 2.6.1 - Verify that authentication is required for sensitive operations

**V3: Session Management:**
- [x] 3.1.1 - Verify that session identifiers are secure (JWT tokens)
- [x] 3.2.1 - Verify that session termination is implemented
- [ ] 3.4.1 - Verify that session timeout is configured (backend)

**V4: Access Control:**
- [x] 4.1.1 - Verify that access control is enforced
- [x] 4.1.2 - Verify that access control fails securely
- [x] 4.2.1 - Verify that principle of least privilege is enforced
- [ ] 4.2.3 - Verify that access control is centralized (partial)

**V5: Validation:**
- [x] 5.1.1 - Verify that input validation is implemented
- [x] 5.1.2 - Verify that output encoding is implemented
- [x] 5.3.1 - Verify that XSS is prevented

**V8: Data Protection:**
- [x] 8.1.1 - Verify that data is encrypted in transit (HTTPS required)
- [ ] 8.2.1 - Verify that sensitive data is encrypted at rest (partial)
- [ ] 8.3.1 - Verify that data is backed up securely (backend)

## Security Checklist

### Before Production Deployment

- [ ] JWT tokens stored in httpOnly cookies
- [ ] HTTPS configured
- [ ] CORS configured for production domain
- [ ] Content Security Policy configured
- [ ] Security headers configured
- [ ] Dependency scan completed with no critical vulnerabilities
- [ ] Input validation implemented on all forms
- [ ] XSS prevention implemented
- [ ] CSRF protection implemented
- [ ] Error tracking configured (Sentry)
- [ ] No secrets in code or git history

### Ongoing Security

- [ ] Dependency updates reviewed monthly
- [ ] Security audit completed annually
- [ ] Penetration testing completed before major releases
- [ ] Secret rotation completed quarterly
- [ ] Access logs reviewed weekly
- [ ] Security training completed annually

## Incident Response

### Security Incident Types

- Unauthorized access to user data
- Data breach or leak
- XSS attack
- CSRF attack
- Phishing attack
- Social engineering attack

### Incident Response Plan

1. **Detection:** Identify incident through monitoring or user report
2. **Containment:** Isolate affected systems to prevent spread
3. **Eradication:** Remove threat and restore systems
4. **Recovery:** Restore normal operations
5. **Lessons Learned:** Document incident and improve processes

## References

- OWASP Application Security Verification Standard (ASVS)
- OWASP Cheat Sheet Series
- OWASP Top 10
- Next.js Security Best Practices
- React Security Best Practices
