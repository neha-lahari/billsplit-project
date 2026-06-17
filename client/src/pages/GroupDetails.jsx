import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupPieChart from "../pages/PieChart";

function GroupDetails() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const API = process.env.REACT_APP_API_URL;

    const [group, setGroup] = useState(null);
    const [balances, setBalances] = useState({});

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const res = await fetch(
                    `${API}/api/groups/${groupId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const data = await res.json();
                setGroup(data.group);
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };

        const fetchBalances = async () => {
            try {
                const res = await fetch(
                    `${API}/api/group/${groupId}/balances`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const data = await res.json();
                setBalances(data.balances || {});
            } catch (err) {
                console.error("Error fetching balances:", err);
            }
        };

        fetchGroup();
        fetchBalances();
    }, [groupId, API]);

    const handleRemove = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member?"))
            return;

        try {
            const res = await fetch(
                `${API}/api/groups/${group._id}/removeMember`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ memberId }),
                }
            );

            const data = await res.json();
            if (!res.ok) return alert(data.message || "Failed to remove");

            setGroup((prev) => ({
                ...prev,
                members: prev.members.filter(
                    (m) => m._id.toString() !== memberId.toString()
                ),
            }));
        } catch (err) {
            alert("Something went wrong: " + err.message);
        }
    };

    const handleAddMembers = async (newMemberUsernames) => {
        try {
            const res = await fetch(
                `${API}/api/groups/${group._id}/addMembers`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ members: newMemberUsernames }),
                }
            );

            const data = await res.json();
            if (!res.ok) return alert(data.message || "Failed to add members");

            setGroup((prev) => ({
                ...prev,
                members: [
                    ...prev.members,
                    ...data.group.members.filter(
                        (m) =>
                            !prev.members.some(
                                (old) => old._id.toString() === m._id.toString()
                            )
                    ),
                ],
            }));
        } catch (err) {
            alert("Something went wrong: " + err.message);
        }
    };

    if (!group) {
        return (
            <div className="text-center py-20 text-slate-400">
                Loading group details...
            </div>
        );
    }

    return (
        <div className="px-6 md:px-10 py-8 space-y-10 max-w-7xl mx-auto">

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100 mb-1">
                        {group.name}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {group.members.length} members
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(`/group/${group._id}/add-members`)}
                        className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-xl shadow-lg transition font-semibold text-sm"
                    >
                        + Add Members
                    </button>

                    <button
                        onClick={() => navigate(`/group/${group._id}/add-expense`)}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-slate-100 rounded-xl shadow-lg transition font-semibold text-sm"
                    >
                        + Add Expense
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4 text-slate-300">
                    Members
                </h3>

                <div className="flex flex-wrap gap-3">
                    {group.members.map((member) => (
                        <div
                            key={member._id}
                            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition"
                        >
                            <span className="text-slate-200">
                                {member.username}
                            </span>

                            {group.createdBy._id.toString() === userId.toString() &&
                                member._id.toString() !== userId.toString() && (
                                    <span
                                        onClick={() => handleRemove(member._id)}
                                        className="cursor-pointer text-red-400 hover:text-red-500"
                                    >
                                        ✕
                                    </span>
                                )}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4 text-slate-300">
                    Category-wise Expenses
                </h3>

                <div className="bg-slate-800 p-6 rounded-xl shadow-md">
                    <GroupPieChart groupId={groupId} />
                </div>
            </div>

            {balances && Object.keys(balances).length > 0 && (
                <div>
                    <h3 className="text-lg font-medium mb-5 text-slate-300">
                        Balances
                    </h3>

                    <div className="space-y-4">
                        {Object.keys(balances).map((person) => (
                            <div
                                key={person}
                                className="p-5 bg-slate-800 rounded-xl shadow"
                            >
                                <h4 className="text-green-400 font-medium mb-3">
                                    {person}
                                </h4>

                                {balances[person].owes.length > 0 && (
                                    <div className="text-red-400 text-sm mb-2 space-y-1">
                                        <div className="font-medium">Owes:</div>
                                        {balances[person].owes.map((item, idx) => (
                                            <div key={idx}>
                                                {item.to} ₹{item.amount}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {balances[person].receives.length > 0 && (
                                    <div className="text-green-400 text-sm space-y-1">
                                        <div className="font-medium">Receives:</div>
                                        {balances[person].receives.map((item, idx) => (
                                            <div key={idx}>
                                                {item.from} ₹{item.amount}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {balances[person].owes.length === 0 &&
                                    balances[person].receives.length === 0 && (
                                        <div className="text-slate-400 text-sm">
                                            Settled up
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GroupDetails;