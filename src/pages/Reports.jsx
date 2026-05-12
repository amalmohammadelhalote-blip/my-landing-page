import React, { useState, useEffect, useMemo } from 'react';
import { Search, Lightbulb, Zap, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { readingService, homeService, deviceService } from '../api/services';
import './Reports.css';

const CustomLineDot = (props) => {
  const { cx, cy } = props;
  return (
    <svg x={cx - 6} y={cy - 6} width={12} height={12} viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="4" fill="#22c55e" stroke="#fff" strokeWidth="2" />
    </svg>
  );
};

export default function Reports() {
  const [periodBar, setPeriodBar] = useState('Month');
  const [periodLine, setPeriodLine] = useState('Month');
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [devices, setDevices] = useState([]);

  const deviceRows = useMemo(() => {
    const breakdown = dashboardData?.consumption?.deviceBreakdown;
    if (Array.isArray(breakdown) && breakdown.length > 0) {
      return breakdown.map((item, index) => ({
        device: item.deviceName || `Device ${index + 1}`,
        energy: `${item.consumption || 0} Kwh`,
        cost: item.cost ? `${Number(item.cost).toFixed(2)} EGP` : '0 EGP',
        time: item.usageHours ? `${item.usageHours}h` : '0h',
      }));
    }

    if (devices.length > 0) {
      return devices.map((item, index) => ({
        device: item.name || `Device ${index + 1}`,
        energy: `${item.lastReading?.todayConsumption || 0} Kwh`,
        cost: item.lastReading?.todayCost ? `${Number(item.lastReading.todayCost).toFixed(2)} EGP` : '0 EGP',
        time: item.lastReading?.todayUsageHours ? `${item.lastReading.todayUsageHours}h` : '0h',
      }));
    }

    return [];
  }, [dashboardData, devices]);

  useEffect(() => {
    fetchDashboardStats();
    fetchDevices();
  }, []);

  useEffect(() => {
    fetchBarData(periodBar);
  }, [periodBar]);

  useEffect(() => {
    fetchLineData(periodLine);
  }, [periodLine]);

  const fetchDashboardStats = async () => {
    try {
      const res = await homeService.getDashboard();
      setDashboardData(res?.data?.data || res?.data);
    } catch (err) {
      console.warn('Dashboard stats fetch failed', err);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await deviceService.getAll();
      const data = res?.data?.data || res?.data || [];
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Devices fetch failed', err);
      setDevices([]);
    }
  };

  const fetchBarData = async (period) => {
    try {
      setLoading(true);
      let res;
      if (period === 'Month') {
        res = await readingService.getCurrent();
      } else {
        res = await readingService.getSummary(period.toLowerCase());
      }

      const rData = res?.data?.data || res?.data;

      if (rData?.days) {
        setBarData(rData.days.map(d => ({
          name: d.day ? `Day ${d.day}` : d.name,
          value: d.consumption || 0
        })));
      }

      // Update Breakdown from the main summary response (assuming getCurrent/Month is default)
      if (period === 'Month' && rData?.deviceBreakdown) {
        const colors = ['#22c55e', '#eab308', '#3b82f6', '#f43f5e', '#8b5cf6', '#a855f7', '#06b6d4'];
        const total = rData.totalConsumption || 1;
        setPieData(rData.deviceBreakdown.map((item, idx) => ({
          name: item.deviceName || 'Device',
          value: parseFloat(((item.consumption || 0) / total * 100).toFixed(1)),
          color: colors[idx % colors.length]
        })));
      }
    } catch (err) {
      console.error('Bar data fetch failed', err);
      // Fallback to empty to avoid static data confusion
      setBarData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLineData = async (period) => {
    try {
      let res;
      if (period === 'Month') {
        res = await readingService.getCurrent();
      } else {
        res = await readingService.getSummary(period.toLowerCase());
      }
      const rData = res?.data?.data || res?.data;

      if (rData?.days) {
        setLineData(rData.days.map(d => ({
          name: d.day ? `Day ${d.day}` : d.name,
          value: d.consumption || 0
        })));
      }
    } catch (err) {
      console.error('Line data fetch failed', err);
      setLineData([]);
    }
  };

  return (
    <div className="report-page">
      <header className="top-header" style={{ marginBottom: '24px' }}>
        <h1>Reports</h1>
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search" />
        </div>
      </header>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="report-grid">
        <div className="report-left">
          <div className="report-panel">
            <div className="chart-header-row">
              <h3>Energy cost over time</h3>
              <div className="time-toggles">
                <button className={`time-btn ${periodBar === 'Week' ? 'active' : ''}`} onClick={() => setPeriodBar('Week')}>Week</button>
                <button className={`time-btn ${periodBar === 'Month' ? 'active' : ''}`} onClick={() => setPeriodBar('Month')}>Month</button>
                <button className={`time-btn ${periodBar === 'Year' ? 'active' : ''}`} onClick={() => setPeriodBar('Year')}>Year</button>
              </div>
            </div>

            <div className="report-chart-card" style={{ marginTop: '18px' }}>
              {loading ? (
                <div className="skeleton skeleton-chart" style={{ height: '100%' }} />
              ) : barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280} minWidth={0}>
                  <BarChart data={barData} barSize={12} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#f8fafc" axisLine={false} tickLine={false} dy={10} fontSize={13} />
                    <YAxis stroke="#f8fafc" axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => val === 0 ? '0' : val.toFixed(0)} fontSize={13} />
                    <Tooltip contentStyle={{ background: '#08231b', border: '1px solid #22c55e', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-empty" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>No data for this period</div>
              )}
            </div>
          </div>
        </div>

        <div className="report-right">
          <div className="report-panel report-table-panel">
            <div className="chart-header-row">
              <h3>Device activity</h3>
            </div>
            <div className="device-table-wrapper">
              <table className="device-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Energy</th>
                    <th>Cost</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceRows.length > 0 ? (
                    deviceRows.slice(0, 4).map((item, index) => (
                      <tr key={index}>
                        <td>{item.device}</td>
                        <td>{item.energy}</td>
                        <td>{item.cost}</td>
                        <td>{item.time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No device activity data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="report-panel report-breakdown-panel">
            <h3>Device Usage Breakdown</h3>
            <div className="breakdown-grid">
              <div className="breakdown-legend">
                <ul className="custom-legend">
                  {pieData.length > 0 ? pieData.map((entry, index) => (
                    <li key={index}>
                      <div className="legend-dot" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name}</span>
                      <strong>{entry.value}%</strong>
                    </li>
                  )) : devices.length > 0 ? devices.slice(0, 4).map((item, index) => (
                    <li key={index}>
                      <div className="legend-dot" style={{ backgroundColor: ['#22c55e', '#facc15', '#3b82f6', '#f43f5e'][index] }} />
                      <span>{item.name}</span>
                      <strong>{Math.round(item.lastReading?.todayConsumption || 0)} Kwh</strong>
                    </li>
                  )) : (
                    <li style={{ color: '#94a3b8', padding: '12px 0' }}>
                      No device breakdown available.
                    </li>
                  )}
                </ul>
              </div>
              <div className="breakdown-chart">
                <ResponsiveContainer width="100%" height={180} minWidth={0}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      stroke="#02120b"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="report-panel report-panel-full">
        <div className="chart-header-row">
          <h3>Energy consumption (Kwh)</h3>
          <div className="time-toggles">
            <button className={`time-btn ${periodLine === 'Week' ? 'active' : ''}`} onClick={() => setPeriodLine('Week')}>Week</button>
            <button className={`time-btn ${periodLine === 'Month' ? 'active' : ''}`} onClick={() => setPeriodLine('Month')}>Month</button>
            <button className={`time-btn ${periodLine === 'Year' ? 'active' : ''}`} onClick={() => setPeriodLine('Year')}>Year</button>
          </div>
        </div>

        <div className="report-chart-card" style={{ marginTop: '18px' }}>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              <LineChart data={lineData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#f8fafc" axisLine={false} tickLine={false} dy={10} fontSize={13} />
                <YAxis stroke="#f8fafc" axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => val === 0 ? '0' : val.toFixed(0)} fontSize={13} />
                <Tooltip contentStyle={{ background: '#08231b', border: '1px solid #22c55e', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-empty" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>No data for this period</div>
          )}
        </div>
      </div>
    </div>
  );
}