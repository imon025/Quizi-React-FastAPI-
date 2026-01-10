import { appstore, bill, playstore } from "../assets";
import CommonTitle from "./CommonTitle";

const Bill = () => {
  return (
    <section className="relative font-poppins py-10 sm:py-16">
      <div className="flex flex-col md:flex-row gap-10 md:gap-5">
        <div className="flex-1">
          <img
            src={bill}
            alt="bill"
            className="w-full h-full object-contain md:object-fill"
          />
        </div>

        <div className="flex flex-col gap-5 md:gap-10 flex-1">
          <CommonTitle title="Easily control Traditional Quiz System" />
          <p className="text-dimWhite leading-relaxed text-base ss:text-lg">
            How many quizzes or assignments do you leave incomplete each month? Too many educators “forget” 
            to track every student’s activity efficiently. With Quizi, you can manage all quizzes in one place, 
            generate them quickly, and set customized rules like randomized questions, access keys, and deadlines for every student. As a bonus, you can analyze performance, monitor students in real-time, and optimize your teaching strategy. Stop missing insights and ensure every student is assessed effectively with Quizi!
          </p>
          <p className="text-dimWhite mt-5 text-base ss:text-lg">
            Quizi A silent & Secure Online Quiz System!
          </p>
          <div className="flex items-center gap-5">
            <img src={appstore} alt="app store" />
            <img src={playstore} alt="play store" />
          </div>
        </div>
      </div>
      <div className="absolute w-[20%] h-[60%] rounded-full left-0 top-20 pink__gradient"></div>
    </section>
  );
};

export default Bill;
