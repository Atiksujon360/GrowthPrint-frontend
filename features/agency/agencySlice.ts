import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  type Client,
  type BackendClientResponse,
  type Project,
  type BackendProjectResponse,
  type Task,
  type SupportRequest,
  type BackendSupportRequestResponse,
  type Lead,
  type BackendCrmLeadResponse,
  type OutreachDraft,
  type Proposal,
  type Invoice,
  type BackendInvoiceResponse,
  type WorkflowDefinition,
  type ActivityEvent,
  type PublicInquiryFormData,
  type SupportCategory,
  type SupportRequestStatus,
  type LeadPipelineStage,
  type ProjectStatus,
  type ServiceCategory
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
  isLoadingProjects: false,
  isLoadingRequests: false,
  isLoadingInvoices: false,
  clientsError: null,
  leadsError: null,
  projectsError: null,
  requestsError: null,
  invoicesError: null
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

// Async thunks for Projects API
export const fetchProjects = createAsyncThunk(
  'agency/fetchProjects',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_PROJECTS;
    }

    try {
      const response = await agencyApi.projects.getAll();
      const backendProjects = response.data as BackendProjectResponse[];

      // Map backend response to frontend Project type
      const projects: Project[] = backendProjects.map(bp => ({
        id: bp.id,
        reference: bp.reference,
        name: bp.name,
        clientId: bp.clientId,
        clientName: bp.clientName,
        serviceCategory: bp.serviceCategory as ServiceCategory,
        description: bp.description,
        status: bp.status as ProjectStatus,
        progressPercent: bp.progressPercent,
        startDate: bp.startDate,
        targetCompletionDate: bp.targetCompletionDate,
        budgetTotal: bp.budgetTotal,
        budgetSpent: bp.budgetSpent,
        milestones: bp.milestones.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate,
          status: m.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
        })),
        deliverables: bp.deliverables,
        assignedLead: bp.assignedLead,
        updatedAt: bp.updatedAt
      }));

      return projects;
    } catch (error: any) {
      console.error('Failed to fetch projects:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

export const fetchMyProjects = createAsyncThunk(
  'agency/fetchMyProjects',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_PROJECTS;
    }

    try {
      const response = await agencyApi.projects.getMyProjects();
      const backendProjects = response.data as BackendProjectResponse[];

      // Map backend response to frontend Project type
      const projects: Project[] = backendProjects.map(bp => ({
        id: bp.id,
        reference: bp.reference,
        name: bp.name,
        clientId: bp.clientId,
        clientName: bp.clientName,
        serviceCategory: bp.serviceCategory as ServiceCategory,
        description: bp.description,
        status: bp.status as ProjectStatus,
        progressPercent: bp.progressPercent,
        startDate: bp.startDate,
        targetCompletionDate: bp.targetCompletionDate,
        budgetTotal: bp.budgetTotal,
        budgetSpent: bp.budgetSpent,
        milestones: bp.milestones.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate,
          status: m.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
        })),
        deliverables: bp.deliverables,
        assignedLead: bp.assignedLead,
        updatedAt: bp.updatedAt
      }));

      return projects;
    } catch (error: any) {
      console.error('Failed to fetch my projects:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch my projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'agency/createProject',
  async (projectData: any, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, skip optimistic update - let the reducer handle it
      return rejectWithValue('Mock mode: createProject not implemented');
    }

    try {
      const response = await agencyApi.projects.create(projectData);
      const backendProject = response.data as BackendProjectResponse;

      const project: Project = {
        id: backendProject.id,
        reference: backendProject.reference,
        name: backendProject.name,
        clientId: backendProject.clientId,
        clientName: backendProject.clientName,
        serviceCategory: backendProject.serviceCategory as ServiceCategory,
        description: backendProject.description,
        status: backendProject.status as ProjectStatus,
        progressPercent: backendProject.progressPercent,
        startDate: backendProject.startDate,
        targetCompletionDate: backendProject.targetCompletionDate,
        budgetTotal: backendProject.budgetTotal,
        budgetSpent: backendProject.budgetSpent,
        milestones: backendProject.milestones.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate,
          status: m.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
        })),
        deliverables: backendProject.deliverables,
        assignedLead: backendProject.assignedLead,
        updatedAt: backendProject.updatedAt
      };

      return project;
    } catch (error: any) {
      console.error('Failed to create project:', error.message);
      return rejectWithValue(error.message || 'Failed to create project');
    }
  }
);

export const createSupportRequestThunk = createAsyncThunk(
  'agency/createSupportRequest',
  async (requestData: {
    clientId: string;
    clientName: string;
    projectId?: string;
    projectName?: string;
    title: string;
    category: SupportCategory;
    description: string;
    businessImpact: 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER';
    urgency: 'NORMAL' | 'URGENT';
  }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, return mock data
      const p = requestData;
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
      return newReq;
    }

    try {
      const response = await agencyApi.support.create({
        clientId: requestData.clientId,
        projectId: requestData.projectId,
        title: requestData.title,
        category: requestData.category,
        description: requestData.description,
        businessImpact: requestData.businessImpact,
        urgency: requestData.urgency
      });
      const backendRequest = response.data as BackendSupportRequestResponse;

      const request: SupportRequest = {
        id: backendRequest.id,
        reference: backendRequest.reference,
        clientId: backendRequest.clientId,
        clientName: backendRequest.clientName,
        projectId: backendRequest.projectId,
        projectName: backendRequest.projectName,
        title: backendRequest.title,
        category: backendRequest.category as SupportCategory,
        description: backendRequest.description,
        businessImpact: backendRequest.businessImpact as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
        urgency: backendRequest.urgency as 'NORMAL' | 'URGENT',
        status: backendRequest.status as SupportRequestStatus,
        createdAt: backendRequest.createdAt,
        updatedAt: backendRequest.updatedAt,
        adminNotes: backendRequest.adminNotes,
        resolutionSummary: backendRequest.resolutionSummary,
        estimate: backendRequest.estimate ? {
          id: backendRequest.estimate.id,
          requestId: backendRequest.estimate.requestId,
          estimatedHours: parseFloat(backendRequest.estimate.estimatedHours),
          hourlyRate: parseFloat(backendRequest.estimate.hourlyRate),
          subtotal: parseFloat(backendRequest.estimate.subtotal),
          discount: parseFloat(backendRequest.estimate.discount),
          totalAmount: parseFloat(backendRequest.estimate.totalAmount),
          currency: backendRequest.estimate.currency,
          deliveryTimelineDays: backendRequest.estimate.deliveryTimelineDays,
          explanation: backendRequest.estimate.explanation,
          createdAt: backendRequest.estimate.createdAt,
          status: backendRequest.estimate.status as 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED',
          acceptedAt: backendRequest.estimate.acceptedAt,
          acceptedBy: backendRequest.estimate.acceptedBy
        } : undefined
      };

      return request;
    } catch (error: any) {
      console.error('Failed to create support request:', error.message);
      return rejectWithValue(error.message || 'Failed to create support request');
    }
  }
);

