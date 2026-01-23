const CommonTitle = ({ title }) => {
  return (
    <h1 className="text-3xl ss:text-4xl md:text-5xl leading-normal sm:leading-relaxed md:leading-relaxed font-bold text-slate-900 dark:text-white uppercase tracking-tight">
      {title}
    </h1>
  );
};

export default CommonTitle;
