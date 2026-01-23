const CommonButton = ({ btnText }) => {
  return (
    <button
      type="button"
      className="p-4 sm:p-5 rounded-xl w-fit capitalize bg-blue-gradient text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
    >
      <a href="#features">
        {btnText}
      </a>
    </button>
  );
};

export default CommonButton;