export const submitPublicInquiryThunk = createAsyncThunk(
  'agency/submitPublicInquiry',
  async (inquiryData: {
    name: string;
    businessEmail: string;
    company: string;
    website?: string;
    serviceCategory: ServiceCategory;
    projectType: string;
    budgetRange: string;
    preferredTimeline: string;
    projectDescription: string;
    preferredContactMethod: 'EMAIL' | 'PHONE' | 'VIDEO_CALL';
    consent: boolean;
  }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, use the local action logic
      return rejectWithValue('Mock mode: use local submitPublicInquiry action');
    }

    try {
      const response = await agencyApi.publicInquiries.submit(inquiryData);
      const backendResponse = response.data as any;

      // Map backend response to Lead type
      const lead: Lead = {
        id: backendResponse.id,
        companyName: inquiryData.company,
        industry: 'Unknown', // Not provided in public inquiry
        location: 'Unknown', // Not provided in public inquiry
        contactName: inquiryData.name,
        contactEmail: inquiryData.businessEmail,
        contactTitle: undefined,
        source: 'INBOUND_INQUIRY', // Public inquiries come from web submission
        sourceUrl: undefined,
        discoveredDate: backendResponse.receivedAt || new Date().toISOString(),
        targetService: inquiryData.serviceCategory,
        identifiedProblem: inquiryData.projectDescription.substring(0, 2000),
        researchSummary: inquiryData.projectDescription,
        qualificationScore: 70, // Default score for founder-sourced
        qualificationBreakdown: {
          businessFit: 18,
          evidenceOfNeed: 17,
          contactability: 18,
          serviceRelevance: 17,
          totalScore: 70
        },
        pipelineStage: 'DISCOVERED',
        nextAction: 'Contact for discovery call',
        doNotContact: false,
        notes: `Budget: ${inquiryData.budgetRange}, Timeline: ${inquiryData.preferredTimeline}`,
        website: inquiryData.website || '',
        createdAt: backendResponse.receivedAt || new Date().toISOString(),
        updatedAt: backendResponse.receivedAt || new Date().toISOString()
      };

      return lead;
    } catch (error: any) {
      console.error('Failed to submit public inquiry:', error.message);
      return rejectWithValue(error.message || 'Failed to submit public inquiry');
    }
  }
);

