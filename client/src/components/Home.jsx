import React from "react";
import Messages from "./Messages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GreetingCard from "./Cards/Card";
import CardsList from "./Cards/CardList";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Login from "./LogInScreen";

const Home = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <Router>
          <Routes>
            <Route path="/Login" element={<Login />} />
            <Route path="/" element={<CardsList />} />
            <Route path="/cards/:cardId" element={<GreetingCard />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={2000} closeOnClick />
        </Router>
      </div>
    </DndProvider>
  );
};

export default Home;
