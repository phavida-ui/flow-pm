# Prompt.md — MVP Project Handoff / Sprint Planning System

## Role

You are a senior product engineer, product designer, and software architect.

Your task is to build a production-quality MVP for an internal Project Management system focused on **cross-functional sprint planning, task dependency, approval, and automatic work handoff**.

The product is not intended to be a full replacement for Jira, Asana, ClickUp, or Monday.com.

The main problem to solve is:

> Everyone in the organization should know what they need to do, what other people are doing, who is waiting for whom, what task must happen next, and who currently holds the work.

The system should reduce the need for people to repeatedly ask:

- งานอยู่ที่ใคร?
- ฉันต้องทำอะไรต่อ?
- งานก่อนหน้าของฉันเสร็จหรือยัง?
- ใครกำลังรอฉันอยู่?
- งานนี้ต้องให้ใคร Approve?
- หลังจากฉันเสร็จแล้วต้องส่งให้ใคร?
- Campaign นี้ติดอยู่ตรงไหน?

---

# 1. Product Vision

Build a **Handoff-first Project Management System**.

The system should combine:

- Sprint Planning
- Shared Campaign Planning
- Task Management
- Dependency Management
- Approval Flow
- Automatic Task Handoff
- Notifications
- Campaign Timeline
- Activity Log

The most important product concept is:

> **Plan together → Execute together → Handoff automatically**

---

# 2. Core Product Principles

The MVP must follow these principles.

## Principle 1 — Everyone owns their own tasks

During planning, every team member can add tasks they are responsible for.

Example:

```text
Marketing
- Promotion Idea
- Promotion Approval
- Creative Brief

Content
- Content Research
- Write Script
- Revise Script

Creative
- Prepare Props
- Shooting
- Video Editing

Performance
- Prepare Ads Audience
- Setup Ads
- Launch Ads

Analytics
- Prepare Tracking
- Collect Performance
- Campaign Report
```

The system must not assume that the project manager creates every task for everyone.

---

## Principle 2 — Everyone can see the shared plan

Each Campaign has one shared planning board.

Everyone in the Campaign can see:

- All tasks
- Task owner
- Team
- Approver
- Due date
- Current status
- Dependency
- Upstream task
- Downstream task
- Who is waiting for whom

The goal is organizational synchronization.

---

## Principle 3 — Every task must know what it is waiting for

A task may depend on one or more previous tasks.

Example:

```text
Promotion Approved
      |
      +----> Script
      |
      +----> Landing Page
      |
      +----> Ads Audience
```

A task cannot become `READY` until all required dependencies are completed.

---

## Principle 4 — Every completed task must know where the work goes next

When a task is completed or approved, the system must automatically evaluate downstream dependencies.

If the next task becomes unblocked:

1. Change next task status to `READY`
2. Create a Handoff event
3. Notify the next owner
4. Write an Activity Log entry

Example:

```text
Video Editing
Owner: Nan

APPROVED
   |
   v

System Handoff

   |
   v

Ads Setup
Owner: Golf
Status: READY

Notification:
"งานก่อนหน้าของคุณเสร็จแล้ว ถึงคิวคุณเริ่ม Ads Setup"
```

---

## Principle 5 — The system must answer "Who holds the baton now?"

Every active Campaign must clearly show:

- Current active task(s)
- Current holder(s)
- Waiting approvals
- Blocked tasks
- Next task(s)

This is one of the most important features of the product.

---

# 3. Main Campaign Lifecycle

Campaign status:

```text
DRAFT
  ↓
PLANNING
  ↓
READY_TO_START
  ↓
ACTIVE
  ↓
COMPLETED
```

Optional:

```text
CANCELLED
```

---

# 4. Main User Flow

The expected MVP flow is:

