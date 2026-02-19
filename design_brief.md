# Design Brief: Kursverwaltungssystem

## 1. App Analysis
- A course management system for training centers, language schools, or educational institutions
- Admin users manage courses, instructors (Dozenten), participants (Teilnehmer), rooms (Räume), and enrollments (Anmeldungen)
- The ONE thing: "Am I at capacity? Who's enrolled? What's coming up?"
- Primary actions: Create course, enroll participant, manage payment status

## 2. What Makes This Design Distinctive
- Visual identity: Deep slate-blue + warm amber accent — professional yet approachable, like a modern SaaS education platform
- Layout: Sidebar navigation with content area; dashboard hero shows KPIs with size variation
- Unique element: Amber accent badges for payment status, capacity meters on course cards

## 3. Theme & Colors
- Font: Plus Jakarta Sans (Google Fonts) — warm, legible, slightly technical
- Primary: hsl(222, 47%, 18%) — deep navy blue
- Primary foreground: hsl(0, 0%, 98%)
- Accent: hsl(38, 95%, 55%) — warm amber
- Accent foreground: hsl(222, 47%, 12%)
- Background: hsl(220, 20%, 97%) — cool off-white
- Surface: hsl(0, 0%, 100%) — white cards
- Muted: hsl(220, 14%, 91%)
- Muted foreground: hsl(220, 9%, 46%)
- Destructive: hsl(0, 84%, 60%)
- Success: hsl(142, 71%, 45%)

## 4. Mobile Layout
- Hamburger nav → slide-in sidebar
- Single column content
- KPI cards stacked vertically, hero card full-width
- Bottom-sticky primary action button

## 5. Desktop Layout
- Fixed sidebar (240px) + scrollable main content (flex-1)
- Dashboard: 4-column KPI row + data table below
- Entity pages: header with action button + data table with inline actions

## 6. Components
- Hero KPI: Total active courses with large number
- Secondary KPIs: Dozenten count, Teilnehmer count, Anmeldungen heute
- Data tables with sortable columns, search, pagination
- Modal dialogs for create/edit (shadcn Dialog)
- Status badges (paid/unpaid, capacity percentage)
- Sidebar with icons and active state

## 7. Visual Details
- Border radius: 12px cards, 8px inputs, 6px badges
- Shadows: 0 1px 3px hsl(222 47% 18% / 0.08), hover: 0 4px 12px hsl(222 47% 18% / 0.15)
- Transitions: all 0.2s ease
- Table rows: subtle hover background
- Active nav item: amber left border + primary background tint

## 8. CSS Variables
```css
:root {
  --primary: 222 47% 18%;
  --primary-foreground: 0 0% 98%;
  --accent: 38 95% 55%;
  --accent-foreground: 222 47% 12%;
  --background: 220 20% 97%;
  --foreground: 222 47% 12%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 12%;
  --muted: 220 14% 91%;
  --muted-foreground: 220 9% 46%;
  --border: 220 13% 87%;
  --destructive: 0 84% 60%;
  --success: 142 71% 45%;
  --radius: 0.75rem;
}
```
