import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next, _vercel (internal Next.js)
  // - the favicon, robots.txt, public files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