```text
Create Campaign
      ↓
Enter Planning Mode
      ↓
Invite / assign Campaign members
      ↓
Each team member adds their own tasks
      ↓
Everyone sees the shared Campaign plan
      ↓
Set Owner / Approver / Due Date
      ↓
Connect task dependencies
      ↓
Review plan together
      ↓
Run Ready Check
      ↓
Publish / Start Campaign
      ↓
Tasks with no dependency become READY
      ↓
Owner starts task
      ↓
Owner works
      ↓
Owner submits
      ↓
Approver reviews
      ↓
Approved
      ↓
Task becomes COMPLETED
      ↓
System checks downstream dependencies
      ↓
System creates Handoff
      ↓
Next task becomes READY
      ↓
Next owner receives notification
      ↓
Execution continues
      ↓
Final task completed
      ↓
Campaign COMPLETED
```

---

# 5. MVP Scope

Build only the following features.

## Required Features

1. Campaign / Project
2. Shared Campaign Planning Board
3. Workflow Template
4. Task
5. Owner
6. Approver
7. Dependency
8. Due Date
9. Task Handoff
10. Notification
11. My Tasks
12. Campaign Timeline
13. Activity Log
14. Approval Inbox
15. Ready Check
16. Basic Role / Permission

Do not build unnecessary enterprise features.

---

# 6. Out of Scope

Do NOT build these in MVP unless required as a minimal dependency:

- Chat
- CRM
- Timesheet
- Payroll
- OKR
- AI assistant
- Advanced Gantt
- Advanced resource planning
- Full calendar system
- Budget management
- Document editor
- Complex automation builder
- Complex custom roles
- Employee performance evaluation
- External customer portal
- Advanced analytics

Keep the MVP focused on planning, dependency, approval, and handoff.

---

# 7. User Roles

Use four basic roles.

## Admin

Can:

- Manage users
- Manage teams
- Create/edit/delete campaigns
- Create/edit workflow templates
- Reassign tasks
- View all data

## Manager

Can:

- Create campaigns
- Manage campaign members
- Edit campaign plan
- Publish campaign
- Reassign tasks
- View all campaign tasks
- View timeline and activity log

## Member

Can:

- View campaigns they belong to
- Add their own tasks during Planning
- Edit their own tasks during Planning
- View tasks from other team members
- Start their own tasks
- Submit their own tasks
- Comment and attach files

## Approver

Can:

- View approval requests assigned to them
- Approve
- Request Revision
- Add approval comment

A user may have both Member and Approver responsibilities.

---

# 8. Campaign

Campaign fields:

```text
id
name
description
owner_id
workflow_template_id
status
start_date
target_date
created_by
created_at
updated_at
```

Campaign card should display:

```text
Birthday Campaign

Progress
8 / 16 Tasks

Current Holder
Nan — Video Editing

Waiting Approval
Creative Lead — Video Editing

Next
Golf — Ads Setup

Target Date
31 Aug
```

Support more than one current holder because Campaigns may contain parallel work.

---

# 9. Shared Campaign Planning Board

This is one of the most important screens.

The Planning Board should feel similar to a collaborative Sprint Planning session.

Default view should be a table/list.

Example:

| Task | Owner | Team | Approver | Due | Depends On | Status |
|---|---|---|---|---|---|---|
| Promotion Idea | Jane | Marketing | Marketing Head | 18 Aug | - | Planned |
| Creative Brief | Jane | Marketing | Marketing Head | 18 Aug | Promotion Idea | Planned |
| Write Script | Ploy | Content | Creative Lead | 19 Aug | Creative Brief | Planned |
| Shooting | Nan | Creative | - | 20 Aug | Write Script | Planned |
| Video Editing | Nan | Creative | Creative Lead | 21 Aug | Shooting | Planned |
| Ads Setup | Golf | Performance | Marketing Head | 21 Aug | Video Editing | Planned |
| Launch Ads | Golf | Performance | - | 22 Aug | Ads Setup | Planned |
| Campaign Report | Beam | Analytics | Marketing Head | 30 Aug | Launch Ads | Planned |

Required actions:

- Add My Task
- Add Task
- Edit Task
- Delete Task during Planning
- Assign Owner
- Assign Approver
- Set Due Date
- Connect Dependency
- Filter by Team
- Filter by Owner
- Search
- View task details

