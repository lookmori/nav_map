import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/mindmap/:path*', '/files/:path*', '/api/mindmaps/:path*'],
};
