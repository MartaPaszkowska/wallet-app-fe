import { createContext, useContext, useState } from "react";

const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
	const [demoTransactions, setDemoTransactions] = useState([]);
	const [demoBalance, setDemoBalance] = useState(0);

	const addTransaction = (transaction) => {
		const newTransaction = {
			...transaction,
			id: Date.now(),
			date: new Date().toISOString().split("T")[0],
			type: transaction.type || "expense", // ← DODANE!
			owner: "demo-user", // ← JEŚLI wymagane
		};

		setDemoTransactions((prev) => [...prev, newTransaction]);

		// aktualizacja salda
		if (newTransaction.type === "expense") {
			setDemoBalance((prev) => prev - newTransaction.amount);
		} else if (newTransaction.type === "income") {
			setDemoBalance((prev) => prev + newTransaction.amount);
		}

		console.log("[DEMO] Transakcja dodana:", newTransaction);
	};

	return (
		<DemoContext.Provider
			value={{
				demoTransactions,
				demoBalance,
				addTransaction,
				setDemoBalance,
			}}
		>
			{children}
		</DemoContext.Provider>
	);
};

export const useDemo = () => useContext(DemoContext);
