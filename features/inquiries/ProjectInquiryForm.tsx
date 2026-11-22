'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks.ts';
import { submitPublicInquiry } from '../../store/index.ts';
import { getErrorMessage } from '../../lib/api/errors.ts';
import { BUDGETS, SERVICES, TIMELINES, type ServiceId } from '../../components/marketing/content.ts';
import { EMPTY_INQUIRY, toInquiryPayload, validateInquiry, type InquiryErrors, type InquiryFormValues } from '../../lib/inquiryForm.ts';

/**
 * Project inquiry form for the homepage. Submits to POST /api/v1/public/inquiries through the existing store thunk
 * (the same API client as the rest of the app). Success is shown only after the API accepted the inquiry, with the
 * reference number it returned; failures show the API's own message. Nothing is emailed or sent anywhere else.
 */
export function ProjectInquiryForm() {
  const dispatch = useAppDispatch();
  const id = useId();
  const [values, setValues] = useState<InquiryFormValues>(EMPTY_INQUIRY);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  // "Discuss this service" links elsewhere on the page preselect the service here.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a[data-service]');
      const service = link?.getAttribute('data-service') as ServiceId | null | undefined;
      if (service && SERVICES.some(s => s.id === service)) setValues(v => ({ ...v, service }));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => { if (reference) confirmRef.current?.focus(); }, [reference]);

  const set = <K extends keyof InquiryFormValues>(key: K, value: InquiryFormValues[K]) => {
    setValues(v => ({ ...v, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    const found = validateInquiry(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setPending(true);
    setSubmitError(null);
    try {
      const ack = await dispatch(submitPublicInquiry(toInquiryPayload(values))).unwrap();
      setReference(ack.referenceNumber);
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Your inquiry could not be sent. Check your connection and try again.'));
    } finally {
      setPending(false);
    }
  };

  if (reference) {
    return (
      <div ref={confirmRef} tabIndex={-1} role="status"
        className="rounded-[22px] border border-mk-violet/40 bg-mk-surface/80 p-8 outline-none sm:p-10">
        <CheckCircle2 className="h-10 w-10 text-mk-cyan" aria-hidden="true" />
        <h3 className="mt-5 text-2xl font-medium">Inquiry received</h3>
        <p className="mt-3 font-light leading-relaxed text-mk-muted">
          Thanks, {values.name.trim().split(' ')[0]}. Your reference is{' '}
          <span className="font-medium text-mk-text">{reference}</span>. We&rsquo;ll review your note and reply to{' '}
          <span className="text-mk-text">{values.businessEmail.trim()}</span>.
        </p>
        <button type="button" onClick={() => { setValues(EMPTY_INQUIRY); setReference(null); }}
          className="mt-7 text-[15px] font-medium text-mk-violet hover:text-mk-text">
          Send another inquiry
        </button>
      </div>
    );
  }

  const field = 'mt-2 block h-12 w-full rounded-xl border bg-mk-soft/70 px-4 text-[15px] text-mk-text placeholder:text-mk-dim focus:border-mk-violet focus:outline-none focus:ring-2 focus:ring-mk-violet/30';
  const border = (k: keyof InquiryFormValues) => (errors[k] ? 'border-gp-danger/60' : 'border-mk-line');
  const label = 'block text-sm font-medium text-mk-muted';
  const err = (k: keyof InquiryFormValues) => errors[k]
    ? <p id={`${id}-${k}-error`} className="mt-1.5 text-[13px] text-gp-danger">{errors[k]}</p> : null;
  const aria = (k: keyof InquiryFormValues) => ({ 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `${id}-${k}-error` : undefined });

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-busy={pending}
      className="rounded-[22px] border border-mk-line bg-mk-surface/80 p-6 backdrop-blur-sm sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={label}>Full name</label>
          <input id={`${id}-name`} name="name" autoComplete="name" value={values.name} onChange={e => set('name', e.target.value)}
            className={`${field} ${border('name')}`} {...aria('name')} />
          {err('name')}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={label}>Business email</label>
          <input id={`${id}-email`} name="businessEmail" type="email" autoComplete="email" value={values.businessEmail}
            onChange={e => set('businessEmail', e.target.value)} placeholder="name@company.com" className={`${field} ${border('businessEmail')}`} {...aria('businessEmail')} />
          {err('businessEmail')}
        </div>
        <div>
          <label htmlFor={`${id}-company`} className={label}>Company</label>
          <input id={`${id}-company`} name="company" autoComplete="organization" value={values.company}
            onChange={e => set('company', e.target.value)} className={`${field} ${border('company')}`} {...aria('company')} />
          {err('company')}
        </div>
        <div>
          <label htmlFor={`${id}-service`} className={label}>Service</label>
          <select id={`${id}-service`} name="service" value={values.service} onChange={e => set('service', e.target.value as ServiceId | '')}
            className={`${field} ${border('service')} [&>option]:bg-mk-surface`} {...aria('service')}>
            <option value="">Choose a service</option>
            {SERVICES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          {err('service')}
        </div>
        <div>
          <label htmlFor={`${id}-budget`} className={label}>Budget range <span className="font-light text-mk-dim">(optional)</span></label>
          <select id={`${id}-budget`} name="budgetRange" value={values.budgetRange} onChange={e => set('budgetRange', e.target.value)}
            className={`${field} border-mk-line [&>option]:bg-mk-surface`}>
            <option value="">Not sure yet</option>
            {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-timeline`} className={label}>Timeline <span className="font-light text-mk-dim">(optional)</span></label>
          <select id={`${id}-timeline`} name="timeline" value={values.timeline} onChange={e => set('timeline', e.target.value)}
            className={`${field} border-mk-line [&>option]:bg-mk-surface`}>
            <option value="">No fixed date</option>
            {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor={`${id}-description`} className={label}>What are you trying to achieve?</label>
        <textarea id={`${id}-description`} name="description" rows={5} value={values.description} onChange={e => set('description', e.target.value)}
          placeholder="The problem, who it affects, and what a good result would look like."
          className={`${field} h-auto py-3 leading-relaxed ${border('description')}`} {...aria('description')} />
        {err('description')}
      </div>

      <fieldset className="mt-6">
        <legend className={label}>How should we get back to you?</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {([['EMAIL', 'Email reply'], ['DISCOVERY_CALL', 'Book a discovery call']] as const).map(([value, text]) => (
            <label key={value} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-[15px] ${values.contact === value ? 'border-mk-purple bg-mk-purple/10 text-mk-text' : 'border-mk-line text-mk-muted'}`}>
              <input type="radio" name="contact" value={value} checked={values.contact === value} onChange={() => set('contact', value)} className="accent-mk-purple" />
              {text}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-[14px] leading-relaxed text-mk-muted">
          <input type="checkbox" name="consent" checked={values.consent} onChange={e => set('consent', e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-mk-purple" {...aria('consent')} />
          I agree that GrowthPrint can store these details to review my inquiry and reply to me.
        </label>
        {err('consent')}
      </div>

      {submitError && (
        <p role="alert" className="mt-6 rounded-xl border border-gp-danger/40 bg-gp-danger-soft px-4 py-3 text-[14px] text-gp-text">{submitError}</p>
      )}

      <button type="submit" disabled={pending}
        className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-mk-purple to-mk-blue px-8 text-base font-medium text-mk-accent-fg transition-[filter] hover:brightness-105 disabled:cursor-wait disabled:opacity-70 sm:w-auto">
        {pending ? 'Sending…' : <>Send inquiry <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" /></>}
      </button>
    </form>
  );
}
