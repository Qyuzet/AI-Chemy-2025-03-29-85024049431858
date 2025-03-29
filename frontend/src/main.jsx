import React from "react";
import ReactDOM from "react-dom/client";
import Navbar from "./navbar";
import HomePage from "./home";
import Footer from "./footer";
import "/index.css";

const App = () => {
  return (
      <div className="flex flex-col min-h-screen max-w-full">
        <Navbar />
        <main className="flex-grow bg-black">
           <HomePage />
        </main>
        <Footer />
      </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;