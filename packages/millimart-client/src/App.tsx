import { IconContext } from "react-icons";
import { LuBug, LuHome, LuStore } from "react-icons/lu";
import "./App.css";
import { DebugContent } from "./features/debug/DebugContent";

export const App = () => {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="navbar bg-base-100 sticky top-0 z-50 shadow-md">
        <div className="navbar-start"></div>
        <div className="navbar-center">
          <span className="text-xl">
            <span className="me-1">🍅</span>
            <span className="font-bold">MilliMart</span>
          </span>
        </div>
        <div className="navbar-end"></div>
      </div>
      <div className="p-4">
        <DebugContent />
      </div>
      <div className="btm-nav">
        <IconContext.Provider
          value={{ style: { display: "inline-block" }, size: "1.5em" }}
        >
          <button className="disabled">
            <LuHome />
            <span className="btm-nav-label">Home</span>
          </button>
          <button className="disabled">
            <LuStore />
            <span className="btm-nav-label">Market</span>
          </button>
          <button className="active">
            <LuBug />
            <span className="btm-nav-label">Debug</span>
          </button>
        </IconContext.Provider>
      </div>
    </div>
  );
};
