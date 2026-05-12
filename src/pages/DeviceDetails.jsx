import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Bluetooth, Lightbulb, Zap, Plug, Timer, Coins, Power, Edit, Trash2, Tv } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { deviceService, categoryService, locationService, readingService } from '../api/services';
import './DeviceDetails.css';

const GaugeChart = ({ percentage }) => {
  const r = 80;
  const C = Math.PI * r;
  const p1 = 0.3 * C;
  const p2 = 0.4 * C;
  const p3 = 0.3 * C;
  const rot = (percentage / 100) * 180;
  return (
    <svg viewBox="0 0 200 120" className="gauge-svg">
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray={`${p1} ${C}`} strokeDashoffset="0" />
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#facc15" strokeWidth="20" strokeDasharray={`${p2} ${C}`} strokeDashoffset={`-${p1}`} />
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray={`${p3} ${C}`} strokeDashoffset={`-${p1 + p2}`} />
      <g transform={`rotate(${rot}, 100, 100)`}>
        <polygon points="96,105 104,105 100,30" fill="#fff" />
        <circle cx="100" cy="100" r="8" fill="#fff" />
      </g>
    </svg>
  );
};

const ExpandableText = ({ text, limit = 4 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  // Clean the text from *, -, ?, \ symbols as requested
  const cleanedText = text.replace(/[*?\-\\]/g, '').trim();

  return (
    <div className="expandable-text-wrapper">
      <div className={`text-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {cleanedText}
      </div>
      {cleanedText.length > 200 && (
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

export default function DeviceDetails() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState(null);
  const [health, setHealth] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('Day');
  const [recommendation, setRecommendation] = useState(null);

  // Edit/Delete states
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxVolt: '',
    minVolt: '',
    maxCurrent: '',
    minCurrent: '',
    location: '',
    categoryId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [updatingPower, setUpdatingPower] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- Helpers ---
  const parseResponsePayload = (response) => {
    if (!response) return null;
    const payload = response?.data?.data ?? response?.data;
    return payload || null;
  };

  const normalizeChartHistory = (payload, period) => {
    if (!payload || !payload.days || payload.days.length === 0) {
      return [];
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (period === 'Day') {
      // Show data for the latest day available with readings
      const latestDay = [...payload.days].sort((a, b) => b.day - a.day).find(d => d.readings && d.readings.length > 0);
      if (!latestDay) return [];
      
      return latestDay.readings.map(r => ({
        name: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        value: Number(r.power || 0)
      }));
    }

    if (period === 'Week') {
      // Take up to last 7 days and use average power
      return payload.days.slice(-7).map(d => {
        const date = new Date(payload.month + '-' + String(d.day).padStart(2, '0'));
        const avgPower = d.readings && d.readings.length > 0
          ? d.readings.reduce((sum, r) => sum + (r.power || 0), 0) / d.readings.length
          : 0;
        
        return {
          name: dayNames[date.getDay()],
          value: Number(avgPower.toFixed(2))
        };
      });
    }

    if (period === 'Month') {
      // Show consumption per day
      return payload.days.map(d => ({
        name: `${d.day}`,
        value: Number((d.consumption || 0).toFixed(4))
      }));
    }

    return [];
  };

  // --- Handlers ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        categoryId: formData.categoryId,
        thresholds: {
          maxVolt: Number(formData.maxVolt),
          minVolt: Number(formData.minVolt),
          maxCurrent: Number(formData.maxCurrent),
          minCurrent: Number(formData.minCurrent),
        }
      };
      await deviceService.update(deviceId, payload);
      setSuccessMsg('Device updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsEditing(false);
      const res = await deviceService.getOne(deviceId);
      setSelectedDeviceDetail(parseResponsePayload(res));
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDevice = async () => {
    try {
      setIsSubmitting(true);
      await deviceService.delete(deviceId);
      navigate('/dashboard/devices');
    } catch (err) {
      setError('Deletion failed.');
      setIsDeleting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [devRes, catsRes, locsRes] = await Promise.all([
          deviceService.getOne(deviceId),
          categoryService.getAll(),
          locationService.getAll()
        ]);

        const devData = parseResponsePayload(devRes);
        setSelectedDeviceDetail(devData);
        setCategories(parseResponsePayload(catsRes) || []);
        setLocations(parseResponsePayload(locsRes) || []);

        setFormData({
          name: devData?.name || '',
          description: devData?.description || '',
          maxVolt: devData?.thresholds?.maxVolt || '',
          minVolt: devData?.thresholds?.minVolt || '',
          maxCurrent: devData?.thresholds?.maxCurrent || '',
          minCurrent: devData?.thresholds?.minCurrent || '',
          location: devData?.location?._id || devData?.location || '',
          categoryId: devData?.categoryId?._id || devData?.categoryId || ''
        });
      } catch (err) {
        setError('Failed to load device details.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [deviceId]);

  // --- Fetch Chart Data & Health ---
  useEffect(() => {
    let mounted = true;
    const fetchHealthAndChart = async () => {
      if (!deviceId || isEditing) return;
      try {
        setHealthLoading(true);
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // Fetch readings and health in parallel if needed
        const [readingsRes, healthRes] = await Promise.all([
          readingService.getMonthly(deviceId, currentMonthStr),
          deviceService.getHealth(deviceId).catch(e => {
            console.warn('Health endpoint failed, falling back to readings only', e);
            return null;
          })
        ]);

        const readingsData = parseResponsePayload(readingsRes);
        const healthData = parseResponsePayload(healthRes);

        if (!mounted) return;
        
        // Combine data
        const combinedHealth = { ...readingsData, health: healthData };
        setHealth(combinedHealth);
        
        const normalized = normalizeChartHistory(readingsData, chartPeriod);
        setChartData(normalized);

        // EXTRA: Check if recommendation is bundled within health or monthly response
        const bundledRec = healthData?.recommendation || healthData?.tips || 
                          readingsData?.recommendation || readingsData?.tips;
        
        if (bundledRec) {
          setRecommendation({ recommendation: bundledRec });
        }
      } catch (err) {
        console.warn('Failed to load chart/health data:', err);
      } finally {
        if (mounted) setHealthLoading(false);
      }
    };

    fetchHealthAndChart();
    const interval = setInterval(fetchHealthAndChart, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [deviceId, chartPeriod, isEditing]);

  const handlePowerToggle = async () => {
    if (!selectedDeviceDetail) return;
    const isOn = selectedDeviceDetail.status === 'ON';
    const nextStatus = isOn ? 'OFF' : 'ON';
    try {
      setUpdatingPower(true);
      await deviceService.toggleStatus(deviceId, nextStatus);
      setSelectedDeviceDetail(prev => ({
        ...prev,
        status: nextStatus,
        isOn: nextStatus === 'ON'
      }));
    } catch (err) {
      setError('Action failed. Check connection.');
    } finally {
      setUpdatingPower(false);
    }
  };

  // --- Display Variables ---
  const selectedDevice = selectedDeviceDetail;
  const isOn = selectedDevice?.status === 'ON' || selectedDevice?.isOn === true;
  const hData = health?.health ?? health?.metrics ?? health?.data ?? health ?? {};

  const getVal = (key1, key2) =>
    hData[key1] ?? hData[key2] ??
    selectedDevice?.lastReading?.[key1] ?? selectedDevice?.lastReading?.[key2] ??
    selectedDevice?.[key1] ?? selectedDevice?.[key2] ?? 'N/A';

  const currentVoltage = getVal('voltage', 'currentVoltage');
  const currentAmpere =
    getVal('current', 'currentAmpere') !== 'N/A'
      ? getVal('current', 'currentAmpere')
      : getVal('ampere', 'currentAmpere');
  const lastUpdate = getVal('lastUpdate',
    'updatedAt') ??
    getVal('timestamp', 'date');
  const estimatedCost =
    getVal('todayEstimatedCost', 'estimatedCost') !== 'N/A'
      ? getVal('todayEstimatedCost', 'estimatedCost')
      : getVal('estimatedCost', 'todayEstimatedCost')

  const maxPower = Number(selectedDevice?.thresholds?.maxPower) || 1000;
  const currentPowerVal = (parseFloat(currentVoltage) || 0) * (parseFloat(currentAmpere) || 0);
  const usagePercentage = Math.min((currentPowerVal / maxPower) * 100, 100);

  const formatLastUpdate = (val) => {
    if (!val || val === 'N/A') return 'N/A';
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return val;
  };

  // --- Render logic ---
  if (isEditing) {
    return (
      <div className="report-page edit-page-mode">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="back-btn" onClick={() => setIsEditing(false)}>Back</button>
            <h1>Edit device</h1>
          </div>
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search" />
          </div>
        </header>

        <div className="edit-form-container">
          <h2>Edit device</h2>
          <form onSubmit={handleEditSubmit} className="edit-form">
            <div className="form-group full">
              <label>Device name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group full">
              <label>Device description</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Max volt</label>
                <input type="number" value={formData.maxVolt} onChange={e => setFormData({ ...formData, maxVolt: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Min volt</label>
                <input type="number" value={formData.minVolt} onChange={e => setFormData({ ...formData, minVolt: e.target.value })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Max current</label>
                <input type="number" value={formData.maxCurrent} onChange={e => setFormData({ ...formData, maxCurrent: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Min current</label>
                <input type="number" value={formData.minCurrent} onChange={e => setFormData({ ...formData, minCurrent: e.target.value })} />
              </div>
            </div>

            <div className="form-group full">
              <label>Select Location</label>
              <select value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required>
                <option value="">Select Location</option>
                {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
              </select>
            </div>

            <div className="form-group full">
              <label>Select Category</label>
              <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>

            {error && <p className="error-txt">{error}</p>}

            <button type="submit" className="confirm-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Confirm changes'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
  <div className="report-page">

    {/* DELETE MODAL */}
    {isDeleting && (
      <div className="modal-overlay">
        <div className="delete-modal">
          <h3>Are you sure you want to delete this device ?</h3>

          <div className="modal-actions">
            <button
              className="confirm-delete-btn"
              onClick={handleDeleteDevice}
            >
              Confirm delete
            </button>

            <button
              className="cancel-delete-btn"
              onClick={() => setIsDeleting(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* HEADER */}
    <header className="top-header">
      <h1>Device Details</h1>

      <div className="search-bar">
        <Search size={18} />
        <input type="text" placeholder="Search" />
      </div>
    </header>

    {/* CONTENT */}
    <div className="device-layout">

      {/* LEFT BIG CARD */}
      <div className="usage-card main-card">

        <h2 className="usage-title">
          Usage Summary
        </h2>

        <p className="usage-subtitle">
          Track your device's daily performance.
        </p>

        <div className="gauge-container">
          <GaugeChart percentage={usagePercentage} />
        </div>

        <div className="usage-stat-grid">

          <div className="usage-stat-box">
            <div className="stat-label">
              <Zap size={16} />
              Current voltage :
            </div>

            <strong>
              {currentVoltage} V
            </strong>
          </div>

          <div className="usage-stat-box">
            <div className="stat-label">
              <Plug size={16} />
              Current power :
            </div>

            <strong>
              {currentPowerVal.toFixed(2)} W
            </strong>
          </div>

          <div className="usage-stat-box">
            <div className="stat-label">
              <Timer size={16} />
              Last update :
            </div>

            <strong>
              {formatLastUpdate(lastUpdate)}
            </strong>
          </div>

          <div className="usage-stat-box">
            <div className="stat-label">
              <Coins size={16} />
              Estimated Cost :
            </div>

            <strong>
              {estimatedCost} EGP
            </strong>
          </div>

        </div>

        {/* POWER BUTTON */}
        <button
          className={`switch-btn ${
            isOn ? 'switch-on' : 'switch-off'
          }`}
          onClick={handlePowerToggle}
        >
          <Power size={28} />
        </button>

        {/* ACTION BUTTONS */}
        <div className="action-buttons-row">

          <button
            className="btn-action btn-edit"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={16} />
            Edit
          </button>

          <button
            className="btn-action btn-delete"
            onClick={() => setIsDeleting(true)}
          >
            <Trash2 size={16} />
            Delete
          </button>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="top-right-wrapper">

        {/* DEVICE CARD */}
        <div className="top-right-device-card">

          <div className={`icon-wrapper ${isOn ? 'on' : ''}`}>
            <Bluetooth
              size={42}
              color={isOn ? '#22c55e' : '#94a3b8'}
            />
          </div>

          <div className="device-meta">
            <h3>
              {selectedDevice?.name || 'Device'}
            </h3>

            <p className="loc-text">
              {selectedDevice?.location?.name ||
                'Unknown Location'}
            </p>

            <p className="cat-text">
              {selectedDevice?.categoryId?.name ||
                'Unknown Category'}
            </p>
          </div>

        </div>

        {/* AI CARD */}
        <div className="ai-tip-table-card">

          <div className="ai-table-header">
            <Lightbulb size={22} color="#facc15" />
            <h3>AI Recommendations</h3>
          </div>

          <table className="ai-table">

            <thead>
              <tr>
                <th>Category</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>
                  <span className="td-badge">
                    AI Insight
                  </span>
                </td>

                <td>
                  <ExpandableText
                    text={
                      recommendation?.recommendation ||
                      'No recommendations available.'
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <span className="td-badge action">
                    Suggested Action
                  </span>
                </td>

                <td>
                  Optimize usage based on the insight
                  above for maximum energy savings.
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

      {/* CHART */}
      <div className="report-chart-card full-chart">

        <div className="chart-header">

          <h3>
            Device Performance (Watt)
          </h3>

          <div className="chart-filters">

            {['Day', 'Week', 'Month'].map((period) => (
              <button
                key={period}
                className={
                  chartPeriod === period ? 'active' : ''
                }
                onClick={() => setChartPeriod(period)}
              >
                {period}
              </button>
            ))}

          </div>

        </div>

        <ResponsiveContainer width="100%" height={260}>

          <AreaChart data={chartData}>

            <defs>
              <linearGradient
                id="powerFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#facc15"
                  stopOpacity={0.7}
                />

                <stop
                  offset="100%"
                  stopColor="#facc15"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
            />

            <XAxis
              dataKey="name"
              stroke="#94a3b8"
            />

            <YAxis stroke="#94a3b8" />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#facc15"
              fill="url(#powerFill)"
              strokeWidth={3}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>

  </div>
);
}