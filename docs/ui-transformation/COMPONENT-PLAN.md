# Component plan (proposal)

Rule: extend existing components and keep their props. Nothing is deleted without a usage check (`grep` of imports).

| Kit component | Existing equivalent | Plan |
|---|---|---|
| `AppShell`, `AdminSidebar`, `SidebarGroup`, `SidebarItem`, `TopBar` | `AdminLayout`, `PortalLayout`, `WorkspaceShell` (three copies of similar markup) | Create one presentational `components/shell/AppShell.tsx` (sidebar, top bar, drawer, icon rail). Each layout keeps its own state and props and passes nav items, badges and actions in. Logic stays in the three layouts |
| `GlobalSearch` | CommandPalette trigger in AdminLayout | Reuse; top-bar search field opens the palette |
| `Breadcrumbs`, `PageHeader`, `PageContent` | `workspace-kit` `PageHeader` | Reuse; restyle to the spec |
| `WorkspaceSwitcher` | `BusinessSwitcher` (workspace) | Reuse; move into the top bar context slot |
| `UserMenu` | Avatar button (opens Settings) | New small accessible menu (Settings, Sign out). Sign-out calls the existing `logout` thunk |
| `NotificationMenu` | `NotificationDropdown` | Restyle only |
| `MetricCard`, `MetricDelta` | `app-kit` `KpiCard`, `workspace-kit` `StatCard`, `Badges` `StatCard` | Consolidate on `KpiCard` styling. The other two keep their APIs but render the same markup |
| `ChartPanel` | `app-kit` `Panel` plus Recharts | Add `ChartPanel` (panel plus legend slot plus optional period select). Load Recharts with `next/dynamic` |
| `DataTable`, `TableToolbar`, `TablePagination` | `components/ui/DataTable.tsx`, `workspace-kit` `Pagination`/`TableShell` | Restyle DataTable (density, header, numbered pagination). Make `Pagination` numbered too |
| `StatusBadge`, `PriorityBadge` | `Badges.tsx`, `workspace-kit` `StatusPill` | Same semantic tone map, 6px radius chips |
| `ProgressIndicator` | Inline bars in views | Small shared `ProgressBar` (value, label, `aria-valuenow`) |
| `Avatar`, `AvatarStack` | `forms.tsx` `Avatar` | Reuse; add stack only where team lists need it |
| `ActivityFeed`, `Timeline` | `workspace` `ActivityList`, dashboard list, `AdminActivityView` | One `ActivityFeed` with icon dot, title, metadata and relative time |
| `KeyValueList` | `workspace-kit` `DefinitionList` | Reuse |
| `EmptyState`, `Skeleton` | `forms.tsx`, `AsyncState.tsx` | Merge styling; keep both exports |
| `FormField`, `TextInput`, `Select`, `Textarea`, `Checkbox`, `RadioGroup` | `forms.tsx` | Restyle (36px, 7px radius) |
| `Switch` | Inline toggles in settings | Shared `Switch` (button `role="switch"`) |
| `DatePicker`, `DateRangePicker`, `Combobox` | Native inputs | Keep native (accessible, no dependency). No new pickers unless a module needs a range |
| `Button`, `IconButton` | `forms.tsx` `Button`, `LoadingButton`, inline buttons | `Button` gains `size="sm"` and an icon-only variant. Inline buttons move to `Button` view by view |
| `DropdownMenu`, `Popover`, `Tooltip` | `Tooltip.tsx`, hand-rolled menus | Hand-rolled with roving focus. Radix only if approved |
| `Dialog`, `AlertDialog`, `Drawer` | `workspace-kit` `Dialog`, `ConfirmDialog`, several ad-hoc modals | Reuse `Dialog`; add a `Drawer` variant (same focus trap). Ad-hoc modals keep their logic and adopt the classes |
| `Tabs` | `FilterTabs`, segmented buttons | Underline `Tabs` for page sections; `FilterTabs` for filters |
| `Toast` | `ToastContainer` | Restyle |
| Automation editor set (`AutomationEditorShell`, `Canvas`, `Node`, `Edge`, `NodePalette`, `NodeInspector`, `RunHistory`, `ExecutionLog`, `CanvasControls`, `MiniMap`, `SaveStatus`, `PublishControl`) | None (no editor, no backend) | **Deferred** to a future phase. Needs a backend graph schema and approval of `@xyflow/react` |
