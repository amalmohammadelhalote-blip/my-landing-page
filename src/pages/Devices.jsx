import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tv, Bluetooth } from 'lucide-react';
import { categoryService, deviceService, locationService } from '../api/services';
import "./Devices.css";

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
    const raw = device?.consumption || device?.energyConsumption || device?.currentConsumption;
    if (typeof raw === 'string' && raw.trim()) return raw;

    const maxPower = device?.thresholds?.maxPower;
    if (typeof maxPower === 'number') {
      // لو maxPower كبير غالبا بيكون W -> نحوله ل kWh كقيمة عرضية
      const kwh = maxPower >= 10 ? maxPower / 1000 : maxPower;
      return `${kwh.toFixed(1)} Kwh`;
    }

    return '0 Kwh';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [devicesResult, categoriesResult, locationsResult] = await Promise.allSettled([
          deviceService.getAll(),
          categoryService.getAll(),
          locationService.getAll(),
        ]);

        console.log('Devices fetch result:', devicesResult);
        console.log('Categories fetch result:', categoriesResult);
        console.log('Locations fetch result:', locationsResult);

        const categoriesRes =
          categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;
        const devicesRes =
          devicesResult.status === 'fulfilled' ? devicesResult.value : null;
        const locationsRes =
          locationsResult.status === 'fulfilled' ? locationsResult.value : null;

        const categoriesList = toArray(categoriesRes?.data?.data || categoriesRes?.data);
        const locationsList = toArray(locationsRes?.data?.data || locationsRes?.data);
        const apiDevices = toArray(
          devicesRes?.data?.data?.devices ||
          devicesRes?.data?.devices ||
          devicesRes?.data?.data ||
          devicesRes?.data
        );

        const devicesFromCategories = extractDevicesFromCategories(categoriesList);
        const devicesFromCategoryDetails =
          !apiDevices.length && !devicesFromCategories.length
            ? await fetchDevicesFromCategoryDetails(categoriesList)
            : [];

        const deepDevices = extractDevicesDeep({
          devicesPayload: devicesRes?.data,
          categoriesPayload: categoriesRes?.data,
          categoryDetailsPayload: devicesFromCategoryDetails,
        });

        const finalDevices = apiDevices.length
          ? apiDevices
          : devicesFromCategories.length
            ? devicesFromCategories
            : devicesFromCategoryDetails.length
              ? devicesFromCategoryDetails
              : deepDevices;

        setDevices(finalDevices);
        setCategories(categoriesList);
        setLocations(locationsList);
        setActiveSubFilter('All devices');

        if (!finalDevices.length) {
          setError('No devices returned from backend. Check token/role or API schema.');
        } else if (devicesResult.status === 'rejected' && categoriesResult.status === 'fulfilled') {
          setError('Devices endpoint unavailable, showing devices from categories.');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load devices.');
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

  const locationFilters = ['All devices', 'Living room', 'Bed room', 'Kitchen'];

  const categoryFilters = [
    'All devices',
    ...categories.map((c) => c.name).filter(Boolean),
  ];

  const visibleFilters = filter === 'Location' ? locationFilters : categoryFilters;

  const filteredDevices = devices.filter((device) => {
    const normalizedName = normalize(device?.name);
    const normalizedLocation = normalize(locationMap[device.location] || device.location || '');
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

    const categoryName = device?.categoryId?.name || device?.category?.name || '';
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
          <button className="btn-primary" onClick={() => navigate('/dashboard/devices/add')}>
            Add Device
          </button>
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
                    <img
                      src={device?.categoryId?.categoryIcon}
                      alt="device icon"
                      className="device-icon"
                      onError={(e) => {
                        e.target.style.display = 'none'; // hide if image fails
                      }}
                    />
                    <Bluetooth
                      size={16}
                      className={`bt-icon ${((device?.status || (device?.isOn ? 'ON' : 'OFF')) === 'ON') ? 'on' : 'off'}`}
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
        <p className="dashboard-empty">No devices found.</p>
      )}
    </div>
  );
};

export default Devices;