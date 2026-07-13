import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/classes', label: 'Classes', icon: '🏫' },
  { to: '/students', label: 'Students', icon: '👨‍🎓' },
  { to: '/mark-attendance', label: 'Mark Attendance', icon: '✅' },
  { to: '/records', label: 'Records', icon: '📋' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 w-64 bg-primary-900 text-white flex flex-col">
        <div className="px-6 py-6 border-b border-primary-700">
          <h1 className="text-xl font-bold tracking-tight">AttendanceMS</h1>
          <p className="text-primary-300 text-sm mt-1">Student Management</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-primary-700">
          <p className="text-primary-400 text-xs">© 2026 AttendanceMS</p>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
