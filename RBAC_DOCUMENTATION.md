# Role-Based Access Control (RBAC) Documentation

This document provides an overview of the Role-Based Access Control system implemented in the Teacher Management System.

## Overview

The RBAC system controls access to different parts of the application based on user roles. The system currently supports the following roles:

1. **Admin** - Full access to all features
2. **Department Head** - Limited access to manage teachers and classrooms within their assigned department

## Database Structure

The RBAC system consists of the following tables:

- `roles` - Stores the different roles available in the system
- `permissions` - Stores the different permissions that can be assigned to roles
- `role_permission` - A pivot table that links roles to permissions
- `users` - Modified to include a `role_id` and `department_id`

## User Roles

### Admin

Administrators have full access to the system, including:

- Managing all teachers across all departments
- Managing all classrooms and course assignments
- Managing department heads and other administrative users
- Viewing system-wide reports and statistics

### Department Head

Department heads have limited access focused on their assigned department:

- Viewing a specialized dashboard with department-specific information
- Managing teachers within their department only
- Assigning teachers from their department to classes
- Viewing reports specific to their department

## Managing Roles

### Assigning Roles to Users

To assign a role to a user:

1. Log in as an admin
2. Navigate to the Users management section
3. Edit the user you want to assign a role to
4. Select the appropriate role from the dropdown
5. For department heads, also select the department they will manage
6. Save changes

### Creating a Department Head

To create a new department head:

1. Create a new user account or select an existing user
2. Assign the "Department Head" role to the user
3. Select the department they will manage
4. Save changes

The user will now have access to the department head dashboard and functionality limited to their assigned department.

## Technical Implementation

The RBAC system is implemented using:

- Database migrations for roles and permissions tables
- Eloquent relationships between User, Role, and Permission models
- Middleware for route protection (`CheckRole`)
- Controller-level filtering based on user role and department
- Specialized views for different roles

## Testing the RBAC System

The system comes with pre-configured demo users for testing different roles:

1. **Admin User**
   - Email: admin@example.com
   - Password: password
   - Full access to all features and departments

2. **Department Head Users** (one for each department in the system)
   - Email format: dept_head_X@example.com (where X is the department ID)
   - Password: password
   - Access limited to managing their specific department

3. **Teacher User**
   - Email: teacher@example.com
   - Password: password
   - Regular teacher access (limited functionality)

To create these demo users, run:
```
php artisan setup:rbac-demo
```

## Troubleshooting

If a user reports they cannot access certain features:

1. Check their assigned role in the database
2. For department heads, ensure they have a department assigned
3. Check the route middleware to ensure it allows the appropriate roles
4. Verify controller logic includes appropriate role checks
