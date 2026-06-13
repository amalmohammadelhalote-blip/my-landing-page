import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ChevronDown, Bluetooth, Wifi, CheckCircle } from 'lucide-react';
import { deviceService, categoryService, locationService } from '../api/services';
import './AddDevice.css';

function CustomSelect({ value, options, onChange, placeholder }) {
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

const AddDevice = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // form, confirmation, connecting, success
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        maxPower: '',
        maxVolt: '',
        minVolt: '',
        maxCurrent: '',
        minCurrent: '',
        location: '',
        categoryId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, locs] = await Promise.all([
                    categoryService.getAll(),
                    locationService.getAll()
                ]);
                setCategories(cats?.data?.data || []);
                setLocations(locs?.data?.data || []);
            } catch (err) {
                console.error('Failed to load metadata', err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, val) => {
        setFormData({ ...formData, [name]: val });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setStep('confirmation');
    };

    const handleReset = () => {
        setFormData({
            name: '',
            description: '',
            maxPower: '',
            maxVolt: '',
            minVolt: '',
            maxCurrent: '',
            minCurrent: '',
            location: '',
            categoryId: ''
        });
        setStep('form');
        setError('');
    };

    const handleConnect = async () => {
        setStep('connecting');
        try {
            // Simulate connection delay as shown in image workflow
            await new Promise(resolve => setTimeout(resolve, 3000));

            const payload = {
                name: formData.name,
                description: formData.description,
                maxPower: Number(formData.maxPower),
                thresholds: {
                    maxVoltage: Number(formData.maxVolt),
                    minVoltage: Number(formData.minVolt),
                    maxCurrent: Number(formData.maxCurrent),
                    minCurrent: Number(formData.minCurrent)
                },
                location: formData.location,
                categoryId: formData.categoryId,
                status: 'ON'
            };

            await deviceService.create(payload);
            setStep('success');
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to connect device. Please try again.');
            setStep('confirmation');
        }
    };

    if (step === 'success') {
        return (
            <div className="add-device-page">
                <div className="confirmation-screen">
                    <div className="phone-icon-container" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                        <CheckCircle size={80} color="#22c55e" />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '8px' }}>Device Added successfully!</h2>
                        <p style={{ color: '#94a3b8', fontSize: '16px' }}>Your device is now ready to use</p>
                    </div>
                    <div className="confirmation-actions">
                        <button className="confirm-btn" onClick={() => navigate('/dashboard/home')}>Go to Home</button>
                        <button className="btn-secondary" onClick={handleReset}>Add another device</button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'connecting') {
        return (
            <div className="add-device-page">
                <div className="connecting-screen">
                    <div className="hexagon-spinner">
                        <div className="hexagon">
                            <div className="loader-inner" />
                        </div>
                    </div>
                    <h2>Please wait while we connect your device</h2>
                </div>
            </div>
        );
    }

    if (step === 'confirmation') {
        return (
            <div className="add-device-page">
                <header className="add-device-header">
                    <h1>Add new device</h1>
                </header>
                <div className="confirmation-screen">
                    <div className="phone-icon-container">
                        <Bluetooth size={80} color="#3b82f6" />
                    </div>
                    <h2>Make sure bluetooth and wi-fi are enabled</h2>
                    {error && <p className="error-message" style={{ color: '#ef4444' }}>{error}</p>}
                    <div className="confirmation-actions">
                        <button className="confirm-btn" onClick={handleConnect}>Connect</button>
                        <button className="btn-secondary" onClick={() => setStep('form')}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="add-device-page">
            <header className="add-device-header">
                <h1>Add new device</h1>
            </header>

            <form className="form-container" onSubmit={handleFormSubmit}>
                <div className="form-group">
                    <label>Device name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="e.g. Smart TV"
                        required
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Device description</label>
                    <textarea
                        name="description"
                        placeholder="enter device description..."
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Max power </label>
                    <input
                        type="number"
                        name="maxPower"
                        placeholder="e.g. 2000"
                        value={formData.maxPower}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Max volt</label>
                        <input
                            type="number"
                            name="maxVolt"
                            value={formData.maxVolt}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Min volt</label>
                        <input
                            type="number"
                            name="minVolt"
                            value={formData.minVolt}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Max current</label>
                        <input
                            type="number"
                            name="maxCurrent"
                            value={formData.maxCurrent}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Min current</label>
                        <input
                            type="number"
                            name="minCurrent"
                            value={formData.minCurrent}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <CustomSelect
                        value={formData.location}
                        options={locations}
                        onChange={val => handleSelectChange('location', val)}
                        placeholder="Select room"
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <CustomSelect
                        value={formData.categoryId}
                        options={categories}
                        onChange={val => handleSelectChange('categoryId', val)}
                        placeholder="Select Category"
                    />
                </div>

                <button type="submit" className="confirm-btn">
                    Confirm changes
                </button>
            </form>
        </div>
    );
};

export default AddDevice;
