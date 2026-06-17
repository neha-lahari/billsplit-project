import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Account() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/users/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (!res.ok) throw new Error("Failed to fetch");

                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setUser({ username: "Error", email: "", profilePic: "" });
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/");
    };

    if (!user) {
        return (
            <div className="account-container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto text-slate-200 space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-green-300">
                    Account
                </h2>
            </div>

            {/* Profile Card */}
            <div
                onClick={() => navigate("/dashboard/profile")}
                className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:border-green-500/40 transition"
            >
                <div className="flex items-center gap-4">
                    <img
                        src={
                            user.profilePic
                                ? `${process.env.REACT_APP_API_URL}${user.profilePic}`
                                : "https://placehold.co/60"
                        }
                        alt="Avatar"
                        className="w-14 h-14 rounded-full object-cover border border-green-400/30"
                    />

                    <div>
                        <h3 className="text-base font-medium text-slate-200">
                            {user.username}
                        </h3>
                        <p className="text-sm text-slate-400">
                            {user.email}
                        </p>
                    </div>
                </div>

                <span className="text-sm text-green-300">
                    Edit →
                </span>
            </div>

            {/* Account Options */}
            <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl divide-y divide-slate-700">

                <div
                    onClick={() => navigate("/dashboard/scan")}
                    className="px-6 py-4 text-sm hover:bg-slate-800 transition cursor-pointer"
                >
                    Scan Code
                </div>

                <div className="px-6 py-4 text-sm hover:bg-slate-800 transition cursor-pointer">
                    Splitwise Pro
                </div>
            </div>

            <div>
                <h4 className="text-sm text-slate-400 mb-3">Preferences</h4>
                <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl divide-y divide-slate-700">
                    <div className="px-6 py-4 text-sm hover:bg-slate-800 transition cursor-pointer">
                        Email Settings
                    </div>
                    <div className="px-6 py-4 text-sm hover:bg-slate-800 transition cursor-pointer">
                        Notifications
                    </div>
                    <div className="px-6 py-4 text-sm hover:bg-slate-800 transition cursor-pointer">
                        Security
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm text-slate-400 mb-3">Feedback</h4>
                <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl divide-y divide-slate-700">
                    <div className="px-6 py-4 text-sm hover:bg-slate-800 transition cursor-pointer">
                        Rate BillSplit
                    </div>
                    <div className="px-6 py-4 text-sm hover:bg-slate-800 transition cursor-pointer">
                        Contact Support
                    </div>
                </div>
            </div>

            {/* Logout */}
            <div>
                <button
                    onClick={handleLogout}
                    className="w-full py-3 rounded-xl border border-red-400/40 text-red-400 text-sm hover:bg-red-500/20 transition"
                >
                    Logout
                </button>
            </div>

        </div>
    );
}

export default Account;