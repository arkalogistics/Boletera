import type { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  password: process.env.ADMIN_SESSION_SECRET!,
  cookieName: "boletera.admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