Everyone in the Campaign should be able to see the entire plan.

---

# 10. Planning Behavior

During `PLANNING` status:

Users can create and adjust tasks.

Task status should be:

```text
PLANNED
```

Tasks should not execute yet.

When the Campaign is published:

- Tasks with zero unresolved dependencies → `READY`
- Tasks with unresolved dependencies → `BLOCKED`

---

# 11. Ready Check

Before Campaign can start, show a Ready Check modal/page.

Example:

```text
Birthday Campaign
Ready Check

✓ Campaign has an owner
✓ Campaign target date exists
✓ All tasks have owners
✓ All tasks have due dates
✓ Required approvals are assigned
✓ No dependency cycles detected
✓ At least one task can start

16 Tasks
7 People
4 Teams

[ Start Campaign ]
```

Block Campaign start if:

- Any task has no owner
- Any task has no due date
- Dependency cycle exists
- There are zero executable starting tasks

Approver may be optional depending on the task.

---

# 12. Task

Task fields:

```text
id
campaign_id
template_task_id
name
description
team_id
owner_id
approver_id
status
priority
due_date
started_at
submitted_at
completed_at
created_by
created_at
updated_at
```

Priority may use:

```text
LOW
MEDIUM
HIGH
URGENT
```

Keep priority optional.

---

# 13. Task Status State Machine

Use:

```text
PLANNED
BLOCKED
READY
IN_PROGRESS
REVIEW
REVISION
COMPLETED
CANCELLED
```

Allowed transitions:

```text
PLANNED → READY
PLANNED → BLOCKED

READY → IN_PROGRESS

IN_PROGRESS → REVIEW
IN_PROGRESS → COMPLETED

REVIEW → COMPLETED
REVIEW → REVISION

REVISION → IN_PROGRESS
REVISION → REVIEW

BLOCKED → READY

Any active status → CANCELLED
```

Rules:

- Task with an approver must go through `REVIEW`.
- Task without approver may be completed directly.
- `BLOCKED` task cannot be started.
- `READY` means the task is executable now.

---

# 14. Task Detail

Task page should display:

```text
Video Editing

Campaign
Birthday Campaign

Status
IN PROGRESS

Owner
Nan

Team
Creative

Approver
Creative Lead

Due
21 Aug

Upstream
Shooting — Completed

Downstream
Ads Setup — Waiting for you
```

Show these sections:

- Description
- Deliverable
- Owner
- Approver
- Due date
- Dependencies
- Upstream tasks
- Downstream tasks
- Attachments
- Comments
- Activity

Main actions:

```text
READY
[ Start Task ]

IN_PROGRESS with Approver
[ Submit for Review ]

IN_PROGRESS without Approver
[ Complete Task ]

REVISION
[ Resume Work ]
[ Submit Again ]
```

---

# 15. Upstream / Downstream Awareness

This is a core UX requirement.

Every task should clearly show:

## Upstream

What must happen before this task.

Example:

```text
UPSTREAM

Creative Brief
Jane
✓ Completed
```

## Downstream

Who depends on the current task.

Example:

```text
DOWNSTREAM

Shooting
Nan
Waiting for you

Video Editing
Nan

Ads Setup
Golf
```

Use wording such as:

```text
Waiting for you
```

to create awareness of downstream impact.

---

# 16. Dependency Model

Support:

## Single Dependency

```text
Task A
  ↓
Task B
```

## Multiple Dependencies

```text
Task A ─┐
Task B ─┼──→ Task D
Task C ─┘
```

Task D becomes `READY` only when all dependencies are `COMPLETED`.

MVP dependency type:

```text
FINISH_TO_START
```

Do not implement advanced dependency types yet.

---

# 17. Dependency Validation

Must prevent circular dependencies.

Invalid example:

```text
A → B
B → C
C → A
```

The backend must validate dependency graphs before save or before Campaign start.

---

# 18. Approval Flow

If Task has an Approver:

```text
IN_PROGRESS
   ↓
SUBMIT
   ↓
REVIEW
   ↓
Approver decision
```

