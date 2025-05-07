import type {LoginDataModel, UserModel} from "~/lib/apiModels";
import type {H3Event} from "h3";
import {createHash} from "node:crypto";
import {getJwtSecretKey, SESSION_COOKIE_NAME} from "~/lib/auth";
import {SignJWT} from "jose";

export default defineEventHandler(async (event) => {
  let loginData: LoginDataModel;
  let user: UserModel;

  try {
    loginData = await getLoginData(event);
  } catch (e: Error | unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: errorMessage
    }));
  }

  try {
    user = getUser(loginData);
  } catch (e: Error | unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: errorMessage
    }));
  }

  const exp = parseInt(process.env.TOKEN_EXP as string);
  const token = await new SignJWT({
    sub: user.email,
  })
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime(`${exp}s`)
    .sign(getJwtSecretKey());

  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    expires: new Date(Date.now() + exp * 1000),
  });

  return {
    username: user.username,
    email: user.email,
  } as UserModel;
})

const getLoginData = async (event: H3Event): Promise<LoginDataModel> => {
  const loginData = await readBody(event) as LoginDataModel;

  if (!loginData.username) {
    throw new Error("Username is required");
  }

  if (!loginData.password) {
    throw new Error("Password is required");
  }

  return loginData;
};

const getUser = (loginData: LoginDataModel): UserModel => {
  const user = {
    hashedPassword: process.env.USER_PASSWORD as string,
    email: process.env.USER_NAME as string,
  };

  const hash = createHash("sha1").update(loginData.password).digest("hex");

  if (loginData.username == user.email && hash == user.hashedPassword) {
    return user;
  }

  throw new Error("Incorrect username or password");
};
