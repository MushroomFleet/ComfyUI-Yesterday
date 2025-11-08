# DJZ-Yesterday - Phase 0: Project Overview

## Project Summary

**DJZ-Yesterday** is a calendar-based scheduling application for ComfyUI workflows. It extends the existing `comfy-flow-runner-basic` application by adding workflow library management and time-based scheduling capabilities. The application allows users to organize "baked" workflows (complete API-format JSON files with no user modifications) into a library, tag them for organization, and schedule them for execution at specific dates and times using a visual calendar interface.

**Repository:** https://github.com/MushroomFleet/ComfyUI-Yesterday

**Key Design Principles:**
- **Minimalist Approach**: No prompt alterations, no image inputs, no workflow modifications
- **Baked Workflows**: Each workflow is complete and self-contained
- **Simple Orchestration**: Calendar-based scheduling for planned content generation
- **Library Management**: Organized workflow storage with tagging and filtering
- **NSL Branding**: Follows NSL design system (dark purple/violet with golden accents)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DJZ-Yesterday Application                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────┐         ┌─────────────────────┐    │
│  │  API Flow Manager  │         │  Calendar Scheduler │    │
│  │                    │         │                     │    │
│  │  • Upload JSON     │         │  • Calendar View    │    │
│  │  • Rename/Delete   │         │  • Task Cards       │    │
│  │  • Custom Tags     │         │  • Date/Time Select │    │
│  │  • Filter Library  │         │  • Workflow Assign  │    │
│  │  • Card Display    │         │                     │    │
│  └────────────────────┘         └─────────────────────┘    │
│           │                               │                  │
│           └───────────┬───────────────────┘                 │
│                       │                                      │
│           ┌───────────▼───────────┐                         │
│           │   Storage Layer       │                         │
│           │                       │                         │
│           │  • IndexedDB          │                         │
│           │  • Workflow Library   │                         │
│           │  • Scheduled Tasks    │                         │
│           │  • Tags/Metadata      │                         │
│           └───────────┬───────────┘                         │
│                       │                                      │
│           ┌───────────▼───────────┐                         │
│           │  Execution Engine     │                         │
│           │                       │                         │
│           │  • Task Queue         │                         │
│           │  • Scheduler Service  │                         │
│           │  • ComfyUI Interface  │                         │
│           └───────────────────────┘                         │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
            ┌───────────▼───────────┐
            │   ComfyUI Server      │
            │   (localhost:8188)    │
            │                       │
            │   • Workflow Execution│
            │   • WebSocket Updates │
            │   • Image Generation  │
            └───────────────────────┘
