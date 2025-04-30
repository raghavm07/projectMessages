import "./App.css";
import Home from "./components/Home";

function App() {
  localStorage.setItem("userName", "Raghav");
  localStorage.setItem("employeeId", 1234);

  return (
    <>
      <Home />
    </>
  );
}

export default App;