Approve:

```text
REVIEW → COMPLETED
```

Request Revision:

```text
REVIEW → REVISION
```

Approver must provide a comment when requesting revision.

Approval data:

```text
id
task_id
approver_id
status
comment
submitted_at
reviewed_at
created_at
```

Approval status:

```text
PENDING
APPROVED
REVISION_REQUESTED
```

---

# 19. Automatic Handoff Engine

This is the core backend behavior.

When a Task becomes `COMPLETED`:

1. Find all tasks that depend on the completed task
2. For each downstream task:
   - Fetch all dependencies
   - Check whether all dependencies are completed
3. If all dependencies are complete:
   - Change task from `BLOCKED` to `READY`
   - Create Handoff event
   - Send notification to Owner
   - Write Activity Log

Pseudo-code:

```ts
async function completeTask(taskId: string) {
  await setTaskStatus(taskId, "COMPLETED");

  await createActivity({
    taskId,
    eventType: "TASK_COMPLETED",
  });

  const downstreamTasks = await getDownstreamTasks(taskId);

  for (const nextTask of downstreamTasks) {
    const dependencies = await getDependencies(nextTask.id);

    const allCompleted = dependencies.every(
      dependency => dependency.status === "COMPLETED"
    );

    if (allCompleted && nextTask.status === "BLOCKED") {
      await setTaskStatus(nextTask.id, "READY");

      await createHandoff({
        fromTaskId: taskId,
        toTaskId: nextTask.id,
        toUserId: nextTask.ownerId,
      });

      await createNotification({
        userId: nextTask.ownerId,
        type: "TASK_READY",
        taskId: nextTask.id,
      });

      await createActivity({
        taskId: nextTask.id,
        eventType: "TASK_READY",
      });
    }
  }

  await checkCampaignCompletion();
}
```

All state changes should be transaction-safe.

---

# 20. Task Handoff

Store Handoff separately.

Fields:

```text
id
campaign_id
from_task_id
to_task_id
from_user_id
to_user_id
created_at
```

Example UI:

```text
Video Editing
Nan
      |
      | Handoff 16:42
      v
Ads Setup
Golf
```

Use Handoff events in Campaign Timeline and Activity Log.

---

# 21. Notifications

Build in-app notifications only for MVP.

Notification types:

```text
TASK_ASSIGNED
TASK_READY
APPROVAL_REQUIRED
REVISION_REQUESTED
TASK_OVERDUE
HANDOFF_RECEIVED
```

Notification fields:

```text
id
user_id
type
campaign_id
task_id
title
message
is_read
created_at
```

Example:

```text
Ready to Start

Birthday Campaign
Ads Setup

Video Editing was completed.
You can start this task now.

Due: 21 Aug
```

Clicking notification should open the relevant task.

---

# 22. My Tasks

This should be the default homepage for Members.

Sections:

```text
NEED ACTION

Ready
In Progress
Revision

WAITING FOR YOUR APPROVAL

Review requests

WAITING FOR OTHERS

Blocked tasks assigned to me

COMPLETED TODAY
```

Example:

```text
My Work

Ready                    3
In Progress              2
Waiting for Approval     2
Waiting for Others       4
Overdue                  1
```

Task cards should show:

- Task name
- Campaign
- Due date
- Status
- Upstream status
- Downstream impact

Example:

```text
Write Script
Birthday Campaign

Due Today
IN PROGRESS

Next:
Nan / Shooting
Waiting for you
```

---

# 23. Team Visibility

Users should be able to see tasks from other Campaign members.

Provide:

```text
My Tasks
Team Tasks
All Campaign Tasks
```

Team view should help users understand synchronization, not employee surveillance.

Do not add productivity scoring.

---

# 24. Approval Inbox

Dedicated screen:

```text
Approval Inbox

5 Waiting
```

Approval card:

```text
Video Editing
Birthday Campaign

Submitted by
Nan

Submitted
Today 15:18

Due
Today

[ Review ]
```

Task review screen:

```text
[ Approve ]

[ Request Revision ]
```

