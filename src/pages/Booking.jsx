import React, { useState, useEffect } from "react";
import axios from "axios";

const Booking = ({ token }) => {
  const [salons, setSalons] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    salonId: "",
    serviceId: "",
    staffId: "",
    customerEmail: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    amount: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const response = await axios.get("https://naayee.store/api/customer/salons", {
          headers: { "x-auth-token": token },
        });
        setSalons(response.data || []);
      } catch (err) {
        console.error("Error fetching salons:", err);
        setError("Failed to fetch salons.");
      }
    };
    fetchSalons();
  }, [token]);

  const fetchServices = async (salonId) => {
    try {
      const response = await axios.get(
        `https://naayee.store/api/customer/salons/${salonId}/services`,
        { headers: { "x-auth-token": token } }
      );
      setServices(response.data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to fetch services.");
    }
  };

  const fetchStaff = async (salonId) => {
    try {
      const response = await axios.get(
        `https://naayee.store/api/customer/salons/${salonId}/staff`,
        { headers: { "x-auth-token": token } }
      );
      setStaff(response.data || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to fetch staff.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSalonChange = (e) => {
    const salonId = e.target.value;
    setFormData({ ...formData, salonId });
    fetchServices(salonId);
    fetchStaff(salonId);
  };

  const handlePayment = async (bookingData) => {
    try {
      const response = await axios.post(
        "https://naayee.store/api/create-order",
        bookingData,
        { headers: { "x-auth-token": token } }
      );

      if (response.data.success && response.data.order) {
        const options = {
          key: "rzp_live_hsAWOFUCIRGhVl", // Replace with your Razorpay key
          amount: response.data.order.amount,
          currency: "INR",
          name: "Salon Booking",
          description: `Booking for ${bookingData.customerEmail}`,
          order_id: response.data.order.id,
          prefill: {
            email: bookingData.customerEmail,
          },
          handler: async function (paymentResponse) {
            try {
              const verifyResponse = await axios.post(
                "https://naayee.store/api/verify-payment",
                {
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                },
                { headers: { "x-auth-token": token } }
              );

              if (verifyResponse.data.success) {
                setSuccess("Booking confirmed and payment successful!");
                setFormData({
                  salonId: "",
                  serviceId: "",
                  staffId: "",
                  customerEmail: "",
                  bookingDate: "",
                  startTime: "",
                  endTime: "",
                  amount: "",
                });
              } else {
                setError("Payment verification failed");
              }
            } catch (err) {
              console.error("Verification error:", err);
              setError("Payment verification failed");
            }
          },
          theme: { color: "#F37254" },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          setError("Razorpay SDK not loaded");
        }
      } else {
        setError("Failed to create payment order");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Payment initiation failed. Please try again.");
    }
  };

  const handleBooking = () => {
    if (
      !formData.salonId ||
      !formData.serviceId ||
      !formData.staffId ||
      !formData.customerEmail ||
      !formData.bookingDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const selectedService = services.find(
      (service) => service.id === parseInt(formData.serviceId, 10)
    );

    if (!selectedService) {
      setError("Please select a valid service");
      return;
    }

    const bookingData = {
      salonId: parseInt(formData.salonId, 10),
      serviceId: parseInt(formData.serviceId, 10),
      staffId: parseInt(formData.staffId, 10),
      customerEmail: formData.customerEmail,
      bookingDate: formData.bookingDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      amount: selectedService.price * 100, // Convert to paise
    };

    handlePayment(bookingData);
  };

  return (
    <div>
      <h3>Book a Service</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <label>Salon:</label>
      <select name="salonId" value={formData.salonId} onChange={handleSalonChange}>
        <option value="">Select a salon</option>
        {salons.map((salon) => (
          <option key={salon.id} value={salon.id}>
            {salon.name}
          </option>
        ))}
      </select>
      <br />

      <label>Service:</label>
      <select name="serviceId" value={formData.serviceId} onChange={handleInputChange}>
        <option value="">Select a service</option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name} - ₹{service.price}
          </option>
        ))}
      </select>
      <br />

      <label>Staff:</label>
      <select name="staffId" value={formData.staffId} onChange={handleInputChange}>
        <option value="">Select a staff member</option>
        {staff.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
      <br />

      <label>Email:</label>
      <input
        type="email"
        name="customerEmail"
        value={formData.customerEmail}
        onChange={handleInputChange}
      />
      <br />

      <label>Booking Date:</label>
      <input
        type="date"
        name="bookingDate"
        value={formData.bookingDate}
        onChange={handleInputChange}
      />
      <br />

      <label>Start Time:</label>
      <input
        type="time"
        name="startTime"
        value={formData.startTime}
        onChange={handleInputChange}
      />
      <br />

      <label>End Time:</label>
      <input
        type="time"
        name="endTime"
        value={formData.endTime}
        onChange={handleInputChange}
      />
      <br />

      <button onClick={handleBooking}>Confirm Booking</button>
    </div>
  );
};

export default Booking;
