import { Machine } from "xstate"
import onboardingFlow from "./onboardingFlow"

export default Machine({
	key: "onboarding",
	initial: "signUp",
	states: {
		signUp: {
			on: {
				success: "confirmEmail",
				emailTaken: "signIn"
			}
		},
		confirmEmail: {
			on: {
				success: "signIn",
				back: "signUp"
			}
		},
		signIn: {
			on: {
				success: "chat"
			}
		}
	}
})