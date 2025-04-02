import ExpensesIncome from "../components/Reports/ExpensesIncome";
import ExpensesIncomeStats from "../components/Reports/ExpensesIncomeStats/ExpensesIncomeStats";
import TopReports from "../components/Reports/TopReports";
import { useDemo } from "../context/DemoContext"; // [linia 4] dodane

const ReportsPage = () => {
	const { demoTransactions } = useDemo(); // [linia 6] dodane

	return (
		<div className="container">
			<TopReports demoData={demoTransactions} />{" "}
			{/* [linia 9] zmieniona */}
			<ExpensesIncome demoData={demoTransactions} />{" "}
			{/* [linia 10] zmieniona */}
			<ExpensesIncomeStats demoData={demoTransactions} />{" "}
			{/* [linia 11] zmieniona */}
		</div>
	);
};

export default ReportsPage;