---

# 25. Campaign Timeline

Campaign Detail should contain a visual timeline.

Example:

```text
Campaign Brief
Jane
✓ Completed

      ↓

Promotion Planning
Beam
✓ Completed

      ↓

Write Script
Ploy
✓ Completed

      ↓

Shooting
Nan
✓ Completed

      ↓

Video Editing
Nan
● IN PROGRESS

      ↓

Ads Setup
Golf
○ BLOCKED

      ↓

Launch Ads
Golf
○ BLOCKED
```

Support parallel branches.

If possible, create both:

- Simple chronological timeline
- Dependency graph / flow view

For MVP, prioritize readability over advanced graph editing.

---

# 26. Current Holder

Campaign Detail and Campaign List should clearly show current holder(s).

Example:

```text
CURRENT WORK

Nan
Video Editing
Due Today 17:00
```

For parallel work:

```text
CURRENT WORK

Nan
Video Editing

Golf
Ads Audience

Beam
Tracking Setup
```

If waiting for approval:

```text
WAITING APPROVAL

Creative Lead
Video Editing
```

---

# 27. Activity Log

Log meaningful system actions.

Event types:

```text
CAMPAIGN_CREATED
CAMPAIGN_STARTED
TASK_CREATED
TASK_UPDATED
TASK_ASSIGNED
TASK_STARTED
TASK_SUBMITTED
TASK_APPROVED
TASK_REVISION_REQUESTED
TASK_COMPLETED
TASK_READY
TASK_HANDOFF
TASK_OVERDUE
CAMPAIGN_COMPLETED
```

Example:

```text
16:42
Creative Lead approved "Video Editing"

16:42
System completed "Video Editing"

16:42
System unlocked "Ads Setup"

16:42
Work handed off from Nan to Golf

16:42
Golf was notified
```

Activity log should be append-only for MVP.

---

# 28. Workflow Templates

Templates are planning starters, not rigid workflows.

Fields:

```text
id
name
description
created_by
created_at
updated_at
```

Template task:

```text
id
template_id
name
description
default_team_id
default_owner_id
default_approver_id
default_duration_days
sequence
```

Template dependency:

```text
id
task_id
depends_on_task_id
```

When creating Campaign from Template:

- Copy template tasks into Campaign
- Copy default dependencies
- Allow Campaign members to add, remove, edit, reassign, and reconnect tasks during Planning

The template should not prevent customization.

---

# 29. Example Workflow Template

Create demo seed data for:

```text
Marketing Campaign
```

Tasks:

```text
Promotion Idea
↓
Creative Brief
↓
Write Script
↓
Shooting
↓
Video Editing
↓
Ads Setup
↓
Launch Ads
↓
Performance Report
↓
Management Review
```

Also create a branch to demonstrate parallel work:

```text
Creative Brief
   ├── Write Script → Shooting → Video Editing ──┐
   ├── Landing Page ─────────────────────────────┼→ Launch Ads
   └── Ads Audience ─────────────────────────────┘
```

---

# 30. Suggested Database Schema

Use a relational database.

Entities:

```text
users
teams
campaigns
campaign_members

workflow_templates
workflow_template_tasks
workflow_template_dependencies

tasks
task_dependencies

approvals
task_handoffs
notifications
activity_logs
comments
attachments
```

Suggested structure:

```text
users
- id
- name
- email
- avatar_url
- role
- team_id
- active
- created_at
- updated_at

teams
- id
- name
- created_at

campaigns
- id
- name
- description
- owner_id
- workflow_template_id
- status
- start_date
- target_date
- created_by
- created_at
- updated_at

campaign_members
- id
- campaign_id
- user_id
- role

tasks
- id
- campaign_id
- template_task_id
- name
- description
- team_id
- owner_id
- approver_id
- status
- priority
- due_date
- started_at
- submitted_at
- completed_at
- created_by
- created_at
- updated_at

task_dependencies
- id
- task_id
- depends_on_task_id

approvals
- id
- task_id
- approver_id
- status
- comment
- submitted_at
- reviewed_at
- created_at

task_handoffs
- id
- campaign_id
- from_task_id
- to_task_id
- from_user_id
- to_user_id
- created_at

notifications
- id
- user_id
- type
- campaign_id
- task_id
- title
- message
- is_read
- created_at

activity_logs
- id
- campaign_id
- task_id
- actor_id
- event_type
- metadata_json
- created_at

comments
- id
- task_id
- user_id
- body
- created_at
- updated_at

attachments
- id
- task_id
- uploaded_by
- file_name
- file_url
- created_at
```

