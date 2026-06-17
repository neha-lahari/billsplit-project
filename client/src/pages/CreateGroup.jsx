import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateGroup() {
    const [groupName, setGroupName] = useState("");
    const [groupType, setGroupType] = useState("");
    const [friendsList, setFriendsList] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const navigate = useNavigate();
    const API = process.env.REACT_APP_API_URL;

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch(`${API}/api/friends/status`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                setFriendsList(data.friends || []);
            } catch (err) {
                console.error("Error loading friends:", err);
            }
        };

        fetchFriends();
    }, [API, token]);

    const toggleFriend = (username) => {
        setSelectedFriends((prev) =>
            prev.includes(username)
                ? prev.filter((name) => name !== username)
                : [...prev, username]
        );
    };

    const handleSubmit = async () => {
        if (!groupName.trim()) return alert("Enter group name");
        if (!groupType) return alert("Select group type");
        if (selectedFriends.length === 0) return alert("Select friends");

        try {
            const res = await fetch(`${API}/api/groups`, {
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
                if (data.notFriends) {
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
                    className="text-slate-400 hover:text-green-300 text-sm"
                >
                    ← Back
                </button>

                <h2 className="text-xl font-semibold text-green-300">
                    Create New Group
                </h2>

                <button
                    onClick={handleSubmit}
                    className="px-4 py-1.5 rounded-md bg-green-500/20 border border-green-400/40 text-green-300 text-sm hover:bg-green-500/30"
                >
                    Done
                </button>
            </div>

            <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-8 space-y-8">

                <div>
                    <label className="block text-sm text-slate-400 mb-2">
                        Group Name
                    </label>

                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full bg-slate-900 border border-green-900/40 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-400"
                        placeholder="Trip to Goa"
                    />
                </div>

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
                    Members can add expenses after group creation.
                </p>
            </div>
        </div>
    );
}