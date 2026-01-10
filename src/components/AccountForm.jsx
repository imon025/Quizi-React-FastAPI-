import { useState } from "react";

const AccountForm = ({ setShowAccount, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("student");

  // Mandatory fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // Student-specific
  const [studentId, setStudentId] = useState("");

  // Teacher-specific (optional)
  const [degree, setDegree] = useState("");

  // Optional fields
  const [department, setDepartment] = useState("");
  const [university, setUniversity] = useState("");

  // Backend API base
  const API_BASE = "http://127.0.0.1:8000/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // LOGIN
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed");

        alert(`Login Successful! User type: ${data.user.user_type === 0 ? "Student" : "Teacher"}`);
        console.log("Login data:", data);

        // Map backend integer type to frontend string type
        const typeString = data.user.user_type === 0 ? "student" : "teacher";
        onLogin(typeString, data.user, data.access_token);

        setShowAccount(false);
      } catch (err) {
        alert(err.message);
      }
    } else {
      // CREATE ACCOUNT
      if (
        !fullName ||
        !email ||
        !mobile ||
        !password ||
        (userType === "student" && !studentId)
      ) {
        alert("Please fill all required fields!");
        return;
      }

      const formData = {
        full_name: fullName,
        email,
        mobile,
        password,
        user_type: userType === "student" ? 0 : 1, // student=0, teacher=1
        student_id: userType === "student" ? studentId : undefined,
        degree: userType === "teacher" ? degree : undefined,
        department: department || undefined,
        university: university || undefined,
      };

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Account creation failed");

        alert(data.message);
        setIsLogin(true); // switch to login after creation
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const mandatoryInput =
    "bg-gray-800 border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition placeholder-gray-500 text-white w-full text-sm";

  const optionalInput =
    "bg-gray-800 border border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition placeholder-gray-500 text-white w-full text-sm";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start pt-16 z-50 overflow-auto">
      <div className="bg-gray-900 rounded-2xl w-[650px] p-10 relative shadow-lg border border-gray-700">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-red-500 transition"
          onClick={() => setShowAccount(false)}
        >
          &times;
        </button>

        {/* Tabs */}
        <div className="flex justify-center gap-6 mb-5 border-b border-gray-700 pb-2 text-sm">
          <button
            className={`font-medium pb-1 transition ${isLogin
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-gray-400 hover:text-blue-400"
              }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`font-medium pb-1 transition ${!isLogin
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-gray-400 hover:text-blue-400"
              }`}
            onClick={() => setIsLogin(false)}
          >
            Create Account
          </button>
        </div>

        <form className="flex flex-col gap-4 text-sm" onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <input
                type="email"
                placeholder="Email *"
                className={mandatoryInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password *"
                className={mandatoryInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            <>
              {/* Student / Teacher buttons */}
              <div className="flex gap-4 justify-center mb-4">
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-medium transition ${userType === "student"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  onClick={() => setUserType("student")}
                >
                  Student
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-medium transition ${userType === "teacher"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  onClick={() => setUserType("teacher")}
                >
                  Teacher
                </button>
              </div>

              {/* Mandatory fields */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  className={mandatoryInput}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  className={mandatoryInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Mobile *"
                  className={mandatoryInput}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password *"
                  className={mandatoryInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Student ID / Degree */}
              {userType === "student" && (
                <input
                  type="text"
                  placeholder="Student ID *"
                  className={mandatoryInput + " mt-2"}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              )}

              {userType === "teacher" && (
                <input
                  type="text"
                  placeholder="Degree (Optional)"
                  className={optionalInput + " mt-2"}
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
              )}

              {/* Optional fields in 2-column row */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <input
                  type="text"
                  placeholder="Department"
                  className={optionalInput}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="University"
                  className={optionalInput}
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg mt-3 font-medium hover:bg-blue-600 transition-all shadow-sm text-sm w-full"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Create Account" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AccountForm;
