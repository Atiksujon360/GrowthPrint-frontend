# GrowthPrint Frontend - Deployment Guide

## Overview

This document covers environment configuration, deployment, monitoring, and rollback procedures for the GrowthPrint frontend.

## Environment Configuration

### Development Environment

**Purpose:** Local development and testing

**Configuration:**
- Port: 3000
- Backend API: http://localhost:8090
- Mock Mode: Enabled (default)
- HTTPS: Not required

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8090
NEXT_PUBLIC_USE_MOCK_API=true
```

### Staging Environment

**Purpose:** Pre-production testing

**Configuration:**
- Port: 3000
- Backend API: Staging backend URL
- Mock Mode: Disabled
- HTTPS: Required

**Environment Variables (Vercel Dashboard):**
```
NEXT_PUBLIC_API_URL=https://staging-api.growthprint.com
NEXT_PUBLIC_USE_MOCK_API=false
```

### Production Environment

**Purpose:** Live production deployment

**Configuration:**
- Port: 3000
- Backend API: Production backend URL
- Mock Mode: Disabled
- HTTPS: Required

**Environment Variables (Vercel Dashboard):**
```
NEXT_PUBLIC_API_URL=https://api.growthprint.com
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_ANALYTICS_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SENTRY_DSN=SENTRY_DSN
```

**Security Notes:**
- Never use mock mode in production
- Use HTTPS for all API calls
- Configure CORS on backend
- Use environment variables for sensitive data

## Deployment Procedures

### Pre-Deployment Checklist

**Code Quality:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage > 80%
- [ ] No critical bugs
- [ ] No critical security vulnerabilities

**Security:**
- [ ] No secrets in code or git history
- [ ] HTTPS configured
- [ ] CORS configured for production domain
- [ ] Content Security Policy configured
- [ ] Security headers configured
- [ ] Dependency scan passed

**Performance:**
- [ ] Lighthouse score > 90
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Code splitting implemented

**Documentation:**
- [ ] API_COVERAGE_MATRIX.md updated
- [ ] Release notes written
- [ ] PROJECT_STATUS.md updated
- [ ] AGENTS.md reviewed

### Deployment to Vercel

**Step 1: Build Application**

```bash
npm run build
```

**Step 2: Verify Build**

```bash
npm run lint
npm test
```

**Step 3: Tag Release**

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

**Step 4: Deploy to Vercel**

**Option A: Automatic Deployment (Git Integration)**
1. Connect Vercel to GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
3. Configure environment variables in Vercel dashboard
4. Push to main branch triggers automatic deployment

**Option B: Manual Deployment**
1. Build locally: `npm run build`
2. Deploy with Vercel CLI: `vercel --prod`
3. Configure environment variables in Vercel dashboard
4. Verify deployment

**Step 5: Verify Deployment**

1. Check production URL: https://growthprint.com
2. Check Vercel dashboard for deployment status
3. Test critical user flows
4. Verify API integration works
5. Check console for errors

### Deployment with Docker (Alternative)

**Step 1: Build Docker Image**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**Step 2: Build Image**

```bash
docker build -t growthprint-frontend:latest .
```

**Step 3: Push to Registry**

```bash
docker tag growthprint-frontend:latest registry.example.com/growthprint-frontend:latest
docker push registry.example.com/growthprint-frontend:latest
```

**Step 4: Deploy**

```bash
kubectl apply -f k8s-deployment.yaml
```

## API Integration

### Mock Mode

**Purpose:** Development without backend

**Configuration:**
```env
NEXT_PUBLIC_USE_MOCK_API=true
```

**Behavior:**
- API calls return mock data from Redux store
- No actual HTTP requests made
- Useful for frontend development

**Disable for Production:**
```env
NEXT_PUBLIC_USE_MOCK_API=false
```

### Real API Mode

**Purpose:** Production deployment

**Configuration:**
```env
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.growthprint.com
```

**Behavior:**
- API calls make HTTP requests to backend
- JWT tokens included in Authorization header
- Error handling for failed requests

## Monitoring

### Health Checks

**Next.js Health:**
- Application starts successfully
- No console errors
- API calls succeed

**Custom Health Check:**
- Create `/api/health` endpoint
- Check backend connectivity
- Return health status

### Application Monitoring

**Recommended Tools:**
- Sentry - Error tracking
- Google Analytics - User analytics
- Vercel Analytics - Performance metrics
- LogRocket - Session replay

**Metrics to Monitor:**
- Page load time
- Error rate
- API response time
- User engagement
- Conversion rates

### Log Aggregation

**Recommended Tools:**
- Vercel Logs (built-in)
- LogRocket
- Sentry (error logs)

**Log Levels:**
- ERROR: Critical errors requiring immediate attention
- WARN: Warning conditions
- INFO: Informational messages
- DEBUG: Debug information (development only)

### Alerting

**Alert Rules:**
- Error rate > 1% for 5 minutes
- API failure rate > 5%
- Page load time > 3 seconds
- Console errors > 10 per minute

**Alert Channels:**
- Email
- Slack
- SMS (for critical alerts)

## Rollback Procedures

### Immediate Rollback Triggers

Rollback immediately if:
- Critical security vulnerability discovered
- Data corruption or data loss
- System downtime > 5 minutes
- Error rate > 5%
- Performance degradation > 50%

### Rollback Process

**Step 1: Identify Issue**
- Monitor alerts
- Review logs
- Reproduce issue
- Determine root cause

**Step 2: Rollback Code**
```bash
git checkout previous-release-tag
git push origin main
```

**Step 3: Trigger Deployment**
- Vercel auto-deploys on push
- Wait for deployment to complete
- Verify health check

**Step 4: Verify Recovery**
- Check production URL
- Run smoke tests
- Monitor error rate
- Monitor response time

**Step 5: Investigate Root Cause**
- Analyze logs
- Review code changes
- Identify bug
- Create fix

**Step 6: Test Fix**
- Deploy fix to staging
- Run integration tests
- Verify fix resolves issue

**Step 7: Deploy Fix**
- Merge fix to main
- Deploy to production
- Verify recovery

## Disaster Recovery

### Disaster Scenarios

**Scenario 1: Complete Data Center Failure**
- Deploy to alternative region
- Update DNS to point to alternative region
- Verify functionality

**Scenario 2: API Outage**
- Display graceful error message
- Implement retry logic
- Provide offline fallback (not implemented)

**Scenario 3: Security Breach**
- Rotate all secrets
- Reset all user passwords
- Review audit logs
- Patch vulnerability
- Monitor for suspicious activity

### Recovery Time Objectives (RTO)

**Target RTO:**
- Critical services: 30 minutes
- Non-critical services: 2 hours

### Recovery Point Objectives (RPO)

**Target RPO:**
- Critical data: N/A (frontend is stateless)
- Non-critical data: N/A (frontend is stateless)

## Security Considerations

### Production Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] NEXT_PUBLIC_USE_MOCK_API set to false
- [ ] CORS configured for production domain only
- [ ] Content Security Policy configured
- [ ] Security headers configured
- [ ] Dependency scan passed
- [ ] Secret scan passed
- [ ] JWT tokens stored in httpOnly cookies (recommended)
- [ ] Input validation implemented
- [ ] XSS prevention implemented
- [ ] CSRF protection implemented
- [ ] Error tracking configured (Sentry)

### Incident Response

**Security Incident Types:**
- Unauthorized access
- Data breach
- XSS attack
- CSRF attack
- Phishing attack

**Response Process:**
1. Detect incident
2. Contain threat
3. Eradicate threat
4. Recover systems
5. Document lessons learned

## Post-Deployment Verification

### Smoke Tests

**Tests to Run:**
1. Public website loads
2. Admin login works
3. Client login works
4. API calls succeed
5. No console errors
6. Error rate < 1%
7. Page load time < 3 seconds

### Monitoring Verification

**Checks:**
1. Health checks passing
2. Metrics collecting
3. Logs aggregating
4. Alerts configured
5. No critical errors in logs

### User Acceptance Testing

**Tasks:**
1. Public inquiry submission
2. Admin login
3. Client login
4. Create lead
5. Create client
6. Create support request
7. View invoice
8. Verify all workflows

## Documentation Updates

**Post-Deployment:**
- Update PROJECT_STATUS.md
- Document any issues encountered
- Update deployment runbook
- Update monitoring configuration
- Document lessons learned

## References

**Vercel Documentation:**
- https://vercel.com/docs

**Next.js Deployment:**
- https://nextjs.org/docs/deployment

**Docker Deployment:**
- https://docs.docker.com/
