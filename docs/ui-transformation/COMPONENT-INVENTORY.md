# Component inventory (one component per job)

**Status key:**
- **E** exists and is reused;
- **R** exists, restyle only (same props);
- **N** new;
- **D** deferred until a backend change.

| Component | Status | Location | Notes |
|---|---|---|---|
| `AppShell` (sidebar, top bar, rail, drawer, user menu) | R | `components/shell/AppShell.tsx` | Built in the navy phase. Switch to a white sidebar, icon tiles and a solid teal active state; the title moves into the content |
| `SidebarNavItem`, `SidebarGroup` (collapsible) | R/N | inside AppShell | Add collapsible groups and danger/primary badges |
| `TopBar` (search, notifications, help, settings, avatar) | R | AppShell plus `NotificationDropdown`, `CommandPalette`, `KeyboardShortcutsModal` | Existing behaviour kept |
| `PageHeader` (title, description, breadcrumb, actions, period filter) | R | `components/ui/workspace-kit.tsx` | Used by every module |
| `KpiCard` | R | `components/ui/app-kit.tsx` | COMPREO layout: icon tile at the left, label, value, delta. `Badges` `StatCard` and workspace `StatCard` delegate to it |
| `SummaryStrip` (compact metrics) | N | app-kit | For module headers |
| `ChartPanel` plus presets `AreaTrend`, `DonutBreakdown`, `HorizontalBars`, `ComboBarLine`, `GroupedBars` | N | `components/charts/*` (Recharts, loaded with `next/dynamic`) | One palette and axis style |
| `DataTable` (toolbar, sort, filters, numbered pagination, export) | R | `components/ui/DataTable.tsx` | Already numbered and humanized; restyle density (48px rows) |
| `TableShell` and `Pagination` (workspace) | R | workspace-kit | Same style as DataTable |
| `FilterBar` (search plus selects plus chips) | N | app-kit | Shared by Leads, Clients, Projects, Analytics |
| `Button`, `IconButton`, `TextField`, `SelectField`, `PasswordField`, `Textarea`, `Checkbox`, `Switch` | R/N | `components/ui/forms.tsx` | `Switch` is new |
| `StatusBadge`, `PriorityBadge`, `StatusPill` | R | Badges, workspace-kit | Semantic tones with on-white text colours |
| `Dialog`, `ConfirmDialog` | R | workspace-kit, ConfirmDialog | Focus trap and Escape (exist) |
| `Drawer` (right side) | N | workspace-kit | Shares Dialog's focus management; used for lead, client and invoice details |
| `Tabs` (underline) | N | app-kit | Detail pages and settings |
| `DropdownMenu` | N | app-kit | Roving focus; the user menu already implements the pattern |
| `ActivityFeed` | R | workspace `ActivityList`, dashboard list | One component |
| `ProgressBar` | N | app-kit | `role="progressbar"` with value |
| `EmptyState`, `ErrorState`, `Skeleton`, `Notice` | E/R | forms, AsyncState | Unify styling |
| `Toast` | R | ToastContainer | |
| Auth: `AuthShell` | R | features/auth | COMPREO tone |
| Public: header, hero, services, work, process, why, FAQ, footer, inquiry modal | R | features/public | Reference C composition; agency positioning |
| Automation: `EditorShell`, `Toolbar`, `Canvas`, `Node`, `Edge`, `Inspector`, `RunLog`, `SaveStatus`, `Publish` | D | — | Needs backend B7 and approval of `@xyflow/react` (MIT) |
