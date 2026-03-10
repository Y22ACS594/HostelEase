import { useState, useEffect } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const API = import.meta.env.VITE_API_URL;

const token = () => localStorage.getItem("token");

const KPICard = ({ icon, label, value, subValue, color }) => (
  <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
    <div
      className="w-10 h-10 flex items-center justify-center rounded-lg text-xl mb-3"
      style={{ background: `${color}20` }}
    >
      {icon}
    </div>

    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>

    {subValue && (
      <div className="text-xs mt-1" style={{ color }}>
        {subValue}
      </div>
    )}
  </div>
);

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${token()}`
    };

    setLoading(true);

    Promise.all([
      axios.get(`${API}/api/analytics/overview`, { headers }),
      axios.get(`${API}/api/analytics/leave-trends`, { headers }),
      axios.get(`${API}/api/analytics/room-occupancy`, { headers })
    ])
      .then(([ov, tr, oc]) => {
        setOverview(ov.data);
        setTrends(tr.data);
        setOccupancy(oc.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const MONTHS = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  const trendChart = (() => {
    const map = {};

    trends.forEach(({ _id, count }) => {
      const key = `${MONTHS[_id.month]} ${_id.year}`;

      if (!map[key])
        map[key] = {
          month: key,
          Approved: 0,
          Pending: 0,
          Rejected: 0
        };

      map[key][_id.status] = count;
    });

    return Object.values(map).slice(-6);
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = overview?.cards || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Hostel Analytics
        </h1>
        <p className="text-sm text-gray-400">
          Real-time hostel statistics
        </p>
      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <KPICard
          icon="👥"
          label="Total Students"
          value={cards.totalStudents || 0}
          color="#6366f1"
        />

        <KPICard
          icon="🏠"
          label="Total Rooms"
          value={cards.totalRooms || 0}
          color="#8b5cf6"
        />

        <KPICard
          icon="🛏️"
          label="Occupied Beds"
          value={`${cards.occupiedBeds || 0}/${cards.totalBeds || 0}`}
          subValue={`${cards.vacantBeds || 0} beds available`}
          color="#10b981"
        />

        <KPICard
          icon="📋"
          label="Pending Leaves"
          value={cards.pendingLeaves || 0}
          subValue={`${cards.approvedLeavesThisMonth || 0} approved this month`}
          color="#f59e0b"
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Leave Trends Chart */}

        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow border border-gray-100">

          <h3 className="font-semibold mb-4">
            Leave Trends (Last 6 Months)
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendChart}>

              <defs>

                <linearGradient id="approved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>

              </defs>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Area
                type="monotone"
                dataKey="Approved"
                stroke="#10b981"
                fill="url(#approved)"
              />

              <Area
                type="monotone"
                dataKey="Pending"
                stroke="#f59e0b"
                fill="url(#pending)"
              />

              <Area
                type="monotone"
                dataKey="Rejected"
                stroke="#ef4444"
                fill="none"
              />

            </AreaChart>
          </ResponsiveContainer>

        </div>

        {/* Room Occupancy */}

        <div className="bg-white rounded-xl p-5 shadow border border-gray-100">

          <h3 className="font-semibold mb-4">
            Room Occupancy
          </h3>

          {occupancy.length === 0 ? (
            <p className="text-sm text-gray-400">
              No rooms configured
            </p>
          ) : (
            occupancy.map((room) => {

              const percent = room.occupancyPercent;

              return (
                <div key={room.roomNumber} className="mb-3">

                  <div className="flex justify-between text-xs mb-1">

                    <span>Room {room.roomNumber}</span>

                    <span>
                      {room.occupiedBeds}/{room.totalBeds}
                    </span>

                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded">

                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${percent}%`,
                        background:
                          percent > 90
                            ? "#ef4444"
                            : percent > 60
                            ? "#f59e0b"
                            : "#10b981"
                      }}
                    />

                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>

    </div>
  );
}