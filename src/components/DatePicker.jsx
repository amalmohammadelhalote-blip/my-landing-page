import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './DatePicker.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DatePicker({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearPage, setYearPage] = useState(0);
  const wrapperRef = useRef(null);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setShowYearPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const formatDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const parsed = value ? new Date(value) : null;
  const selectedDate = parsed && !isNaN(parsed.getTime()) ? parsed : null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const canGoNext = () => {
    if (viewYear < today.getFullYear()) return true;
    if (viewYear === today.getFullYear() && viewMonth < today.getMonth()) return true;
    return false;
  };

  const handleDayClick = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr > todayStr) return;
    onChange(dateStr);
    setOpen(false);
  };

  const isToday = (day) => {
    return viewYear === today.getFullYear() &&
      viewMonth === today.getMonth() &&
      day === today.getDate();
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day;
  };

  const isFutureDay = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr > todayStr;
  };

  const yearsPerPage = 16;
  const totalYears = today.getFullYear() - 1950 + 1;
  const totalPages = Math.ceil(totalYears / yearsPerPage);

  const getYearsForPage = (page) => {
    const start = 1950 + page * yearsPerPage;
    const end = Math.min(start + yearsPerPage, today.getFullYear() + 1);
    const yrs = [];
    for (let y = start; y < end; y++) {
      yrs.push(y);
    }
    return yrs;
  };

  const handleYearClick = (year) => {
    setViewYear(year);
    setShowYearPicker(false);
  };

  const handleTitleClick = () => {
    setShowYearPicker(true);
    const currentPage = Math.floor((viewYear - 1950) / yearsPerPage);
    setYearPage(currentPage);
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="cal-day empty" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const disabled = isFutureDay(d);
    calendarDays.push(
      <div
        key={d}
        className={`cal-day ${isSelected(d) ? 'selected' : ''} ${isToday(d) ? 'today' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && handleDayClick(d)}
      >
        {d}
      </div>
    );
  }

  const currentYears = getYearsForPage(yearPage);

  return (
    <div className={`datepicker-wrapper ${error ? 'datepicker-error' : ''}`} ref={wrapperRef}>
      <div className="datepicker-input" onClick={() => setOpen(o => !o)}>
        <Calendar size={16} className="datepicker-icon" />
        <span className={`datepicker-placeholder ${value ? 'filled' : ''}`}>
          {value ? formatDisplay(value) : 'Select your date of birth'}
        </span>
        <span className={`datepicker-chevron ${open ? 'open' : ''}`} />
      </div>

      {open && (
        <div className="datepicker-popup">
          <div className="cal-header">
            {!showYearPicker ? (
              <>
                <button className="cal-nav-btn" onClick={prevMonth} type="button">
                  <ChevronLeft size={18} />
                </button>
                <div className="cal-title clickable" onClick={handleTitleClick}>
                  <span className="cal-month">{MONTHS[viewMonth]}</span>
                  <span className="cal-year-label">{viewYear}</span>
                </div>
                <button className="cal-nav-btn" onClick={nextMonth} type="button" disabled={!canGoNext()}>
                  <ChevronRight size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="cal-nav-btn"
                  onClick={() => setYearPage(p => Math.max(0, p - 1))}
                  type="button"
                  disabled={yearPage === 0}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="cal-title">
                  <span className="cal-year-label">
                    {currentYears[0]} – {currentYears[currentYears.length - 1]}
                  </span>
                </div>
                <button
                  className="cal-nav-btn"
                  onClick={() => setYearPage(p => Math.min(totalPages - 1, p + 1))}
                  type="button"
                  disabled={yearPage >= totalPages - 1}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {!showYearPicker ? (
            <>
              <div className="cal-weekdays">
                {DAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
              </div>
              <div className="cal-grid">
                {calendarDays}
              </div>
            </>
          ) : (
            <>
              <div className="cal-weekdays" style={{ visibility: 'hidden', height: 0, margin: 0, padding: 0, overflow: 'hidden' }}>
                {DAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
              </div>
              <div className="year-grid">
                {currentYears.map(year => {
                  const isSelectedYear = selectedDate && selectedDate.getFullYear() === year;
                  const isCurrentYear = year === today.getFullYear();
                  const isDisabled = year > today.getFullYear();
                  return (
                    <div
                      key={year}
                      className={`year-card ${isSelectedYear ? 'selected' : ''} ${isCurrentYear ? 'current' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && handleYearClick(year)}
                    >
                      {year}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
