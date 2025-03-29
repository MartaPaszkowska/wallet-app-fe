import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BalanceProvider } from "./context/BalanceContext";
import { DemoProvider } from "./context/DemoContext"; // ← dodane
import Layout from "./components/Layout/Layout";

const MainPage = lazy(() => import("./pages/MainPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));

function App() {
	const user = JSON.parse(localStorage.getItem("user"));

	return (
		<DemoProvider>
			{" "}
			{/* ← dodane wrapper */}
			<BalanceProvider>
				<Router>
					<Suspense fallback={<div>Loading components...</div>}>
						<Routes>
							<Route path="/" element={<MainPage />} />
							<Route element={<Layout />}>
								<Route path="/home" element={<HomePage />} />
								<Route
									path="/reports"
									element={<ReportsPage />}
								/>
							</Route>
						</Routes>
					</Suspense>
				</Router>
			</BalanceProvider>
		</DemoProvider>
	);
}

export default App;
