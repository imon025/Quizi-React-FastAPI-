import CountUp from "react-countup";

const Stats = ({ end, title, prefix = "", suffix = "" }) => {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <h2 className="font-poppins font-semibold text-3xl md:text-4xl lg:text-[2.7rem] leading-tight dark:text-white text-slate-900">
        <CountUp
          start={0}
          end={end}
          duration={2.5}
          prefix={prefix}
          suffix={suffix}
          enableScrollSpy
          scrollSpyOnce
        />
      </h2>
      <p className="text-gradient font-poppins font-normal text-sm md:text-base uppercase tracking-wider mt-2">
        {title}
      </p>
    </div>
  );
};

export default Stats;
