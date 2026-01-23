import { useState } from "react";
import { discount, robot } from "../assets";
import GetStarted from "./GetStarted";
import AccountForm from "./AccountForm";

const Hero = ({ onLoginClick }) => {
  return (
    <>
      <section
        id="home"
        className="flex md:items-center flex-col md:flex-row gap-10 md:gap-0 min-h-[70vh] py-10"
      >
        <div className="flex flex-col gap-5 flex-1 pr-10 md:pr-0">
          <div className="relative flex flex-row justify-between items-center w-full">
            <h1 className="flex-1 text-[3.3rem] sm:text-6xl leading-snug sm:leading-normal md:text-7xl md:leading-snug font-[600] font-poppins text-slate-900 dark:text-white">
              "A Silent & Secure <br className="md:block hidden" />
              <span className="text-gradient">Online Quiz </span>
              <br className="md:block hidden" />
              System"
            </h1>

            {/* Desktop Get Started */}
            <div className="ss:flex hidden md:mr-4 mr-0">
              <div onClick={onLoginClick}>
                <GetStarted />
              </div>
            </div>
          </div>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-dimWhite sm:mt-5 md:max-w-[470px]">
            Quizi is a silent and secure online quiz system that uses eye-tracking
            technology to ensure focus, fairness, and a distraction-free
            assessment experience.
          </p>
        </div>

        <div className="flex-1 relative flex items-center justify-center">
          <img src={robot} alt="robot" className="md:w-full md:h-full" />

          {/* Mobile Get Started */}
          <div className="absolute -top-4 left-5 sm:left-[60px] md:hidden">
            <div onClick={onLoginClick}>
              <GetStarted />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
