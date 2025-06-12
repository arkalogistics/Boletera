import { withIronSessionSsr } from "iron-session/next";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

export const sessionOptions = {
  password: process.env.ADMIN_SESSION_SECRET!,
  cookieName: "boletera.admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

type Handler<P> = (ctx: GetServerSidePropsContext & { req: any }) => Promise<GetServerSidePropsResult<P>>;

export function withAdminSessionSsr<P>(gssp: Handler<P>) {
  return withIronSessionSsr(async (ctx) => {
    // Si ya está autenticado, deja pasar
    if (ctx.req.session.adminAuthed) {
      return gssp(ctx);
    }

    // Login SSR
    if (ctx.req.method === "POST") {
      const buffers: Uint8Array[] = [];
      for await (const chunk of ctx.req) buffers.push(chunk);
      const body = Buffer.concat(buffers).toString();
      const params = new URLSearchParams(body);

      const user = params.get("username") || "";
      const pass = params.get("password") || "";

      if (
        user === process.env.ADMIN_USERNAME &&
        pass === process.env.ADMIN_PASSWORD
      ) {
        ctx.req.session.adminAuthed = true;
        await ctx.req.session.save();
        // Redirige a la página original
        ctx.res.writeHead(302, { Location: ctx.resolvedUrl });
        ctx.res.end();
        return { props: {} as P };
      }

      // Login incorrecto
      return {
        props: {
          authed: false,
          error: "Credenciales incorrectas",
        } as unknown as P,
      };
    }

    // Si no, pide login
    return {
      props: {
        authed: false,
      } as unknown as P,
    };
  }, sessionOptions);
}
