export type ServiceCategory =
  | 'SOFTWARE_DEV'
  | 'WEBSITE_MAINTENANCE'
  | 'TECHNICAL_SEO'
  | 'BUSINESS_AUTOMATION'
  | 'AI_INTEGRATION';

// Backend response types for Projects API
export interface BackendProjectResponse {
  id: string;
  reference: string;
  name: string;
  clientId: string;
  clientName: string;
  serviceCategory: string;
  description: string;
  status: string;
  progressPercent: number;
  startDate: string;
  targetCompletionDate: string;
  budgetTotal: number;
  budgetSpent: number;
  milestones: BackendMilestoneResponse[];
  deliverables: string[];
  assignedLead: string;
  updatedAt: string;
}

export interface BackendMilestoneResponse {
  id: string;
  title: string;
  dueDate: string;
  status: string;
}

export interface Client {
  id: string;
  name: string;
  legalName: string;
  contactEmail: string;
  phone?: string;
  website: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  retainerTier?: 'ESSENTIAL_MAINTENANCE' | 'PRO_GROWTH' | 'NONE';
  monthlyRetainerHours?: number;
  consumedHoursCurrentMonth?: number;
  contractStartDate: string;
  accountManager: string;
  billingCurrency: 'USD' | 'EUR' | 'GBP';
  notes?: string;
}

export interface BackendClientResponse {
  id: string;
  name: string;
  legalName: string;
  contactEmail: string;
  phone?: string;
  website: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  retainerTier?: 'ESSENTIAL_MAINTENANCE' | 'PRO_GROWTH' | 'NONE';
  monthlyRetainerHours?: number;
  consumedHoursCurrentMonth?: number;
  contractStartDate: string;
  accountManager: string;
  billingCurrency: 'USD' | 'EUR' | 'GBP';
  notes?: string;
}

export type ProjectStatus = 'DISCOVERY' | 'PLANNED' | 'IN_PROGRESS' | 'WAITING_FOR_CLIENT' | 'IN_REVIEW' | 'COMPLETED' | 'ON_HOLD';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Project {
  id: string;
  reference: string;
  name: string;
  clientId: string;
  clientName: string;
  serviceCategory: ServiceCategory;
  description: string;
  status: ProjectStatus;
  progressPercent: number;
  startDate: string;
  targetCompletionDate: string;
  budgetTotal: number;
  budgetSpent: number;
  milestones: ProjectMilestone[];
  deliverables: string[];
  assignedLead: string;
  updatedAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isClientVisible: boolean;
  assignedTo: string;
  requiresClientAction?: boolean;
}

export type SupportCategory = 'INCLUDED_SUPPORT' | 'PAID_AD_HOC_SUPPORT' | 'NEW_PROJECT' | 'WARRANTY_OR_DEFECT_REVIEW';
export type SupportRequestStatus = 'NEW' | 'NEEDS_CLASSIFICATION' | 'ESTIMATE_PENDING' | 'AWAITING_CLIENT_APPROVAL' | 'READY_TO_START' | 'IN_PROGRESS' | 'WAITING_FOR_CLIENT' | 'COMPLETED';

export interface SupportEstimate {
  id: string;
  requestId: string;
  estimatedHours: number;
  hourlyRate: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  currency: string;
  deliveryTimelineDays: number;
  explanation: string;
  createdAt: string;
  status: 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED';
  acceptedAt?: string;
  acceptedBy?: string;
}

export interface SupportRequest {
  id: string;
  reference: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  title: string;
  category: SupportCategory;
  description: string;
  businessImpact: 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER';
  urgency: 'NORMAL' | 'URGENT';
  status: SupportRequestStatus;
  createdAt: string;
  updatedAt: string;
  estimate?: SupportEstimate;
  adminNotes?: string;
  resolutionSummary?: string;
}

// Backend response types for Support Requests API
export interface BackendSupportEstimateResponse {
  id: string;
  requestId: string;
  estimatedHours: string;
  hourlyRate: string;
  subtotal: string;
  discount: string;
  totalAmount: string;
  currency: string;
  deliveryTimelineDays: number;
  explanation: string;
  status: string;
  createdAt: string;
  acceptedAt?: string;
  acceptedBy?: string;
}

export interface BackendSupportRequestResponse {
  id: string;
  reference: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  title: string;
  category: string;
  description: string;
  businessImpact: string;
  urgency: string;
  status: string;
  adminNotes?: string;
  resolutionSummary?: string;
  createdAt: string;
  updatedAt: string;
  estimate?: BackendSupportEstimateResponse;
}

