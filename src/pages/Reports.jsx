import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Lightbulb, Zap, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { readingService, homeService, deviceService, reportService } from '../api/services';
import './Reports.css';

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
          <input
            className="period-year-input"
            type="number"
            value={year}
            min={2000}
            max={2100}
            onChange={e => setYear(Number(e.target.value))}
          />
          <button className="month-btn" style={{ width: 40, height: 40, fontSize: 20, padding: 0 }} onClick={() => setYear(y => y + 1)}>&#8250;</button>
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

  const [barPickerOpen, setBarPickerOpen] = useState(false);
  const [barYear, setBarYear] = useState(new Date().getFullYear());
  const [barMonth, setBarMonth] = useState(new Date().getMonth() + 1);

  const [linePickerOpen, setLinePickerOpen] = useState(false);
  const [lineYear, setLineYear] = useState(new Date().getFullYear());
  const [lineMonth, setLineMonth] = useState(new Date().getMonth() + 1);

  const [topDevices, setTopDevices] = useState([]);
  const [breakdownPickerOpen, setBreakdownPickerOpen] = useState(false);
  const [breakdownYear, setBreakdownYear] = useState(new Date().getFullYear());
  const [breakdownMonth, setBreakdownMonth] = useState(new Date().getMonth() + 1);

  const PIE_COLORS = ['#22c55e', '#eab308', '#3b82f6', '#f43f5e', '#8b5cf6', '#a855f7', '#06b6d4'];

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

  const normalizeChartData = (payload, period) => {
    if (!payload) return [];
    if (period === 'Week' && Array.isArray(payload?.weeks)) {
      return payload.weeks.map(item => ({ name: `W${item.week}`, value: item.consumption ?? 0, cost: item.cost ?? 0 }));
    }
    if (period === 'Month' && Array.isArray(payload?.months)) {
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
      return MONTHS.map((m, i) => ({
        name: m,
        value: dataMap[i]?.value ?? 0,
        cost: dataMap[i]?.cost ?? 0,
      }));
    }
    if (period === 'Year' && Array.isArray(payload?.years)) {
      return payload.years.map(item => ({ name: String(item.year), value: item.consumption ?? 0, cost: item.cost ?? 0 }));
    }
    return [];
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await homeService.getDashboard();
      setDashboardData(res?.data?.data || res?.data);
    } catch (err) { console.warn('Dashboard stats fetch failed', err); }
  };

  const fetchDevices = async () => {
    try {
      const res = await deviceService.getAll();
      const data = res?.data?.data || res?.data || [];
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) { console.warn('Devices fetch failed', err); setDevices([]); }
  };

  const fetchTopDevices = async (year, month) => {
    try {
      const res = await reportService.getTopDevices(year, month);
      const payload = res?.data?.data || res?.data;
      const list = payload?.devices || payload?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setTopDevices(list.map((d, i) => ({
          name: d.name || d.deviceName || `Device ${i + 1}`,
          value: parseFloat(d.percentage ?? d.value ?? 0),
          color: PIE_COLORS[i % PIE_COLORS.length],
        })));
      } else {
        setTopDevices([]);
      }
    } catch (err) { console.warn('Top devices fetch failed', err); setTopDevices([]); }
  };

  const fetchBarData = async (period, year, month) => {
    try {
      setLoading(true);
      let res;
      if (period === 'Week') res = await reportService.getWeekly(year, month);
      else if (period === 'Month') res = await reportService.getMonthly(year, month);
      else res = await reportService.getYearly(year);
      const rData = res?.data?.data || res?.data;
      setBarData(normalizeChartData(rData, period));
    } catch (err) { console.error('Bar data fetch failed', err); setBarData([]); }
    finally { setLoading(false); }
  };

  const fetchLineData = async (period, year, month) => {
    try {
      let res;
      if (period === 'Week') res = await reportService.getWeekly(year, month);
      else if (period === 'Month') res = await reportService.getMonthly(year, month);
      else res = await reportService.getYearly(year);
      const rData = res?.data?.data || res?.data;
      setLineData(normalizeChartData(rData, period));
    } catch (err) { console.error('Line data fetch failed', err); setLineData([]); }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchDevices();
    fetchTopDevices(breakdownYear, breakdownMonth);
  }, []);

  useEffect(() => {
    fetchBarData(periodBar, barYear, barMonth);
  }, [periodBar, barYear, barMonth]);

  useEffect(() => {
    fetchTopDevices(breakdownYear, breakdownMonth);
  }, [breakdownYear, breakdownMonth]);

  useEffect(() => {
    fetchLineData(periodLine, lineYear, lineMonth);
  }, [periodLine, lineYear, lineMonth]);

  return (
    <div className="report-page">
      <header className="top-header" style={{ marginBottom: '24px' }}>
        <h1>Reports</h1>
      </header>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="report-grid">
        <div className="report-left">
          <div className="report-panel">
            <div className="chart-header-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3>Energy consumption (Kwh)</h3>
                <button
                  onClick={() => setBarPickerOpen(true)}
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', width: 'fit-content' }}
                >
                  {MONTHS[barMonth - 1]} {barYear} ▾
                </button>
              </div>
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
                  <BarChart data={barData} barSize={14} margin={{ top: 10, right: 16, left: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#ffffff', fontSize: 11 }}
                      dy={10}
                      interval={0}
                      angle={periodBar === 'Month' ? -35 : 0}
                      textAnchor={periodBar === 'Month' ? 'end' : 'middle'}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#ffffff', fontSize: 12 }}
                      tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(2)}
                      width={55}
                    />
                    <Tooltip
                      cursor={false}
                      contentStyle={{ background: '#08231b', border: '1px solid #22c55e', borderRadius: '12px', color: '#ffffff' }}
                      itemStyle={{ color: '#22c55e' }}
                      formatter={(val) => `${Number(val).toFixed(2)} kWh`}
                    />
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
          <div className="report-panel report-breakdown-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Device Usage Breakdown</h3>
              <button
                onClick={() => setBreakdownPickerOpen(true)}
                style={{
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.35)',
                  color: '#22c55e',
                  borderRadius: '20px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {MONTHS[breakdownMonth - 1]} {breakdownYear} ▾
              </button>
            </div>

            {topDevices.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Legend */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {topDevices.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        backgroundColor: entry.color, flexShrink: 0
                      }} />
                      <span style={{ color: '#e2f5e8', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.name}
                      </span>
                      <strong style={{ color: '#fff', fontSize: '13px', flexShrink: 0 }}>
                        {entry.value}%
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Pie Chart */}
                <div style={{ width: '150px', height: '150px', flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topDevices}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={70}
                        dataKey="value"
                        stroke="#08231b"
                        strokeWidth={1}
                        label={({ value }) => value >= 2 ? `${value}%` : ''}
                        labelLine={false}
                      >
                        {topDevices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#08231b', border: '1px solid #22c55e', borderRadius: '10px', color: '#ffffff' }}
                        itemStyle={{ color: '#22c55e' }}
                        formatter={(val, name) => [`${val}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                No device breakdown available.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="report-panel report-panel-full">
        <div className="chart-header-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3>Energy cost over time</h3>
            <button
              onClick={() => setLinePickerOpen(true)}
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', width: 'fit-content' }}
            >
              {MONTHS[lineMonth - 1]} {lineYear} ▾
            </button>
          </div>
          <div className="time-toggles">
            <button className={`time-btn ${periodLine === 'Week' ? 'active' : ''}`} onClick={() => setPeriodLine('Week')}>Week</button>
            <button className={`time-btn ${periodLine === 'Month' ? 'active' : ''}`} onClick={() => setPeriodLine('Month')}>Month</button>
            <button className={`time-btn ${periodLine === 'Year' ? 'active' : ''}`} onClick={() => setPeriodLine('Year')}>Year</button>
          </div>
        </div>

        <div className="report-chart-card" style={{ marginTop: '18px' }}>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              <LineChart data={lineData} margin={{ top: 10, right: 24, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#ffffff', fontSize: 11 }}
                  dy={10}
                  interval={0}
                  angle={periodLine === 'Month' ? -35 : 0}
                  textAnchor={periodLine === 'Month' ? 'end' : 'middle'}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#ffffff', fontSize: 12 }}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(2)}
                  width={55}
                />
                <Tooltip
                  contentStyle={{ background: '#08231b', border: '1px solid #22c55e', borderRadius: '12px', color: '#ffffff' }}
                  itemStyle={{ color: '#22c55e' }}
                  formatter={(val) => `${Number(val).toFixed(2)} EGP`}
                />
                <Line type="monotone" dataKey="cost" stroke="#22c55e" strokeWidth={3} dot={<CustomLineDot />} activeDot={{ r: 6, fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-empty" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>No data for this period</div>
          )}
        </div>
      </div>

      <PeriodPicker
        open={barPickerOpen}
        onClose={() => setBarPickerOpen(false)}
        onConfirm={(y, m) => { setBarYear(y); setBarMonth(m); }}
        initialYear={barYear}
        initialMonth={barMonth}
      />
      <PeriodPicker
        open={linePickerOpen}
        onClose={() => setLinePickerOpen(false)}
        onConfirm={(y, m) => { setLineYear(y); setLineMonth(m); }}
        initialYear={lineYear}
        initialMonth={lineMonth}
      />
      <PeriodPicker
        open={breakdownPickerOpen}
        onClose={() => setBreakdownPickerOpen(false)}
        onConfirm={(y, m) => { setBreakdownYear(y); setBreakdownMonth(m); }}
        initialYear={breakdownYear}
        initialMonth={breakdownMonth}
      />
    </div>
  );
}