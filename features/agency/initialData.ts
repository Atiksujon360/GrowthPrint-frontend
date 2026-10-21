import type {
  Client,
  Project,
  Task,
  SupportRequest,
  Lead,
  OutreachDraft,
  Proposal,
  Invoice,
  WorkflowDefinition,
  ActivityEvent
} from '../../types/index.ts';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-meridian',
    name: 'Meridian Retail Group',
    legalName: 'Meridian Retail Enterprises LLC',
    contactEmail: 'sarah.chen@meridianretail.com',
    phone: '+1 (415) 890-4421',
    website: 'https://meridianretail.example.com',
    status: 'ACTIVE',
    retainerTier: 'PRO_GROWTH',
    monthlyRetainerHours: 15,
    consumedHoursCurrentMonth: 8.5,
    contractStartDate: '2025-06-01',
    accountManager: 'Alex Mercer (Founder)',
    billingCurrency: 'USD',
    notes: 'Fast-moving omnichannel retailer. Sarah is laser-focused on zero checkout friction during Friday flash sales and clean inventory sync across their 4 warehouses.'
  },
  {
    id: 'client-nexus',
    name: 'Nexus Logistics Systems',
    legalName: 'Nexus Global Transport Ltd',
    contactEmail: 'marcus.vance@nexuslogistics.example.com',
    phone: '+1 (312) 554-9022',
    website: 'https://nexuslogistics.example.com',
    status: 'ACTIVE',
    retainerTier: 'ESSENTIAL_MAINTENANCE',
    monthlyRetainerHours: 5,
    consumedHoursCurrentMonth: 2,
    contractStartDate: '2025-09-15',
    accountManager: 'Alex Mercer (Founder)',
    billingCurrency: 'USD',
    notes: 'Regional freight and carrier network. Marcus values direct, concise engineering updates and quick turnarounds when partner carriers update their EDI formats.'
  },
  {
    id: 'client-altura',
    name: 'Altura Health Tech',
    legalName: 'Altura Health Technologies Inc',
    contactEmail: 'elena.rostova@alturahealth.example.com',
    phone: '+1 (617) 431-8819',
    website: 'https://alturahealth.example.com',
    status: 'ACTIVE',
    retainerTier: 'NONE',
    monthlyRetainerHours: 0,
    consumedHoursCurrentMonth: 0,
    contractStartDate: '2026-01-10',
    accountManager: 'Alex Mercer (Founder)',
    billingCurrency: 'USD',
    notes: 'Telehealth platform for specialized clinics. Wrapped up their Core Web Vitals optimization in February (hit 98 on Lighthouse). Elena recently referred Nordic Supply to us.'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-meridian-portal',
    reference: 'GP-PRJ-2026-001',
    name: 'Meridian B2B Wholesale Portal & Warehouse Sync',
    clientId: 'client-meridian',
    clientName: 'Meridian Retail Group',
    serviceCategory: 'SOFTWARE_DEV',
    description: 'Replacing slow phone and spreadsheet orders with a responsive B2B portal. Syncs live inventory across 4 regional warehouses and notifies buyers with instant tracking links.',
    status: 'IN_PROGRESS',
    progressPercent: 68,
    startDate: '2026-01-15',
    targetCompletionDate: '2026-04-30',
    budgetTotal: 38500,
    budgetSpent: 26200,
    milestones: [
      { id: 'm1', title: 'Data Architecture & Client Journey Maps', dueDate: '2026-02-01', status: 'COMPLETED' },
      { id: 'm2', title: 'Warehouse Inventory Integration Gateway', dueDate: '2026-03-01', status: 'COMPLETED' },
      { id: 'm3', title: 'B2B Self-Service Ordering & Checkout', dueDate: '2026-04-05', status: 'IN_PROGRESS' },
      { id: 'm4', title: 'Full Load Testing & Team Handover', dueDate: '2026-04-30', status: 'PENDING' }
    ],
    deliverables: [
      'Responsive Web Ordering Portal (Next.js / TypeScript)',
      'Real-Time Warehouse Inventory Sync Service',
      'Automated Order Status & Tracking Webhooks',
      'Operations Runbook & Staff Video Walkthrough'
    ],
    assignedLead: 'Alex Mercer (Founder)',
    updatedAt: '2026-10-18T14:30:00Z'
  },
  {
    id: 'proj-nexus-routing',
    reference: 'GP-PRJ-2025-014',
    name: 'Nexus Carrier EDI Ingestion & Dock Queue System',
    clientId: 'client-nexus',
    clientName: 'Nexus Logistics Systems',
    serviceCategory: 'BUSINESS_AUTOMATION',
    description: 'Automates intake of bills-of-lading, updates driver dock assignments in real time, and eliminates manual data entry to shave 35+ minutes off truck turnaround times.',
    status: 'IN_PROGRESS',
    progressPercent: 82,
    startDate: '2025-11-01',
    targetCompletionDate: '2026-03-15',
    budgetTotal: 24000,
    budgetSpent: 19500,
    milestones: [
      { id: 'm10', title: 'EDI 204/214 Document Parser & Validation Queue', dueDate: '2025-12-15', status: 'COMPLETED' },
      { id: 'm11', title: 'Dynamic Dock Scheduling Rules Engine', dueDate: '2026-01-20', status: 'COMPLETED' },
      { id: 'm12', title: 'Carrier Webhook Resiliency & Replay Tools', dueDate: '2026-03-10', status: 'IN_PROGRESS' }
    ],
    deliverables: [
      'Automated Bill-of-Lading Extraction Pipeline',
      'Dispatcher Dock Queue Board',
      'Automated Driver SMS Status Notification Gateway',
      'Failover & Replay Documentation for Operations Team'
    ],
    assignedLead: 'Alex Mercer (Founder)',
    updatedAt: '2026-10-19T09:15:00Z'
  },
  {
    id: 'proj-altura-seo',
    reference: 'GP-PRJ-2026-003',
    name: 'Altura Core Web Vitals Overhaul & Medical Schema',
    clientId: 'client-altura',
    clientName: 'Altura Health Tech',
    serviceCategory: 'TECHNICAL_SEO',
    description: 'Complete performance rework of Altura’s patient-facing site: reduced Largest Contentful Paint from 4.2s to 1.1s, resolved hydration lag, and deployed clinical Schema.org structured data.',
    status: 'COMPLETED',
    progressPercent: 100,
    startDate: '2026-01-10',
    targetCompletionDate: '2026-02-28',
    budgetTotal: 9200,
    budgetSpent: 9200,
    milestones: [
      { id: 'm20', title: 'Technical Crawl & Accessibility Baseline', dueDate: '2026-01-20', status: 'COMPLETED' },
      { id: 'm21', title: 'SSR Hydration Fixes & Asset Pipeline Tune', dueDate: '2026-02-15', status: 'COMPLETED' },
      { id: 'm22', title: 'Post-Launch Verification & Lighthouse 98 Sign-Off', dueDate: '2026-02-28', status: 'COMPLETED' }
    ],
    deliverables: [
      'Core Web Vitals Benchmark Report (Lighthouse 98/100)',
      'Verified Schema.org Medical Entity Structured Data',
      'Automated Image Optimization & Edge Caching Config'
    ],
    assignedLead: 'Alex Mercer (Founder)',
    updatedAt: '2026-02-28T18:00:00Z'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-meridian-portal',
    projectName: 'Meridian B2B Wholesale Portal',
    clientId: 'client-meridian',
    title: 'Review and approve sandbox warehouse test orders',
    description: 'Double-check that the test order IDs in our staging environment match Meridian internal ERP records before we switch over live warehouse traffic.',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    dueDate: '2026-10-22',
    isClientVisible: true,
    assignedTo: 'Sarah Chen (Meridian)',
    requiresClientAction: true
  },
  {
    id: 'task-2',
    projectId: 'proj-meridian-portal',
    projectName: 'Meridian B2B Wholesale Portal',
    clientId: 'client-meridian',
    title: 'Add 15-second Redis caching on checkout SKU query',
    description: 'Keep the database happy during flash sale traffic rushes by caching available inventory counts for high-velocity SKUs.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-10-21',
    isClientVisible: false,
    assignedTo: 'Alex Mercer (GrowthPrint)'
  },
  {
    id: 'task-3',
    projectId: 'proj-nexus-routing',
    projectName: 'Nexus Carrier EDI Ingestion',
    clientId: 'client-nexus',
    title: 'Share carrier webhook replay guide with Marcus',
    description: 'A simple, step-by-step checklist the dispatch team can follow if a partner carrier API ever drops offline.',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-10-25',
    isClientVisible: true,
    assignedTo: 'Alex Mercer (GrowthPrint)',
    requiresClientAction: false
  }
];

