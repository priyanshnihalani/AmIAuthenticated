import { AuthService } from './auth.service.js';

export function handleRouteAccess(
  currentPath = '/',
  redirectHandler = (p) => (window.location.href = p),
  routeConfig = {},
  starterRoute
) {
  const path = currentPath.split('?')[0].replace(/\/+$/, '') || '/';
  const flow = AuthService.getFlow() || {};
  const auth = AuthService.getAuthDetail();
  const isAuthenticated = !!auth;

  // AUTHENTICATED USER — can't access login/register/forgot-password pages
  if (isAuthenticated) {
    const authPages = [
      '/login', '/signin', '/register', '/signup',
      '/forgot-password', '/otp', '/reset-password'
    ];

    if (authPages.includes(path)) {
      redirectHandler(starterRoute);
      return false;
    }

    // Role-based control (optional)
    const routePermissions = routeConfig[path];
    if (routePermissions?.roles?.length) {
      const userRoles = auth.roles || [];
      const requiredRoles = routePermissions.roles;
      const requireAll = routePermissions.requireAll || false;

      const hasPermission = checkRolePermission(userRoles, requiredRoles, requireAll);
      if (!hasPermission) {
        const fallbackPath = routePermissions.redirect || '/unauthorized';
        redirectHandler(fallbackPath);
        return false;
      }
    }
    return true;
  }

  //  PASSWORD RECOVERY FLOW CONTROL

  // Forgot Password step → only allow /forgot-password
  if (flow.step === 'forgot-password') {
    if (path !== '/forgot-password') {
      redirectHandler('/forgot-password');
      return false;
    }
    return true;
  }

  // OTP step → allow /otp only (cannot skip to reset-password)
  if (flow.step === 'otp') {
    if (path !== '/otp') {
      redirectHandler('/otp');
      return false;
    }
    return true;
  }

  // Reset Password step → only /reset-password allowed
  if (flow.step === 'reset-password') {
    if (path !== '/reset-password') {
      redirectHandler('/reset-password');
      return false;
    }
    return true;
  }

  // PUBLIC ROUTES (unauthenticated, no flow)
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/otp',
    '/reset-password',
    '/unauthorized'
  ];

  //  Special case: If user visits /reset-password without any flow, go to forgot-password
  if (path === '/reset-password' && (!flow.step || flow.step === 'none')) {
    redirectHandler('/forgot-password');
    return false;
  }

  // If any other route is not public, go to login
  if (!publicPaths.includes(path)) {
    redirectHandler('/login');
    return false;
  }

  return true;
}

//  Helper: Role permission logic
function checkRolePermission(userRoles, requiredRoles, requireAll = false) {
  if (!Array.isArray(userRoles) || userRoles.length === 0) return false;
  return requireAll
    ? requiredRoles.every((r) => userRoles.includes(r))
    : requiredRoles.some((r) => userRoles.includes(r));
}

// Helpers: public exports for SDK users
export function hasRole(roles, requireAll = false) {
  const auth = AuthService.getAuthDetail();
  if (!auth || !auth.roles) return false;
  const userRoles = auth.roles || auth.user?.roles || [];
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  return checkRolePermission(userRoles, requiredRoles, requireAll);
}

export function getUserRoles() {
  const auth = AuthService.getAuthDetail();
  return auth?.roles || [];
}

export function isAuthenticated() {
  const auth = AuthService.getAuthDetail();
  return !!auth;
}

export function getCurrentUser() {
  return AuthService.getAuthDetail();
}
