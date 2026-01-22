import React, { useState, useEffect } from "react";
import AccountForm from "./components/AccountForm";
import Navbar from "./components/Navbar";
import ScrollTop from "./components/ScrollTop";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Business from "./components/Business";
import Bill from "./components/Bill";
import PaymentMethod from "./components/PaymentMethod";
import Testimonials from "./components/Testimonials";
import ServiceCard from "./components/ServiceCard";
import Footer from "./components/Footer";

import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";

const App = () => {
  const [showAccount, setShowAccount] = useState(false);
  const [userType, setUserType] = useState(null); // 'student' | 'teacher'
  const [loggedInUser, setLoggedInUser] = useState(null); // user object
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("http://127.0.0.1:8000/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const user = await res.json();
            setLoggedInUser(user);
            setUserType(user.user_type === 1 ? "teacher" : "student");
          } else {
            localStorage.removeItem("token");
          }
        } catch (err) {
          console.error("Session restoration failed", err);
        }
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  // LOGIN HANDLER → called from AccountForm
  const handleLogin = (userTypeFromBackend, user, token) => {
    setUserType(userTypeFromBackend);
    setLoggedInUser(user);
    localStorage.setItem("token", token);
    setShowAccount(false);
  };

  // LOGOUT → pass to dashboards
  const handleLogout = () => {
    setUserType(null);
    setLoggedInUser(null);
    localStorage.removeItem("token");
    setShowAccount(true);
  };

  if (checkingSession) {
    return (
      <div className="bg-primary min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse">Restoring Session...</p>
        </div>
      </div>
    );
  }

  // Conditional rendering based on logged in user
  if (userType === "student")
    return <StudentDashboard studentData={loggedInUser} onLogout={handleLogout} />;

  if (userType === "teacher")
    return <TeacherDashboard teacherData={loggedInUser} onLogout={handleLogout} />;

  // Landing page
  return (
    <div className="bg-primary text-textPrimary w-full h-full">
      <Navbar onLoginClick={() => setShowAccount(true)} />
      <ScrollTop />
      <div className="container px-5 md:px-10 mx-auto">
        <Hero onLoginClick={() => setShowAccount(true)} />
        <div className="flex flex-col xs:flex-row flex-wrap items-center justify-between gap-6 md:gap-2 py-20">
          <Stats number="3800" title="ACTIVE STUDENT & TEACHER" />
          <Stats number="230" title="Total Courses" />
          <Stats number="$230M" title="Total Users" />
        </div>
        <Business />
        <Bill />
        <PaymentMethod />
        <Testimonials />
        <ServiceCard />
        <Footer />
      </div>

      {showAccount && <AccountForm setShowAccount={setShowAccount} onLogin={handleLogin} />}
    </div>
  );
};

export default App;
