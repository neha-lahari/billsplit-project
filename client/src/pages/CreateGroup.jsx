import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function CreateGroup() {
    const [groupName, setGroupName] = useState("");
    const [groupType, setGroupType] = useState("");
    const [friendsList, setFriendsList] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/friends/status", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setFriendsList(data.friends || []);
            } catch (err) {
                console.error("Error loading friends:", err);
            }
        };
        fetchFriends();
    }, [token]);

    const toggleFriend = (username) => {
        setSelectedFriends((prev) => {
            const isAlreadySel = prev.includes(username);
            if (isAlreadySel) {
                const updatedList = prev.filter(name => name !== username);
                return updatedList;
            } else {
                const updatedList = [...prev, username];
                return updatedList;
            }
        });
    };

    const handleSubmit = async () => {
        if (!groupName.trim()) {
            return alert("Please enter a group name");
        }
        if (selectedFriends.length === 0) {
            return alert("Please select at least one friend");
        }
        if (!groupType) {
            return alert("Please select a group type");
        }
        try {
            const res = await fetch("http://localhost:5000/api/groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: groupName,
                    members: selectedFriends,
                    type: groupType,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.notFriends !== undefined) {
                    alert(`${data.message}: ${data.notFriends.join(", ")}`);
                } else {
                    alert(data.message || "Failed to create group");
                }
                return;
            }
            alert("Group created successfully!");
            navigate("/dashboard/groups");
        } catch (err) {
            alert("Something went wrong: " + err.message);
        }
    };

    return (
        <div className="max-w-3xl mx-auto text-slate-200">

            <div className="flex items-center justify-between mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-400 hover:text-green-300 transition text-sm"
                >
                    ← Back
                </button>

                <h2 className="text-xl font-semibold text-green-300">
                    Create New Group
                </h2>

                <button
                    onClick={handleSubmit}
                    className="px-4 py-1.5 rounded-md bg-green-500/20 border border-green-400/40 text-green-300 text-sm hover:bg-green-500/30 transition"
                >
                    Done
                </button>
            </div>

            {/* Card */}
            <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-8 space-y-8">

                {/* Group Name */}
                <div>
                    <label className="block text-sm text-slate-400 mb-2">
                        Group Name
                    </label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full bg-slate-900 border border-green-900/40 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-400 transition"
                        placeholder="Trip to Goa"
                    />
                </div>

                {/* Friends Selection */}
                <div>
                    <label className="block text-sm text-slate-400 mb-3">
                        Select Friends
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        {friendsList.map((friend) => {
                            const selected = selectedFriends.includes(friend.username);
                            return (
                                <button
                                    key={friend._id}
                                    type="button"
                                    onClick={() => toggleFriend(friend.username)}
                                    className={`text-sm px-4 py-2 rounded-lg border transition
                                    ${selected
                                            ? "bg-green-500/20 border-green-400 text-green-300"
                                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-green-400/40"
                                        }`}
                                >
                                    {friend.username}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Group Type */}
                <div>
                    <label className="block text-sm text-slate-400 mb-3">
                        Group Type
                    </label>

                    <div className="flex flex-wrap gap-3">
                        {["Travel", "Home", "Couple", "Other"].map((type) => {
                            const active = groupType === type;
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setGroupType(type)}
                                    className={`px-4 py-2 text-sm rounded-lg border transition
                                    ${active
                                            ? "bg-green-500/20 border-green-400 text-green-300"
                                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-green-400/40"
                                        }`}
                                >
                                    {type}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <p className="text-xs text-slate-500">
                    Members will be able to add expenses and settle balances once the group is created.
                </p>

            </div>
        </div>
    );
}
