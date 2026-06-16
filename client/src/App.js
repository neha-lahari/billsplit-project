import React from "react";
import { Navigate, BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/LoginTemp";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Group from "./pages/Groups";
import CreateGroup from "./pages/CreateGroup";
import Friends from "./pages/Friends";
import Account from "./pages/Account";
import Activity from "./pages/Activity";
import GroupDetails from "./pages/GroupDetails";
import AddExpense from "./pages/AddExpense";
import Profile from "./pages/Profile";
import ScanQR from "./pages/scanner";
import OAuthSuccess from "./pages/OAuthSuccess";

import AddMembersToGroup from "./pages/AddMembersToGroup";

import "./index.css";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="groups" replace />} />
          <Route path="groups" element={<Group />} />
          <Route path="groups/create" element={<CreateGroup />} />
          <Route path="friends" element={<Friends />} />
          <Route path="activity" element={<Activity />} />
          <Route path="account" element={<Account />} />
          <Route path="profile" element={<Profile />} />
          <Route path="scan" element={<ScanQR />} />
        </Route>

        <Route path="/group/:groupId" element={<GroupDetails />} />
        <Route path="/group/:groupId/add-members" element={<AddMembersToGroup />} />
        <Route path="/group/:groupId/add-expense" element={<AddExpense />} />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;