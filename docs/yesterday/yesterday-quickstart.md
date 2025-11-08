# DJZ-Yesterday Development Plan - Quick Start Guide

## 📋 Overview

This development plan follows the **Unfold methodology** - a systematic approach to breaking down complex projects into manageable, sequential phases. Each phase is a complete, self-contained document with step-by-step instructions, code examples, and verification steps.

## 🎯 Project Goals

Transform the existing `comfy-flow-runner-basic` application into **DJZ-Yesterday**, a calendar-based scheduling tool for ComfyUI workflows with:

- **Workflow Library Management**: Upload, organize, and tag workflow JSON files
- **Calendar Scheduling**: Visual calendar interface for scheduling workflow executions
- **Automatic Execution**: Background scheduler that runs workflows at scheduled times
- **NSL Branding**: Beautiful dark purple/violet theme with golden accents

## 📚 Phase Documents

### Phase 0: Project Overview
**[View Phase0.md]**

The master plan that provides:
- Complete project architecture
- All six phase summaries
- Technology stack details
- Success criteria for each phase
- Risk mitigation strategies
- Timeline estimates (18-24 days total)

**Read this first** to understand the full scope.

---

### Phase 1: Data Models and Storage Layer ⭐ START HERE
**[View Phase1.md]**

**Duration:** 2-3 days  
**Status:** Ready to implement

Foundation layer that establishes:
- TypeScript type definitions for all data models
- IndexedDB database schema using Dexie.js
- Storage service with CRUD operations
- React hooks for data access
- Test data generation utilities

**Complete this phase first** - all other phases depend on it.

---

### Phase 2: API Flow Manager (Library Interface)
**Duration:** 3-4 days  
**Status:** To be created after Phase 1

Build the workflow library management UI:
- Card-based grid layout for workflows
- Upload, rename, delete functionality
- Tag management and filtering
- Search capabilities
- Workflow detail views

---

### Phase 3: Calendar UI and Scheduling Interface
**Duration:** 4-5 days  
**Status:** To be created after Phase 2

Create the calendar scheduling system:
- Monthly calendar view
- Task appointment cards
- Date/time selection
- Workflow assignment to dates
- Task status indicators
- Edit/delete scheduled tasks

---

### Phase 4: Task Scheduling Engine
**Duration:** 3-4 days  
**Status:** To be created after Phase 3

Implement automatic execution:
- Background scheduler service
- Task queue management
- ComfyUI integration
- Status updates and error handling
- Retry logic
- Notification system

---

### Phase 5: Integration and Navigation
**Duration:** 2-3 days  
**Status:** To be created after Phase 4

Connect all components:
- Application routing
- Navigation sidebar/header
- Cross-component state management
- Settings page
- Responsive layouts

---

### Phase 6: Polish, Testing, and Documentation
**Duration:** 2-3 days  
**Status:** Final phase

Refinement and completion:
- Complete NSL branding application
- Animations and transitions
- Loading states and error handling
- Comprehensive documentation
- User guide
- Testing

---

## 🚀 How to Use This Plan

### Step 1: Read Phase 0
Start by reading `Phase0.md` to understand:
- The complete architecture
- How all pieces fit together
- Success criteria for the project
- Timeline and resource estimates

### Step 2: Implement Phase 1
Follow `Phase1.md` step-by-step:
1. Install dependencies
2. Create type definitions
3. Set up IndexedDB
4. Build storage services
5. Create React hooks
6. Test everything

### Step 3: Verify Completion
Before moving to the next phase, ensure:
- All deliverables are complete
- All verification checks pass
- No TypeScript errors
- Test data generates successfully

### Step 4: Request Next Phase
Once Phase 1 is complete, request:
- "Create Phase2.md" or
- "Unfold Phase 2" or
- "I've completed Phase 1, what's next?"

The next phase document will be generated with the same level of detail.

### Step 5: Repeat
Continue through phases sequentially. Each phase builds on the previous one, so order matters!

---

## 📁 Document Structure

Each phase document contains:

1. **Phase Overview**
   - Goal and objectives
   - Prerequisites
   - Estimated duration
   - Key deliverables

2. **Step-by-Step Instructions**
   - Detailed implementation steps
   - Purpose explanation for each step
   - Time estimates

3. **Complete Code Examples**
   - Full, runnable code
   - Inline comments
   - Configuration examples

4. **Verification Procedures**
   - How to test each step
   - Success criteria
   - Troubleshooting tips

5. **Completion Checklist**
   - All files created
   - Dependencies installed
   - Functionality verified
   - Handoff to next phase

---

## 🎨 NSL Branding Reference

All UI components must follow the NSL design system from `nsl-app-branding-guidance.md`:

### Colors
- **Primary (Purple):** `hsl(263 70% 60%)` - Main brand color
- **Accent (Golden):** `hsl(38 92% 50%)` - Highlights and CTAs
- **Background:** `hsl(250 24% 10%)` - Dark theme base
- **Card:** `hsl(250 20% 14%)` - Elevated surfaces

### Component Patterns
- Card hover effects with glow shadows
- Smooth transitions (0.3s cubic-bezier)
- Border radius: 0.75rem (12px)
- Consistent spacing using Tailwind scale

