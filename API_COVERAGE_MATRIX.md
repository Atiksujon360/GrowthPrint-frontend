# GrowthPrint API Coverage Matrix

## Phase 1: Audit Results

### Authentication Module

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| Admin Login | Login | POST /auth/login | /api/v1/auth/login | POST | Public | ✅ Match | DTO field names match (accessToken) |
| Portal Login | Login | POST /auth/login | /api/v1/auth/login | POST | Public | ✅ Match | DTO field names match (accessToken) |
| All Protected Pages | Get User | GET /auth/me | /api/v1/auth/me | GET | Authenticated | ✅ Match | Used for session validation |
| All Protected Pages | Logout | POST /auth/logout | /api/v1/auth/logout | POST | Public | ✅ Match | Client-side token discard |

### Public Pages

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| Hero Section | Submit Inquiry | submitPublicInquiry (local) | /api/v1/public/inquiries | POST | Public | ⚠️ Partial | Frontend uses local Redux action, endpoint exists |

### Admin Dashboard

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminDashboard | Load Dashboard | Reads Redux state | None | - | - | ✅ Mock Only | Dashboard KPIs come from Redux initialData |
| AdminDashboard | Refresh Dashboard | fetchClients, fetchProjects, etc. | Multiple GET | ADMIN | ✅ Exists | Multiple calls to fetch data |
| AdminDashboard | KPI Metrics | Hardcoded | None | - | - | ❌ Missing | No backend aggregation endpoint |

### Admin Clients

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminClientsView | Load Clients | fetchClients() | /api/v1/clients | GET | ADMIN | ✅ Match | Returns ClientResponse[] |
| AdminClientsView | Update Client | updateClient() | /api/v1/clients/{id} | PATCH | ADMIN | ✅ Match | Updates name, contactEmail, phone, notes |
| AdminClientsView | Search/Filter | Local filtering | None | - | - | ✅ Works | Client-side filtering |

### Admin Leads (Legacy)

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminLeadsView | Load Leads | fetchLeads() | /api/v1/leads | GET | ADMIN | ✅ Match | Returns LeadResponse[] |
| AdminLeadsView | Update Status | Not implemented | None | - | - | ❌ Missing | No update endpoint for legacy leads |

### Admin CRM Leads

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminLeadsView | Load CRM Leads | fetchCrmLeads() | /api/v1/crm-leads | GET | ADMIN | ✅ Match | Returns CrmLeadResponse[] |
| AdminLeadsView | Update Pipeline Stage | updateCrmLeadPipelineStage() | /api/v1/crm-leads/{id}/pipeline-stage | PUT | ADMIN | ✅ Match | Updates pipelineStage |
| AdminLeadsView | Delete Lead | deleteCrmLead() | /api/v1/crm-leads/{id} | DELETE | ADMIN | ✅ Match | Deletes CRM lead |
| AdminLeadsView | Create Lead | createCrmLead() | /api/v1/crm-leads | POST | ADMIN | ✅ Match | Creates CRM lead |
| AdminLeadsView | Convert Inquiry | convertFromInquiry() | /api/v1/crm-leads/inquiry/{inquiryId}/convert | POST | ADMIN | ✅ Match | Converts inquiry to CRM lead |

### Admin Projects

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminProjectsView | Load Projects | fetchProjects() | /api/v1/projects | GET | ADMIN | ✅ Match | Returns ProjectResponse[] with milestones |
| AdminProjectsView | Update Status | updateProjectStatus() | /api/v1/projects/{id}/status | PATCH | ADMIN | ✅ Match | Updates project status |
| AdminProjectsView | Create Project | createProject() | /api/v1/projects | POST | ADMIN | ✅ Match | Creates project with deliverables |
| AdminProjectsView | Create Milestone | createMilestone() | /api/v1/projects/{projectId}/milestones | POST | ADMIN | ✅ Match | Creates milestone |

### Admin Support Requests

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminRequestsQueue | Load Requests | fetchSupportRequests() | /api/v1/support-requests | GET | ADMIN | ✅ Match | Returns SupportRequestResponse[] with estimates |
| AdminRequestsQueue | Classify Request | classifyRequest() | /api/v1/support-requests/{id}/classify | POST | ADMIN | ✅ Match | Classifies category, adminNotes |
| AdminRequestsQueue | Attach Estimate | attachEstimate() | /api/v1/support-requests/{id}/estimate | POST | ADMIN | ✅ Match | Attaches cost estimate |
| AdminRequestsQueue | Approve Estimate | approveEstimate() | /api/v1/support-requests/{id}/approve-estimate | POST | ADMIN | ✅ Match | Approves estimate |
| AdminRequestsQueue | Update Status | updateRequestStatus() | /api/v1/support-requests/{id}/status | PATCH | ADMIN | ✅ Match | Updates request status |