export const INITIAL_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: 'req-001',
    reference: 'GP-REQ-2026-088',
    clientId: 'client-meridian',
    clientName: 'Meridian Retail Group',
    projectId: 'proj-meridian-portal',
    projectName: 'Meridian B2B Wholesale Portal',
    title: 'Checkout slowdown during yesterday’s 4 PM flash sale',
    category: 'PAID_AD_HOC_SUPPORT',
    description: 'Hi team, during yesterday’s promotion at 4 PM, checkout load times jumped to around 3.8 seconds for several shoppers. Could we get the database indexes tuned and the connection pool adjusted before this weekend’s campaign?',
    businessImpact: 'CRITICAL_BLOCKER',
    urgency: 'URGENT',
    status: 'AWAITING_CLIENT_APPROVAL',
    createdAt: '2026-10-18T16:20:00Z',
    updatedAt: '2026-10-19T08:30:00Z',
    adminNotes: 'Investigated query logs: found an unindexed query on promotional coupon validations that slowed down under concurrent cart checkouts. Fixable in ~6 hours with a compound index and batch query.',
    estimate: {
      id: 'est-001',
      requestId: 'req-001',
      estimatedHours: 6,
      hourlyRate: 135,
      subtotal: 810,
      discount: 0,
      totalAmount: 810,
      currency: 'USD',
      deliveryTimelineDays: 1,
      explanation: '6 engineering hours: add compound index on promotion_skus, refactor coupon checks to a single batch query, and run a 2,500-concurrent checkout load test to ensure it stays fast.',
      createdAt: '2026-10-19T08:30:00Z',
      status: 'PENDING_APPROVAL'
    }
  },
  {
    id: 'req-002',
    reference: 'GP-REQ-2026-082',
    clientId: 'client-meridian',
    clientName: 'Meridian Retail Group',
    projectId: 'proj-meridian-portal',
    projectName: 'Meridian B2B Wholesale Portal',
    title: 'Monthly security checkup and dependency review (October)',
    category: 'INCLUDED_SUPPORT',
    description: 'Routine monthly retainer checkup: security audit, Node 22 runtime updates, and asset bundle size check.',
    businessImpact: 'LOW',
    urgency: 'NORMAL',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-17T11:00:00Z',
    adminNotes: 'Covered under Meridian’s Pro Growth retainer (8.5 of 15 hours utilized this month).'
  },
  {
    id: 'req-003',
    reference: 'GP-REQ-2026-079',
    clientId: 'client-nexus',
    clientName: 'Nexus Logistics Systems',
    projectId: 'proj-nexus-routing',
    projectName: 'Nexus Carrier EDI Ingestion',
    title: 'Update EDI 214 format for Midwest regional hubs',
    category: 'PAID_AD_HOC_SUPPORT',
    description: 'One of our carrier partners updated their EDI 214 shipment layout to include trailer refrigeration telemetry. We need the parser adjusted to read these extra fields.',
    businessImpact: 'MEDIUM',
    urgency: 'NORMAL',
    status: 'READY_TO_START',
    createdAt: '2026-10-14T09:00:00Z',
    updatedAt: '2026-10-16T14:00:00Z',
    adminNotes: 'Estimate of 4 hours ($540) approved by Marcus Vance on Oct 16. Slated for this week’s engineering sprint.'
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-vanguard',
    companyName: 'Vanguard Freight Network',
    website: 'https://vanguardfreight.example.com',
    industry: 'Transportation & Logistics',
    location: 'Chicago, IL, United States',
    contactName: 'David Sterling',
    contactEmail: 'd.sterling@vanguardfreight.example.com',
    contactTitle: 'VP of Fleet Operations',
    source: 'TECH_AUDIT_DISCOVERY',
    sourceUrl: 'https://public-freight-directory.example.com/company/vanguard',
    discoveredDate: '2026-10-17',
    targetService: 'BUSINESS_AUTOMATION',
    identifiedProblem: 'Operating 14 busy cross-dock distribution hubs using manual spreadsheets; drivers often wait 30-45 minutes just to get manifest sign-offs.',
    researchSummary: 'Vanguard grew 35% this past year and is hiring terminal dispatchers. Their public carrier intake form is completely unautomated, creating an obvious operations bottleneck.',
    qualificationScore: 92,
    qualificationBreakdown: {
      businessFit: 24,
      evidenceOfNeed: 24,
      contactability: 21,
      serviceRelevance: 23,
      totalScore: 92
    },
    pipelineStage: 'READY_FOR_OUTREACH',
    nextAction: 'Review drafted note mentioning terminal wait times and sign off to send.',
    doNotContact: false,
    notes: 'Very strong fit. The bottleneck they’re dealing with matches almost line-for-line what we solved for Nexus Logistics.'
  },
  {
    id: 'lead-kestrel',
    companyName: 'Kestrel Dental Care Network',
    website: 'https://kestreldental.example.com',
    industry: 'Healthcare / Dental Services',
    location: 'Denver, CO, United States',
    contactName: 'Dr. Rachel Adams',
    contactEmail: 'radams@kestreldental.example.com',
    contactTitle: 'Managing Partner',
    source: 'PUBLIC_DIRECTORY',
    discoveredDate: '2026-10-18',
    targetService: 'SOFTWARE_DEV',
    identifiedProblem: '5 dental clinics with disconnected scheduling systems; patient onboarding still relies on printed clipboards and PDFs, leading to high no-show rates.',
    researchSummary: 'Patient portal is an embedded iframe that breaks on mobile devices (44/100 accessibility). Dr. Adams mentioned publicly that patient experience is their top priority this year.',
    qualificationScore: 84,
    qualificationBreakdown: {
      businessFit: 22,
      evidenceOfNeed: 23,
      contactability: 19,
      serviceRelevance: 20,
      totalScore: 84
    },
    pipelineStage: 'QUALIFIED',
    nextAction: 'Prepare a warm note focusing on a unified mobile-friendly booking app and automated appointment reminders.',
    doNotContact: false,
    notes: 'Opportunity for a clean Next.js patient intake web app plus SMS appointment confirmations.'
  },
  {
    id: 'lead-nordic',
    companyName: 'Nordic Supply Corp',
    website: 'https://nordicsupply.example.com',
    industry: 'Industrial Equipment Distribution',
    location: 'Minneapolis, MN, United States',
    contactName: 'Thomas Lindqvist',
    contactEmail: 'tlindqvist@nordicsupply.example.com',
    contactTitle: 'Director of Technology',
    source: 'REFERRAL',
    discoveredDate: '2026-10-19',
    targetService: 'AI_INTEGRATION',
    identifiedProblem: 'Accounts payable team manually re-types over 450 vendor invoice PDFs every week into their legacy ERP system.',
    researchSummary: 'Warm referral from Elena at Altura Health. Looking for an intelligent document parser that pulls invoice line items and lets the AP team verify and post with one click.',
    qualificationScore: 89,
    qualificationBreakdown: {
      businessFit: 23,
      evidenceOfNeed: 24,
      contactability: 22,
      serviceRelevance: 20,
      totalScore: 89
    },
    pipelineStage: 'MEETING_SCHEDULED',
    lastContactDate: '2026-10-19',
    nextAction: 'Discovery call scheduled for Thursday Oct 22 at 2:00 PM CST.',
    doNotContact: false,
    notes: 'Warm inbound referral with strong built-in trust through Altura Health.'
  }
];

