import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Salon = () => {
  const [salons, setSalons] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setError('No token found, please login.');
          return;
        }

        const response = await axios.get('https://naayee.store/api/customer/salons', {
          headers: {
            'x-auth-token': token,
          },
        });

        setSalons(response.data); // Assuming the API returns an array of salons
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch salons. Please try again.');
      }
    };

    fetchSalons();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      <h2>Available Salons</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {salons.length === 0 ? (
          <p>No salons found.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {salons.map((salon, index) => (
              <li key={index} style={{ marginBottom: '15px' }}>
                <h3>{salon.name}</h3>
                <p>{salon.address}, {salon.city}, {salon.state}, {salon.country}, {salon.zipCode}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Salon;
