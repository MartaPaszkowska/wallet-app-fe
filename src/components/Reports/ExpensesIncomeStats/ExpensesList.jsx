import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Svg from "../../../assets/svg/ExpensesIncome/symbol-defs.svg";
import SvgBackground from "../../../assets/svg/ExpensesIncome/Rectangle 38.svg";

import "./ExpensesIncomeStats.css";
import API_URL from "../../../../api/apiConfig";
import BarChartComponent from "../../BarChartComponent/BarChartComponent";
import Loader from "../../Loader/Loader";

const ExpensesList = () => {
	const { date } = useParams(); // e.g. "2025-03" from URL
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedKey, setSelectedKey] = useState(null);

	useEffect(() => {
		const fetchExpenses = async () => {
			setLoading(true);
			setError(null);

			// Determine if current user is the demo user
			const currentUser = JSON.parse(localStorage.getItem("user"));
			const isDemo = currentUser?.email === "guest@demo.com";

			if (isDemo) {
				// Demo mode: load transactions from localStorage instead of backend
				const stored = localStorage.getItem("demo-transactions");
				const parsedTransactions = stored ? JSON.parse(stored) : [];
				// Filter transactions for the selected month (date format "YYYY-MM")
				const demoData = parsedTransactions.filter((tx) =>
					tx.date.startsWith(date)
				);
				// Group transactions by category and sum their amounts
				const grouped = demoData.reduce((acc, tx) => {
					if (!acc[tx.category]) {
						acc[tx.category] = { total: 0 };
					}
					acc[tx.category].total += Number(tx.amount);
					return acc;
				}, {});
				// Transform grouped data into the format expected by the UI
				const transformedDemoExpenses = Object.entries(grouped).map(
					([category, data]) => ({
						category,
						details: data, // { total: ... } for each category
					})
				);
				setExpenses(transformedDemoExpenses);
				setSelectedCategory(null);
				setSelectedKey(null);
				setLoading(false);
				return; // Skip the backend fetch
			}

			try {
				// Normal mode: fetch data from backend
				const token = localStorage.getItem("token");
				if (!token) {
					throw new Error("Brak tokenu autoryzacyjnego"); // No auth token
				}
				const response = await axios.get(
					`${API_URL}/transaction/period-data`,
					{
						headers: { Authorization: `Bearer ${token}` },
						params: { date }, // query parameter for selected period
					}
				);
				// Transform the response data into the format expected by the UI
				const transformedExpenses = Object.entries(
					response.data.expenses.incomesData || {}
				).map(([category, data]) => ({
					category,
					details: {
						...data,
						...Object.fromEntries(
							Object.entries(data).filter(
								([key]) => key !== "total"
							)
						),
					},
				}));
				setExpenses(transformedExpenses);
				setSelectedCategory(null);
				setSelectedKey(null);
			} catch (err) {
				console.error("Fetching error:", err.message);
				setError(err.message || "Coś poszło nie tak");
			} finally {
				setLoading(false);
			}
		};

		fetchExpenses();
	}, [date]); // dependency on date; if user type (demo/normal) can change without remount, include it (e.g., [date, JSON.parse(localStorage.getItem("user"))?.email])

	const expenseIcons = {
		Products: "icon-products",
		Alcohol: "icon-alcohol",
		Entertainment: "icon-entertainment",
		Health: "icon-health",
		Transport: "icon-transport",
		Housing: "icon-housing",
		Technique: "icon-technique",
		"Communal, Communication": "icon-communal-communication",
		"Sports, Hobbies": "icon-sports-hobbies",
		Education: "icon-education",
		Bonus: "icon-bonus",
		Other: "icon-other",
	};

	if (loading) return <Loader />;
	if (error) return <li>Error: {error}</li>;

	return (
		<>
			<ul className="eiList">
				{expenses.map(({ category, details }, index) => (
					<li
						key={category}
						onClick={() => {
							setSelectedCategory({ category, details });
							setSelectedKey(index);
						}}
					>
						<span className="eiIconDescription">
							{details.total ? details.total.toFixed(2) : "N/A"}
						</span>
						<div className="eiIconWithBackground">
							<img
								src={SvgBackground}
								className="svgBackground"
								alt=""
							/>
							<svg
								className={`eiIcon ${
									selectedKey === index ? "selected" : ""
								}`}
								aria-hidden="true"
							>
								<use
									href={`${Svg}#${
										expenseIcons[category] || "icon-other"
									}`}
								/>
							</svg>
						</div>
						<span className="eiIconDescription">{category}</span>
					</li>
				))}
			</ul>
			{selectedCategory && (
				<BarChartComponent
					category={selectedCategory.category}
					details={selectedCategory.details}
				/>
			)}
		</>
	);
};

export default ExpensesList;
