import { card } from "../assets";
import CommonButton from "./CommonButton";
import CommonTitle from "./CommonTitle";
import { FaStar } from "react-icons/fa";

const Steps = ({ title }) => {
  return (
    <p className="text-sm sm:text-base md:text-lg text-dimWhite flex items-center gap-2">
      <span>
        <FaStar className="text-secondary -mt-1 text-base" />
      </span>
      <span>{title}</span>
    </p>
  );
};

const PaymentMethod = ({ onLoginClick }) => {
  return (
    <section id="product" className="py-10 sm:py-16 font-poppins">
      <div className="flex md:flex-row flex-col gap-10">
        <div className="flex flex-col gap-7 sm:gap-10 flex-1">
          <CommonTitle title="Manage your quizzes in few easy steps." />
          <div className="flex flex-col gap-3">
            <Steps title="Create customized quizzes for any subject or course" />
            <Steps title="Real-time proctoring with AI-driven eye-tracking" />
            <Steps title="Automated grading and detailed performance analytics" />
          </div>
          <CommonButton btnText="get started" onClick={onLoginClick} />
        </div>

        <div className="flex-1">
          <img
            src={card}
            alt="card payment method"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default PaymentMethod;
