const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-yellow-200 rounded-full animate-ping" />
        <div className="absolute inset-2 border-4 border-yellow-400 rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default Loading;
