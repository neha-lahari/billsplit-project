const User = require("../models/user");
const Group = require("../models/groups");
const Expense = require("../models/expenses");

exports.Balances = async (req, res) => {
    const groupId = req.params.groupId;

    try {
        const group = await Group.findById(groupId).populate("members", "username");
        if (!group) return res.status(404).json({ message: "Group not found" });

        const expenses = await Expense.find({ group: groupId });

        const categoryExpenses = {};
        const paidByUser = {};

        const netBalances = {};
        for (let member of group.members) {
            netBalances[member._id.toString()] = 0;
        }

        for (let ex of expenses) {
            if (!ex.participants || !Array.isArray(ex.participants)) continue;

            categoryExpenses[ex.category] =
                (categoryExpenses[ex.category] || 0) + ex.amount;

            for (let p of ex.participants) {
                const uid = p.user.toString();

                if (!netBalances.hasOwnProperty(uid)) {
                    netBalances[uid] = 0;
                }

                paidByUser[uid] = (paidByUser[uid] || 0) + p.paid;

                netBalances[uid] += p.paid - p.owes;
            }
        }

        const usernames = {};
        for (let member of group.members) {
            usernames[member._id.toString()] = member.username;
        }

        const balancesRaw = {};
        for (let uid in netBalances) {
            balancesRaw[uid] = { owes: [], receives: [] };
        }

        const debtors = [];
        const creditors = [];

        for (let uid in netBalances) {
            const amt = Number(netBalances[uid].toFixed(2));
            if (amt < 0) debtors.push({ uid, amt: -amt });
            else if (amt > 0) creditors.push({ uid, amt });
        }

        // Sort for cleaner matching
        debtors.sort((a, b) => b.amt - a.amt);
        creditors.sort((a, b) => b.amt - a.amt);

        let i = 0, j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            const amount = Math.min(debtor.amt, creditor.amt);

            balancesRaw[debtor.uid].owes.push({
                to: usernames[creditor.uid],
                amount: Number(amount.toFixed(2)),
            });

            balancesRaw[creditor.uid].receives.push({
                from: usernames[debtor.uid],
                amount: Number(amount.toFixed(2)),
            });

            debtor.amt -= amount;
            creditor.amt -= amount;

            if (debtor.amt === 0) i++;
            if (creditor.amt === 0) j++;
        }

        const paidByUsername = {};
        for (let uid in paidByUser) {
            paidByUsername[usernames[uid]] =
                Number(paidByUser[uid].toFixed(2));
        }

        const balancesByUsername = {};
        for (let uid in balancesRaw) {
            const username = usernames[uid];
            balancesByUsername[username] = balancesRaw[uid];
        }

        const memberNames = group.members.map(m => m.username);

        res.json({
            members: memberNames,
            balances: balancesByUsername,
            categoryExpenses,
            paidByUser: paidByUsername,
        });

    } catch (err) {
        res.status(500).json({
            error: "Something went wrong",
            details: err.message
        });
    }
};

