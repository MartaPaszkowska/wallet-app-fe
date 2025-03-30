import { createContext, useContext, useState } from "react";

const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
	const [demoTransactions, setDemoTransactions] = useState([]);
	const [demoBalance, setDemoBalance] = useState(0);

	const addTransaction = (transaction) => {
		const transactionWithDate = {
			...transaction,
			date: new Date().toISOString(), // ✅ automatyczna data
		};

		setDemoTransactions((prev) => [...prev, transactionWithDate]);

		if (transactionWithDate.type === "expense") {
			setDemoBalance((prev) => prev - transactionWithDate.amount);
		} else if (transactionWithDate.type === "income") {
			setDemoBalance((prev) => prev + transactionWithDate.amount);
		}
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
