import { useEffect, useState } from "react";
import "./ExpensesIncome.css";
import axios from "axios";
import API_URL from "../../../api/apiConfig";
import { useParams } from "react-router-dom";
import { useDemo } from "../../context/DemoContext"; // (1)

const ExpensesIncome = () => {
	const { date } = useParams();
	const [income, setIncome] = useState(0);
	const [expense, setExpense] = useState(0);
	const [error, setError] = useState(null);
	const { demoTransactions } = useDemo(); // (2)
	const currentUser = JSON.parse(localStorage.getItem("user")); // (3)
	const isDemo = currentUser?.email === "guest@demo.com"; // (4)

	useEffect(() => {
		const fetchData = async () => {
			setError(null);
			if (isDemo) {
				const filtered = demoTransactions.filter((tx) =>
					tx.date.startsWith(date)
				); // (5)
				const totalIncome = filtered
					.filter((tx) => tx.type === "income")
					.reduce((sum, tx) => sum + Number(tx.amount), 0);
				const totalExpense = filtered
					.filter((tx) => tx.type === "expense")
					.reduce((sum, tx) => sum + Number(tx.amount), 0);
				setIncome(totalIncome);
				setExpense(totalExpense);
				return;
			}
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					throw new Error("No authorization token.");
				}
				const response = await axios.get(
					`${API_URL}/transaction/period-data`,
					{
						headers: { Authorization: `Bearer ${token}` },
						params: { date },
					}
				);
				const totalIncome = response.data.incomes.total || 0;
				const totalExpense = response.data.expenses.total || 0;
				setIncome(totalIncome);
				setExpense(totalExpense);
			} catch (err) {
				setError(err.message || "Błąd podczas pobierania danych.");
			}
		};
		fetchData();
	}, [date, isDemo, demoTransactions]); // (6)

	if (error) {
		return <p>Błąd: {error}</p>;
	}

	return (
		<section className="reports-overview">
			<p className="reports-overview__expense">
				Expenses:
				<span className="reports-overview__expense-highlight">
					- {expense.toFixed(2)} EUR
				</span>
			</p>

			<div className="reports-overview__divider"></div>

			<p className="reports-overview__income">
				Income:
				<span className="reports-overview__income-highlight">
					+ {income.toFixed(2)} EUR
				</span>
			</p>
		</section>
	);
};

export default ExpensesIncome;