```

## Core Features

### 1. API Flow Manager (Workflow Library)
- Upload, rename, and delete workflow JSON files
- Card-based display with workflow information
- Custom tagging system (task_type, media_format, model_name)
- Tag-based filtering
- Search functionality
- Workflow preview/details view

### 2. Calendar-Based Scheduler
- Visual calendar interface using a date picker component
- Time slot selection for scheduling
- Task/appointment cards representing scheduled jobs
- Drag-and-drop workflow assignment to dates
- Visual indication of scheduled vs. executed tasks
- Task status tracking (pending, running, completed, failed)

### 3. Execution Engine
- Background task scheduler checking for due tasks
- Queue management for scheduled workflows
- Integration with existing ComfyUI service layer
- Automatic execution at scheduled times
- Progress monitoring and status updates
- Error handling and retry logic

### 4. Testing Features
- Retain existing "Upload Workflow" button for ad-hoc testing
- Quick execute option for testing new workflows
- Preview execution without scheduling

## Phase Breakdown

### Phase 1: Data Models and Storage Layer
**Goal:** Establish the data structure and persistence layer for workflows and scheduled tasks

**Duration:** 2-3 days

**Dependencies:** None (builds on existing architecture)

**Deliverables:**
- TypeScript interfaces for WorkflowLibrary and ScheduledTask
- IndexedDB schema and service layer
- CRUD operations for workflows and tasks
- Migration utilities for existing data
- Storage service with React hooks integration

**Key Files Created:**
- `src/types/workflow-library.types.ts`
- `src/types/scheduled-task.types.ts`
- `src/services/storage.service.ts`
- `src/hooks/useWorkflowLibrary.ts`
- `src/hooks/useScheduledTasks.ts`

---

### Phase 2: API Flow Manager (Library Interface)
**Goal:** Create the workflow library management UI with tagging and filtering

**Duration:** 3-4 days

**Dependencies:** Phase 1 (Storage Layer)

**Deliverables:**
- Workflow library page with card grid layout
- Upload workflow modal with metadata input
- Tag management system (add, edit, remove tags)
- Filter panel with tag-based filtering
- Rename and delete workflow functionality
- Workflow detail view modal
- Search functionality

**Key Components:**
- `src/pages/WorkflowLibrary.tsx`
- `src/components/library/WorkflowCard.tsx`
- `src/components/library/WorkflowUploadModal.tsx`
- `src/components/library/WorkflowDetailModal.tsx`
- `src/components/library/TagFilterPanel.tsx`
- `src/components/library/WorkflowActions.tsx`

**Styling:** NSL brand colors with card-based layout, purple primary, golden accents

---

### Phase 3: Calendar UI and Scheduling Interface
**Goal:** Build the calendar view and task appointment card system

**Duration:** 4-5 days

**Dependencies:** Phase 1, Phase 2

**Deliverables:**
- Calendar page with monthly view
- Date picker integration
- Time slot selector
- Task appointment cards on calendar
- Drag-and-drop or click-to-assign workflow to date
- Task status indicators (pending, running, completed, failed)
- Edit/delete scheduled task functionality
- Task detail view

**Key Components:**
- `src/pages/Calendar.tsx`
- `src/components/calendar/CalendarView.tsx`
- `src/components/calendar/TaskCard.tsx`
- `src/components/calendar/ScheduleTaskModal.tsx`
- `src/components/calendar/TimeSlotSelector.tsx`
- `src/components/calendar/WorkflowSelector.tsx`

**Libraries to Add:**
- `react-big-calendar` or `@fullcalendar/react` for calendar UI
- `date-fns` (already included) for date manipulation

---

### Phase 4: Task Scheduling Engine
**Goal:** Implement the background scheduler that executes tasks at scheduled times

**Duration:** 3-4 days

**Dependencies:** Phase 1, Phase 3

**Deliverables:**
- Scheduler service that polls for due tasks
- Task queue management system
- Integration with existing ComfyUI service
- Status update mechanisms
- Error handling and retry logic
- Notification system for task completion
- Task history tracking

**Key Files:**
- `src/services/scheduler.service.ts`
- `src/services/task-queue.service.ts`
- `src/hooks/useScheduler.ts`
- `src/utils/task-execution.utils.ts`

**Technical Approach:**
- Use `setInterval` or Web Workers for background checking
- Check every 60 seconds for tasks within next 5 minutes
- Execute via existing ComfyUI service layer
- Update task status in IndexedDB
- Emit events for UI updates

---

### Phase 5: Integration and Navigation
**Goal:** Connect all components, implement routing, and ensure seamless flow

**Duration:** 2-3 days

**Dependencies:** Phase 2, Phase 3, Phase 4

**Deliverables:**
- Updated navigation with new routes
- Header/sidebar with navigation links
- Route protection and state management
- Cross-component communication
- Testing workflow button integration
- Settings page for scheduler configuration
- Responsive layout adjustments

**Key Updates:**
- `src/App.tsx` - Add new routes
- `src/components/layout/Sidebar.tsx` - Add navigation items
- `src/components/layout/Header.tsx` - Update with new links
- `src/pages/Settings.tsx` - Scheduler settings
- `src/components/TestWorkflow.tsx` - Retain existing quick test feature

**New Routes:**
- `/` - Dashboard (overview of upcoming tasks)
- `/library` - API Flow Manager
- `/calendar` - Calendar Scheduler
- `/history` - Task execution history
- `/settings` - Application settings

---

### Phase 6: Polish, Testing, and Documentation
**Goal:** Refine UI/UX, add comprehensive testing, and create documentation

**Duration:** 2-3 days

**Dependencies:** All previous phases

**Deliverables:**
- Complete NSL branding application
- Animation and transition polish
- Loading states and error boundaries
- Toast notifications for user feedback
- Comprehensive README
- User guide documentation
- API documentation
- Known issues and troubleshooting guide

**Polish Items:**
- Smooth transitions between views
- Loading skeletons for async operations
- Empty states for library and calendar
- Confirmation dialogs for destructive actions
- Keyboard shortcuts
- Accessibility improvements (ARIA labels, focus management)
- Mobile responsive adjustments

**Testing:**
- Component unit tests
- Integration tests for storage layer
- End-to-end workflow scheduling test
- Cross-browser compatibility testing

**Documentation Files:**
- `README.md` - Main project documentation
- `docs/USER_GUIDE.md` - End-user instructions
- `docs/DEVELOPMENT.md` - Developer setup guide
- `docs/API.md` - API and service documentation
- `docs/TROUBLESHOOTING.md` - Common issues

---

## Technology Stack

### Frontend Framework
- **React 18.3** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool and dev server

### UI Components
- **shadcn/ui** - Base component library
- **Radix UI** - Primitive components
- **Lucide React** - Icon system
- **Tailwind CSS 3.4** - Utility-first CSS (NSL custom config)

### State Management & Data
- **TanStack Query** - Server state management
- **IndexedDB** - Client-side storage (via idb or Dexie.js)
- **Zustand** (optional) - For scheduler state management

### Calendar & Date
- **react-big-calendar** or **@fullcalendar/react** - Calendar UI
- **date-fns** - Date manipulation (already included)

### Existing Services (Preserved)
- **comfyui.service.ts** - ComfyUI API integration
- **websocket.service.ts** - Real-time updates

### New Services (To Be Created)
- **storage.service.ts** - IndexedDB wrapper
- **scheduler.service.ts** - Task scheduling logic
- **task-queue.service.ts** - Queue management

## Data Models

### WorkflowLibraryItem
```typescript
interface WorkflowLibraryItem {
  id: string;                    // UUID
  name: string;                  // Display name
  fileName: string;              // Original filename
  workflow: ComfyUIWorkflow;     // Complete JSON workflow
  tags: string[];                // ["t2i", "image", "SDXL"]
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    nodeCount?: number;
    estimatedDuration?: number;  // seconds
    description?: string;
  };
}
```

### ScheduledTask
```typescript
interface ScheduledTask {
  id: string;                    // UUID
  workflowId: string;            // Reference to WorkflowLibraryItem
  workflowName: string;          // Cached for display
  scheduledTime: Date;           // When to execute
  status: TaskStatus;            // pending, running, completed, failed
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  promptId?: string;             // ComfyUI prompt_id when executing
  error?: string;                // Error message if failed
  outputs?: {                    // Generated images/outputs
    images: string[];
    videos?: string[];
  };
  retryCount: number;
  maxRetries: number;
}

type TaskStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';
```

### TagCategory (for organization)
```typescript
interface TagCategory {
  taskType: string[];      // ["t2i", "i2i", "video", "upscale", "animation"]
  mediaFormat: string[];   // ["image", "video", "audio"]
  modelName: string[];     // ["SDXL", "SD15", "Flux", "AnimateDiff"]
  custom: string[];        // User-defined tags
}
```

## Storage Schema (IndexedDB)

### Object Stores

**workflowLibrary**
- Key: `id` (string)
- Indexes: `name`, `createdAt`, `tags` (multi-entry)

**scheduledTasks**
- Key: `id` (string)
- Indexes: `scheduledTime`, `status`, `workflowId`

**taskHistory**
- Key: `id` (string)
- Indexes: `completedAt`, `workflowId`, `status`

## User Flow Examples

### Flow 1: Adding a Workflow to Library
1. User navigates to "API Flow Manager"
2. Clicks "Upload Workflow" button
3. Selects ComfyUI API format JSON file
4. Modal appears with:
   - Auto-detected filename
   - Name input field (editable)
   - Tag input (suggestions: t2i, i2i, video, image, SDXL, etc.)
   - Description textarea (optional)
5. User adds tags: "t2i", "image", "SDXL"
6. Clicks "Add to Library"
7. Workflow card appears in library grid

### Flow 2: Scheduling a Workflow
1. User navigates to "Calendar"
2. Clicks on a date (e.g., November 15, 2025)
3. Time slot selector appears
4. User selects time (e.g., 2:30 PM)
5. Workflow selector modal opens showing library
6. User filters by tag "t2i" and selects a workflow
7. Clicks "Schedule"
8. Task appointment card appears on calendar at selected date/time
9. Status shows as "Pending"

### Flow 3: Automatic Execution
1. Scheduler service runs every 60 seconds
2. At 2:28 PM, scheduler detects task due in 2 minutes
3. At 2:30 PM, scheduler:
   - Updates task status to "running"
   - Sends workflow to ComfyUI via existing service
   - Monitors progress via WebSocket
   - Updates UI in real-time
4. On completion:
   - Updates status to "completed"
   - Stores output image URLs
   - Shows notification to user
5. Task card on calendar updates to show "Completed" with green indicator

### Flow 4: Testing a New Workflow (Preserved Feature)
1. User has new workflow JSON to test
2. Clicks "Test Workflow" button (existing feature, kept in header)
3. Uploads JSON file
4. Executes immediately without scheduling
5. Monitors progress in real-time
6. Views results
7. If satisfied, can add to library via "Add to Library" button

## UI Layout Structure

### Main Application Layout
```
┌────────────────────────────────────────────────────┐
│  Header: DJZ-Yesterday Logo | Nav | Test Button    │
├──────────┬─────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │         Main Content Area                │
│          │                                          │
│ - Home   │  Router Outlet:                          │
│ - Library│  - Dashboard                             │
│ - Calendar│  - API Flow Manager                     │
│ - History│  - Calendar Scheduler                    │
│ - Settings│  - Task History                         │
│          │  - Settings                              │
│          │                                          │
└──────────┴─────────────────────────────────────────┘
```

### API Flow Manager Layout
```
┌────────────────────────────────────────────────────┐
│  API Flow Manager                                  │
│  ┌──────────────┐  [Upload Workflow] [Search Box] │
├──┴──────────────┴──────────────────────────────────┤
│  Tag Filters: [All] [t2i] [i2i] [video] [SDXL] ... │
├────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │ Workflow 1 │ │ Workflow 2 │ │ Workflow 3 │    │
│  │ [Image]    │ │ [Image]    │ │ [Image]    │    │
│  │ Name       │ │ Name       │ │ Name       │    │
│  │ Tags       │ │ Tags       │ │ Tags       │    │
│  │ [Actions]  │ │ [Actions]  │ │ [Actions]  │    │
│  └────────────┘ └────────────┘ └────────────┘    │
│                                                    │
│  ┌────────────┐ ┌────────────┐                    │
│  │ Workflow 4 │ │ Workflow 5 │    ...             │
│  └────────────┘ └────────────┘                    │
└────────────────────────────────────────────────────┘
```

### Calendar Scheduler Layout
```
┌────────────────────────────────────────────────────┐
│  Calendar Scheduler          [Month] [Year]        │
├────────────────────────────────────────────────────┤
│  Sun   Mon   Tue   Wed   Thu   Fri   Sat          │
├────────────────────────────────────────────────────┤
│         1     2     3     4     5     6            │
│                                                    │
│   7     8     9    10    11    12    13            │
│              ┌──────────┐                          │
│  14    15    16    17    18    19    20            │
│        ▼                                           │
│  ┌─────────────────────┐                          │
│  │ Task: Workflow A    │                          │
│  │ Time: 2:30 PM       │                          │
│  │ Status: Pending 🟡  │                          │
│  └─────────────────────┘                          │
│  21    22    23    24    25    26    27            │
│                                                    │
│  28    29    30                                    │
└────────────────────────────────────────────────────┘
```

## NSL Branding Implementation

### Color Usage

**Primary Elements (Purple/Violet):**
- Navigation sidebar background
- Active navigation items
- Primary buttons (Schedule Task, Add Workflow)
- Links and interactive text
- Workflow card borders on hover
- Task status indicators (pending = primary glow)

**Accent Elements (Golden/Amber):**
- Call-to-action buttons (Upload Workflow)
- Important status indicators
- Completed task badges
- Success notifications
- Highlight effects on selected items

**Background/Card System:**
- Page background: `hsl(250 24% 10%)`
- Card background: `hsl(250 20% 14%)`
- Elevated elements: `hsl(250 24% 12%)`

**Status Colors:**
- Pending: Primary (`hsl(263 70% 60%)`)
- Running: Primary Glow (`hsl(263 80% 70%)`)
- Completed: Success (`hsl(142 71% 45%)`)
- Failed: Destructive (`hsl(0 72% 51%)`)
- Cancelled: Muted (`hsl(250 10% 65%)`)

### Component Styling Examples

**Workflow Card:**
```css
bg-card rounded-lg p-6 shadow-elegant 
hover:shadow-glow transition-smooth hover:-translate-y-1
border border-border hover:border-primary
```

**Primary Button:**
```css
bg-primary text-primary-foreground 
hover:bg-primary/90 rounded-md px-4 py-2 
font-medium transition-smooth
```

**Accent CTA Button:**
```css
bg-accent text-accent-foreground 
hover:bg-accent/90 rounded-md px-6 py-3 
font-medium transition-smooth shadow-accent
```

**Task Card:**
```css
bg-card rounded-md p-4 border-l-4
border-l-primary (for pending)
border-l-success (for completed)
shadow-sm hover:shadow-glow transition-smooth
```

## Success Criteria

### Phase 1 Complete When:
- [x] All TypeScript interfaces defined
- [x] IndexedDB schema created
- [x] CRUD operations working
- [x] React hooks return correct data
- [x] Sample data can be stored and retrieved

### Phase 2 Complete When:
- [x] Workflows can be uploaded via UI
- [x] Workflows display in card grid
- [x] Tags can be added, edited, removed
- [x] Filtering by tags works correctly
- [x] Workflows can be renamed and deleted
- [x] Search functionality filters library

### Phase 3 Complete When:
- [x] Calendar displays current month
- [x] Tasks appear on calendar dates
- [x] Users can schedule tasks via modal
- [x] Date/time selection works intuitively
- [x] Task cards show status correctly
- [x] Tasks can be edited or deleted

### Phase 4 Complete When:
- [x] Scheduler runs in background
- [x] Tasks execute at scheduled time
- [x] Status updates reflect in real-time
- [x] Errors are handled gracefully
- [x] Task history is maintained
- [x] Notifications inform user of completion

### Phase 5 Complete When:
- [x] All pages accessible via navigation
- [x] Routes work without page reload
- [x] State persists across navigation
- [x] Test workflow button still functional
- [x] Settings page controls scheduler
- [x] Responsive layout works on mobile

### Phase 6 Complete When:
- [x] NSL branding fully applied
- [x] All animations smooth and polished
- [x] Empty states handled elegantly
- [x] Error boundaries catch failures
- [x] README complete with setup instructions
- [x] User guide covers all features
- [x] No critical bugs remain

## Project Timeline

**Total Estimated Duration:** 18-24 days

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1 | 2-3 days | Day 1 | Day 3 |
| Phase 2 | 3-4 days | Day 4 | Day 7 |
| Phase 3 | 4-5 days | Day 8 | Day 12 |
| Phase 4 | 3-4 days | Day 13 | Day 16 |
| Phase 5 | 2-3 days | Day 17 | Day 19 |
| Phase 6 | 2-3 days | Day 20 | Day 22 |
| Buffer | 2 days | Day 23 | Day 24 |

**Recommended Approach:**
- Work sequentially through phases
- Complete all deliverables before moving to next phase
- Use buffer time for unexpected issues
- Can parallelize Phase 2 and Phase 3 if multiple developers

## Development Environment Setup

### Prerequisites
- Node.js 18+ or Bun
- ComfyUI running locally on port 8188
- Git for version control
- VS Code (recommended) with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

### Initial Setup
```bash
# Clone repository
git clone https://github.com/MushroomFleet/ComfyUI-Yesterday.git
cd ComfyUI-Yesterday

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

