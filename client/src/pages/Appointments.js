import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Plus, Filter, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    counselor: '',
    date: '',
    time: '',
    type: 'Individual',
    location: 'Office',
    notes: ''
  });
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: ''
  });

  const mockAppointments = [
    {
      id: 1,
      counselor: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: 60,
      type: 'individual',
      status: 'confirmed',
      location: 'office'
    },
    {
      id: 2,
      counselor: 'Dr. Michael Chen',
      date: '2024-01-20',
      time: '2:00 PM',
      duration: 45,
      type: 'follow-up',
      status: 'scheduled',
      location: 'online'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'scheduled': return 'badge-primary';
      case 'completed': return 'badge-secondary';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'individual': return 'text-blue-600';
      case 'group': return 'text-green-600';
      case 'emergency': return 'text-red-600';
      case 'follow-up': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return appointment.status === 'scheduled' || appointment.status === 'confirmed';
    if (filter === 'completed') return appointment.status === 'completed';
    if (filter === 'cancelled') return appointment.status === 'cancelled';
    if (filter === 'online') return appointment.location === 'online';
    if (filter === 'office') return appointment.location === 'office';
    return true;
  });

  const resetBookingForm = () => {
    setBookingForm({
      counselor: '',
      date: '',
      time: '',
      type: 'Individual',
      location: 'Office',
      notes: ''
    });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.counselor || !bookingForm.date || !bookingForm.time) {
      toast.error('Please fill counselor, date, and time.');
      return;
    }
    const newAppointment = {
      id: Date.now(),
      counselor: bookingForm.counselor,
      date: bookingForm.date,
      time: bookingForm.time,
      duration: 60,
      type: bookingForm.type.toLowerCase(),
      status: 'scheduled',
      location: bookingForm.location.toLowerCase(),
      notes: bookingForm.notes
    };
    setAppointments((prev) => [...prev, newAppointment]);
    toast.success('Appointment booked!');
    setShowBookingForm(false);
    resetBookingForm();
  };

  const handleCancelAppointment = (appointmentId) => {
    setAppointments((prev) => prev.map((apt) => (
      apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
    )));
    toast.success('Appointment cancelled');
  };

  const handleRescheduleClick = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleForm({ date: appointment.date, time: appointment.time });
    setShowReschedule(true);
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!rescheduleForm.date || !rescheduleForm.time) {
      toast.error('Please pick a new date and time.');
      return;
    }
    setAppointments((prev) => prev.map((apt) => (
      apt.id === selectedAppointment.id
        ? {
            ...apt,
            date: rescheduleForm.date,
            time: rescheduleForm.time,
            status: 'confirmed'
          }
        : apt
    )));
    toast.success('Appointment rescheduled');
    setShowReschedule(false);
    setSelectedAppointment(null);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setShowFilterMenu(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your counseling appointments</p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 mr-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              <p className="text-sm text-gray-600">Total Appointments</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 mr-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === 'scheduled').length}
              </p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 mr-4">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 mr-4">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.location === 'online').length}
              </p>
              <p className="text-sm text-gray-600">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Appointments</h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu((prev) => !prev)}
              className="btn btn-outline text-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              {filter === 'all' ? 'Filter' : filter}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-100 bg-white shadow-lg">
                {['all', 'upcoming', 'completed', 'cancelled', 'online', 'office'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`block w-full px-4 py-2 text-left text-sm capitalize hover:bg-gray-50 ${filter === option ? 'text-primary-600' : 'text-gray-600'}`}
                    onClick={() => handleFilterChange(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
            <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
            <button
              onClick={() => setShowBookingForm(true)}
              className="btn btn-primary"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{appointment.counselor}</h3>
                      <span className={`badge ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <span className={`text-sm font-medium ${getTypeColor(appointment.type)}`}>
                        {appointment.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {appointment.duration} min
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {appointment.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleRescheduleClick(appointment)}
                        className="btn btn-outline text-sm"
                      >
                        Reschedule
                      </button>
                    )}
                    {appointment.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="btn btn-danger text-sm"
                      >
                        {appointment.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Book New Appointment</h3>
              <button
                type="button"
                onClick={() => {
                  setShowBookingForm(false);
                  resetBookingForm();
                }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleBookingSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Counselor</label>
                  <select
                    className="input mt-1"
                    value={bookingForm.counselor}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, counselor: e.target.value }))}
                  >
                    <option value="">Select a counselor</option>
                    <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                    <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                    <option value="Dr. Emily Davis">Dr. Emily Davis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    className="input mt-1"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <select
                    className="input mt-1"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, time: e.target.value }))}
                  >
                    <option value="">Select time</option>
                    <option>9:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    className="input mt-1"
                    value={bookingForm.type}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option>Individual</option>
                    <option>Group</option>
                    <option>Follow-up</option>
                    <option>Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <select
                    className="input mt-1"
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, location: e.target.value }))}
                  >
                    <option>Office</option>
                    <option>Online</option>
                    <option>Phone</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                  className="textarea mt-1 h-24"
                  placeholder="Any specific concerns or preferences you'd like us to know?"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    resetBookingForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReschedule && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Reschedule Appointment</h3>
              <button
                type="button"
                onClick={() => setShowReschedule(false)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {selectedAppointment.counselor} · currently {selectedAppointment.date} at {selectedAppointment.time}
            </p>
            <form className="mt-4 space-y-4" onSubmit={handleRescheduleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">New date</label>
                <input
                  type="date"
                  className="input mt-1"
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New time</label>
                <select
                  className="input mt-1"
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm((prev) => ({ ...prev, time: e.target.value }))}
                >
                  <option value="">Select time</option>
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReschedule(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
