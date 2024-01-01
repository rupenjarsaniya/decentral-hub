import Config from "@/src/config";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

export function getAuthToken(req) {
  const cookies = parse(req.headers.cookie);
  if (cookies.token) {
    return cookies.token;
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
