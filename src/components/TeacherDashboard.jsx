import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  BarChart3,
  Users,
  Layers,
  LogOut,
  PlusCircle,
  Plus,
  FileText,
  ArrowRight,
  UserCheck,
  User,
  Menu,
  X,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Calendar,
  Clock,
  Shield,
  Key,
  Database,
  CheckCircle,
  Pencil,
  Trash2,
  Search,
  Bell,
  BellDot,
  TrendingUp,
  Download,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Activity,
  Hash,
  Tag
} from "lucide-react";
import "./dashboard.css";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

// Helper Component for Bar Chart
// Helper Component for Bar Chart
const BarChart = ({ data, labels, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-40 w-full relative mb-6">
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
                {val} Results
              </div>
            )}
          </div>
          <span className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase truncate w-full text-center absolute -bottom-6">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// Helper Component for Line Chart
const MiniLineChart = ({ data, labels }) => {
  const max = Math.max(...data, 1);
  const padding = 10; // Padding inside SVG

  // Adjusted points to fit within padded viewBox
  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (100 - 2 * padding);
    const y = padding + (100 - 2 * padding) - (val / max) * (100 - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = points.length > 0 ? `M ${points[0]} L ${points.slice(1).join(' L ')}` : '';
  const areaD = points.length > 0 ? `${pathD} V 90 H ${padding} Z` : '';

  return (
    <div className="h-44 w-full flex flex-col relative">
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

          <path
            d={areaD}
            fill="url(#areaGradient)"
            className="transition-all duration-1000"
          />

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
                <circle
                  cx={cx}
                  cy={cy}
                  r="2"
                  fill="#4f46e5"
                  className="transition-all duration-300 cursor-pointer"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="transparent"
                  className="cursor-pointer"
                >
                  <title>{val} Attempts</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between px-2">
        {labels.map((l, i) => (
          <span key={i} className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{l}</span>
        ))}
      </div>
    </div>
  );
};

export default function TeacherDashboard({ teacherData, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCourse, setSelectedCourse] = useState(() => {
    const saved = localStorage.getItem("teacher_selectedCourse");
    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });
  const [selectedQuiz, setSelectedQuiz] = useState(() => {
    const saved = localStorage.getItem("teacher_selectedQuiz");
    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notifRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  // Removed localStorage persistence for activeTab
  const [myCourses, setMyCourses] = useState([]);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showEditQuiz, setShowEditQuiz] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [deleteCountdown, setDeleteCountdown] = useState(0);
  const [newQuestion, setNewQuestion] = useState({
    text: "", type: "mcq", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a", point_value: 1
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [expandedResultId, setExpandedResultId] = useState(null);

  const [newCourse, setNewCourse] = useState({
    title: "",
    course_code: "",
    subject: "",
    semester: "",
    batch: "",
    description: "",
    self_join_enabled: true,
    access_key: ""
  });
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [quizSearchQuery, setQuizSearchQuery] = useState("");
  const [myStudents, setMyStudents] = useState([]);
  const [studentCourseFilter, setStudentCourseFilter] = useState('all');
  const [quizCourseFilter, setQuizCourseFilter] = useState('all');
  const [allResults, setAllResults] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [bulkType, setBulkType] = useState(localStorage.getItem("teacher_bulkType") || 'mcq');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passNew, setPassNew] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [previousTab, setPreviousTab] = useState("dashboard");
  const [profilePic, setProfilePic] = useState(teacherData.profile_picture);
  const [leaveRequestFilter, setLeaveRequestFilter] = useState('pending');
  const [kickingStudentId, setKickingStudentId] = useState(null);
  const [kickCountdown, setKickCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (kickingStudentId && kickCountdown > 0) {
      timer = setInterval(() => {
        setKickCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [kickingStudentId, kickCountdown]);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/auth/profile-picture", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setProfilePic(data.url);
        toast.success("Profile picture updated!");
      } else {
        const error = await res.json();
        toast.error(error.detail || "Upload failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!profilePic) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/auth/profile-picture", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        setProfilePic(null);
        toast.success("Profile picture deleted!");
      } else {
        const error = await res.json();
        toast.error(error.detail || "Delete failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleKickStudent = async (courseId, studentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/teacher/courses/${courseId}/students/${studentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Student removed successfully");
        // We need a way to refresh student list
        const headers = { "Authorization": `Bearer ${token}` };
        const studentsRes = await fetch("http://127.0.0.1:8000/teacher/students", { headers });
        if (studentsRes.ok) {
          setMyStudents(await studentsRes.json());
        }
      } else {
        toast.error(data.detail || "Action failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const [leaveRequests, setLeaveRequests] = useState([]);
  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/teacher/leave-requests", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setLeaveRequests(await res.json());
      }
    } catch (err) { console.error(err); }
  };

  const handleProcessLeaveRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/leave-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Request ${status}ed successfully!`);
        fetchLeaveRequests();
        fetchMyStudents(); // Refresh student list as well
      } else {
        const error = await res.json();
        toast.error(error.detail || "Action failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  useEffect(() => {
    localStorage.setItem("teacher_selectedCourse", JSON.stringify(selectedCourse));
  }, [selectedCourse]);

  useEffect(() => {
    localStorage.setItem("teacher_selectedQuiz", JSON.stringify(selectedQuiz));
  }, [selectedQuiz]);

  useEffect(() => {
    localStorage.setItem("teacher_bulkType", bulkType);
  }, [bulkType]);
  // Result Review and Grading
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingModalQuestions, setGradingModalQuestions] = useState([]); // Questions for the currently reviewed attempt

  useEffect(() => {
    if (selectedAttempt && showGradingModal) {
      // Fetch questions specifically for this attempt to ensure we have the full list
      const token = localStorage.getItem("token");
      fetch(`http://127.0.0.1:8000/quizzes/${selectedAttempt.quiz_id}/questions`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setGradingModalQuestions(data))
        .catch(err => console.error("Error fetching questions for grading", err));
    } else {
      setGradingModalQuestions([]);
    }
  }, [selectedAttempt, showGradingModal]);

  // New: active tab for answers in grading modal
  const [gradingAnswerTab, setGradingAnswerTab] = useState("all");
  useEffect(() => { if (selectedAttempt) setGradingAnswerTab("all"); }, [selectedAttempt]);

  // Hierarchical Result Navigation
  const [gradingFlow, setGradingFlow] = useState('COURSES'); // COURSES, QUIZZES, RESULTS
  const [gradingCourse, setGradingCourse] = useState(null);
  const [gradingQuiz, setGradingQuiz] = useState(null);
  const [gradingQuizzes, setGradingQuizzes] = useState([]);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/courses/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setMyCourses(data);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacher_selectedCourse");
    onLogout();
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseQuizzes(selectedCourse.id);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchMyCourses();
    fetchNotifications();
    fetchAllQuizzes();
    fetchAllResults();
    fetchMyStudents();

    // POLLING: Every 30 seconds
    const interval = setInterval(() => {
      fetchMyCourses();
      fetchNotifications();
      fetchAllQuizzes();
      fetchAllResults();
      fetchMyStudents();
      fetchLeaveRequests();
    }, 30000);
    fetchLeaveRequests();
    return () => clearInterval(interval);
  }, []);

  const fetchAllQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      // CHANGED: Fetch my created quizzes instead of all public ones
      const res = await fetch("http://127.0.0.1:8000/quizzes/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllQuizzes(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchMyStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/teacher/students", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setMyStudents(await res.json());
      }
    } catch (err) { console.error(err); }
  };

  const fetchAllResults = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/results/teacher/all", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setAllResults(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    let timer;
    if (deleteCountdown > 0) {
      timer = setInterval(() => {
        setDeleteCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [deleteCountdown]);

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

  useEffect(() => {
    if (activeTab === "course-detail" && selectedCourse) {
      fetchCourseQuizzes(selectedCourse.id);
    }
  }, [activeTab, selectedCourse]);

  const fetchCourseQuizzes = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/courses/${courseId}/quizzes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourseQuizzes(data);
      } else {
        console.error("Failed to fetch quizzes");
      }
    } catch (err) {
      console.error("Failed to fetch quizzes", err);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newCourse)
      });
      if (res.ok) {
        toast.success("Course created successfully!");
        setShowCreateCourse(false);
        setNewCourse({
          title: "",
          course_code: "",
          subject: "",
          semester: "",
          batch: "",
          description: "",
          self_join_enabled: true
        });
        fetchMyCourses();
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.detail || "Failed to create course. Please check your inputs.";
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Course creation error:", err);
      toast.error("Network error: Failed to connect to server.");
    }
  };

  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    duration: 30,
    deadline: "",
    passing_marks: 40,
    total_marks: 100,
    access_key: "",
    attempts_count: 1,
    shuffle_questions: false,
    eye_tracking_enabled: false,
    fullscreen_required: false,
    tab_switch_detection: false,
    violation_limit: 5,
    status: "draft"
  });

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const token = localStorage.getItem("token");
      const quizData = { ...newQuiz, course_id: selectedCourse.id };
      // Clean up empty strings for optional fields
      if (!quizData.deadline) delete quizData.deadline;
      if (!quizData.start_time) delete quizData.start_time;
      if (!quizData.end_time) delete quizData.end_time;

      const res = await fetch("http://127.0.0.1:8000/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });

      if (res.ok) {
        const createdQuiz = await res.json();
        toast.success("Quiz created successfully! Now add some questions.");
        setShowCreateQuiz(false);
        setNewQuiz({
          title: "",
          description: "",
          start_time: "",
          end_time: "",
          duration: 30,
          deadline: "",
          passing_marks: 40,
          total_marks: 100,
          access_key: "",
          attempts_count: 1,
          shuffle_questions: false,
          eye_tracking_enabled: false,
          fullscreen_required: false,
          tab_switch_detection: false,
          violation_limit: 5,
          status: "draft"
        });
        fetchCourseQuizzes(selectedCourse.id);

        // Auto-show add question
        setSelectedQuiz(createdQuiz);
        setActiveTab("question-management");
        setShowAddQuestion(true);
      } else {
        let errorMessage = "Failed to create quiz";
        try {
          const errorData = await res.json();
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n');
          }
        } catch (jsonErr) {
          errorMessage = `Server Error (Status ${res.status})`;
        }
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Quiz creation error:", err);
      toast.error("Network error: Failed to connect to server.");
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Format dates for backend
    const formattedQuiz = {
      ...editingQuiz,
      start_time: new Date(editingQuiz.start_time).toISOString(),
      end_time: new Date(editingQuiz.end_time).toISOString(),
      deadline: editingQuiz.deadline ? new Date(editingQuiz.deadline).toISOString() : null,
    };
    // Clean legacy fields
    delete formattedQuiz.max_questions;
    delete formattedQuiz.max_questions;
    // delete formattedQuiz.shuffle_questions; // Restored
    delete formattedQuiz.shuffle_options;

    try {
      const response = await fetch(`http://127.0.0.1:8000/quizzes/${editingQuiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedQuiz),
      });

      if (response.ok) {
        toast.success("Quiz updated successfully!");
        setShowEditQuiz(false);
        setEditingQuiz(null);
        fetchCourseQuizzes(selectedCourse.id);
      } else {
        const errorData = await response.json();
        toast.error("Error: " + (errorData.detail || "Failed to update quiz"));
      }
    } catch (err) {
      console.error("Error updating quiz:", err);
      toast.error("An error occurred while updating the quiz.");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm("Are you sure you want to delete this entire quiz? All questions and results will be lost.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/quizzes/${quizId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Quiz deleted successfully!");
        fetchCourseQuizzes(selectedCourse.id);
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || "Failed to delete quiz"}`);
      }
    } catch (err) {
      console.error("Delete quiz error:", err);
    }
  };

  const handleAddQuestion = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newQuestion,
          quiz_id: selectedQuiz.id,
          question_type: newQuestion.question_type || newQuestion.type || 'mcq'
        })
      });
      if (res.ok) {
        toast.success("Question added successfully!");
        setRefreshKey(prev => prev + 1);
        setShowAddQuestion(false);
        setNewQuestion({
          text: "", question_type: "mcq", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "", point_value: 1
        });
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || "Failed to add question"}`);
      }
    } catch (err) {
      console.error("Add question error:", err);
      toast.error("Network error: Failed to connect to server.");
    }
  };

  const handleUpdateQuestion = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editingQuestion)
      });
      if (res.ok) {
        toast.success("Question updated successfully!");
        setRefreshKey(prev => prev + 1);
        setShowEditQuestion(false);
        setEditingQuestion(null);
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || "Failed to update question"}`);
      }
    } catch (err) {
      console.error("Update question error:", err);
      toast.error("Network error: Failed to connect to server.");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/questions/${questionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Question deleted!");
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || "Failed to delete question"}`);
      }
    } catch (err) {
      console.error("Delete question error:", err);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(selectedCourse)
      });
      if (res.ok) {
        toast.success("Course updated!");
        setShowEditCourse(false);
        fetchMyCourses();
      }
    } catch (err) {
      toast.error("Failed to update course");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/courses/${courseId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Course deleted successfully!");
        setDeleteCourseId(null);
        setDeleteCountdown(0);
        fetchMyCourses();
        if (selectedCourse?.id === courseId) {
          setActiveTab("courses");
          setSelectedCourse(null);
        }
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || "Failed to delete course"}`);
      }
    } catch (err) {
      console.error("Delete course error:", err);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let json = JSON.parse(event.target.result);

        // Handle cases where JSON is wrapped in a 'questions' key
        let questions = Array.isArray(json) ? json : (json.questions && Array.isArray(json.questions) ? json.questions : null);

        if (!questions) {
          toast.error("Invalid JSON format. Expected an array or object with 'questions' array.");
          return;
        }

        // Map various possible field names to our backend schema
        const mappedQuestions = questions.map(q => {
          let type = (q.type || q.question_type || "mcq").toLowerCase().trim();
          if (!['mcq', 'true_false', 'description'].includes(type)) type = "mcq";

          // Robustly get the correct option (handle case, trim, fallback)
          let correct = (q.correct_option || q.correct_answer || q.answer || "").toString().toLowerCase().trim();

          let optA = (q.option_a || q.optionA || (q.options && (q.options.a || q.options.A)) || "").toString().trim();
          let optB = (q.option_b || q.optionB || (q.options && (q.options.b || q.options.B)) || "").toString().trim();
          let optC = (q.option_c || q.optionC || (q.options && (q.options.c || q.options.C)) || "").toString().trim();
          let optD = (q.option_d || q.optionD || (q.options && (q.options.d || q.options.D)) || "").toString().trim();

          if (type === 'true_false') {
            optA = "True";
            optB = "False";
            optC = "";
            optD = "";
            // Ensure correct answer is mapped to 'a' (true) or 'b' (false)
            if (correct === 'true' || correct === 't') correct = 'a';
            if (correct === 'false' || correct === 'f') correct = 'b';
          } else if (type === 'description') {
            optA = "";
            optB = "";
            optC = "";
            optD = "";
            correct = "";
          } else {
            // MCQ logic
            if (correct.includes("option ")) correct = correct.replace("option ", "");
            if (correct.length > 1 && ["a", "b", "c", "d"].includes(correct[0])) correct = correct[0];
          }

          return {
            text: (q.text || q.question || q.Question || "").toString().trim(),
            option_a: optA,
            option_b: optB,
            option_c: optC,
            option_d: optD,
            correct_option: ["a", "b", "c", "d"].includes(correct) ? correct : "a",
            point_value: parseInt(q.point_value || q.marks || q.points) || 1,
            question_type: type
          };
        });

        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8000/quizzes/${selectedQuiz.id}/questions/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(mappedQuestions)
        });
        if (res.ok) {
          toast.success("Bulk upload successful!");
          setRefreshKey(prev => prev + 1);
        } else {
          const error = await res.json();
          let msg = "Failed to upload questions.";
          if (error.detail) {
            if (Array.isArray(error.detail)) {
              msg += " Validation errors: " + error.detail.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(", ");
            } else {
              msg += " Error: " + error.detail;
            }
          }
          toast(msg);
        }
      } catch (err) {
        console.error("JSON parsing error:", err);
        toast.error("Invalid JSON format");
      }
    };
    reader.readAsText(file);
  };

  const handleCSVBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result;
        const lines = csvText.split(/\r?\n/);
        const questions = [];

        // Simple CSV parser: first line is header if it contains 'text'
        const startIdx = lines[0] && lines[0].toLowerCase().includes('text') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split by comma, trimming each part
          const parts = line.split(',').map(p => p.trim());
          if (parts.length < 6) {
            console.warn(`Skipping CSV line ${i + 1} due to insufficient parts:`, line);
            continue;
          }

          questions.push({
            text: parts[0],
            option_a: parts[1],
            option_b: parts[2],
            option_c: parts[3],
            option_d: parts[4],
            correct_option: parts[5].toLowerCase(),
            point_value: parseInt(parts[6]) || 1
          });
        }
        console.log("Parsed questions from CSV:", questions);

        if (questions.length === 0) {
          toast.error("No questions found in CSV. Format: text,option_a,option_b,option_c,option_d,correct_option,point_value");
          return;
        }

        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8000/quizzes/${selectedQuiz.id}/questions/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(questions)
        });

        if (res.ok) {
          const data = await res.json();
          toast(data.message || `Successfully uploaded ${questions.length} questions!`);
          setRefreshKey(prev => prev + 1);
        } else {
          const error = await res.json();
          let msg = "Failed to upload questions.";
          if (error.detail) {
            if (Array.isArray(error.detail)) {
              msg += " Validation errors: " + error.detail.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(", ");
            } else {
              msg += " Error: " + error.detail;
            }
          }
          toast(msg);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error parsing CSV file. Ensure it follows the format: text,option_a,option_b,option_c,option_d,correct_option,point_value");
      }
    };
    reader.readAsText(file);
  };
  const handleTxtBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        const questions = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split by | trimming each part
          const parts = line.split('|').map(p => p.trim());

          if (bulkType === 'true_false') {
            if (parts.length < 3) {
              console.warn(`Skipping T/F line ${i + 1}: Insufficient parts`, line);
              continue;
            }
            let correct = parts[1].toLowerCase();
            if (correct === 'true' || correct === 't') correct = 'a';
            else if (correct === 'false' || correct === 'f') correct = 'b';
            else correct = 'a'; // default

            questions.push({
              text: parts[0],
              question_type: 'true_false',
              option_a: 'True',
              option_b: 'False',
              option_c: '',
              option_d: '',
              correct_option: correct,
              point_value: parseInt(parts[2]) || 1
            });

          } else if (bulkType === 'description') {
            if (parts.length < 2) {
              console.warn(`Skipping Desc line ${i + 1}: Insufficient parts`, line);
              continue;
            }
            questions.push({
              text: parts[0],
              question_type: 'description',
              option_a: '',
              option_b: '',
              option_c: '',
              option_d: '',
              correct_option: '',
              point_value: parseInt(parts[1]) || 1
            });

          } else {
            // MCQ (Default, matches 'mcq')
            if (parts.length < 6) {
              console.warn(`Skipping MCQ line ${i + 1} due to insufficient parts:`, line);
              continue;
            }
            questions.push({
              text: parts[0],
              question_type: 'mcq',
              option_a: parts[1],
              option_b: parts[2],
              option_c: parts[3],
              option_d: parts[4],
              correct_option: (parts[5] || 'a').toString().toLowerCase(),
              point_value: parseInt(parts[6]) || 1
            });
          }
        }
        console.log("Parsed questions from TXT (" + bulkType + "):", questions);

        if (questions.length === 0) {
          let format = "Question | A | B | C | D | CorrectLetter | Points";
          if (bulkType === 'true_false') format = "Question | True/False | Points";
          if (bulkType === 'description') format = "Question | Points";

          toast.error(`UPLOAD FAILED: No valid questions found.\n\nYou selected '${bulkType.toUpperCase()}' format. Ensure your file matches this format:\n\n${format}`);
          return;
        }

        if (!selectedQuiz || !selectedQuiz.id) {
          toast.error("Error: No quiz selected. Please select a quiz before uploading.");
          return;
        }

        const token = localStorage.getItem("token");
        const url = `http://127.0.0.1:8000/quizzes/${selectedQuiz.id}/questions/bulk`;
        console.log("Bulk Upload Start:", { url, count: questions.length, bulkType });

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(questions)
        });

        if (res.ok) {
          toast.success(`SUCCESS: Uploaded ${questions.length} questions successfully!`);
          setRefreshKey(prev => prev + 1);
        } else {
          let errorDetail = "";
          try {
            const error = await res.json();
            errorDetail = Array.isArray(error.detail) ? error.detail.map(d => d.msg).join(", ") : error.detail;
          } catch (e) {
            errorDetail = await res.text() || "Unknown server error (non-JSON response)";
          }
          toast.error(`UPLOAD FAILED (Status ${res.status}):\n${errorDetail}`);
        }
      } catch (err) {
        console.error("Upload process error:", err);
        toast.error(`NETWORK ERROR: Failed to connect to server.\n\nDetails: ${err.message}\n\nPlease ensure the backend is running at http://127.0.0.1:8000`);
      }
    };
    reader.readAsText(file);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="dashboard">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[90] md:hidden" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="sidebar-title mb-0">Quizi Pro</h2>
          <button className="md:hidden text-gray-400" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <SidebarItem
            icon={<Home size={18} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<Layers size={18} />}
            label="My Courses"
            active={activeTab === "courses"}
            onClick={() => { setActiveTab("courses"); setIsSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<Users size={18} />}
            label="Students"
            active={activeTab === "students"}
            onClick={() => { setActiveTab("students"); setIsSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<ShieldAlert size={18} />}
            label="Leave Requests"
            active={activeTab === "leave-requests"}
            onClick={() => { setActiveTab("leave-requests"); setIsSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<FileText size={18} />}
            label="Quizzes"
            active={activeTab === "all-quizzes"}
            onClick={() => { setActiveTab("all-quizzes"); setIsSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<CheckCircle size={18} />}
            label="Check Answer"
            active={activeTab === "quiz-results"}
            onClick={() => {
              setActiveTab("quiz-results");
              setGradingFlow('COURSES');
              setGradingCourse(null);
              setGradingQuiz(null);
              setIsSidebarOpen(false);
            }}
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
            icon={<User size={18} />}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => {
              if (activeTab !== "profile") setPreviousTab(activeTab);
              setActiveTab("profile");
              setIsSidebarOpen(false);
            }}
          />
          <SidebarItem icon={<LogOut size={18} />} label="Logout" onClick={handleLogout} />
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
              <h1 className="text-xl md:text-3xl">Hello, {teacherData.full_name || "Instructor"}</h1>
              <p className="header-subtitle mt-1">Manage your courses and evaluate students</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block btn-primary px-4 py-2 rounded-lg transition text-sm font-bold shadow-lg shadow-indigo-500/20 whitespace-nowrap" onClick={() => setShowCreateCourse(true)}>
              <span className="inline-flex items-center gap-2">
                <PlusCircle size={16} />
                <span className="leading-none">Create Course</span>
              </span>
            </button>
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                className="p-3 btn-secondary rounded-xl relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {notifications.some(n => !n.is_read) ? (
                  <>
                    <BellDot className="text-indigo-500" size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                  </>
                ) : <Bell size={20} />}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 dropdown-card rounded-2xl z-[300] overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <button className="text-xs text-indigo-500 hover:underline" onClick={() => setShowNotifications(false)}>Close</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className="relative group overflow-hidden border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                        {/* Swipe Container */}
                        <div className="flex transition-transform duration-300 ease-out hover:-translate-x-16">
                          <div
                            className={`flex-1 p-4 cursor-pointer ${!n.is_read ? 'bg-indigo-500/5' : 'bg-white dark:bg-slate-800'}`}
                            onClick={() => handleMarkAsRead(n.id)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${n.type === 'quiz' ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                                {n.type}
                              </span>
                              <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{n.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">{n.message}</p>
                          </div>
                          {/* Delete Button (revealed on hover/swipe) */}
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

        {/* Content Area - Scrollable */}
        <div className="content-area">

          {activeTab === "overview" && (() => {
            // Calculate dynamic data for charts
            const last7Days = [...Array(7)].map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            }).reverse();

            const engagementData = last7Days.map(date =>
              allResults.filter(r => {
                if (!r.completed_at) return false;
                const d = new Date(r.completed_at);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}` === date;
              }).length
            );
            const engagementLabels = last7Days.map(date => {
              const d = new Date(date);
              return d.toLocaleDateString('en-US', { weekday: 'short' });
            });

            const gradeBuckets = [
              { label: '0-20%', min: 0, max: 0.2 },
              { label: '21-40%', min: 0.2, max: 0.4 },
              { label: '41-60%', min: 0.4, max: 0.6 },
              { label: '61-80%', min: 0.6, max: 0.8 },
              { label: '81-100%', min: 0.8, max: 1.1 },
            ];

            const distributionData = gradeBuckets.map(bucket =>
              allResults.filter(r => {
                const ratio = r.score / r.total_marks;
                return ratio >= bucket.min && ratio < bucket.max;
              }).length
            );
            const distributionLabels = gradeBuckets.map(b => b.label);

            return (
              <>
                <div className="stats-grid">
                  <StatCard
                    title="Total Students"
                    value={new Set(allResults.map(r => r.student_id)).size}
                    trend="Unique enrolled"
                    icon={<Users size={24} />}
                    onClick={() => setActiveTab("students")}
                  />
                  <StatCard
                    title="Live Courses"
                    value={myCourses.length}
                    trend="Active"
                    icon={<Layers size={24} />}
                    onClick={() => setActiveTab("courses")}
                  />
                  <StatCard
                    title="Quizzes Held"
                    value={allResults.length}
                    trend="Total attempts"
                    icon={<FileText size={24} />}
                    onClick={() => setActiveTab("all-quizzes")}
                  />
                  <StatCard
                    title="Avg. Score"
                    value={allResults.length > 0
                      ? `${(allResults.reduce((acc, r) => acc + (r.score / r.total_marks), 0) / allResults.length * 100).toFixed(1)}%`
                      : "0%"
                    }
                    trend="Class performance"
                    icon={<UserCheck size={24} />}
                    onClick={() => setActiveTab("quiz-results")}
                  />
                </div>

                <div className="charts">
                  <div className="chart-card">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="chart-title mb-0">Class Engagement</h2>
                        <p className="text-xs text-slate-500">Quiz attempts in the last 7 days</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Attempts</span>
                      </div>
                    </div>
                    <MiniLineChart data={engagementData} labels={engagementLabels} />
                  </div>
                  <div className="chart-card">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="chart-title mb-0">Grade Distribution</h2>
                        <p className="text-xs text-slate-500">Score ranges across all results</p>
                      </div>
                    </div>
                    <BarChart data={distributionData} labels={distributionLabels} color="#10b981" />
                  </div>
                </div>
              </>
            );
          })()}

          {activeTab === "courses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(course => (
                <div
                  key={course.id}
                  className="chart-card flex flex-col justify-between cursor-pointer hover:border-indigo-500/50 transition-all active:scale-[0.98]"
                  onClick={() => { setSelectedCourse(course); setActiveTab("course-detail"); }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{course.title}</h3>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md font-mono">{course.course_code}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter">{course.quiz_count || 0} Quizzes</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Database size={12} /> {course.subject} • {course.semester}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 btn-primary py-2 rounded-lg text-sm transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourse(course);
                        setActiveTab("course-detail");
                      }}
                    >
                      Manage
                    </button>
                    <button
                      className="flex-1 bg-pink-600/20 text-pink-400 border border-pink-600/30 py-2 rounded-lg text-sm hover:bg-pink-600 hover:text-white transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (deleteCourseId === course.id) {
                          handleDeleteCourse(course.id);
                        } else {
                          setDeleteCourseId(course.id);
                          setDeleteCountdown(5);
                        }
                      }}
                    >
                      {deleteCourseId === course.id ? (
                        deleteCountdown > 0 ? `Wait ${deleteCountdown}s...` : "Confirm Delete"
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <div
                className="chart-card border-dashed border-2 border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition group"
                onClick={() => setShowCreateCourse(true)}
              >
                <PlusCircle size={48} className="text-gray-600 group-hover:text-indigo-500 mb-2" />
                <p className="text-gray-500 group-hover:text-indigo-400 font-medium">Create New Course</p>
              </div>
            </div>
          )}

          {activeTab === "course-detail" && selectedCourse && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-end">
                <div>
                  <button
                    className="text-indigo-400 text-sm mb-2 hover:underline flex items-center gap-1"
                    onClick={() => setActiveTab("courses")}
                  >
                    ← Back to Courses
                  </button>
                  <h2 className="text-3xl font-bold">{selectedCourse.title}</h2>
                  <p className="text-gray-400">{selectedCourse.course_code} • {selectedCourse.subject}</p>
                </div>
                <button
                  className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20"
                  onClick={() => setShowCreateQuiz(true)}
                >
                  <PlusCircle size={18} />
                  Create New Quiz
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FileText size={20} className="text-indigo-400" />
                    Active Quizzes
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {courseQuizzes.map(quiz => (
                      <div key={quiz.id} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex justify-between items-center group hover:border-indigo-500 transition shadow-sm dark:shadow-none">
                        <div className="flex gap-4 items-center">
                          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{quiz.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400 mt-1">
                              <span className="flex items-center gap-1"><Clock size={12} /> {quiz.duration}m</span>
                              <span className="flex items-center gap-1"><Key size={12} /> {quiz.access_key}</span>
                              <span className={`px-2 py-0.5 rounded-full ${quiz.status === 'published' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-gray-300'}`}>
                                {quiz.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/20 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 hover:text-white transition"
                            onClick={() => { setSelectedQuiz(quiz); setActiveTab("question-management"); }}
                          >
                            Questions
                          </button>
                          <div className="flex gap-2">
                            <button
                              className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition"
                              onClick={() => {
                                const start = new Date(quiz.start_time).toISOString().slice(0, 16);
                                const end = new Date(quiz.end_time).toISOString().slice(0, 16);
                                const deadline = quiz.deadline ? new Date(quiz.deadline).toISOString().slice(0, 16) : "";
                                setEditingQuiz({ ...quiz, start_time: start, end_time: end, deadline: deadline });
                                setShowEditQuiz(true);
                              }}
                              title="Edit Quiz"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              className="bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg px-3 py-2 transition"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this quiz? This will also remove all its questions and results.")) {
                                  handleDeleteQuiz(quiz.id);
                                }
                              }}
                              title="Delete Quiz"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {courseQuizzes.length === 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                        <FileText size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                        <p className="text-slate-500 font-medium">No quizzes created yet for this course.</p>
                        <button
                          className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                          onClick={() => setShowCreateQuiz(true)}
                        >
                          Create your first quiz
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Shield size={20} className="text-indigo-400" />
                    Course Settings
                  </h3>
                  <div className="chart-card flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Allow Self-Join</span>
                      <input type="checkbox" checked={selectedCourse.self_join_enabled} readOnly className="w-4 h-4 rounded text-indigo-600" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Semester</span>
                      <span className="text-sm text-gray-400">{selectedCourse.semester}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Batch</span>
                      <span className="text-sm text-gray-400">{selectedCourse.batch}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Course Access Key</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Required for Student Enrollment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg font-black tracking-widest border border-indigo-500/20">
                          {selectedCourse.access_key || "NONE"}
                        </code>
                        <Key size={14} className="text-indigo-400 opacity-40" />
                      </div>
                    </div>
                    <button className="w-full border border-slate-700 py-2 rounded-lg text-sm hover:bg-slate-800 transition mt-4" onClick={() => setShowEditCourse(true)}>
                      Edit Course Details
                    </button>
                    <button
                      className="w-full bg-pink-600/10 text-pink-400 border border-pink-600/20 py-2 rounded-lg text-sm hover:bg-pink-600 hover:text-white transition mt-2"
                      onClick={() => {
                        if (deleteCourseId === selectedCourse.id) {
                          handleDeleteCourse(selectedCourse.id);
                        } else {
                          setDeleteCourseId(selectedCourse.id);
                          setDeleteCountdown(5);
                        }
                      }}
                    >
                      {deleteCourseId === selectedCourse.id ? (
                        deleteCountdown > 0 ? `Wait ${deleteCountdown}s...` : "Confirm Delete Course"
                      ) : (
                        "Delete This Course"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "question-management" && selectedQuiz && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-end">
                <div>
                  <button
                    className="text-indigo-400 text-sm mb-2 hover:underline flex items-center gap-1"
                    onClick={() => setActiveTab("course-detail")}
                  >
                    ← Back to Course
                  </button>
                  <h2 className="text-3xl font-bold">Manage Questions</h2>
                  <p className="text-gray-400">{selectedQuiz.title} • {courseQuizzes.find(q => q.id === selectedQuiz.id)?.total_marks || 0} Total Marks</p>
                </div>
                <div className="flex gap-4 items-center">
                  {/* Styled Bulk Type Selector */}
                  <div className="btn-secondary flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer relative">
                    <span className="text-indigo-500 font-bold"><Database size={18} /></span>
                    <select
                      className="bg-transparent border-none text-sm font-bold cursor-pointer focus:ring-0 py-0 pr-8 -ml-1 text-slate-700 dark:text-slate-300"
                      value={bulkType}
                      onChange={(e) => setBulkType(e.target.value)}
                    >
                      <option value="mcq">Format: MCQ</option>
                      <option value="true_false">Format: T/F</option>
                      <option value="description">Format: Desc</option>
                    </select>
                  </div>
                  <label className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">
                    <FileText size={18} className="text-indigo-500" />
                    TXT Upload
                    <input type="file" className="hidden" accept=".txt" onChange={handleTxtBulkUpload} />
                  </label>
                  <label className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">
                    <FileText size={18} className="text-indigo-500" />
                    CSV Upload
                    <input type="file" className="hidden" accept=".csv" onChange={handleCSVBulkUpload} />
                  </label>
                  <label className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">
                    <Database size={18} className="text-indigo-500" />
                    JSON Upload
                    <input type="file" className="hidden" accept=".json" onChange={handleBulkUpload} />
                  </label>
                  <div className="flex gap-3">
                    <a
                      href={`http://127.0.0.1:8000/quizzes/${selectedQuiz.id}/export`}
                      className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      <TrendingUp size={18} className="text-indigo-500" />
                      Export Stats
                    </a>
                    <a
                      href="/demo_questions.txt"
                      download="demo_questions.txt"
                      className="bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-500 flex items-center justify-center p-3 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                      title="Download Demo TXT Format"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                  <button className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20" onClick={() => setShowAddQuestion(true)}>
                    <Plus size={18} />
                    Add Question
                  </button>
                </div>
              </div>

              <QuestionList
                quizId={selectedQuiz.id}
                refreshKey={refreshKey}
                onEdit={(q) => {
                  setEditingQuestion(q);
                  setShowEditQuestion(true);
                }}
                onDelete={handleDeleteQuestion}
              />
            </div>
          )}

          {activeTab === "quiz-results" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20">
                <div>
                  <h2 className="text-2xl font-black mb-1">Check Answer</h2>
                  <p className="text-slate-500 text-sm">Select a course and quiz to review student performance</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Course</label>
                    <select
                      className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-slate-200 min-w-[200px]"
                      value={gradingCourse?.id || ""}
                      onChange={async (e) => {
                        const courseId = e.target.value;
                        if (!courseId) {
                          // All courses selected
                          setGradingCourse(null);
                          setGradingQuiz(null);
                          // show all quizzes
                          setGradingQuizzes(allQuizzes || []);
                          return;
                        }

                        const course = myCourses.find(c => c.id === parseInt(courseId));
                        setGradingCourse(course);
                        setGradingQuiz(null);
                        if (course) {
                          try {
                            const res = await fetch(`http://127.0.0.1:8000/courses/${course.id}/quizzes`);
                            if (res.ok) setGradingQuizzes(await res.json());
                            else setGradingQuizzes([]);
                          } catch (err) {
                            console.error("Failed to fetch quizzes", err);
                            setGradingQuizzes([]);
                          }
                        } else {
                          setGradingQuizzes([]);
                        }
                      }}
                    >
                      <option value="">All Courses</option>
                      {myCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Quiz</label>
                    <select
                      className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-slate-200 min-w-[200px]"
                      value={gradingQuiz?.id || ""}
                      onChange={(e) => {
                        const quizId = e.target.value;
                        if (!quizId) {
                          setGradingQuiz(null);
                          return;
                        }
                        const source = (gradingQuizzes && gradingQuizzes.length > 0) ? gradingQuizzes : allQuizzes;
                        const quiz = source.find(q => q.id === parseInt(quizId));
                        setGradingQuiz(quiz);
                      }}
                    >
                      <option value="">All Quizzes</option>
                      {(gradingQuizzes && gradingQuizzes.length > 0 ? gradingQuizzes : allQuizzes).map(q => (
                        <option key={q.id} value={q.id}>{q.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-8">
                {/* Show results for selected quiz, or for selected course, or all results by default */}
                <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                        <th className="px-10 py-6 border-b border-slate-100 dark:border-slate-800">Student</th>
                        <th className="px-10 py-6 text-center border-b border-slate-100 dark:border-slate-800">Score</th>
                        <th className="px-10 py-6 text-center border-b border-slate-100 dark:border-slate-800">Violations</th>
                        <th className="px-10 py-6 border-b border-slate-100 dark:border-slate-800">Status</th>
                        <th className="px-10 py-6 text-right border-b border-slate-100 dark:border-slate-800">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(
                        allResults
                          .filter(r => {
                            if (gradingQuiz) return r.quiz_id === gradingQuiz.id;
                            if (gradingCourse) return r.quiz && r.quiz.course && r.quiz.course.id === gradingCourse.id;
                            return true; // no filter -> show all
                          })
                          .slice()
                          .reverse()
                      ).map((res) => {
                        const isGraded = res.feedback && Object.keys(res.feedback).length > 0;
                        return (
                          <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                            <td className="px-10 py-7">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                                  {res.student?.full_name?.charAt(0) || "S"}
                                </div>
                                <div className="overflow-hidden">
                                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate text-lg">{res.student?.full_name}</div>
                                  <div className="text-xs text-slate-500 truncate font-medium">{res.student?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-7 text-center">
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/5 rounded-2xl">
                                <span className="font-black text-2xl text-indigo-500">{res.score}</span>
                                <span className="text-slate-400 text-xs font-bold">/ {res.total_marks}</span>
                              </div>
                            </td>
                            <td className="px-10 py-7 text-center">
                              <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${res.eye_tracking_violations > 3 ? 'bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                {res.eye_tracking_violations}
                              </span>
                            </td>
                            <td className="px-10 py-7">
                              {isGraded ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Graded</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Marking Needed</span>
                                </div>
                              )}
                            </td>
                            <td className="px-10 py-7 text-right">
                              <button
                                className="btn-primary px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 ml-auto"
                                onClick={() => {
                                  setSelectedAttempt(res);
                                  setShowGradingModal(true);
                                }}
                              >
                                Review & Mark
                                <ArrowRight size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(
                        gradingQuiz
                          ? allResults.filter(r => r.quiz_id === gradingQuiz.id).length === 0
                          : gradingCourse
                            ? allResults.filter(r => r.quiz && r.quiz.course && r.quiz.course.id === gradingCourse.id).length === 0
                            : allResults.length === 0
                      ) && (
                          <tr>
                            <td colSpan="5" className="px-10 py-32 text-center text-slate-500">
                              <div className="flex flex-col items-center gap-6 opacity-30">
                                <Users size={80} className="text-slate-300 dark:text-slate-700" />
                                <div className="text-2xl font-black">No student attempts yet</div>
                                <p className="max-w-md text-sm font-medium leading-relaxed">Once students complete this quiz, their submissions will appear here automatically for your review.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === "all-quizzes" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">All Quizzes</h2>
                <div className="flex gap-2">
                  <div>
                    <select
                      value={quizCourseFilter}
                      onChange={(e) => setQuizCourseFilter(e.target.value)}
                      className="bg-slate-800 border border-slate-700 pl-3 pr-3 py-2 rounded-xl text-sm outline-none mr-2"
                    >
                      <option value="all">All Courses</option>
                      {myCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search quizzes..."
                      className="bg-slate-800 border border-slate-700 pl-10 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={quizSearchQuery}
                      onChange={(e) => setQuizSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {allQuizzes
                  .filter(q => (quizCourseFilter === 'all' || (q.course && q.course.id === Number(quizCourseFilter))))
                  .filter(q =>
                    q.title.toLowerCase().includes(quizSearchQuery.toLowerCase()) ||
                    q.course?.title.toLowerCase().includes(quizSearchQuery.toLowerCase())
                  )
                  .map(quiz => (
                    <div key={quiz.id} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex justify-between items-center group hover:border-indigo-500 transition shadow-sm dark:shadow-none">
                      <div className="flex gap-4 items-center">
                        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white">{quiz.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><Layers size={12} /> {quiz.course?.title}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {quiz.duration}m</span>
                            <span className={`px-2 py-0.5 rounded-full ${quiz.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-gray-300'}`}>
                              {quiz.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/20 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 hover:text-white transition"
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setSelectedCourse(quiz.course);
                            setActiveTab("question-management");
                          }}
                        >
                          Questions
                        </button>
                        <button
                          className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition"
                          onClick={() => {
                            const start = new Date(quiz.start_time).toISOString().slice(0, 16);
                            const end = new Date(quiz.end_time).toISOString().slice(0, 16);
                            const deadline = quiz.deadline ? new Date(quiz.deadline).toISOString().slice(0, 16) : "";
                            setEditingQuiz({ ...quiz, start_time: start, end_time: end, deadline: deadline });
                            setShowEditQuiz(true);
                          }}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this quiz? This will also remove all its questions and results.")) {
                              handleDeleteQuiz(quiz.id);
                            }
                          }}
                          title="Delete Quiz"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                {allQuizzes.length === 0 && (
                  <div className="p-12 text-center text-gray-500">No quizzes found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold">Student Reports</h2>
                  <p className="text-slate-500 text-sm mt-1">Detailed breakdown of quiz performance and proctoring logs.</p>
                </div>
              </div>

              {/* Analytics Summary */}
              {allResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-600/20 text-white">
                    <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Average Score</p>
                    <h3 className="text-3xl font-bold">
                      {(allResults.reduce((acc, r) => acc + (r.score / r.total_marks), 0) / allResults.length * 100).toFixed(1)}%
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Pass</p>
                    <h3 className="text-3xl font-bold text-green-500">
                      {allResults.filter(r => (r.score / r.total_marks) >= 0.4).length}
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Fail</p>
                    <h3 className="text-3xl font-bold text-red-500">
                      {allResults.filter(r => (r.score / r.total_marks) < 0.4).length}
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Most Alerts</p>
                      <h3 className="text-3xl font-bold text-amber-500">
                        {Math.max(...allResults.map(r => r.eye_tracking_violations), 0)}
                      </h3>
                    </div>
                    <ShieldAlert className="text-amber-500/20" size={40} />
                  </div>
                </div>
              )}
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Student</th>
                        <th className="p-4 font-bold">Course</th>
                        <th className="p-4 font-bold">Quiz</th>
                        <th className="p-4 font-bold text-center">Score</th>
                        <th className="p-4 font-bold">Percentage</th>
                        <th className="p-4 font-bold text-center">Violations</th>
                        <th className="p-4 font-bold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allResults.map(result => (
                        <React.Fragment key={result.id}>
                          <tr className="border-t border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition group">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                                  {result.student?.full_name?.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{result.student?.full_name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-slate-700 dark:text-gray-300">{result.quiz?.course?.title}</td>
                            <td className="p-4 text-sm text-slate-700 dark:text-gray-300">{result.quiz?.title}</td>
                            <td className="p-4 font-mono text-sm text-center">
                              <span className="text-slate-900 dark:text-white">{result.score}</span>
                              <span className="text-gray-600"> / {result.total_marks}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${(result.score / result.total_marks) >= 0.8 ? 'bg-green-500/10 text-green-400' :
                                (result.score / result.total_marks) >= 0.5 ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-red-500/10 text-red-400'
                                }`}>
                                {((result.score / result.total_marks) * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  if (result.eye_tracking_violations > 0) {
                                    // Toggle expanded row logic
                                    const key = `expanded_${result.id}`;
                                    setExpandedResultId(expandedResultId === result.id ? null : result.id);
                                  }
                                }}
                                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${result.eye_tracking_violations > 0
                                  ? 'bg-red-500/20 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white cursor-pointer'
                                  : 'bg-green-500/10 text-green-500'}`}
                              >
                                {result.eye_tracking_violations} Alerts
                              </button>
                            </td>
                            <td className="p-4 text-xs text-gray-500">{new Date(result.completed_at).toLocaleDateString()}</td>
                          </tr>
                          {expandedResultId === result.id && result.timeline && (
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                              <td colSpan="7" className="p-4">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-red-500/10 shadow-inner">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
                                    <ShieldAlert size={12} /> Violation Timeline
                                  </h5>
                                  <div className="space-y-2">
                                    {result.timeline.map((log, lidx) => (
                                      <div key={lidx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900/30">
                                        <span className="font-mono text-slate-400">{log.time}</span>
                                        <span className="font-bold text-slate-700 dark:text-gray-300">{log.reason}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {allResults.length === 0 && (
                        <tr>
                          <td colSpan="7" className="p-12 text-center text-gray-500">No results available yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold">Enrolled Students</h2>
                  <p className="text-slate-500 text-sm mt-1">Students enrolled in your courses.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm text-slate-600">Filter by Course:</label>
                <select
                  value={studentCourseFilter}
                  onChange={(e) => setStudentCourseFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 pl-3 pr-3 py-2 rounded-xl text-sm outline-none"
                >
                  <option value="all">All Courses</option>
                  {myCourses.map(c => (
                    <option key={c.id} value={c.course_code}>{c.title} - {c.course_code}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Student Name</th>
                        <th className="p-4 font-bold">Email</th>
                        <th className="p-4 font-bold">Enrolled Course</th>
                        <th className="p-4 font-bold">Code</th>
                        <th className="p-4 font-bold">Joined At</th>
                        <th className="p-4 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        studentCourseFilter === 'all'
                          ? myStudents
                          : myStudents.filter(s => s.course_code === studentCourseFilter)
                      ).map((s, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                                {s.full_name?.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">{s.full_name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-slate-500">{s.email}</td>
                          <td className="p-4 text-sm font-medium">{s.course_title}</td>
                          <td className="p-4 text-xs align-middle">
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">{s.course_code}</span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">{new Date(s.enrolled_at).toLocaleDateString()}</td>
                          <td className="p-4 text-center">
                            {kickingStudentId === `${s.student_id}_${s.course_id}` ? (
                              <div className="flex items-center justify-center gap-2">
                                {kickCountdown > 0 ? (
                                  <button disabled className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold animate-pulse">
                                    Confirm in {kickCountdown}s
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleKickStudent(s.course_id, s.student_id);
                                      setKickingStudentId(null);
                                    }}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-md shadow-red-900/20"
                                  >
                                    Confirm Kick
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setKickingStudentId(null);
                                    setKickCountdown(0);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setKickingStudentId(`${s.student_id}_${s.course_id}`);
                                  setKickCountdown(3);
                                }}
                                className="px-3 py-1.5 text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                title="Remove student from course"
                              >
                                Kick
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(
                        studentCourseFilter === 'all'
                          ? myStudents.length === 0
                          : myStudents.filter(s => s.course_code === studentCourseFilter).length === 0
                      ) && (
                          <tr>
                            <td colSpan="5" className="p-12 text-center text-gray-500">No students enrolled yet.</td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leave-requests" && (
            <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Student Leave Requests</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Manage enrollment leave requests from your students</p>
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Filter Status:</span>
                  <select
                    value={leaveRequestFilter}
                    onChange={(e) => setLeaveRequestFilter(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-700 dark:text-white outline-none pr-8 py-1 cursor-pointer"
                  >
                    <option value="all" className="dark:bg-slate-800 dark:text-white">All Requests</option>
                    <option value="pending" className="dark:bg-slate-800 dark:text-white">Pending</option>
                    <option value="accepted" className="dark:bg-slate-800 dark:text-white">Accepted</option>
                    <option value="declined" className="dark:bg-slate-800 dark:text-white">Declined</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {leaveRequests.filter(r => leaveRequestFilter === 'all' || r.status === leaveRequestFilter).length > 0 ? (
                  leaveRequests.filter(r => leaveRequestFilter === 'all' || r.status === leaveRequestFilter).map(req => (
                    <div key={req.id} className="chart-card flex flex-col md:flex-row justify-between items-center gap-8 p-8 group border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all rounded-[2.5rem] bg-white dark:bg-slate-800/40 relative overflow-hidden">
                      {/* Status Background Accent */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${req.status === 'pending' ? 'bg-amber-500' : req.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden border-2 border-white dark:border-slate-700 shrink-0">
                          {req.student?.profile_picture ? (
                            <img src={req.student.profile_picture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            req.student?.full_name?.charAt(0)
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-slate-900 dark:text-white">{req.student?.full_name}</h4>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' : req.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-sm text-indigo-400 font-bold mt-1">{req.course?.title}</p>

                          {/* Student Details Row */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student ID</p>
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">#{req.student?.student_id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quizzes Attempted</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${req.quiz_attempts_count > 0 ? 'text-indigo-500' : 'text-slate-400'}`}>
                                  {req.quiz_attempts_count} Attempts
                                </span>
                              </div>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request Date</p>
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{new Date(req.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-3 w-full md:w-48">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleProcessLeaveRequest(req.id, 'accepted')}
                              className="flex-1 btn-primary bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                              <CheckCircle size={18} /> Accept
                            </button>
                            <button
                              onClick={() => handleProcessLeaveRequest(req.id, 'declined')}
                              className="flex-1 btn-secondary border-red-500/30 text-red-500 hover:bg-red-500/5 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                              <X size={18} /> Decline
                            </button>
                          </>
                        ) : (
                          <div className="w-full py-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Process Completed</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium italic">Handled on {new Date(req.created_at).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center bg-slate-50 dark:bg-slate-800/10 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800/50">
                    <Users size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                    <p className="text-xl font-bold text-slate-400">No {leaveRequestFilter !== 'all' ? leaveRequestFilter : ''} leave requests found</p>
                    <p className="text-sm text-slate-400 mt-2">Try changing the filter or wait for students to submit requests.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-2xl mx-auto w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Edit Profile</h2>
                <button
                  onClick={() => setActiveTab(previousTab)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
                >
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

                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="relative group">
                      <div
                        className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-600/20 cursor-pointer overflow-hidden relative"
                        onClick={() => fileInputRef.current.click()}
                      >
                        {profilePic ? (
                          <img src={profilePic} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          teacherData.full_name?.charAt(0)
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil size={20} className="text-white" />
                        </div>
                      </div>
                      {profilePic && (
                        <button
                          type="button"
                          onClick={handleDeleteProfilePicture}
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-all z-10 scale-90 group-hover:scale-100"
                          title="Delete Profile Picture"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                    />
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="text-xl font-bold">{teacherData.full_name}</h3>
                      </div>
                      <p className="text-slate-500 text-sm">{teacherData.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider rounded">Teacher Account</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Full Name</label>
                        <input name="full_name" defaultValue={teacherData.full_name} className="input-field w-full p-3 rounded-xl" placeholder="Your Name" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Email</label>
                        <input name="email" defaultValue={teacherData.email} className="input-field w-full p-3 rounded-xl" placeholder="Email Address" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Mobile</label>
                        <input name="mobile" defaultValue={teacherData.mobile} className="input-field w-full p-3 rounded-xl" placeholder="Phone Number" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Degree</label>
                        <input name="degree" defaultValue={teacherData.degree} className="input-field w-full p-3 rounded-xl" placeholder="e.g. PhD" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Department</label>
                        <input name="department" defaultValue={teacherData.department} className="input-field w-full p-3 rounded-xl" placeholder="Department" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">University</label>
                        <input name="university" defaultValue={teacherData.university} className="input-field w-full p-3 rounded-xl" placeholder="University Name" />
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

          {/* Create Course Modal */}
          {
            showCreateCourse && (
              <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[200] p-4 overflow-y-auto">
                <div className="modal-content p-8 rounded-2xl w-full max-w-lg shadow-2xl my-8">
                  <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
                  <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-400 mb-1 block">Course Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Advanced Mathematics"
                        className="w-full input-field p-3 rounded-xl"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-gray-400">Subject Name</label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl"
                        value={newCourse.subject}
                        onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })}
                        placeholder="e.g. Calculus & Algebra"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-gray-400">Course Code (Optional)</label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl font-bold text-indigo-600 dark:text-indigo-400"
                        value={newCourse.course_code}
                        onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
                        placeholder="e.g. MATH101"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-gray-400">Enrollment Key</label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl"
                        value={newCourse.access_key}
                        onChange={(e) => setNewCourse({ ...newCourse, access_key: e.target.value })}
                        placeholder="e.g. MATH_KEY_2024"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-gray-400">Department</label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl"
                        value={newCourse.department}
                        onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-gray-400">Semester</label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl"
                        value={newCourse.semester}
                        onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                        placeholder="e.g. Fall 2024"
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-gray-400">Course Description</label>
                      <textarea
                        className="w-full input-field p-3 rounded-xl h-24 resize-none"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        placeholder="Briefly describe the course objectives..."
                        required
                      ></textarea>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="selfJoin"
                        checked={newCourse.self_join_enabled}
                        onChange={(e) => setNewCourse({ ...newCourse, self_join_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <label htmlFor="selfJoin" className="text-sm">Allow students to self-enroll</label>
                    </div>
                    <div className="md:col-span-2 flex gap-4 mt-6">
                      <button type="button" className="flex-1 btn-secondary p-3 rounded-xl font-semibold" onClick={() => setShowCreateCourse(false)}>Cancel</button>
                      <button type="submit" className="flex-1 btn-primary p-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20">Create Course</button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }
          {/* Manual Question Modal */}
          {
            showAddQuestion && (
              <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[200] p-4 overflow-y-auto">
                <div className="modal-content p-8 rounded-2xl w-full max-w-6xl shadow-2xl my-8 relative flex flex-col lg:flex-row gap-12">
                  <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition" onClick={() => setShowAddQuestion(false)}><X size={24} /></button>

                  {/* Editor Side */}
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                        <PlusCircle size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Add Question</h2>
                        <p className="text-sm text-slate-500">{selectedQuiz?.title}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Type</label>
                          <select
                            className="w-full input-field p-4 rounded-xl font-bold bg-slate-100 dark:bg-slate-900 border-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                            value={newQuestion.question_type || 'mcq'}
                            onChange={(e) => {
                              const type = e.target.value;
                              let update = { ...newQuestion, question_type: type };
                              if (type === 'true_false') {
                                update.option_a = 'True';
                                update.option_b = 'False';
                                update.option_c = '';
                                update.option_d = '';
                                update.correct_option = 'a';
                              } else if (type === 'description') {
                                update.option_a = '';
                                update.option_b = '';
                                update.option_c = '';
                                update.option_d = '';
                                update.correct_option = '';
                              }
                              setNewQuestion(update);
                            }}
                          >
                            <option value="mcq">Multiple Choice</option>
                            <option value="true_false">True / False</option>
                            <option value="description">Description (Text)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Points</label>
                          <input
                            type="number"
                            className="w-full input-field p-4 rounded-xl text-center font-black"
                            value={newQuestion.point_value}
                            onChange={(e) => setNewQuestion({ ...newQuestion, point_value: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Question Text</label>
                        <textarea
                          placeholder="Enter the main question text here..."
                          className="w-full input-field p-6 rounded-2xl h-32 resize-none font-medium text-lg leading-relaxed"
                          value={newQuestion.text}
                          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                          required
                        />
                      </div>

                      {(newQuestion.question_type === 'mcq' || !newQuestion.question_type) && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['a', 'b', 'c', 'd'].map((label) => (
                              <div key={label}>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Option {label.toUpperCase()}</label>
                                <input
                                  type="text"
                                  className="w-full input-field p-4 rounded-xl font-medium"
                                  value={newQuestion[`option_${label}`]}
                                  onChange={(e) => setNewQuestion({ ...newQuestion, [`option_${label}`]: e.target.value })}
                                  placeholder={`Choice ${label.toUpperCase()}`}
                                  required
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col gap-2 mt-4">
                            <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Correct Answer</label>
                            <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800">
                              {['a', 'b', 'c', 'd'].map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  className={`py-3 rounded-xl font-black transition-all ${newQuestion.correct_option === opt
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                    }`}
                                  onClick={() => setNewQuestion({ ...newQuestion, correct_option: opt })}
                                >
                                  {opt.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {newQuestion.question_type === 'true_false' && (
                        <div className="flex flex-col gap-2 mt-4">
                          <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Correct Answer</label>
                          <div className="grid grid-cols-2 gap-4 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800">
                            {['a', 'b'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                className={`py-3 rounded-xl font-black transition-all ${newQuestion.correct_option === opt
                                  ? 'bg-indigo-600 text-white shadow-lg'
                                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                  }`}
                                onClick={() => setNewQuestion({ ...newQuestion, correct_option: opt })}
                              >
                                {opt === 'a' ? 'True' : 'False'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {newQuestion.question_type === 'description' && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mt-4">
                          <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">Teacher Graded</p>
                          <p className="text-gray-400 text-sm">Students will write a text response. You will grade this manually.</p>
                        </div>
                      )}

                      <div className="flex gap-4 pt-6">
                        <button type="button" className="flex-1 btn-secondary py-4 rounded-2xl font-bold" onClick={() => setShowAddQuestion(false)}>Cancel</button>
                        <button type="button" className="flex-2 btn-primary py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20" onClick={handleAddQuestion}>Save Question</button>
                      </div>
                    </div>
                  </div>

                  {/* Preview Side */}
                  <div className="hidden lg:flex lg:w-96 flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Student Preview</h3>
                      <span className="text-[10px] text-slate-500 italic flex items-center gap-1"><Eye size={12} /> Live</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-inner relative overflow-hidden flex-1 flex items-center justify-center">
                      <div className="w-full bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-700 relative">
                        <div className="absolute -top-3 -left-3 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg">1</div>
                        <div className="absolute top-4 right-6 text-[10px] font-black uppercase text-slate-500 tracking-tighter">{newQuestion.point_value || 1} Points</div>
                        <p className={`text-xl font-bold mb-8 leading-relaxed ${!newQuestion.text ? 'opacity-20 italic' : ''}`}>
                          {newQuestion.text || "Type your question..."}
                        </p>
                        <div className="space-y-3">
                          {(newQuestion.question_type === 'mcq' || !newQuestion.question_type) && ['a', 'b', 'c', 'd'].map(label => (
                            <div key={label} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${newQuestion.correct_option === label
                              ? 'border-green-500/50 bg-green-500/5'
                              : 'border-slate-700 opacity-40'}`}>
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${newQuestion.correct_option === label
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-700 text-slate-500'}`}>
                                {label.toUpperCase()}
                              </div>
                              <span className={`text-sm font-semibold ${newQuestion.correct_option === label ? 'text-green-400' : 'text-slate-500'}`}>
                                {newQuestion[`option_${label}`] || `Option ${label.toUpperCase()}`}
                              </span>
                            </div>
                          ))}

                          {newQuestion.question_type === 'true_false' && ['a', 'b'].map(label => (
                            <div key={label} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${newQuestion.correct_option === label
                              ? 'border-green-500/50 bg-green-500/5'
                              : 'border-slate-700 opacity-40'}`}>
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${newQuestion.correct_option === label
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-700 text-slate-500'}`}>
                                {label === 'a' ? 'T' : 'F'}
                              </div>
                              <span className={`text-sm font-semibold ${newQuestion.correct_option === label ? 'text-green-400' : 'text-slate-500'}`}>
                                {label === 'a' ? 'True' : 'False'}
                              </span>
                            </div>
                          ))}

                          {newQuestion.question_type === 'description' && (
                            <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
                              <p className="text-slate-500 text-sm italic">Student answer area...</p>
                              <div className="h-20 border border-dashed border-slate-700 rounded-lg mt-2 opacity-50"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {/* Edit Question Modal */}
          {/* Attempt Grading Modal */}
          {
            showGradingModal && selectedAttempt && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                <div className="bg-slate-100 dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                  {/* Header */}
                  <div className="px-10 py-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-800/50">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-indigo-500 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20">
                        {selectedAttempt.student?.full_name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedAttempt.student?.full_name}</h3>
                        <p className="text-slate-500 font-medium">{selectedAttempt.student?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Score</div>
                      <div className="text-4xl font-black text-indigo-500">
                        {(() => {
                          // Dynamic Score Calculation
                          const allQuestions = gradingModalQuestions.length > 0 ? gradingModalQuestions : (gradingQuizzes.find(q => q.id === selectedAttempt.quiz_id)?.questions || selectedAttempt.quiz?.questions || []);
                          let currentScore = 0;

                          allQuestions.forEach(q => {
                            const qId = q.id.toString();
                            const feedback = (selectedAttempt.feedback || {})[qId];

                            // If marked manually, take that score
                            if (feedback && typeof feedback.score === 'number') {
                              currentScore += feedback.score;
                            } else {
                              // Auto-grading fallback
                              const answer = (selectedAttempt.answers || {})[qId];
                              const normalize = (val) => (val || "").toString().toLowerCase().trim();
                              if (q.question_type !== 'description') {
                                if (normalize(answer) === normalize(q.correct_option)) {
                                  currentScore += (q.point_value || 1);
                                }
                              }
                            }
                          });

                          return currentScore;
                        })()}<span className="text-slate-300 dark:text-slate-700 text-2xl font-medium"> / {selectedAttempt.total_marks}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center gap-3 text-indigo-400 font-bold mb-4 uppercase tracking-widest text-xs">
                        <Shield size={16} /> Proctoring & Session Info
                      </div>
                      <div className="grid grid-cols-2 gap-8 text-center">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                          <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Violations</span>
                          <div className={`text-2xl font-black ${selectedAttempt.eye_tracking_violations > 3 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                            {selectedAttempt.eye_tracking_violations}
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                          <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Completed</span>
                          <div className="text-lg font-bold text-slate-700 dark:text-slate-200">
                            {new Date(selectedAttempt.completed_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-4 flex items-center gap-3">
                      <div className="w-8 h-[1px] bg-indigo-500/30"></div>
                      Review Answers
                    </h4>

                    {/* Tabs: MCQ / T-F / Description */}
                    {(() => {
                      const allQuestions = gradingModalQuestions.length > 0 ? gradingModalQuestions : (gradingQuizzes.find(q => q.id === selectedAttempt.quiz_id)?.questions || selectedAttempt.quiz?.questions || []);

                      // Map over QUESTIONS, not answers, to ensure we show every question even if skipped
                      const entries = allQuestions.map((q) => {
                        const qId = q.id.toString();
                        const answer = (selectedAttempt.answers || {})[qId];
                        return {
                          qId,
                          answer,
                          question: q,
                          type: q.question_type || (q.question_type === "true_false" ? "true_false" : "mcq")
                        };
                      });

                      const counts = {
                        all: entries.length,
                        mcq: entries.filter(e => (e.question.question_type || "mcq") === "mcq").length,
                        true_false: entries.filter(e => (e.question.question_type || "") === "true_false").length,
                        description: entries.filter(e => (e.question.question_type || "") === "description").length
                      };

                      const filtered = gradingAnswerTab === "all" ? entries : entries.filter(e => (e.question.question_type || "mcq") === gradingAnswerTab);

                      return (
                        <div>
                          <div className="flex gap-3 mb-6">
                            {[
                              { id: "all", label: `All (${counts.all})` },
                              { id: "mcq", label: `MCQ (${counts.mcq})` },
                              { id: "true_false", label: `T/F (${counts.true_false})` },
                              { id: "description", label: `Desc (${counts.description})` }
                            ].map(tab => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setGradingAnswerTab(tab.id)}
                                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider ${gradingAnswerTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'}`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-6">
                            {filtered.length === 0 && (
                              <div className="py-12 text-center text-slate-500">No answers in this category.</div>
                            )}
                            {filtered.map((entry, idx) => {
                              const qId = entry.qId;
                              const answer = entry.answer;
                              const question = entry.question;
                              const feedback = (selectedAttempt.feedback || {})[qId] || {};
                              const pointInfo = question.point_value || 1;

                              const normalize = (val) => (val || "").toString().toLowerCase().trim();
                              const isCorrect = normalize(answer) === normalize(question.correct_option);
                              const isNotAnswered = !answer;

                              return (
                                <div key={qId} className="bg-white dark:bg-slate-800/40 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/30 transition-all group">

                                  {/* Question Header */}
                                  <div className="flex justify-between items-start mb-6 gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                      <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black group-hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/10 shrink-0">{idx + 1}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Question</span>
                                          {question.question_type !== "description" && (
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isNotAnswered
                                              ? "bg-slate-100 dark:bg-slate-700 text-slate-500"
                                              : isCorrect
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-red-500/10 text-red-500"
                                              }`}>
                                              {isNotAnswered ? "Not Answered" : isCorrect ? `+${pointInfo} Points` : "Wrong"}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-slate-700 dark:text-slate-200 font-bold text-lg leading-tight">
                                          {question.question_text || question.text || "Question content unavailable"}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Marks Input */}
                                    <div className="flex flex-col items-end shrink-0">
                                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Marks (Max: {pointInfo})</span>
                                      <input
                                        type="number"
                                        className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-center font-black text-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none text-xl transition-all"
                                        value={feedback.score ?? (isCorrect ? pointInfo : 0)}
                                        max={pointInfo}
                                        min={0}
                                        onChange={(e) => {
                                          let val = parseInt(e.target.value) || 0;
                                          if (val > pointInfo) val = pointInfo; // Validation
                                          if (val < 0) val = 0;

                                          const currentFeed = { ...(selectedAttempt.feedback || {}) };
                                          const qFeed = currentFeed[qId] || {};
                                          currentFeed[qId] = { ...qFeed, score: val };
                                          setSelectedAttempt({ ...selectedAttempt, feedback: currentFeed });
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Options / Answer Section */}
                                  <div className="mb-6">
                                    <div className="text-indigo-400 text-[10px] uppercase font-black mb-4 flex items-center gap-2 tracking-widest">
                                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                                      Student Answer (Click Option to Edit)
                                    </div>

                                    {question.question_type === 'description' ? (
                                      <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 leading-relaxed min-h-[100px] shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={answer || ""}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const currentAnswers = { ...(selectedAttempt.answers || {}) };
                                          currentAnswers[qId] = val;
                                          setSelectedAttempt({ ...selectedAttempt, answers: currentAnswers });
                                        }}
                                      />
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {['a', 'b', 'c', 'd'].map((opt) => {
                                          if (question.question_type === "true_false" && (opt === "c" || opt === "d")) return null;
                                          const optText = question[`option_${opt}`];
                                          const isStudentSelected = normalize(answer) === normalize(opt);
                                          const isCorrectOpt = normalize(question.correct_option) === normalize(opt);

                                          // Styling Logic (Same as Student View)
                                          let cardClass = "bg-transparent border-slate-100 dark:border-slate-700 text-slate-500 opacity-60 hover:bg-slate-50 cursor-pointer";
                                          let iconClass = "bg-slate-100 dark:bg-slate-700";

                                          if (!isNotAnswered) {
                                            if (isCorrectOpt) {
                                              cardClass = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400 cursor-pointer";
                                              iconClass = "bg-green-500 text-white";
                                            } else if (isStudentSelected) {
                                              cardClass = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 cursor-pointer";
                                              iconClass = "bg-red-500 text-white";
                                            }
                                          } else {
                                            // Allow selection even if not answered
                                            cardClass = "bg-transparent border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-300 cursor-pointer";
                                          }

                                          return (
                                            <div
                                              key={opt}
                                              onClick={() => {
                                                // Update Answer Logic
                                                const currentAnswers = { ...(selectedAttempt.answers || {}) };
                                                currentAnswers[qId] = opt;
                                                setSelectedAttempt({ ...selectedAttempt, answers: currentAnswers });
                                              }}
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

                                  {/* Marking Notes */}
                                  <div>
                                    <div className="text-slate-400 text-[10px] uppercase font-black mb-2 flex items-center gap-2 tracking-widest">
                                      <Database size={12} /> Marking Notes / Feedback
                                    </div>
                                    <textarea
                                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] transition-all"
                                      placeholder="Your comments for the student..."
                                      value={feedback.comment || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const currentFeed = { ...(selectedAttempt.feedback || {}) };
                                        const qFeed = currentFeed[qId] || {};
                                        currentFeed[qId] = { ...qFeed, comment: val };
                                        setSelectedAttempt({ ...selectedAttempt, feedback: currentFeed });
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Footer */}
                  <div className="px-10 py-8 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-6 bg-white dark:bg-slate-800/50">
                    <button
                      className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                      onClick={() => {
                        setShowGradingModal(false);
                        setSelectedAttempt(null);
                      }}
                    >
                      Discard Changes
                    </button>
                    <button
                      className="btn-primary px-12 py-3 rounded-2xl font-black shadow-2xl shadow-indigo-500/20 flex items-center gap-3 transform hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                      disabled={isGrading}
                      onClick={async () => {
                        setIsGrading(true);
                        try {
                          const token = localStorage.getItem("token");
                          const res = await fetch(`http://127.0.0.1:8000/results/${selectedAttempt.id}/grade`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              feedback: selectedAttempt.feedback || {},
                              answers: selectedAttempt.answers || {}
                            })
                          });

                          if (res.ok) {
                            toast.success("GRADING SUCCESS: Data synced to student portal.");
                            setShowGradingModal(false);
                            setSelectedAttempt(null);
                            fetchAllResults(); // Refresh list
                          } else {
                            toast.error("GRADNG ERROR: Server rejected the payload.");
                          }
                        } catch (err) {
                          toast.error("NETWORK ERROR: Connection failed.");
                        } finally {
                          setIsGrading(false);
                        }
                      }}
                    >
                      {isGrading ? "Processing..." : "Submit Marking"}
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {
            showEditQuestion && editingQuestion && (
              <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[200] p-4 overflow-y-auto">
                <div className="modal-content p-8 rounded-2xl w-full max-w-6xl shadow-2xl my-8 relative flex flex-col lg:flex-row gap-12">
                  <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition" onClick={() => setShowEditQuestion(false)}><X size={24} /></button>

                  {/* Editor Side */}
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                        <Pencil size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Edit Question</h2>
                        <p className="text-sm text-slate-500">{selectedQuiz?.title} • ID: {editingQuestion.id}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Question Text</label>
                        <textarea
                          placeholder="Enter the main question text here..."
                          className="w-full input-field p-6 rounded-2xl h-40 resize-none font-medium text-lg leading-relaxed"
                          value={editingQuestion.text}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['a', 'b', 'c', 'd'].map((label) => (
                          <div key={label}>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Option {label.toUpperCase()}</label>
                            <input
                              type="text"
                              className="w-full input-field p-4 rounded-xl font-medium"
                              value={editingQuestion[`option_${label}`]}
                              onChange={(e) => setEditingQuestion({ ...editingQuestion, [`option_${label}`]: e.target.value })}
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 mt-4">
                        <div className="flex-1">
                          <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Correct Answer</label>
                          <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800">
                            {['a', 'b', 'c', 'd'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                className={`py-3 rounded-xl font-black transition-all ${editingQuestion.correct_option === opt
                                  ? 'bg-indigo-600 text-white shadow-lg'
                                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                  }`}
                                onClick={() => setEditingQuestion({ ...editingQuestion, correct_option: opt })}
                              >
                                {opt.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="w-full md:w-32">
                          <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Points</label>
                          <input
                            type="number"
                            className="w-full input-field p-4 rounded-2xl text-center font-black"
                            value={editingQuestion.point_value}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, point_value: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6">
                        <button type="button" className="flex-1 btn-secondary py-4 rounded-2xl font-bold" onClick={() => setShowEditQuestion(false)}>Cancel</button>
                        <button type="button" className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-500/20" onClick={handleUpdateQuestion}>Update Question</button>
                      </div>
                    </div>
                  </div>

                  {/* Preview Side */}
                  <div className="hidden lg:flex lg:w-96 flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Preview</h3>
                      <span className="text-[10px] text-slate-500 italic flex items-center gap-1"><Eye size={12} /> Editing</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-inner relative overflow-hidden flex-1 flex items-center justify-center">
                      <div className="w-full bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-700 relative">
                        <div className="absolute -top-3 -left-3 w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black shadow-lg">!</div>
                        <div className="absolute top-4 right-6 text-[10px] font-black uppercase text-slate-500 tracking-tighter">{editingQuestion.point_value || 1} Points</div>
                        <p className={`text-xl font-bold mb-8 leading-relaxed ${!editingQuestion.text ? 'opacity-20 italic' : ''}`}>
                          {editingQuestion.text || "Type your question..."}
                        </p>
                        <div className="space-y-3">
                          {['a', 'b', 'c', 'd'].map(label => (
                            <div key={label} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${editingQuestion.correct_option === label
                              ? 'border-green-500/50 bg-green-500/5'
                              : 'border-slate-700 opacity-40'}`}>
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${editingQuestion.correct_option === label
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-700 text-slate-500'}`}>
                                {label.toUpperCase()}
                              </div>
                              <span className={`text-sm font-semibold ${editingQuestion.correct_option === label ? 'text-green-400' : 'text-slate-500'}`}>
                                {editingQuestion[`option_${label}`] || `Option ${label.toUpperCase()}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            showEditCourse && selectedCourse && (
              <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[200] p-4">
                <div className="modal-content p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                  <h2 className="text-2xl font-bold mb-6">Edit Course</h2>
                  <form onSubmit={handleUpdateCourse} className="flex flex-col gap-4">
                    <div>
                      <label className="text-sm font-bold text-slate-500 dark:text-gray-400">Course Title</label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl"
                        value={selectedCourse.title}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 dark:text-gray-400">Subject</label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl"
                        value={selectedCourse.subject}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 dark:text-gray-400">Access Key</label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold"
                        value={selectedCourse.access_key}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, access_key: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button type="button" className="flex-1 btn-secondary p-3 rounded-xl font-semibold" onClick={() => setShowEditCourse(false)}>Cancel</button>
                      <button type="submit" className="flex-1 btn-primary p-3 rounded-xl font-semibold">Update Course</button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }
          {
            showEditQuiz && editingQuiz && (
              <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[200] p-4 overflow-y-auto">
                <div className="modal-content p-8 rounded-2xl w-full max-w-2xl shadow-2xl my-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Pencil className="text-indigo-500" />
                    Edit Quiz: {editingQuiz.title}
                  </h2>
                  <form onSubmit={handleUpdateQuiz} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-400 mb-1 block">Quiz Title</label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl"
                        value={editingQuiz.title}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                        required
                      />
                    </div>


                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-400 mb-1 block">Description</label>
                      <textarea
                        className="w-full input-field p-3 rounded-xl h-20"
                        value={editingQuiz.description}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                        <Calendar size={14} /> Start Time
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full input-field p-3 rounded-xl"
                        value={editingQuiz.start_time}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, start_time: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                        <Clock size={14} /> End Time
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full input-field p-3 rounded-xl"
                        value={editingQuiz.end_time}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, end_time: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Duration (Minutes)</label>
                      <input
                        type="number"
                        className="w-full input-field p-3 rounded-xl"
                        value={editingQuiz.duration}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, duration: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                        <Key size={14} /> Access Key
                      </label>
                      <input
                        type="text"
                        className="w-full input-field p-3 rounded-xl"
                        value={editingQuiz.access_key}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, access_key: e.target.value })}
                        required
                      />
                    </div>


                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Violation Limit</label>
                      <input
                        type="number"
                        className="w-full input-field p-3 rounded-xl"
                        value={editingQuiz.violation_limit || 5}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, violation_limit: parseInt(e.target.value) || 5 })}
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold">Eye Tracking</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={editingQuiz.eye_tracking_enabled} onChange={(e) => setEditingQuiz({ ...editingQuiz, eye_tracking_enabled: e.target.checked })} />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold">Shuffle Questions</label>
                        <input
                          type="checkbox"
                          checked={editingQuiz.shuffle_questions}
                          onChange={(e) => setEditingQuiz({ ...editingQuiz, shuffle_questions: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold">Fullscreen</label>
                        <input
                          type="checkbox"
                          checked={editingQuiz.fullscreen_required}
                          onChange={(e) => setEditingQuiz({ ...editingQuiz, fullscreen_required: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold">Tab Security</label>
                        <input
                          type="checkbox"
                          checked={editingQuiz.tab_switch_detection}
                          onChange={(e) => setEditingQuiz({ ...editingQuiz, tab_switch_detection: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex gap-4 mt-4">
                      <button
                        type="button"
                        className="flex-1 btn-secondary py-3 rounded-2xl font-bold"
                        onClick={() => setShowEditQuiz(false)}
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        className="flex-1 btn-primary py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20"
                      >
                        SAVE CHANGES
                      </button>
                    </div>
                  </form>
                </div>
              </div >
            )
          }
          {/* Create Quiz Modal */}
          {
            showCreateQuiz && (
              <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[200] p-4 overflow-y-auto">
                <div className="modal-content p-8 rounded-2xl w-full max-w-2xl shadow-2xl my-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <PlusCircle className="text-indigo-500" />
                    Configure New Quiz
                  </h2>
                  <form onSubmit={handleCreateQuiz} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-400 mb-1 block">Quiz Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Midterm Examination"
                        className="w-full input-field p-3 rounded-xl"
                        value={newQuiz.title}
                        onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-400 mb-1 block">Description</label>
                      <textarea
                        placeholder="Instructions for students..."
                        className="w-full input-field p-3 rounded-xl h-20"
                        value={newQuiz.description}
                        onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                        <Calendar size={14} /> Start Time
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full input-field p-3 rounded-xl"
                        value={newQuiz.start_time}
                        onChange={(e) => setNewQuiz({ ...newQuiz, start_time: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                        <Clock size={14} /> End Time
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full input-field p-3 rounded-xl"
                        value={newQuiz.end_time}
                        onChange={(e) => setNewQuiz({ ...newQuiz, end_time: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Duration (Minutes)</label>
                      <input
                        type="number"
                        className="w-full input-field p-3 rounded-xl"
                        value={newQuiz.duration}
                        onChange={(e) => setNewQuiz({ ...newQuiz, duration: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Violation Limit</label>
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        className="w-full input-field p-3 rounded-xl"
                        value={newQuiz.violation_limit || 5}
                        onChange={(e) => setNewQuiz({ ...newQuiz, violation_limit: parseInt(e.target.value) || 5 })}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                        <Key size={14} /> Access Key
                      </label>
                      <input
                        type="text"
                        placeholder="QUIZ123"
                        className="w-full input-field p-3 rounded-xl"
                        value={newQuiz.access_key}
                        onChange={(e) => setNewQuiz({ ...newQuiz, access_key: e.target.value })}
                        required
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold">Eye Tracking</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={newQuiz.eye_tracking_enabled} onChange={(e) => setNewQuiz({ ...newQuiz, eye_tracking_enabled: e.target.checked })} />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold">Shuffle Questions</label>
                        <input
                          type="checkbox"
                          checked={newQuiz.shuffle_questions}
                          onChange={(e) => setNewQuiz({ ...newQuiz, shuffle_questions: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold">Fullscreen Req.</label>
                        <input
                          type="checkbox"
                          checked={newQuiz.fullscreen_required}
                          onChange={(e) => setNewQuiz({ ...newQuiz, fullscreen_required: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold">Tab Security</label>
                        <input
                          type="checkbox"
                          checked={newQuiz.tab_switch_detection}
                          onChange={(e) => setNewQuiz({ ...newQuiz, tab_switch_detection: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex gap-4 mt-8">
                      <button
                        type="button"
                        className="flex-1 btn-secondary py-4 rounded-2xl font-bold"
                        onClick={() => setShowCreateQuiz(false)}
                      >
                        DISCARD
                      </button>
                      <button
                        type="submit"
                        className="flex-3 btn-primary py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20"
                      >
                        CREATE QUIZ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }
        </div>
      </main>
    </div>
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

function StatCard({ title, value, trend, icon, onClick }) {
  return (
    <div
      className={`stat-card group ${onClick ? "cursor-pointer hover:border-indigo-500/50 transition-all active:scale-[0.98]" : ""} shadow-sm`}
      onClick={onClick}
    >
      <div className="flex flex-col">
        <p className="stat-title text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">{title}</p>
        <p className="stat-value text-slate-900 dark:text-white font-black">{value}</p>
        <p className="stat-trend positive bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold w-fit mt-1">{trend}</p>
      </div>
      <div className="stat-icon bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  );
}

function QuestionList({ quizId, refreshKey, onEdit, onDelete }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("all");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8000/quizzes/${quizId}/questions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Failed to fetch questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId, refreshKey]);

  if (loading) return <div className="text-gray-500 italic p-8 text-center bg-slate-800/20 rounded-2xl border border-slate-800">Loading questions...</div>;

  const filteredQuestions = questions.filter(q => {
    if (filterTab === "all") return true;
    return (q.question_type || "mcq") === filterTab;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Question Type Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit">
        {[{ id: 'all', label: 'All Questions' }, { id: 'mcq', label: 'MCQ' }, { id: 'true_false', label: 'True / False' }, { id: 'description', label: 'Description' }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filterTab === tab.id
              ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredQuestions.map((q, index) => (
        <div key={q.id} className="chart-card p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          {/* Points Badge */}
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm">
            {q.point_value || 1} {q.point_value === 1 ? 'Point' : 'Points'}
          </div>

          <div className="flex gap-6">
            {/* Question Number */}
            <div className="flex-shrink-0 flex flex-col gap-4 items-center">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-black border border-slate-200 dark:border-slate-700">
                {index + 1}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors"
                  onClick={() => onEdit(q)}
                  title="Edit Question"
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  onClick={() => onDelete(q.id)}
                  title="Delete Question"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex-grow">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
                {q.text}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(q.question_type === 'true_false' ? ['a', 'b'] : (q.question_type === 'description' ? [] : ['a', 'b', 'c', 'd'])).map(label => {
                  const optKey = `option_${label}`;
                  const isCorrect = q.correct_option === label;
                  return (
                    <div
                      key={label}
                      className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${isCorrect
                        ? 'bg-green-500/5 border-green-500/20 ring-1 ring-green-500/20'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                        {label.toUpperCase()}
                      </div>
                      <span className={`text-sm ${isCorrect ? 'text-green-700 dark:text-green-400 font-semibold' : 'text-slate-600 dark:text-gray-400'}`}>
                        {q[optKey]}
                      </span>
                      {isCorrect && (
                        <CheckCircle size={14} className="ml-auto text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
              {q.question_type === 'description' && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Description Question</p>
                  <p className="text-sm text-slate-600 dark:text-gray-400 italic">No predefined options for this type.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {questions.length === 0 && (
        <div className="py-20 border-2 border-dashed border-slate-800 rounded-3xl text-center text-slate-500">
          <Database size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">No questions yet.</p>
          <p className="text-xs opacity-60">Use bulk upload or add manually to get started.</p>
        </div>
      )}
    </div>
  );
}