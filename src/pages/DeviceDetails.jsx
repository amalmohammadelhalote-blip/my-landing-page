import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Tv, Bluetooth, Lightbulb, Zap, Plug, Timer, Coins, Power } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { deviceService } from '../api/services';
import './Dashboard.css';


export default function DeviceDetails() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState(null);
  const [health, setHealth] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('Day');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [updatingPower, setUpdatingPower] = useState(false);
  const [error, setError] = useState('');

  const parseResponsePayload = (response) => {
    if (!response) return null;
    const payload = response?.data?.data ?? response?.data;
    if (!payload || typeof payload !== 'object') return payload;
    if (payload.device && typeof payload.device === 'object') return payload.device;
    if (payload.item && typeof payload.item === 'object') return payload.item;
    if (payload.health && typeof payload.health === 'object') return payload.health;
    return payload;
  };

  const normalizeChartHistory = (payload) => {
    if (!payload || typeof payload !== 'object') return [];

    const history = payload.history || payload.chart || payload.data || [];
    if (Array.isArray(history) && history.length > 0) return history;

    const candidates = Object.values(payload).filter(Array.isArray);
    for (const candidate of candidates) {
      const valid = candidate.every(
        (item) => item && typeof item === 'object' && 'name' in item && 'value' in item
      );
      if (valid) return candidate;
    }

    return [];
  };

  const extractRecommendationText = (payload) => {
    if (payload === null || payload === undefined) return null;
    if (typeof payload === 'string') return payload;
    if (typeof payload === 'object') {
      if (typeof payload.recommendation === 'string') return payload.recommendation;
      if (typeof payload.message === 'string') return payload.message;
      if (typeof payload.text === 'string') return payload.text;
      if (typeof payload.data === 'string') return payload.data;
      if (typeof payload.content === 'string') return payload.content;
      return JSON.stringify(payload, null, 2);
    }
    return String(payload);
  };

  const renderRecommendation = (text) => {
    if (!text) return null;

    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    const tableStart = lines.findIndex((line) => /^\|.*\|/.test(line));
    const tableDividerIndex = lines.findIndex((line, idx) => idx > tableStart && /^\|?\s*[-:]+(?:\s*\|\s*[-:]+)+\s*\|?$/.test(line));

    if (tableStart >= 0 && tableDividerIndex === tableStart + 1) {
      const headerLine = lines[tableStart];
      const dataLines = lines.slice(tableDividerIndex + 1).filter(line => line.trim());
      const headers = headerLine.split('|').map((cell) => cell.trim()).filter(Boolean);
      const rows = dataLines.map((row) => row.split('|').map((cell) => cell.trim()).filter(Boolean));

      if (headers.length > 0 && rows.length > 0) {
        return (
          <div style={{ overflowX: 'auto', marginTop: '16px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', background: 'rgba(15, 23, 42, 0.5)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  {headers.map((header) => (
                    <th
                      key={header}
                      style={{
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        padding: '14px 16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#22c55e',
                        borderBottom: '2px solid rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ background: rowIndex % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.3)' }}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${rowIndex}-${cellIndex}`}
                        style={{
                          border: '1px solid rgba(34, 197, 94, 0.1)',
                          padding: '12px 16px',
                          verticalAlign: 'top',
                          lineHeight: '1.5',
                        }}
                      >
                        <ReactMarkdown>{cell}</ReactMarkdown>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    return <ReactMarkdown>{text}</ReactMarkdown>;
  };

  const handlePowerToggle = async () => {
    if (!deviceId || !selectedDeviceDetail) return;
    const isOn = selectedDeviceDetail?.status === 'ON' || selectedDeviceDetail?.isOn === true;
    const nextStatus = isOn ? 'OFF' : 'ON';

    try {
      setUpdatingPower(true);
      await deviceService.toggleStatus(deviceId, nextStatus);
      setSelectedDeviceDetail((prev) =>
        prev ? { ...prev, status: nextStatus, isOn: nextStatus === 'ON' } : prev
      );
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update power state.');
    } finally {
      setUpdatingPower(false);
    }
  };

  useEffect(() => {
    const fetchSelectedDevice = async () => {
      if (!deviceId) return;
      try {
        setLoading(true);
        const res = await deviceService.getOne(deviceId);
        setSelectedDeviceDetail(parseResponsePayload(res));
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load device details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSelectedDevice();
  }, [deviceId]);

  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      if (!deviceId) return;
      try {
        setHealthLoading(true);
        const res = await deviceService.getHealth(deviceId, chartPeriod.toLowerCase());
        const parsed = parseResponsePayload(res);
        if (!mounted) return;
        setHealth(parsed);
        setChartData(normalizeChartHistory(parsed));
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Failed to load health data.');
        }
      } finally {
        if (mounted) setHealthLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [deviceId, chartPeriod]);

  useEffect(() => {
    const fetchRecommendation = async () => {
      if (!deviceId) return;
      try {
        setRecommendationLoading(true);
        const res = await deviceService.getRecommendation(deviceId);
        const parsed = parseResponsePayload(res);
        setRecommendation(extractRecommendationText(parsed));
      } catch (err) {
        console.warn('Failed to load recommendation:', err);
        // Don't set error for recommendation, it's optional
      } finally {
        setRecommendationLoading(false);
      }
    };
    fetchRecommendation();
  }, [deviceId]);

  const selectedDevice = selectedDeviceDetail;

  const currentVoltage = health?.currentVoltage || health?.voltage || 'N/A';
  const currentPower = health?.currentPower || health?.power || selectedDevice?.thresholds?.maxPower || 'N/A';
  const runningTime = health?.runningTime || health?.timeToday || 'N/A';
  const estimatedCost = health?.estimatedCost || health?.cost || 'N/A';
  const isOn = selectedDevice?.status === 'ON' || selectedDevice?.isOn === true;


  return (
    <div className="report-page">
      <header className="top-header">
        <h1>Devices details</h1>
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search" />
        </div>
      </header>

      {error ? <p className="dashboard-error">{error}</p> : null}
      {loading ? (
        <div className="report-grid" style={{ marginTop: '20px' }}>
          <div className="skeleton skeleton-chart" style={{ height: '400px' }} />
          <div className="skeleton skeleton-chart" style={{ height: '400px' }} />
        </div>
      ) : null}
      {!loading && !selectedDeviceDetail && !error ? (
        <p className="dashboard-empty">Device details not found. Please check the device link or try again.</p>
      ) : null}

      {!loading && selectedDevice && (
        <div className="report-grid">
          <section className="report-left">
            <div className="usage-card">
              <h2>Usage Summary</h2>
              <p>Track your device&apos;s daily performance.</p>

              <div className="usage-meter">
                <div className="meter-container">
                  <div className="meter-semicircle" />
                  <div className="meter-needle" />
                </div>
              </div>

              <div className="usage-stat-grid">
                <div className="usage-stat-box">
                  <Zap size={18} />
                  <span>Current voltage :</span>
                  <strong>{currentVoltage === 'N/A' ? 'N/A' : `${currentVoltage}V`}</strong>
                </div>
                <div className="usage-stat-box">
                  <Plug size={18} />
                  <span>Current power :</span>
                  <strong>{currentPower === 'N/A' ? 'N/A' : `${currentPower}W`}</strong>
                </div>
                <div className="usage-stat-box">
                  <Timer size={18} />
                  <span>Time today :</span>
                  <strong>{runningTime}</strong>
                </div>
                <div className="usage-stat-box">
                  <Coins size={18} />
                  <span>Estimated Cost :</span>
                  <strong>{estimatedCost}</strong>
                </div>
              </div>

              <button
                className="power-btn"
                type="button"
                disabled={updatingPower}
                onClick={handlePowerToggle}
              >
                <Power size={24} />
                {updatingPower ? 'Updating...' : isOn ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          </section>

          <section className="report-right">
            <div className="device-overview">
              <div className="overview-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
  
  {/* Device Icon */}
  <img
    src={selectedDevice?.categoryId?.categoryIcon}
    alt={selectedDevice?.name}
    style={{
      width: '40px',
      height: '40px',
      objectFit: 'contain',
      borderRadius: '10px',
      background: 'rgba(255,255,255,0.05)',
      padding: '6px'
    }}
    onError={(e) => {
      e.target.src = '/default-device.svg'; // fallback
    }}
  />

  <div>
    <h3>{selectedDevice?.name || 'Device'}</h3>
    <span>{isOn ? 'Device is on' : 'Device is off'}</span>
  </div>

</div>
              <Bluetooth className={`overview-bt ${isOn ? 'on' : ''}`} />
            </div>

            

            {recommendationLoading ? (
              <div className="ai-tip">
                <Lightbulb size={20} className="tip-icon" />
                <p>Loading AI recommendation...</p>
              </div>
            ) : recommendation ? (
              <div className="ai-tip" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <Lightbulb size={20} className="tip-icon" />
                <div style={{ width: '100%' }}>
                  <p><b>AI Recommendation :</b></p>
                  {renderRecommendation(recommendation)}
                </div>
              </div>
            ) : null}

            <div className="report-chart-card">
              <div className="chart-header">
                <h3>Device performance</h3>
                <div className="chart-filters">
                  {['Day', 'Week', 'Month'].map((period) => (
                    <button
                      key={period}
                      type="button"
                      className={`time-btn ${chartPeriod === period ? 'active' : ''}`}
                      onClick={() => setChartPeriod(period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {healthLoading ? (
                <p className="dashboard-loading">Loading health data...</p>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.12)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#88ff9e"
                      strokeWidth={3}
                      dot={{ fill: '#88ff9e' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="dashboard-empty">No performance history available.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