export const INITIAL_OUTREACH_DRAFTS: OutreachDraft[] = [
  {
    id: 'draft-vanguard-01',
    leadId: 'lead-vanguard',
    companyName: 'Vanguard Freight Network',
    recipientName: 'David Sterling',
    recipientEmail: 'd.sterling@vanguardfreight.example.com',
    subject: 'Reducing cross-dock dispatch wait times across Vanguard’s 14 terminals',
    messageBody: `Hi David,\n\nI noticed Vanguard's recent expansion across the Midwest—congrats on opening the new terminals.\n\nI’m reaching out because we recently worked with Nexus Logistics to tackle a similar operational bottleneck: their dispatchers were spending hours re-typing manifests across spreadsheets, and drivers were waiting up to 45 minutes at the docks. We built an automated EDI ingestion pipeline that cut those driver check-in delays by 35% in the first month.\n\nGiven Vanguard's terminal volume, I suspect your team might be feeling some of that same friction.\n\nWould you be open to a brief 15-minute call next Tuesday or Wednesday to see if what we built for Nexus could be helpful for Vanguard’s cross-dock operations?\n\nWarm regards,\nAlex Mercer\nFounder & Principal Engineer, GrowthPrint`,
    personalizationEvidence: 'Verified 14 terminal locations from Vanguard’s public terminal directory; noted recent operations hiring push for dispatchers in Chicago and Indianapolis.',
    relevantService: 'BUSINESS_AUTOMATION',
    riskFlags: [],
    status: 'AWAITING_HUMAN_APPROVAL',
    approvedByFounder: false
  }
];

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-meridian-01',
    proposalNumber: 'GP-PROP-2026-004',
    clientId: 'client-meridian',
    clientName: 'Meridian Retail Group',
    title: 'Meridian B2B Wholesale Portal & Warehouse Integration',
    serviceCategory: 'SOFTWARE_DEV',
    scopeSummary: 'A modern, responsive B2B ordering portal for Meridian’s wholesale accounts, featuring real-time warehouse inventory sync, automated shipping tracking, and self-service invoices.',
    deliverables: [
      'B2B Wholesale Ordering Web App (Next.js / TypeScript / Tailwind)',
      'High-Throughput Warehouse Inventory Sync Gateway',
      'Automated Order Status Webhooks & Dispatch Notifications',
      'Production Deployment, Security Hardening & 30-Day Defect Warranty'
    ],
    exclusions: [
      'Third-party payment gateway transaction processing fees',
      'Physical barcode scanner hardware at regional warehouses'
    ],
    totalPrice: 38500,
    currency: 'USD',
    paymentMilestones: [
      { description: 'Initial Deposit & Architecture Sign-Off', percentage: 35, amount: 13475 },
      { description: 'Warehouse Integration & Alpha Staging Cutover', percentage: 35, amount: 13475 },
      { description: 'Final Production Deployment & Acceptance', percentage: 30, amount: 11550 }
    ],
    timelineDuration: '14 Weeks',
    validUntil: '2026-02-15',
    status: 'ACCEPTED',
    acceptedAt: '2026-01-14T11:00:00Z',
    acceptedBy: 'Sarah Chen (VP Digital Operations, Meridian)'
  },
  {
    id: 'prop-vanguard-draft',
    proposalNumber: 'GP-PROP-2026-007',
    clientId: 'lead-vanguard',
    clientName: 'Vanguard Freight Network',
    title: 'Automated Manifest Ingestion & Cross-Dock Dispatch Pipeline',
    serviceCategory: 'BUSINESS_AUTOMATION',
    scopeSummary: 'Automate ingestion of incoming EDI bills-of-lading, organize the terminal dock queue, and provide automated SMS/email driver notification triggers.',
    deliverables: [
      'Automated Manifest Parser for EDI 204/214 formats',
      'Real-Time Dock Queue Dashboard for terminal dispatchers',
      'Driver SMS Confirmation Webhook Gateway'
    ],
    exclusions: [
      'Physical yard barcode scanners or tablet hardware'
    ],
    totalPrice: 24500,
    currency: 'USD',
    paymentMilestones: [
      { description: 'Contract Signature & Blueprint Phase', percentage: 40, amount: 9800 },
      { description: 'Terminal Alpha Pilot at Chicago Hub', percentage: 40, amount: 9800 },
      { description: 'System-wide Multi-Hub Rollout', percentage: 20, amount: 4900 }
    ],
    timelineDuration: '8 Weeks',
    validUntil: '2026-11-15',
    status: 'DRAFT'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-0041',
    clientId: 'client-meridian',
    clientName: 'Meridian Retail Group',
    clientEmail: 'billing@meridianretail.com',
    issueDate: '2026-01-15',
    dueDate: '2026-01-30',
    lineItems: [
      { id: 'li-1', description: 'Milestone 1: Architecture Blueprint & Technical Specifications', quantity: 1, unitPrice: 13475, amount: 13475 }
    ],
    subtotal: 13475,
    taxPercent: 0,
    taxAmount: 0,
    totalAmount: 13475,
    currency: 'USD',
    status: 'PAID',
    paidAt: '2026-01-22T14:10:00Z',
    notes: 'Paid via ACH transfer. Reconciled.'
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-0058',
    clientId: 'client-meridian',
    clientName: 'Meridian Retail Group',
    clientEmail: 'billing@meridianretail.com',
    issueDate: '2026-10-19',
    dueDate: '2026-11-03',
    lineItems: [
      { id: 'li-2', description: 'Emergency Checkout Latency Optimization (6h @ $135/h)', quantity: 6, unitPrice: 135, amount: 810 }
    ],
    subtotal: 810,
    taxPercent: 0,
    taxAmount: 0,
    totalAmount: 810,
    currency: 'USD',
    status: 'ISSUED',
    notes: 'Generated following client approval of Support Estimate GP-REQ-2026-088.'
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-0039',
    clientId: 'client-nexus',
    clientName: 'Nexus Logistics Systems',
    clientEmail: 'ap@nexuslogistics.example.com',
    issueDate: '2026-09-15',
    dueDate: '2026-09-30',
    lineItems: [
      { id: 'li-3', description: 'EDI Pipeline Sprint 1: Carrier Ingestion Queue', quantity: 1, unitPrice: 6000, amount: 6000 }
    ],
    subtotal: 6000,
    taxPercent: 0,
    taxAmount: 0,
    totalAmount: 6000,
    currency: 'USD',
    status: 'PAID',
    paidAt: '2026-09-28T10:00:00Z',
    notes: 'Wire transfer confirmed and reconciled.'
  }
];