### Project Structure (After All Phases)
```
comfyui-yesterday/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── library/
│   │   │   ├── WorkflowCard.tsx
│   │   │   ├── WorkflowUploadModal.tsx
│   │   │   ├── WorkflowDetailModal.tsx
│   │   │   ├── TagFilterPanel.tsx
│   │   │   └── WorkflowActions.tsx
│   │   ├── calendar/
│   │   │   ├── CalendarView.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── ScheduleTaskModal.tsx
│   │   │   ├── TimeSlotSelector.tsx
│   │   │   └── WorkflowSelector.tsx
│   │   ├── shared/
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── ui/ (shadcn components)
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── WorkflowLibrary.tsx
│   │   ├── Calendar.tsx
│   │   ├── TaskHistory.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   ├── comfyui.service.ts (existing)
│   │   ├── websocket.service.ts (existing)
│   │   ├── storage.service.ts
│   │   ├── scheduler.service.ts
│   │   └── task-queue.service.ts
│   ├── hooks/
│   │   ├── useWorkflowLibrary.ts
│   │   ├── useScheduledTasks.ts
│   │   ├── useScheduler.ts
│   │   └── useTaskExecution.ts
│   ├── types/
│   │   ├── comfyui.types.ts (existing)
│   │   ├── workflow-library.types.ts
│   │   └── scheduled-task.types.ts
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── task-execution.utils.ts
│   │   └── validation.utils.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   ├── Phase0.md (this file)
│   ├── Phase1.md
│   ├── Phase2.md
│   ├── Phase3.md
│   ├── Phase4.md
│   ├── Phase5.md
│   ├── Phase6.md
│   ├── USER_GUIDE.md
│   ├── DEVELOPMENT.md
│   ├── API.md
│   └── TROUBLESHOOTING.md
├── public/
├── package.json
├── tailwind.config.ts (with NSL colors)
├── vite.config.ts
└── README.md
```

