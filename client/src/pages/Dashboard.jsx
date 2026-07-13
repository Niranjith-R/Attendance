import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [statsData, recentData] = await Promise.all([
          api.getStats(),
          api.getRecentAttendance(),
        ]);
        setStats(statsData);
        setRecent(recentData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        <p className="font-medium">Failed to load dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-sm mt-2">Make sure the backend server is running and MongoDB is connected.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your attendance system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Students" value={stats.totalStudents} icon="👨‍🎓" color="blue" />
        <StatCard title="Total Classes" value={stats.totalClasses} icon="🏫" color="purple" />
        <StatCard
          title="Present Today"
          value={stats.today.present}
          subtitle={`${stats.today.marked} marked`}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Absent Today"
          value={stats.today.absent}
          subtitle={`${stats.today.late} late`}
          icon="❌"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Attendance</h2>
            <Link to="/records" className="text-sm text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.length === 0 ? (
              <p className="px-6 py-8 text-gray-500 text-center">No attendance records yet</p>
            ) : (
              recent.map((record) => (
                <div key={record._id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{record.studentId?.name}</p>
                    <p className="text-sm text-gray-500">
                      {record.classId?.name} - {record.classId?.section} ·{' '}
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={record.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/mark-attendance"
              className="block w-full text-center bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Mark Attendance
            </Link>
            <Link
              to="/students"
              className="block w-full text-center bg-white text-gray-700 py-2.5 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Add Student
            </Link>
            <Link
              to="/classes"
              className="block w-full text-center bg-white text-gray-700 py-2.5 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Manage Classes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
