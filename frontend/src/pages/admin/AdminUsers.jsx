import React, { useEffect, useState } from 'react';
import { 
    Users, 
    Search, 
    Trash2, 
    UserPlus, 
    Filter, 
    MoreVertical,
    Mail,
    Shield,
    Trash,
    UserCircle,
} from 'lucide-react';
import { apiGet, apiDelete } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, userName: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await apiGet('/admin/users');
            setUsers(response.data.users);
        } catch (err) {
            showToast('Failed to retrieve user list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await apiDelete(`/admin/user/${deleteModal.userId}`);
            showToast(`User ${deleteModal.userName} and all their data removed`, 'success');
            setUsers(users.filter(u => u._id !== deleteModal.userId));
            setDeleteModal({ open: false, userId: null, userName: '' });
        } catch (err) {
            showToast(err.message || 'Failed to delete user', 'error');
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage platform users and their access levels.</p>
                </div>
            </header>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                        <Filter size={18} /> Filter
                    </button>
                    <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-md shadow-indigo-100">
                        <UserPlus size={18} /> Add User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                        Fetching users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="bg-gray-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <Search className="text-gray-300" size={32} />
                                        </div>
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail size={12} /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none ${
                                            user.role === 'admin' 
                                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                            : user.role === 'clinician' 
                                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        }`}>
                                            {user.role === 'admin' ? <Shield size={12} /> : null}
                                            <span className="capitalize">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                title="View profile"
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            >
                                                <UserCircle size={18} />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteModal({ open: true, userId: user._id, userName: user.name })}
                                                title="Delete user"
                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteModal({ open: false, userId: null, userName: '' })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 text-center"
                        >
                            <div className="bg-rose-100 text-rose-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete User?</h3>
                            <p className="text-gray-500 mb-8">
                                Are you sure you want to delete <span className="font-bold text-gray-900">{deleteModal.userName}</span>? 
                                <br />This action is <strong>permanent</strong> and will delete all MRI scans, cognitive tests, and predictions.
                            </p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setDeleteModal({ open: false, userId: null, userName: '' })}
                                    className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="flex-1 py-3 px-6 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-shadow shadow-lg shadow-rose-100"
                                >
                                    Delete User
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
