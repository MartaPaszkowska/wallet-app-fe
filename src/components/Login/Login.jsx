import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import logoLogin from "../../assets/images/logo/logo-login.webp";
import API_URL from "../../../api/apiConfig";
import "./Login.css";
import axios from "axios";
import { useBalance } from "../../context/BalanceContext";
import { useState } from "react";

const Logo = () => (
	<img
		className="logo-login-title"
		src={logoLogin}
		alt="Kapusta, Smart Finance"
		width="183"
		height="63"
	/>
);

const LoginForm = ({ onLogin }) => {
	const { fetchBalance } = useBalance();
	const navigate = useNavigate();
	const [actionType, setActionType] = useState("login");

	const initialValues = {
		email: "",
		password: "",
	};

	const showToast = (type, title, message) => {
		iziToast[type]({
			title,
			message,
			position: "topRight",
			timeout: 3000,
		});
	};

	const handleSubmit = async (values, action) => {
		try {
			const endpoint =
				action === "register" ? "/auth/register" : "/auth/login";
			const response = await axios.post(`${API_URL}${endpoint}`, values);

			if (!response.data.accessToken) {
				throw new Error("No access token returned from server.");
			}

			const userData = { email: values.email };
			localStorage.setItem("token", response.data.accessToken);
			localStorage.setItem("user", JSON.stringify(userData));

			if (action === "register") {
				localStorage.setItem("balanceConfirmed", "false");
			}

			showToast(
				"success",
				action === "register"
					? "Registration Successful"
					: "Login Successful",
				"Redirecting to your main page."
			);

			onLogin(values.email);
			await fetchBalance();
			navigate("/home");
		} catch (error) {
			console.error("Error during login/register:", error);
			showToast(
				"error",
				"Error",
				error.response?.data?.message ||
					"An error occurred. Please try again."
			);
		}
	};

	const handleGuestLogin = async () => {
		try {
			const guestData = {
				email: "guest@guest.com",
				password:
					"$2b$10$9x3C0doR96M/5Nd232hdieDu8TrD4GT7A5J2Gh8FoZqSFoI7WbCtm",
			};
			const response = await axios.post(
				`${API_URL}/auth/login`,
				guestData
			);

			if (!response.data.accessToken) {
				throw new Error("No access token returned from server.");
			}

			const userData = { email: guestData.email };
			localStorage.setItem("token", response.data.accessToken);
			localStorage.setItem("user", JSON.stringify(userData));

			showToast(
				"success",
				"Guest Login",
				"You're now logged in as guest."
			);

			onLogin(guestData.email);
			await fetchBalance();
			navigate("/home");
		} catch (error) {
			console.error("Guest login error:", error);
			showToast(
				"error",
				"Error",
				error.response?.data?.message || "Guest login failed."
			);
		}
	};

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={Yup.object({
				email: Yup.string()
					.email("Invalid email address")
					.required("This field is required"),
				password: Yup.string()
					.min(7, "Password must be at least 7 characters long")
					.required("This field is required"),
			})}
			onSubmit={(values) => handleSubmit(values, actionType)}
		>
			<Form className="login__form">
				<div className="login__input-container">
					<label className="login__label" htmlFor="email">
						Email
					</label>
					<Field
						className="login__input"
						type="email"
						id="email"
						name="email"
						placeholder="Enter your email"
						autoComplete="email"
					/>
					<ErrorMessage
						name="email"
						component="p"
						className="error"
					/>
				</div>
				<div className="login__input-container">
					<label className="login__label" htmlFor="password">
						Password
					</label>
					<Field
						className="login__input"
						type="password"
						id="password"
						name="password"
						placeholder="Enter your password"
						autoComplete="current-password"
					/>
					<ErrorMessage
						name="password"
						component="p"
						className="error"
					/>
				</div>
				<div className="login__btns-container">
					<button
						className="login__log-in-btn"
						type="submit"
						onClick={() => setActionType("login")}
					>
						Log in
					</button>
					<button
						className="login__register-link"
						type="submit"
						onClick={() => setActionType("register")}
					>
						Registration
					</button>
					<button
						className="login__log-in-btn"
						type="button"
						onClick={handleGuestLogin}
					>
						Try My!
					</button>
				</div>
			</Form>
		</Formik>
	);
};

const Login = ({ onLogin }) => (
	<>
		<Logo />
		<section className="login" aria-label="Login or Register">
			<div className="login__wrapper">
				<p className="login__option-2">
					Log in using an email and password, after registering:
				</p>
				<LoginForm onLogin={onLogin} />
			</div>
		</section>
	</>
);

export default Login;