export type LeadPipelineStage = 'DISCOVERED' | 'RESEARCHING' | 'QUALIFIED' | 'NEEDS_REVIEW' | 'READY_FOR_OUTREACH' | 'OUTREACH_APPROVED' | 'CONTACTED' | 'REPLIED' | 'MEETING_SCHEDULED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'DO_NOT_CONTACT';

export interface LeadScoreBreakdown {
  businessFit: number;
  evidenceOfNeed: number;
  contactability: number;
  serviceRelevance: number;
  totalScore: number;
}

export interface Lead {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactTitle?: string;
  source: 'INBOUND_INQUIRY' | 'PUBLIC_DIRECTORY' | 'TECH_AUDIT_DISCOVERY' | 'REFERRAL';
  sourceUrl?: string;
  discoveredDate: string;
  targetService: ServiceCategory;
  identifiedProblem: string;
  researchSummary: string;
  qualificationScore: number;
  qualificationBreakdown: LeadScoreBreakdown;
  pipelineStage: LeadPipelineStage;
  lastContactDate?: string;
  nextAction: string;
  doNotContact: boolean;
  notes: string;
  inquiryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCrmLeadResponse {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactTitle?: string;
  source: 'INBOUND_INQUIRY' | 'PUBLIC_DIRECTORY' | 'TECH_AUDIT_DISCOVERY' | 'REFERRAL';
  sourceUrl?: string;
  discoveredDate: string;
  targetService: ServiceCategory;
  identifiedProblem: string;
  researchSummary: string;
  qualificationScore: number;
  businessFitScore?: number;
  evidenceOfNeedScore?: number;
  contactabilityScore?: number;
  serviceRelevanceScore?: number;
  pipelineStage: LeadPipelineStage;
  lastContactDate?: string;
  nextAction: string;
  doNotContact: boolean;
  notes: string;
  inquiryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutreachDraft {
  id: string;
  leadId: string;
  companyName: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  messageBody: string;
  personalizationEvidence: string;
  relevantService: ServiceCategory;
  riskFlags: string[];
  status: 'DRAFT' | 'AWAITING_HUMAN_APPROVAL' | 'APPROVED' | 'SENT' | 'REJECTED';
  approvedByFounder?: boolean;
  approvedAt?: string;
  sentAt?: string;
}

export interface Proposal {
  id: string;
  proposalNumber: string;
  clientId: string;
  clientName: string;
  title: string;
  serviceCategory: ServiceCategory;
  scopeSummary: string;
  deliverables: string[];
  exclusions: string[];
  totalPrice: number;
  currency: string;
  paymentMilestones: { description: string; percentage: number; amount: number }[];
  timelineDuration: string;
  validUntil: string;
  status: 'DRAFT' | 'SENT_FOR_REVIEW' | 'ACCEPTED' | 'DECLINED';
  acceptedAt?: string;
  acceptedBy?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Backend response types for Invoices API
export interface BackendInvoiceLineItemResponse {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string; // BigDecimal from backend
  amount: string; // BigDecimal from backend
}

export interface BackendInvoiceResponse {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  lineItems: BackendInvoiceLineItemResponse[];
  subtotal: string; // BigDecimal from backend
  taxPercent: string; // BigDecimal from backend
  taxAmount: string; // BigDecimal from backend
  totalAmount: string; // BigDecimal from backend
  currency: string;
  status: string;
  paidAt?: string;
  notes?: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID';
  paidAt?: string;
  notes?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  isEnabled: boolean;
  lastRunAt?: string;
  lastRunStatus?: 'SUCCESS' | 'FAILED';
  runCount: number;
  requiresHumanApproval: boolean;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: import('./auth.ts').UserRole;
  action: string;
  entityType: 'INQUIRY' | 'LEAD' | 'REQUEST' | 'ESTIMATE' | 'PROPOSAL' | 'INVOICE' | 'PROJECT';
  entityId: string;
  details: string;
}

export interface PublicInquiryFormData {
  name: string;
  businessEmail: string;
  company: string;
  website?: string;
  serviceCategory: ServiceCategory;
  projectType: string;
  budgetRange?: string;
  preferredTimeline?: string;
  projectDescription: string;
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'DISCOVERY_CALL';
  consent: boolean;
}

export interface AgencyState {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  requests: SupportRequest[];
  leads: Lead[];
  outreachDrafts: OutreachDraft[];
  proposals: Proposal[];
  invoices: Invoice[];
  workflows: WorkflowDefinition[];
  activities: ActivityEvent[];
  lastInquiryReference?: string;
  // API loading and error states
  isLoadingClients: boolean;
  isLoadingLeads: boolean;
  isLoadingProjects: boolean;
  isLoadingRequests: boolean;
  isLoadingInvoices: boolean;
  clientsError: string | null;
  leadsError: string | null;
  projectsError: string | null;
  requestsError: string | null;
  invoicesError: string | null;
}
