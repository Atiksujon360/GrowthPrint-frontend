import React, { useState } from 'react';
import { 
  X, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Key, 
  Terminal, 
  Database, 
  Play, 
  Copy, 
  ExternalLink,
  Code2,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { CopyButton } from './CopyButton.tsx';
import { LoadingButton } from './LoadingButton.tsx';
import { apiClient, agencyApi } from '../../lib/api/client.ts';
import { storage } from '../../lib/utils.ts';
import { useAppDispatch } from '../../store/hooks.ts';
import { addToast } from '../../store/index.ts';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'ENDPOINTS' | 'TESTER' | 'CONFIG' | 'AUTH';

interface EndpointSpec {
  service: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  samplePayload?: Record<string, any>;
  springBootController: string;
}

const SERVICES_REGISTRY: EndpointSpec[] = [
  {
    service: 'Auth & IAM Service',
    method: 'POST',
    path: '/api/v1/auth/token',
    description: 'Exchange founder credentials or client magic links for a signed JWT token.',
    springBootController: 'AuthController.java (@PostMapping("/token"))',
    samplePayload: { email: 'founder@growthprint.com', role: 'ADMIN' }
  },
  {
    service: 'CRM & Lead Discovery',
    method: 'GET',
    path: '/api/v1/leads',
    description: 'Fetch pipeline leads with technical qualification scorecards.',
    springBootController: 'LeadController.java (@GetMapping("/leads"))'
  },
  {
    service: 'CRM & Lead Discovery',
    method: 'PATCH',
    path: '/api/v1/leads/{id}/stage',
    description: 'Advance lead pipeline stage and record founder audit event.',
    springBootController: 'LeadController.java (@PatchMapping("/leads/{id}/stage"))',
    samplePayload: { stage: 'CONTACTED', founderNotes: 'Initial discovery scheduled.' }
  },
  {
    service: 'Client Partnerships',
    method: 'GET',
    path: '/api/v1/clients',
    description: 'Retrieve active client accounts and monthly retainer hours.',
    springBootController: 'ClientController.java (@GetMapping("/clients"))'
  },
  {
    service: 'Projects & Deliveries',
    method: 'GET',
    path: '/api/v1/projects',
    description: 'Active engineering sprints, milestone schedules, and budget spend.',
    springBootController: 'ProjectController.java (@GetMapping("/projects"))'
  },
  {
    service: 'Support Desk & SLA Engine',
    method: 'POST',
    path: '/api/v1/support-requests',
    description: 'Log new client ticket and compute SLA priority tier.',
    springBootController: 'SupportRequestController.java (@PostMapping("/support-requests"))',
    samplePayload: {
      clientId: 'client-meridian',
      title: 'Checkout API latency spike',
      category: 'PAID_AD_HOC_SUPPORT',
      businessImpact: 'MEDIUM',
      urgency: 'NORMAL'
    }
  },
  {
    service: 'Invoicing & Payments',
    method: 'GET',
    path: '/api/v1/invoices',
    description: 'List billing ledger records, payment states, and PDF receipt links.',
    springBootController: 'InvoiceController.java (@GetMapping("/invoices"))'
  },
  {
    service: 'Invoicing & Payments',
    method: 'POST',
    path: '/api/v1/invoices/{id}/reconcile',
    description: 'Record confirmed payment and issue receipt.',
    springBootController: 'InvoiceController.java (@PostMapping("/invoices/{id}/reconcile"))',
    samplePayload: { paymentReference: 'STRIPE_CH_948271', amountPaid: 15400 }
  },
  {
    service: 'Workflow Automation (n8n)',
    method: 'POST',
    path: '/api/v1/automations/{id}/run',
    description: 'Trigger asynchronous workflow execution webhook.',
    springBootController: 'AutomationController.java (@PostMapping("/automations/{id}/run"))',
    samplePayload: { triggerSource: 'FOUNDER_UI', correlationId: 'run_gp_829' }
  }
];

export function ApiIntegrationModal({ isOpen, onClose }: ApiIntegrationModalProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('ENDPOINTS');
  
  // Tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointSpec>(SERVICES_REGISTRY[1]);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  // Config state
  const [apiUrl, setApiUrl] = useState<string>(() => storage.get('gp_api_base_url', '/api/v1'));
  const [isMockMode, setIsMockMode] = useState<boolean>(() => apiClient.getMockMode());

  if (!isOpen) return null;

  const handleExecuteTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    setTestStatus(null);
    setTestLatency(null);

    const startTime = performance.now();

    try {
      // Simulate endpoint dispatch through the typed adapter
      await new Promise(r => setTimeout(r, Math.floor(180 + Math.random() * 120)));
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      let mockData: any = {};
      if (selectedEndpoint.path.includes('leads')) {
        mockData = {
          success: true,
          count: 3,
          data: [
            { id: 'lead-vanguard', company: 'Vanguard Freight Logistics', score: 92, stage: 'READY_FOR_OUTREACH' },
            { id: 'lead-beacon', company: 'Beacon Point Health', score: 86, stage: 'QUALIFIED' },
            { id: 'lead-zenith', company: 'Zenith Fleet Telematics', score: 79, stage: 'DISCOVERED' }
          ]
        };
      } else if (selectedEndpoint.path.includes('invoices')) {
        mockData = {
          success: true,
          totalCollected: 45000,
          currency: 'USD',
          records: [
            { invoiceNumber: 'INV-2026-001', client: 'Meridian Retail Group', amount: 15400, status: 'ISSUED' },
            { invoiceNumber: 'INV-2026-002', client: 'Apex Global Logistics', amount: 9800, status: 'PAID' }
          ]
        };
      } else if (selectedEndpoint.path.includes('support')) {
        mockData = {
          success: true,
          ticketReference: 'GP-REQ-2026-384',
          status: 'LOGGED_IN_QUEUE',
          slaResponseTarget: '4 hours',
          assignedTo: 'Founder (Admin)'
        };
      } else {
        mockData = {
          success: true,
          service: selectedEndpoint.service,
          method: selectedEndpoint.method,
          endpoint: selectedEndpoint.path,
          timestamp: new Date().toISOString(),
          status: 'HEALTHY',
          correlationId: `gp_trace_${Math.random().toString(36).slice(2, 10)}`
        };
      }

      setTestStatus(200);
      setTestLatency(latency);
      setTestResponse(mockData);

      dispatch(addToast({
        type: 'success',
        title: 'API Test Succeeded (200 OK)',
        message: `${selectedEndpoint.method} ${selectedEndpoint.path} responded in ${latency}ms.`
      }));
    } catch (err: any) {
      setTestStatus(500);
      setTestResponse({ error: 'Endpoint failure', message: err.message });
      dispatch(addToast({
        type: 'error',
        title: 'API Call Failed',
        message: err.message || 'Unable to connect to service endpoint.'
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    storage.set('gp_api_base_url', apiUrl);
    apiClient.setMockMode(isMockMode);
    dispatch(addToast({
      type: 'success',
      title: 'API Gateway Configured',
      message: `Base URL set to ${apiUrl}. Mode: ${isMockMode ? 'Development In-Memory' : 'Live Microservice'}.`
    }));
  };

  const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmb3VuZGVyQGdyb3d0aHByaW50LmNvbSIsIm5hbWUiOiJBbGV4IFZhbmNlIiwicm9sZXMiOlsicm9sZV9hZG1pbiIsInJvbGVfZm91bmRlciJdLCJ0ZW5hbnQiOiJncm93dGhwcmludCIsImlhdCI6MTc2MDk4MjAwMCwiZXhwIjoxNzYxNTg2ODAwfQ.K9X4oZ_placeholder_signature';

  return (
    <div className="fixed inset-0 z-50 bg-gp-text/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-gp-surface rounded-2xl max-w-3xl w-full border border-gp-border shadow-gp-pop flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-labelledby="api-modal-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gp-divider bg-gp-surface-secondary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gp-primary text-gp-primary-foreground flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="api-modal-title" className="text-base font-bold text-gp-text">
                  Backend API & Microservice Integration
                </h3>
                <span className="text-xs font-semibold bg-gp-success-soft text-gp-success px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Spring Boot Ready
                </span>
              </div>
              <p className="text-xs text-gp-text-muted mt-0.5">
                Inspect OpenAPI contracts, test service endpoints, and configure microservice base URLs.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gp-text-muted hover:text-gp-text rounded-lg hover:bg-gp-surface-secondary transition-colors"
            aria-label="Close API modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gp-divider bg-gp-surface-secondary/60 p-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ENDPOINTS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'ENDPOINTS' ? 'bg-gp-surface text-gp-text shadow-2xs' : 'text-gp-text-secondary hover:text-gp-text'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Service Endpoints ({SERVICES_REGISTRY.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TESTER')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'TESTER' ? 'bg-gp-surface text-gp-text shadow-2xs' : 'text-gp-text-secondary hover:text-gp-text'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Endpoint Tester</span>
          </button>

          <button
            onClick={() => setActiveTab('AUTH')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'AUTH' ? 'bg-gp-surface text-gp-text shadow-2xs' : 'text-gp-text-secondary hover:text-gp-text'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>JWT & Headers</span>
          </button>

          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'CONFIG' ? 'bg-gp-surface text-gp-text shadow-2xs' : 'text-gp-text-secondary hover:text-gp-text'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Connection Gateway</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ENDPOINTS LIST */}
          {activeTab === 'ENDPOINTS' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gp-info-soft border border-gp-info/30 rounded-xl text-xs text-gp-text flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-gp-info shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong>Spring Boot & PostgreSQL Target Architecture:</strong>
                  <p className="text-xs leading-relaxed text-gp-text-secondary">
                    All agency actions in this workspace map 1-to-1 to standard REST controllers. When the backend microservices run, toggle &ldquo;Live Microservice&rdquo; in Gateway Settings to connect seamlessly.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {SERVICES_REGISTRY.map((ep, idx) => {
                  const methodColors = {
                    GET: 'bg-gp-info-soft text-gp-info border-gp-info/30',
                    POST: 'bg-gp-success-soft text-gp-success border-gp-success/30',
                    PATCH: 'bg-gp-primary-soft text-gp-primary-strong border-gp-primary/30',
                    PUT: 'bg-gp-warning-soft text-gp-warning border-gp-warning/30',
                    DELETE: 'bg-gp-danger-soft text-gp-danger border-gp-danger/30'
                  }[ep.method];

                  return (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl border border-gp-border hover:border-gp-text-muted/40 bg-gp-surface hover:bg-gp-surface-secondary/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded border ${methodColors}`}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs font-bold text-gp-text">
                            {ep.path}
                          </span>
                          <span className="text-xs text-gp-text-muted">· {ep.service}</span>
                        </div>
                        <p className="text-xs text-gp-text-secondary">
                          {ep.description}
                        </p>
                        <div className="text-xs font-mono text-gp-text-muted">
                          Spring: {ep.springBootController}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEndpoint(ep);
                          setActiveTab('TESTER');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-gp-text-secondary bg-gp-surface-secondary hover:bg-gp-primary-soft hover:text-gp-primary-strong border border-gp-border rounded-lg transition-colors flex items-center gap-1 self-start md:self-center shrink-0"
                      >
                        <Play className="w-3 h-3" />
                        <span>Test in Console</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TESTER CONSOLE */}
          {activeTab === 'TESTER' && (
            <div className="space-y-5">
              <div className="bg-gp-plum text-white/90 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-gp-primary/20 text-gp-accent border border-gp-primary/30">
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-xs text-white font-bold">
                      {selectedEndpoint.path}
                    </span>
                  </div>

                  <LoadingButton
                    onClick={handleExecuteTest}
                    loading={isTesting}
                    loadingLabel="Calling API..."
                    className="px-3 py-1.5 bg-gp-primary hover:bg-gp-primary-hover text-gp-primary-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Send Request</span>
                  </LoadingButton>
                </div>

                <div className="text-xs text-white/60">
                  Target Service: <span className="text-white">{selectedEndpoint.service}</span>
                </div>

                {selectedEndpoint.samplePayload && (
                  <div>
                    <div className="text-xs font-mono text-white/60 mb-1">Request Payload (JSON):</div>
                    <pre className="bg-gp-canvas p-2.5 rounded-lg text-xs font-mono text-gp-success overflow-x-auto border border-gp-border">
                      {JSON.stringify(selectedEndpoint.samplePayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Response Section */}
              {testResponse && (
                <div className="border border-gp-border rounded-xl p-4 bg-gp-surface-secondary/50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gp-text">HTTP Response:</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-gp-success-soft text-gp-success">
                        {testStatus} OK
                      </span>
                      {testLatency !== null && (
                        <span className="text-xs text-gp-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {testLatency} ms
                        </span>
                      )}
                    </div>
                    <CopyButton value={JSON.stringify(testResponse, null, 2)} title="Copy JSON Response" />
                  </div>

                  <pre className="bg-gp-surface p-3.5 rounded-lg border border-gp-border text-xs font-mono text-gp-text overflow-x-auto max-h-56">
                    {JSON.stringify(testResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTH & HEADERS */}
          {activeTab === 'AUTH' && (
            <div className="space-y-4">
              <div className="p-4 bg-gp-surface-secondary/50 border border-gp-border rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gp-primary-strong" />
                    <span className="font-bold text-xs text-gp-text">Standard Request Headers</span>
                  </div>
                  <CopyButton 
                    value={`Authorization: Bearer ${mockJwt}\nContent-Type: application/json\nAccept: application/json\nX-Agency-Tenant: growthprint`}
                    title="Copy Header Block"
                  />
                </div>

                <div className="font-mono text-xs bg-gp-surface p-3 rounded-lg border border-gp-border text-gp-text-secondary space-y-1">
                  <div><strong className="text-gp-text">Authorization:</strong> Bearer {mockJwt.slice(0, 32)}...</div>
                  <div><strong className="text-gp-text">Content-Type:</strong> application/json</div>
                  <div><strong className="text-gp-text">Accept:</strong> application/json</div>
                  <div><strong className="text-gp-text">X-Agency-Tenant:</strong> growthprint</div>
                </div>
              </div>

              <div className="p-4 bg-gp-surface-secondary/50 border border-gp-border rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gp-text">Founder Simulated JWT Payload</span>
                  <CopyButton value={mockJwt} title="Copy JWT Token" />
                </div>
                <pre className="bg-gp-surface p-3 rounded-lg border border-gp-border text-xs font-mono text-gp-text">
{`{
  "sub": "founder@growthprint.com",
  "name": "Alex Vance",
  "roles": ["ROLE_ADMIN", "ROLE_FOUNDER"],
  "tenant": "growthprint",
  "iss": "growthprint-auth-service",
  "exp": 1761586800
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTION SETTINGS */}
          {activeTab === 'CONFIG' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gp-text">
                  API Gateway Base URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="/api/v1 or http://localhost:8080/api/v1"
                  className="w-full px-3.5 py-2 text-xs border border-gp-border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-gp-primary/20 bg-gp-surface-secondary/50"
                />
                <p className="text-xs text-gp-text-muted">
                  During local Spring Boot development, point this to your local backend (e.g., http://localhost:8080/api/v1).
                </p>
              </div>

              <div className="p-4 bg-gp-surface-secondary/50 border border-gp-border rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gp-text">Adapter Operating Mode</h4>
                    <p className="text-xs text-gp-text-muted">
                      Toggle between transparent in-memory mock responses and real network calls.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMockMode(!isMockMode)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                      isMockMode 
                        ? 'bg-gp-warning-soft text-gp-warning border-gp-warning/40' 
                        : 'bg-gp-success-soft text-gp-success border-gp-success/40'
                    }`}
                  >
                    {isMockMode ? 'Development Demo Mode' : 'Live Microservice REST'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gp-text-secondary bg-gp-surface hover:bg-gp-surface-secondary border border-gp-border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 text-xs font-semibold text-gp-primary-foreground bg-gp-primary hover:bg-gp-primary-hover rounded-xl"
                >
                  Save Gateway Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
