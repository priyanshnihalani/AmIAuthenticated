import { AuthService } from "./auth.service";

export const AuthFlowManager = {
    startForgotPassword(email, tempToken) {
        AuthService.setForgotPassword({ email, token: tempToken });
        AuthService.setFlow({ step: 'forgot-password', email });
    },

    startOtpFlow(email) {
        AuthService.setFlow({ step: 'otp', email })
    },

    startResetPassword(email, tempToken) {
        AuthService.setForgotPassword({ email, token: tempToken });
        AuthService.setFlow({ step: "reset-password", email });
    },
    
    completeAuth(authDetail) {
        AuthService.setAuthDetail(authDetail)
        AuthService.clearFlow()
        AuthService.clearForgotPassword()
    },

    cancelFlows() {
        AuthService.clearFlow()
        AuthService.clearForgotPassword()
    }
}