import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

    useEffect(() => {
        const fetchMembers = async () => {
            const res = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await res.json();
            const groupMembers = data.group?.members || [];
            setMembers(groupMembers);

            const initialPaid = {};
            const initialPercent = {};

            groupMembers.forEach(m => {
                initialPaid[m._id] = 0;
                initialPercent[m._id] = 0;
            });

            setPaidSplits(initialPaid);
            setPercentageSplits(initialPercent);
        };

        fetchMembers();
    }, [groupId]);

    const toggleParticipant = (userId) => {
        if (selectedParticipants.includes(userId)) {
            setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
            setSelectedPayers(selectedPayers.filter(id => id !== userId));
        } else {
            setSelectedParticipants([...selectedParticipants, userId]);
        }
    };

    const togglePayer = (userId) => {
        if (selectedPayers.includes(userId)) {
            setSelectedPayers(selectedPayers.filter(id => id !== userId));
        } else {
            setSelectedPayers([...selectedPayers, userId]);
        }
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

            if (!paidBy)
                return alert("Select who paid");

            if (!selectedParticipants.includes(paidBy))
                return alert("Payer must be part of selected participants");

            const share = Number((totalAmount / selectedParticipants.length).toFixed(2));

            participants = selectedParticipants.map(id => ({
                user: id,
                paid: id === paidBy ? totalAmount : 0,
                owes: share
            }));
        }

        else if (splitType === "exact") {

            if (selectedPayers.length === 0)
                return alert("Select at least one payer");

            const totalPaid = selectedPayers.reduce(
                (sum, id) => sum + Number(paidSplits[id] || 0),
                0
            );

            if (Number(totalPaid.toFixed(2)) !== Number(totalAmount.toFixed(2)))
                return alert("Total paid must equal total amount");

            const share = Number((totalAmount / selectedParticipants.length).toFixed(2));

            participants = selectedParticipants.map(id => ({
                user: id,
                paid: selectedPayers.includes(id) ? Number(paidSplits[id] || 0) : 0,
                owes: share
            }));
        }

        else if (splitType === "percentage") {

            const totalPercent = selectedParticipants.reduce(
                (sum, id) => sum + Number(percentageSplits[id] || 0),
                0
            );

            if (Number(totalPercent.toFixed(2)) !== 100)
                return alert("Total percentage must equal 100");

            participants = selectedParticipants.map(id => ({
                user: id,
                paid: 0,
                owes: Number(((percentageSplits[id] || 0) / 100 * totalAmount).toFixed(2))
            }));
        }

        const res = await fetch("http://localhost:5000/api/expenses/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                groupId,
                amount: totalAmount,
                category,
                splitType,
                participants
            }),
        });

        const data = await res.json();

        if (!res.ok) return alert(data.message);

        alert("Expense added!");
        navigate(`/group/${groupId}`);
    };

    return (
        <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-lg space-y-6">

            <h2 className="text-xl font-semibold text-green-400">
                Add Expense
            </h2>

            {/* Category */}
            <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Amount */}
            <input
                type="number"
                placeholder="Total Amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full p-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Split Type */}
            <div className="flex gap-6 text-sm text-slate-300">
                {["equal", "exact", "percentage"].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            value={type}
                            checked={splitType === type}
                            onChange={e => {
                                setSplitType(e.target.value);
                                setPaidBy("");
                            }}
                        />
                        <span className="capitalize">{type}</span>
                    </label>
                ))}
            </div>

            {/* Participants */}
            <div>
                <h4 className="text-slate-300 text-sm font-medium mb-2">
                    Select Participants
                </h4>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    {members.map(m => (
                        <label
                            key={m._id}
                            className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg cursor-pointer hover:bg-slate-700 transition"
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
            </div>

            {/* EQUAL */}
            {splitType === "equal" && (
                <>
                    <h4 className="text-slate-300 text-sm font-medium">
                        Who Paid?
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {selectedParticipants.map(id => {
                            const user = members.find(m => m._id === id);
                            return (
                                <label
                                    key={id}
                                    className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg cursor-pointer hover:bg-slate-700 transition"
                                >
                                    <input
                                        type="radio"
                                        name="paidBy"
                                        checked={paidBy === id}
                                        onChange={() => setPaidBy(id)}
                                    />
                                    {user?.username}
                                </label>
                            );
                        })}
                    </div>
                </>
            )}

            {/* EXACT */}
            {splitType === "exact" && (
                <>
                    <h4 className="text-slate-300 text-sm font-medium">
                        Select Who Paid
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {selectedParticipants.map(id => {
                            const user = members.find(m => m._id === id);
                            return (
                                <label
                                    key={id}
                                    className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg cursor-pointer hover:bg-slate-700 transition"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPayers.includes(id)}
                                        onChange={() => togglePayer(id)}
                                    />
                                    {user?.username}
                                </label>
                            );
                        })}
                    </div>

                    {selectedPayers.length > 0 && (
                        <>
                            <h4 className="text-slate-300 text-sm font-medium mt-3">
                                Enter Paid Amounts
                            </h4>

                            <div className="space-y-2 text-sm">
                                {selectedPayers.map(id => {
                                    const user = members.find(m => m._id === id);
                                    return (
                                        <div key={id} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                                            <span>{user?.username}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Paid ₹"
                                                className="w-28 p-1 text-sm rounded-md bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                onChange={e =>
                                                    setPaidSplits({
                                                        ...paidSplits,
                                                        [id]: Number(e.target.value)
                                                    })
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* PERCENTAGE */}
            {splitType === "percentage" && (
                <>
                    <h4 className="text-slate-300 text-sm font-medium">
                        Enter Percentages
                    </h4>

                    <div className="space-y-2 text-sm">
                        {selectedParticipants.map(id => {
                            const user = members.find(m => m._id === id);
                            return (
                                <div key={id} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                                    <span>{user?.username}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="%"
                                        className="w-20 p-1 text-sm rounded-md bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        onChange={e =>
                                            setPercentageSplits({
                                                ...percentageSplits,
                                                [id]: Number(e.target.value)
                                            })
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <button
                onClick={handleSubmit}
                className="w-full py-2 text-sm bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
            >
                Add Expense
            </button>
        </div>
    );
}