### Status Colors
- Pending: Primary purple
- Running: Primary glow
- Completed: Success green `hsl(142 71% 45%)`
- Failed: Destructive red `hsl(0 72% 51%)`

---

## 🛠️ Technology Stack

### Core
- **React 18.3** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool
- **Tailwind CSS 3.4** - Styling (NSL theme)

### New Dependencies (Phase 1)
- **Dexie.js** - IndexedDB wrapper
- **dexie-react-hooks** - React integration
- **uuid** - Unique ID generation

### Future Dependencies
- **react-big-calendar** - Calendar UI (Phase 3)
- **date-fns** - Date utilities (already included)

---

## 📊 Progress Tracking

Use this checklist to track overall progress:

### Phase 1: Data Models and Storage ⏳
- [ ] Dependencies installed
- [ ] Type definitions created
- [ ] Database schema implemented
- [ ] Storage service complete
- [ ] React hooks working
- [ ] Tests passing
- [ ] Phase 1 verification complete

### Phase 2: API Flow Manager ⏸️
- [ ] Workflow library page created
- [ ] Upload modal implemented
- [ ] Tag system working
- [ ] Filtering functional
- [ ] Search implemented
- [ ] Phase 2 verification complete

### Phase 3: Calendar Scheduler ⏸️
- [ ] Calendar view implemented
- [ ] Task cards displaying
- [ ] Schedule modal working
- [ ] Workflow assignment functional
- [ ] Status indicators correct
- [ ] Phase 3 verification complete

### Phase 4: Scheduling Engine ⏸️
- [ ] Scheduler service created
- [ ] Background execution working
- [ ] Queue management functional
- [ ] Error handling complete
- [ ] Notifications working
- [ ] Phase 4 verification complete

### Phase 5: Integration ⏸️
- [ ] Navigation implemented
- [ ] Routes configured
- [ ] State management working
- [ ] Settings page complete
- [ ] Responsive layouts done
- [ ] Phase 5 verification complete

### Phase 6: Polish & Documentation ⏸️
- [ ] NSL branding complete
- [ ] Animations polished
- [ ] Error boundaries added
- [ ] README written
- [ ] User guide created
- [ ] All tests passing
- [ ] **PROJECT COMPLETE** ✅

---

## 🔍 Key Design Decisions

### Workflow Storage
**Decision:** Use IndexedDB instead of localStorage  
**Rationale:** Workflows can be large (10MB+), IndexedDB handles large objects better

### Scheduling Approach
**Decision:** Start with `setInterval`, migrate to Web Workers if needed  
**Rationale:** Simpler to implement initially, can be enhanced later

### Calendar Library
**Recommendation:** `react-big-calendar`  
**Rationale:** Balance of features, customization, and bundle size

### Task Execution Model
**Decision:** Queue tasks, execute one at a time  
**Rationale:** Prevents resource exhaustion, safer default

---

## 📖 Glossary

- **Workflow:** ComfyUI API format JSON file with complete node graph
- **Task:** Scheduled execution of a workflow at specific date/time
- **Baked Workflow:** Complete, self-contained workflow requiring no user input
- **Library:** Collection of stored workflows available for scheduling
- **Appointment Card:** Visual representation of a task on the calendar
- **Scheduler:** Background service that monitors and executes scheduled tasks

---

## 🆘 Getting Help

### Common Issues

**Problem:** TypeScript errors in type definitions  
**Solution:** Ensure all imported types exist, run `npx tsc --noEmit` to check

**Problem:** IndexedDB not working  
**Solution:** Check browser compatibility, ensure not in private/incognito mode

**Problem:** React hooks not updating  
**Solution:** Verify dexie-react-hooks is installed, check database connections

### Where to Ask

- Check troubleshooting sections in each phase document
- Review the Phase 0 risk mitigation strategies
- Reference the NSL branding guide for styling questions

---

## 🎯 Success Metrics

### Phase 1 Success
- Can create and retrieve workflows from IndexedDB
- Can schedule tasks with dates
- React hooks provide live updates
- No console errors

### Overall Project Success
- Workflows can be uploaded and organized with tags
- Calendar displays scheduled tasks correctly
- Tasks execute automatically at scheduled times
- NSL branding consistently applied
- User can schedule content weeks in advance

---

## 🚦 Next Steps

**Right Now:**
1. ✅ Read Phase0.md (overview) - you're reading it!
2. ✅ Review this Quick Start Guide
3. ⏭️ Open Phase1.md and begin implementation

**After Phase 1:**
4. Request Phase2.md document
5. Implement API Flow Manager
6. Continue through remaining phases

**Final Steps:**
7. Complete all 6 phases
8. Deploy DJZ-Yesterday
9. Schedule your first workflows! 🎉

---

## 📦 Deliverables Summary

### Phase 1 Deliverables
- 7 TypeScript files with types, services, and hooks
- IndexedDB schema with 2 stores
- 4 NPM packages installed
- Test data generation utilities

### Complete Project Deliverables
- Full-featured scheduling application
- Workflow library with tagging
- Calendar interface
- Background scheduler
- Comprehensive documentation
- User guide

---

**Last Updated:** November 8, 2025  
**Project Status:** Phase 1 Ready  
**Next Action:** Begin Phase 1 implementation

Good luck with DJZ-Yesterday! 🚀