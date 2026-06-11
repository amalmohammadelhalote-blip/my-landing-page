import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Bluetooth, Lightbulb, Zap, Plug, Timer, Coins, Power, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { deviceService, categoryService, locationService, reportService } from '../api/services';
import './DeviceDetails.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function PeriodPicker({ open, onClose, onConfirm, initialYear, initialMonth }) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  if (!open) return null;
  return createPortal(
    <div className="period-picker-modal" onClick={onClose}>
      <div className="period-picker" onClick={e => e.stopPropagation()}>
        <h3>Select Period</h3>
        <div className="picker-top">
          <button className="month-btn" style={{ width: 40, height: 40, fontSize: 20, padding: 0 }} onClick={() => setYear(y => y - 1)}>&#8249;</button>
          <input className="period-year-input" type="number" value={year} min={2000} max={2100} onChange={e => setYear(Number(e.target.value))} />
          <button className="month-btn" style={{ width: 40, height: 40, fontSize: 20, padding: 0 }} onClick={() => setYear(y => y + 1)}>&#8250;</button>
        </div>
        <div className="period-month-grid">
          {MONTHS.map((m, i) => (
            <button key={m} className={`month-btn ${month === i + 1 ? 'active' : ''}`} onClick={() => setMonth(i + 1)}>{m}</button>
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

function CustomSelect({ label, value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => (o._id || o.id || o.value) === value);

  return (
    <div className="custom-select-wrapper">
      <div className="custom-select-header" onClick={() => setOpen(!open)} tabIndex={0} role="button" onKeyDown={e => { if (e.key === 'Enter') setOpen(!open); }}>
        <span className={selected ? 'selected-text' : 'placeholder-text'}>{selected ? (selected.name || selected.label) : placeholder}</span>
        <span className={`cs-arrow ${open ? 'open' : ''}`}></span>
      </div>
      {open && (
        <>
          <div className="cs-overlay" onClick={() => setOpen(false)} />
          <div className="cs-dropdown">
            {options.map(opt => {
              const optVal = opt._id || opt.id || opt.value;
              const isActive = optVal === value;
              return (
                <div
                  key={optVal}
                  className={`cs-option ${isActive ? 'active' : ''}`}
                  onClick={() => { onChange(optVal); setOpen(false); }}
                >
                  <span>{opt.name || opt.label}</span>
                  {isActive && <span className="cs-check">✓</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function DeviceDetails() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState(null);
  const [health, setHealth] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('Week');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
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

  const normalizeChartData = (payload, period) => {
    if (!payload) return [];
    if (period === 'Day' && Array.isArray(payload?.days)) {
      return payload.days.map(item => ({
        name: String(item.day),
        value: item.consumption ?? 0,
        cost: item.cost ?? 0,
      }));
    }
    if (period === 'Week' && Array.isArray(payload?.weeks)) {
      return payload.weeks.map(item => ({
        name: `W${item.week}`,
        value: item.consumption ?? 0,
        cost: item.cost ?? 0,
      }));
    }
    if (period === 'Month' && Array.isArray(payload?.months)) {
      // Build a map from month key -> data
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
      // Always return all 12 months
      return MONTHS.map((m, i) => ({
        name: m,
        value: dataMap[i]?.value ?? 0,
        cost: dataMap[i]?.cost ?? 0,
      }));
    }
    if (period === 'Year' && Array.isArray(payload?.years)) {
      return payload.years.map(item => ({
        name: String(item.year),
        value: item.consumption ?? 0,
        cost: item.cost ?? 0,
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
    const fetchChartAndHealth = async () => {
      if (!deviceId || isEditing) return;
      try {
        setHealthLoading(true);

        // Fetch chart data from new report endpoints
        let res;
        if (chartPeriod === 'Day') {
          res = await reportService.getDeviceDaily(deviceId, selectedYear, selectedMonth);
        } else if (chartPeriod === 'Week') {
          res = await reportService.getDeviceWeekly(deviceId, selectedYear, selectedMonth);
        } else if (chartPeriod === 'Month') {
          res = await reportService.getDeviceMonthly(deviceId, selectedYear, selectedMonth);
        } else {
          res = await reportService.getDeviceYearly(deviceId, selectedYear);
        }

        const payload = res?.data?.data || res?.data;
        if (mounted) setChartData(normalizeChartData(payload, chartPeriod));

        // Fetch health (optional, don't fail if broken)
        if (!window.__healthEndpointBroken) {
          const healthRes = await deviceService.getHealth(deviceId).catch(e => {
            window.__healthEndpointBroken = true;
            return null;
          });
          const healthData = healthRes ? (healthRes?.data?.data || healthRes?.data) : null;
          if (mounted && healthData) {
            setHealth(healthData);
            const rec = healthData?.recommendation || healthData?.tips;
            if (rec) setRecommendation({ recommendation: rec });
          }
        }
      } catch (err) {
        console.warn('Failed to load chart/health data:', err);
      } finally {
        if (mounted) setHealthLoading(false);
      }
    };

    fetchChartAndHealth();
    return () => { mounted = false; };
  }, [deviceId, chartPeriod, selectedYear, selectedMonth, isEditing]);

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
              <CustomSelect
                value={formData.location}
                options={locations}
                onChange={val => setFormData({ ...formData, location: val })}
                placeholder="Select Location"
              />
            </div>

            <div className="form-group full">
              <label>Select Category</label>
              <CustomSelect
                value={formData.categoryId}
                options={categories}
                onChange={val => setFormData({ ...formData, categoryId: val })}
                placeholder="Select Category"
              />
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
            className={`switch-btn ${isOn ? 'switch-on' : 'switch-off'
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
        <div className="report-chart-card full-chart" style={{ background: 'linear-gradient(145deg, #072a1c, #02120b)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '20px', padding: '24px' }}>
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Energy Consumption (kWh)</h3>
              <button
                onClick={() => setPickerOpen(true)}
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', width: 'fit-content' }}
              >
                {MONTHS[selectedMonth - 1]} {selectedYear} ▾
              </button>
            </div>
            <div className="time-toggles">
              {['Day', 'Week', 'Month', 'Year'].map(p => (
                <button
                  key={p}
                  className={`time-btn ${chartPeriod === p ? 'active' : ''}`}
                  onClick={() => setChartPeriod(p)}
                >{p}</button>
              ))}
            </div>
          </div>

          {healthLoading ? (
            <div style={{ height: '260px', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : chartData.length > 0 ? (
            <div style={{ overflowX: chartPeriod === 'Day' ? 'auto' : 'visible', overflowY: 'visible' }}>
              <ResponsiveContainer
                width={chartPeriod === 'Day' ? Math.max(chartData.length * 32, 400) : '100%'}
                height={260}
                minWidth={0}
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 16, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ffffff', fontSize: 11 }}
                    dy={10}
                    interval={0}
                    angle={chartPeriod === 'Month' ? -35 : 0}
                    textAnchor={chartPeriod === 'Month' ? 'end' : 'middle'}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ffffff', fontSize: 12 }}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(2)}
                    width={55}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(34,197,94,0.06)' }}
                    contentStyle={{ background: '#02120b', border: '1px solid #22c55e', borderRadius: '8px', color: '#ffffff' }}
                    itemStyle={{ color: '#22c55e' }}
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
            </div>
          ) : (
            <div style={{ height: '260px', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>No data for this period</div>
          )}
        </div>

      </div>

      <PeriodPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(y, m) => { setSelectedYear(y); setSelectedMonth(m); }}
        initialYear={selectedYear}
        initialMonth={selectedMonth}
      />

    </div>
  );
}