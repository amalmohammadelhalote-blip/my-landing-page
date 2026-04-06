import React, { useState, useEffect } from 'react';
import { Search, Lightbulb, Zap, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { reportsService } from '../api/services';
import './Dashboard.css';

const CustomLineDot = (props) => {
  const { cx, cy } = props;
  return (
    <svg x={cx - 6} y={cy - 6} width={12} height={12} viewBox="0 0 12 12" fill="none">
       <circle cx="6" cy="6" r="4" fill="#22c55e" stroke="#fff" strokeWidth="2" />
    </svg>
  );
};

export default function Reports() {
  const [periodBar, setPeriodBar] = useState('Week');
  const [periodLine, setPeriodLine] = useState('Week');
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch real data from API
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        setError('');

        const [barResponse, lineResponse, pieResponse] = await Promise.all([
          reportsService.getEnergyConsumption(periodBar.toLowerCase()),
          reportsService.getDevicePerformance(periodLine.toLowerCase()),
          reportsService.getDeviceBreakdown()
        ]);

        setBarData(barResponse.data || []);
        setLineData(lineResponse.data || []);
        setPieData(pieResponse.data || []);

      } catch (err) {
        console.error('Error fetching reports data:', err);
        setError('Failed to load reports data. Please try again later.');
        // Fallback to empty data
        setBarData([]);
        setLineData([]);
        setPieData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [periodBar, periodLine]);

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
      {loading ? (
        <div className="dashboard-loading-screens">
          <div className="skeleton skeleton-chart" />
          <div className="skeleton skeleton-chart" />
        </div>
      ) : (
        <div className="report-grid">
        
        {/* Left Column */}
        <div className="report-left">
          
          {/* Monthly Plan Gauge Card */}
          <div className="report-panel report-panel-center">
            <div className="meter-container">
              <div className="meter-semicircle" />
              <div className="meter-text">
                <p>Complete</p>
                <h2>70%</h2>
              </div>
            </div>
            
            <p style={{ color: '#f8fafc', fontSize: '18px', fontWeight: '500', marginBottom: '24px' }}>
              You've used 70% of your monthly plan.
            </p>

            <div className="stats-dual">
              <div className="stat-box">
                <div className="label"><Zap size={14} color="#eab308" /> Total Cost :</div>
                <div className="value">43.75 EGP</div>
              </div>
              <div className="stat-box">
                <div className="label"><Zap size={14} color="#eab308" /> Total Consumption :</div>
                <div className="value">254 KWh</div>
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
            
            <div style={{ height: '240px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#f8fafc" axisLine={false} tickLine={false} dy={10} fontSize={13} />
                  <YAxis stroke="#f8fafc" axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => val === 0 ? '0' : `${val/1000}K`} fontSize={13} domain={[0, 40000]} ticks={[0, 10000, 20000, 30000, 40000]} />
                  <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
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

            <div style={{ height: '220px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#f8fafc" axisLine={false} tickLine={false} dy={10} fontSize={13} />
                  <YAxis stroke="#f8fafc" axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => val === 0 ? '0' : `${val/1000}K`} fontSize={13} domain={[0, 40000]} ticks={[0, 10000, 20000, 30000, 40000]} />
                  <Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={2} dot={<CustomLineDot />} />
                </LineChart>
              </ResponsiveContainer>
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
              
              <div style={{ width: '140px', height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
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

      )}
    </div>
  );
}