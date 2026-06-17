import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

export default function AddExpense() {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [splitType, setSplitType] = useState("");

    const [paidBy, setPaidBy] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    const [selectedPayers, setSelectedPayers] = useState([]);
    const [paidSplits, setPaidSplits] = useState({});
    const [percentageSplits, setPercentageSplits] = useState({});

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`${API}/api/groups/${groupId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                const groupMembers = data.group?.members || [];
                setMembers(groupMembers);

                const initialPaid = {};
                const initialPercent = {};

                groupMembers.forEach((m) => {
                    initialPaid[m._id] = 0;
                    initialPercent[m._id] = 0;
                });

                setPaidSplits(initialPaid);
                setPercentageSplits(initialPercent);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMembers();
    }, [groupId, token]);

    const toggleParticipant = (userId) => {
        setSelectedParticipants((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );

        setSelectedPayers((prev) => prev.filter((id) => id !== userId));
    };

    const togglePayer = (userId) => {
        setSelectedPayers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async () => {
        if (!amount || !category || !splitType)
            return alert("Fill all fields");

        const totalAmount = Number(amount);

        if (totalAmount <= 0)
            return alert("Amount must be greater than 0");

        if (selectedParticipants.length === 0)
            return alert("Select at least one participant");

        let participants = [];

        if (splitType === "equal") {
            if (!paidBy) return alert("Select who paid");

            const share = Number(
                (totalAmount / selectedParticipants.length).toFixed(2)
            );

            participants = selectedParticipants.map((id) => ({
                user: id,
                paid: id === paidBy ? totalAmount : 0,
                owes: share,
            }));
        }

        else if (splitType === "exact") {
            const totalPaid = selectedPayers.reduce(
                (sum, id) => sum + Number(paidSplits[id] || 0),
                0
            );

            if (Number(totalPaid.toFixed(2)) !== Number(totalAmount.toFixed(2)))
                return alert("Total paid must equal total amount");

            const share = Number(
                (totalAmount / selectedParticipants.length).toFixed(2)
            );

            participants = selectedParticipants.map((id) => ({
                user: id,
                paid: selectedPayers.includes(id)
                    ? Number(paidSplits[id] || 0)
                    : 0,
                owes: share,
            }));
        }

        else if (splitType === "percentage") {
            const totalPercent = selectedParticipants.reduce(
                (sum, id) => sum + Number(percentageSplits[id] || 0),
                0
            );

            if (Number(totalPercent.toFixed(2)) !== 100)
                return alert("Total percentage must equal 100");

            participants = selectedParticipants.map((id) => ({
                user: id,
                paid: 0,
                owes: Number(
                    ((percentageSplits[id] || 0) / 100) * totalAmount
                ).toFixed(2),
            }));
        }

        const res = await fetch(`${API}/api/expenses/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                groupId,
                amount: totalAmount,
                category,
                splitType,
                participants,
            }),
        });

        const data = await res.json();

        if (!res.ok) return alert(data.message);

        alert("Expense added!");
        navigate(`/group/${groupId}`);
    };

    return (
        <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-2xl space-y-6">

            <h2 className="text-xl font-semibold text-green-400">
                Add Expense
            </h2>

            <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 text-sm rounded-lg bg-slate-900 border border-slate-700"
            />

            <input
                type="number"
                placeholder="Total Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 text-sm rounded-lg bg-slate-900 border border-slate-700"
            />

            <div className="flex gap-6 text-sm text-slate-300">
                {["equal", "exact", "percentage"].map((type) => (
                    <label key={type} className="flex gap-2">
                        <input
                            type="radio"
                            value={type}
                            checked={splitType === type}
                            onChange={(e) => {
                                setSplitType(e.target.value);
                                setPaidBy("");
                            }}
                        />
                        {type}
                    </label>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                {members.map((m) => (
                    <label
                        key={m._id}
                        className="flex gap-2 p-2 bg-slate-900 rounded-lg"
                    >
                        <input
                            type="checkbox"
                            checked={selectedParticipants.includes(m._id)}
                            onChange={() => toggleParticipant(m._id)}
                        />
                        {m.username}
                    </label>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                className="w-full py-2 bg-green-600 rounded-lg"
            >
                Add Expense
            </button>
        </div>
    );
}