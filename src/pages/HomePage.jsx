import { useOutletContext } from "react-router-dom";
import DataHeader from "../components/DataHeader/DataHeader";
import FinanceTracker from "../components/FinanceTracker/FinanceTracker";

const HomePage = () => {
	const { email } = useOutletContext();

	return (
		<div className="container">
			<DataHeader email={email} />
			<FinanceTracker email={email} />
		</div>
	);
};

export default HomePage;
