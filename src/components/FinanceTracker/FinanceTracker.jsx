import { useEffect, useState } from "react";
import FinanceForm from "../FinanceForm/FinanceForm";
import TransactionsTable from "../TransactionsTable/TransactionsTable";
import styles from "./FinanceTracker.module.css";
import { useDemo } from "../../context/DemoContext"; // ← dodane

const FinanceTracker = ({ email }) => {
	const [activeSection, setActiveSection] = useState("expenses");
	const [expenses, setExpenses] = useState([]);
	const [income, setIncome] = useState([]);

	const { demoTransactions } = useDemo(); // ← dodane
	const isDemo =
		JSON.parse(localStorage.getItem("user"))?.email === "guest@demo.com"; // ← dodane

	useEffect(() => {
		if (isDemo) {
			const demoFiltered = demoTransactions.filter(
				(t) =>
					t.type ===
					(activeSection === "expenses" ? "expense" : "income")
			);
			activeSection === "expenses"
				? setExpenses(demoFiltered)
				: setIncome(demoFiltered);
			return;
		}

		const fetchData = async () => {
			try {
				const token = localStorage.getItem("token");

				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/transaction/${
						activeSection === "expenses" ? "expense" : "income"
					}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch transactions");
				}

				const data = await response.json();
				activeSection === "expenses"
					? setExpenses(data.expenses)
					: setIncome(data.incomes);
			} catch (error) {
				console.error("Error fetching transactions:", error);
			}
		};

		fetchData();
	}, [activeSection, demoTransactions, isDemo]); // ← dodane zależności

	const handleAddTransaction = (transaction) => {
		if (activeSection === "expenses") {
			setExpenses((prevExpenses) => [...prevExpenses, transaction]);
		} else {
			setIncome((prevIncome) => [...prevIncome, transaction]);
		}
	};

	const handleDeleteTransaction = async (transactionId) => {
		if (isDemo) {
			activeSection === "expenses"
				? setExpenses((prev) =>
						prev.filter(
							(transaction) => transaction._id !== transactionId
						)
				  )
				: setIncome((prev) =>
						prev.filter(
							(transaction) => transaction._id !== transactionId
						)
				  );
			return;
		}

		try {
			const token = localStorage.getItem("token");

			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/transaction/${transactionId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to delete transaction");
			}

			activeSection === "expenses"
				? setExpenses((prev) =>
						prev.filter(
							(transaction) => transaction._id !== transactionId
						)
				  )
				: setIncome((prev) =>
						prev.filter(
							(transaction) => transaction._id !== transactionId
						)
				  );
		} catch (error) {
			console.error("Error deleting transaction:", error);
		}
	};

	return (
		<div className={styles["finance-tracker-container"]}>
			<div className={styles["email-info"]}>
				<p>Welcome, {email}</p>
			</div>
			<div className={styles["button-section"]}>
				<button
					className={`${styles["toggle-button"]} ${
						activeSection === "expenses" ? styles.active : ""
					}`}
					onClick={() => setActiveSection("expenses")}
				>
					Expenses
				</button>
				<button
					className={`${styles["toggle-button"]} ${
						activeSection === "income" ? styles.active : ""
					}`}
					onClick={() => setActiveSection("income")}
				>
					Income
				</button>
			</div>
			<FinanceForm
				onAdd={handleAddTransaction}
				activeSection={activeSection}
			/>
			<TransactionsTable
				data={activeSection === "expenses" ? expenses : income}
				onDelete={handleDeleteTransaction}
			/>
		</div>
	);
};

export default FinanceTracker;
