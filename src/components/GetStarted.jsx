import { HiMiniArrowUpRight } from "react-icons/hi2";

const GetStarted = () => {
  return (
    <a
      href="#features"
      className="hover:shadow-md transition-all hover:shadow-indigo-500 md:w-[140px] md:h-[140px] sm:w-[180px] sm:h-[180px] w-[90px] h-[90px] bg-blue-gradient cursor-pointer select-none capitalize font-poppins flex items-center justify-center rounded-full hover:scale-110 transition-all p-[2px]"
    >
      <div className="w-full h-full bg-slate-50 dark:bg-primary rounded-full flex items-center justify-center">
        <div className="text-sm sm:text-2xl md:text-xl text-gradient text-center font-bold">
          <span className="flex items-center justify-center">
            get <HiMiniArrowUpRight className="text-xl ml-1" />
          </span>
          started
        </div>
      </div>
    </a>
  );
};

export default GetStarted;
