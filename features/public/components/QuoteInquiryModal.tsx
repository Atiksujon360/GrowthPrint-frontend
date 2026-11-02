import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Building, Mail, User, Globe } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { submitPublicInquiry, addToast } from '../../../store/index.ts';
import type { ServiceCategory, PublicInquiryFormData } from '../../../types/agency.ts';

interface QuoteInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: ServiceCategory;
}

export function QuoteInquiryModal({ isOpen, onClose, defaultService }: QuoteInquiryModalProps) {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<PublicInquiryFormData>({
    name: '',
    businessEmail: '',
    company: '',
    website: '',
    serviceCategory: defaultService || 'SOFTWARE_DEV',
    projectType: 'Web Application Development',
    budgetRange: '$10,000 – $25,000',
    preferredTimeline: '1–2 Months',
    projectDescription: '',
    preferredContactMethod: 'EMAIL',
    consent: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Business email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please provide a valid email address.';
    }
    if (!formData.company.trim()) newErrors.company = 'Company name is required.';
    // Mirrors the backend rule: website is optional but must be an http(s) URL when given.
    if (formData.website && formData.website.trim() && !/^https?:\/\/.+/i.test(formData.website.trim())) {
      newErrors.website = 'Website must start with http:// or https://';
    }
    if (!formData.projectDescription.trim() || formData.projectDescription.length < 15) {
      newErrors.projectDescription = 'Please provide at least 15 characters describing what you wish to build or automate.';
    }
    if (!formData.consent) {
      newErrors.consent = 'Please confirm consent for us to review your inquiry.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Only what the visitor actually entered is sent; blank optional fields stay blank.
      const acknowledgement = await dispatch(submitPublicInquiry({
        ...formData,
        // The backend contact methods are EMAIL | PHONE | VIDEO_CALL; a discovery call is a video call.
        preferredContactMethod: formData.preferredContactMethod === 'DISCOVERY_CALL' ? 'VIDEO_CALL' as const : formData.preferredContactMethod
      })).unwrap();

      // Success is shown only after the backend accepted the inquiry, with its own reference number.
      setReferenceNumber(acknowledgement.referenceNumber);
      dispatch(addToast({
        type: 'success',
        title: 'Message received',
        message: `Thanks, ${formData.name}. We will review your note and get back to you within 1 business day.`
      }));
    } catch (err) {
      setSubmitError(typeof err === 'string' && err ? err : 'We could not send your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setReferenceNumber(null);
    setFormData({
      name: '',
      businessEmail: '',
      company: '',
      website: '',
      serviceCategory: 'SOFTWARE_DEV',
      projectType: 'Web Application Development',
      budgetRange: '$10,000 – $25,000',
      preferredTimeline: '1–2 Months',
      projectDescription: '',
      preferredContactMethod: 'EMAIL',
      consent: true
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
        className="relative bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              A quick conversation
            </div>
            <h3 id="quote-modal-title" className="text-lg font-bold text-slate-900">
              {referenceNumber ? 'Thanks — we got it' : 'Tell us what you need'}
            </h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {referenceNumber ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900">
                  Thank You, {formData.name}
                </h4>
              <p className="text-base text-slate-600 max-w-md mx-auto leading-relaxed">
                  We have your note and will review it personally before getting back to you.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 inline-block text-left text-xs space-y-1.5 my-2">
                <div>
                  <span className="text-slate-500 font-medium">Reference Code: </span>
                  <span className="font-mono font-bold text-blue-700">{referenceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Company: </span>
                  <span className="font-semibold text-slate-900">{formData.company}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Service Track: </span>
                  <span className="font-semibold text-slate-900">{formData.serviceCategory}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Next Action: </span>
                  <span className="text-slate-700">Initial response within 1 business day via {formData.preferredContactMethod.toLowerCase()}.</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inquiry-name" className="block text-sm font-medium text-slate-700 mb-1">
                    Your Name <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
                    <input
                      type="text"
                      id="inquiry-name"
                      required
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'inquiry-name-error' : undefined}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.name && <p id="inquiry-name-error" role="alert" className="text-xs text-rose-700 mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="inquiry-email" className="block text-sm font-medium text-slate-700 mb-1">
                    Business Email <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
                    <input
                      type="email"
                      id="inquiry-email"
                      required
                      autoComplete="email"
                      aria-invalid={Boolean(errors.businessEmail)}
                      aria-describedby={errors.businessEmail ? 'inquiry-email-error' : undefined}
                      value={formData.businessEmail}
                      onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                      placeholder="alex@company.com"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.businessEmail ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.businessEmail && <p id="inquiry-email-error" role="alert" className="text-xs text-rose-700 mt-1">{errors.businessEmail}</p>}
                </div>
              </div>

              {/* Row 2: Company & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inquiry-company" className="block text-sm font-medium text-slate-700 mb-1">
                    Company Name <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
                    <input
                      type="text"
                      id="inquiry-company"
                      required
                      autoComplete="organization"
                      aria-invalid={Boolean(errors.company)}
                      aria-describedby={errors.company ? 'inquiry-company-error' : undefined}
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Acme Logistics Ltd"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.company ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.company && <p id="inquiry-company-error" role="alert" className="text-xs text-rose-700 mt-1">{errors.company}</p>}
                </div>

                <div>
                    <label htmlFor="inquiry-website" className="block text-sm font-medium text-slate-700 mb-1">
                    Website (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
                    <input
                      id="inquiry-website"
                      type="url"
                      aria-invalid={Boolean(errors.website)}
                      aria-describedby={errors.website ? 'inquiry-website-error' : undefined}
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://company.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  {errors.website && (
                    <p id="inquiry-website-error" className="text-[11px] text-rose-600 mt-1">{errors.website}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Service Selection & Project Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Primary Service Category
                  </label>
                  <select
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value as ServiceCategory })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="SOFTWARE_DEV">Custom Software Development</option>
                    <option value="WEBSITE_MAINTENANCE">Website & Application Support</option>
                    <option value="TECHNICAL_SEO">SEO & Technical Optimization</option>
                    <option value="BUSINESS_AUTOMATION">Business Process Automation</option>
                    <option value="AI_INTEGRATION">Useful AI and automation</option>
                  </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                    Project Type
                  </label>
                  <input
                    type="text"
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    placeholder="e.g. Portal, API pipeline, Bug overhaul"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Row 4: Budget & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estimated Budget Range
                  </label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="Under $5,000">Under $5,000 (Small sprint / audit)</option>
                    <option value="$5,000 – $10,000">$5,000 – $10,000 (Standard integration)</option>
                    <option value="$10,000 – $25,000">$10,000 – $25,000 (Complete portal / app)</option>
                    <option value="$25,000+">$25,000+ (Larger, multi-stage project)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Preferred Timeline
                  </label>
                  <select
                    value={formData.preferredTimeline}
                    onChange={(e) => setFormData({ ...formData, preferredTimeline: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="Immediate (< 2 weeks)">Immediate (&lt; 2 weeks)</option>
                    <option value="1–2 Months">1–2 Months</option>
                    <option value="Quarterly planning">Quarterly planning</option>
                  </select>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label htmlFor="inquiry-description" className="block text-sm font-medium text-slate-700 mb-1">
                  What would you like to improve? <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <textarea
                  rows={3}
                  id="inquiry-description"
                  required
                  aria-invalid={Boolean(errors.projectDescription)}
                  aria-describedby={errors.projectDescription ? 'inquiry-description-error' : undefined}
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  placeholder="Tell us what is happening today and what you would like to be different..."
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.projectDescription ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.projectDescription && (
                  <p id="inquiry-description-error" role="alert" className="text-xs text-rose-700 mt-1">{errors.projectDescription}</p>
                )}
              </div>

              {/* Preferred Contact Method */}
              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Contact Method
                </span>
                <div className="flex items-center gap-4 text-sm text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      checked={formData.preferredContactMethod === 'EMAIL'}
                      onChange={() => setFormData({ ...formData, preferredContactMethod: 'EMAIL' })}
                      className="text-blue-600"
                    />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      checked={formData.preferredContactMethod === 'DISCOVERY_CALL'}
                      onChange={() => setFormData({ ...formData, preferredContactMethod: 'DISCOVERY_CALL' })}
                      className="text-blue-600"
                    />
                    <span>15-Minute Video Call</span>
                  </label>
                </div>
              </div>

              {/* Consent checkbox */}
              <div>
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <span>
                    I agree that GrowthPrint can review these details to understand the work. We will not send spam.
                  </span>
                </label>
                {errors.consent && <p className="text-[11px] text-rose-600 mt-1">{errors.consent}</p>}
              </div>

              {submitError && (
                <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {submitError}
                </p>
              )}

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Sending your note...</span>
                  ) : (
                    <>
                      <span>Send my note</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
