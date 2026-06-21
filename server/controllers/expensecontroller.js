const Expense = require('../models/expenses');
const Group = require('../models/groups');
const Activity = require('../models/activity');


exports.addExpense = async (req, res) => {
    const { groupId, amount, category, splitType, participants } = req.body;

    try {
        const group = await Group.findById(groupId);
        if (!group)
            return res.status(404).json({ message: "Group not found" });

        if (!participants || !Array.isArray(participants) || participants.length === 0)
            return res.status(400).json({ message: "Participants required" });

        const totalAmount = Number(amount);
        if (totalAmount <= 0)
            return res.status(400).json({ message: "Amount must be greater than 0" });

        const groupMemberIds = group.members.map(m => m.toString());

        for (let p of participants) {
            if (!groupMemberIds.includes(p.user)) {
                return res.status(400).json({
                    message: "Participant not in group"
                });
            }
        }

        const uniqueUsers = new Set(participants.map(p => p.user));
        if (uniqueUsers.size !== participants.length)
            return res.status(400).json({
                message: "Duplicate participants not allowed"
            });

        let formattedParticipants = participants.map(p => ({
            user: p.user,
            paid: Number(p.paid) || 0,
            owes: 0
        }));

        if (splitType === "equal") {
            const share = Number((totalAmount / formattedParticipants.length).toFixed(2));
            formattedParticipants.forEach(p => { p.owes = share; });
        }

        else if (splitType === "exact") {
            const share = Number((totalAmount / formattedParticipants.length).toFixed(2));
            formattedParticipants.forEach(p => { p.owes = share; });
        }

        else if (splitType === "percentage") {
            const totalPercent = participants.reduce(
                (sum, p) => sum + Number(p.percentage || 0),
                0
            );

            if (Number(totalPercent.toFixed(2)) !== 100) {
                return res.status(400).json({
                    message: "Total percentage must equal 100"
                });
            }

            formattedParticipants = formattedParticipants.map((p, index) => {
                const percent = Number(participants[index].percentage);
                return {
                    ...p,
                    owes: Number(((percent / 100) * totalAmount).toFixed(2))
                };
            });
        }

        else {
            return res.status(400).json({ message: "Invalid split type" });
        }

        const totalPaid = formattedParticipants.reduce(
            (sum, p) => sum + p.paid,
            0
        );

        if (Number(totalPaid.toFixed(2)) !== Number(totalAmount.toFixed(2))) {
            return res.status(400).json({
                message: "Total paid must equal total amount"
            });
        }

        const newExpense = new Expense({
            group: groupId,
            amount: totalAmount,
            category,
            addedBy: req.user.userId,
            participants: formattedParticipants,
            splitType
        });

        await newExpense.save();

        await Activity.create({
            user: req.user.userId,
            group: group._id,
            groupName: group.name,
            type: "expense_added",
            amount: totalAmount
        });

        res.status(201).json(newExpense);

    } catch (err) {
        console.error("Add expense error:", err);
        res.status(500).json({ error: err.message });
    }
};


exports.deleteExpense = async (req, res) => {
    const expenseId = req.params.id;

    try {
        const expense = await Expense.findById(expenseId);

        if (!expense)
            return res.status(404).json({ message: 'Expense not found' });

        if (expense.addedBy.toString() !== req.user.userId)
            return res.status(403).json({
                message: 'Only the creator can delete this expense'
            });

        const group = await Group.findById(expense.group);

        await expense.deleteOne();

        await Activity.create({
            user: req.user.userId,
            group: expense.group,
            groupName: group?.name || "Unknown Group",
            type: "expense_deleted",
            amount: expense.amount
        });

        res.status(200).json({ message: "Expense deleted successfully" });

    } catch (err) {
        console.error("Delete expense error:", err);
        res.status(500).json({ error: err.message });
    }
};


exports.getGroupExpenses = async (req, res) => {
    const { groupId } = req.params;

    try {
        const expenses = await Expense
            .find({ group: groupId })
            .sort({ date: -1 });

        res.json({ expenses });

    } catch (err) {
        res.status(500).json({ error: "Failed to get expenses" });
    }
};