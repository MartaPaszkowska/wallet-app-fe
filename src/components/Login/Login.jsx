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

	const initialValues = {
		email: "",
		password: "",
	};

	const handleSubmit = async (values, actionType) => {
		try {
			const endpoint =
				actionType === "register" ? "/auth/register" : "/auth/login";
			const response = await axios.post(`${API_URL}${endpoint}`, values);

			if (!response.data.accessToken) {
				throw new Error("No access token returned from server.");
			}

			const userData = { email: values.email };
			localStorage.setItem("token", response.data.accessToken);
			localStorage.setItem("user", JSON.stringify(userData));

			if (actionType === "register") {
				localStorage.setItem("balanceConfirmed", "false");
			}

			iziToast.success({
				title:
					actionType === "register"
						? "Registration Successful"
						: "Login Successful",
				message: "Redirecting to your main page.",
				position: "topRight",
				timeout: 3000,
			});

			onLogin(values.email);
			await fetchBalance();
			navigate("/home");
		} catch (error) {
			console.error("Error during login/register:", error);
			iziToast.error({
				title: "Error",
				message:
					error.response?.data?.message ||
					"An error occurred. Please try again.",
				position: "topRight",
				timeout: 3000,
			});
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
			onSubmit={(values) => handleSubmit(values, "login")}
		>
			{({ values }) => (
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
						<button className="log_reg-btn" type="submit">
							Log in
						</button>
						<button
							className="log_reg-btn"
							type="button"
							onClick={() => handleSubmit(values, "register")}
						>
							Registration
						</button>
						<button
							className="login__guest-btn"
							type="button"
							onClick={() => {
								localStorage.setItem("token", "guest-token");
								localStorage.setItem(
									"user",
									JSON.stringify({ email: "guest@demo.com" })
								);
								onLogin("guest@demo.com");
								navigate("/home");
							}}
						>
							Try My!
						</button>
					</div>
				</Form>
			)}
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
