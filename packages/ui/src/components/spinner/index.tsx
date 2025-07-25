function Spinner() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 rounded-full bg-primary-border animate-bounce [animation-delay:0ms]"></div>
      <div className="w-4 h-4 rounded-full bg-primary-hover animate-bounce [animation-delay:200ms]"></div>
      <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:400ms]"></div>
    </div>
  );
}

function LoadingFullScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner />
    </div>
  );
}

export { Spinner, LoadingFullScreen };
