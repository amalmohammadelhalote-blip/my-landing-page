import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tv, Bluetooth } from 'lucide-react';
import { categoryService, deviceService, locationService } from '../api/services';
import "./Devices.css";
import "./AddDevice.css";
import noDeviceImg from "../assets/no-device.png";

const Devices = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Location');
  const [activeSubFilter, setActiveSubFilter] = useState('All devices');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const normalize = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const getConsumptionText = (device) => {
    const val = device?.lastReading?.todayConsumption;

    if (typeof val === 'number') {
      return `${val.toFixed(3)} kWh`;
    }

    return '0 kWh';
  };

  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.docs)) return value.docs;
    if (Array.isArray(value?.results)) return value.results;
    return [];
  };

  const isDeviceLike = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    const hasName = typeof obj.name === 'string' && obj.name.trim().length > 0;
    const hasSignalField =
      'location' in obj ||
      'thresholds' in obj ||
      'status' in obj ||
      'isOn' in obj ||
      'categoryIcon' in obj ||
      'consumption' in obj ||
      'energyConsumption' in obj ||
      'currentConsumption' in obj;
    return hasName && hasSignalField;
  };

  const extractDevicesDeep = (payload) => {
    const out = [];
    const seen = new Set();

    const pushDevice = (device, categoryHint) => {
      if (!isDeviceLike(device)) return;
      const id =
        device?._id ||
        device?.id ||
        `${device?.name || 'device'}-${device?.location || 'unknown'}`;
      if (seen.has(id)) return;
      seen.add(id);
      out.push({
        ...device,
        _id: device?._id || device?.id || id,
        category: device?.category || categoryHint || device?.categoryId?.name
          ? device?.category || categoryHint || { name: device?.categoryId?.name }
          : device?.category,
      });
    };

    const walk = (value, categoryHint = null) => {
      if (!value) return;

      if (Array.isArray(value)) {
        value.forEach((item) => walk(item, categoryHint));
        return;
      }

      if (typeof value !== 'object') return;

      if (isDeviceLike(value)) {
        pushDevice(value, categoryHint);
      }

      const nextCategoryHint =
        value?.name && (value?.devices || value?.device || value?.category)
          ? { _id: value?._id || value?.id, name: value?.name }
          : categoryHint;

      Object.entries(value).forEach(([key, child]) => {
        if (key === '__v' || key === 'createdAt' || key === 'updatedAt') return;
        walk(child, nextCategoryHint);
      });
    };

    walk(payload, null);
    return out;
  };

  const extractDevicesFromCategories = (categoriesList) => {
    return categoriesList.flatMap((category) => {
      const candidates = [
        toArray(category?.devices),
        toArray(category?.device),
        toArray(category?.data?.devices),
      ];
      const nested = candidates.find((arr) => arr.length > 0) || [];

      return (nested || []).map((device) => ({
        ...device,
        categoryId: device?.categoryId || category?._id,
        category: device?.category || { _id: category?._id, name: category?.name },
      }));
    });
  };

  const fetchDevicesFromCategoryDetails = async (categoriesList) => {
    const categoryIds = categoriesList
      .map((c) => c?._id || c?.id)
      .filter(Boolean);

    if (!categoryIds.length) return [];

    const details = await Promise.allSettled(
      categoryIds.map((id) => categoryService.getOne(id))
    );

    const deviceMap = new Map();

    details.forEach((result, idx) => {
      if (result.status !== 'fulfilled') return;

      const category = categoriesList[idx] || {};
      const payload = result.value?.data?.data || result.value?.data || {};

      const candidates = [
        toArray(payload?.devices),
        toArray(payload?.device),
        toArray(payload?.category?.devices),
        toArray(payload?.data?.devices),
      ];
      const nested = candidates.find((arr) => arr.length > 0) || [];

      nested.forEach((device) => {
        const deviceId = device?._id || device?.id || `${category?._id}-${device?.name}`;
        if (!deviceId) return;
        deviceMap.set(deviceId, {
          ...device,
          _id: device?._id || device?.id || deviceId,
          categoryId: device?.categoryId || category?._id,
          category: device?.category || { _id: category?._id, name: category?.name },
        });
      });
    });


    return Array.from(deviceMap.values());
  };

  const locationMap = locations.reduce((map, location) => {
    map[location._id || location.id] = location.name;
    return map;
  }, {});

  const categoryMap = categories.reduce((map, category) => {
    map[category._id || category.id] = category;
    return map;
  }, {});

  const getDeviceCategory = (device) => {
    // Handling both object and ID cases from API
    const catObj = typeof device?.categoryId === 'object' ? device.categoryId : (categoryMap[device?.categoryId] || {});

    return {
      name: catObj?.name || 'Device',
      icon: catObj?.categoryIcon || device?.categoryIcon || ''
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [devicesRes, categoriesRes, locationsRes] = await Promise.all([
          deviceService.getAll(),
          categoryService.getAll(),
          locationService.getAll(),
        ]);

        // ✅ أهم سطر
        const devicesData = devicesRes?.data?.data || [];

        setDevices(devicesData);
        setCategories(categoriesRes?.data?.data || []);
        setLocations(locationsRes?.data?.data || []);

      } catch (err) {
        setError('Failed to load devices');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const extractDeviceId = (device) => device?._id || device?.id || device?.deviceId || '';

  const toggleDevice = async (id, currentStatus) => {
    const deviceId = id;
    const newStatus = currentStatus === 'ON' ? 'OFF' : 'ON';
    try {
      await deviceService.toggleStatus(deviceId, newStatus);
      setDevices((prev) =>
        prev.map((d) => {
          const currentId = extractDeviceId(d);
          return currentId === deviceId
            ? { ...d, status: newStatus, isOn: newStatus === 'ON' }
            : d;
        })
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update device status.');
    }
  };

  const locationFilters = ['All devices',
    ...locations.map((l) => l.name).filter(Boolean)
  ];

  const categoryFilters = [
    'All devices',
    ...categories.map((c) => c.name).filter(Boolean),
  ];

  const visibleFilters = filter === 'Location' ? locationFilters : categoryFilters;

  const filteredDevices = devices.filter((device) => {
    const normalizedName = normalize(device?.name);
    const locName = locationMap[device.location] || locationMap[device.location?._id] || device.location?.name || device.location || '';
    const normalizedLocation = normalize(locName);
    const normalizedSearch = normalize(search);

    const searchMatch =
      !normalizedSearch ||
      normalizedName.includes(normalizedSearch) ||
      normalizedLocation.includes(normalizedSearch);

    if (!searchMatch) return false;
    if (activeSubFilter === 'All devices') return true;

    if (filter === 'Location') {
      const wanted = normalize(activeSubFilter);
      return normalizedLocation === wanted || normalizedLocation.includes(wanted) || wanted.includes(normalizedLocation);
    }

    const categoryName = getDeviceCategory(device).name;
    const normalizedCategory = normalize(categoryName);
    const wantedCategory = normalize(activeSubFilter);
    return (
      normalizedCategory === wantedCategory ||
      normalizedCategory.includes(wantedCategory) ||
      wantedCategory.includes(normalizedCategory)
    );
  });


  const renderedDevices = filteredDevices.length ? filteredDevices : devices;

  return (
    <div className="page-container">
      <header className="top-header">
        <h1>Devices</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {error ? <p className="dashboard-error">{formatErrorMessage(error)}</p> : null}
      {loading ? (
        <div className="dashboard-loading-screens" style={{ marginTop: '20px' }}>
          <div className="devices-full-grid">
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </div>
        </div>
      ) : null}

      {!loading && (
        <>
          <div className="filter-section">
            <div className="main-toggle-filters">
              <button
                className={filter === 'Location' ? 'btn-yellow' : 'btn-outline'}
                onClick={() => {
                  setFilter('Location');
                  setActiveSubFilter('All devices');
                }}
              >
                Location
              </button>
              <button
                className={filter === 'Category' ? 'btn-dark' : 'btn-outline'}
                onClick={() => {
                  setFilter('Category');
                  setActiveSubFilter('All devices');
                }}
              >
                Category
              </button>
            </div>

            <div className="sub-filters-row">
              {visibleFilters.map((f) => (
                <span
                  key={f}
                  className={`filter-chip ${activeSubFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveSubFilter(f)}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="devices-full-grid">
            {renderedDevices.map((device) => {
              const status = device?.status || (device?.isOn ? 'ON' : 'OFF');
              return (
                <div
                  className="device-item-card"
                  key={device._id || device.id}
                  onClick={() => navigate(`/dashboard/devices/${device._id || device.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/dashboard/devices/${device._id || device.id}`);
                  }}
                >
                  <div className="card-top-icons">
                    <Bluetooth
                      size={36}
                      color={status === 'ON' ? '#22c55e' : '#94a3b8'}
                      className={`bt-icon ${status === 'ON' ? 'on' : 'off'}`}
                    />
                  </div>
                  <div className="device-details">
                    <h4>{device.name || 'Smart TV'}</h4>
                    <span className="kwh-text">{getConsumptionText(device)}</span>
                    <p className="loc-text">
                      {locationMap[device.location] || locationMap[device.location?._id] || device.location?.name || device.location || 'Unknown'}
                    </p>
                  </div>
                  <div className="device-divider" />
                  <div className="card-footer-switch">
                    <div
                      className={`ui-switch ${status === 'ON' ? 'is-on' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDevice(device._id, status);
                      }}
                    >
                      <div className="switch-thumb" />
                    </div>
                    <span className={`status-txt ${status === 'ON' ? 'on' : 'off'}`}>
                      {status === 'ON' ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!loading && !devices.length && (
        <div className="empty-state">
           <img src={noDeviceImg} alt="No devices" className="illustration" />
           <h2>No device connect</h2>
           <button className="confirm-btn btn-primary" onClick={() => navigate('/dashboard/devices/add')}>
              Add New device
           </button>
        </div>
      )}
    </div>
  );
};

export default Devices;