export const createMySupportRequestThunk = createAsyncThunk(
  'agency/createMySupportRequest',
  async (requestData: {
    projectId?: string;
    title: string;
    category: SupportCategory;
    description: string;
    businessImpact: 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER';
    urgency: 'NORMAL' | 'URGENT';
  }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, return mock data
      const p = requestData;
      const ref = `GP-REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newReq: SupportRequest = {
        id: `req-${Date.now()}`,
        reference: ref,
        clientId: 'client-meridian',
        clientName: 'Meridian Retail Group',
        projectId: p.projectId,
        projectName: p.projectId ? 'Mock Project' : null,
        title: p.title,
        category: p.category,
        description: p.description,
        businessImpact: p.businessImpact,
        urgency: p.urgency,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adminNotes: null,
        resolutionSummary: null,
        estimate: null
      };
      return newReq;
    }

    try {
      const response = await agencyApi.support.createMyRequest({
        projectId: requestData.projectId,
        title: requestData.title,
        category: requestData.category,
        description: requestData.description,
        businessImpact: requestData.businessImpact,
        urgency: requestData.urgency
      });
      const backendRequest = response.data as BackendSupportRequestResponse;

      const request: SupportRequest = {
        id: backendRequest.id,
        reference: backendRequest.reference,
        clientId: backendRequest.clientId,
        clientName: backendRequest.clientName,
        projectId: backendRequest.projectId,
        projectName: backendRequest.projectName,
        title: backendRequest.title,
        category: backendRequest.category as SupportCategory,
        description: backendRequest.description,
        businessImpact: backendRequest.businessImpact as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
        urgency: backendRequest.urgency as 'NORMAL' | 'URGENT',
        status: backendRequest.status as SupportRequestStatus,
        createdAt: backendRequest.createdAt,
        updatedAt: backendRequest.updatedAt,
        adminNotes: backendRequest.adminNotes,
        resolutionSummary: backendRequest.resolutionSummary,
        estimate: backendRequest.estimate ? {
          id: backendRequest.estimate.id,
          requestId: backendRequest.estimate.requestId,
          estimatedHours: parseFloat(backendRequest.estimate.estimatedHours),
          hourlyRate: parseFloat(backendRequest.estimate.hourlyRate),
          subtotal: parseFloat(backendRequest.estimate.subtotal),
          discount: parseFloat(backendRequest.estimate.discount),
          totalAmount: parseFloat(backendRequest.estimate.totalAmount),
          currency: backendRequest.estimate.currency,
          deliveryTimelineDays: backendRequest.estimate.deliveryTimelineDays,
          explanation: backendRequest.estimate.explanation,
          createdAt: backendRequest.estimate.createdAt,
          status: backendRequest.estimate.status as 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED',
          acceptedAt: backendRequest.estimate.acceptedAt,
          acceptedBy: backendRequest.estimate.acceptedBy
        } : undefined
      };

      return request;
    } catch (error: any) {
      console.error('Failed to create support request:', error.message);
      return rejectWithValue(error.message || 'Failed to create support request');
    }
  }
);

// Proposal thunks
export const fetchMyProposals = createAsyncThunk(
  'agency/fetchMyProposals',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_PROPOSALS;
    }

    try {
      const response = await agencyApi.proposals.getMyProposals();
      const backendProposals = response.data as any[];

      return backendProposals.map(p => ({
        id: p.id,
        proposalNumber: p.proposalNumber,
        clientId: p.clientId,
        clientName: p.clientName,
        title: p.title,
        serviceCategory: p.serviceCategory as ServiceCategory,
        scopeSummary: p.scopeSummary,
        deliverables: p.deliverables || [],
        exclusions: p.exclusions || [],
        totalPrice: parseFloat(p.totalPrice),
        currency: p.currency,
        paymentMilestones: p.paymentMilestones || [],
        timelineDuration: p.timelineDuration,
        validUntil: p.validUntil,
        status: p.status as 'DRAFT' | 'SENT_FOR_REVIEW' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED',
        acceptedAt: p.acceptedAt,
        acceptedBy: p.acceptedBy,
        declinedAt: p.declinedAt,
        declinedBy: p.declinedBy
      }));
    } catch (error: any) {
      console.error('Failed to fetch proposals:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch proposals');
    }
  }
);

export const recordProposalDecision = createAsyncThunk(
  'agency/recordProposalDecision',
  async ({ id, decision, notes }: { id: string; decision: 'ACCEPT' | 'DECLINE'; notes?: string }, { rejectWithValue }) => {
    if (isMockMode) {
      return rejectWithValue('Mock mode: proposal decisions not implemented');
    }

    try {
      const response = await agencyApi.proposals.recordDecision(id, { decision, notes });
      const backendProposal = response.data as any;

      return {
        id: backendProposal.id,
        proposalNumber: backendProposal.proposalNumber,
        clientId: backendProposal.clientId,
        clientName: backendProposal.clientName,
        title: backendProposal.title,
        serviceCategory: backendProposal.serviceCategory as ServiceCategory,
        scopeSummary: backendProposal.scopeSummary,
        deliverables: backendProposal.deliverables || [],
        exclusions: backendProposal.exclusions || [],
        totalPrice: parseFloat(backendProposal.totalPrice),
        currency: backendProposal.currency,
        paymentMilestones: backendProposal.paymentMilestones || [],
        timelineDuration: backendProposal.timelineDuration,
        validUntil: backendProposal.validUntil,
        status: backendProposal.status as 'DRAFT' | 'SENT_FOR_REVIEW' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED',
        acceptedAt: backendProposal.acceptedAt,
        acceptedBy: backendProposal.acceptedBy,
        declinedAt: backendProposal.declinedAt,
        declinedBy: backendProposal.declinedBy
      };
    } catch (error: any) {
      console.error('Failed to record proposal decision:', error.message);
      return rejectWithValue(error.message || 'Failed to record proposal decision');
    }
  }
);

export const updateProjectStatus = createAsyncThunk(
  'agency/updateProjectStatus',
  async ({ id, status }: { id: string; status: ProjectStatus }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, skip optimistic update - let the reducer handle it
      return rejectWithValue('Mock mode: updateProjectStatus not implemented');
    }

    try {
      const response = await agencyApi.projects.updateStatus(id, status);
      const backendProject = response.data as BackendProjectResponse;

      const project: Project = {
        id: backendProject.id,
        reference: backendProject.reference,
        name: backendProject.name,
        clientId: backendProject.clientId,
        clientName: backendProject.clientName,
        serviceCategory: backendProject.serviceCategory as ServiceCategory,
        description: backendProject.description,
        status: backendProject.status as ProjectStatus,
        progressPercent: backendProject.progressPercent,
        startDate: backendProject.startDate,
        targetCompletionDate: backendProject.targetCompletionDate,
        budgetTotal: backendProject.budgetTotal,
        budgetSpent: backendProject.budgetSpent,
        milestones: backendProject.milestones.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate,
          status: m.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
        })),
        deliverables: backendProject.deliverables,
        assignedLead: backendProject.assignedLead,
        updatedAt: backendProject.updatedAt
      };

      return project;
    } catch (error: any) {
      console.error('Failed to update project status:', error.message);
      return rejectWithValue(error.message || 'Failed to update project status');
    }
  }
);

// Async thunks for Support Requests API
export const fetchSupportRequests = createAsyncThunk(
  'agency/fetchSupportRequests',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_SUPPORT_REQUESTS;
    }

    try {
      const response = await agencyApi.support.getAll();
      const backendRequests = response.data as BackendSupportRequestResponse[];

      // Map backend response to frontend SupportRequest type
      const requests: SupportRequest[] = backendRequests.map(br => ({
        id: br.id,
        reference: br.reference,
        clientId: br.clientId,
        clientName: br.clientName,
        projectId: br.projectId,
        projectName: br.projectName,
        title: br.title,
        category: br.category as SupportCategory,
        description: br.description,
        businessImpact: br.businessImpact as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
        urgency: br.urgency as 'NORMAL' | 'URGENT',
        status: br.status as SupportRequestStatus,
        createdAt: br.createdAt,
        updatedAt: br.updatedAt,
        adminNotes: br.adminNotes,
        resolutionSummary: br.resolutionSummary,
        estimate: br.estimate ? {
          id: br.estimate.id,
          requestId: br.estimate.requestId,
          estimatedHours: parseFloat(br.estimate.estimatedHours),
          hourlyRate: parseFloat(br.estimate.hourlyRate),
          subtotal: parseFloat(br.estimate.subtotal),
          discount: parseFloat(br.estimate.discount),
          totalAmount: parseFloat(br.estimate.totalAmount),
          currency: br.estimate.currency,
          deliveryTimelineDays: br.estimate.deliveryTimelineDays,
          explanation: br.estimate.explanation,
          createdAt: br.estimate.createdAt,
          status: br.estimate.status as 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED',
          acceptedAt: br.estimate.acceptedAt,
          acceptedBy: br.estimate.acceptedBy
        } : undefined
      }));

      return requests;
    } catch (error: any) {
      console.error('Failed to fetch support requests:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch support requests');
    }
  }
);

// Async thunk for client-specific support requests
export const fetchMySupportRequests = createAsyncThunk(
  'agency/fetchMySupportRequests',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_SUPPORT_REQUESTS;
    }

    try {
      const response = await agencyApi.support.getMyRequests();
      const backendRequests = response.data as BackendSupportRequestResponse[];

      // Map backend response to frontend SupportRequest type
      const requests: SupportRequest[] = backendRequests.map(br => ({
        id: br.id,
        reference: br.reference,
        clientId: br.clientId,
        clientName: br.clientName,
        projectId: br.projectId,
        projectName: br.projectName,
        title: br.title,
        category: br.category as SupportCategory,
        description: br.description,
        businessImpact: br.businessImpact as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
        urgency: br.urgency as 'NORMAL' | 'URGENT',
        status: br.status as SupportRequestStatus,
        createdAt: br.createdAt,
        updatedAt: br.updatedAt,
        adminNotes: br.adminNotes,
        resolutionSummary: br.resolutionSummary,
        estimate: br.estimate ? {
          id: br.estimate.id,
          requestId: br.estimate.requestId,
          estimatedHours: parseFloat(br.estimate.estimatedHours),
          hourlyRate: parseFloat(br.estimate.hourlyRate),
          subtotal: parseFloat(br.estimate.subtotal),
          discount: parseFloat(br.estimate.discount),
          totalAmount: parseFloat(br.estimate.totalAmount),
          currency: br.estimate.currency,
          deliveryTimelineDays: br.estimate.deliveryTimelineDays,
          explanation: br.estimate.explanation,
          createdAt: br.estimate.createdAt,
          status: br.estimate.status as 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED',
          acceptedAt: br.estimate.acceptedAt,
          acceptedBy: br.estimate.acceptedBy
        } : undefined
      }));

      return requests;
    } catch (error: any) {
      console.error('Failed to fetch support requests:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch support requests');
    }
  }
);

export const classifyRequestThunk = createAsyncThunk(
  'agency/classifyRequest',
  async ({ requestId, category, adminNotes }: { requestId: string; category: SupportCategory; adminNotes: string }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, skip optimistic update - let the reducer handle it
      return rejectWithValue('Mock mode: classifyRequest not implemented');
    }

    try {
      const response = await agencyApi.support.classify(requestId, { category, adminNotes });
      const backendRequest = response.data as BackendSupportRequestResponse;

      const request: SupportRequest = {
        id: backendRequest.id,
        reference: backendRequest.reference,
        clientId: backendRequest.clientId,
        clientName: backendRequest.clientName,
        projectId: backendRequest.projectId,
        projectName: backendRequest.projectName,
        title: backendRequest.title,
        category: backendRequest.category as SupportCategory,
        description: backendRequest.description,
        businessImpact: backendRequest.businessImpact as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
        urgency: backendRequest.urgency as 'NORMAL' | 'URGENT',
        status: backendRequest.status as SupportRequestStatus,
        createdAt: backendRequest.createdAt,
        updatedAt: backendRequest.updatedAt,
        adminNotes: backendRequest.adminNotes,
        resolutionSummary: backendRequest.resolutionSummary,
        estimate: backendRequest.estimate ? {
          id: backendRequest.estimate.id,
          requestId: backendRequest.estimate.requestId,
          estimatedHours: parseFloat(backendRequest.estimate.estimatedHours),
          hourlyRate: parseFloat(backendRequest.estimate.hourlyRate),
          subtotal: parseFloat(backendRequest.estimate.subtotal),
          discount: parseFloat(backendRequest.estimate.discount),
          totalAmount: parseFloat(backendRequest.estimate.totalAmount),
          currency: backendRequest.estimate.currency,
          deliveryTimelineDays: backendRequest.estimate.deliveryTimelineDays,
          explanation: backendRequest.estimate.explanation,
          createdAt: backendRequest.estimate.createdAt,
          status: backendRequest.estimate.status as 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED',
          acceptedAt: backendRequest.estimate.acceptedAt,
          acceptedBy: backendRequest.estimate.acceptedBy
        } : undefined
      };

      return request;
    } catch (error: any) {
      console.error('Failed to classify request:', error.message);
      return rejectWithValue(error.message || 'Failed to classify request');
    }
  }
);

export const attachEstimateThunk = createAsyncThunk(
  'agency/attachEstimate',
  async ({ requestId, hours, hourlyRate, explanation, deliveryTimelineDays }: { requestId: string; hours: number; hourlyRate: number; explanation: string; deliveryTimelineDays: number }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, skip optimistic update - let the reducer handle it
      return rejectWithValue('Mock mode: attachEstimate not implemented');
    }

    try {
      const response = await agencyApi.support.attachEstimate(requestId, {
        estimatedHours: hours,
        hourlyRate,
        discount: 0,
        deliveryTimelineDays,
        explanation
      });
      const backendRequest = response.data as BackendSupportRequestResponse;

      const request: SupportRequest = {
        id: backendRequest.id,
        reference: backendRequest.reference,
        clientId: backendRequest.clientId,
        clientName: backendRequest.clientName,
        projectId: backendRequest.projectId,
        projectName: backendRequest.projectName,
        title: backendRequest.title,
        category: backendRequest.category as SupportCategory,
        description: backendRequest.description,
        businessImpact: backendRequest.businessImpact as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
        urgency: backendRequest.urgency as 'NORMAL' | 'URGENT',
        status: backendRequest.status as SupportRequestStatus,
        createdAt: backendRequest.createdAt,
        updatedAt: backendRequest.updatedAt,
        adminNotes: backendRequest.adminNotes,
        resolutionSummary: backendRequest.resolutionSummary,
        estimate: backendRequest.estimate ? {
          id: backendRequest.estimate.id,
          requestId: backendRequest.estimate.requestId,
          estimatedHours: parseFloat(backendRequest.estimate.estimatedHours),
          hourlyRate: parseFloat(backendRequest.estimate.hourlyRate),
          subtotal: parseFloat(backendRequest.estimate.subtotal),
          discount: parseFloat(backendRequest.estimate.discount),
          totalAmount: parseFloat(backendRequest.estimate.totalAmount),
          currency: backendRequest.estimate.currency,
          deliveryTimelineDays: backendRequest.estimate.deliveryTimelineDays,
          explanation: backendRequest.estimate.explanation,
          createdAt: backendRequest.estimate.createdAt,
          status: backendRequest.estimate.status as 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED',
          acceptedAt: backendRequest.estimate.acceptedAt,
          acceptedBy: backendRequest.estimate.acceptedBy
        } : undefined
      };

      return request;
    } catch (error: any) {
      console.error('Failed to attach estimate:', error.message);
      return rejectWithValue(error.message || 'Failed to attach estimate');
    }
  }
);

export const approveEstimateThunk = createAsyncThunk(
  'agency/approveEstimate',
  async ({ requestId, approvedBy }: { requestId: string; approvedBy: string }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, skip optimistic update - let the reducer handle it
      return rejectWithValue('Mock mode: approveEstimate not implemented');
    }

    try {
      const response = await agencyApi.support.approveEstimate(requestId, approvedBy);
      const backendRequest = response.data as BackendSupportRequestResponse;

      const request: SupportRequest = {
        id: backendRequest.id,
        reference: backendRequest.reference,
        clientId: backendRequest.clientId,
        clientName: backendRequest.clientName,
        projectId: backendRequest.projectId,
        projectName: backendRequest.projectName,
        title: backendRequest.title,
        category: backendRequest.category as SupportCategory,
        description: backendRequest.description,
        businessImpact: backendRequest.businessImpact as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
        urgency: backendRequest.urgency as 'NORMAL' | 'URGENT',
        status: backendRequest.status as SupportRequestStatus,
        createdAt: backendRequest.createdAt,
        updatedAt: backendRequest.updatedAt,
        adminNotes: backendRequest.adminNotes,
        resolutionSummary: backendRequest.resolutionSummary,
        estimate: backendRequest.estimate ? {
          id: backendRequest.estimate.id,
          requestId: backendRequest.estimate.requestId,
          estimatedHours: parseFloat(backendRequest.estimate.estimatedHours),
          hourlyRate: parseFloat(backendRequest.estimate.hourlyRate),
          subtotal: parseFloat(backendRequest.estimate.subtotal),
          discount: parseFloat(backendRequest.estimate.discount),
          totalAmount: parseFloat(backendRequest.estimate.totalAmount),
          currency: backendRequest.estimate.currency,
          deliveryTimelineDays: backendRequest.estimate.deliveryTimelineDays,
          explanation: backendRequest.estimate.explanation,
          createdAt: backendRequest.estimate.createdAt,
          status: backendRequest.estimate.status as 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED',
          acceptedAt: backendRequest.estimate.acceptedAt,
          acceptedBy: backendRequest.estimate.acceptedBy
        } : undefined
      };

      return request;
    } catch (error: any) {
      console.error('Failed to approve estimate:', error.message);
      return rejectWithValue(error.message || 'Failed to approve estimate');
    }
  }
);

export const clientApproveEstimateThunk = createAsyncThunk(
  'agency/clientApproveEstimate',
  async ({ requestId, approvedBy }: { requestId: string; approvedBy: string }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, return mock data
      return rejectWithValue('Mock mode: clientApproveEstimate not implemented');
    }

    try {
      const response = await agencyApi.support.approveMyEstimate(requestId, approvedBy);
      const backendRequest = response.data as BackendSupportRequestResponse;

      const request: SupportRequest = {
        id: backendRequest.id,
        reference: backendRequest.reference,
        clientId: backendRequest.clientId,
        clientName: backendRequest.clientName,
        projectId: backendRequest.projectId,
        projectName: backendRequest.projectName,
        title: backendRequest.title,
        category: backendRequest.category as SupportCategory,
        description: backendRequest.description,
        businessImpact: backendRequest.businessImpact as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
        urgency: backendRequest.urgency as 'NORMAL' | 'URGENT',
        status: backendRequest.status as SupportRequestStatus,
        createdAt: backendRequest.createdAt,
        updatedAt: backendRequest.updatedAt,
        adminNotes: backendRequest.adminNotes,
        resolutionSummary: backendRequest.resolutionSummary,
        estimate: backendRequest.estimate ? {
          id: backendRequest.estimate.id,
          requestId: backendRequest.estimate.requestId,
          estimatedHours: parseFloat(backendRequest.estimate.estimatedHours),
          hourlyRate: parseFloat(backendRequest.estimate.hourlyRate),
          subtotal: parseFloat(backendRequest.estimate.subtotal),
          discount: parseFloat(backendRequest.estimate.discount),
          totalAmount: parseFloat(backendRequest.estimate.totalAmount),
          currency: backendRequest.estimate.currency,
          deliveryTimelineDays: backendRequest.estimate.deliveryTimelineDays,
          explanation: backendRequest.estimate.explanation,
          createdAt: backendRequest.estimate.createdAt,
          status: backendRequest.estimate.status as 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED',
          acceptedAt: backendRequest.estimate.acceptedAt,
          acceptedBy: backendRequest.estimate.acceptedBy
        } : undefined
      };

      return request;
    } catch (error: any) {
      console.error('Failed to approve estimate:', error.message);
      return rejectWithValue(error.message || 'Failed to approve estimate');
    }
  }
);

export const updateRequestStatusThunk = createAsyncThunk(
  'agency/updateRequestStatus',
  async ({ requestId, status }: { requestId: string; status: SupportRequestStatus }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, skip optimistic update - let the reducer handle it
      return rejectWithValue('Mock mode: updateRequestStatus not implemented');
    }

    try {
      const response = await agencyApi.support.updateStatus(requestId, status);
      const backendRequest = response.data as BackendSupportRequestResponse;

      const request: SupportRequest = {
        id: backendRequest.id,
        reference: backendRequest.reference,
        clientId: backendRequest.clientId,
        clientName: backendRequest.clientName,
        projectId: backendRequest.projectId,
        projectName: backendRequest.projectName,
        title: backendRequest.title,
        category: backendRequest.category as SupportCategory,
        description: backendRequest.description,
        businessImpact: backendRequest.businessImpact as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
        urgency: backendRequest.urgency as 'NORMAL' | 'URGENT',
        status: backendRequest.status as SupportRequestStatus,
        createdAt: backendRequest.createdAt,
        updatedAt: backendRequest.updatedAt,
        adminNotes: backendRequest.adminNotes,
        resolutionSummary: backendRequest.resolutionSummary,
        estimate: backendRequest.estimate ? {
          id: backendRequest.estimate.id,
          requestId: backendRequest.estimate.requestId,
          estimatedHours: parseFloat(backendRequest.estimate.estimatedHours),
          hourlyRate: parseFloat(backendRequest.estimate.hourlyRate),
          subtotal: parseFloat(backendRequest.estimate.subtotal),
          discount: parseFloat(backendRequest.estimate.discount),
          totalAmount: parseFloat(backendRequest.estimate.totalAmount),
          currency: backendRequest.estimate.currency,
          deliveryTimelineDays: backendRequest.estimate.deliveryTimelineDays,
          explanation: backendRequest.estimate.explanation,
          createdAt: backendRequest.estimate.createdAt,
          status: backendRequest.estimate.status as 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED',
          acceptedAt: backendRequest.estimate.acceptedAt,
          acceptedBy: backendRequest.estimate.acceptedBy
        } : undefined
      };

      return request;
    } catch (error: any) {
      console.error('Failed to update request status:', error.message);
      return rejectWithValue(error.message || 'Failed to update request status');
    }
  }
);

// Async thunks for Invoices API
export const fetchInvoices = createAsyncThunk(
  'agency/fetchInvoices',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_INVOICES;
    }

    try {
      const response = await agencyApi.invoices.getAll();
      const backendInvoices = response.data as BackendInvoiceResponse[];

      // Map backend response to frontend Invoice type
      const invoices: Invoice[] = backendInvoices.map(bi => ({
        id: bi.id,
        invoiceNumber: bi.invoiceNumber,
        clientId: bi.clientId,
        clientName: bi.clientName,
        clientEmail: bi.clientEmail,
        issueDate: bi.issueDate,
        dueDate: bi.dueDate,
        lineItems: bi.lineItems.map((bli: any) => ({
          id: bli.id,
          description: bli.description,
          quantity: bli.quantity,
          unitPrice: parseFloat(bli.unitPrice),
          amount: parseFloat(bli.amount)
        })),
        subtotal: parseFloat(bi.subtotal),
        taxPercent: parseFloat(bi.taxPercent),
        taxAmount: parseFloat(bi.taxAmount),
        totalAmount: parseFloat(bi.totalAmount),
        currency: bi.currency,
        status: bi.status as 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID',
        paidAt: bi.paidAt,
        notes: bi.notes
      }));

      return invoices;
    } catch (error: any) {
      console.error('Failed to fetch invoices:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch invoices');
    }
  }
);

// Async thunk for client-specific invoices
export const fetchMyInvoices = createAsyncThunk(
  'agency/fetchMyInvoices',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_INVOICES;
    }

    try {
      const response = await agencyApi.invoices.getMyInvoices();
      const backendInvoices = response.data as BackendInvoiceResponse[];

      // Map backend response to frontend Invoice type
      const invoices: Invoice[] = backendInvoices.map(bi => ({
        id: bi.id,
        invoiceNumber: bi.invoiceNumber,
        clientId: bi.clientId,
        clientName: bi.clientName,
        clientEmail: bi.clientEmail,
        issueDate: bi.issueDate,
        dueDate: bi.dueDate,
        lineItems: bi.lineItems.map((bli: any) => ({
          id: bli.id,
          description: bli.description,
          quantity: bli.quantity,
          unitPrice: parseFloat(bli.unitPrice),
          amount: parseFloat(bli.amount)
        })),
        subtotal: parseFloat(bi.subtotal),
        taxPercent: parseFloat(bi.taxPercent),
        taxAmount: parseFloat(bi.taxAmount),
        totalAmount: parseFloat(bi.totalAmount),
        currency: bi.currency,
        status: bi.status as 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID',
        paidAt: bi.paidAt,
        notes: bi.notes
      }));

      return invoices;
    } catch (error: any) {
      console.error('Failed to fetch my invoices:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch my invoices');
    }
  }
);

export const markInvoicePaidThunk = createAsyncThunk(
  'agency/markInvoicePaid',
  async ({ invoiceId }: { invoiceId: string }, { rejectWithValue }) => {
    if (isMockMode) {
      // In mock mode, skip optimistic update - let the reducer handle it
      return rejectWithValue('Mock mode: markInvoicePaid not implemented');
    }

    try {
      const response = await agencyApi.invoices.markPaid(invoiceId, { status: 'PAID' });
      const backendInvoice = response.data as BackendInvoiceResponse;

      const invoice: Invoice = {
        id: backendInvoice.id,
        invoiceNumber: backendInvoice.invoiceNumber,
        clientId: backendInvoice.clientId,
        clientName: backendInvoice.clientName,
        clientEmail: backendInvoice.clientEmail,
        issueDate: backendInvoice.issueDate,
        dueDate: backendInvoice.dueDate,
        lineItems: backendInvoice.lineItems.map((bli: any) => ({
          id: bli.id,
          description: bli.description,
          quantity: bli.quantity,
          unitPrice: parseFloat(bli.unitPrice),
          amount: parseFloat(bli.amount)
        })),
        subtotal: parseFloat(backendInvoice.subtotal),
        taxPercent: parseFloat(backendInvoice.taxPercent),
        taxAmount: parseFloat(backendInvoice.taxAmount),
        totalAmount: parseFloat(backendInvoice.totalAmount),
        currency: backendInvoice.currency,
        status: backendInvoice.status as 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID',
        paidAt: backendInvoice.paidAt,
        notes: backendInvoice.notes
      };

      return invoice;
    } catch (error: any) {
      console.error('Failed to mark invoice as paid:', error.message);
      return rejectWithValue(error.message || 'Failed to mark invoice as paid');
    }
  }
);

// Async thunks for Outreach Studio
export const fetchOutreachDrafts = createAsyncThunk(
  'agency/fetchOutreachDrafts',
  async (_, { rejectWithValue }) => {
    if (isMockMode) {
      return INITIAL_OUTREACH_DRAFTS;
    }

    try {
      const response = await agencyApi.outreach.getDrafts();
      const backendDrafts = response.data as any[];

      // Map backend response to frontend OutreachDraft type
      const drafts: OutreachDraft[] = backendDrafts.map(bd => ({
        id: bd.id,
        leadId: bd.leadId,
        companyName: bd.companyName,
        recipientName: bd.recipientName,
        recipientEmail: bd.recipientEmail,
        subject: bd.subject,
        messageBody: bd.messageBody,
        personalizationEvidence: bd.personalizationEvidence,
        relevantService: bd.relevantService as ServiceCategory,
        riskFlags: bd.riskFlags || [],
        status: bd.status as 'DRAFT' | 'AWAITING_HUMAN_APPROVAL' | 'APPROVED' | 'SENT' | 'REJECTED',
        approvedByFounder: bd.approvedByFounder,
        approvedAt: bd.approvedAt,
        sentAt: bd.sentAt,
        updatedAt: bd.updatedAt
      }));

      return drafts;
    } catch (error: any) {
      console.error('Failed to fetch outreach drafts:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch outreach drafts');
    }
  }
);

export const approveOutreachDraftThunk = createAsyncThunk(
  'agency/approveOutreachDraft',
  async (draftId: string, { rejectWithValue }) => {
    if (isMockMode) {
      return draftId;
    }

    try {
      const response = await agencyApi.outreach.approveDraft(draftId);
      return response.data;
    } catch (error: any) {
      console.error('Failed to approve outreach draft:', error.message);
      return rejectWithValue(error.message || 'Failed to approve outreach draft');
    }
  }
);

export const sendOutreachDraftThunk = createAsyncThunk(
  'agency/sendOutreachDraft',
  async (draftId: string, { rejectWithValue }) => {
    if (isMockMode) {
      return draftId;
    }

    try {
      const response = await agencyApi.outreach.sendDraft(draftId);
      return response.data;
    } catch (error: any) {
      console.error('Failed to send outreach draft:', error.message);
      return rejectWithValue(error.message || 'Failed to send outreach draft');
    }
  }
);

const agencySlice = createSlice({
  name: 'agency',
  initialState: initialAgencyState,
  reducers: {
    // A. Public Inquiry Submission (local-only for mock mode)
    submitPublicInquiryLocal: (state, action: PayloadAction<PublicInquiryFormData>) => {
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

    // B. Client Support Ticket Creation (local/sync - for mock mode)
    createSupportRequestLocal: (state, action: PayloadAction<{
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

    // C. Admin Classify Support Request (local/sync)
    classifyRequestLocal: (state, action: PayloadAction<{
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

    // D. Admin Attach Estimate (local/sync)
    attachEstimateLocal: (state, action: PayloadAction<{
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

    // E. Client Approve Estimate (Triggers Status Update, Task, and Invoice) (local/sync)
    clientApproveEstimateLocal: (state, action: PayloadAction<{ requestId: string; clientUser: string }>) => {
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

    // F. Update Support Request Status (local/sync)
    updateRequestStatusLocal: (state, action: PayloadAction<{ requestId: string; status: SupportRequestStatus }>) => {
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

    // Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoadingProjects = true;
        state.projectsError = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoadingProjects = false;
        state.projects = action.payload;
        state.projectsError = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoadingProjects = false;
        state.projectsError = action.payload as string || 'Failed to fetch projects';
      })
      .addCase(fetchMyProjects.pending, (state) => {
        state.isLoadingProjects = true;
        state.projectsError = null;
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.isLoadingProjects = false;
        state.projects = action.payload;
        state.projectsError = null;
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.isLoadingProjects = false;
        state.projectsError = action.payload as string || 'Failed to fetch my projects';
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProjectStatus.rejected, (state, action) => {
        // Optional: set error state for failed status updates
        console.error('Failed to update project status:', action.payload);
      });

    // Support Requests
    builder
      .addCase(fetchSupportRequests.pending, (state) => {
        state.isLoadingRequests = true;
        state.requestsError = null;
      })
      .addCase(fetchSupportRequests.fulfilled, (state, action) => {
        state.isLoadingRequests = false;
        state.requests = action.payload;
        state.requestsError = null;
      })
      .addCase(fetchSupportRequests.rejected, (state, action) => {
        state.isLoadingRequests = false;
        state.requestsError = action.payload as string || 'Failed to fetch support requests';
      })
      .addCase(fetchMySupportRequests.pending, (state) => {
        state.isLoadingRequests = true;
        state.requestsError = null;
      })
      .addCase(fetchMySupportRequests.fulfilled, (state, action) => {
        state.isLoadingRequests = false;
        state.requests = action.payload;
        state.requestsError = null;
      })
      .addCase(fetchMySupportRequests.rejected, (state, action) => {
        state.isLoadingRequests = false;
        state.requestsError = action.payload as string || 'Failed to fetch my support requests';
      })
      .addCase(createSupportRequestThunk.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      .addCase(createSupportRequestThunk.rejected, (state, action) => {
        console.error('Failed to create support request:', action.payload);
      })
      .addCase(submitPublicInquiryThunk.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })
      .addCase(submitPublicInquiryThunk.rejected, (state, action) => {
        console.error('Failed to submit public inquiry:', action.payload);
      })
      .addCase(createMySupportRequestThunk.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      .addCase(createMySupportRequestThunk.rejected, (state, action) => {
        console.error('Failed to create support request:', action.payload);
      })
      .addCase(classifyRequestThunk.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(classifyRequestThunk.rejected, (state, action) => {
        // Optional: set error state for failed classification
        console.error('Failed to classify request:', action.payload);
      })
      .addCase(attachEstimateThunk.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(attachEstimateThunk.rejected, (state, action) => {
        // Optional: set error state for failed estimate attachment
        console.error('Failed to attach estimate:', action.payload);
      })
      .addCase(approveEstimateThunk.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(approveEstimateThunk.rejected, (state, action) => {
        // Optional: set error state for failed estimate approval
        console.error('Failed to approve estimate:', action.payload);
      })
      .addCase(clientApproveEstimateThunk.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(clientApproveEstimateThunk.rejected, (state, action) => {
        // Optional: set error state for failed estimate approval
        console.error('Failed to approve estimate:', action.payload);
      })
      .addCase(updateRequestStatusThunk.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(updateRequestStatusThunk.rejected, (state, action) => {
        // Optional: set error state for failed status updates
        console.error('Failed to update request status:', action.payload);
      });

    // Outreach
    builder
      .addCase(fetchOutreachDrafts.pending, (state) => {
        state.isLoadingLeads = true;
      })
      .addCase(fetchOutreachDrafts.fulfilled, (state, action) => {
        state.isLoadingLeads = false;
        state.outreachDrafts = action.payload;
      })
      .addCase(fetchOutreachDrafts.rejected, (state, action) => {
        state.isLoadingLeads = false;
        console.error('Failed to fetch outreach drafts:', action.payload);
      })
      .addCase(approveOutreachDraftThunk.fulfilled, (state, action) => {
        const payload = action.payload as { id: string; status: string; approvedByFounder: boolean; approvedAt: string | null; updatedAt: string };
        const draft = state.outreachDrafts.find(d => d.id === payload.id);
        if (draft) {
          draft.status = payload.status as 'DRAFT' | 'AWAITING_HUMAN_APPROVAL' | 'APPROVED' | 'SENT' | 'REJECTED';
          draft.approvedByFounder = payload.approvedByFounder;
          draft.approvedAt = payload.approvedAt || undefined;
          draft.updatedAt = payload.updatedAt;
        }
      })
      .addCase(approveOutreachDraftThunk.rejected, (state, action) => {
        console.error('Failed to approve outreach draft:', action.payload);
      })
      .addCase(sendOutreachDraftThunk.fulfilled, (state, action) => {
        const payload = action.payload as { id: string; status: string; sentAt: string | null; updatedAt: string };
        const draft = state.outreachDrafts.find(d => d.id === payload.id);
        if (draft) {
          draft.status = payload.status as 'DRAFT' | 'AWAITING_HUMAN_APPROVAL' | 'APPROVED' | 'SENT' | 'REJECTED';
          draft.sentAt = payload.sentAt || undefined;
          draft.updatedAt = payload.updatedAt;
        }
      })
      .addCase(sendOutreachDraftThunk.rejected, (state, action) => {
        console.error('Failed to send outreach draft:', action.payload);
      });

    // Invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoadingInvoices = true;
        state.invoicesError = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoadingInvoices = false;
        state.invoices = action.payload;
        state.invoicesError = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoadingInvoices = false;
        state.invoicesError = action.payload as string || 'Failed to fetch invoices';
      })
      .addCase(fetchMyInvoices.pending, (state) => {
        state.isLoadingInvoices = true;
        state.invoicesError = null;
      })
      .addCase(fetchMyInvoices.fulfilled, (state, action) => {
        state.isLoadingInvoices = false;
        state.invoices = action.payload;
        state.invoicesError = null;
      })
      .addCase(fetchMyInvoices.rejected, (state, action) => {
        state.isLoadingInvoices = false;
        state.invoicesError = action.payload as string || 'Failed to fetch my invoices';
      })
      .addCase(markInvoicePaidThunk.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(markInvoicePaidThunk.rejected, (state, action) => {
        // Optional: set error state for failed payment marking
        console.error('Failed to mark invoice as paid:', action.payload);
      });

    // Proposals
    builder
      .addCase(fetchMyProposals.fulfilled, (state, action) => {
        state.proposals = action.payload;
      })
      .addCase(fetchMyProposals.rejected, (state, action) => {
        console.error('Failed to fetch proposals:', action.payload);
      })
      .addCase(recordProposalDecision.fulfilled, (state, action) => {
        const index = state.proposals.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.proposals[index] = action.payload;
        }
      })
      .addCase(recordProposalDecision.rejected, (state, action) => {
        console.error('Failed to record proposal decision:', action.payload);
      });
  }
});

export const {
  submitPublicInquiryLocal,
  createSupportRequestLocal,
  classifyRequestLocal,
  attachEstimateLocal,
  clientApproveEstimateLocal,
  updateRequestStatusLocal,
  updateOutreachDraft,
  updateLeadStage,
  triggerWorkflowRun,
  payInvoice,
  toggleTaskStatus
} = agencySlice.actions;

// Export async thunks with proper names
export const classifyRequest = classifyRequestThunk;
export const attachEstimate = attachEstimateThunk;
export const approveEstimate = approveEstimateThunk;
export const createSupportRequest = createSupportRequestThunk;
export const createMySupportRequest = createMySupportRequestThunk;
export const updateRequestStatus = updateRequestStatusThunk;
export const clientApproveEstimate = clientApproveEstimateThunk;
export const markInvoicePaid = markInvoicePaidThunk;
export const approveOutreachDraft = approveOutreachDraftThunk;
export const sendApprovedOutreach = sendOutreachDraftThunk;
export const submitPublicInquiry = submitPublicInquiryThunk;

export default agencySlice.reducer;
