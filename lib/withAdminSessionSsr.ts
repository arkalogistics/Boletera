import { getIronSession } from "iron-session";
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { sessionOptions } from "./sessionConfig";

export function withAdminSessionSsr<P extends { [key: string]: any }>(
  handler: GetServerSideProps<P>
): GetServerSideProps<P> {
  return async function(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> {
    const { req, res } = context;
    const session = await getIronSession(req, res, sessionOptions);
    (req as any).session = session;

    if (session.adminAuthed) {
      return handler(context);
    }

    if (req.method === "POST") {
      let rawBody = "";
      for await (const chunk of req) {
        rawBody += chunk;
      }
      const params = new URLSearchParams(rawBody);
      const username = params.get("username") || "";
      const password = params.get("password") || "";

      if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
      ) {
        session.adminAuthed = true;
        await session.save();

        return {
          redirect: {
            destination: context.resolvedUrl || "/",
            permanent: false,
          },
        };
      } else {
        return {
          props: {
            authed: false,
            error: "Credenciales incorrectas",
          } as unknown as P,
        };
      }
    }

    return {
      props: {
        authed: false,
      } as unknown as P,
    };
  };
}
