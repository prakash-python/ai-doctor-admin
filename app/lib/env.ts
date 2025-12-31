import { Secret } from "jsonwebtoken";
import { JwtTime } from "./jwt-types";

export const JWT_SECRET: Secret = process.env.JWT_SECRET!;

export const ACCESS_TOKEN_TTL: JwtTime =
  (process.env.ACCESS_TOKEN_TTL as JwtTime) || "15m";

export const REFRESH_TOKEN_TTL: JwtTime =
  ((process.env.REFRESH_TOKEN_TTL_DAYS || "7") + "d") as JwtTime;

if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
