let accessToken = "";

export const setAccessToken = (token) => {
  accessToken = token;
};
export const getAccessToken = () => {
  return accessToken;
};
