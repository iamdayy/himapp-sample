import { H3Event } from "h3";
import { checkSession, exitSession, refreshSession } from "./Sessions";
const TOKEN_TYPE = "Bearer";

const extractToken = (authHeaderValue: string) => {
  const [, token] = authHeaderValue.split(`${TOKEN_TYPE} `);
  return token;
};
export const checkAuth = (event: H3Event) => {
  const authHeaderValue = getRequestHeader(event, "Authorization");
  if (typeof authHeaderValue === "undefined") {
    return false;
  }
  return true;
};
export const ensureAuth = async (event: H3Event) => {
  const authHeaderValue = getRequestHeader(event, "Authorization");

  if (typeof authHeaderValue === "undefined") {
    throw createError({
      statusCode: 401,
      statusMessage:
        "Need to pass valid Bearer-Authorization header to access this endpoint",
    });
  }

  const extractedToken = extractToken(authHeaderValue);
  try {
    return await checkSession(extractedToken);
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
    throw createError({
      statusCode: 401,
      statusMessage: "You must be logged in to use this endpoint",
    });
  }
};
export const refreshAuth = async (event: H3Event) => {
  try {
    const { refreshToken } = await readBody(event);
    if (typeof refreshToken === "undefined") {
      throw createError({
        statusCode: 401,
        statusMessage:
          "Need to pass valid Bearer-Authorization header to access this endpoint",
      });
    }
    const token = await refreshSession(refreshToken);
    return {
      token,
      refreshToken,
    };
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
    throw createError({
      statusCode: 401,
      statusMessage: "You must be logged in to use this endpoint",
    });
  }
};
export const killAuth = async (event: H3Event) => {
  const authHeaderValue = getRequestHeader(event, "Authorization");
  if (typeof authHeaderValue === "undefined") {
    throw createError({
      statusCode: 401,
      statusMessage:
        "Need to pass valid Bearer-Authorization header to access this endpoint",
    });
  }

  const extractedToken = extractToken(authHeaderValue);
  try {
    return await exitSession(extractedToken);
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
    throw createError({
      statusCode: 401,
      statusMessage: "You must be logged in to use this endpoint",
    });
  }
};