Add proper:

- foreign keys
- indexes
- unique constraints
- cascade rules
- soft deletion only where needed

---

# 31. Suggested Technical Architecture

Use a modern full-stack TypeScript architecture.

Recommended default:

```text
Frontend
- React
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui or equivalent accessible component system

Backend
- Next.js server/API layer or a clean Node.js API layer
- Server-side validation
- Transaction-safe business logic

Database
- PostgreSQL

ORM
- Prisma or equivalent

Authentication
- Email/password or organization SSO-ready authentication abstraction

File Storage
- S3-compatible storage or equivalent

Notifications
- In-app notification table
```

Use current stable versions of libraries.

Keep domain logic separated from UI code.

---

# 32. Backend Modules

Organize backend around domains.

Suggested:

```text
/auth
/users
/teams
/campaigns
/workflows
/tasks
/dependencies
/approvals
/handoffs
/notifications
/activity
```

Important domain services:

```text
CampaignService
TaskService
DependencyService
ApprovalService
HandoffService
NotificationService
ActivityService
```

Do not bury the Handoff logic inside UI handlers.

---

# 33. Transaction Rules

Critical task transitions should be atomic.

Example: Approving a task should perform all of these in one transaction when possible:

```text
Approval = APPROVED
Task = COMPLETED
Activity = TASK_APPROVED
Evaluate downstream dependency
Next task = READY
Create Handoff
Create Notification
Create Activity
```

Prevent duplicate handoffs and duplicate notifications when requests are retried.

Use idempotent event handling where appropriate.

---

# 34. Campaign Completion

After every Task completion:

```text
IF all non-cancelled Campaign tasks == COMPLETED
THEN Campaign.status = COMPLETED
```

Create:

```text
CAMPAIGN_COMPLETED
```

Activity event.

Notify Campaign Owner.

---

# 35. Due Date / Overdue

A task is overdue when:

```text
current_time > due_date
AND
status NOT IN (COMPLETED, CANCELLED)
```

Show overdue visually.

Create a scheduled server job or equivalent mechanism to generate `TASK_OVERDUE` notification once per overdue condition.

Do not spam duplicate notifications.

---

# 36. Navigation

Desktop sidebar:

```text
FLOW

My Work
Campaigns
Approvals
Workflows

Notifications
Settings
```

Mobile should use a responsive bottom navigation or compact drawer.

---

# 37. Required Screens

Build these screens.

## 1. Login

Simple authentication screen.

## 2. My Work

Default employee homepage.

## 3. Campaign List

Shows:

- Campaign
- Progress
- Current Holder
- Waiting Approval
- Target Date
- Status

## 4. Campaign Detail

Tabs:

```text
Plan
Timeline
Activity
```

Header:

```text
Campaign Name
Status
Progress
Current Work
Target Date
```

## 5. Campaign Planning Board

Collaborative task table.

## 6. Task Detail

Task metadata, upstream/downstream, comments, attachments, actions.

## 7. Approval Inbox

Pending approvals.

## 8. Workflow Templates

List and manage templates.

## 9. Workflow Template Editor

Create and edit reusable planning starters.

## 10. Notification Drawer

In-app notifications.

---

# 38. UX Requirements

The UI should be:

- Clean
- Fast
- Minimal
- Modern
- Business-friendly
- Easy for non-technical users
- Responsive

Avoid an overly complex Jira-like interface.

Primary UX question:

> What should I do now?

Secondary UX question:

> Who is waiting for me?

Manager UX question:

