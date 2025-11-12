function readCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name, value, opt = {}) {
    let cookie = `${name}=${encodeURIComponent(value)}; path=/;`
    if (opt.secure) cookie += 'Secure;'
    if (opt.sameSite) cookie += `SameSite=${opt.sameSite}`
    if (opt.expires) cookie += ` expires=${opt.expires.toUTCString()};`;
    document.cookie = cookie;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const AuthService = {
    setAuthDetail(obj) {
        try {
            setCookie('authDetail', JSON.stringify(obj), { secure: true, sameSite: 'Strict' })
        }
        catch (e) { }
    },

    getAuthDetail() {
        const raw = readCookie('authDetail');
        return raw ? JSON.parse(raw) : null
    },

    clearAuthDetail() {
        deleteCookie('authDetail');
    },

    setFlow(flowObj) {
        try {
            setCookie('authFlowContext', JSON.stringify(flowObj), { secure: true, sameSite: 'Strict' })
        }
        catch (e) { }
    },

    getFlow() {
        const raw = readCookie('authFlowContext')
        return raw ? JSON.parse(raw) : { step: 'none' }
    },

    clearFlow() {
        deleteCookie('authFlowContext')
    },

    setForgotPassword(data) {
        try {
            setCookie('forgotPasswordData', JSON.stringify(data), { secure: true, sameSite: 'Strict' })
        }
        catch (e) { }
    },

    getForgotPassword() {
        const raw = readCookie('forgotPasswordData')
        return raw ? JSON.parse(raw) : null
    },

    clearForgotPassword() {
        deleteCookie('forgotPasswordData')
    },

    clearAuth() {
        this.clearAuthDetail();
        this.clearFlow();
        this.clearForgotPassword();
    }
}