import React from "react";
import Sidebar from "../components/sidebar";
import { Outlet } from "react-router-dom";

function Dashboard() {
    return (
        <div className="h-screen flex bg-slate-900 text-slate-200">

            <Sidebar />
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </div>

        </div>
    );
}

export default Dashboard;