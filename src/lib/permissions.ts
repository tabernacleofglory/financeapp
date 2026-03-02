
import type { PermissionRow } from '@/lib/types';

export const roles = ['Developer', 'Admin', 'Tech Support', 'Team', 'Volunteer', 'User', 'Guest'] as const;
export type Role = typeof roles[number];

export const initialPermissions: PermissionRow[] = [
    // Dashboard
    { feature: 'Dashboard', description: 'Main financial overview dashboard.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Dashboard > Add Record', description: 'Show the "Add Record" button on the dashboard.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },

    // Financial Categories
    { feature: 'Offerings', description: 'View the Offerings summary page.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Tithes', description: 'View the Tithes summary page.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: '365 Offerings', description: 'View the 365 Offerings summary page.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'First Fruits', description: 'View the First Fruits summary page.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Salomon', description: 'View the Salomon summary page.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    
    // Data Entry
    { feature: 'Entries', description: 'Access the main giving entries page to add and view records.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Entries > Edit Offerings', description: 'Allow user to input values for Offerings in the entry form.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Entries > Edit Tithes', description: 'Allow user to input values for Tithes in the entry form.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Entries > Edit 365 Offerings', description: 'Allow user to input values for 365 Offerings in the entry form.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Entries > Edit First Fruit Offerings', description: 'Allow user to input values for First Fruit Offerings in the entry form.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Entries > Edit Salomon Offerings', description: 'Allow user to input values for Salomon Offerings in the entry form.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Entries > Edit Attendance', description: 'Allow user to input values for Attendance in the entry form.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },

    // Data Management
    { feature: 'Campuses', description: 'Manage campus locations.', permissions: { Guest: false, User: false, Volunteer: false, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Ministries', description: 'Manage ministry listings.', permissions: { Guest: false, User: false, Volunteer: false, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Regions', description: 'Manage geographical regions for campuses.', permissions: { Guest: false, User: false, Volunteer: false, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    
    // Projections & Resources
    { feature: 'Projection', description: 'Manage financial projections.', permissions: { Guest: false, User: false, Volunteer: false, Team: false, 'Tech Support': false, Admin: true, Developer: true } },
    { feature: 'Resources', description: 'View and manage the Resource Hub.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Inquiries', description: 'Access the AI chat inquiries page.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },


    // User-Facing pages
    { feature: 'User Settings', description: 'Access personal user settings page.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Feedback', description: 'Submit application feedback.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },

    // Dev Tools (Admin/Developer only)
    { feature: 'Dev Tools', description: 'Access the main Developer Tools section.', permissions: { Guest: false, User: false, Volunteer: false, Team: false, 'Tech Support': true, Admin: true, Developer: true } },
    { feature: 'Dev Tools > User Management', description: 'Manage all application users and their roles.', permissions: { Guest: false, User: false, Volunteer: false, Team: false, 'Tech Support': false, Admin: true, Developer: true } },
    { feature: 'Dev Tools > Permission Controls', description: 'Manage role-based permissions for all features.', permissions: { Guest: false, User: false, Volunteer: false, Team: false, 'Tech Support': false, Admin: true, Developer: true } },
    { feature: 'Dev Tools > App Info', description: 'View application version and feature details.', permissions: { Guest: false, User: true, Volunteer: true, Team: true, 'Tech Support': true, Admin: true, Developer: true } },
];
