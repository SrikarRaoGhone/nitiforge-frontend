# Organization Hierarchy Backend Update

## Required schema change

```sql
ALTER TABLE users
ADD COLUMN manager_id INTEGER REFERENCES users(id);
```

Recommended related tables for enterprise growth:

- `users`
- `teams`
- `team_members`
- `leads`

## Minimum API contract

Each authenticated user payload should include:

- `id`
- `name`
- `email`
- `role`
- `manager_id`
- `company_id`

Each lead payload should include:

- `id`
- `name`
- `assigned_to`
- `assigned_to_name`
- `stage` or `status`
- `budget`
- `ai_score`
- `ai_priority`

## Access-control rules

- Admin: can view all company users, leads, analytics, and smart queue data.
- Manager: can view their own data plus direct reports where `users.manager_id = current_user.id`.
- Sales: can only view leads where `leads.assigned_to = current_user.id`.

## Backend filtering expectations

### Leads list

- `GET /leads` should return company-wide results for admin.
- `GET /leads` should return manager-owned and direct-report-owned leads for manager.
- `GET /leads` should return only self-owned leads for sales.

### Smart queue

- `GET /leads/smart-queue` should follow the same scope rules as `/leads`.

### Dashboard and analytics

- Manager dashboard endpoints should be filtered to their visible team only.
- Sales dashboard endpoints should be filtered to self only.

### Team management

- Admin can create managers and sales users.
- Manager can create only sales users and the backend should default `manager_id` to the manager's own user id.
- Manager assignment endpoints should reject assigning leads to users outside the manager's team.

## Example hierarchy

```text
Company
  |- Director / Admin
  |- Manager Rahul
  |   |- Priya
  |   |- Aman
  |- Manager Kavya
      |- Rohan
```
