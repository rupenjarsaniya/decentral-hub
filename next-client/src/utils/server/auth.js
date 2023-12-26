import Config from "@/src/config";
import jwt from "jsonwebtoken";

export function getAuthToken(req) {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const tokenCookie = cookieHeader
      .split(";")
      .find((cookie) => cookie.trim().startsWith("token="));
    if (tokenCookie) {
      const tokenValue = tokenCookie.split("=")[1].trim();
      return tokenValue;
    }
  }
  return null;
}

export function getAuthTokenInfo(req) {
  const token = getAuthToken(req);

  if (!token) {
    return null;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, Config.JWT_SECRET_KEY);
  } catch (err) {
    console.log(err);
  }

  if (!decoded) {
    return null;
  }

  return decoded;
}
