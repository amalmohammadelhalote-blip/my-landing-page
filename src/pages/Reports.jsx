import React, { useState, useEffect } from 'react';
import { Search, Lightbulb, Zap, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { readingService, homeService } from '../api/services';
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

  useEffect(() => {
    fetchDashboardStats();
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
      <header className="top-header" style={{ marginBottom: '32px' }}>
        <h1>Reports</h1>
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search" />
        </div>
      </header>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="report-grid">

        {/* Left Column */}
        <div className="report-left">

          {/* Monthly Plan Gauge Card */}
          <div className="report-panel report-panel-center">
            <div className="meter-container">
              <div className="meter-semicircle">
                <div className="meter-needle" />
              </div>
              <div className="meter-text">
                <p>Complete</p>
                <h2>{Math.round(dashboardData?.consumption?.planProgress?.percentage || 0)}%</h2>
              </div>
            </div>

            <p style={{ color: '#f8fafc', fontSize: '18px', fontWeight: '500', marginBottom: '24px' }}>
              You've used {Math.round(dashboardData?.consumption?.planProgress?.percentage || 0)}% of your monthly plan.
            </p>

            <div className="stats-dual">
              <div className="stat-box">
                <div className="label"><Zap size={14} color="#eab308" /> Total Cost :</div>
                <div className="value">{Number(dashboardData?.consumption?.month?.cost || 0).toFixed(2)} EGP</div>
              </div>
              <div className="stat-box">
                <div className="label"><Zap size={14} color="#eab308" /> Total Consumption :</div>
                <div className="value">{Number(dashboardData?.consumption?.month?.total || 0).toFixed(4)} KWh</div>
              </div>
            </div>

            <div style={{ marginTop: '24px', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '13px' }}>
                <Clock size={16} /> Period :
              </div>
              <select style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}>
                <option style={{ color: '#000' }}>September 2025</option>
                <option style={{ color: '#000' }}>August 2025</option>
              </select>
            </div>
          </div>

          {/* Energy Consumption Bar Chart */}
          <div className="report-panel">
            <div className="chart-header-row">
              <h3>Energy consumption</h3>
              <div className="time-toggles">
                <button className={`time-btn ${periodBar === 'Week' ? 'active' : ''}`} onClick={() => setPeriodBar('Week')}>Week</button>
                <button className={`time-btn ${periodBar === 'Month' ? 'active' : ''}`} onClick={() => setPeriodBar('Month')}>Month</button>
                <button className={`time-btn ${periodBar === 'Year' ? 'active' : ''}`} onClick={() => setPeriodBar('Year')}>Year</button>
              </div>
            </div>

            <div style={{ height: '240px', marginTop: '20px', minHeight: '240px', width: '100%' }}>
              {loading ? (
                <div className="skeleton skeleton-chart" style={{ height: '100%' }} />
              ) : barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240} minWidth={0}>
                  <BarChart data={barData} barSize={12} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#f8fafc" axisLine={false} tickLine={false} dy={10} fontSize={13} />
                    <YAxis stroke="#f8fafc" axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => val === 0 ? '0' : val.toFixed(3)} fontSize={13} />
                    <Tooltip contentStyle={{ background: '#08231b', border: '1px solid #22c55e', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-empty" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>No data for this period</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="report-right">

          {/* AI Tip */}
          <div className="ai-tip-card">
            <Lightbulb size={24} color="#eab308" style={{ flexShrink: 0 }} />
            <p>AI Tip : Turning off unused devices can help reduce your total energy cost.</p>
          </div>

          {/* Device Performance Line Chart */}
          <div className="report-panel">
            <div className="chart-header-row">
              <h3>Device performance</h3>
              <div className="time-toggles">
                <button className={`time-btn ${periodLine === 'Week' ? 'active' : ''}`} onClick={() => setPeriodLine('Week')}>Week</button>
                <button className={`time-btn ${periodLine === 'Month' ? 'active' : ''}`} onClick={() => setPeriodLine('Month')}>Month</button>
                <button className={`time-btn ${periodLine === 'Year' ? 'active' : ''}`} onClick={() => setPeriodLine('Year')}>Year</button>
              </div>
            </div>

            <div style={{ height: '220px', marginTop: '20px', minHeight: '220px', width: '100%' }}>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220} minWidth={0}>
                  <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#f8fafc" axisLine={false} tickLine={false} dy={10} fontSize={13} />
                    <YAxis stroke="#f8fafc" axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => val === 0 ? '0' : val.toFixed(3)} fontSize={13} />
                    <Tooltip contentStyle={{ background: '#08231b', border: '1px solid #22c55e', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={2} dot={<CustomLineDot />} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-empty" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>No data for this period</div>
              )}
            </div>
          </div>

          {/* Device Usage Breakdown Pie Chart */}
          <div className="report-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#fff', fontSize: '18px', textAlign: 'center' }}>Device Usage Breakdown</h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, padding: '0 20px' }}>
              <ul className="custom-legend">
                {pieData.map((entry, index) => (
                  <li key={index}>
                    <div className="legend-dot" style={{ backgroundColor: entry.color }} />
                    {entry.name} : {entry.value}%
                  </li>
                ))}
              </ul>

              <div style={{ width: '140px', height: '140px', minHeight: '140px' }}>
                <ResponsiveContainer width="100%" height={140} minWidth={0}>
                  <PieChart>
                    <Pie
                      data={pieData.length > 0 ? pieData : [{ name: 'Empty', value: 100, color: '#1e293b' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
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
    </div>
  );
}