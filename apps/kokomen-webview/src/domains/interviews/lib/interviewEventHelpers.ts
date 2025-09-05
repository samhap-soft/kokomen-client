const interviewEventHelpers = {
  startVoiceRecognition: () => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "startListening" })
    );
  },
  stopVoiceRecognition: () => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "stopListening" })
    );
  }
};

export default interviewEventHelpers;
