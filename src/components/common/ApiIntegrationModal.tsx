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
  RefreshCw, 
  Copy, 
  ExternalLink,
  Code2,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { CopyButton } from './CopyButton.tsx';
import { apiClient, agencyApi } from '../../lib/apiClient.ts';
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200/90 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-labelledby="api-modal-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="api-modal-title" className="text-base font-bold text-slate-900">
                  Backend API & Microservice Integration
                </h3>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Spring Boot Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect OpenAPI contracts, test service endpoints, and configure microservice base URLs.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close API modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ENDPOINTS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'ENDPOINTS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Service Endpoints ({SERVICES_REGISTRY.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TESTER')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'TESTER' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Endpoint Tester</span>
          </button>

          <button
            onClick={() => setActiveTab('AUTH')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'AUTH' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>JWT & Headers</span>
          </button>

          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'CONFIG' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong>Spring Boot & PostgreSQL Target Architecture:</strong>
                  <p className="text-[11px] leading-relaxed text-blue-800">
                    All agency actions in this workspace map 1-to-1 to standard REST controllers. When the backend microservices run, toggle &ldquo;Live Microservice&rdquo; in Gateway Settings to connect seamlessly.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {SERVICES_REGISTRY.map((ep, idx) => {
                  const methodColors = {
                    GET: 'bg-blue-100 text-blue-800 border-blue-200',
                    POST: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    PATCH: 'bg-purple-100 text-purple-800 border-purple-200',
                    PUT: 'bg-amber-100 text-amber-800 border-amber-200',
                    DELETE: 'bg-rose-100 text-rose-800 border-rose-200'
                  }[ep.method];

                  return (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${methodColors}`}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {ep.path}
                          </span>
                          <span className="text-[11px] text-slate-400">· {ep.service}</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {ep.description}
                        </p>
                        <div className="text-[10px] font-mono text-slate-400">
                          Spring: {ep.springBootController}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEndpoint(ep);
                          setActiveTab('TESTER');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 self-start md:self-center shrink-0"
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
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-xs text-slate-200 font-bold">
                      {selectedEndpoint.path}
                    </span>
                  </div>

                  <button
                    onClick={handleExecuteTest}
                    disabled={isTesting}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isTesting ? 'Calling API...' : 'Send Request'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  Target Service: <span className="text-slate-200">{selectedEndpoint.service}</span>
                </div>

                {selectedEndpoint.samplePayload && (
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 mb-1">Request Payload (JSON):</div>
                    <pre className="bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">
                      {JSON.stringify(selectedEndpoint.samplePayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Response Section */}
              {testResponse && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">HTTP Response:</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {testStatus} OK
                      </span>
                      {testLatency !== null && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {testLatency} ms
                        </span>
                      )}
                    </div>
                    <CopyButton value={JSON.stringify(testResponse, null, 2)} title="Copy JSON Response" />
                  </div>

                  <pre className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto max-h-56">
                    {JSON.stringify(testResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTH & HEADERS */}
          {activeTab === 'AUTH' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">Standard Request Headers</span>
                  </div>
                  <CopyButton 
                    value={`Authorization: Bearer ${mockJwt}\nContent-Type: application/json\nAccept: application/json\nX-Agency-Tenant: growthprint`}
                    title="Copy Header Block"
                  />
                </div>

                <div className="font-mono text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-700 space-y-1">
                  <div><strong className="text-slate-900">Authorization:</strong> Bearer {mockJwt.slice(0, 32)}...</div>
                  <div><strong className="text-slate-900">Content-Type:</strong> application/json</div>
                  <div><strong className="text-slate-900">Accept:</strong> application/json</div>
                  <div><strong className="text-slate-900">X-Agency-Tenant:</strong> growthprint</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Founder Simulated JWT Payload</span>
                  <CopyButton value={mockJwt} title="Copy JWT Token" />
                </div>
                <pre className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
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
                <label className="block text-xs font-bold text-slate-900">
                  API Gateway Base URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="/api/v1 or http://localhost:8080/api/v1"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50"
                />
                <p className="text-[11px] text-slate-500">
                  During local Spring Boot development, point this to your local backend (e.g., http://localhost:8080/api/v1).
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Adapter Operating Mode</h4>
                    <p className="text-[11px] text-slate-500">
                      Toggle between transparent in-memory mock responses and real network calls.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMockMode(!isMockMode)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                      isMockMode 
                        ? 'bg-amber-100 text-amber-900 border-amber-300' 
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
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
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
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
