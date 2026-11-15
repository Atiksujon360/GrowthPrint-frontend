/**
 * Marketing copy for the public homepage, in one place. Everything here is a statement about what GrowthPrint
 * offers or how it works; there are no client names, results, statistics, certifications or prices.
 */

export const NAV_LINKS = [
  { label: 'Home', href: '/#top', section: 'top' },
  { label: 'About Us', href: '/#about', section: 'about' },
  { label: 'Services', href: '/#services', section: 'services' },
  { label: 'Our Work', href: '/#work', section: 'work' },
  { label: 'Insights', href: '/insights', section: null },
] as const;

/**
 * The five services. `category` is the value the inquiry API accepts (LeadEnums.ServiceCategory); the backend has no
 * separate integration or consulting category yet, so those map to the nearest one and the exact service name is sent
 * as the project type.
 */
export const SERVICES = [
  {
    id: 'websites', title: 'Website Development & Modernization', category: 'WEBSITE_MAINTENANCE',
    summary: 'Fast, responsive websites and web applications, or a careful rebuild of the one you already have.',
    points: ['Business websites', 'React and Next.js applications', 'Responsive user experiences', 'Performance optimization', 'Website maintenance'],
  },
  {
    id: 'software', title: 'Custom Software Development', category: 'SOFTWARE_DEV',
    summary: 'Software shaped around how your business actually runs, built to grow with it.',
    points: ['Business applications', 'Client portals', 'Internal management systems', 'Custom dashboards', 'Scalable platforms'],
  },
  {
    id: 'automation', title: 'AI & Business Automation', category: 'BUSINESS_AUTOMATION',
    summary: 'Hand the repetitive steps to software, and use AI where it saves real time.',
    points: ['Workflow automation', 'AI-assisted processes', 'n8n integrations', 'Document processing', 'Operational automation'],
  },
  {
    id: 'integration', title: 'API & System Integration', category: 'SOFTWARE_DEV',
    summary: 'Connect the tools you already pay for so data moves once and stays in step.',
    points: ['REST API integration', 'Third-party connections', 'CRM integration', 'Data synchronisation', 'Backend integration'],
  },
  {
    id: 'consulting', title: 'Technical Consulting & Support', category: 'WEBSITE_MAINTENANCE',
    summary: 'A senior engineering view before you commit, and steady support after you launch.',
    points: ['Architecture consulting', 'Application modernization', 'Performance reviews', 'Technical maintenance', 'Ongoing engineering support'],
  },
] as const;

export type ServiceId = (typeof SERVICES)[number]['id'];

export const HIGHLIGHTS = [
  { title: 'Build', text: 'Modern websites and applications.' },
  { title: 'Connect', text: 'APIs and business systems.' },
  { title: 'Automate', text: 'Intelligent workflows and AI integration.' },
  { title: 'Improve', text: 'Maintenance and continuous engineering.' },
] as const;

export const PRINCIPLES = [
  { title: 'Business-focused engineering', text: 'We start from the problem you need solved, not the technology we like to use.' },
  { title: 'Scalable architecture', text: 'Systems are structured so the next feature, user or integration does not mean a rewrite.' },
  { title: 'Practical technical decisions', text: 'Proven tools, clear trade-offs and plain explanations of what each choice costs you.' },
  { title: 'Reliable implementation', text: 'Tested code, reviewed changes and releases you can roll back.' },
  { title: 'Long-term partnership', text: 'We stay available after launch, so the people who built it are the people who support it.' },
  { title: 'Continuous improvement', text: 'Small, regular improvements instead of an expensive rebuild every few years.' },
] as const;

export const PROCESS = [
  { title: 'Discover', text: 'We learn how your business works today, where time is lost and what success looks like.' },
  { title: 'Strategize', text: 'A written scope with priorities, trade-offs and a delivery plan you approve before work starts.' },
  { title: 'Engineer', text: 'Work in short cycles with regular demos, so you see progress and can steer it.' },
  { title: 'Launch', text: 'A planned release with testing, monitoring and a way back if something misbehaves.' },
  { title: 'Improve', text: 'We measure, maintain and refine what we built as your needs change.' },
] as const;

export const ENGAGEMENTS = [
  { title: 'Fixed-scope project', fits: 'A defined product or feature with a clear goal.', gets: 'Agreed scope, timeline and deliverables.' },
  { title: 'Website modernization', fits: 'A website that is slow, dated or hard to update.', gets: 'A rebuilt site with your content and search presence carried over.' },
  { title: 'Automation implementation', fits: 'Manual steps that repeat every day or week.', gets: 'Mapped processes, built workflows and handover documentation.' },
  { title: 'Ongoing maintenance', fits: 'Systems that need to stay secure and up to date.', gets: 'Updates, fixes and small improvements on a regular schedule.' },
  { title: 'Technical consulting', fits: 'A decision you want a second engineering opinion on.', gets: 'A review, a written recommendation and the reasoning behind it.' },
] as const;

export const TECHNOLOGY = [
  { group: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Accessible, responsive UI'] },
  { group: 'Backend', items: ['Java', 'Spring Boot', 'Node.js', 'REST APIs', 'Authentication and access control'] },
  { group: 'Data and infrastructure', items: ['PostgreSQL', 'Docker', 'Cloud deployment', 'CI/CD pipelines', 'Monitoring and health checks'] },
  { group: 'Automation and AI', items: ['n8n', 'Workflow orchestration', 'AI model integration', 'Document processing', 'Third-party APIs'] },
] as const;

export const FAQS = [
  { q: 'What does GrowthPrint do?', a: 'We design, build and support websites, custom software, automations and system integrations for businesses. We also advise on technical decisions and look after systems once they are live.' },
  { q: 'What types of businesses do you work with?', a: 'Small and medium-sized businesses, growing companies, professional service firms, agencies and startups, especially teams held back by an outdated website, manual processes or tools that do not talk to each other.' },
  { q: 'Can you modernize an existing website?', a: 'Yes. We review what you have, keep what works, and rebuild what does not. Your content and search visibility are carried over, and we plan the switch so the site stays available.' },
  { q: 'Do you build custom software?', a: 'Yes: business applications, client portals, internal management systems and dashboards, built around your processes rather than a template.' },
  { q: 'Can you automate our existing workflows?', a: 'Usually, yes. We map the steps first, then automate the repetitive ones with workflow tools such as n8n, direct integrations and AI where it genuinely helps. A person stays in control of the decisions that matter.' },
  { q: 'Do you provide ongoing support?', a: 'Yes. We offer maintenance and engineering support after launch: updates, fixes, monitoring and gradual improvements.' },
  { q: 'How does a project work?', a: 'Discover, strategize, engineer, launch and improve. You get a written scope before work starts, regular demos while we build, and a planned launch. It starts with the form below: tell us what you are trying to achieve.' },
] as const;

/** Inquiry form choices. Values are sent as entered; "not sure" options are sent as blank (the API allows that). */
export const BUDGETS = ['Under $5,000', '$5,000 – $10,000', '$10,000 – $25,000', '$25,000 – $50,000', '$50,000+'] as const;
export const TIMELINES = ['As soon as possible', 'Within 1–2 months', 'Within 3–6 months', 'Just planning ahead'] as const;
