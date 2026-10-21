import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { submitPublicInquiry, createSupportRequest, addToast, addNotification } from '../../../store/index.ts';
import { X, Sparkles, TicketCheck, CreditCard, Building, CheckCircle2 } from 'lucide-react';
import type { ServiceCategory, SupportCategory } from '../../../types/agency.ts';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickCreateModal({ isOpen, onClose }: QuickCreateModalProps) {
  const dispatch = useAppDispatch();
  const clients = useAppSelector(state => state.agency.clients);
  const [activeTab, setActiveTab] = useState<'LEAD' | 'TICKET'>('LEAD');

  // Lead fields
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [service, setService] = useState<ServiceCategory>('SOFTWARE_DEV');
  const [problem, setProblem] = useState('');

  // Ticket fields
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketClientId, setTicketClientId] = useState(clients[0]?.id || '');
  const [ticketCategory, setTicketCategory] = useState<SupportCategory>('PAID_AD_HOC_SUPPORT');
  const [ticketImpact, setTicketImpact] = useState<'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER'>('MEDIUM');
  const [ticketDesc, setTicketDesc] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !contactName.trim() || !contactEmail.trim()) return;

    dispatch(submitPublicInquiry({
      name: contactName,
      businessEmail: contactEmail,
      company,
      serviceCategory: service,
      projectType: 'Direct Founder Sourced',
      budgetRange: '$10,000 – $25,000',
      projectDescription: problem || 'Discovered during manual founder business research.',
      preferredContactMethod: 'EMAIL',
      consent: true
    }));

    dispatch(addToast({
      type: 'success',
      title: 'Lead Created',
      message: `Lead for ${company} (${contactName}) has been added to your CRM pipeline.`
    }));

    dispatch(addNotification({
      category: 'OUTREACH',
      title: 'New Lead Added',
      message: `Prospect ${company} added by founder. Ready for discovery qualification.`,
      priority: 'MEDIUM',
      targetTab: 'LEADS'
    }));

    setSuccessMsg(`Lead "${company}" created and added to pipeline.`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim()) return;

    const matchedClient = clients.find(c => c.id === ticketClientId);

    dispatch(createSupportRequest({
      clientId: ticketClientId,
      clientName: matchedClient?.name || 'Client',
      title: ticketTitle,
      category: ticketCategory,
      description: ticketDesc,
      businessImpact: ticketImpact,
      urgency: 'NORMAL'
    }));

    dispatch(addToast({
      type: 'success',
      title: 'Support Ticket Logged',
      message: `Ticket "${ticketTitle}" logged for ${matchedClient?.name || 'Client'}.`
    }));

    dispatch(addNotification({
      category: 'ACTION_REQUIRED',
      title: 'New Support Ticket',
      message: `Ticket "${ticketTitle}" created for ${matchedClient?.name || 'Client'}.`,
      priority: 'HIGH',
      targetTab: 'REQUESTS'
    }));

    setSuccessMsg(`Ticket "${ticketTitle}" logged successfully.`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Founder Fast-Track</div>
            <h3 className="text-base font-bold text-slate-900">Quick-Create Record</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('LEAD')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'LEAD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>New Lead</span>
          </button>
          <button
            onClick={() => setActiveTab('TICKET')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'TICKET' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TicketCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Support Ticket</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successMsg ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900">{successMsg}</div>
            </div>
          ) : activeTab === 'LEAD' ? (
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Pacific Coast Distribution"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Mark Roberts"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="mark@company.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Service</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as ServiceCategory)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="SOFTWARE_DEV">Custom Software Development</option>
                  <option value="BUSINESS_AUTOMATION">Business Process Automation</option>
                  <option value="WEBSITE_MAINTENANCE">Website Maintenance</option>
                  <option value="TECHNICAL_SEO">Technical SEO</option>
                  <option value="AI_INTEGRATION">AI Integration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Observed Technical Bottleneck</label>
                <textarea
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Identified need, outdated website, missing API integration..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs">
                  Create Lead
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Client Organization *</label>
                <select
                  value={ticketClientId}
                  onChange={(e) => setTicketClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ticket Title *</label>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="e.g. SSL renewal warning on sub-domain"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as SupportCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="PAID_AD_HOC_SUPPORT">Paid Ad-Hoc Support</option>
                    <option value="INCLUDED_SUPPORT">Included Support (Retainer)</option>
                    <option value="NEW_PROJECT">New Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Impact</label>
                  <select
                    value={ticketImpact}
                    onChange={(e) => setTicketImpact(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="CRITICAL_BLOCKER">Critical Blocker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Details of the request or task..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs">
                  Create Ticket
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
