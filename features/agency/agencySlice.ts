import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  type Client,
  type BackendClientResponse,
  type Project,
  type Task,
  type SupportRequest,
  type Lead,
  type BackendCrmLeadResponse,
  type OutreachDraft,
  type Proposal,
  type Invoice,
  type WorkflowDefinition,
  type ActivityEvent,
  type PublicInquiryFormData,
  type SupportCategory,
  type SupportRequestStatus,
  type LeadPipelineStage
} from '../../types/agency.ts';
import {
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_SUPPORT_REQUESTS,
  INITIAL_LEADS,
  INITIAL_OUTREACH_DRAFTS,
  INITIAL_PROPOSALS,
  INITIAL_INVOICES,
  INITIAL_WORKFLOWS,
  INITIAL_ACTIVITY_EVENTS
} from './initialData.ts';
import { calculateLeadScore, calculateEstimateCost, calculateInvoiceTotals } from '../../lib/domain-rules.ts';
import { agencyApi } from '../../lib/api/client.ts';

import type { AgencyState } from '../../types/agency.ts';

// Check if mock mode is enabled
const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

const initialAgencyState: AgencyState = {
  clients: INITIAL_CLIENTS,
  projects: INITIAL_PROJECTS,
  tasks: INITIAL_TASKS,
  requests: INITIAL_SUPPORT_REQUESTS,
  leads: INITIAL_LEADS,
  outreachDrafts: INITIAL_OUTREACH_DRAFTS,
  proposals: INITIAL_PROPOSALS,
  invoices: INITIAL_INVOICES,
  workflows: INITIAL_WORKFLOWS,
  activities: INITIAL_ACTIVITY_EVENTS,
  isLoadingClients: false,
  isLoadingLeads: false,
  clientsError: null,
  leadsError: null
};

// Async thunks for Clients API
export const fetchClients = createAsyncThunk(
  'agency/fetchClients',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_CLIENTS;
    }

    try {
      const response = await agencyApi.clients.getAll();
      const backendClients = response.data as BackendClientResponse[];

      // Map backend response to frontend Client type
      const clients: Client[] = backendClients.map(bc => ({
        id: bc.id,
        name: bc.name,
        legalName: bc.legalName,
        contactEmail: bc.contactEmail,
        phone: bc.phone,
        website: bc.website,
        status: bc.status,
        retainerTier: bc.retainerTier,
        monthlyRetainerHours: bc.monthlyRetainerHours,
        consumedHoursCurrentMonth: bc.consumedHoursCurrentMonth,
        contractStartDate: bc.contractStartDate,
        accountManager: bc.accountManager,
        billingCurrency: bc.billingCurrency,
        notes: bc.notes
      }));

      return clients;
    } catch (error: any) {
      console.error('Failed to fetch clients:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch clients');
    }
  }
);

export const updateClient = createAsyncThunk(
  'agency/updateClient',
  async ({ id, updates }: { id: string; updates: Partial<Client> }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, skip optimistic update - let the reducer handle it
      return rejectWithValue('Mock mode: updateClient not implemented');
    }

    try {
      const response = await agencyApi.clients.update(id, updates);
      const backendClient = response.data as BackendClientResponse;

      const client: Client = {
        id: backendClient.id,
        name: backendClient.name,
        legalName: backendClient.legalName,
        contactEmail: backendClient.contactEmail,
        phone: backendClient.phone,
        website: backendClient.website,
        status: backendClient.status,
        retainerTier: backendClient.retainerTier,
        monthlyRetainerHours: backendClient.monthlyRetainerHours,
        consumedHoursCurrentMonth: backendClient.consumedHoursCurrentMonth,
        contractStartDate: backendClient.contractStartDate,
        accountManager: backendClient.accountManager,
        billingCurrency: backendClient.billingCurrency,
        notes: backendClient.notes
      };

      return client;
    } catch (error: any) {
      console.error('Failed to update client:', error.message);
      return rejectWithValue(error.message || 'Failed to update client');
    }
  }
);

