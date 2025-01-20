import { useState, useEffect } from 'react';
import { Search, Ban, Unlock, Key, Trash2, Shield, ShieldOff } from 'lucide-react';
import { useUserStore } from '@/store/user';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { logger } from '@/utils/logger';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { 
    users, 
    banUser, 
    unbanUser, 
    deleteUser, 
    resetPassword, 
    setUserRole,
    initializeUsers 
  } = useUserStore();

  useEffect(() => {
    logger.debug('Mounting UserManagement component');
    initializeUsers();
  }, [initializeUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.nickname?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesStatus = !selectedStatus || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleBanUser = async () => {
    if (!selectedUserId || !banReason) return;
    
    try {
      banUser({ userId: selectedUserId, reason: banReason });
      setToast({ message: 'User banned successfully', type: 'success' });
      setShowBanModal(false);
      setBanReason('');
      setSelectedUserId(null);
    } catch (error) {
      setToast({ message: 'Failed to ban user', type: 'error' });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      unbanUser(userId);
      setToast({ message: 'User unbanned successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to unban user', type: 'error' });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword) return;
    try {
      await resetPassword({ userId: selectedUserId, newPassword });
      setToast({ message: 'Password reset successfully', type: 'success' });
      setShowResetModal(false);
      setNewPassword('');
      setSelectedUserId(null);
    } catch (error) {
      setToast({ message: 'Failed to reset password', type: 'error' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      deleteUser(userId);
      setToast({ message: 'User deleted successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to delete user', type: 'error' });
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'promote' : 'demote';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      setUserRole(userId, newRole);
      setToast({ 
        message: `User ${action}d to ${newRole.toLowerCase()} successfully`, 
        type: 'success' 
      });
    } catch (error) {
      setToast({ 
        message: `Failed to ${action} user`, 
        type: 'error' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">User Management</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-gray-800/50 border border-gray-700 pl-10 pr-4 py-2
                     text-white placeholder-gray-400
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-2
                     text-white
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-2
                     text-white
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>
      </div>

      {/* User List */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredUsers.map((user) => {
              const isAdmin = user.role === 'ADMIN';
              const isDefaultAdmin = user.id === 'admin-default';
              
              return (
                <tr key={user.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.nickname || user.email}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {(user.nickname || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">
                          {user.nickname || user.email}
                        </p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      isAdmin
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-blue-500/10 text-blue-400"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      user.status === 'ACTIVE'
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    )}>
                      {user.status}
                    </span>
                    {user.status === 'BANNED' && user.banReason && (
                      <p className="mt-1 text-xs text-gray-400">{user.banReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!isDefaultAdmin && (
                        <>
                          <button
                            onClick={() => handleToggleAdmin(user.id, user.role)}
                            className={cn(
                              "rounded p-1 hover:bg-gray-700",
                              isAdmin
                                ? "text-purple-400 hover:text-purple-300"
                                : "text-gray-400 hover:text-purple-400"
                            )}
                            title={isAdmin ? "Remove Admin" : "Make Admin"}
                          >
                            {isAdmin ? (
                              <ShieldOff className="h-4 w-4" />
                            ) : (
                              <Shield className="h-4 w-4" />
                            )}
                          </button>

                          {!isAdmin && (
                            <>
                              {user.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => {
                                    setSelectedUserId(user.id);
                                    setShowBanModal(true);
                                  }}
                                  className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-red-400"
                                  title="Ban User"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-green-400"
                                  title="Unban User"
                                >
                                  <Unlock className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedUserId(user.id);
                                  setShowResetModal(true);
                                }}
                                className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-yellow-400"
                                title="Reset Password"
                              >
                                <Key className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-red-400"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="py-8 text-center text-gray-400">
            No users found
          </div>
        )}
      </div>

      {/* Ban User Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-gray-900 p-6">
            <h2 className="text-xl font-semibold text-white">Ban User</h2>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-200">
                Reason for ban
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                         text-white placeholder-gray-400
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                rows={3}
                placeholder="Enter reason for ban"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                  setSelectedUserId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBanUser}
                disabled={!banReason}
              >
                Ban User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-gray-900 p-6">
            <h2 className="text-xl font-semibold text-white">Reset Password</h2>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-200">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                         text-white placeholder-gray-400
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                placeholder="Enter new password"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowResetModal(false);
                  setNewPassword('');
                  setSelectedUserId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={!newPassword}
              >
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
