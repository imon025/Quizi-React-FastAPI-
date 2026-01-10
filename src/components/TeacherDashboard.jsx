import React, { useState, useEffect } from "react";
import {
  Home,
  BarChart3,
  Users,
  Layers,
  LogOut,
  PlusCircle,
  Plus,
  FileText,
  UserCheck,
  Menu,
  X,
  Eye,
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
  Activity
} from "lucide-react";
import "./dashboard.css";
import { useTheme } from "../context/ThemeContext";

// Helper Component for Bar Chart
const BarChart = ({ data, labels, color }) => (
  <div className="flex items-end gap-2 h-40 w-full px-4">
    {data.map((val, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
        <div
          className={`w-full rounded-t-md transition-all duration-500 hover:opacity-80 relative`}
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

// Helper Component for Line Chart (simulated with bars for simplicity and consistency)
const MiniLineChart = ({ data, labels }) => (
  <div className="flex items-end gap-1 h-40 w-full px-4">
    {data.map((val, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
        <div
          className="w-full bg-indigo-500/20 rounded-t-sm relative border-t-2 border-indigo-400"
          style={{ height: `${(val / (Math.max(...data, 1))) * 100}%` }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {val} Attempts
          </div>
        </div>
        <span className="text-[10px] text-gray-500 font-bold uppercase">{labels[i]}</span>
      </div>
    ))}
  </div>
);

export default function TeacherDashboard({ teacherData, onLogout }) {
  const [activeTab, setActiveTab] = useState(localStorage.getItem("teacherActiveTab") || "dashboard");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("teacherActiveTab", activeTab);
  }, [activeTab]);
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
  const [allResults, setAllResults] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  useEffect(() => {
    fetchMyCourses();
    fetchNotifications();
    fetchAllQuizzes();
    fetchAllResults();

    // POLLING: Every 30 seconds
    const interval = setInterval(() => {
      fetchMyCourses();
      fetchNotifications();
      fetchAllQuizzes();
      fetchAllResults();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/quizzes/all", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setAllQuizzes(data);
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

  useEffect(() => {
    if (activeTab === "course-detail" && selectedCourse) {
      fetchCourseQuizzes(selectedCourse.id);
    }
  }, [activeTab, selectedCourse]);

  const fetchCourseQuizzes = async (courseId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/courses/${courseId}/quizzes`);
      const data = await res.json();
      setCourseQuizzes(data);
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
        alert("Course created successfully!");
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
        alert(`Error: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Course creation error:", err);
      alert("Network error: Failed to connect to server.");
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
    shuffle_questions: true,
    shuffle_options: true,
    fullscreen_required: false,
    tab_switch_detection: false,
    max_questions: 0,
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
        alert("Quiz created successfully! Now add some questions.");
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
          shuffle_questions: true,
          shuffle_options: true,
          fullscreen_required: false,
          tab_switch_detection: false,
          status: "draft"
        });
        fetchCourseQuizzes(selectedCourse.id);

        // Auto-show add question
        setSelectedQuiz(createdQuiz);
        setActiveTab("question-management");
        setShowAddQuestion(true);
      } else {
        const errorData = await res.json();
        let errorMessage = "Failed to create quiz";
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n');
        }
        alert(`Error: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Quiz creation error:", err);
      alert("Network error: Failed to connect to server.");
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
        alert("Quiz updated successfully!");
        setShowEditQuiz(false);
        setEditingQuiz(null);
        fetchCourseQuizzes(selectedCourse.id);
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.detail || "Failed to update quiz"));
      }
    } catch (err) {
      console.error("Error updating quiz:", err);
      alert("An error occurred while updating the quiz.");
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
        alert("Quiz deleted successfully!");
        fetchCourseQuizzes(selectedCourse.id);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail || "Failed to delete quiz"}`);
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
        body: JSON.stringify({ ...newQuestion, quiz_id: selectedQuiz.id })
      });
      if (res.ok) {
        alert("Question added successfully!");
        setRefreshKey(prev => prev + 1);
        setShowAddQuestion(false);
        setNewQuestion({
          text: "", type: "mcq", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "", point_value: 1
        });
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail || "Failed to add question"}`);
      }
    } catch (err) {
      console.error("Add question error:", err);
      alert("Network error: Failed to connect to server.");
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
        alert("Question updated successfully!");
        setRefreshKey(prev => prev + 1);
        setShowEditQuestion(false);
        setEditingQuestion(null);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail || "Failed to update question"}`);
      }
    } catch (err) {
      console.error("Update question error:", err);
      alert("Network error: Failed to connect to server.");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/questions/${questionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Question deleted!");
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail || "Failed to delete question"}`);
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
        alert("Course updated!");
        setShowEditCourse(false);
        fetchMyCourses();
      }
    } catch (err) {
      alert("Failed to update course");
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
        alert("Course deleted successfully!");
        setDeleteCourseId(null);
        setDeleteCountdown(0);
        fetchMyCourses();
        if (selectedCourse?.id === courseId) {
          setActiveTab("courses");
          setSelectedCourse(null);
        }
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail || "Failed to delete course"}`);
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
          alert("Invalid JSON format. Expected an array or object with 'questions' array.");
          return;
        }

        // Map various possible field names to our backend schema
        const mappedQuestions = questions.map(q => {
          // Robustly get the correct option (handle case, trim, fallback)
          let correct = (q.correct_option || q.correct_answer || q.answer || "").toString().toLowerCase().trim();
          // If it's a full word like "alpha" or "option a", just take the first letter if it's a/b/c/d
          if (correct.includes("option ")) correct = correct.replace("option ", "");
          if (correct.length > 1 && ["a", "b", "c", "d"].includes(correct[0])) correct = correct[0];

          return {
            text: (q.text || q.question || q.Question || "").toString().trim(),
            option_a: (q.option_a || q.optionA || (q.options && (q.options.a || q.options.A)) || "").toString().trim(),
            option_b: (q.option_b || q.optionB || (q.options && (q.options.b || q.options.B)) || "").toString().trim(),
            option_c: (q.option_c || q.optionC || (q.options && (q.options.c || q.options.C)) || "").toString().trim(),
            option_d: (q.option_d || q.optionD || (q.options && (q.options.d || q.options.D)) || "").toString().trim(),
            correct_option: ["a", "b", "c", "d"].includes(correct) ? correct : "a",
            point_value: parseInt(q.point_value || q.marks || q.points) || 1
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
          alert("Bulk upload successful!");
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
          alert(msg);
        }
      } catch (err) {
        console.error("JSON parsing error:", err);
        alert("Invalid JSON format");
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
          alert("No questions found in CSV. Format: text,option_a,option_b,option_c,option_d,correct_option,point_value");
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
          alert(data.message || `Successfully uploaded ${questions.length} questions!`);
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
          alert(msg);
        }
      } catch (err) {
        console.error(err);
        alert("Error parsing CSV file. Ensure it follows the format: text,option_a,option_b,option_c,option_d,correct_option,point_value");
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
          if (parts.length < 6) {
            console.warn(`Skipping line ${i + 1} due to insufficient parts:`, line);
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
        console.log("Parsed questions from TXT:", questions);

        if (questions.length === 0) {
          alert("No questions found in file. Format: Question | A | B | C | D | CorrectLetter | Points");
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
          alert(`Successfully uploaded ${questions.length} questions!`);
          setRefreshKey(prev => prev + 1);
        } else {
          const error = await res.json();
          console.error("Bulk Upload Error:", error);
          let msg = "Failed to upload questions.";
          if (error.detail) {
            if (Array.isArray(error.detail)) {
              msg += "\nValidation Errors:\n" + error.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join("\n");
            } else {
              msg += "\nError: " + error.detail;
            }
          }
          alert(msg);
        }
      } catch (err) {
        console.error("Upload process error:", err);
        alert("Error parsing text file. Ensure it follows the format: Question | A | B | C | D | CorrectLetter | Points");
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
          <SidebarItem icon={<Users size={18} />} label="Students" />
          <SidebarItem
            icon={<FileText size={18} />}
            label="Quizzes"
            active={activeTab === "all-quizzes"}
            onClick={() => { setActiveTab("all-quizzes"); setIsSidebarOpen(false); }}
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
          <SidebarItem icon={<LogOut size={18} />} label="Logout" onClick={onLogout} />
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
                        className={`p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition cursor-pointer ${!n.is_read ? 'bg-indigo-500/5' : ''}`}
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
                    )) : (
                      <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="hidden sm:block btn-primary flex items-center gap-2 px-6 py-3 rounded-xl transition" onClick={() => setShowCreateCourse(true)}>
              <PlusCircle size={18} />
              Create Course
            </button>
          </div>
        </div>

        {activeTab === "overview" && (() => {
          // Calculate dynamic data for charts
          const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
          }).reverse();

          const engagementData = last7Days.map(date =>
            allResults.filter(r => r.completed_at.startsWith(date)).length
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
                />
                <StatCard
                  title="Live Courses"
                  value={myCourses.length}
                  trend="Active"
                  icon={<Layers size={24} />}
                />
                <StatCard
                  title="Quizzes Held"
                  value={allResults.length}
                  trend="Total attempts"
                  icon={<FileText size={24} />}
                />
                <StatCard
                  title="Avg. Score"
                  value={allResults.length > 0
                    ? `${(allResults.reduce((acc, r) => acc + (r.score / r.total_marks), 0) / allResults.length * 100).toFixed(1)}%`
                    : "0%"
                  }
                  trend="Class performance"
                  icon={<UserCheck size={24} />}
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
              <div key={course.id} className="chart-card flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{course.title}</h3>
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md font-mono">{course.course_code}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Database size={12} /> {course.subject} • {course.semester}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 btn-primary py-2 rounded-lg text-sm transition"
                    onClick={() => { setSelectedCourse(course); setActiveTab("course-detail"); }}
                  >
                    Manage
                  </button>
                  <button
                    className="flex-1 bg-pink-600/20 text-pink-400 border border-pink-600/30 py-2 rounded-lg text-sm hover:bg-pink-600 hover:text-white transition"
                    onClick={() => {
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
              <div className="flex gap-4">
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
                <a
                  href="/demo_questions.txt"
                  download="demo_questions.txt"
                  className="bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-500 flex items-center justify-center p-3 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                  title="Download Demo TXT Format"
                >
                  <Download size={18} />
                </a>
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

        {activeTab === "all-quizzes" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">All Quizzes</h2>
              <div className="flex gap-2">
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
              {allQuizzes.filter(q =>
                q.title.toLowerCase().includes(quizSearchQuery.toLowerCase()) ||
                q.course?.title.toLowerCase().includes(quizSearchQuery.toLowerCase())
              ).map(quiz => (
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
      </main>

      {/* Create Course Modal */}
      {showCreateCourse && (
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
      )}
      {/* Manual Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[200] p-4 overflow-y-auto">
          <div className="modal-content p-8 rounded-2xl w-full max-w-6xl shadow-2xl my-8 relative flex flex-col lg:flex-row gap-12">
            <button className="absolute top-6 right-6 text-slate-400 hover:text-white transition" onClick={() => setShowAddQuestion(false)}><X size={24} /></button>

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
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Question Text</label>
                  <textarea
                    placeholder="Enter the main question text here..."
                    className="w-full input-field p-6 rounded-2xl h-40 resize-none font-medium text-lg leading-relaxed"
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
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
                        value={newQuestion[`option_${label}`]}
                        onChange={(e) => setNewQuestion({ ...newQuestion, [`option_${label}`]: e.target.value })}
                        placeholder={`Choice ${label.toUpperCase()}`}
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
                  <div className="w-full md:w-32">
                    <label className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Points</label>
                    <input
                      type="number"
                      className="w-full input-field p-4 rounded-2xl text-center font-black"
                      value={newQuestion.point_value}
                      onChange={(e) => setNewQuestion({ ...newQuestion, point_value: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

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
                    {['a', 'b', 'c', 'd'].map(label => (
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditQuestion && editingQuestion && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[200] p-4 overflow-y-auto">
          <div className="modal-content p-8 rounded-2xl w-full max-w-6xl shadow-2xl my-8 relative flex flex-col lg:flex-row gap-12">
            <button className="absolute top-6 right-6 text-slate-400 hover:text-white transition" onClick={() => setShowEditQuestion(false)}><X size={24} /></button>

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
      )}

      {showEditCourse && selectedCourse && (
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
      )}
      {showEditQuiz && editingQuiz && (
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
                <label className="text-sm text-gray-400 mb-1 block">Question Limit (0=All)</label>
                <input
                  type="number"
                  className="w-full input-field p-3 rounded-xl"
                  value={editingQuiz.max_questions || 0}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, max_questions: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-bold">Shuffle Qs</label>
                  <input
                    type="checkbox"
                    checked={editingQuiz.shuffle_questions}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, shuffle_questions: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-bold">Shuffle Opts</label>
                  <input
                    type="checkbox"
                    checked={editingQuiz.shuffle_options}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, shuffle_options: e.target.checked })}
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
        </div>
      )}
      {/* Create Quiz Modal */}
      {showCreateQuiz && (
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
                <label className="text-sm text-gray-400 mb-1 block">Question Limit (0=All)</label>
                <input
                  type="number"
                  placeholder="0 to show all questions"
                  className="w-full input-field p-3 rounded-xl"
                  value={newQuiz.max_questions || 0}
                  onChange={(e) => setNewQuiz({ ...newQuiz, max_questions: parseInt(e.target.value) || 0 })}
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
                  <label className="text-xs text-gray-500 font-bold">Shuffle Questions</label>
                  <input
                    type="checkbox"
                    checked={newQuiz.shuffle_questions}
                    onChange={(e) => setNewQuiz({ ...newQuiz, shuffle_questions: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-bold">Shuffle Options</label>
                  <input
                    type="checkbox"
                    checked={newQuiz.shuffle_options}
                    onChange={(e) => setNewQuiz({ ...newQuiz, shuffle_options: e.target.checked })}
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
      )}
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

function QuestionList({ quizId, refreshKey, onEdit, onDelete }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, index) => (
        <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
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
                {['a', 'b', 'c', 'd'].map(label => {
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