// Async thunks for CRM Leads API
export const fetchCrmLeads = createAsyncThunk(
  'agency/fetchCrmLeads',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_LEADS;
    }

    try {
      const response = await agencyApi.crmLeads.getAll();
      const backendLeads = response.data as BackendCrmLeadResponse[];

      // Map backend response to frontend Lead type
      const leads: Lead[] = backendLeads.map(bl => ({
        id: bl.id,
        companyName: bl.companyName,
        website: bl.website,
        industry: bl.industry,
        location: bl.location,
        contactName: bl.contactName,
        contactEmail: bl.contactEmail,
        contactTitle: bl.contactTitle,
        source: bl.source,
        sourceUrl: bl.sourceUrl,
        discoveredDate: bl.discoveredDate,
        targetService: bl.targetService,
        identifiedProblem: bl.identifiedProblem,
        researchSummary: bl.researchSummary,
        qualificationScore: bl.qualificationScore,
        qualificationBreakdown: {
          businessFit: bl.businessFitScore || 0,
          evidenceOfNeed: bl.evidenceOfNeedScore || 0,
          contactability: bl.contactabilityScore || 0,
          serviceRelevance: bl.serviceRelevanceScore || 0,
          totalScore: bl.qualificationScore
        },
        pipelineStage: bl.pipelineStage,
        lastContactDate: bl.lastContactDate,
        nextAction: bl.nextAction,
        doNotContact: bl.doNotContact,
        notes: bl.notes,
        inquiryId: bl.inquiryId,
        createdAt: bl.createdAt,
        updatedAt: bl.updatedAt
      }));

      return leads;
    } catch (error: any) {
      console.error('Failed to fetch CRM leads:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch CRM leads');
    }
  }
);

export const createCrmLead = createAsyncThunk(
  'agency/createCrmLead',
  async (leadData: Partial<Lead>, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, create a mock lead
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        companyName: leadData.companyName || 'New Company',
        website: leadData.website || 'https://example.com',
        industry: leadData.industry || 'Technology',
        location: leadData.location || 'Unknown',
        contactName: leadData.contactName || 'Contact',
        contactEmail: leadData.contactEmail || 'contact@example.com',
        contactTitle: leadData.contactTitle,
        source: leadData.source || 'INBOUND_INQUIRY',
        sourceUrl: leadData.sourceUrl,
        discoveredDate: leadData.discoveredDate || new Date().toISOString().split('T')[0],
        targetService: leadData.targetService || 'SOFTWARE_DEV',
        identifiedProblem: leadData.identifiedProblem || 'Problem description',
        researchSummary: leadData.researchSummary || 'Research summary',
        qualificationScore: leadData.qualificationScore || 50,
        qualificationBreakdown: leadData.qualificationBreakdown || {
          businessFit: 12,
          evidenceOfNeed: 13,
          contactability: 12,
          serviceRelevance: 13,
          totalScore: 50
        },
        pipelineStage: leadData.pipelineStage || 'DISCOVERED',
        lastContactDate: leadData.lastContactDate,
        nextAction: leadData.nextAction || 'Follow up',
        doNotContact: leadData.doNotContact || false,
        notes: leadData.notes || ''
      };
      return newLead;
    }

    try {
      const response = await agencyApi.crmLeads.create(leadData);
      const backendLead = response.data as BackendCrmLeadResponse;

      const lead: Lead = {
        id: backendLead.id,
        companyName: backendLead.companyName,
        website: backendLead.website,
        industry: backendLead.industry,
        location: backendLead.location,
        contactName: backendLead.contactName,
        contactEmail: backendLead.contactEmail,
        contactTitle: backendLead.contactTitle,
        source: backendLead.source,
        sourceUrl: backendLead.sourceUrl,
        discoveredDate: backendLead.discoveredDate,
        targetService: backendLead.targetService,
        identifiedProblem: backendLead.identifiedProblem,
        researchSummary: backendLead.researchSummary,
        qualificationScore: backendLead.qualificationScore,
        qualificationBreakdown: {
          businessFit: backendLead.businessFitScore || 0,
          evidenceOfNeed: backendLead.evidenceOfNeedScore || 0,
          contactability: backendLead.contactabilityScore || 0,
          serviceRelevance: backendLead.serviceRelevanceScore || 0,
          totalScore: backendLead.qualificationScore
        },
        pipelineStage: backendLead.pipelineStage,
        lastContactDate: backendLead.lastContactDate,
        nextAction: backendLead.nextAction,
        doNotContact: backendLead.doNotContact,
        notes: backendLead.notes,
        inquiryId: backendLead.inquiryId,
        createdAt: backendLead.createdAt,
        updatedAt: backendLead.updatedAt
      };

      return lead;
    } catch (error: any) {
      console.error('Failed to create CRM lead:', error.message);
      return rejectWithValue(error.message || 'Failed to create CRM lead');
    }
  }
);

