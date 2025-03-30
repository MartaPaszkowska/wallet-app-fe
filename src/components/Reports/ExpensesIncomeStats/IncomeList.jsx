import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Svg from "../../../assets/svg/ExpensesIncome/symbol-defs.svg";
import SvgBackground from "../../../assets/svg/ExpensesIncome/Rectangle 38.svg";
import "./ExpensesIncomeStats.css";
import API_URL from "../../../../api/apiConfig";
import BarChartComponent from "../../BarChartComponent/BarChartComponent";
import Loader from "../../Loader/Loader";

const IncomeList = () => {
	const { date } = useParams();
	const [incomes, setIncomes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedKey, setSelectedKey] = useState(null);

	useEffect(() => {
		const fetchIncomes = async () => {
			setLoading(true);
			setError(null);

			const currentUser = JSON.parse(localStorage.getItem("user"));
			const isDemo = currentUser?.email === "guest@demo.com";

			if (isDemo) {
				const stored = localStorage.getItem("demo-transactions");
				const parsed = stored ? JSON.parse(stored) : [];

				const demoData = parsed.filter(
					(tx) => tx.type === "income" && tx.date.startsWith(date)
				);

				const grouped = demoData.reduce((acc, tx) => {
					if (!acc[tx.category]) {
						acc[tx.category] = { total: 0 };
					}
					acc[tx.category].total += Number(tx.amount);
					return acc;
				}, {});

				const transformed = Object.entries(grouped).map(
					([category, data]) => ({
						category,
						details: data,
					})
				);

				setIncomes(transformed);
				setSelectedCategory(null);
				setSelectedKey(null);
				setLoading(false);
				return;
			}

			try {
				const token = localStorage.getItem("token");
				if (!token) {
					throw new Error("Brak tokenu autoryzacyjnego.");
				}

				const response = await axios.get(
					`${API_URL}/transaction/period-data`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
						params: { date },
					}
				);

				const transformedIncomes = Object.entries(
					response.data.incomes.incomesData || {}
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

				setIncomes(transformedIncomes);
				setSelectedCategory(null);
				setSelectedKey(null);
			} catch (err) {
				console.error("Fetching error: ", err.message);
				setError(err.message || "Coś poszło nie tak");
			} finally {
				setLoading(false);
			}
		};

		fetchIncomes();
	}, [date]);

	const incomeIcons = {
		Salary: "icon-salary",
		Bonus: "icon-income",
		Other: "icon-other",
	};

	if (loading) return <Loader />;
	if (error) return <li>Error: {error}</li>;

	return (
		<>
			<ul className="eiList">
				{incomes.map(({ category, details }, index) => (
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
							>
								<use
									href={`${Svg}#${
										incomeIcons[category] || "icon-other"
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

export default IncomeList;
