import React, { Component } from "react"
import Button from "./Button"

export default class ConfirmEmail extends Component {
	static defaultProps = {
		confirmEmail: async ({ code }) => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					if (code === "111111") resolve()
					else if (code === "123456") reject({ expiredCode: true })
					else reject({ invalidCode: true })
				}, 1000)
			})
		},
		sendCode: async attributes => Promise.resolve()
	}

	constructor(props) {
		super(props)
		this.state = {
			failCount: 0,
			values: ["", "", "", "", "", ""],
			loading: false
		}
	}

	onChange = index => event => {
		const value = event.target.value
		if (isNaN(value)) return
		const values = this.state.values.slice()
		values[index] = value
		this.setState(
			() => ({ values }),
			() => {
				const nextInput = this[`input${index + 1}`]
				if (nextInput !== undefined) nextInput.focus()
			}
		)
	}

	goToSignup = () => this.props.transition("back")

	submitCode = async () => {
		const code = this.state.values.join("")
		const { email, userId, transition, confirmEmail } = this.props
		this.setState(state => ({ loading: true }))
		confirmEmail({ userId, email, code })
			.then(user => transition("success"))
			.catch(({ invalidCode, expiredCode }) => {
				if (invalidCode) {
					if (this.state.failCount === 2) return transition("back")
					this.setState({
						failCount: ++this.state.failCount,
						invalidCode: true,
						expiredCode: false,
						loading: false,
						values: this.state.values.fill("")
					})
				} else if (expiredCode) {
					this.setState({
						invalidCode: false,
						expiredCode: true,
						loading: false,
						values: this.state.values.fill("")
					})
				}
				this.input0.focus()
			})
	}

	isFormInvalid = () => this.state.values.includes("")

	renderError = () => {
		if (this.state.invalidCode)
			return <span className="error-message form-error">Uh oh. Invalid code.</span>
		if (this.state.expiredCode)
			return <span className="error-message form-error">Sorry, that code has expired.</span>
	}

	sendNewCode = () => {
		const { userId, email, sendCode } = this.props
		sendCode({ userId, email }).then(() => {
			atom.notifications.addInfo("Email Sent!")
		})
	}

	render() {
		const { email } = this.props
		const { values } = this.state

		return (
			<form id="email-confirmation" onSubmit={this.submitCode}>
				<h2>You're almost there!</h2>
				<p>Please check your email. We've sent you a 6-digit code to confirm your email address.</p>
				<p>
					Didn't receive it? Check your spam folder, or have us{" "}
					<a onClick={this.sendNewCode}>send another email</a>.
				</p>
				<p>
					<strong>{email}</strong> not correct?{" "}
					<a id="go-back" onClick={this.goToSignup}>
						Change it
					</a>.
				</p>
				<div id="form">
					{this.renderError()}
					<div id="inputs">
						{values.map((value, index) => (
							<input
								className="native-key-bindings input-text"
								type="text"
								maxLength="1"
								tabIndex={index}
								ref={element => (this[`input${index}`] = element)}
								key={index}
								value={value}
								onChange={this.onChange(index)}
							/>
						))}
					</div>
					<Button
						id="submit-button"
						type="submit"
						disabled={this.isFormInvalid()}
						loading={this.state.loading}
					>
						SUBMIT
					</Button>
				</div>
			</form>
		)
	}
}