export const updateCrmLeadPipelineStage = createAsyncThunk(
  'agency/updateCrmLeadPipelineStage',
  async ({ id, pipelineStage }: { id: string; pipelineStage: LeadPipelineStage }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, skip optimistic update - let the reducer handle it
      return rejectWithValue('Mock mode: updateCrmLeadPipelineStage not implemented');
    }

    try {
      const response = await agencyApi.crmLeads.updatePipelineStage(id, pipelineStage);
      const backendLead = response.data as BackendCrmLeadResponse;

      const lead: Lead = {
        id: backendLead.id,
        companyName: backendLead.companyName,
        website: backendLead.website,
        industry: backendLead.industry,
        location: backendLead.location,
        contactName: backendLead.contactName,
        contactEmail: backendLead.contactEmail,
        contactTitle: backendLead.contactTitle,
        source: backendLead.source,
        sourceUrl: backendLead.sourceUrl,
        discoveredDate: backendLead.discoveredDate,
        targetService: backendLead.targetService,
        identifiedProblem: backendLead.identifiedProblem,
        researchSummary: backendLead.researchSummary,
        qualificationScore: backendLead.qualificationScore,
        qualificationBreakdown: {
          businessFit: backendLead.businessFitScore || 0,
          evidenceOfNeed: backendLead.evidenceOfNeedScore || 0,
          contactability: backendLead.contactabilityScore || 0,
          serviceRelevance: backendLead.serviceRelevanceScore || 0,
          totalScore: backendLead.qualificationScore
        },
        pipelineStage: backendLead.pipelineStage,
        lastContactDate: backendLead.lastContactDate,
        nextAction: backendLead.nextAction,
        doNotContact: backendLead.doNotContact,
        notes: backendLead.notes,
        inquiryId: backendLead.inquiryId,
        createdAt: backendLead.createdAt,
        updatedAt: backendLead.updatedAt
      };

      return lead;
    } catch (error: any) {
      console.error('Failed to update CRM lead pipeline stage:', error.message);
      return rejectWithValue(error.message || 'Failed to update CRM lead pipeline stage');
    }
  }
);

export const deleteCrmLead = createAsyncThunk(
  'agency/deleteCrmLead',
  async (id: string, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, just return the id (optimistic delete)
      return id;
    }

    try {
      await agencyApi.crmLeads.delete(id);
      return id;
    } catch (error: any) {
      console.error('Failed to delete CRM lead:', error.message);
      return rejectWithValue(error.message || 'Failed to delete CRM lead');
    }
  }
);

