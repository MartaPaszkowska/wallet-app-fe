import "./FinanceForm.css";
import Select from "react-select";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import API_URL from "../../../api/apiConfig";
import { useDemo } from "../../context/DemoContext"; ////nowe

const FinanceForm = ({ onAdd, activeSection }) => {
	const { addTransaction } = useDemo(); ////nowe
	const isDemo =
		JSON.parse(localStorage.getItem("user"))?.email === "guest@demo.com"; ////nowe

	const selectExpenses = [
		{ value: "Transport", label: "Transport" },
		{ value: "Products", label: "Products" },
		{ value: "Health", label: "Health" },
		{ value: "Alcohol", label: "Alcohol" },
		{ value: "Entertainment", label: "Entertainment" },
		{ value: "Housing", label: "Housing" },
		{ value: "Technique", label: "Technique" },
		{ value: "Communal, Communication", label: "Communal, Communication" },
		{ value: "Sports, Hobbies", label: "Sports, Hobbies" },
		{ value: "Other", label: "Other" },
	];

	const selectIncome = [
		{ value: "Salary", label: "Salary" },
		{ value: "Bonus", label: "Bonus" },
	];

	const categories =
		activeSection === "expenses" ? selectExpenses : selectIncome;

	const validationSchema = Yup.object({
		date: Yup.string().required("Date is required"),
		description: Yup.string().required("Description is required"),
		category: Yup.mixed().required("Category is required"),
		amount: Yup.number()
			.typeError("Amount must be a number")
			.positive("Amount must be a positive number")
			.test(
				"is-decimal",
				"Amount should have up to 2 decimal places",
				(value) => {
					if (!value) return true;
					return /^\d+(\.\d{0,2})?$/.test(value.toString());
				}
			)
			.required("Amount is required"),
	});

	const handleFormSubmit = async (values, actions) => {
		const { resetForm } = actions;

		if (isDemo) {
			////nowe
			const transaction = {
				id: Date.now(),
				date: values.date,
				description: values.description,
				category: values.category,
				amount: parseFloat(values.amount),
				type: activeSection === "expenses" ? "expense" : "income",
			};

			console.log("✅ [DEMO] Transakcja dodana:", transaction); ////nowe

			addTransaction(transaction); ////nowe
			onAdd(transaction);
			resetForm();
			return; ////nowe
		}

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				throw new Error("User is not authenticated.");
			}

			const endpoint =
				activeSection === "expenses"
					? "/transaction/expense"
					: "/transaction/income";

			const response = await axios.post(
				`${API_URL}${endpoint}`,
				{
					date: values.date,
					description: values.description,
					category: values.category,
					amount: values.amount,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const transaction =
				activeSection === "expenses"
					? response.data.expense
					: response.data.income;

			if (transaction) {
				onAdd(transaction);
				resetForm();
			} else {
				throw new Error("Transaction data is missing in the response.");
			}
		} catch (err) {
			console.error(
				"Error during transaction:",
				err.response ? err.response.data : err.message
			);
		}
	};

	return (
		<Formik
			initialValues={{
				date: new Date().toISOString().split("T")[0],
				description: "",
				category: "",
				amount: "",
			}}
			validationSchema={validationSchema}
			onSubmit={handleFormSubmit}
		>
			{({ setFieldValue, values }) => (
				<Form className="finance-form">
					<div className="finance-form-input">
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="calendar-icon"
						>
							<use href="/sprite.svg#calendar" />
						</svg>
						<div className="input-container-date">
							<Field
								type="date"
								name="date"
								className="date-input"
							/>
							<ErrorMessage
								name="date"
								component="div"
								className="error"
							/>
						</div>

						<div className="input-container-description">
							<Field
								type="text"
								name="description"
								placeholder="Product description"
								className="product-description-input"
							/>
							<ErrorMessage
								name="description"
								component="div"
								className="error"
							/>
						</div>

						<div className="input-container-select">
							<Select
								value={
									values.category
										? {
												value: values.category,
												label: values.category,
										  }
										: null
								}
								onChange={(option) =>
									setFieldValue("category", option.value)
								}
								options={categories}
								classNames={{
									control: () => "select-control",
									option: (state) =>
										state.isSelected
											? "select-option select-option--is-selected"
											: "select-option select-option--is-not-selected",
								}}
								placeholder="Product category"
							/>
							<ErrorMessage
								name="category"
								component="div"
								className="error"
							/>
						</div>

						<div className="input-container-amount">
							<svg
								width="32"
								height="32"
								viewBox="0 0 32 32"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="calculator-icon"
							>
								<use href="/sprite.svg#calculator" />
							</svg>
							<Field
								type="number"
								name="amount"
								placeholder="0.00"
								className="amount-input"
								step="0.01"
							/>
							<ErrorMessage
								name="amount"
								component="div"
								className="error"
							/>
						</div>
					</div>
					<div className="finance-form-button">
						<button type="submit">INPUT</button>
						<button type="reset">CLEAR</button>
					</div>
				</Form>
			)}
		</Formik>
	);
};

export default FinanceForm;