## Risk Mitigation

### Technical Risks

**Risk:** IndexedDB browser compatibility issues
- **Mitigation:** Use Dexie.js library for better cross-browser support
- **Fallback:** Provide localStorage fallback for critical data

**Risk:** Scheduler accuracy (browser throttling when tab inactive)
- **Mitigation:** Consider Web Workers for background scheduling
- **Documentation:** Warn users to keep tab/app open during critical scheduled times
- **Future Enhancement:** Build Electron version for always-on scheduling

**Risk:** ComfyUI server unavailable at scheduled time
- **Mitigation:** Implement retry logic with exponential backoff
- **UI Feedback:** Clear status indicators for connection issues
- **Manual Trigger:** Allow users to manually retry failed tasks

**Risk:** Large workflow library performance
- **Mitigation:** Implement virtual scrolling for grid
- **Pagination:** Lazy load workflows as user scrolls
- **Indexing:** Use IndexedDB indexes for efficient filtering

### UX Risks

**Risk:** Confusing workflow vs. task terminology
- **Mitigation:** Clear labeling and tooltips
- **Documentation:** Glossary of terms in user guide
- **Onboarding:** First-time user tutorial

**Risk:** Accidental workflow or task deletion
- **Mitigation:** Confirmation dialogs for destructive actions
- **Undo Feature:** Allow undo within short timeframe
- **Soft Delete:** Mark as deleted, permanently remove after 30 days

