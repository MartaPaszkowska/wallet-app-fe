import { createContext, useContext, useState, useCallback } from "react";
import API_URL from "../../api/apiConfig";

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
	const [balance, setBalance] = useState(0);

	const isDemo =
		JSON.parse(localStorage.getItem("user") || "{}")?.email ===
		"guest@demo.com";

	const fetchBalance = useCallback(async () => {
		if (isDemo) return Promise.resolve();

		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await fetch(`${API_URL}/balance`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch balance");
			}

			const data = await response.json();
			setBalance(data.balance);
		} catch (error) {
			console.error("Error fetching balance:", error);
		}
	}, [isDemo]);

	const updateBalance = useCallback(
		async (newBalance) => {
			if (isDemo) return;

			try {
				const token = localStorage.getItem("token");
				if (!token) return;

				const response = await fetch(`${API_URL}/balance`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ newBalance }),
				});

				if (!response.ok) {
					throw new Error("Failed to update balance");
				}

				const data = await response.json();
				setBalance(data.balance);
			} catch (error) {
				console.error("Error updating balance:", error);
			}
		},
		[isDemo]
	);

	const calculateTransactionTotal = async () => {
		if (isDemo) return Promise.resolve();

		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await fetch(`${API_URL}/transaction/total`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to calculate transaction total");
			}

			const data = await response.json();
			setBalance(data.totalBalance);
			return data.totalBalance;
		} catch (error) {
			console.error("Error calculating transaction total:", error);
		}
	};

	const checkTransactions = async () => {
		if (isDemo) return false;

		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await fetch(`${API_URL}/transaction/check`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to check transactions");
			}

			const data = await response.json();
			return data.hasTransactions;
		} catch (error) {
			console.error("Error checking transactions:", error);
			return false;
		}
	};

	return (
		<BalanceContext.Provider
			value={{
				balance,
				fetchBalance,
				updateBalance,
				calculateTransactionTotal,
				checkTransactions,
			}}
		>
			{children}
		</BalanceContext.Provider>
	);
};

export const useBalance = () => useContext(BalanceContext);