const agencySlice = createSlice({
  name: 'agency',
  initialState: initialAgencyState,
  reducers: {
    // A. Public Inquiry Submission
    submitPublicInquiry: (state, action: PayloadAction<PublicInquiryFormData>) => {
      const form = action.payload;
      const refNumber = `GP-INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      state.lastInquiryReference = refNumber;

      // Automatically create inbound lead
      const qualification = calculateLeadScore({
        businessFit: 22,
        evidenceOfNeed: 21,
        contactability: 23,
        serviceRelevance: 24
      });

      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        companyName: form.company,
        website: form.website || `https://${form.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        industry: form.projectType || 'General Enterprise',
        location: 'Inbound Web Submission',
        contactName: form.name,
        contactEmail: form.businessEmail,
        source: 'INBOUND_INQUIRY',
        discoveredDate: new Date().toISOString().split('T')[0],
        targetService: form.serviceCategory,
        identifiedProblem: form.projectDescription,
        researchSummary: `Inbound inquiry via website (Ref: ${refNumber}). Budget: ${form.budgetRange || 'Unspecified'}. Timeline: ${form.preferredTimeline || 'Flexible'}.`,
        qualificationScore: qualification.totalScore,
        qualificationBreakdown: qualification,
        pipelineStage: 'QUALIFIED',
        nextAction: 'Review inquiry details and schedule discovery call.',
        doNotContact: false,
        notes: `Preferred contact: ${form.preferredContactMethod}. Scope: ${form.projectDescription}`
      };

      state.leads.unshift(newLead);

      // Add to activity log
      state.activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: form.name,
        role: 'GUEST',
        action: 'SUBMITTED_INQUIRY',
        entityType: 'INQUIRY',
        entityId: refNumber,
        details: `Received project inquiry from ${form.company} (${form.serviceCategory}).`
      });
    },

    // B. Client Support Ticket Creation
    createSupportRequest: (state, action: PayloadAction<{
      clientId: string;
      clientName: string;
      projectId?: string;
      projectName?: string;
      title: string;
      category: SupportCategory;
      description: string;
      businessImpact: 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER';
      urgency: 'NORMAL' | 'URGENT';
    }>) => {
      const p = action.payload;
      const ref = `GP-REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newReq: SupportRequest = {
        id: `req-${Date.now()}`,
        reference: ref,
        clientId: p.clientId,
        clientName: p.clientName,
        projectId: p.projectId,
        projectName: p.projectName,
        title: p.title,
        category: p.category,
        description: p.description,
        businessImpact: p.businessImpact,
        urgency: p.urgency,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.requests.unshift(newReq);

      state.activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: p.clientName,
        role: 'CLIENT',
        action: 'CREATED_SUPPORT_REQUEST',
        entityType: 'REQUEST',
        entityId: ref,
        details: `New ticket: "${p.title}" (${p.businessImpact} impact).`
      });
    },

    // C. Admin Classify Support Request
    classifyRequest: (state, action: PayloadAction<{
      requestId: string;
      category: SupportCategory;
      adminNotes: string;
    }>) => {
      const req = state.requests.find(r => r.id === action.payload.requestId);
      if (req) {
        req.category = action.payload.category;
        req.adminNotes = action.payload.adminNotes;
        req.status = action.payload.category === 'INCLUDED_SUPPORT' ? 'READY_TO_START' : 'ESTIMATE_PENDING';
        req.updatedAt = new Date().toISOString();

        state.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Founder (Admin)',
          role: 'ADMIN',
          action: 'CLASSIFIED_REQUEST',
          entityType: 'REQUEST',
          entityId: req.reference,
          details: `Classified as ${action.payload.category}: ${action.payload.adminNotes}`
        });
      }
    },

    // D. Admin Attach Estimate
    attachEstimate: (state, action: PayloadAction<{
      requestId: string;
      hours: number;
      hourlyRate: number;
      explanation: string;
      deliveryTimelineDays: number;
    }>) => {
      const req = state.requests.find(r => r.id === action.payload.requestId);
      if (req) {
        const cost = calculateEstimateCost({
          hours: action.payload.hours,
          hourlyRate: action.payload.hourlyRate
        });

        req.estimate = {
          id: `est-${Date.now()}`,
          requestId: req.id,
          estimatedHours: action.payload.hours,
          hourlyRate: action.payload.hourlyRate,
          subtotal: cost.subtotal,
          discount: cost.discount,
          totalAmount: cost.total,
          currency: 'USD',
          deliveryTimelineDays: action.payload.deliveryTimelineDays,
          explanation: action.payload.explanation,
          createdAt: new Date().toISOString(),
          status: 'PENDING_APPROVAL'
        };
        req.status = 'AWAITING_CLIENT_APPROVAL';
        req.updatedAt = new Date().toISOString();

        state.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Founder (Admin)',
          role: 'ADMIN',
          action: 'SUBMITTED_ESTIMATE',
          entityType: 'ESTIMATE',
          entityId: req.estimate.id,
          details: `Estimate sent for ${req.reference}: ${action.payload.hours}h ($${cost.total}).`
        });
      }
    },

    // E. Client Approve Estimate (Triggers Status Update, Task, and Invoice)
    clientApproveEstimate: (state, action: PayloadAction<{ requestId: string; clientUser: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.requestId);
      if (req && req.estimate) {
        req.estimate.status = 'ACCEPTED';
        req.estimate.acceptedAt = new Date().toISOString();
        req.estimate.acceptedBy = action.payload.clientUser;
        req.status = 'READY_TO_START';
        req.updatedAt = new Date().toISOString();

        // 1. Automatically generate operational work task
        state.tasks.unshift({
          id: `task-${Date.now()}`,
          projectId: req.projectId || 'proj-meridian-portal',
          projectName: req.projectName || 'General Support Services',
          clientId: req.clientId,
          title: `Execute: ${req.title}`,
          description: req.estimate.explanation,
          status: 'TODO',
          priority: req.urgency === 'URGENT' ? 'HIGH' : 'MEDIUM',
          dueDate: new Date(Date.now() + (req.estimate.deliveryTimelineDays * 86400000)).toISOString().split('T')[0],
          isClientVisible: true,
          assignedTo: 'GrowthPrint Engineering'
        });

        // 2. Generate billing invoice
        const invoiceNumber = `INV-2026-00${Math.floor(60 + Math.random() * 30)}`;
        const lineItems = [
          {
            id: `li-${Date.now()}`,
            description: `${req.title} (${req.estimate.estimatedHours}h @ $${req.estimate.hourlyRate}/h)`,
            quantity: req.estimate.estimatedHours,
            unitPrice: req.estimate.hourlyRate,
            amount: req.estimate.totalAmount
          }
        ];
        const totals = calculateInvoiceTotals(lineItems, 0);

        state.invoices.unshift({
          id: `inv-${Date.now()}`,
          invoiceNumber,
          clientId: req.clientId,
          clientName: req.clientName,
          clientEmail: 'billing@meridianretail.com',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + (14 * 86400000)).toISOString().split('T')[0],
          lineItems,
          subtotal: totals.subtotal,
          taxPercent: 0,
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
          currency: 'USD',
          status: 'ISSUED',
          notes: `Authorized by ${action.payload.clientUser} under estimate ${req.reference}.`
        });

        state.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: action.payload.clientUser,
          role: 'CLIENT',
          action: 'ACCEPTED_ESTIMATE',
          entityType: 'ESTIMATE',
          entityId: req.estimate.id,
          details: `Client approved $${req.estimate.totalAmount} estimate. Work task queued; invoice ${invoiceNumber} issued.`
        });
      }
    },

    // F. Update Support Request Status
    updateRequestStatus: (state, action: PayloadAction<{ requestId: string; status: SupportRequestStatus }>) => {
      const req = state.requests.find(r => r.id === action.payload.requestId);
      if (req) {
        req.status = action.payload.status;
        req.updatedAt = new Date().toISOString();
        state.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Founder (Admin)',
          role: 'ADMIN',
          action: 'UPDATED_REQUEST_STATUS',
          entityType: 'REQUEST',
          entityId: req.reference,
          details: `Ticket status set to ${action.payload.status}.`
        });
      }
    },

    // G. Human Outreach Approval Gate
    approveOutreachDraft: (state, action: PayloadAction<{ draftId: string }>) => {
      const draft = state.outreachDrafts.find(d => d.id === action.payload.draftId);
      if (draft) {
        draft.status = 'APPROVED';
        draft.approvedByFounder = true;
        draft.approvedAt = new Date().toISOString();

        // Advance associated lead pipeline stage
        const lead = state.leads.find(l => l.id === draft.leadId);
        if (lead) {
          lead.pipelineStage = 'OUTREACH_APPROVED';
          lead.lastContactDate = new Date().toISOString().split('T')[0];
          lead.nextAction = 'Dispatch approved email via configured provider.';
        }

        state.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Founder (Admin)',
          role: 'ADMIN',
          action: 'APPROVED_OUTREACH',
          entityType: 'LEAD',
          entityId: draft.leadId,
          details: `Founder approved personalized email to ${draft.recipientName} (${draft.companyName}).`
        });
      }
    },

    // H. Send Outreach Simulation
    sendApprovedOutreach: (state, action: PayloadAction<{ draftId: string }>) => {
      const draft = state.outreachDrafts.find(d => d.id === action.payload.draftId);
      if (draft && draft.status === 'APPROVED') {
        draft.status = 'SENT';
        draft.sentAt = new Date().toISOString();

        const lead = state.leads.find(l => l.id === draft.leadId);
        if (lead) {
          lead.pipelineStage = 'CONTACTED';
          lead.lastContactDate = new Date().toISOString().split('T')[0];
          lead.nextAction = 'Monitor for recipient reply or scheduled follow-up reminder in 4 days.';
        }

        state.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Founder (Admin)',
          role: 'ADMIN',
          action: 'DISPATCHED_OUTREACH',
          entityType: 'LEAD',
          entityId: draft.leadId,
          details: `Message dispatched to ${draft.recipientEmail}. Idempotency key verified.`
        });
      }
    },

    // I. Save founder-edited outreach copy before approval or dispatch
    updateOutreachDraft: (state, action: PayloadAction<{ draftId: string; subject: string; messageBody: string }>) => {
      const draft = state.outreachDrafts.find(d => d.id === action.payload.draftId);
      if (draft) {
        draft.subject = action.payload.subject;
        draft.messageBody = action.payload.messageBody;
      }
    },

    // J. Update Lead Pipeline Stage
    updateLeadStage: (state, action: PayloadAction<{ leadId: string; stage: LeadPipelineStage }>) => {
      const lead = state.leads.find(l => l.id === action.payload.leadId);
      if (lead) {
        lead.pipelineStage = action.payload.stage;
        state.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Founder (Admin)',
          role: 'ADMIN',
          action: 'MOVED_PIPELINE_STAGE',
          entityType: 'LEAD',
          entityId: lead.id,
          details: `Moved ${lead.companyName} to ${action.payload.stage}.`
        });
      }
    },

    // K. Run Automation Workflow
    triggerWorkflowRun: (state, action: PayloadAction<{ workflowId: string }>) => {
      const wf = state.workflows.find(w => w.id === action.payload.workflowId);
      if (wf) {
        wf.runCount += 1;
        wf.lastRunAt = new Date().toISOString();
        wf.lastRunStatus = 'SUCCESS';

        state.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'System Engine',
          role: 'ADMIN',
          action: 'EXECUTED_WORKFLOW',
          entityType: 'INQUIRY',
          entityId: wf.id,
          details: `Workflow executed: "${wf.name}". Processed without errors.`
        });
      }
    },

    // L. Invoice Payment Simulator
    payInvoice: (state, action: PayloadAction<{ invoiceId: string }>) => {
      const inv = state.invoices.find(i => i.id === action.payload.invoiceId);
      if (inv) {
        inv.status = 'PAID';
        inv.paidAt = new Date().toISOString();

        state.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Client Payment Gateway',
          role: 'CLIENT',
          action: 'PAID_INVOICE',
          entityType: 'INVOICE',
          entityId: inv.invoiceNumber,
          details: `Payment of $${inv.totalAmount.toLocaleString()} confirmed for ${inv.invoiceNumber}.`
        });
      }
    },

    // M. Toggle Task Completion
    toggleTaskStatus: (state, action: PayloadAction<{ taskId: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
      }
    }
  },
  extraReducers: (builder) => {
    // Clients
    builder
      .addCase(fetchClients.pending, (state) => {
        state.isLoadingClients = true;
        state.clientsError = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoadingClients = false;
        state.clients = action.payload;
        state.clientsError = null;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoadingClients = false;
        state.clientsError = action.payload as string || 'Failed to fetch clients';
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        // Optional: set error state for failed client updates
        console.error('Failed to update client:', action.payload);
      });

    // CRM Leads
    builder
      .addCase(fetchCrmLeads.pending, (state) => {
        state.isLoadingLeads = true;
        state.leadsError = null;
      })
      .addCase(fetchCrmLeads.fulfilled, (state, action) => {
        state.isLoadingLeads = false;
        state.leads = action.payload;
        state.leadsError = null;
      })
      .addCase(fetchCrmLeads.rejected, (state, action) => {
        state.isLoadingLeads = false;
        state.leadsError = action.payload as string || 'Failed to fetch CRM leads';
      })
      .addCase(createCrmLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })
      .addCase(updateCrmLeadPipelineStage.fulfilled, (state, action) => {
        const index = state.leads.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })
      .addCase(updateCrmLeadPipelineStage.rejected, (state, action) => {
        // Optional: set error state for failed pipeline stage updates
        console.error('Failed to update pipeline stage:', action.payload);
      })
      .addCase(deleteCrmLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(l => l.id !== action.payload);
      });
  }
});

export const {
  submitPublicInquiry,
  createSupportRequest,
  classifyRequest,
  attachEstimate,
  clientApproveEstimate,
  updateRequestStatus,
  approveOutreachDraft,
  sendApprovedOutreach,
  updateOutreachDraft,
  updateLeadStage,
  triggerWorkflowRun,
  payInvoice,
  toggleTaskStatus
} = agencySlice.actions;

export default agencySlice.reducer;
