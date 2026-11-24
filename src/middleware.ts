import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/overview/:path*",
    "/projects/:path*",
    "/project/:path*",
    "/camps/:path*",
    "/patients/:path*",
    "/clinical/:path*",
    "/wellness/:path*",
    "/mental-health/:path*",
    "/analytics/:path*",
    "/reports/:path*",
    "/form-templates/:path*",
    "/team/:path*",
    "/settings/:path*",
    "/dashboard/:path*",
  ],
};
