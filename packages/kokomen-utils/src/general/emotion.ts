type Emotion = "happy" | "encouraging" | "neutral" | "angry";
function getEmotion(grade: "A" | "B" | "C" | "D" | "F"): Emotion {
  switch (grade) {
    case "A":
      return "happy";
    case "B":
      return "encouraging";
    case "C":
      return "neutral";
    case "D":
      return "angry";
    case "F":
      return "angry";
    default:
      return "neutral";
  }
}
export { getEmotion };
