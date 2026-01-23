import { FaStar } from "react-icons/fa";
import { MdOutlineSecurity, MdAnalytics } from "react-icons/md";
import CommonButton from "./CommonButton";
import CommonTitle from "./CommonTitle";

const BusinessCard = (props) => {
  const { icon, title, desc } = props;
  return (
    <>
      <div className="flex items-center gap-2 ss:p-7 ss:gap-5 p-3 sm:p-5 feature-card rounded-2xl ss:rounded-3xl hover:bg-slate-100 dark:hover:bg-black-gradient cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all">
        <div className="p-4 bg-indigo-500/10 dark:bg-dimBlue rounded-full">
          <span className="text-2xl ss:text-[2rem] text-indigo-600 dark:text-secondary">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-dimWhite text-xs sm:text-base leading-relaxed">{desc}</p>
        </div>
      </div>
    </>
  );
};

const Business = ({ onLoginClick }) => {
  return (
    <section id="features" className="font-poppins pb-10 md:py-16">
      <div className="flex items-center flex-col md:flex-row gap-10 md:gap-10 ss:gap-16 justify-between">
        <div className="flex flex-col gap-8 ss:gap-12 flex-1">
          <div className="flex justify-center">
            <CommonTitle title="FEATURES" />
          </div>
          <p className="text-slate-600 dark:text-dimWhite text-base sm:text-lg leading-relaxed">
            Quizi provides a state-of-the-art proctoring environment with eye-tracking,
            ensuring that students maintain focus and academic integrity throughout
            their assessments. Effortless for teachers, secure for students.
          </p>
          <CommonButton btnText="get started" onClick={onLoginClick} />
        </div>

        <div className="flex flex-col gap-5 flex-1">
          <BusinessCard
            icon={<FaStar />}
            title="Award Winning"
            desc="Recognized for excellence in digital assessment and student monitoring technology."
          />
          <BusinessCard
            icon={<MdOutlineSecurity />}
            title="100% Secured"
            desc="Military-grade encryption and eye-tracking ensure maximum assessment security."
          />
          <BusinessCard
            icon={<MdAnalytics />}
            title="Real-time Analytics"
            desc="Detailed performance tracking and instant result generation for immediate feedback."
          />
        </div>
      </div>
    </section>
  );
};

export default Business;
