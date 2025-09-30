export default function useLogin() {
  function appleLogin() {
    console.log("appleLogin");
  }
  return {
    appleLogin,
  };
}
