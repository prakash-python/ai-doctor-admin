export const roleMenus = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/staff", label: "Staff" },
    { href: "/admin/roles", label: "Roles" },
    { href: "/admin/patients", label: "Patients" }
  ],

  doctor: [
    { href: "/doctor/dashboard", label: "Dashboard" },
    { href: "/doctor/patients", label: "My Patients" },
    { href: "/doctor/appointments", label: "Appointments" },
    { href: "/doctor/prescriptions", label: "Prescriptions" }
  ],

  health_advisor: [
    { href: "/health_advisor/dashboard", label: "Dashboard" },
    { href: "/health_advisor/consultations", label: "Consultations" },
    { href: "/health_advisor/patients", label: "Patients" }
  ],

  patient: [
    { href: "/patient/dashboard", label: "Dashboard" },
    { href: "/patient/appointments", label: "Appointments" },
    { href: "/patient/prescriptions", label: "Prescriptions" }
  ]
};
