# Dashboard Components

This folder contains reusable components specifically designed for the dashboard page.

## Components

### ActivityItem

A reusable component for displaying individual activity items in the activity feed.

#### Usage

```tsx
import { ActivityItem } from "@/components/dashboard/activity-item";

<ActivityItem 
  event={activityEvent} 
  formatRelative={formatRelativeFunction} 
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `event` | `ActivityEvent` | The activity event object containing all activity details |
| `formatRelative` | `(date: string) => string` | Function to format timestamps relative to now |

#### Features

- ✨ **Visual Action Icons** - Each action type has a unique emoji icon
- 🎨 **Color-Coded Actions** - Different colors for create, update, delete, etc.
- 📊 **Status Change Display** - Shows before/after status with badges
- ⚡ **Priority Change Display** - Shows before/after priority with badges
- 📅 **Due Date Changes** - Displays date change information
- 🔗 **Clickable Links** - Links to the related entity when available
- 📱 **Responsive Design** - Works on all screen sizes

#### Action Types & Icons

| Action | Icon | Color | Description |
|--------|------|-------|-------------|
| `created` | ✨ | Green | Entity was created |
| `updated` | 📝 | Muted | Entity was updated |
| `deleted` | 🗑️ | Red | Entity was deleted |
| `status_changed` | 🔄 | Blue | Task status changed |
| `assigned` | 👤 | Muted | Task was assigned |
| `unassigned` | 👋 | Muted | Task was unassigned |
| `priority_changed` | ⚡ | Orange | Priority changed |
| `due_date_changed` | 📅 | Muted | Due date changed |

#### Entity Types & Icons

| Entity | Icon | Description |
|--------|------|-------------|
| `task` | ✓ | Task entity |
| `project` | 📁 | Project entity |
| `project_member` | 👥 | Team member |

#### Example Event Object

```typescript
const event: ActivityEvent = {
  id: "123",
  type: "status_changed",
  message: "John moved 'Fix bug' from To Do to In Progress",
  actor: {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com"
  },
  action: "changed status of",
  target: "Fix bug",
  href: "/projects/my-project",
  entityType: "task",
  timestamp: "2026-07-30T10:00:00Z",
  createdAt: "2026-07-30T10:00:00Z",
  changes: {
    from: "todo",
    to: "in_progress"
  },
  details: {
    actionType: "status_changed",
    hasChanges: true,
    statusChange: {
      from: "todo",
      to: "in_progress",
      fromLabel: "To Do",
      toLabel: "In Progress"
    }
  }
};
```

#### Styling

The component uses Tailwind CSS and follows the design system:

- Hover effects for interactive items
- Proper spacing and alignment
- Responsive text sizing
- Color theming support (light/dark mode)
- Border and shadow effects on hover

#### Accessibility

- Semantic HTML structure
- Proper link handling
- Visual feedback on hover
- Color contrast compliance

---

## Future Components

Consider adding these components to this folder:

- `StatsCard` - Reusable statistics card
- `QuickActions` - Quick action buttons widget
- `RecentTasks` - Recent tasks list
- `TeamActivity` - Team member activity widget
