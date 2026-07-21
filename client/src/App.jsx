import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import BookEvent from './pages/BookEvent';
import TicketReceipt from './pages/TicketReceipt';
import Students from './pages/Students';
import ManageEvents from './pages/ManageEvents';
import JSONBooking from './pages/JSONBooking';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

function App() {
  return (
      <AuthProvider>
          <Router>
              <Navbar />
              <main className="main-content">
                  <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/book-event" element={<BookEvent />} />
                      <Route path="/ticket-receipt" element={<TicketReceipt />} />
                      <Route path="/json-booking" element={<JSONBooking />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/manage-events" element={<ManageEvents />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/profile" element={<Profile />} />
                  </Routes>
              </main>
              <Footer />
          </Router>
      </AuthProvider>
  );
}

export default App;
