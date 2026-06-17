import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const API = process.env.REACT_APP_API_URL;

const COLORS = [
    "#22c55e", "#16a34a", "#4ade80", "#15803d",
    "#34d399", "#059669", "#10b981", "#065f46",
];

function GroupPieChart() {
    const { groupId } = useParams();
    const [categoryData, setCategoryData] = useState([]);
    const [paidData, setPaidData] = useState([]);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem("token");

                const groupRes = await fetch(
                    `${API}/api/groups/${groupId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const groupData = await groupRes.json();

                const members = groupData.group?.members || [];

                const memberMap = {};
                members.forEach((m) => {
                    memberMap[m._id] = m.username;
                });

                const expRes = await fetch(
                    `${API}/api/expenses/group/${groupId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const expData = await expRes.json();
                const expensesList = expData.expenses || [];
                setExpenses(expensesList);

                // CATEGORY DATA
                const categoryMap = {};
                expensesList.forEach((exp) => {
                    categoryMap[exp.category] =
                        (categoryMap[exp.category] || 0) + exp.amount;
                });

                setCategoryData(
                    Object.keys(categoryMap).map((cat) => ({
                        name: cat,
                        value: categoryMap[cat],
                    }))
                );

                // PAID DATA
                const paidMap = {};
                expensesList.forEach((exp) => {
                    exp.participants.forEach((p) => {
                        if (p.paid > 0) {
                            const username = memberMap[p.user];
                            if (username) {
                                paidMap[username] =
                                    (paidMap[username] || 0) + p.paid;
                            }
                        }
                    });
                });

                setPaidData(
                    Object.keys(paidMap).map((user) => ({
                        name: user,
                        value: paidMap[user],
                    }))
                );

            } catch (err) {
                console.error("Error fetching chart data:", err);
            }
        };

        fetchAllData();
    }, [groupId]);

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm("Delete this expense?")) return;

        try {
            const res = await fetch(
                `${API}/api/expenses/${expenseId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!res.ok) {
                alert("Error deleting expense");
                return;
            }

            setExpenses((prev) =>
                prev.filter((exp) => exp._id !== expenseId)
            );

        } catch (err) {
            console.error("Error deleting expense:", err);
        }
    };

    return (
        <div className="space-y-10">

            <h3 className="text-xl font-semibold text-green-400">
                Expenses Overview
            </h3>

            {categoryData.length === 0 ? (
                <div className="text-slate-400">
                    No expenses to show.
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 gap-10">

                        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg">
                            <h4 className="text-slate-300 mb-4 font-medium">
                                By Category
                            </h4>

                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={90}
                                        label
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell
                                                key={index}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg">
                            <h4 className="text-slate-300 mb-4 font-medium">
                                Paid By
                            </h4>

                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={paidData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={50}
                                        outerRadius={90}
                                        label
                                    >
                                        {paidData.map((_, index) => (
                                            <Cell
                                                key={index}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-2xl shadow-md space-y-4">
                        <h4 className="text-slate-300 font-medium">
                            All Expenses
                        </h4>

                        {expenses.map((ex) => (
                            <div
                                key={ex._id}
                                className="flex justify-between items-center bg-slate-900 px-4 py-3 rounded-xl hover:bg-slate-700 transition"
                            >
                                <span className="text-slate-200">
                                    {ex.category} – ₹{ex.amount}
                                </span>

                                <button
                                    onClick={() => handleDeleteExpense(ex._id)}
                                    className="text-red-400 hover:text-red-500 text-lg transition"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default GroupPieChart;