**Risk:** Timezone confusion for scheduling
- **Mitigation:** Display timezone clearly in UI
- **Settings:** Allow timezone configuration
- **Validation:** Confirm scheduled time before saving

## Open Questions & Decisions Needed

1. **Calendar Library Choice:**
   - Option A: `react-big-calendar` (more customizable, larger bundle)
   - Option B: `@fullcalendar/react` (feature-rich, premium features paid)
   - Option C: Build custom calendar (full control, more dev time)
   - **Recommendation:** react-big-calendar for balance of features and bundle size

2. **Scheduler Implementation:**
   - Option A: `setInterval` in main thread (simple, may be throttled)
   - Option B: Web Workers (more reliable, added complexity)
   - Option C: Service Worker (persistent, complex setup)
   - **Recommendation:** Start with setInterval, migrate to Web Workers in Phase 6 if needed

3. **Task Execution on Missed Schedule:**
   - Option A: Execute immediately when detected (user may not want this)
   - Option B: Mark as missed, require manual trigger (safer default)
   - Option C: User-configurable in settings (most flexible)
   - **Recommendation:** Option C with default to Option B

4. **Multi-Task Execution:**
   - Option A: Allow multiple tasks at same time (risk of resource exhaustion)
   - Option B: Queue tasks, execute one at a time (slower but safer)
   - Option C: User-configurable concurrent limit (flexible)
   - **Recommendation:** Option B by default, Option C in settings

5. **Workflow Storage Size Limit:**
   - Some workflows can be large (especially with embedded images)
   - **Decision Needed:** Set max workflow size (e.g., 10MB)? Warn user?
   - **Recommendation:** 10MB soft limit with warning, 50MB hard limit

## Next Steps

To begin development:

1. **Read Phase1.md** for detailed implementation of Data Models and Storage Layer
2. **Set up development environment** as described above
3. **Create a new branch** from main: `git checkout -b feature/phase1-storage`
4. **Follow Phase 1 instructions** step-by-step
5. **Verify success criteria** before moving to Phase 2

Each subsequent phase builds on the previous, so it's critical to complete phases in order and verify all deliverables before proceeding.

## Glossary

- **Workflow**: ComfyUI API format JSON file containing complete node graph
- **Task**: Scheduled execution of a workflow at specific date/time
- **Appointment Card**: Visual representation of a task on the calendar
- **Baked Workflow**: Complete, self-contained workflow requiring no user input
- **API Flow**: Alternate term for workflow (emphasizes API format)
- **Library**: Collection of stored workflows available for scheduling
- **Scheduler**: Background service that monitors and executes scheduled tasks

---

**Document Version:** 1.0
**Last Updated:** November 8, 2025
**Author:** Development Team
**Status:** Initial Planning Complete

**Related Documents:**
- Phase1.md - Data Models and Storage Layer (next)
- NSL-brand-guidance.md - Styling reference
- comfy-flow-runner-basic README - Existing app documentation