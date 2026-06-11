import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Thermometer, Lightbulb, Bluetooth, Coins } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { deviceService, homeService, normalizeListResponse, locationService, readingService, reportService } from '../api/services';
import './Home.css';

const getPeriodChartData = (period) => [];

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/[*?\-\\]/g, '').trim();
};

const ExpandableText = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  const cleaned = cleanText(text);

  return (
    <div className="expandable-text-wrapper">
      <div className={`text-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {cleaned}
      </div>
      {cleaned.length > 150 && (
        <button
          className="read-more-btn"
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        >
          {isExpanded ? 'Read Less' : 'Read More...'}
        </button>
      )}
    </div>
  );
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function PeriodPicker({ open, onClose, onConfirm, initialYear, initialMonth }) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  if (!open) return null;

  return createPortal(
    <div className="period-picker-modal" onClick={onClose}>
      <div className="period-picker" onClick={e => e.stopPropagation()}>
        <h3>Select Period</h3>
        <div className="picker-top">
          <button className="month-btn" style={{width:40,height:40,fontSize:20,padding:0}} onClick={() => setYear(y => y - 1)}>&#8249;</button>
          <input
            className="period-year-input"
            type="number"
            value={year}
            min={2000}
            max={2100}
            onChange={e => setYear(Number(e.target.value))}
          />
          <button className="month-btn" style={{width:40,height:40,fontSize:20,padding:0}} onClick={() => setYear(y => y + 1)}>&#8250;</button>
        </div>
        <div className="period-month-grid">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              className={`month-btn ${month === i + 1 ? 'active' : ''}`}
              onClick={() => setMonth(i + 1)}
            >{m}</button>
          ))}
        </div>
        <div className="picker-actions">
          <button className="period-done-btn" onClick={() => { onConfirm(year, month); onClose(); }}>Done</button>
          <button className="period-cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [chartPeriod, setChartPeriod] = useState('Month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [aiTip, setAiTip] = useState('');
  const [aiTipLoading, setAiTipLoading] = useState(false);
  const [chartDataLoading, setChartDataLoading] = useState(false);
  const [currentReadings, setCurrentReadings] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

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

  const locationMap = locations.reduce((map, location) => {
    map[location._id || location.id] = location.name;
    return map;
  }, {});

  const fetchChartData = async (period, year, month) => {
    try {
      setChartDataLoading(true);

      let res;
      if (period === 'Week') {
        res = await reportService.getWeekly(year, month);
      } else if (period === 'Month') {
        res = await reportService.getMonthly(year, month);
      } else {
        res = await reportService.getYearly(year);
      }

      const payload = res?.data?.data || res?.data;

      let normalized = [];

      if (period === 'Week' && Array.isArray(payload?.weeks)) {
        normalized = payload.weeks.map(item => ({
          name: `W${item.week}`,
          value: item.consumption ?? 0,
          cost: item.cost ?? 0,
        }));
      } else if (period === 'Month' && Array.isArray(payload?.months)) {
        const dataMap = {};
        payload.months.forEach(item => {
          const idx = typeof item.month === 'number'
            ? item.month - 1
            : MONTHS.indexOf(item.month) !== -1
              ? MONTHS.indexOf(item.month)
              : Number(item.month) - 1;
          if (idx >= 0 && idx < 12) {
            dataMap[idx] = { value: item.consumption ?? 0, cost: item.cost ?? 0 };
          }
        });
        normalized = MONTHS.map((m, i) => ({
          name: m,
          value: dataMap[i]?.value ?? 0,
          cost: dataMap[i]?.cost ?? 0,
        }));
      } else if (period === 'Year' && Array.isArray(payload?.years)) {
        normalized = payload.years.map(item => ({
          name: String(item.year),
          value: item.consumption ?? 0,
          cost: item.cost ?? 0,
        }));
      }

      setChartData(normalized);
    } catch (e) {
      console.warn('Failed to fetch chart data', e);
      setChartData([]);
    } finally {
      setChartDataLoading(false);
    }
  };

  const handleChartPeriodChange = (period) => {
    setChartPeriod(period);
  };

  const handlePeriodConfirm = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  useEffect(() => {
    fetchChartData(chartPeriod, selectedYear, selectedMonth);
  }, [chartPeriod, selectedYear, selectedMonth]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        try {
          const rootData = await homeService.getDashboard();
          setDashboardData(rootData?.data?.data || rootData?.data);
        } catch (e) {
          console.warn('Could not fetch from API', e);
        }
        const list = normalizeListResponse(await deviceService.getAll());
        const locationsList = normalizeListResponse(await locationService.getAll());
        
        let devicesWithConsumption = [...list];
        try {
          const readingsRes = await readingService.getCurrent();
          const readingsData = readingsRes?.data?.data || readingsRes?.data;
          setCurrentReadings(readingsData);
          
          const breakdown = readingsData?.deviceBreakdown || [];
          if (breakdown.length > 0) {
            const consumptionMap = new Map(breakdown.map(b => [b.deviceId, b.consumption]));
            devicesWithConsumption = list.map(d => ({
              ...d,
              consumption: consumptionMap.get(d._id || d.id) ?? d.consumption ?? 0
            }));
          }
        } catch (err) {
          console.warn('Could not fetch current readings for devices', err);
        }

        setDevices(devicesWithConsumption);
        setLocations(locationsList);
      } catch (err) {
        console.warn('Home data fetch failed, using mock data', err);
        setError('Server is taking too long to respond. Displaying demo data.');
        
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);



  const stats = useMemo(() => {
    // Always compute active/offline dynamically from local devices to react to toggles immediately
    const totalFromDashboard = dashboardData?.summary?.totalDevices || 0;
    const localTotal = devices.length;
    
    // Use the max of local array length or dashboard summary for total
    const total = Math.max(localTotal, totalFromDashboard);
    
    const active = devices.filter(
      (d) => d.status === 'ON' || d.status === 'active' || d.isOn === true
    ).length;
    
    const offline = Math.max(total - active, 0);
    
    return { total, active, offline };
  }, [devices, dashboardData]);

  const mostUsedDevices = useMemo(() => {
    if (dashboardData?.devices && dashboardData.devices.length > 0) {
      const fullDevicesMap = new Map();
      devices.forEach(d => fullDevicesMap.set(d.id || d._id, d));

      const mergedList = dashboardData.devices.map(dd => {
        const fullD = fullDevicesMap.get(dd.id || dd._id) || {};
        
        // Prioritize actual reading consumption over dashboard placeholder 0s
        const actualConsumption = fullD.consumption || dd.todayConsumption || dd.consumption || 0;

        return {
          ...fullD,
          ...dd,
          consumption: actualConsumption,
          todayConsumption: actualConsumption,
          categoryId: typeof fullD.categoryId === 'object' ? fullD.categoryId : (fullD.category || dd.categoryId)
        };
      });

      return mergedList.sort((a, b) => ((b.todayConsumption ?? b.consumption ?? 0) - (a.todayConsumption ?? a.consumption ?? 0))).slice(0, 4);
    }
    return [...devices]
      .sort((a, b) => {
        const aCons = a?.todayConsumption ?? a?.consumption ?? 0;
        const bCons = b?.todayConsumption ?? b?.consumption ?? 0;
        if (aCons !== 0 || bCons !== 0) return bCons - aCons;
        return (b?.thresholds?.maxPower || 0) - (a?.thresholds?.maxPower || 0);
      })
      .slice(0, 4);
  }, [devices, dashboardData]);

  const topDeviceId = mostUsedDevices[0] ? getDeviceId(mostUsedDevices[0]) : null;

  // Fetch AI Tip for the most consuming device
  useEffect(() => {
    const fetchTopDeviceRecommendation = async () => {
      if (topDeviceId) {
        try {
          setAiTipLoading(true);
          // NEW: Fetch from Health endpoint instead of standalone /recommendation
          const res = await deviceService.getHealth(topDeviceId);
          const data = res?.data?.data || res?.data;

          // Try to find recommendation in the health payload
          const bundledRec = data?.recommendation || data?.tips || data?.health?.recommendation || data?.health?.tips;

          if (bundledRec) {
            setAiTip(bundledRec);
          } else {
            console.warn('Health data loaded but no recommendation found in payload');
            setAiTip('Optimize your usage based on current device health to save energy.');
          }
        } catch (e) {
          console.warn('Failed to fetch health/recommendation data', e);
          setAiTip('System optimization insight is currently unavailable.');
        } finally {
          setAiTipLoading(false);
        }
      }
    };

    if (!loading && topDeviceId) {
      fetchTopDeviceRecommendation();
    }
  }, [topDeviceId, loading]);



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


  const toggleDevice = async (id, currentStatus) => {
    const nextStatus = getToggleStatus(currentStatus);
    try {
      await deviceService.toggleStatus(id, nextStatus);

      // Update main devices list
      setDevices((prev) =>
        prev.map((d) =>
          getDeviceId(d) === id ? { ...d, status: nextStatus, isOn: nextStatus === 'ON' } : d
        )
      );

      // Update dashboard data ONLY for the devices list, keeping Summary and other parts unchanged
      if (dashboardData) {
        setDashboardData(prev => {
          if (!prev) return prev;

          const updatedDevicesList = prev.devices ? prev.devices.map(d =>
            getDeviceId(d) === id ? { ...d, status: nextStatus, isOn: nextStatus === 'ON' } : d
          ) : prev.devices;

          return {
            ...prev,
            devices: updatedDevicesList
          };
        });
      }
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
              <br />
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
                        {dashboardData?.consumption?.today?.total !== undefined
                          ? `${Number(dashboardData.consumption.today.total).toFixed(4)} kWh`
                          : `${devices.reduce((sum, d) => sum + (d?.thresholds?.maxPower || 0), 0)} W`}
                      </h3>
                    </div>
                  </div>
                  <div className="inner-card">
                    <div className="icon-box green"><Coins size={20} /></div>
                    <div>
                      <p>Today Cost</p>
                      <h3>
                        {dashboardData?.consumption?.today?.cost !== undefined
                          ? `${Number(dashboardData.consumption.today.cost).toFixed(2)} EGP`
                          : 'N/A'}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {aiTip && (
                <div className="ai-tip">
                  <Lightbulb size={24} className="tip-icon" style={{ minWidth: '24px' }} />
                  <div className="tip-content">
                    <span className="tip-tag">AI recommendation</span>
                    {aiTipLoading ? (
                      <p>Analyzing consumption patterns...</p>
                    ) : (
                      <ExpandableText text={aiTip} />
                    )}
                  </div>
                </div>
              )}

              <div className="chart-section" style={{ marginTop: '24px', background: 'linear-gradient(145deg, #072a1c, #02120b)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '20px', padding: '24px' }}>
                <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h3 style={{ margin: 0, color: '#fff' }}>Energy consumption (Kwh)</h3>
                    <button
                      onClick={() => setPickerOpen(true)}
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', width: 'fit-content' }}
                    >
                      {MONTHS[selectedMonth - 1]} {selectedYear} ▾
                    </button>
                  </div>
                  <div className="time-toggles">
                    {['Week', 'Month', 'Year'].map((period) => (
                      <button
                        key={period}
                        className={`time-btn ${chartPeriod === period ? 'active' : ''}`}
                        onClick={() => handleChartPeriodChange(period)}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                {chartDataLoading ? (
                  <p className="loading-txt">Loading chart...</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 10, right: 16, left: 10, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        dy={10}
                        interval={0}
                        angle={chartPeriod === 'Month' ? -35 : 0}
                        textAnchor={chartPeriod === 'Month' ? 'end' : 'middle'}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94b8aa', fontSize: 12 }}
                        tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val.toFixed(2)}
                        width={55}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(34,197,94,0.06)' }}
                        contentStyle={{ background: '#02120b', border: '1px solid #22c55e', borderRadius: '8px', color: '#f8fafc' }}
                        formatter={(val, name, props) => [
                          `${Number(val).toFixed(2)} kWh`,
                          `Cost: ${Number(props.payload.cost ?? 0).toFixed(2)} EGP`
                        ]}
                      />
                      <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={16}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#22c55e" fillOpacity={entry.value > 0 ? 1 : 0.3} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>

            <div className="right-column">
              <div className="section-header">
                <h3>Most used device</h3>
                <button className="all-link" onClick={() => navigate('/dashboard/devices')}>
                  All
                </button>
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
                        <Bluetooth size={40} color={currentStatus === 'ON' ? '#22c55e' : '#94a3b8'} className="bt-icon-main" />
                      </div>
                      <div className="device-info">
                        <h4>{device.name}</h4>
                        <span className="kwh">
                          { (device?.todayConsumption !== undefined || device?.consumption !== undefined)
                            ? `${Number(device?.todayConsumption ?? device?.consumption).toFixed(4)} kWh`
                            : `${device?.thresholds?.maxPower || 0} W`}
                        </span>
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

              <div className="home-add-device-section" style={{ marginTop: '24px' }}>
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}
                  onClick={() => navigate('/dashboard/devices/add')}
                >
                  + Add New Device
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <PeriodPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePeriodConfirm}
        initialYear={selectedYear}
        initialMonth={selectedMonth}
      />
    </>
  );
};