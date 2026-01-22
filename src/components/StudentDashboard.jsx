/* global faceapi */
import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  BarChart3,
  Users,
  Layers,
  Settings,
  LogOut,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Award,
  Menu,
  X,
  Search,
  History,
  Sun,
  Moon,
  Key,
  Shield,
  Clock,
  Calendar,
  Database,
  Bell,
  BellDot,
  ShieldAlert,
  Hash,
  ArrowLeft,
  ArrowRight,
  User,
  Eye,
  EyeOff
} from "lucide-react";
import "./dashboard.css";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

// Helper Component for Bar Chart
const BarChart = ({ data, labels, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-40 w-full relative mb-6 text-slate-500">
      {/* Grid Lines */}
      <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-t border-current w-full"></div>
        ))}
      </div>

      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group z-10 h-full justify-end">
          <div
            className={`w-full rounded-t-lg transition-all duration-700 hover:opacity-80 relative shadow-sm`}
            style={{
              height: `${(val / max) * 100}%`,
              backgroundColor: val >= 0 ? color : 'transparent',
              minHeight: val > 0 ? '4px' : '0'
            }}
          >
            {val > 0 && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-xl border border-slate-700 whitespace-nowrap z-50">
                {val} Attempts
              </div>
            )}
          </div>
          <span className="text-[8px] md:text-[10px] font-bold uppercase truncate w-full text-center absolute -bottom-6">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// Helper Component for Line Chart
