// src/config.js
export const defaultConfig = {
  baseURL: '',                 // set by the app using the SDK
  onUnauthorized: null,        // optional callback on 401 (app can redirect)
  redirectHandler: (path) => { // default redirect using window.location
    window.location.href = path;
  }
};