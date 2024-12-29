import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Booking from './Booking'; // Import the Booking component

const Profile = () => {
  const [profile, setProfile] = useState(null); 
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSalon, setSelectedSalon] = useState(null);

  const token = localStorage.getItem('jwtToken');
  const navigate = useNavigate();

  // Function to check if the token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = decodedToken.exp * 1000;
    return Date.now() > expirationTime;
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (isTokenExpired(token)) {
      setError('Session expired. Please log in again.');
      localStorage.removeItem('jwtToken');
      navigate('/login');
      return;
    }

    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      console.log('Fetching profile data with token:', token); // Debugging log

      const profileRes = await axios.get('https://naayee.store/api/customer/profile', {
        headers: { 'x-auth-token': token },
      });
      setProfile(profileRes.data);

      const salonsRes = await axios.get('https://naayee.store/api/customer/salons', {
        headers: { 'x-auth-token': token },
      });
      setSalons(salonsRes.data);

      if (salonsRes.data.length > 0) {
        const firstSalon = salonsRes.data[0];
        setSelectedSalon(firstSalon.id);
        await fetchSalonDetails(firstSalon.id);
      }

   

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err); // Debugging log
      setError('Failed to fetch data: ' + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonDetails = async (salonId) => {
    try {
      if (!salonId || !token) {
        setError('Salon ID or token is missing.');
        return;
      }

      console.log('Fetching salon details for salonId:', salonId); // Debugging log

      const [servicesRes, staffRes] = await Promise.all([
        axios.get(`https://naayee.store/api/customer/salons/${salonId}/services`, {
          headers: { 'x-auth-token': token },
        }),
        axios.get(`https://naayee.store/api/customer/salons/${salonId}/staff`, {
          headers: { 'x-auth-token': token },
        }),
      ]);

      setServices(servicesRes.data);
      setStaff(staffRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching salon details:', err); // Debugging log
      setError('Failed to fetch salon details: ' + (err.response?.data?.msg || err.message));
    }
  };

  const handleSalonChange = (e) => {
    const salonId = e.target.value;
    setSelectedSalon(salonId);
    if (salonId) {
      fetchSalonDetails(salonId);
    } else {
      setServices([]);
      setStaff([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      console.log('Updating profile with token:', token); // Debugging log
      const response = await axios.put(
        'https://naayee.store/api/customer/profile',
        profile,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        }
      );
      setProfile(response.data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err); // Debugging log
      setError('Failed to update profile: ' + (err.response?.data?.msg || err.message));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile data available</div>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}

      <div className="profile-details">
        <label>
          Full Name:
          <input
            type="text"
            name="fullName"
            value={profile.fullName || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={profile.email || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <br />
        <label>
          Phone Number:
          <input
            type="text"
            name="phoneNumber"
            value={profile.phoneNumber || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <br />
        <label>
          Gender:
          <select
            name="gender"
            value={profile.gender || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <br />
        {isEditing && <button onClick={handleUpdateProfile}>Save</button>}
        {!isEditing && <button onClick={() => setIsEditing(true)}>Edit</button>}
      </div>

      <h3>Manage Bookings</h3>
      <Booking token={token} /> {/* Render the Booking component */}

      <h3>Salons</h3>
      <select onChange={handleSalonChange} value={selectedSalon || ''}>
        <option value="">Select a Salon</option>
        {salons.map((salon) => (
          <option key={salon.id} value={salon.id}>
            {salon.name}
          </option>
        ))}
      </select>

      <h3>Services</h3>
      <ul>
        {services.map((service) => (
          <li key={service.id}>{service.name}</li>
        ))}
      </ul>

      <h3>Staff</h3>
      <ul>
        {staff.map((member) => (
          <li key={member.id}>{member.name}</li>
        ))}
      </ul>

      <h3>Your Bookings</h3>
      <div className="bookings-list">
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <div key={index} className="booking-item">
              <p><strong>Salon:</strong> {booking.salonId}</p>
              <p><strong>Service:</strong> {booking.serviceId}</p>
              <p><strong>Date:</strong> {booking.bookingDate}</p>
              <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
              <p><strong>Amount:</strong> {booking.amount}</p>
              <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
            </div>
          ))
        ) : (
          <p>No bookings available</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
