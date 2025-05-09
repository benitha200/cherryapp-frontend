export const loggedInUser = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  return {
    id: user?.id,
    userName: user?.username,
    role: user?.role,
    cwsId: user?.cwsId,
    token: token,
  };
};
