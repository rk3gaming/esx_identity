import React, { useState, useEffect } from 'react';
import { UserIcon, CalendarIcon, ScaleIcon, UserGroupIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';

function App() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({
    maxNameLength: 20,
    minHeight: 120,
    maxHeight: 220,
    lowestYear: 1900,
    highestYear: 2005,
    dateFormat: "DD/MM/YYYY"
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    height: '',
    gender: ''
  });

  const [currentDate, setCurrentDate] = useState(new Date(config.highestYear, 0, 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [yearRange, setYearRange] = useState({ 
    start: config.lowestYear, 
    end: config.highestYear 
  });

  useEffect(() => {
    setCurrentDate(new Date(config.highestYear, 0, 1));
    setYearRange({
      start: config.lowestYear,
      end: config.highestYear
    });
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'firstName' || name === 'lastName') {
      const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, config.maxNameLength);
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else if (name === 'height') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day, close) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    setFormData(prev => ({
      ...prev,
      dateOfBirth: newDate.toISOString().split('T')[0]
    }));
    close();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const renderCalendar = (close) => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day, close)}
          className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm transition-all duration-200
            ${isSelected(day) ? 'bg-fivem-accent text-white shadow-lg shadow-fivem-accent/20' : 
              isToday(day) ? 'text-fivem-accent border border-fivem-accent/20' : 
              'text-gray-300 hover:bg-white/10 border border-transparent'}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const renderYearPicker = (close) => {
    const years = [];
    for (let year = yearRange.end; year >= yearRange.start; year--) {
      years.push(
        <button
          key={year}
          onClick={() => {
            setCurrentDate(new Date(year, currentDate.getMonth(), 1));
            setShowYearPicker(false);
          }}
          className={`h-10 w-full rounded-xl flex items-center justify-center text-sm transition-all duration-200
            ${currentDate.getFullYear() === year ? 'bg-fivem-accent text-white shadow-lg shadow-fivem-accent/20' : 'text-gray-300 hover:bg-white/10 border border-transparent'}`}
        >
          {year}
        </button>
      );
    }
    return years;
  };

  const renderMonthPicker = (close) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.map((month, index) => (
      <button
        key={month}
        onClick={() => {
          setCurrentDate(new Date(currentDate.getFullYear(), index, 1));
          setShowMonthPicker(false);
        }}
        className={`h-10 w-full rounded-xl flex items-center justify-center text-sm transition-all duration-200
          ${currentDate.getMonth() === index ? 'bg-fivem-accent text-white shadow-lg shadow-fivem-accent/20' : 'text-gray-300 hover:bg-white/10 border border-transparent'}`}
      >
        {month}
      </button>
    ));
  };

  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data;
      
      if (data.type === 'enableui') {
        setVisible(data.enable);
        if (!data.enable) {
          setFormData({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            height: '',
            gender: ''
          });
          setSelectedDate(null);
          setCurrentDate(new Date(config.highestYear, 0, 1));
          setShowYearPicker(false);
          setShowMonthPicker(false);
        }
      } else if (data.type === 'setConfig') {
        setConfig(data.config);
      }
    };

    window.addEventListener('message', handleMessage);

    fetch(`https://esx_identity/ready`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!visible) return;

    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.height || !formData.gender) {
      return;
    }

    const height = parseInt(formData.height);
    if (isNaN(height) || height < config.minHeight || height > config.maxHeight) {
      return;
    }

    const date = new Date(formData.dateOfBirth);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

    const formattedFirstName = formData.firstName.replace(/[^a-zA-Z\s]/g, '').trim();
    const formattedLastName = formData.lastName.replace(/[^a-zA-Z\s]/g, '').trim();

    if (!formattedFirstName || !formattedLastName) {
      return;
    }

    fetch(`https://esx_identity/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstname: formattedFirstName,
        lastname: formattedLastName,
        dateofbirth: formattedDate,
        height: height,
        sex: formData.gender === 'male' ? 'm' : 'f'
      })
    });
  };

  if (!visible) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/30">
      <div className="bg-[#1a1a1a] p-10 rounded-3xl w-full max-w-md border border-white/[0.08]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-fivem-accent/10 border border-fivem-accent/20 mb-4">
            <UserGroupIcon className="w-4 h-4 text-fivem-accent" />
            <span className="text-xs font-medium text-fivem-accent">REGISTRATION</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Character Registration
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            Please fill in your character details below
          </p>
        </div>

        <form className="space-y-7" onSubmit={handleSubmit}>
          <div className="space-y-2.5 group">
            <label className="block text-sm font-medium text-gray-300 group-hover:text-white transition-colors">First Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fivem-accent focus:border-transparent transition-all duration-200 hover:bg-white/10"
                placeholder="Enter your first name"
              />
            </div>
          </div>

          <div className="space-y-2.5 group">
            <label className="block text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Last Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fivem-accent focus:border-transparent transition-all duration-200 hover:bg-white/10"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2.5 group">
            <label className="block text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Date of Birth</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <Menu as="div" className="relative">
                {({ open, close }) => (
                  <>
                    <Menu.Button className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fivem-accent focus:border-transparent transition-all duration-200 text-left flex items-center justify-between hover:bg-white/10">
                      <span className={formData.dateOfBirth ? 'text-white' : 'text-gray-400'}>
                        {formData.dateOfBirth ? formatDate(new Date(formData.dateOfBirth)) : 'Select date'}
                      </span>
                      <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? 'transform rotate-180' : ''}`} />
                    </Menu.Button>
                    <Menu.Items className="absolute z-10 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-lg p-5 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-5">
                        <button
                          type="button"
                          onClick={prevMonth}
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <ChevronLeftIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        </button>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowMonthPicker(!showMonthPicker);
                              setShowYearPicker(false);
                            }}
                            className="px-3 py-1.5 rounded-xl text-white font-medium hover:bg-white/10 transition-colors bg-white/5 border border-white/10"
                          >
                            {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowYearPicker(!showYearPicker);
                              setShowMonthPicker(false);
                            }}
                            className="px-3 py-1.5 rounded-xl text-white font-medium hover:bg-white/10 transition-colors bg-white/5 border border-white/10"
                          >
                            {currentDate.getFullYear()}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={nextMonth}
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <ChevronRightIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        </button>
                      </div>

                      {showYearPicker ? (
                        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                          {renderYearPicker()}
                        </div>
                      ) : showMonthPicker ? (
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                          {renderMonthPicker()}
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-7 gap-2 mb-3">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="text-center text-sm text-gray-400 font-medium">
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-2">
                            {renderCalendar(close)}
                          </div>
                        </>
                      )}
                    </Menu.Items>
                  </>
                )}
              </Menu>
            </div>
          </div>

          <div className="space-y-2.5 group">
            <label className="block text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Height (CM)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ScaleIcon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fivem-accent focus:border-transparent transition-all duration-200 hover:bg-white/10"
                placeholder={`Height (${config.minHeight}-${config.maxHeight}cm)`}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-medium text-gray-300">Gender</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                className={`flex-1 py-3.5 px-4 rounded-2xl border transition-all duration-200 flex items-center justify-center space-x-2 ${
                  formData.gender === 'male'
                    ? 'bg-fivem-accent border-fivem-accent text-white shadow-lg shadow-fivem-accent/20 hover:bg-blue-600'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <UserGroupIcon className="h-5 w-5" />
                <span>Male</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                className={`flex-1 py-3.5 px-4 rounded-2xl border transition-all duration-200 flex items-center justify-center space-x-2 ${
                  formData.gender === 'female'
                    ? 'bg-fivem-female border-fivem-female text-white shadow-lg shadow-fivem-female/20 hover:bg-pink-600'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <UserGroupIcon className="h-5 w-5" />
                <span>Female</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-fivem-accent text-white rounded-2xl font-medium hover:bg-blue-600 transition-colors duration-200 shadow-lg shadow-fivem-accent/20"
          >
            Register Character
          </button>
        </form>
      </div>
    </div>
  );
}

export default App; 