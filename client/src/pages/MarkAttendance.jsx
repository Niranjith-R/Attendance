import { useEffect, useState } from 'react';
import { api } from '../api/client';

const today = new Date().toISOString().split('T')[0];

export default function MarkAttendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getClasses().then(setClasses).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setRecords([]);
      return;
    }

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getClassAttendance(selectedClass, date);
        setRecords(
          data.map(({ student, attendance }) => ({
            studentId: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            status: attendance?.status || 'present',
            remarks: attendance?.remarks || '',
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedClass, date]);

  const updateStatus = (index, status) => {
    setRecords((prev) => prev.map((r, i) => (i === index ? { ...r, status } : r)));
  };

  const markAll = (status) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    if (!selectedClass || records.length === 0) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.saveBulkAttendance({
        classId: selectedClass,
        date,
        records: records.map(({ studentId, status, remarks }) => ({
          studentId,
          status,
          remarks,
        })),
      });
      setSuccess('Attendance saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const lateCount = records.filter((r) => r.status === 'late').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 mt-1">Record daily attendance for a class</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
            >
              <option value="">Choose a class...</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.section} ({cls.academicYear})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">{success}</div>
      )}

      {selectedClass && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">Present: {presentCount}</span>
              <span className="text-red-600 font-medium">Absent: {absentCount}</span>
              <span className="text-yellow-600 font-medium">Late: {lateCount}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => markAll('present')}
                className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
              >
                All Present
              </button>
              <button
                onClick={() => markAll('absent')}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
              >
                All Absent
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading students...</p>
          ) : records.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No active students in this class.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((record, index) => (
                    <tr key={record.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.rollNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{record.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {['present', 'absent', 'late'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(index, status)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                                record.status === status
                                  ? status === 'present'
                                    ? 'bg-green-600 text-white'
                                    : status === 'absent'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-yellow-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
