import React from 'react';
import { useAppSelector } from '../../../store/hooks.ts';
import { StatusBadge, PriorityBadge } from '../../../components/ui/Badges.tsx';
import { CheckCircle2, Clock, Calendar, FileText, Layers } from 'lucide-react';

export function PortalProjectsView() {
  const { currentUser } = useAppSelector(state => state.auth);
  const clientId = currentUser.clientId || 'client-meridian';
  const projects = useAppSelector(state => state.agency.projects.filter(p => p.clientId === clientId));
  const tasks = useAppSelector(state => state.agency.tasks.filter(t => t.clientId === clientId && t.isClientVisible));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Active Projects & Technical Milestones
        </h2>
        <p className="text-xs text-slate-500">
          Real-time visibility into engineering sprints, deliverables, and upcoming delivery target dates.
        </p>
      </div>

      <div className="space-y-8">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Project Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{project.reference}</span>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                <p className="text-xs text-slate-500 max-w-2xl">{project.description}</p>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <div className="text-xs text-slate-400 font-medium">Target Delivery</div>
                <div className="text-sm font-bold text-slate-800">{project.targetCompletionDate}</div>
                <div className="text-xs text-blue-600 font-medium">Lead: {project.assignedLead}</div>
              </div>
            </div>

            {/* Progress Bar Strip */}
            <div className="px-6 py-4 bg-white border-b border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <span className="font-medium">Milestone Completion</span>
                <span className="font-bold text-slate-900 tabular-nums">{project.progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Milestones & Deliverables 2-Column Split */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Milestones */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sprint Milestones</span>
                </h4>

                <div className="space-y-3">
                  {project.milestones.map((m) => (
                    <div 
                      key={m.id} 
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        m.status === 'COMPLETED'
                          ? 'bg-emerald-50/40 border-emerald-200 text-slate-700'
                          : m.status === 'IN_PROGRESS'
                          ? 'bg-blue-50/40 border-blue-200 text-slate-900 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                          m.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-300'
                        }`} />
                        <span>{m.title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{m.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Scope Deliverables</span>
                </h4>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  {project.deliverables.map((deliv, dIdx) => (
                    <li key={dIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Client Visible Tasks for this project */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Client-Visible Tasks ({tasks.filter(t => t.projectId === project.id).length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tasks.filter(t => t.projectId === project.id).map(t => (
                  <div key={t.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">{t.title}</div>
                      <p className="text-[11px] text-slate-500">{t.description}</p>
                      <div className="text-[10px] text-slate-400">Assigned: {t.assignedTo} · Due {t.dueDate}</div>
                    </div>
                    <PriorityBadge priority={t.priority} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
