// src/mockDatabase.js

// --- 1. User Data ---
// This will be the central source for user information.
export let users = [
  { username: "user", password: "password123", role: "user", name: "Aarav Sharma" },
  { username: "om", password: "om123", role: "user", name: "Om Patil" },
  { username: "admin", password: "password123", role: "admin", name: "Administrator" },
  { username: "authority", password: "password123", role: "authority", name: "Civic Authority" },
];

// --- 2. Issues Data ---
// This is the central list of all reported issues.
export let issues = [
  {
    id: 'CIV-001',
    title: 'Large Pothole',
    details: 'A large and dangerous pothole in the middle of the road near Andheri Station.',
    category: 'Roads',
    assigned: true,
    status: 'In Progress',
    rating: null,
    location: { lat: 19.1196, lng: 72.8464 }, // Location of the specific issue
    reporter: { name: 'Aarav Sharma', email: 'aarav.s@example.com', phone: '9876543210' },
    date: '2025-09-15',
  },
  {
    id: 'CIV-002',
    title: 'Broken Streetlight',
    details: 'Streetlight on corner of Park St. has been out for 3 days.',
    category: 'Electricity',
    assigned: true,
    status: 'Assigned',
    rating: null,
    location: { lat: 19.0785, lng: 72.8790 },
    reporter: { name: 'Priya Sharma', email: 'priya.s@example.com', phone: '8765432109' },
    date: '2025-09-14',
  },
];

// --- Functions to simulate database operations ---
export const addUser = (newUser) => {
  // Prevent duplicate usernames
  if (!users.find(u => u.username === newUser.username)) {
    users.push(newUser);
  }
};

export const addIssue = (newIssue) => {
  issues.unshift(newIssue); // Adds the new issue to the beginning of the array
};

// Update helpers for status/rating
export const updateIssue = (id, changes) => {
  const idx = issues.findIndex(i => i.id === id);
  if (idx !== -1) {
    issues[idx] = { ...issues[idx], ...changes };
  }
  return issues[idx];
};

export const setIssueStatus = (id, status) => {
  const next = updateIssue(id, { status, assigned: status !== 'New' });
  return next;
};

export const setIssueRating = (id, rating) => {
  const next = updateIssue(id, { rating });
  return next;
};