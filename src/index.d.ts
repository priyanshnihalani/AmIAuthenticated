declare module 'ami-authenticated' {
  /* ==========================================================
   *  CONFIGURATION
   * ========================================================== */
  export interface DefaultConfig {
    /** Base API URL for Axios client */
    baseURL: string;
    /** Optional callback on 401 errors */
    onUnauthorized?: (error: any) => void;
    /** Function used for redirection (can be navigate() or window.location) */
    redirectHandler?: (path: string) => void;
  }

  export const defaultConfig: DefaultConfig;

  /* ==========================================================
   *  HTTP CLIENT
   * ========================================================== */
  export interface CreateHttpClientOptions extends DefaultConfig {}

  /**
   * Creates a shared Axios client instance for authenticated API requests.
   * Must be called once during app initialization.
   */
  export function createHttpClient(options: CreateHttpClientOptions): import('axios').AxiosInstance;

  /**
   * Returns the shared Axios client instance created earlier.
   * Throws if `createHttpClient()` was not called.
   */
  export function getHttpClient(): import('axios').AxiosInstance | null;

  /* ==========================================================
   *  AUTH SERVICE
   * ========================================================== */
  export interface AuthDetail {
    token?: string;
    [key: string]: any;
  }

  export interface FlowData {
    step: 'otp' | 'forgot-password' | 'none' | string;
    email?: string;
    [key: string]: any;
  }

  export interface ForgotPasswordData {
    email: string;
    token: string;
  }

  export const AuthService: {
    /** Saves authentication details (usually a token and user info) in cookies. */
    setAuthDetail(obj: AuthDetail): void;

    /** Retrieves the saved authentication detail object from cookies. */
    getAuthDetail(): AuthDetail | null;

    /** Clears the authentication detail cookie. */
    clearAuthDetail(): void;

    /** Sets flow context (OTP or forgot-password) in cookies. */
    setFlow(flowObj: FlowData): void;

    /** Retrieves the current flow context. */
    getFlow(): FlowData;

    /** Clears the current flow context. */
    clearFlow(): void;

    /** Saves temporary forgot-password data (email, token). */
    setForgotPassword(data: ForgotPasswordData): void;

    /** Retrieves forgot-password data from cookies. */
    getForgotPassword(): ForgotPasswordData | null;

    /** Clears forgot-password data. */
    clearForgotPassword(): void;

    /** Clears all authentication data (tokens + flows + forgot-password info). */
    clearAuth(): void;
  };

  /* ==========================================================
   *  AUTH FLOW MANAGER
   * ========================================================== */
  export const AuthFlowManager: {
    /**
     * Starts the forgot password flow by saving email & temp token.
     */
    startForgotPassword(email: string, tempToken: string): void;

    /**
     * Starts the OTP flow for a given email.
     */
    startOtpFlow(email: string): void;

     /** Starts the reset-password flow after OTP is verified */
    startResetPassword(email: string, tempToken: string): void;

    /**
     * Completes the authentication process by setting auth detail and clearing flows.
     */
    completeAuth(authDetail: AuthDetail): void;

    /**
     * Cancels all running flows (OTP, forgot password, etc.).
     */
    cancelFlows(): void;
  };

  /* ==========================================================
   *  API SERVICE
   * ========================================================== */
  export const ApiService: {
    /** Performs a GET request and returns response data. */
    get<T = any>(path: string, config?: Record<string, any>): Promise<T>;

    /** Performs a POST request with body. */
    post<T = any>(path: string, body?: any, config?: Record<string, any>): Promise<T>;

    /** Performs a PUT request with body. */
    put<T = any>(path: string, body?: any, config?: Record<string, any>): Promise<T>;

    /** Performs a DELETE request. */
    delete<T = any>(path: string, config?: Record<string, any>): Promise<T>;

    /**
     * Uploads a file with optional extra form fields.
     * @param path API endpoint
     * @param file File to upload
     * @param extra Additional form fields
     */
    upload<T = any>(path: string, file: File, extra?: Record<string, any>): Promise<T>;
  };
}