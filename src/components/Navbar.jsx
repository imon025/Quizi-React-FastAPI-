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
    <div className="mb-5 md:mb-10 bg-primary">
      <div className="container px-5 md:px-10 mx-auto relative font-poppins flex items-center justify-between py-8">
        {/* Logo */}
        <div>
          <h2 className="text-2xl text-white">Quizi</h2>
        </div>

        {/* Nav links + login */}
        <div className="flex items-center gap-4 relative">
          <ul
            className={`${menu ? "h-72" : "h-0"
              } flex items-center sm:gap-10 gap-8 capitalize absolute sm:relative top-[70px] right-[20px] sm:top-0 bg-black-gradient sm:bg-gradient-to-r from-transparent z-50 sm:flex-row flex-col rounded-xl w-[92%] xs:w-72 justify-center sm:h-auto transition-all duration-500 sm:w-auto sm:justify-normal overflow-hidden`}
          >
            {navLinks.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="font-[500] text-white">
                  {item.title || " "}
                </a>
              </li>
            ))}
            <li className="sm:hidden">
              <FiUser
                className="cursor-pointer text-2xl text-white"
                onClick={onLoginClick}
              />
            </li>
          </ul>

          <div className="flex items-center gap-4">
            <div
              className="cursor-pointer text-2xl text-white hover:text-indigo-400 transition"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </div>

            <FiUser
              className="hidden sm:block cursor-pointer text-2xl text-white"
              onClick={onLoginClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
