export const resumeEvaluation = (score: number) => {
  if (score >= 80) {
    return "Excellent";
  } else if (score >= 60) {
    return "Good";
  } else if (score >= 40) {
    return "Average";
  } else if (score >= 20) {
    return "Poor";
  } else {
    return "Very Poor";
  }
};
