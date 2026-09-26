# Voter Registration Portal

A browser-based voter registration portal built with HTML, CSS, and JavaScript. The project demonstrates a multi-page registration workflow with voter records, account roles, application status, appointments, PVC-related pages, administration views, and browser-side data persistence.

> **Project scope:** This is a front-end demonstration project. Authentication, voter records, appointments, and audit data are stored in the browser with `localStorage`; it is not a production electoral system or secure government identity platform.

## Features

- Voter registration workflow
- Voter application and registration status pages
- Login and account registration flow
- Role-aware navigation for voter, officer, and admin users
- Admin dashboard and management views
- Appointment workflow
- PVC-related interface
- Voter statistics for total, pending, approved, and rejected records
- NIN, phone, email, and duplicate-record validation helpers
- Application and voter ID generation for the demo workflow
- Audit log recording for important local actions
- Browser-side persistence with `localStorage`
- Responsive interface using Bootstrap 5

## How It Works

The application is implemented as a collection of HTML pages backed by shared JavaScript modules:

- `database.js` provides browser-side storage and CRUD-style helpers for voters, appointments, audit logs, and polling units.
- `auth.js` provides demo authentication, account registration, verification, login, password-change/reset flows, roles, and sessions using `localStorage`.
- `app.js` handles navigation, statistics, validation, IDs, notifications, and access checks.

The project uses simulated authentication and local browser storage rather than a remote database or server-side authentication service.

## Pages

The portal includes separate interfaces for:

- Home / landing page
- Registration
- Login
- Registration status
- Dashboard
- Administration
- Appointments
- PVC-related workflow
- Reports

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3
- Font Awesome 6
- Browser `localStorage`

## Project Structure

```text
voters-registration-poral/
└── voters registration portal/
    ├── index.html
    ├── register.html
    ├── login.html
    ├── status.html
    ├── dashboard.html
    ├── admin.html
    ├── appointment.html
    ├── pvc.html
    ├── reports.html
    ├── js/
    │   ├── app.js
    │   ├── auth.js
    │   └── database.js
    └── css/
        └── style.css
```

## Running Locally

No package manager or backend server is required for the current implementation.

1. Clone the repository.
2. Open the `voters registration portal` directory.
3. Open `index.html` in a modern browser.
4. Use the registration, login, dashboard, and administration pages to explore the workflow.

The interface loads Bootstrap and Font Awesome from CDNs, so an internet connection may be required for those external assets when running the pages directly.

## Data and Security Notes

This project is intended for learning and demonstration purposes. The browser `localStorage` implementation is not suitable for real voter records, secure authentication, biometric identity verification, or production electoral infrastructure. The password hashing function is explicitly a demo implementation and should not be treated as production-grade password protection.

## Author

**Anthony Emmanuella Mmasinachi**

## Project Links

- **Repository:** https://github.com/Scarlet-Twinz/voters-registration-poral
- **Author:** Anthony Emmanuella Mmasinachi
- **GitHub:** https://github.com/Scarlet-Twinz
