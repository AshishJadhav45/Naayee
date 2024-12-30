import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
// import Salons from './pages/Salons';
// import SalonDetails from './pages/SalonDetails';
import Booking from './pages/Booking';



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
               <Route path="/bookings" element={<Booking />} />
            </Routes>
        </Router>
    );
}

export default App;
