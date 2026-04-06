import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Thermometer, Lightbulb, Bluetooth } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { deviceService, homeService, normalizeListResponse, locationService } from '../api/services';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('Month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [locations, setLocations] = useState([]);

  const locationMap = locations.reduce((map, location) => {
    map[location._id || location.id] = location.name;
    return map;
  }, {});

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        try {
          const rootData = await homeService.getDashboard();
          setDashboardData(rootData?.data?.data || rootData?.data);
          
          // Assume chart data is part of dashboard response
          const chartFromDashboard = rootData?.data?.chartData || rootData?.data?.data?.chartData || [];
          setChartData(chartFromDashboard);
        } catch (e) {
          console.warn("Could not fetch from API", e);
          // Fallback to empty data
          setChartData([]);
        }
        const list = normalizeListResponse(await deviceService.getAll());
        const locationsList = normalizeListResponse(await locationService.getAll());
        setDevices(list);
        setLocations(locationsList);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load devices.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [timeFilter]);

  const stats = useMemo(() => {
    const total = devices.length;
    const active = devices.filter(
      (d) => d.status === 'ON' || d.status === 'active' || d.isOn === true
    ).length;
    const offline = Math.max(total - active, 0);
    return { total, active, offline };
  }, [devices]);

  const mostUsedDevices = useMemo(() => {
    return [...devices]
      .sort(
        (a, b) =>
          (b?.thresholds?.maxPower || 0) - (a?.thresholds?.maxPower || 0)
      )
      .slice(0, 4);
  }, [devices]);

  const filteredMostUsedDevices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mostUsedDevices;
    return mostUsedDevices.filter((device) => {
      const name = device?.name || '';
      const location =
        typeof device?.location === 'string'
          ? device.location
          : device?.location?.name || '';
      return (
        name.toLowerCase().includes(query) ||
        location.toLowerCase().includes(query)
      );
    });
  }, [mostUsedDevices, search]);

  const isDeviceOn = (status) => status === 'ON' || status === 'active' || status === true;
  const getToggleStatus = (status) => (isDeviceOn(status) ? 'OFF' : 'ON');

  const getDeviceId = (device) => device?._id || device?.id || device?.deviceId || '';

  const formatErrorMessage = (message) => {
    if (typeof message === 'string') return message;
    if (message?.message) return String(message.message);
    if (typeof message === 'object' && message !== null) {
      try {
        return JSON.stringify(message);
      } catch {
        return 'An unexpected error occurred.';
      }
    }
    return String(message || 'An unexpected error occurred.');
  };

  const toggleDevice = async (id, currentStatus) => {
    const nextStatus = getToggleStatus(currentStatus);
    try {
      await deviceService.toggleStatus(id, nextStatus);
      setDevices((prev) =>
        prev.map((d) =>
          getDeviceId(d) === id ? { ...d, status: nextStatus, isOn: nextStatus === 'ON' } : d
        )
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        `Could not update device status (${err?.response?.status || 'unknown'})`;
      console.error('Toggle device failed:', err);
      setError(message);
    }
  };

  return (
    <>
      <header className="top-header">
        <h1>Home</h1>
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {error ? <p className="dashboard-error">{formatErrorMessage(error)}</p> : null}
      {loading ? (
        <div className="dashboard-loading-screens">
          <div className="stats-row">
            <div className="skeleton skeleton-stat" />
            <div className="skeleton skeleton-stat" />
            <div className="skeleton skeleton-stat" />
          </div>
          <div className="dashboard-grid">
            <div className="left-column">
              <div className="skeleton skeleton-chart" />
              <div className="skeleton skeleton-text" />
            </div>
            <div className="right-column">
               <div className="skeleton skeleton-card" />
               <br/>
               <div className="skeleton skeleton-card" />
            </div>
          </div>
        </div>
      ) : null}

      {!loading && (
        <>
          <section className="stats-row">
            <div className="stat-card">
              <span>Total device</span> <h2>{stats.total}</h2>
            </div>
            <div className="stat-card">
              <span>Active device</span> <h2>{stats.active}</h2>
            </div>
            <div className="stat-card">
              <span>Offline device</span> <h2 className="yellow-text">{stats.offline}</h2>
            </div>
          </section>

          <div className="dashboard-grid">
            <div className="left-column">
              <div className="today-section">
                <div className="section-header">
                  <h2>Today</h2>
                  <span className="date">{new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div className="today-cards">
                  <div className="inner-card">
                    <div className="icon-box yellow"><Zap size={20} /></div>
                    <div>
                      <p>Consumption</p>
                      <h3>
                        {devices.reduce((sum, d) => sum + (d?.thresholds?.maxPower || 0), 0)} W
                      </h3>
                    </div>
                  </div>
                  <div className="inner-card">
                    <div className="icon-box green"><Thermometer size={20} /></div>
                    <div>
                      <p>Temperature</p>
                      <h3>24 c</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ai-tip">
                <Lightbulb size={20} className="tip-icon" />
                <p><b>AI Tip :</b> Turning off unused devices can help reduce your total energy cost.</p>
              </div>

            </div>

            <div className="right-column">
              <div className="section-header">
                <h3>Most used device</h3>
                <span className="all-link">All</span>
              </div>
              <div className="devices-grid">
                {filteredMostUsedDevices.map((device) => {
                  const currentStatus = device?.status || (device?.isOn ? 'ON' : 'OFF');
                  return (
                    <div
                      className={`device-card ${currentStatus}`}
                      key={device._id || device.id}
                      onClick={() => navigate(`/dashboard/devices/${getDeviceId(device)}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate(`/dashboard/devices/${getDeviceId(device)}`);
                      }}
                    >
                      <div className="device-icons">
                        <img
                          src={device?.categoryId?.categoryIcon}
                          alt="device icon"
                          className="device-main-icon"
                          onError={(e) => {
                            e.target.style.display = 'none'; // hide if image fails
                          }}
                        />
                        <Bluetooth size={16} className="bt-icon" />
                      </div>
                      <div className="device-info">
                        <h4>{device.name}</h4>
                        <span className="kwh">{device?.thresholds?.maxPower || 0} W</span>
                        <p>{locationMap[device.location] || locationMap[device.location?._id] || device.location?.name || device.location || 'Unknown'}</p>
                      </div>
                      <div className="switch-container">
                        <span className="status-label">{currentStatus}</span>
                        <div
                          className={`custom-switch ${currentStatus}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDevice(getDeviceId(device), currentStatus);
                          }}
                        >
                          <div className="switch-handle" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!mostUsedDevices.length && <p className="dashboard-empty">No devices available.</p>}
              </div>
            </div>
          </div>

          <div className="chart-section" style={{ marginTop: '24px', background: 'linear-gradient(145deg, #072a1c, #02120b)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '20px', padding: '24px' }}>
            <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Energy consumption (Kwh)</h3>
              <div className="time-toggles">
                <button className={`time-btn ${timeFilter === 'Day' ? 'active' : ''}`} onClick={() => setTimeFilter('Day')}>Day</button>
                <button className={`time-btn ${timeFilter === 'Week' ? 'active' : ''}`} onClick={() => setTimeFilter('Week')}>Week</button>
                <button className={`time-btn ${timeFilter === 'Month' ? 'active' : ''}`} onClick={() => setTimeFilter('Month')}>Month</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#02120b', border: '1px solid #22c55e', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#22c55e" fillOpacity={entry.value > 400 ? 1 : 0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  );
};