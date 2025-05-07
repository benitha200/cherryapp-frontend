export const loggedInUser = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    id: user?.id,
    userName: user?.username,
    role: user?.role,
    cwsId: user?.cwsId,
  };
};
