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
    X,
    Check,
    AlertTriangle,
    Loader2,
    Eye,
    EyeOff,
    Lock,
    CheckCircle2
} from 'lucide-react';
import { apiGet, apiDelete, apiPost, apiPatch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, userName: '' });
    
    // Add/Edit Modal state
    const [userModal, setUserModal] = useState({ 
        open: false, 
        mode: 'add', // 'add' or 'edit'
        user: { name: '', email: '', role: 'patient', password: '' } 
    });
    const [submitting, setSubmitting] = useState(false);
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    // Filter state
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({ role: 'all', name: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    // Sync search term with filters.name
    useEffect(() => {
        setFilters(prev => ({ ...prev, name: searchTerm }));
    }, [searchTerm]);

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

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (userModal.mode === 'add') {
                const response = await apiPost('/admin/user', userModal.user);
                showToast('User created successfully', 'success');
                setUsers([response.data.user, ...users]);
            } else {
                const response = await apiPatch(`/admin/user/${userModal.user._id}`, {
                    name: userModal.user.name,
                    email: userModal.user.email,
                    role: userModal.user.role
                });
                showToast('User updated successfully', 'success');
                setUsers(users.map(u => u._id === userModal.user._id ? response.data.user : u));
            }
            setUserModal({ open: false, mode: 'add', user: { name: '', email: '', role: 'patient', password: '' } });
        } catch (err) {
            showToast(err.message || 'Operation failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const openAddModal = () => {
        setUserModal({ 
            open: true, 
            mode: 'add', 
            user: { name: '', email: '', role: 'patient', password: '' } 
        });
        setPasswordRequirements({
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        });
    };

    const openEditModal = (user) => {
        setUserModal({ 
            open: true, 
            mode: 'edit', 
            user: { ...user, password: '' } 
        });
    };

    const handlePasswordChange = (val) => {
        setUserModal({ ...userModal, user: { ...userModal.user, password: val } });
        setPasswordRequirements({
            length: val.length >= 8,
            uppercase: /[A-Z]/.test(val),
            lowercase: /[a-z]/.test(val),
            number: /[0-9]/.test(val),
            special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?~`]/.test(val)
        });
    };

    const requirements = [
        { label: '8+ Characters', met: passwordRequirements.length },
        { label: 'Uppercase Letter', met: passwordRequirements.uppercase },
        { label: 'Lowercase Letter', met: passwordRequirements.lowercase },
        { label: 'Number', met: passwordRequirements.number },
        { label: 'Special Character', met: passwordRequirements.special },
    ];

    const filteredUsers = users.filter(user => {
        const matchesName = user.name.toLowerCase().includes(filters.name.toLowerCase()) || 
                           user.email.toLowerCase().includes(filters.name.toLowerCase());
        const matchesRole = filters.role === 'all' || user.role === filters.role;
        return matchesName && matchesRole;
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage platform users and their access levels.</p>
                </div>
            </header>

            {/* Toolbar */}
            <div className="space-y-4">
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
                        <button 
                            onClick={() => setFilterOpen(!filterOpen)}
                            className={`flex-1 md:flex-none flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium border ${
                                filterOpen ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
                            }`}
                        >
                            <Filter size={18} /> Filter
                        </button>
                        <button 
                            onClick={openAddModal}
                            className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-md shadow-indigo-100"
                        >
                            <UserPlus size={18} /> Add User
                        </button>
                    </div>
                </div>

                {/* Filter Expandable Panel */}
                <AnimatePresence>
                    {filterOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Filter by Role (Mandatory)</label>
                                    <select 
                                        value={filters.role}
                                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all capitalize text-sm font-medium"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="patient">Patients</option>
                                        <option value="admin">Administrators</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Quick Search (Optional)</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input 
                                            type="text"
                                            placeholder="Filter by name..."
                                            value={filters.name}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                                                {user.name[0].toUpperCase()}
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
                                                onClick={() => openEditModal(user)}
                                                title="View / Edit profile"
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

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {userModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setUserModal({ ...userModal, open: false })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full relative z-10"
                        >
                            <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                        {userModal.mode === 'add' ? <UserPlus size={20} className="text-indigo-400" /> : <UserCircle size={20} className="text-indigo-400" />}
                                    </div>
                                    <h3 className="text-xl font-bold">{userModal.mode === 'add' ? 'Add New User' : 'Edit User Profile'}</h3>
                                </div>
                                <button 
                                    onClick={() => setUserModal({ ...userModal, open: false })}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUserSubmit} className="p-8 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={userModal.user.name}
                                        onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user, name: e.target.value } })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={userModal.user.email}
                                        onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user, email: e.target.value } })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="youremail@gmail.com"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">
                                        Supported: Gmail, Yahoo, Outlook, Hotmail, or Institutional (.edu, .gov)
                                    </p>
                                </div>

                                {userModal.mode === 'add' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type={showUserPassword ? "text" : "password"} 
                                                required
                                                value={userModal.user.password}
                                                onChange={(e) => handlePasswordChange(e.target.value)}
                                                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowUserPassword(!showUserPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                            >
                                                {showUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                                            {requirements.map((req, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                                        {req.met && <Check size={8} className="text-white" />}
                                                    </div>
                                                    <span className={`text-[10px] font-medium transition-colors ${req.met ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Account Role</label>
                                    <select 
                                        value={userModal.user.role}
                                        onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user, role: e.target.value } })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all capitalize"
                                    >
                                        <option value="patient">Patient / User</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setUserModal({ ...userModal, open: false })}
                                        className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-3 px-6 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : (userModal.mode === 'add' ? <Check size={18} /> : <Check size={18} />)}
                                        {userModal.mode === 'add' ? 'Create User' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
