import { FcMenu } from "react-icons/fc";
import { FiUser } from "react-icons/fi";
import { Sun, Moon } from "lucide-react";
import { navLinks } from "../utils/index";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Navbar = ({ onLoginClick }) => {
  const [menu, setMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mb-5 md:mb-10 bg-white dark:bg-primary border-b border-slate-200 dark:border-transparent">
      <div className="container px-5 md:px-10 mx-auto relative font-poppins flex items-center justify-between py-6 md:py-8">
        {/* Logo */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Quizi</h2>
        </div>

        {/* Nav links + login */}
        <div className="flex items-center gap-4 relative">
          <ul
            className={`${menu ? "h-72" : "h-0"
              } flex items-center sm:gap-10 gap-8 capitalize absolute sm:relative top-[70px] right-[20px] sm:top-0 bg-white dark:bg-black-gradient sm:bg-transparent z-50 sm:flex-row flex-col rounded-xl w-[92%] xs:w-72 justify-center sm:h-auto transition-all duration-500 sm:w-auto sm:justify-normal overflow-hidden border border-slate-200 dark:border-transparent shadow-xl sm:shadow-none`}
          >
            {navLinks.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="font-bold text-slate-600 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {item.title || " "}
                </a>
              </li>
            ))}
            <li className="sm:hidden">
              <FiUser
                className="cursor-pointer text-2xl text-slate-900 dark:text-white"
                onClick={onLoginClick}
              />
            </li>
          </ul>

          <div className="flex items-center gap-6">
            <button
              className="cursor-pointer text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-110"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>

            <button
              className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              onClick={onLoginClick}
            >
              <FiUser size={18} />
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
