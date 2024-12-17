"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import "@/app/globals.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  RefreshCw,
  UserCheck,
  UserX,
  KeyRound,
  Lock,
  LockOpen,
} from "lucide-react";

// Password Reset Dialog Component
function PasswordResetDialog({ user, onClose, onSubmit }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!newPassword || !confirmPassword) {
      setError("Both fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    onSubmit(newPassword);
  };

  return (
    <AlertDialog open={!!user} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="text-lg font-semibold text-gray-800">
            Reset Password for {user?.username}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Enter a new password for this user.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
              placeholder="Confirm new password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <AlertDialogFooter className="flex justify-end space-x-3">
          <AlertDialogCancel
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Reset Password
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Status Action Dialog Component
function StatusActionDialog({ isOpen, user, type, onClose, onConfirm }) {
  const dialogConfig =
    {
      activate: {
        title: "Activate User",
        description: "Are you sure you want to activate this user?",
        action: "Activate",
      },
      deactivate: {
        title: "Deactivate User",
        description: "Are you sure you want to deactivate this user?",
        action: "Deactivate",
      },
    }[type] || {};

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="text-lg font-semibold text-gray-800">
            {dialogConfig.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            {dialogConfig.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-end space-x-3">
          <AlertDialogCancel
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={onConfirm}
          >
            {dialogConfig.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main Users Page Component
function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [passwordResetUser, setPasswordResetUser] = useState(null);

  // Query and Mutations
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = trpc.user.getUsers.useQuery({
    page,
    limit: 10,
    search,
  });

  const activateUser = trpc.user.activate.useMutation({
    onSuccess: () => {
      toast.success("User activated successfully");
      refetch();
      handleCloseActionDialog();
    },
    onError: (error) => {
      toast.error(`Failed to activate user: ${error.message}`);
    },
  });

  const deactivateUser = trpc.user.deactivate.useMutation({
    onSuccess: () => {
      toast.success("User deactivated successfully");
      refetch();
      handleCloseActionDialog();
    },
    onError: (error) => {
      toast.error(`Failed to deactivate user: ${error.message}`);
    },
  });

  const freezeWallet = trpc.wallet.freeze.useMutation({
    onSuccess: () => {
      toast.success("Wallet frozen successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to freeze wallet: ${error.message}`);
    },
  });

  const unfreezeWallet = trpc.wallet.unfreeze.useMutation({
    onSuccess: () => {
      toast.success("Wallet unfrozen successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to unfreeze wallet: ${error.message}`);
    },
  });

  const resetPassword = trpc.user.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully");
      setPasswordResetUser(null);
    },
    onError: (error) => {
      toast.error(`Failed to reset password: ${error.message}`);
    },
  });

  // Handlers
  const handleCloseActionDialog = () => {
    setSelectedUser(null);
    setActionType(null);
  };

  const handleStatusAction = () => {
    if (!selectedUser) return;

    if (actionType === "activate") {
      activateUser.mutate(selectedUser.id);
    } else if (actionType === "deactivate") {
      deactivateUser.mutate(selectedUser.id);
    }
  };

  const handleWalletAction = (user) => {
    if (!user.Wallet) {
      toast.error(`Wallet is not created for user ${user.username}`);
      return;
    }

    if (user.walletFrozen) {
      unfreezeWallet.mutate(user.id);
    } else {
      freezeWallet.mutate(user.id);
    }
  };

  const handlePasswordReset = (newPassword) => {
    if (passwordResetUser) {
      resetPassword.mutate({
        email: passwordResetUser.email,
        newPassword,
      });
    }
  };

  // Loading and Error States
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="animate-spin text-gray-500" size={48} />
      </div>
    );

  console.log(usersData);

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <h2 className="text-xl font-semibold">Error Loading Users</h2>
        <p className="mt-2">{error.message}</p>
        <Button
          onClick={() => refetch()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
      </div>

      <div className="flex space-x-4">
        <Input
          type="text"
          placeholder="Search users by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Table className="shadow-lg border rounded-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Wallet Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersData?.users.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50">
              <TableCell className="px-4 py-3 text-gray-800">
                {user.username}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-600">
                {user.email}
              </TableCell>
              <TableCell className="px-4 py-3">
                <span
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${
                      user.frozen
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }  
                  `}
                >
                  {user.frozen ? "Inactive" : "Active"}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3">
                {user.Wallet ? (
                  <span
                    className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${
          user.walletFrozen
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }
      `}
                  >
                    {user.walletFrozen ? "Frozen" : "Active"}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                    Not Created
                  </span>
                )}
              </TableCell>
              <TableCell className="px-4 py-3 text-right space-x-2">
                <Button
                  size="sm"
                  className={`px-4 py-2 ${
                    user.frozen
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white rounded-lg`}
                  onClick={() => {
                    setSelectedUser(user);
                    setActionType(user.frozen ? "activate" : "deactivate");
                  }}
                >
                  {user.frozen ? (
                    <UserCheck className="mr-2" />
                  ) : (
                    <UserX className="mr-2" />
                  )}
                  {user.frozen ? "Activate" : "Deactivate"}
                </Button>

                <Button
                  size="sm"
                  className={`px-4 py-2 ${
                    user.Wallet
                      ? user.walletFrozen
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-red-600 hover:bg-red-700"
                      : "bg-gray-400 cursor-not-allowed"
                  } text-white rounded-lg`}
                  onClick={() => handleWalletAction(user)}
                  disabled={!user.Wallet}
                >
                  {user.Wallet ? (
                    user.walletFrozen ? (
                      <>
                        <LockOpen className="mr-2" />
                        Unfreeze Wallet
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2" />
                        Freeze Wallet
                      </>
                    )
                  ) : (
                    <>
                      <Lock className="mr-2" />
                      Wallet Not Created
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  onClick={() => setPasswordResetUser(user)}
                >
                  <KeyRound className="mr-2" /> Reset Password
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-6">
        <Button
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-gray-600">
          Page {page} of {usersData?.pagination.totalPages}
        </span>
        <Button
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page === usersData?.pagination.totalPages}
        >
          Next
        </Button>
      </div>

      {/* Dialogs */}
      <StatusActionDialog
        isOpen={!!selectedUser && !!actionType}
        user={selectedUser}
        type={actionType}
        onClose={handleCloseActionDialog}
        onConfirm={handleStatusAction}
      />

      <PasswordResetDialog
        user={passwordResetUser}
        onClose={() => setPasswordResetUser(null)}
        onSubmit={handlePasswordReset}
      />
    </div>
  );
}

export default UsersPage;
