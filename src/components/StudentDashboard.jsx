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
  ArrowRight
} from "lucide-react";
import "./dashboard.css";
import { useTheme } from "../context/ThemeContext";

// Helper Component for Bar Chart
const BarChart = ({ data, labels, color }) => (
  <div className="flex items-end gap-2 h-40 w-full px-4">
    {data.map((val, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
        <div
          className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 relative"
          style={{ height: `${(val / (Math.max(...data, 1))) * 100}%`, backgroundColor: color }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {val}
          </div>
        </div>
        <span className="text-[10px] text-gray-500 font-bold uppercase truncate w-full text-center">{labels[i]}</span>
      </div>
    ))}
  </div>
);

// Helper Component for Line Chart
const MiniLineChart = ({ data, labels }) => (
  <div className="flex items-end gap-1 h-40 w-full px-4">
    {data.map((val, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
        <div
          className="w-full bg-indigo-500/20 rounded-t-sm relative border-t-2 border-indigo-400"
          style={{ height: `${(val / (Math.max(...data, 1))) * 100}%` }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {val}%
          </div>
        </div>
        <span className="text-[10px] text-gray-500 font-bold uppercase w-full text-center truncate">{labels[i]}</span>
      </div>
    ))}
  </div>
);

export default function StudentDashboard({ studentData, onLogout }) {
  const [activeTab, setActiveTab] = useState(localStorage.getItem("studentActiveTab") || "dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("studentActiveTab", activeTab);
  }, [activeTab]);
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizKey, setQuizKey] = useState("");
  const [activeQuizQuestions, setActiveQuizQuestions] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [results, setResults] = useState([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [enrollKey, setEnrollKey] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Fetch data from backend
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };

        const [allRes, myRes, resultsRes, notifRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/courses/all", { headers }),
          fetch("http://127.0.0.1:8000/enrollments/my", { headers }),
          fetch("http://127.0.0.1:8000/results/my", { headers }),
          fetch("http://127.0.0.1:8000/notifications", { headers })
        ]);

        if (allRes.ok) setCourses(await allRes.json());
        if (myRes.ok) setMyCourses(await myRes.json());
        if (resultsRes.ok) setResults(await resultsRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // POLLING: Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

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
          alert("Failed to load quiz content");
        }
      } else {
        const data = await valRes.json();
        alert(data.detail || "Invalid key or quiz not available");
      }
    } catch (err) {
      alert("Validation failed");
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
        alert("Enrolled successfully!");
        setShowEnrollModal(false);
        setEnrollKey("");
        // Refresh data
        const headers = { "Authorization": `Bearer ${token}` };
        const myRes = await fetch("http://127.0.0.1:8000/enrollments/my", { headers });
        const myData = await myRes.json();
        setMyCourses(myData);
        setActiveTab("my-courses");
      } else {
        const data = await res.json();
        alert(data.detail || "Enrollment failed");
      }
    } catch (err) {
      alert("Enrollment error");
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

      {/* Sidebar */}
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
        </nav>


        <div className="sidebar-footer">
          <SidebarItem
            icon={theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            label={theme === 'light' ? "Dark Mode" : "Light Mode"}
            onClick={toggleTheme}
          />
          <SidebarItem
            icon={<LogOut size={18} />}
            label="Logout"
            onClick={onLogout}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Header */}
        <div className="header">
          <div className="flex items-center gap-4">
            <button className="mobile-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl">Welcome back, {studentData.full_name || "Student"}</h1>
              <p className="header-subtitle mt-1">Ready for your next quiz?</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="p-3 btn-secondary rounded-xl relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {notifications.some(n => !n.is_read) ? <BellDot className="text-indigo-500" size={20} /> : <Bell size={20} />}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 dropdown-card rounded-2xl z-[300] overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <button className="text-xs text-indigo-500 hover:underline" onClick={() => setShowNotifications(false)}>Close</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition cursor-pointer ${!n.is_read ? 'bg-indigo-500/5' : ''}`}
                        onClick={() => handleMarkAsRead(n.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${n.type === 'quiz' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            {n.type}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{n.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{n.message}</p>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="hidden sm:block" onClick={() => setActiveTab("browse")}>Enroll New Course</button>
          </div>
        </div>

        {activeTab === "dashboard" && (() => {
          // Calculate dynamic data
          const totalAttempts = results.length;
          const passedQuizzes = results.filter(r => (r.score / r.total_marks) >= 0.4).length;
          const avgScore = totalAttempts > 0
            ? Math.round((results.reduce((acc, r) => acc + (r.score / r.total_marks), 0) / totalAttempts) * 100)
            : 0;

          // Pending Quizzes: Check all quizzes in enrolled courses not in results
          const attemptedQuizIds = new Set(results.map(r => r.quiz_id));
          let pendingCount = 0;
          myCourses.forEach(course => {
            if (course.quizzes) {
              course.quizzes.forEach(q => {
                if (!attemptedQuizIds.has(q.id)) pendingCount++;
              });
            }
          });

          // Overall Progress: Passed courses (at least one quiz passed) / Total enrolled
          // For simplicity, let's use: (courses with at least one attempt) / Total enrolled
          const attemptedCourseIds = new Set(results.map(r => r.quiz?.course_id));
          const progress = myCourses.length > 0
            ? Math.round((attemptedCourseIds.size / myCourses.length) * 100)
            : 0;

          // Weekly Productivity (Last 7 Days Attempts)
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const productivityData = [0, 0, 0, 0, 0, 0, 0];
          results.forEach(r => {
            const date = new Date(r.completed_at);
            const today = new Date();
            const diffTime = Math.abs(today - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) {
              productivityData[date.getDay()]++;
            }
          });

          // Quiz Scores (Last 5 attempts)
          const recentResults = results.slice(-5);
          const scoreData = recentResults.map(r => Math.round((r.score / r.total_marks) * 100));
          const scoreLabels = recentResults.map((_, i) => `Q${i + 1}`);

          return (
            <>
              {/* Stats */}
              <div className="stats-grid">
                <StatCard
                  title="Overall Progress"
                  value={`${progress}%`}
                  trend={`${attemptedCourseIds.size} Courses Started`}
                  icon={<TrendingUp size={24} />}
                />
                <StatCard
                  title="Active Courses"
                  value={myCourses.length}
                  trend="Enrolled"
                  icon={<Layers size={24} />}
                />
                <StatCard
                  title="Pending Quizzes"
                  value={pendingCount}
                  trend="To be attempted"
                  icon={<BookOpen size={24} />}
                />
                <StatCard
                  title="Average Score"
                  value={`${avgScore}%`}
                  trend={`${passedQuizzes} Passed`}
                  icon={<Award size={24} />}
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
                  <BarChart data={productivityData} labels={days} color="#6366f1" />
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

            {courses.length > 0 ? (
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
            {myCourses.map(course => (
              <div key={course.id} className="chart-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{course.title}</h3>
                  <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md font-mono">{course.course_code}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-3/4"></div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-indigo-400 font-medium">75% Complete</p>
                  <button
                    className="text-xs text-indigo-400 hover:underline"
                    onClick={() => setActiveTab("quizzes")}
                  >
                    View Quizzes
                  </button>
                </div>
              </div>
            ))}
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
            <h2 className="text-2xl font-bold">Upcoming & Active Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCourses.map(course => (
                <QuizGroup key={course.id} course={course} results={results} onTakeQuiz={(quiz) => { setSelectedQuiz(quiz); setShowKeyModal(true); }} />
              ))}
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
                          <h4 className="font-semibold text-white">{res.quiz?.title || `Quiz Attempt #${results.length - idx}`}</h4>
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
                <p className="text-3xl font-bold text-white">
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
      </main>

      {/* Enrollment Key Modal */}
      {showEnrollModal && (
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
      )}

      {/* Key Validation Modal */}
      {showKeyModal && (
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
      )}
    </div>
  );
}

function QuizGroup({ course, results, onTakeQuiz }) {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/courses/${course.id}/quizzes`)
      .then(res => res.json())
      .then(data => setQuizzes(data));
  }, [course.id]);

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
                <h4 className="font-bold text-white text-lg">{quiz.title}</h4>
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
  useEffect(() => { answersRef.current = answers; }, [answers]);
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

      // Analyze gaze/orientation (basic landmark analysis)
      const landmarks = detections.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const nose = landmarks.getNose();

      // Calculation for looking away (this is heuristic)
      const eyeDistance = Math.abs(rightEye[1].x - leftEye[1].x);
      const noseBridge = nose[0];
      const eyeCenter = (leftEye[0].x + rightEye[0].x) / 2;
      const noseOffset = Math.abs(noseBridge.x - eyeCenter);

      // Simple vertical check
      const eyeLevel = (leftEye[0].y + rightEye[0].y) / 2;
      const noseVerticalPos = (nose[3].y - eyeLevel) / eyeDistance;

      if (noseOffset > eyeDistance * 0.45) {
        setFaceDetectionStatus("Side Look Detected");
        startAlert("Looking Side");
      } else if (noseVerticalPos < 0.15 || noseVerticalPos > 0.6) {
        setFaceDetectionStatus("Up/Down Look Detected");
        startAlert("Looking Up/Down");
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

    if (newViolationCount >= 10) {
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
      const studentAnswer = (currentAnswers[q.id] || "").toString().toLowerCase().trim();
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
      timeline: finalTimeline
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
                <span>Limit: 10</span>
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
        <div className="bg-indigo-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-indigo-100 dark:border-slate-700 text-center mb-4">
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">Answer All Questions</h3>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">Scroll down to review and submit your answers.</p>
        </div>
        <div className="flex flex-col gap-6">
          {questions.map((q, idx) => (
            <div key={q.id || idx} id={`q-${q.id}`} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                  Question {idx + 1} • {q.point_value || 1} {q.point_value === 1 ? 'Point' : 'Points'}
                </span>
              </div>
              <h3 className="text-xl font-medium text-slate-100 mb-8 leading-relaxed">
                {q.text}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    className={`p-5 rounded-2xl text-left transition-all border flex items-center gap-4 group/opt ${answers[q.id] === opt
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase transition-colors ${answers[q.id] === opt ? 'bg-white text-indigo-600' : 'bg-slate-800 text-slate-500 group-hover/opt:bg-slate-700'}`}>
                      {opt}
                    </div>
                    <span className="font-medium">{q[`option_${opt}`]}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-8 p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-center">
            <h4 className="text-xl font-bold text-white mb-2">Ready to finish?</h4>
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
              : (answers[questions[idx].id]
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

function StatCard({ title, value, trend, icon }) {
  return (
    <div className="stat-card">
      <div className="flex flex-col">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-trend positive">{trend}</p>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}