### Admin Invoices

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminInvoicesView | Load Invoices | fetchInvoices() | /api/v1/invoices | GET | ADMIN | ✅ Match | Returns InvoiceResponse[] with line items |
| AdminInvoicesView | Mark Paid | markInvoicePaid() | /api/v1/invoices/{id}/reconcile | POST | ADMIN | ✅ Match | Marks invoice as paid |

### Admin Outreach Studio

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminOutreachStudio | Load Drafts | agencyApi.outreach.getDrafts() | /api/v1/outreach/drafts | GET | ADMIN | ✅ Match | Returns OutreachDraftResponse[] |
| AdminOutreachStudio | Approve Draft | approveOutreachDraft (local) | /api/v1/outreach/drafts/{id}/approve | POST | ADMIN | ⚠️ Partial | Frontend uses local action, endpoint exists |
| AdminOutreachStudio | Send Draft | sendApprovedOutreach (local) | /api/v1/outreach/drafts/{id}/send | POST | ADMIN | ⚠️ Partial | Frontend uses local action, endpoint exists |

### Admin Automation

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminAutomationView | Load Workflows | agencyApi.automations.getAll() | /api/v1/automations | GET | ADMIN | ❌ Missing | No automation endpoints in backend |
| AdminAutomationView | Trigger Workflow | triggerWorkflowRun (local) | None | - | - | ❌ Missing | No automation engine in backend |

### Admin Activity

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| AdminActivityView | Load Activities | Reads Redux state | None | - | - | ❌ Missing | No activity audit endpoint in backend |

### Portal Dashboard

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| PortalDashboard | Load Dashboard | Reads Redux state | None | - | - | ✅ Mock Only | Uses filtered initialData |

### Portal Projects

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| PortalProjectsView | Load My Projects | fetchMyProjects() | /api/v1/projects/my | GET | CLIENT | ✅ Match | Returns client's projects |
| PortalProjectsView | Toggle Task | toggleTaskStatus (local) | None | - | - | ❌ Missing | No task entity in backend |

### Portal Support Requests

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| PortalRequestsView | Load Requests | fetchMySupportRequests() | /api/v1/support-requests/my | GET | CLIENT | Match | Returns client's support requests |
| PortalRequestsView | Create Request | createSupportRequest (local) | /api/v1/support-requests | POST | ADMIN | ⚠️ Partial | Endpoint exists but requires ADMIN, not CLIENT |
| PortalRequestsView | Approve Estimate | approveEstimate() | /api/v1/support-requests/{id}/approve-estimate | POST | ADMIN | ⚠️ Partial | Endpoint exists but requires ADMIN, not CLIENT |

### Portal Invoices

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| PortalInvoicesView | Load Invoices | fetchMyInvoices() | /api/v1/invoices/my | GET | CLIENT | Match | Returns client's invoices |
| PortalInvoicesView | Mark Paid | markInvoicePaid() | /api/v1/invoices/{id}/reconcile | POST | ADMIN | ⚠️ Partial | Endpoint exists but requires ADMIN, not CLIENT |

### Portal Proposals

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| PortalProposalsView | Load Proposals | Reads Redux state | None | - | - | ❌ Missing | No proposal entity or endpoints in backend |

### Portal Messages

| Screen | Action | Frontend API Call | Backend Endpoint | Method | Role | Status | Notes |
|-------|--------|-------------------|------------------|--------|------|--------|-------|
| PortalMessagesView | Load Messages | Local state | None | - | - | ❌ Missing | No messaging system in backend |

## Summary

### Endpoints Status

### Critical Issues for Real API Mode
1. ~~Authentication: JWT_SECRET not loading from .env~~ COMPLETED
2. ~~Client Authorization: Portal endpoints for support-requests and invoices~~ COMPLETED
3. **Missing Endpoints**: Automation, activity audit, proposals
4. **Portal Write Operations**: Create support request, approve estimate, mark invoice paid still require ADMIN role
5. **Admin Dashboard Metrics**: Dashboard KPIs use Redux initialData instead of backend aggregation

### Remaining Work
1. Implement missing backend endpoints (automation, activity, proposals)
2. Add CLIENT role authorization for portal write operations (create support request, approve estimate, mark invoice paid)
3. Implement backend aggregation endpoint for admin dashboard metrics
4. Connect Admin Dashboard screens to real API (outreach studio, automation, activity, settings)
5. Connect Portal Dashboard to real API
6. Implement portal-specific write operations with client ownership validation

- ✅ Fully Implemented: 27 endpoints
- ⚠️ Partially Implemented: 5 endpoints (auth/role mismatch)
1. **Authentication**: JWT_SECRET not loading from .env - BLOCKING ALL API CALLS
2. **Client Authorization**: All portal endpoints require ADMIN role - BLOCKS CLIENT ACCESS
3. **Missing Endpoints**: Automation, activity audit, proposals

### Priority Fixes
1. ~~Fix JWT_SECRET loading (Phase 2)~~ COMPLETED
2. ~~Change portal endpoints to require CLIENT role (Phase 5)~~ COMPLETED
3. Implement missing endpoints or disable UI features (Phase 3)