> Where is the Campaign currently stuck?

---

# 39. Visual Language

Use:

- White / light neutral background
- Clear cards
- Compact tables
- Strong hierarchy
- Status badges
- Minimal visual noise
- Light blue as the primary action/button color
- Rounded corners
- Clear spacing

Suggested status semantics:

```text
PLANNED      neutral
BLOCKED      gray
READY        blue
IN_PROGRESS  blue/purple
REVIEW       amber
REVISION     red/orange
COMPLETED    green
OVERDUE      red
```

Keep accessibility and contrast in mind.

---

# 40. Dashboard Example

```text
My Work

Ready                 3
In Progress           2
Need Approval         2
Waiting for Others    4
Overdue               1


NEED ACTION

Write Script
Birthday Campaign
Due Today

Next:
Nan — Shooting
Waiting for you


WAITING FOR OTHERS

Ads Setup
Birthday Campaign

Waiting for:
Video Editing
Nan


APPROVALS

Video Editing
Submitted by Nan
Birthday Campaign
```

---

# 41. Campaign Example

Seed a demo Campaign:

```text
Birthday Campaign 2026
```

Members:

```text
Jane — Marketing
Ploy — Content
Nan — Creative
Golf — Performance
Beam — Analytics
Marketing Head — Approver
Creative Lead — Approver
Management — Final Approver
```

Example workflow:

```text
Promotion Idea
Jane
   ↓
Creative Brief
Jane
   ├──────────────────────────┐
   ↓                          ↓
Write Script              Ads Audience
Ploy                      Golf
   ↓                          │
Shooting                      │
Nan                           │
   ↓                          │
Video Editing                 │
Nan                           │
   │                          │
   └─────────────┬────────────┘
                 ↓
             Ads Setup
             Golf
                 ↓
             Launch Ads
             Golf
                 ↓
        Performance Report
             Beam
                 ↓
        Management Review
```

---

# 42. Example Handoff Scenario

Initial state:

```text
Video Editing
Nan
IN_PROGRESS

Ads Setup
Golf
BLOCKED
```

Nan submits:

```text
Video Editing
REVIEW
```

Creative Lead approves.

Backend must perform:

```text
Video Editing → COMPLETED

Evaluate Ads Setup dependencies

All dependencies completed

Ads Setup → READY

Create Handoff:
Nan → Golf

Create Notification:
Golf / TASK_READY

Create Activity:
TASK_APPROVED
TASK_COMPLETED
TASK_READY
TASK_HANDOFF
```

Golf should immediately see `Ads Setup` inside `My Work → Ready`.

---

# 43. API Requirements

Create clean API or server actions for:

```text
Auth
Users
Teams

Campaign CRUD
Campaign members
Campaign Ready Check
Start Campaign

Workflow Template CRUD
Template Task CRUD
Template Dependency CRUD

Task CRUD
Start Task
Submit Task
Complete Task
Reassign Task

Dependency CRUD

Approve Task
Request Revision

Notifications
Mark Notification Read

Campaign Timeline
Campaign Activity Log

My Tasks
Approval Inbox
```

Validate all inputs server-side.

---

# 44. Security Requirements

Implement:

- Authentication
- Authorization
- Server-side permission checks
- Input validation
- Safe file upload validation
- Proper database constraints
- Protection against unauthorized task updates
- Only Owner can start/submit their task
- Only assigned Approver can approve/revise
- Manager/Admin can reassign
- Campaign members can view Campaign tasks

Do not rely only on hidden UI buttons for authorization.

---

# 45. Testing

Include automated tests for the most important business rules.

At minimum test:

## Dependency

```text
A completed
B depends on A
→ B becomes READY
```

## Multiple Dependency

```text
D depends on A, B, C

A completed
B completed
C incomplete
→ D remains BLOCKED

C completed
→ D becomes READY
```

## Approval

```text
Task with Approver
Submit
→ REVIEW

Approve
→ COMPLETED
```

## Revision

```text
REVIEW
Request Revision
→ REVISION
```

## Handoff