export const INITIAL_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-inquiry-ingest',
    name: 'Website Inquiry -> Structured Lead & Alert',
    description: 'When someone submits an inquiry on the website, formats the project brief, checks company details, and pings the founder immediately.',
    triggerEvent: 'Form Submission (/contact or /get-a-quote)',
    isEnabled: true,
    lastRunAt: '2026-10-18T14:22:00Z',
    lastRunStatus: 'SUCCESS',
    runCount: 42,
    requiresHumanApproval: false
  },
  {
    id: 'wf-ai-qualification',
    name: 'Lead Research & Tech Stack Checker',
    description: 'Scans target company sites for outdated frameworks, slow mobile performance, or broken workflows to prepare helpful conversation points.',
    triggerEvent: 'New Lead Discovered or Added',
    isEnabled: true,
    lastRunAt: '2026-10-18T14:25:00Z',
    lastRunStatus: 'SUCCESS',
    runCount: 29,
    requiresHumanApproval: false
  },
  {
    id: 'wf-outreach-gate',
    name: 'Personalized Outreach Draft & Founder Gate',
    description: 'Drafts a thoughtful, 1-to-1 email referencing verified operational pain points. Always pauses for founder review—never sends on its own.',
    triggerEvent: 'Lead Stage -> Ready for Outreach',
    isEnabled: true,
    lastRunAt: '2026-10-19T08:00:00Z',
    lastRunStatus: 'SUCCESS',
    runCount: 18,
    requiresHumanApproval: true
  },
  {
    id: 'wf-support-classifier',
    name: 'Support Request Retainer & Scope Classifier',
    description: 'When a client submits a support ticket, checks their available retainer hours and flags whether it is included or needs a separate estimate.',
    triggerEvent: 'Client Ticket Submitted',
    isEnabled: true,
    lastRunAt: '2026-10-18T16:20:00Z',
    lastRunStatus: 'SUCCESS',
    runCount: 88,
    requiresHumanApproval: true
  },
  {
    id: 'wf-deadline-watchdog',
    name: 'Milestone & Delivery Watchdog',
    description: 'Daily morning check of project milestones due within the next 5 days so clients are briefed proactively before any deadline approaches.',
    triggerEvent: 'Daily Schedule (08:00 AM)',
    isEnabled: true,
    lastRunAt: '2026-10-19T08:00:00Z',
    lastRunStatus: 'SUCCESS',
    runCount: 120,
    requiresHumanApproval: false
  }
];

export const INITIAL_ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 'act-1',
    timestamp: '2026-10-19T08:30:00Z',
    actor: 'Alex Mercer (Founder)',
    role: 'ADMIN',
    action: 'PREPARED_ESTIMATE',
    entityType: 'ESTIMATE',
    entityId: 'est-001',
    details: 'Sent 6-hour estimate ($810) to Sarah for Meridian checkout latency optimization.'
  },
  {
    id: 'act-2',
    timestamp: '2026-10-18T16:20:00Z',
    actor: 'Sarah Chen',
    role: 'CLIENT',
    action: 'SUBMITTED_REQUEST',
    entityType: 'REQUEST',
    entityId: 'req-001',
    details: 'Submitted urgent support ticket: checkout latency spike during Friday 4 PM flash sale.'
  },
  {
    id: 'act-3',
    timestamp: '2026-10-17T11:00:00Z',
    actor: 'Research Automation',
    role: 'ADMIN',
    action: 'QUALIFIED_LEAD',
    entityType: 'LEAD',
    entityId: 'lead-vanguard',
    details: 'Identified strong business fit for Vanguard Freight Network (cross-dock dispatch automation).'
  }
];