const MiniLineChart = ({ data, labels }) => {
  const max = Math.max(...data, 1);
  const padding = 10;

  const points = data.map((val, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (100 - 2 * padding);
    const y = padding + (100 - 2 * padding) - (val / max) * (100 - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = points.length > 0 ? `M ${points[0]} L ${points.slice(1).join(' L ')}` : '';
  const areaD = points.length > 0 ? `${pathD} V 90 H ${padding} Z` : '';

  return (
    <div className="h-44 w-full flex flex-col relative text-slate-500">
      {/* Grid Lines */}
      <div className="absolute inset-0 h-40 flex flex-col justify-between pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-t border-indigo-400 w-full"></div>
        ))}
      </div>

      <div className="h-40 relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaD} fill="url(#areaGradient)" className="transition-all duration-1000" />

          <path
            d={pathD}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-1000"
          />

          {data.map((val, i) => {
            const [cx, cy] = points[i].split(',');
            return (
              <g key={i} className="group">
                <circle cx={cx} cy={cy} r="2" fill="#4f46e5" className="transition-all duration-300 cursor-pointer" />
                <circle cx={cx} cy={cy} r="10" fill="transparent" className="cursor-pointer">
                  <title>{val}%</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between px-2">
        {labels.map((l, i) => (
          <span key={i} className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter">{l}</span>
        ))}
      </div>
    </div>
  );
};

export default function StudentDashboard({ studentData = {}, onLogout }) {
  // Guard early if studentData is totally missing
  if (!studentData) studentData = {};
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Removed localStorage persistence for activeTab to reset on login

  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(() => {
    const saved = localStorage.getItem("student_selectedQuiz");
    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });
  const [quizKey, setQuizKey] = useState("");
  const [activeQuizQuestions, setActiveQuizQuestions] = useState(() => {
    const saved = localStorage.getItem("student_activeQuizQuestions");
    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });
  const [resultData, setResultData] = useState(null);
  const [results, setResults] = useState([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [enrollKey, setEnrollKey] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const notificationRef = useRef(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedQuizStatusFilter, setSelectedQuizStatusFilter] = useState('all');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passNew, setPassNew] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [previousTab, setPreviousTab] = useState("dashboard");

  useEffect(() => {
    // Fetch data from backend
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };

        const results = await Promise.all([
          fetch("http://127.0.0.1:8000/courses/all", { headers }),
          fetch("http://127.0.0.1:8000/courses/my", { headers }),
          fetch("http://127.0.0.1:8000/results/my", { headers }),
          fetch("http://127.0.0.1:8000/notifications", { headers })
        ]);

        const [allRes, myRes, resultsRes, notifRes] = results;
        console.log("Student Dashboard Fetch Results:", {
          courses: allRes.status,
          myCourses: myRes.status,
          results: resultsRes.status,
          notifications: notifRes.status
        });

        if (!allRes.ok || !myRes.ok) {
          console.error("Critical Fetch Failure:", { all: allRes.status, my: myRes.status });
          throw new Error(`Critical Data Load Failed (Status: ${allRes.status}/${myRes.status})`);
        }

        setCourses(await allRes.json());
        setMyCourses(await myRes.json());

        if (resultsRes.ok) {
          setResults(await resultsRes.json());
        } else {
          console.warn("Results Fetch Failed:", resultsRes.status);
        }

        if (notifRes.ok) {
          setNotifications(await notifRes.json());
        } else {
          console.warn("Notifications Fetch Failed:", notifRes.status);
        }

        setFetchError(null);
      } catch (err) {
        console.error("Student Dashboard Data Fetch Failure:", err);
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // POLLING: Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);

    // Click outside handler for notifications
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("student_selectedQuiz");
    localStorage.removeItem("student_activeQuizQuestions");
    onLogout();
  };

  useEffect(() => {
    localStorage.setItem("student_selectedQuiz", JSON.stringify(selectedQuiz));
  }, [selectedQuiz]);

  useEffect(() => {
    localStorage.setItem("student_selectedQuiz", JSON.stringify(selectedQuiz));
  }, [selectedQuiz]);

  useEffect(() => {
    localStorage.setItem("student_activeQuizQuestions", JSON.stringify(activeQuizQuestions));
  }, [activeQuizQuestions]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://127.0.0.1:8000/notifications/${id}/read`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) { console.error(err); }
  };

  const handleValidateKey = async (e) => {
    e.preventDefault();
    try {
      // First validate key
      const valRes = await fetch(`http://127.0.0.1:8000/quizzes/${selectedQuiz.id}/validate?key=${quizKey}`, {
        method: "POST"
      });

      if (valRes.ok) {
        // Fetch randomized questions for start
        const token = localStorage.getItem("token");
        const startRes = await fetch(`http://127.0.0.1:8000/quizzes/${selectedQuiz.id}/start?key=${quizKey}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (startRes.ok) {
          const questions = await startRes.json();
          setActiveQuizQuestions(questions);
          setShowKeyModal(false);
          setActiveTab("quiz-session");
        } else {
          toast.error("Failed to load quiz content");
        }
      } else {
        const data = await valRes.json();
        toast.error(data.detail || "Invalid key or quiz not available");
      }
    } catch (err) {
      toast.error("Validation failed");
    }
  };
  const handleEnroll = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/courses/${selectedCourseForEnroll.id}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ access_key: enrollKey })
      });

      if (res.ok) {
        toast.success("Enrolled successfully!");
        setShowEnrollModal(false);
        setEnrollKey("");
        // Refresh data
        // Refresh data using handleData fetch (or specific endpoints)
        const headers = { "Authorization": `Bearer ${token}` };
        const myRes = await fetch("http://127.0.0.1:8000/courses/my", { headers });
        if (myRes.ok) {
          const myData = await myRes.json();
          setMyCourses(myData);
          setActiveTab("my-courses");
        }
      } else {
        const data = await res.json();
        toast.error(data.detail || "Enrollment failed");
      }
    } catch (err) {
      toast.error("Enrollment error");
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="dashboard">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Hide when taking quiz */}
      {activeTab !== 'quiz-session' && (
        <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="flex justify-between items-center mb-10">
            <h2 className="sidebar-title mb-0">Quizi</h2>
            <button className="md:hidden text-gray-400" onClick={toggleSidebar}>
              <X size={24} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <SidebarItem
              icon={<Home size={18} />}
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}
            />
            <SidebarItem
              icon={<Layers size={18} />}
              label="My Courses"
              active={activeTab === "my-courses"}
              onClick={() => { setActiveTab("my-courses"); setIsSidebarOpen(false); }}
            />
            <SidebarItem
              icon={<Search size={18} />}
              label="Browse Courses"
              active={activeTab === "browse"}
              onClick={() => { setActiveTab("browse"); setIsSidebarOpen(false); }}
            />
            <SidebarItem
              icon={<BookOpen size={18} />}
              label="Quizzes"
              active={activeTab === "quizzes"}
              onClick={() => { setActiveTab("quizzes"); setIsSidebarOpen(false); }}
            />
            <SidebarItem
              icon={<BarChart3 size={18} />}
              label="Reports"
              active={activeTab === "reports"}
              onClick={() => { setActiveTab("reports"); setIsSidebarOpen(false); }}
            />
            <SidebarItem
              icon={<History size={18} />}
              label="Attempt History"
              active={activeTab === "attempt-history"}
              onClick={() => { setActiveTab("attempt-history"); setIsSidebarOpen(false); }}
            />
          </nav>


          <div className="sidebar-footer">
            <SidebarItem
              icon={theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              label={theme === 'light' ? "Dark Mode" : "Light Mode"}
              onClick={toggleTheme}
            />
            <SidebarItem
              icon={<User size={18} />}
              label="Profile"
              active={activeTab === "profile"}
              onClick={() => {
                if (activeTab !== "profile") setPreviousTab(activeTab);
                setActiveTab("profile");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<LogOut size={18} />}
              label="Logout"
              onClick={handleLogout}
            />
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="main">
        {/* Header - Hide when taking quiz */}
        {activeTab !== 'quiz-session' && (
          <div className="header">
            <div className="flex items-center gap-4">
              <button className="mobile-toggle" onClick={toggleSidebar}>
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl md:text-3xl">Welcome back, {studentData?.full_name || "Student"}</h1>
                <p className="header-subtitle mt-1">Ready for your next quiz?</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="hidden sm:block btn-primary px-4 py-2 rounded-xl" onClick={() => setActiveTab("browse")}>Enroll New Course</button>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  className="p-3 btn-secondary rounded-xl relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} className={notifications.some(n => !n.is_read) ? "text-indigo-500" : "text-gray-500"} />
                  {notifications.some(n => !n.is_read) && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div ref={notificationRef} className="absolute right-0 mt-3 w-80 dropdown-card rounded-2xl z-[300] overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                      <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                      <button className="text-xs text-indigo-500 hover:underline" onClick={() => setShowNotifications(false)}>Close</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className="relative group overflow-hidden border-b border-slate-800/50 last:border-0 bg-white dark:bg-slate-900">
                          {/* Swipeable Container */}
                          <div className="flex transition-transform duration-300 ease-out hover:-translate-x-16">
                            <div
                              className={`flex-1 p-4 cursor-pointer ${!n.is_read ? 'bg-indigo-500/5' : ''}`}
                              onClick={() => handleMarkAsRead(n.id)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${n.type === 'quiz' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                  {n.type}
                                </span>
                                <span className="text-[10px] text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{n.title}</h4>
                              <p className="text-xs text-gray-400 leading-relaxed">{n.message}</p>
                            </div>
                            {/* Delete Button (reveal on hover/swipe) */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(n.id);
                              }}
                              className="w-16 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Area - Scrollable */}
        <div className={`content-area ${activeTab === 'quiz-session' ? 'p-8' : ''}`}>


          {activeTab === "dashboard" && (() => {
            if (fetchError) {
              return (
                <div className="py-20 text-center bg-red-500/5 rounded-[3rem] border-2 border-dashed border-red-500/20">
                  <ShieldAlert size={48} className="mx-auto mb-4 text-red-400" />
                  <p className="text-xl font-bold text-red-500">Data Access Error</p>
                  <p className="text-sm text-red-400 mt-2">{fetchError}</p>
                  <button onClick={() => window.location.reload()} className="mt-8 btn-primary px-8 py-3 rounded-2xl">Retry Connection</button>
                </div>
              );
            }

            // Calculate dynamic data
            const totalAttempts = results.length;
            const passedQuizzes = results.filter(r => (r.score / r.total_marks) >= 0.4).length;
            const avgScore = totalAttempts > 0
              ? Math.round((results.reduce((acc, r) => acc + (r.score / r.total_marks), 0) / totalAttempts) * 100)
              : 0;

            // Pending Quizzes: Check all quizzes in enrolled courses not in results
            const attemptedQuizIds = new Set(results.map(r => r.quiz_id));
            const totalQuizzesAcrossCourses = myCourses.reduce((acc, c) => acc + (c.quiz_count || 0), 0);
            const pendingCount = Math.max(0, totalQuizzesAcrossCourses - attemptedQuizIds.size);

            // Overall Progress: Passed courses (at least one quiz passed) / Total enrolled
            // For simplicity, let's use: (courses with at least one attempt) / Total enrolled
            const attemptedCourseIds = new Set(results.map(r => r.quiz?.course_id));
            const progress = myCourses.length > 0
              ? Math.round((attemptedCourseIds.size / myCourses.length) * 100)
              : 0;

            // Weekly Productivity (Last 7 Days Attempts)
            const last7Days = [...Array(7)].map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            }).reverse();

            const productivityData = last7Days.map(date =>
              results.filter(r => {
                if (!r.completed_at) return false;
                const d = new Date(r.completed_at);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}` === date;
              }).length
            );

            const dayLabels = last7Days.map(date => {
              const d = new Date(date);
              return d.toLocaleDateString('en-US', { weekday: 'short' });
            });

            // Quiz Scores (Last 5 attempts)
            const recentResults = results.slice(-5);
            const scoreData = recentResults.map(r => Math.round((r.score / Math.max(r.total_marks, 1)) * 100));
            const scoreLabels = recentResults.map((r, i) => r.quiz?.title?.substring(0, 8) + "..." || `Q${i + 1}`);

            return (
              <>
                {/* Stats */}
                <div className="stats-grid">
                  <StatCard
                    title="Overall Progress"
                    value={`${progress}%`}
                    trend={`${attemptedCourseIds.size} Courses Started`}
                    icon={<TrendingUp size={24} />}
                    onClick={() => setActiveTab("reports")}
                  />
                  <StatCard
                    title="Active Courses"
                    value={myCourses.length}
                    trend="Enrolled"
                    icon={<Layers size={24} />}
                    onClick={() => setActiveTab("my-courses")}
                  />
                  <StatCard
                    title="Pending Quizzes"
                    value={pendingCount}
                    trend="To be attempted"
                    icon={<BookOpen size={24} />}
                    onClick={() => setActiveTab("quizzes")}
                  />
                  <StatCard
                    title="Average Score"
                    value={`${avgScore}%`}
                    trend={`${passedQuizzes} Passed`}
                    icon={<Award size={24} />}
                    onClick={() => setActiveTab("attempt-history")}
                  />
                </div>

                {/* Charts */}
                <div className="charts">
                  <div className="chart-card">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="chart-title mb-0">Weekly Productivity</h2>
                        <p className="text-xs text-slate-500">Quiz attempts by day of week</p>
                      </div>
                    </div>
                    <BarChart data={productivityData} labels={dayLabels} color="#6366f1" />
                  </div>
                  <div className="chart-card">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="chart-title mb-0">Quiz Scores</h2>
                        <p className="text-xs text-slate-500">Performance (Percentage) of last 5 attempts</p>
                      </div>
                    </div>
                    <MiniLineChart data={scoreData} labels={scoreLabels} />
                  </div>
                </div>
              </>
            );
          })()}

          {activeTab === "browse" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Discover Courses</h2>
                  <p className="text-muted text-sm mt-1">Join new courses using the keys provided by your instructors</p>
                </div>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-slate-700">
                  <span className="text-indigo-400 font-bold">{courses.length}</span> Courses Found
                </div>
              </div>

              {fetchError ? (
                <div className="py-20 text-center bg-red-500/5 rounded-[3rem] border-2 border-dashed border-red-500/20">
                  <ShieldAlert size={48} className="mx-auto mb-4 text-red-400" />
                  <p className="text-xl font-bold text-red-500">Data Access Error</p>
                  <p className="text-sm text-red-400 mt-2">{fetchError}</p>
                  <button onClick={() => window.location.reload()} className="mt-8 btn-primary px-8 py-3 rounded-2xl">Retry Connection</button>
                </div>
              ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => {
                    const isEnrolled = myCourses.some(mc => mc.id === course.id);
                    return (
                      <div key={course.id} className="chart-card flex flex-col justify-between group hover:border-indigo-500/50 transition-all p-8 rounded-3xl">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center font-black transition-transform group-hover:scale-110">
                              {course.course_code.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400 px-2 py-1 rounded uppercase font-bold tracking-widest border border-slate-200 dark:border-slate-700">{course.course_code}</span>
                          </div>
                          <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                          <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">{course.description}</p>
                        </div>
                        {isEnrolled ? (
                          <button className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 py-3 rounded-2xl font-bold cursor-default flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800">
                            <CheckCircle size={16} /> Enrolled
                          </button>
                        ) : (
                          <button
                            className="w-full btn-primary py-3 rounded-2xl font-bold shadow-lg shadow-indigo-900/20 active:scale-[0.98]"
                            onClick={() => {
                              setSelectedCourseForEnroll(course);
                              setShowEnrollModal(true);
                            }}
                          >
                            Enroll Now
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-32 text-center bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800/50">
                  <Search size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                  <p className="text-xl font-bold text-slate-400">No courses available yet.</p>
                  <p className="text-sm text-slate-400 mt-2">Check back later or ask your instructor for a key.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-8 text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-2 mx-auto px-6 py-2 rounded-full border border-indigo-500/20 hover:bg-indigo-500/5 transition"
                  >
                    <TrendingUp size={16} /> Refresh Course List
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "my-courses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(course => {
                const courseResults = results.filter(r => r.quiz?.course_id === course.id);
                const completedCount = courseResults.length;
                const totalQuizzes = course.quiz_count || 0;
                const percent = totalQuizzes > 0 ? Math.round((completedCount / totalQuizzes) * 100) : 0;

                return (
                  <div
                    key={course.id}
                    className="chart-card cursor-pointer hover:border-indigo-500/50 transition-all active:scale-[0.98]"
                    onClick={() => {
                      setSelectedCourseFilter(course.id.toString());
                      setActiveTab("quizzes");
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{course.title}</h3>
                      <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md font-mono">{course.course_code}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-50 h-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: percent === 100 ? '#10b981' : '#6366f1' }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className={`text-xs font-medium ${percent === 100 ? 'text-green-500' : 'text-indigo-400'}`}>
                        {percent}% Complete
                      </p>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {completedCount}/{totalQuizzes} Quizzes
                      </span>
                    </div>
                  </div>
                );
              })}
              {myCourses.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <Layers size={48} className="mx-auto text-slate-700 mb-4" />
                  <p className="text-slate-500">You are not enrolled in any courses yet.</p>
                  <button
                    className="text-indigo-400 hover:underline mt-2"
                    onClick={() => setActiveTab("browse")}
                  >
                    Browse available courses
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold">Upcoming & Active Quizzes</h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <select
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  >
                    <option value="all">All Courses</option>
                    {myCourses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>

                  <select
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedQuizStatusFilter}
                    onChange={(e) => setSelectedQuizStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Now</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCourses
                  .filter(c => selectedCourseFilter === "all" || String(c.id) === String(selectedCourseFilter))
                  .map(course => (
                    <QuizGroup
                      key={course.id}
                      course={course}
                      results={results}
                      onTakeQuiz={(quiz) => { setSelectedQuiz(quiz); setShowKeyModal(true); }}
                      statusFilter={selectedQuizStatusFilter}
                    />
                  ))
                }
              </div>
              {myCourses.length === 0 && <p className="text-gray-400">Enroll in a course to see available quizzes.</p>}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="flex flex-col gap-6">
              <div className="chart-card p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-indigo-600/10 text-indigo-500 rounded-xl">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Performance History</h3>
                    <p className="text-sm text-slate-500">Track your progress across all quizzes</p>
                  </div>
                </div>

                {results.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {results.slice().reverse().map((res, idx) => (
                      <div key={res.id || idx} className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400 font-bold border border-slate-800">
                            {Math.round((res.score / res.total_marks) * 100)}%
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{res.quiz?.title || `Quiz Attempt #${results.length - idx}`}</h4>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{res.quiz?.course?.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(res.completed_at).toLocaleDateString()} • {res.score} / {res.total_marks} Marks</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${res.score / res.total_marks >= 0.4 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {res.score / res.total_marks >= 0.4 ? 'Passed' : 'Failed'}
                          </div>
                          <TrendingUp size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Database size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No quiz results yet.</p>
                    <p className="text-xs opacity-60">Complete a quiz to see your performance here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "quiz-session" && activeQuizQuestions && (
            <QuizSession
              quiz={selectedQuiz}
              questions={activeQuizQuestions}
              onFinish={(result) => {
                setResultData(result);
                setActiveTab("quiz-result");
              }}
            />
          )}

          {activeTab === "quiz-result" && resultData && (
            <div className="chart-card p-12 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-600/10 text-indigo-500 rounded-full flex items-center justify-center mb-6">
                <Award size={48} />
              </div>
              <h2 className="text-3xl font-bold mb-1">Quiz Completed!</h2>
              <p className="text-gray-400 mb-8">Great job finishing the {selectedQuiz.title}</p>

              <div className="flex gap-8 mb-10">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-400">{resultData.score}/{resultData.total_marks}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Final Score</p>
                </div>
                <div className="text-center border-l border-slate-800 pl-8">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {Math.round((resultData.score / resultData.total_marks) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Accuracy</p>
                </div>
              </div>

              <button
                className="btn-primary px-8 py-3 rounded-xl font-bold transition"
                onClick={() => setActiveTab("dashboard")}
              >
                Go to Dashboard
              </button>
            </div>
          )}
          {
            activeTab === "profile" && (
              <div className="max-w-2xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold">Edit Profile</h2>
                  <button onClick={() => setActiveTab(previousTab)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition">
                    <X size={24} className="text-slate-500" />
                  </button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const updates = Object.fromEntries(formData.entries());

                    const cleanUpdates = {};
                    for (const [key, value] of Object.entries(updates)) {
                      if (value.trim() !== "") cleanUpdates[key] = value;
                    }

                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch("http://127.0.0.1:8000/auth/me", {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(cleanUpdates)
                      });
                      if (res.ok) {
                        toast.success("Profile updated successfully!");
                      } else {
                        const err = await res.json();
                        toast.error("Update failed: " + (err.detail || "Unknown error"));
                      }
                    } catch (err) {
                      toast.error("Network error");
                    }
                  }} className="flex flex-col gap-6">

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-600/20">
                        {studentData.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{studentData?.full_name}</h3>
                        <p className="text-slate-500 text-sm">{studentData?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider rounded">Student Account</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Personal Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Full Name</label>
                          <input name="full_name" defaultValue={studentData?.full_name} className="input-field w-full p-3 rounded-xl" placeholder="Your Name" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Email</label>
                          <input name="email" defaultValue={studentData?.email} className="input-field w-full p-3 rounded-xl" placeholder="Email Address" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Mobile</label>
                          <input name="mobile" defaultValue={studentData?.mobile} className="input-field w-full p-3 rounded-xl" placeholder="Phone Number" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Student ID</label>
                          <input name="student_id" defaultValue={studentData?.student_id} className="input-field w-full p-3 rounded-xl" placeholder="STU-XXX" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Department</label>
                          <input name="department" defaultValue={studentData?.department} className="input-field w-full p-3 rounded-xl" placeholder="Department" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">University</label>
                          <input name="university" defaultValue={studentData?.university} className="input-field w-full p-3 rounded-xl" placeholder="University Name" />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary w-full py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20">
                        Update Details
                      </button>
                    </div>
                  </form>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Security & Password</h4>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const data = Object.fromEntries(formData.entries());

                      if (data.new_password !== data.confirm_new_password) {
                        toast.error("New passwords do not match!");
                        return;
                      }

                      try {
                        const token = localStorage.getItem("token");
                        const res = await fetch("http://127.0.0.1:8000/auth/change-password", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                          },
                          body: JSON.stringify(data)
                        });
                        if (res.ok) {
                          toast.success("Password updated successfully!");
                          e.target.reset();
                          setPassNew("");
                          setPassConfirm("");
                        } else {
                          const err = await res.json();
                          toast.error("Update failed: " + (err.detail || "Unknown error"));
                        }
                      } catch (err) {
                        toast.error("Network error");
                      }
                    }} className="flex flex-col gap-4">
                      {/* Password Match visual check */}
                      {passNew !== passConfirm && passConfirm !== "" && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Passwords do not match</p>
                      )}
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Old Password</label>
                        <div className="relative">
                          <input
                            name="old_password"
                            type={showOldPass ? "text" : "password"}
                            required
                            className="input-field w-full p-3 rounded-xl"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                            onClick={() => setShowOldPass(!showOldPass)}
                          >
                            {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">New Password</label>
                          <div className="relative">
                            <input
                              name="new_password"
                              type={showNewPass ? "text" : "password"}
                              required
                              value={passNew}
                              onChange={(e) => setPassNew(e.target.value)}
                              className={`input-field w-full p-3 rounded-xl transition-all duration-300 ${passNew !== passConfirm && passConfirm !== "" ? "border-red-500/50 ring-2 ring-red-500/20" : ""}`}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                              onClick={() => setShowNewPass(!showNewPass)}
                            >
                              {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Confirm New Password</label>
                          <div className="relative">
                            <input
                              name="confirm_new_password"
                              type={showConfirmPass ? "text" : "password"}
                              required
                              value={passConfirm}
                              onChange={(e) => setPassConfirm(e.target.value)}
                              className={`input-field w-full p-3 rounded-xl transition-all duration-300 ${passNew !== passConfirm && passConfirm !== "" ? "border-red-500/50 ring-2 ring-red-500/20" : ""}`}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                              onClick={() => setShowConfirmPass(!showConfirmPass)}
                            >
                              {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:opacity-90 transition">
                        Change Password
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          }
          {
            activeTab === "attempt-history" && (
              <AttemptHistory studentData={studentData} results={results} />
            )
          }
        </div>
      </main >

      {/* Enrollment Key Modal */}
      {
        showEnrollModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <BookOpen className="text-indigo-500" />
                    Join {selectedCourseForEnroll?.title}
                  </h2>
                  <p className="text-muted text-sm mt-1">Requires a secure enrollment key</p>
                </div>
                <button onClick={() => setShowEnrollModal(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEnroll} className="flex flex-col gap-4">
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="ENTER-COURSE-KEY"
                    className="w-full input-field p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-mono font-black"
                    value={enrollKey}
                    onChange={(e) => setEnrollKey(e.target.value.toUpperCase())}
                    autoFocus
                    required
                  />
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-start gap-3">
                  <Shield className="text-indigo-400 shrink-0" size={18} />
                  <p className="text-xs text-indigo-300 leading-relaxed italic">
                    Ask your teacher for the enrollment key to access course materials and quizzes.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary p-4 rounded-2xl font-black text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  Enroll in Course
                </button>
              </form>
            </div>
          </div>
        )
      }

      {/* Key Validation Modal */}
      {
        showKeyModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <Shield className="text-indigo-500" />
                    Secure Access
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Enter the access key for {selectedQuiz?.title}</p>
                </div>
                <button onClick={() => setShowKeyModal(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleValidateKey} className="flex flex-col gap-4">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="EXAM-KEY-123"
                    className="w-full input-field p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-mono font-black"
                    value={quizKey}
                    onChange={(e) => setQuizKey(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3">
                  <Clock className="text-indigo-400 shrink-0" size={18} />
                  <p className="text-xs text-indigo-300 leading-relaxed">
                    This quiz is timed ({selectedQuiz?.duration}m). Ensure you have a stable connection. Cheating detection is active.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary p-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  Start Quiz Now
                </button>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}

function QuizGroup({ course, results, onTakeQuiz, statusFilter }) {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/courses/${course.id}/quizzes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        let filtered = data;
        if (statusFilter === 'active') {
          // Assuming active means status is 'live' or open based on dates.
          // For now, let's filter by simple status string if available or assume 'live'
          filtered = data.filter(q => q.status === 'live');
        }
        setQuizzes(filtered);
      })
      .catch(err => console.error("Failed to load quizzes", err));
  }, [course.id, statusFilter]);

  if (quizzes.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{course.title}</h3>
      {quizzes.map(quiz => (
        <div key={quiz.id} className="chart-card flex flex-col gap-4 p-6 group hover:border-indigo-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <BookOpen size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{quiz.title}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1"><Clock size={12} /> {quiz.duration}m</span>
                  <span className="flex items-center gap-1"><Award size={12} /> {quiz.total_marks} Marks</span>
                  <span className="flex items-center gap-1 font-medium text-indigo-400">
                    <Calendar size={12} /> {new Date(quiz.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>
            {results.some(r => r.quiz_id === quiz.id) ? (
              <div className="flex flex-col items-end gap-1">
                <span className="bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-500/10">Attempted</span>
                <span className="text-[10px] text-gray-500 font-bold">Multiple attempts not allowed</span>
              </div>
            ) : (
              <button
                className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-indigo-900/20 active:scale-95"
                onClick={() => onTakeQuiz(quiz)}
              >
                Take Quiz
              </button>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">About this quiz</p>
            <p className="text-sm text-gray-400 leading-relaxed italic line-clamp-2">
              {quiz.description || "No description provided for this quiz."}
            </p>
          </div>
        </div>
      ))
      }
    </div >
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div className={`sidebar-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function AttemptHistory({ results }) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [selectedQuizStatusFilter, setSelectedQuizStatusFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [quizDetails, setQuizDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("mcq");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:8000/enrollments/my", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  const filteredQuizzes = results
    .filter(r => !selectedCourse || r.quiz?.course_id === parseInt(selectedCourse))
    .map(r => r.quiz)
    .filter((q, index, self) => q && self.findIndex(x => x.id === q.id) === index);

  const selectedResult = results.find(r => r.quiz_id === parseInt(selectedQuiz));

  useEffect(() => {
    if (selectedQuiz) {
      fetch(`http://127.0.0.1:8000/quizzes/${selectedQuiz}/questions`)
        .then(res => res.json())
        .then(data => setQuizDetails(data));
    } else {
      setQuizDetails(null);
    }
  }, [selectedQuiz]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Attempt History</h2>
          <p className="text-slate-500 mt-1">Review your previously submitted answers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filter by Course</label>
          <select
            className="input-field p-4 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
            value={selectedCourse}
            onChange={(e) => { setSelectedCourse(e.target.value); setSelectedQuiz(""); }}
          >
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Quiz Attempt</label>
          <select
            className="input-field p-4 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            disabled={!selectedCourse && filteredQuizzes.length === 0}
          >
            <option value="">Select a Quiz</option>
            {filteredQuizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
        </div>
      </div>

      {selectedResult && quizDetails ? (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Performance Summary</span>
              <h3 className="text-2xl font-black mt-1">{selectedResult.quiz?.title}</h3>
              <p className="text-white/80 text-sm mt-2 flex items-center gap-2">
                <CheckCircle size={16} /> Completed on {new Date(selectedResult.completed_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center border border-white/10">
                <p className="text-4xl font-black">{selectedResult.score}</p>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mt-1">Your Score</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center border border-white/10">
                <p className="text-4xl font-black text-white/40">{selectedResult.total_marks}</p>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mt-1">Total Marks</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit self-center border border-slate-200 dark:border-slate-700">
            {["mcq", "true_false", "description"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === type
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
              >
                {type === "true_false" ? "T/F" : type}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {quizDetails
              .filter(q => q.question_type === activeTab)
              .map((q, idx) => {
                const studentAns = selectedResult.answers?.[String(q.id)];
                const normalize = (val) => (val || "").toString().toLowerCase().trim();
                const isCorrect = normalize(studentAns) === normalize(q.correct_option);
                const feedback = selectedResult.feedback?.[q.id];

                return (
                  <div key={q.id} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-slate-100 dark:bg-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Question {idx + 1}</span>
                      {activeTab !== "description" && (
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${!studentAns
                          ? "bg-slate-100 dark:bg-slate-700 text-slate-500"
                          : isCorrect
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                          }`}>
                          {!studentAns ? "Not Answered" : isCorrect ? `+${q.point_value || 1} Points` : "Wrong"}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">{q.text}</h4>

                    {activeTab === "description" ? (
                      <div className="flex flex-col gap-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Your Answer</p>
                          <p className={`font-medium whitespace-pre-wrap leading-relaxed ${studentAns ? "text-slate-700 dark:text-slate-300" : "text-slate-400 italic"}`}>
                            {studentAns || "Not Answered"}
                          </p>
                        </div>
                        {feedback && (
                          <div className="bg-indigo-50 dark:bg-indigo-500/5 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-500/20">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Teacher Feedback</p>
                              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Awarded: {feedback.score} Marks</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 italic font-medium">"{feedback.comment}"</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["a", "b", "c", "d"].map((opt) => {
                          if (activeTab === "true_false" && (opt === "c" || opt === "d")) return null;
                          const optText = q[`option_${opt}`];
                          const isStudentSelected = normalize(studentAns) === normalize(opt);
                          const isCorrectOpt = normalize(q.correct_option) === normalize(opt);
                          const isNotAnswered = !studentAns;

                          // Styling Logic:
                          // If Not Answered -> Neutral
                          // If Answered:
                          //   - Correct Option -> Green
                          //   - Selected (if Wrong) -> Red
                          //   - Others -> Neutral

                          let cardClass = "bg-transparent border-slate-100 dark:border-slate-700 text-slate-500 opacity-60";
                          let iconClass = "bg-slate-100 dark:bg-slate-700";

                          if (!isNotAnswered) {
                            if (isCorrectOpt) {
                              cardClass = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
                              iconClass = "bg-green-500 text-white";
                            } else if (isStudentSelected) {
                              cardClass = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
                              iconClass = "bg-red-500 text-white";
                            }
                          }

                          return (
                            <div
                              key={opt}
                              className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${cardClass}`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black uppercase ${iconClass}`}>
                                {opt}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold">{optText}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ) : selectedQuiz ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading attempt details...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-slate-100/50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-slate-400">
            <Search size={32} />
          </div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-center">Select a course and quiz to view your history</p>
        </div>
      )}
    </div>
  );
}

function QuizSession({ quiz, questions, onFinish }) {
  const storageKey = `quiz_progress_${quiz.id}`;

  // Multi-tab Prevention
  const [isMultiTab, setIsMultiTab] = useState(false);

  // State initialization with Auto-save recovery
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) { console.error("Recovery error", e); }
    return { currentIndex: 0, answers: {}, violations: 0, timeLeft: quiz.duration * 60 };
  };

  const initialState = getInitialState();
  const [currentIndex, setCurrentIndex] = useState(initialState.currentIndex);
  const [answers, setAnswers] = useState(initialState.answers);
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);
  const [violations, setViolations] = useState(initialState.violations);
  const [viewMode, setViewMode] = useState("list"); // Forced to 'list' as per user request
  const [violationTimeline, setViolationTimeline] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTime, setAlertTime] = useState(3);
  const [isLowLight, setIsLowLight] = useState(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState("Initializing...");
  const alertsRef = useRef(0);
  const answersRef = useRef({});
  const timelineRef = useRef([]);
  const timeLeftRef = useRef(quiz.duration * 60);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const alertIntervalRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  // Sync Refs with State to avoid stale closures
  useEffect(() => {
    answersRef.current = answers;
    localStorage.setItem(storageKey, JSON.stringify({
      currentIndex,
      answers,
      violations,
      timeLeft: timeLeftRef.current
    }));
  }, [answers, violations, currentIndex]);
  useEffect(() => { alertsRef.current = violations; }, [violations]);
  useEffect(() => { timelineRef.current = violationTimeline; }, [violationTimeline]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  // Camera Access & Models Loading
  useEffect(() => {
    let currentStream = null;

    let fullscreenHandler = null;

    const loadModels = async () => {
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
      try {
        setFaceDetectionStatus("Loading Models...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setFaceDetectionStatus("Ready");
        startCamera();
      } catch (err) {
        console.error("Model load error", err);
        setFaceDetectionStatus("Error loading models");
      }
    };

    const startCamera = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            currentStream = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            startTracking();
          })
          .catch(err => {
            console.error("Camera access denied", err);
            setFaceDetectionStatus("Camera Denied");
          });
      }
    };

    // Fullscreen Enforcement
    if (quiz.fullscreen_required) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => console.error("Fullscreen error", err));
      }

      fullscreenHandler = () => {
        if (!document.fullscreenElement) {
          startAlert();
        }
      };
      document.addEventListener("fullscreenchange", fullscreenHandler);
    }

    loadModels();

    // Multi-tab Channel
    const bc = new BroadcastChannel(`quiz_lock_${quiz.id}`);
    bc.onmessage = (ev) => {
      if (ev.data === 'ping') {
        bc.postMessage('pong');
        setIsMultiTab(true);
      } else if (ev.data === 'pong') {
        setIsMultiTab(true);
      }
    };
    bc.postMessage('ping');

    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (fullscreenHandler) {
        document.removeEventListener("fullscreenchange", fullscreenHandler);
      }
      bc.close();
    };
  }, []);

  // Auto-save Effect
  useEffect(() => {
    const state = { currentIndex, answers, violations, timeLeft };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [currentIndex, answers, violations, timeLeft]);

  const startTracking = () => {
    trackingIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        // 1. Low Light Detection
        detectLowLight();

        // 2. Face/Eye Tracking
        detectFace();
      }
    }, 1000);
  };

  const detectLowLight = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = 40;
    canvasRef.current.height = 30;
    ctx.drawImage(videoRef.current, 0, 0, 40, 30);
    const imageData = ctx.getImageData(0, 0, 40, 30);
    const data = imageData.data;
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avg = brightness / (data.length / 4);
    setIsLowLight(avg < 40); // threshold
  };

  const detectFace = async () => {
    if (!videoRef.current || !faceapi) return;

    try {
      const detections = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (!detections) {
        setFaceDetectionStatus("Face Not Detected");
        startAlert("Face Not Detected");
        return;
      }

      const landmarks = detections.landmarks;
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const jaw = landmarks.getJawOutline();

      // --- Precise Yaw Calculation ---
      // Midpoint between eyes
      const eyeMidX = (leftEye[0].x + rightEye[5].x) / 2;
      const noseTipX = nose[6].x;
      const faceWidth = Math.abs(jaw[16].x - jaw[0].x);

      // Yaw calculation (estimation in degrees)
      const yaw = ((noseTipX - eyeMidX) / faceWidth) * 150; // 150 is a scaling factor

      // --- Precise Pitch Calculation ---
      const eyeMidY = (leftEye[0].y + rightEye[5].y) / 2;
      const noseTipY = nose[6].y;
      const faceHeight = Math.abs(jaw[8].y - eyeMidY);

      // Pitch calculation (estimation in degrees)
      // Normal state nose is below eye center. 
      // If looking up, nose gets closer to eye center (relative to face height)
      const pitch = ((noseTipY - eyeMidY) / faceHeight - 0.5) * 100;

      // Threshold Logic from USER Request:
      // Center: ~0 Yaw, ~0 Pitch
      // Left: +10 to +25 Yaw
      // Right: -10 to -25 Yaw
      // Top: -10 Pitch
      // Bottom: +10 Pitch
      // Not looking: > ±30 Yaw, > ±20 Pitch

      let isViolation = false;
      let reason = "";

      if (Math.abs(yaw) > 30) {
        isViolation = true;
        reason = "Looking Away (Yaw)";
      } else if (Math.abs(pitch) > 20) {
        isViolation = true;
        reason = "Looking Away (Pitch)";
      }

      if (isViolation) {
        setFaceDetectionStatus(reason);
        startAlert(reason);
      } else {
        setFaceDetectionStatus("Monitoring Active");
        stopAlert();
      }
    } catch (err) {
      console.error("Detection error", err);
    }
  };

  const addViolationLog = (reason) => {
    const log = {
      time: new Date().toLocaleTimeString(),
      reason: reason
    };
    setViolationTimeline(prev => [...prev, log]);
  };

  const startAlert = (reason = "General Detection") => {
    if (showAlertRef.current) return;
    setShowAlert(true);
    showAlertRef.current = true;
    setAlertTime(3);
    if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
    alertIntervalRef.current = setInterval(() => {
      setAlertTime(prev => {
        if (prev <= 1) {
          clearInterval(alertIntervalRef.current);
          alertIntervalRef.current = null;
          incrementViolations(reason);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopAlert = () => {
    setShowAlert(false);
    showAlertRef.current = false;
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
  };

  const incrementViolations = (reason) => {
    addViolationLog(reason);
    const newViolationCount = alertsRef.current + 1;
    setViolations(newViolationCount);

    const limit = quiz.violation_limit || 5;
    if (newViolationCount >= limit) {
      const finalTimeline = [...timelineRef.current, { time: new Date().toLocaleTimeString(), reason: `AUTO-SUBMIT: ${reason}` }];
      handleFinish(newViolationCount, finalTimeline);
    }
    setShowAlert(false);
    showAlertRef.current = false;
  };

  const showAlertRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || !document.hasFocus()) {
        startAlert("Tab Switch/Window Blur");
      } else {
        stopAlert();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish(violations);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleFinish = async (currentViolations = alertsRef.current, finalTimeline = timelineRef.current) => {
    let score = 0;
    const currentAnswers = answersRef.current;

    questions.forEach(q => {
      const studentAnswer = (currentAnswers[String(q.id)] || "").toString().toLowerCase().trim();
      const correctAnswer = (q.correct_option || "").toString().toLowerCase().trim();
      if (studentAnswer === correctAnswer && studentAnswer !== "") {
        score += q.point_value ?? 1;
      }
    });

    const result = {
      quiz_id: quiz.id,
      score: score,
      total_marks: questions.reduce((acc, q) => acc + (q.point_value || 1), 0),
      eye_tracking_violations: currentViolations,
      timeline: finalTimeline,
      answers: currentAnswers // Include answers so they are saved in DB
    };

    console.log("Submitting Result:", result);

    try {
      localStorage.removeItem(storageKey); // Clear auto-save on finish
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(result)
      });
      if (res.ok) {
        const savedResult = await res.json();
        onFinish(savedResult);
      } else {
        onFinish({ ...result, total_score: result.total_marks });
      }
    } catch (err) {
      console.error("Failed to submit results", err);
      onFinish({ ...result, total_score: result.total_marks });
    }
  };

  if (isMultiTab) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[1000] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl border border-red-500/20">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Multiple Tabs Detected</h2>
          <p className="text-slate-500 dark:text-gray-400 mb-8 leading-relaxed">
            You already have this quiz open in another tab. For security reasons, you can only have one active quiz session.
          </p>
          <button
            onClick={() => window.close()}
            className="w-full py-4 btn-primary text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            Close This Tab
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const [filterTab, setFilterTab] = useState("mcq");

  const filteredQuestions = questions.filter(q => {
    if (filterTab === "all") return true;
    return (q.question_type || "mcq") === filterTab;
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto relative">
      {/* Low Light Alert Overlay */}
      {isLowLight && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[400] bg-amber-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce">
          <Sun size={20} />
          <span className="font-bold">Low Light Detected! Please improve lighting.</span>
        </div>
      )}

      {/* Gaze Status Overlay */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full border border-slate-700 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${faceDetectionStatus === 'Monitoring Active' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-[10px] uppercase font-black tracking-widest">{faceDetectionStatus}</span>
        </div>
        {(quiz.fullscreen_required || quiz.tab_switch_detection) && (
          <div className="flex gap-2">
            {quiz.fullscreen_required && <span className="text-[8px] opacity-60 font-bold uppercase tracking-tighter">Fullscreen Required</span>}
            {quiz.tab_switch_detection && <span className="text-[8px] opacity-60 font-bold uppercase tracking-tighter">Tab Monitoring Active</span>}
          </div>
        )}
      </div>

      {/* Eye Tracking Alert Overlay */}
      {showAlert && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 sm:p-10">
          <div className="absolute inset-0 bg-red-950/40 backdrop-blur-md" />
          <div className="relative bg-white dark:bg-slate-900 border-4 border-red-500 rounded-[3rem] p-12 max-w-2xl w-full shadow-[0_0_100px_rgba(239,68,68,0.4)] text-center animate-bounce-slow">
            <div className="w-24 h-24 bg-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/20">
              <ShieldAlert size={48} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
              Eye Tracking Alert!
            </h2>
            <p className="text-lg text-slate-500 dark:text-gray-400 mb-8 font-medium">
              Your eyes were not detected on the screen. Please maintain focus to continue the quiz.
            </p>
            <div className="flex flex-col gap-4">
              <div className="bg-red-500 text-white py-4 rounded-2xl text-2xl font-black flex items-center justify-center gap-3">
                <Clock size={24} />
                Submitting in {alertTime}s
              </div>
              <div className="text-sm font-black uppercase tracking-widest text-red-500/60 flex items-center justify-center gap-2">
                <span>Violation Strike {violations + 1}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/20" />
                <span>Limit: {quiz.violation_limit || 5}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera View Sub-Window */}
      <div className="fixed bottom-8 right-8 w-60 h-44 bg-black rounded-3xl overflow-hidden border-2 border-indigo-500 shadow-2xl z-50">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${faceDetectionStatus === "Monitoring Active" ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
          <span className="text-[10px] font-black text-white uppercase tracking-tighter drop-shadow-md">
            {faceDetectionStatus}
          </span>
        </div>
        {isLowLight && <div className="absolute inset-0 bg-amber-500/20 pointer-events-none" />}
      </div>

      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${violations > 0 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
              {violations} Violations
            </span>
          </div>
          <p className="text-sm text-gray-400">{questions.length} Questions Total</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleFinish()}
            className="px-4 py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Submit Early
          </button>
          <div className="flex items-center gap-3 px-6 py-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 font-mono text-xl font-bold">
            <Clock size={20} />
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
        </div>
      </div>

      {/* Forced List View of all questions */}
      <div className="flex flex-col gap-6">
        <div className="bg-indigo-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-indigo-100 dark:border-slate-700 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">Answer All Questions</h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">Scroll down to review and submit your answers.</p>
          </div>
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            {[{ id: 'mcq', label: 'MCQ' }, { id: 'true_false', label: 'T/F' }, { id: 'description', label: 'Description' }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filterTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {filteredQuestions.map((q, idx) => {
            const qType = q.question_type || 'mcq';
            return (
              <div key={q.id || idx} id={`q-${q.id}`} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                    Question {idx + 1} • {q.point_value || 1} {q.point_value === 1 ? 'Point' : 'Points'}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-slate-100 mb-8 leading-relaxed">
                  {q.text}
                </h3>

                {qType === 'description' ? (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold uppercase text-slate-500">Your Answer</label>
                    <textarea
                      className="w-full input-field p-6 rounded-2xl h-40 resize-none font-medium text-lg leading-relaxed focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 shadow-inner"
                      placeholder="Type your detailed answer here..."
                      value={answers[String(q.id)] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [String(q.id)]: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 ${qType === 'true_false' ? 'md:grid-cols-2' : 'md:grid-cols-2'} gap-4`}>
                    {(qType === 'true_false' ? ['a', 'b'] : ['a', 'b', 'c', 'd']).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers(prev => ({ ...prev, [String(q.id)]: opt }))}
                        className={`p-5 rounded-2xl text-left transition-all border flex items-center gap-4 group/opt ${answers[String(q.id)] === opt
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase transition-colors ${answers[String(q.id)] === opt ? 'bg-white text-indigo-600' : 'bg-slate-800 text-slate-500 group-hover/opt:bg-slate-700'}`}>
                          {qType === 'true_false' ? (opt === 'a' ? 'T' : 'F') : opt}
                        </div>
                        <span className="font-medium">
                          {qType === 'true_false' ? (opt === 'a' ? 'True' : 'False') : q[`option_${opt}`]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <div className="mt-8 p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-center">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to finish?</h4>
            <p className="text-slate-400 text-sm mb-6">Please review all your answers before the final submission.</p>
            <button
              onClick={() => handleFinish()}
              className="btn-primary text-white px-12 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 mx-auto"
            >
              <CheckCircle size={20} />
              Final Quiz Submission
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center mt-4 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              const el = document.getElementById(`q-${questions[idx].id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setCurrentIndex(idx);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${idx === currentIndex
              ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-lg'
              : (answers[String(questions[idx].id)]
                ? 'bg-green-500/20 text-green-500 border-green-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400')
              }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, onClick }) {
  return (
    <div
      className={`stat-card ${onClick ? "cursor-pointer hover:border-indigo-500 transition-all" : ""}`}
      onClick={onClick}
    >
      <div className="flex flex-col">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-trend positive">{trend}</p>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}