```text
Task A completed
Task B unlocked
→ Handoff record exists
→ notification sent to B owner
```

## Circular dependency

```text
A → B → C → A
→ rejected
```

## Campaign completion

```text
all tasks completed
→ Campaign COMPLETED
```

---

# 46. Seed Data

Provide seed/demo data so the app is immediately explorable.

Seed:

- 8 users
- 4 teams
- 1 Admin
- 1 Manager
- Marketing Campaign template
- Birthday Campaign 2026
- Tasks with a mixture of:
  - completed
  - ready
  - in progress
  - review
  - blocked

Make the demo show automatic handoff behavior clearly.

---

# 47. MVP Acceptance Criteria

The MVP is successful when this scenario works end-to-end:

1. Manager creates Campaign
2. Campaign enters Planning mode
3. Multiple team members add their own tasks
4. Everyone sees the same Campaign task list
5. Users assign owners, approvers, due dates
6. Users connect task dependencies
7. Ready Check passes
8. Manager starts Campaign
9. Starting tasks become READY
10. User sees their task in My Work
11. User starts task
12. User submits task
13. Approver receives approval request
14. Approver approves task
15. Task becomes COMPLETED
16. Downstream dependency is evaluated automatically
17. Next task becomes READY
18. Handoff record is created
19. Next owner receives notification
20. Next owner sees task in My Work
21. Timeline shows progress
22. Activity Log records all important events
23. Final task completes
24. Campaign becomes COMPLETED

The system should accomplish this without users needing to manually message one another to ask who should work next.

---

# 48. Definition of Done

Do not consider the MVP complete until:

- Database schema is implemented
- Authentication works
- Planning Board works
- Task creation works
- Dependency creation works
- Circular dependency prevention works
- Ready Check works
- Campaign start works
- Task status machine works
- Approval works
- Revision works
- Handoff engine works
- Notification works
- My Tasks works
- Approval Inbox works
- Campaign Timeline works
- Activity Log works
- Demo seed works
- Core business logic has tests
- UI is responsive
- Loading, empty, and error states exist
- Authorization is enforced server-side

---

# 49. Build Strategy

Build in this order:

```text
1. Database schema
2. Authentication + users + teams
3. Campaign + membership
4. Task state machine
5. Planning Board
6. Dependency engine
7. Ready Check
8. Campaign start
9. Approval flow
10. Handoff engine
11. Notification system
12. My Tasks
13. Approval Inbox
14. Campaign Timeline
15. Activity Log
16. Workflow Templates
17. Seed/demo
18. Automated tests
19. UX polish
```

Do not start with animations or visual polish before the domain engine works.

---

# 50. Engineering Rules

Follow these rules:

- Prefer clear domain models over clever abstractions
- Keep business logic on the server
- Make state transitions explicit
- Use transactions for critical workflow transitions
- Avoid duplicated Handoff events
- Avoid duplicated notifications
- Validate dependency graph changes
- Keep UI optimistic only where safe
- Handle loading and error states
- Use reusable components
- Keep code strongly typed
- Keep architecture simple enough for an MVP
- Add comments only where logic is non-obvious
- Write a README with local setup instructions
- Include environment variable examples
- Include migrations and seed scripts

---

# 51. Product Success Metric

The most important behavioral success metric is:

> A team member should know what they need to do next and who depends on their work without asking in chat.

The most important manager success metric is:

> A manager should be able to identify where a Campaign is stuck within a few seconds.

The most important system success metric is:

> When one task finishes, the next responsible person receives the baton automatically.

---

# 52. Final Instruction

Build the MVP as a usable internal product, not as a static prototype.

Start by:

1. Designing the database schema
2. Defining the task state machine
3. Implementing dependency evaluation
4. Implementing automatic handoff
5. Building the Planning Board and My Work experience around those core rules

Whenever there is a tradeoff, prioritize:

```text
Clarity
> Workflow correctness
> Team synchronization
> Speed
> Feature quantity
```

Do not expand the scope beyond the MVP unless it is necessary to make the handoff workflow reliable.
