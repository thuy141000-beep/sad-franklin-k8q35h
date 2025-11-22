import React, { useState, useEffect, useMemo } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  LogOut,
  UserCheck,
  Gavel,
  Trash2,
  Plus,
  Save,
  X,
  Calendar,
  PlusCircle,
  Search,
  Key,
  School,
  User,
  ShieldAlert,
  UserPlus,
  Edit3,
  Settings,
  ToggleLeft,
  ToggleRight,
  Users,
  ArrowRightLeft,
  DollarSign,
  Lock,
  Briefcase,
  BarChart2,
  Hash,
} from "lucide-react";
const firebaseConfig = {
  apiKey: "AIzaSyCRKW6fQwJqj2bSfuAXc5Nr259KVmzhic8",
  authDomain: "lop-hoc-vui-ve2.firebaseapp.com",
  projectId: "lop-hoc-vui-ve2",
  storageBucket: "lop-hoc-vui-ve2.firebasestorage.app",
  messagingSenderId: "454777169300",
  appId: "1:454777169300:web:ebe2542d74b779eb8b1b81",
};

// Khởi tạo Firebase an toàn
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
// Thay đổi ID lớp học của bạn ở đây nếu cần
const appId = "lop12-4-2025";
// --- CONSTANTS ---
const ROLES = {
  TEACHER: "teacher",
  ADMIN: "admin",
  MANAGER: "manager",
  STUDENT: "student",
};

const DEFAULT_MANAGER_PERMISSIONS = {
  allowAdd: false,
  allowDelete: false,
  allowEditName: true,
  allowResetPin: true,
  allowMoveGroup: false,
};

const DEFAULT_RULES = [
  { id: "r1", label: "Đi học muộn", fine: 5000, points: -2, type: "penalty" },
  {
    id: "r2",
    label: "Không làm bài tập",
    fine: 10000,
    points: -5,
    type: "penalty",
  },
  {
    id: "r3",
    label: "Nói chuyện riêng",
    fine: 2000,
    points: -2,
    type: "penalty",
  },
  {
    id: "b1",
    label: "Phát biểu xây dựng bài",
    fine: 0,
    points: 2,
    type: "bonus",
  },
  { id: "b2", label: "Đạt điểm 9, 10", fine: 0, points: 5, type: "bonus" },
];

const getRating = (score) => {
  if (score > 80) return { label: "Tốt", color: "bg-green-100 text-green-700" };
  if (score >= 66) return { label: "Khá", color: "bg-blue-100 text-blue-700" };
  if (score >= 50)
    return { label: "TB", color: "bg-yellow-100 text-yellow-700" };
  if (score >= 0)
    return { label: "Yếu", color: "bg-orange-100 text-orange-700" };
  return { label: "Kém", color: "bg-red-100 text-red-700" };
};

const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

// --- COMPONENTS ---

const ChangePasswordModal = ({ user, onClose, onSave }) => {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (oldPin !== user.pin) return setError("Mã PIN cũ không đúng");
    if (newPin.length < 4)
      return setError("Mã PIN mới phải có ít nhất 4 ký tự");
    if (newPin !== confirmPin) return setError("Xác nhận mã PIN không khớp");
    onSave(newPin);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Lock size={20} className="text-indigo-600" /> Đổi mật khẩu
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Mã PIN hiện tại
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Mã PIN mới
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Nhập lại PIN mới
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-600 rounded font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-indigo-600 text-white rounded font-medium"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ dbState, onLogin }) => {
  const [activeTab, setActiveTab] = useState("student");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [searchStudent, setSearchStudent] = useState("");

  const getSortedList = (roleFilter) => {
    return Object.values(dbState.users)
      .filter((u) => u.role === roleFilter)
      .sort((a, b) => {
        if (a.group !== b.group) return (a.group || 0) - (b.group || 0);
        return (a.stt || 999) - (b.stt || 999); // Sort by STT
      });
  };

  const admins = Object.values(dbState.users).filter(
    (u) => u.role === ROLES.TEACHER || u.role === ROLES.ADMIN
  );
  const managers = getSortedList(ROLES.MANAGER);
  const students = getSortedList(ROLES.STUDENT);

  const handleLogin = () => {
    if (selectedUser && pin === selectedUser.pin) onLogin(selectedUser);
    else setError("Mã PIN không chính xác");
  };

  const renderUserList = (list) => (
    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
      {list
        .filter((u) =>
          u.name.toLowerCase().includes(searchStudent.toLowerCase())
        )
        .map((user) => (
          <button
            key={user.id}
            onClick={() => {
              setSelectedUser(user);
              setError("");
              setPin("");
            }}
            className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${
              selectedUser?.id === user.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                user.role === ROLES.TEACHER
                  ? "bg-purple-100 text-purple-600"
                  : user.role === ROLES.ADMIN
                  ? "bg-red-100 text-red-600"
                  : user.role === ROLES.MANAGER
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {user.role === ROLES.TEACHER ? (
                <School size={20} />
              ) : user.role === ROLES.ADMIN ? (
                <ShieldAlert size={20} />
              ) : user.role === ROLES.MANAGER ? (
                <UserCheck size={20} />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="text-center">
              <span className="font-medium text-sm text-gray-700 block truncate w-24">
                {user.name}
              </span>
              {user.stt && (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded">
                  #{user.stt}
                </span>
              )}
            </div>
          </button>
        ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Thống kê lớp 12/4
          </h1>
          <p className="text-gray-500 text-sm">
            Thực hiện bởi Nguyễn Hoàng Brush
          </p>
        </div>
        {!selectedUser ? (
          <>
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab("student")}
                className={`flex-1 pb-2 text-xs sm:text-sm font-medium ${
                  activeTab === "student"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
              >
                Học sinh
              </button>
              <button
                onClick={() => setActiveTab("manager")}
                className={`flex-1 pb-2 text-xs sm:text-sm font-medium ${
                  activeTab === "manager"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
              >
                Tổ trưởng
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 pb-2 text-xs sm:text-sm font-medium ${
                  activeTab === "admin"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
              >
                Quản trị
              </button>
            </div>
            {activeTab === "student" && (
              <div className="mb-3 relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Tìm tên học sinh..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
              </div>
            )}
            {activeTab === "admin" && renderUserList(admins)}
            {activeTab === "manager" && renderUserList(managers)}
            {activeTab === "student" && renderUserList(students)}
          </>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-lg">
              <div className="bg-indigo-100 p-2 rounded-full">
                {selectedUser.role === ROLES.TEACHER ? (
                  <School size={20} className="text-indigo-600" />
                ) : (
                  <User size={20} className="text-indigo-600" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                  {selectedUser.role}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Nhập mã PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center text-xl tracking-widest"
                maxLength={4}
                placeholder="****"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Quay lại
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-lg shadow-indigo-200"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AccountManager = ({
  users,
  updateData,
  currentUser,
  managerPermissions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(null); // 'pin', 'name', 'group', 'role', 'stt'
  const [editValue, setEditValue] = useState("");
  const [targetGroup, setTargetGroup] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    group: currentUser.role === ROLES.MANAGER ? currentUser.group : 1,
    stt: "",
  });

  const isTeacher = currentUser.role === ROLES.TEACHER;
  const isAdmin = currentUser.role === ROLES.ADMIN;
  const isManager = currentUser.role === ROLES.MANAGER;
  const canViewConfig = isTeacher || isAdmin;

  const canAddUser =
    isTeacher || isAdmin || (isManager && managerPermissions.allowAdd);

  const checkPermission = (action, targetUser) => {
    if (isTeacher || isAdmin) return true;
    if (isManager) {
      if (
        targetUser.role !== ROLES.STUDENT ||
        targetUser.group !== currentUser.group
      )
        return false;
      if (action === "delete") return managerPermissions.allowDelete;
      if (action === "editName") return managerPermissions.allowEditName;
      if (action === "resetPin") return managerPermissions.allowResetPin;
      if (action === "moveGroup") return managerPermissions.allowMoveGroup;
    }
    return false;
  };

  const handleSaveEdit = (userId) => {
    let updatedUser = { ...users[userId] };

    if (editMode === "pin") {
      if (editValue.length < 4) return alert("PIN cần 4 ký tự");
      updatedUser.pin = editValue;
      alert("Đổi PIN thành công");
    } else if (editMode === "name") {
      updatedUser.name = editValue;
    } else if (editMode === "stt") {
      updatedUser.stt = Number(editValue);
    } else if (editMode === "group") {
      updatedUser.group = Number(editValue);
      alert(`Đã chuyển sang Tổ ${editValue}`);
    } else if (editMode === "role") {
      updatedUser.role = editValue;
      if (editValue === ROLES.MANAGER) {
        updatedUser.group = Number(targetGroup);
        updatedUser.pin = "1234";
        alert(
          `Đã bổ nhiệm ${updatedUser.name} làm Tổ trưởng Tổ ${targetGroup}`
        );
      } else {
        if (editValue === ROLES.ADMIN) updatedUser.pin = "8888";
        if (editValue === ROLES.STUDENT) updatedUser.pin = "0000";
        alert(`Đã chuyển chức vụ thành ${editValue}`);
      }
    }

    updateData({ users: { ...users, [userId]: updatedUser } });
    setEditingId(null);
    setEditMode(null);
    setEditValue("");
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Xóa vĩnh viễn thành viên này?")) {
      const updatedUsers = { ...users };
      delete updatedUsers[userId];
      updateData({ users: updatedUsers });
    }
  };

  const handleAddUser = () => {
    if (!newUser.name) return alert("Nhập tên");
    const id = `s_${Date.now()}`;
    const newStudent = {
      id,
      name: newUser.name,
      group: Number(newUser.group),
      stt: Number(newUser.stt) || 99, // Default STT if empty
      role: ROLES.STUDENT,
      pin: "0000",
    };
    updateData({ users: { ...users, [id]: newStudent } });
    setIsAdding(false);
    setNewUser({ name: "", group: isManager ? currentUser.group : 1, stt: "" });
    alert("Đã thêm!");
  };

  const togglePermission = (key) => {
    if (!canViewConfig) return;
    const newPerms = { ...managerPermissions, [key]: !managerPermissions[key] };
    updateData({ managerPermissions: newPerms });
  };

  const displayedUsers = Object.values(users)
    .filter((u) => {
      if (!u.name.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      if (isManager)
        return u.group === currentUser.group && u.role === ROLES.STUDENT;
      return true;
    })
    .sort((a, b) => {
      if (a.group !== b.group) return (a.group || 0) - (b.group || 0);
      if (a.role === ROLES.TEACHER) return -1;
      return (a.stt || 999) - (b.stt || 999); // Sort by STT
    });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden fade-in">
      {canViewConfig && (
        <div className="bg-blue-50 p-4 border-b border-blue-100">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Users size={18} /> Cấu hình quyền hạn Tổ trưởng
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              "allowAdd",
              "allowDelete",
              "allowEditName",
              "allowResetPin",
              "allowMoveGroup",
            ].map((perm) => (
              <div
                key={perm}
                className="flex items-center justify-between bg-white p-2 rounded border border-blue-100 shadow-sm"
              >
                <span className="text-xs font-medium text-gray-700">
                  {perm === "allowAdd"
                    ? "Thêm HS"
                    : perm === "allowDelete"
                    ? "Xóa HS"
                    : perm === "allowEditName"
                    ? "Sửa tên"
                    : perm === "allowResetPin"
                    ? "Đổi PIN"
                    : "Chuyển Tổ"}
                </span>
                <button
                  onClick={() => togglePermission(perm)}
                  className={
                    managerPermissions[perm]
                      ? "text-green-600"
                      : "text-gray-300"
                  }
                >
                  {managerPermissions[perm] ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="font-bold text-gray-800">Danh sách thành viên</h2>
          <p className="text-xs text-gray-500">
            {isManager ? `Tổ ${currentUser.group}` : "Toàn lớp"}
          </p>
        </div>
        {canAddUser && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 text-xs flex items-center gap-1"
          >
            <UserPlus size={16} /> Thêm
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100 animate-slideDown">
          <h3 className="text-sm font-bold text-indigo-800 mb-2">
            Thêm thành viên mới
          </h3>
          <div className="flex gap-2">
            <input
              className="w-16 p-2 text-sm border rounded"
              placeholder="STT"
              type="number"
              value={newUser.stt}
              onChange={(e) => setNewUser({ ...newUser, stt: e.target.value })}
            />
            <input
              className="flex-1 p-2 text-sm border rounded"
              placeholder="Họ và tên"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            {!isManager && (
              <select
                className="p-2 text-sm border rounded"
                value={newUser.group}
                onChange={(e) =>
                  setNewUser({ ...newUser, group: e.target.value })
                }
              >
                {[1, 2, 3, 4].map((g) => (
                  <option key={g} value={g}>
                    Tổ {g}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleAddUser}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Lưu
            </button>
          </div>
        </div>
      )}

      <div className="p-2 relative">
        <Search size={14} className="absolute left-5 top-5 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50 mb-2"
          placeholder="Tìm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-h-[500px] overflow-y-auto p-2">
        {displayedUsers.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border-b border-gray-50 last:border-0 group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  user.role === ROLES.TEACHER
                    ? "bg-purple-100 text-purple-600"
                    : user.role === ROLES.ADMIN
                    ? "bg-red-100 text-red-600"
                    : user.role === ROLES.MANAGER
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {user.role === ROLES.TEACHER ? (
                  <School size={16} />
                ) : user.role === ROLES.ADMIN ? (
                  <ShieldAlert size={16} />
                ) : (
                  <User size={16} />
                )}
              </div>
              {editingId === user.id && editMode === "name" ? (
                <input
                  autoFocus
                  className="border p-1 rounded text-sm"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              ) : (
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase">
                    {user.role === ROLES.MANAGER
                      ? `Tổ trưởng T${user.group}`
                      : user.role === ROLES.STUDENT
                      ? `T${user.group}`
                      : user.role}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* STT Display & Edit */}
              {user.role !== ROLES.TEACHER &&
                (editingId === user.id && editMode === "stt" ? (
                  <input
                    className="w-12 p-1 border rounded text-center text-xs"
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(user.id);
                      setEditMode("stt");
                      setEditValue(user.stt || "");
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-bold hover:bg-indigo-100 hover:text-indigo-600"
                    title="Sửa số thứ tự"
                  >
                    {user.stt || "#"}
                  </button>
                ))}

              {editingId === user.id && editMode !== "stt" ? (
                <>
                  {editMode === "pin" && (
                    <input
                      className="w-16 p-1 border rounded text-center text-xs"
                      placeholder="PIN"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  )}
                  {editMode === "group" && (
                    <select
                      className="p-1 border rounded text-sm"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    >
                      {[1, 2, 3, 4].map((g) => (
                        <option key={g} value={g}>
                          Tổ {g}
                        </option>
                      ))}
                    </select>
                  )}
                  {editMode === "role" && (
                    <div className="flex flex-col gap-1">
                      <select
                        className="p-1 border rounded text-sm"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      >
                        <option value={ROLES.STUDENT}>Học sinh</option>
                        <option value={ROLES.MANAGER}>Tổ trưởng</option>
                        <option value={ROLES.ADMIN}>Lớp trưởng</option>
                      </select>
                      {editValue === ROLES.MANAGER && (
                        <select
                          className="p-1 border rounded text-sm"
                          value={targetGroup}
                          onChange={(e) => setTargetGroup(e.target.value)}
                        >
                          <option value={1}>Tổ 1</option>
                          <option value={2}>Tổ 2</option>
                          <option value={3}>Tổ 3</option>
                          <option value={4}>Tổ 4</option>
                        </select>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => handleSaveEdit(user.id)}
                    className="p-1 text-green-600 bg-green-50 rounded"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditMode(null);
                    }}
                    className="p-1 text-red-600 bg-red-50 rounded"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  {(isTeacher || isAdmin) && user.role !== ROLES.TEACHER && (
                    <button
                      onClick={() => {
                        setEditingId(user.id);
                        setEditMode("role");
                        setEditValue(user.role);
                        setTargetGroup(user.group || 1);
                      }}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                      title="Đổi chức vụ"
                    >
                      <Briefcase size={16} />
                    </button>
                  )}
                  {checkPermission("editName", user) && (
                    <button
                      onClick={() => {
                        setEditingId(user.id);
                        setEditMode("name");
                        setEditValue(user.name);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Sửa tên"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                  {checkPermission("moveGroup", user) && (
                    <button
                      onClick={() => {
                        setEditingId(user.id);
                        setEditMode("group");
                        setEditValue(user.group);
                      }}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded"
                      title="Chuyển Tổ"
                    >
                      <ArrowRightLeft size={16} />
                    </button>
                  )}
                  {checkPermission("resetPin", user) && (
                    <button
                      onClick={() => {
                        setEditingId(user.id);
                        setEditMode("pin");
                        setEditValue(user.pin);
                      }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Đổi PIN"
                    >
                      <Key size={16} />
                    </button>
                  )}
                  {checkPermission("delete", user) && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Dashboard
const Dashboard = ({ currentUser, onLogout, dbState, updateData }) => {
  const { users, weeklyData, rules, months, managerPermissions } = dbState;
  const [activeMonthId, setActiveMonthId] = useState(months[0]?.id || 1);
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeTab, setActiveTab] = useState(
    currentUser.role === ROLES.STUDENT ? "overview" : "input"
  );
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [newRule, setNewRule] = useState({
    label: "",
    fine: 0,
    points: -2,
    type: "penalty",
  });

  // Range Filter
  const [startMonthId, setStartMonthId] = useState(1);
  const [endMonthId, setEndMonthId] = useState(
    months.length > 0 ? months[months.length - 1].id : 1
  );

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (months.length > 0) setEndMonthId(months[months.length - 1].id);
  }, [months]);

  const isTeacher = currentUser.role === ROLES.TEACHER;
  const isAdmin = currentUser.role === ROLES.ADMIN;
  const isManager = currentUser.role === ROLES.MANAGER;
  const isStudent = currentUser.role === ROLES.STUDENT;
  const canManageAccount = !isStudent;
  const canManageRules = isTeacher || isAdmin;

  const activeMonthLabel =
    months.find((m) => m.id === activeMonthId)?.name || "Tháng ?";
  const getKey = (monthId, weekId) => `m${monthId}_w${weekId}`;
  const getStudentData = (userId, monthId, weekId) =>
    weeklyData[getKey(monthId, weekId)]?.[userId] || {
      score: 80,
      fines: 0,
      violations: [],
    };

  // Filter & Sort
  const studentList = Object.values(users)
    .filter((u) => u.role === ROLES.STUDENT || u.role === ROLES.MANAGER)
    .sort((a, b) => {
      if (a.group !== b.group) return (a.group || 0) - (b.group || 0);
      return (a.stt || 999) - (b.stt || 999); // Sort by STT in input list too
    });

  const detailedStats = useMemo(() => {
    return studentList
      .map((student) => {
        let rangeTotalScore = 0;
        let rangeTotalFines = 0;
        let weeksCounted = 0;
        let currentMonthTotalScore = 0;
        let currentMonthTotalFines = 0;
        let weeklyFines = {};

        // Range calc
        for (let mId = startMonthId; mId <= endMonthId; mId++) {
          const monthExists = months.find((m) => m.id === mId);
          if (monthExists) {
            for (let w = 1; w <= 4; w++) {
              const data = getStudentData(student.id, mId, w);
              rangeTotalScore += data.score;
              rangeTotalFines += data.fines;
              weeksCounted++;
            }
          }
        }

        // Current month calc
        for (let w = 1; w <= 4; w++) {
          const data = getStudentData(student.id, activeMonthId, w);
          currentMonthTotalScore += data.score;
          currentMonthTotalFines += data.fines;
          weeklyFines[w] = data.fines;
        }

        return {
          ...student,
          rangeAvgScore: weeksCounted > 0 ? rangeTotalScore / weeksCounted : 80,
          rangeTotalFines: rangeTotalFines,
          currentMonthAvg: currentMonthTotalScore / 4,
          currentMonthFines: currentMonthTotalFines,
          weeklyFines,
        };
      })
      .sort((a, b) => b.rangeAvgScore - a.rangeAvgScore); // Ranking still by score
  }, [users, weeklyData, startMonthId, endMonthId, months, activeMonthId]);

  const handleChangeSelfPassword = (newPin) => {
    const updatedUser = { ...currentUser, pin: newPin };
    const updatedUsersList = { ...users, [currentUser.id]: updatedUser };
    updateData({ users: updatedUsersList });
    setShowPasswordModal(false);
    alert("Đổi mật khẩu thành công!");
  };

  const handleAddViolation = (targetId, ruleId) => {
    if (isStudent) return;
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const cD = getStudentData(targetId, activeMonthId, activeWeek);
    const nE = {
      id: Date.now(),
      ruleId: rule.id,
      ruleLabel: rule.label,
      fineAtTime: rule.fine || 0,
      pointsAtTime: rule.points,
      timestamp: Date.now(),
      by: currentUser.name,
    };
    const uD = {
      ...cD,
      score: cD.score + rule.points,
      fines: cD.fines + (rule.fine || 0),
      violations: [nE, ...cD.violations],
    };
    updateData({
      weeklyData: {
        ...weeklyData,
        [getKey(activeMonthId, activeWeek)]: {
          ...(weeklyData[getKey(activeMonthId, activeWeek)] || {}),
          [targetId]: uD,
        },
      },
    });
  };

  const handleRemoveViolation = (targetId, entryId) => {
    if (isStudent) return;
    const cD = getStudentData(targetId, activeMonthId, activeWeek);
    const entry = cD.violations.find((v) => v.id === entryId);
    if (!entry) return;
    const uD = {
      ...cD,
      score: cD.score - entry.pointsAtTime,
      fines: Math.max(0, cD.fines - entry.fineAtTime),
      violations: cD.violations.filter((v) => v.id !== entryId),
    };
    updateData({
      weeklyData: {
        ...weeklyData,
        [getKey(activeMonthId, activeWeek)]: {
          ...(weeklyData[getKey(activeMonthId, activeWeek)] || {}),
          [targetId]: uD,
        },
      },
    });
  };

  const handleAddMonth = () => {
    if (!isTeacher && !isAdmin) return;
    const nextId =
      months.length > 0 ? Math.max(...months.map((m) => m.id)) + 1 : 1;
    updateData({
      months: [...months, { id: nextId, name: `Tháng ${nextId}` }],
    });
    setActiveMonthId(nextId);
    setActiveWeek(1);
    alert("Đã thêm tháng mới!");
  };

  const handleAddRule = () => {
    if (!newRule.label) return;
    updateData({
      rules: [
        ...rules,
        {
          ...newRule,
          id: `r_${Date.now()}`,
          fine: Number(newRule.fine),
          points: Number(newRule.points),
        },
      ],
    });
    setNewRule({ label: "", fine: 0, points: -2, type: "penalty" });
  };
  const handleDeleteRule = (id) => {
    if (confirm("Xóa?"))
      updateData({ rules: rules.filter((r) => r.id !== id) });
  };

  const renderInputList = () => {
    const inputGroups = isManager ? [currentUser.group] : [1, 2, 3, 4];
    return inputGroups.map((groupId) => {
      const groupMembers = studentList.filter((s) => s.group === groupId);
      const isExpanded = expandedGroup === groupId;
      return (
        <div
          key={groupId}
          className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100"
        >
          <div
            onClick={() => setExpandedGroup(isExpanded ? null : groupId)}
            className="p-4 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-blue-500`}
              >
                T{groupId}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Tổ {groupId}</h3>
                <p className="text-xs text-gray-500">
                  Sĩ số: {groupMembers.length}
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="text-gray-400" />
            ) : (
              <ChevronDown className="text-gray-400" />
            )}
          </div>
          {isExpanded && (
            <div className="divide-y divide-gray-100">
              {groupMembers.map((student) => {
                const sData = getStudentData(
                  student.id,
                  activeMonthId,
                  activeWeek
                );
                const rating = getRating(sData.score);
                return (
                  <div key={student.id} className="p-4 hover:bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded font-mono font-bold">
                          {student.stt || "#"}
                        </span>
                        <span className="font-semibold text-gray-800">
                          {student.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${rating.color}`}
                      >
                        {sData.score}đ - {rating.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <div className="flex flex-wrap gap-2">
                        {rules
                          .filter((r) => r.type === "bonus")
                          .map((r) => (
                            <button
                              key={r.id}
                              onClick={() =>
                                handleAddViolation(student.id, r.id)
                              }
                              className="text-[10px] px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded hover:bg-green-100"
                            >
                              +{r.points} {r.label}
                            </button>
                          ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rules
                          .filter((r) => r.type === "penalty")
                          .map((r) => (
                            <button
                              key={r.id}
                              onClick={() =>
                                handleAddViolation(student.id, r.id)
                              }
                              className="text-[10px] px-2 py-1 bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100"
                            >
                              {r.points} {r.label}
                            </button>
                          ))}
                      </div>
                    </div>
                    {sData.violations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                        {sData.violations.map((v) => (
                          <div
                            key={v.id}
                            className="flex justify-between text-xs text-gray-500 mb-1"
                          >
                            <span>{v.ruleLabel}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  v.pointsAtTime > 0
                                    ? "text-green-600"
                                    : "text-red-500"
                                }
                              >
                                {v.pointsAtTime > 0
                                  ? `+${v.pointsAtTime}`
                                  : v.pointsAtTime}
                              </span>
                              <button
                                onClick={() =>
                                  handleRemoveViolation(student.id, v.id)
                                }
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {showPasswordModal && (
        <ChangePasswordModal
          user={currentUser}
          onClose={() => setShowPasswordModal(false)}
          onSave={handleChangeSelfPassword}
        />
      )}

      <header className="bg-white shadow-sm sticky top-0 z-20">
        {activeTab === "input" && (
          <div className="max-w-3xl mx-auto px-4 py-2 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                <Calendar size={20} />
              </div>
              <select
                value={activeMonthId}
                onChange={(e) => {
                  setActiveMonthId(Number(e.target.value));
                  setActiveWeek(1);
                }}
                className="font-bold text-lg text-gray-800 bg-transparent outline-none cursor-pointer hover:text-blue-600"
              >
                {months.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {(isTeacher || isAdmin) && (
                <button onClick={handleAddMonth} className="text-blue-500">
                  <PlusCircle size={20} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 rounded-full"
                title="Đổi mật khẩu"
              >
                <Lock size={18} />
              </button>
              <button
                onClick={onLogout}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
        {activeTab === "input" && (
          <div className="max-w-3xl mx-auto px-4 py-2 bg-gray-50/50 backdrop-blur-sm flex justify-between gap-2">
            {[1, 2, 3, 4].map((w) => (
              <button
                key={w}
                onClick={() => setActiveWeek(w)}
                className={`flex-1 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeWeek === w
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                Tuần {w}
              </button>
            ))}
          </div>
        )}
        {activeTab !== "input" && (
          <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center border-b border-gray-100">
            <h1 className="font-bold text-xl text-gray-800">Lớp Học Vui Vẻ</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 rounded-full"
              >
                <Lock size={18} />
              </button>
              <button
                onClick={onLogout}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {activeTab === "overview" && (
          <div className="fade-in bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
              <h2 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <BarChart2 size={20} /> Báo Cáo Tùy Chỉnh
              </h2>
              <div className="flex gap-2 items-center text-sm">
                <span>Từ:</span>
                <select
                  className="border rounded p-1 bg-white"
                  value={startMonthId}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= endMonthId) setStartMonthId(val);
                  }}
                >
                  {months.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span>Đến:</span>
                <select
                  className="border rounded p-1 bg-white"
                  value={endMonthId}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= startMonthId) setEndMonthId(val);
                  }}
                >
                  {months.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="p-3 min-w-[120px]">Họ tên</th>
                    <th className="p-3 text-right w-24">ĐTB Giai đoạn</th>
                    <th className="p-3 text-right w-24 text-red-600 font-bold">
                      Tổng Phạt
                    </th>
                    <th className="p-3 text-right w-24">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detailedStats.map((s, i) => {
                    const rating = getRating(s.rangeAvgScore);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">
                          {s.name}
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <span className="font-bold">#{s.stt || "-"}</span>
                            <span>Tổ {s.group}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold text-indigo-600">
                          {s.rangeAvgScore.toFixed(1)}
                        </td>
                        <td className="p-3 text-right font-bold text-red-600 bg-red-50/30">
                          {s.rangeTotalFines > 0
                            ? formatMoney(s.rangeTotalFines)
                            : "-"}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`text-xs px-2 py-1 rounded font-bold ${rating.color}`}
                          >
                            {rating.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "input" && (
          <div className="fade-in">{renderInputList()}</div>
        )}

        {canManageAccount && activeTab === "accounts" && (
          <AccountManager
            users={users}
            updateData={updateData}
            currentUser={currentUser}
            managerPermissions={managerPermissions}
          />
        )}

        {!isStudent && activeTab === "rules" && (
          <div className="bg-white rounded-xl shadow-sm p-4 fade-in">
            <h2 className="font-bold text-gray-800 mb-4">Danh sách Nội quy</h2>
            <div className="space-y-2 mb-4">
              {rules.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center p-2 border rounded bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p
                      className={`text-xs font-bold ${
                        r.points > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {r.points > 0 ? "+" : ""}
                      {r.points}đ | Phạt: {formatMoney(r.fine || 0)}
                    </p>
                  </div>
                  {canManageRules && (
                    <button
                      onClick={() => handleDeleteRule(r.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {canManageRules && (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <input
                  placeholder="Tên quy định"
                  className="w-full p-2 border rounded text-sm"
                  value={newRule.label}
                  onChange={(e) =>
                    setNewRule({ ...newRule, label: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Điểm (+/-)"
                    className="w-1/3 p-2 border rounded text-sm"
                    value={newRule.points}
                    onChange={(e) =>
                      setNewRule({ ...newRule, points: Number(e.target.value) })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Tiền phạt"
                    className="w-1/3 p-2 border rounded text-sm"
                    value={newRule.fine}
                    onChange={(e) =>
                      setNewRule({ ...newRule, fine: Number(e.target.value) })
                    }
                  />
                  <button
                    onClick={handleAddRule}
                    className="w-1/3 bg-blue-600 text-white rounded text-sm font-medium"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-gray-100 py-2 px-4 z-20">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === "overview"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-400"
            }`}
          >
            <ClipboardList size={20} />
            <span className="text-[10px] mt-1">Tài chính</span>
          </button>
          {!isStudent && (
            <button
              onClick={() => setActiveTab("input")}
              className={`flex flex-col items-center p-2 rounded-lg ${
                activeTab === "input"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-400"
              }`}
            >
              <UserCheck size={20} />
              <span className="text-[10px] mt-1">Chấm điểm</span>
            </button>
          )}
          {!isStudent && (
            <button
              onClick={() => setActiveTab("rules")}
              className={`flex flex-col items-center p-2 rounded-lg ${
                activeTab === "rules"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-400"
              }`}
            >
              <Gavel size={20} />
              <span className="text-[10px] mt-1">Nội quy</span>
            </button>
          )}
          {canManageAccount && (
            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex flex-col items-center p-2 rounded-lg ${
                activeTab === "accounts"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-400"
              }`}
            >
              <Users size={20} />
              <span className="text-[10px] mt-1">Nhân sự</span>
            </button>
          )}
        </div>
      </nav>
      <style>{`.fade-in { animation: fadeIn 0.3s ease-in-out; } .animate-slideDown { animation: slideDown 0.3s ease-out; } @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dbState, setDbState] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "classData_v16",
      "main"
    );
    return onSnapshot(docRef, async (snap) => {
      if (snap.exists()) setDbState(snap.data());
      else await setDoc(docRef, seedData());
    });
  }, [user]);

  const seedData = () => {
    const users = {};
    users["teacher"] = {
      id: "teacher",
      name: "GV Chủ Nhiệm",
      role: ROLES.TEACHER,
      pin: "9999",
    };
    users["admin"] = {
      id: "admin",
      name: "Lớp Trưởng",
      role: ROLES.ADMIN,
      pin: "8888",
      group: 1,
      stt: 0,
    };
    for (let i = 1; i <= 4; i++)
      users[`mgr${i}`] = {
        id: `mgr${i}`,
        name: `Tổ trưởng ${i}`,
        role: ROLES.MANAGER,
        pin: "1234",
        group: i,
        stt: 0,
      };
    const firstNames = [
      "An",
      "Bình",
      "Chi",
      "Dũng",
      "Giang",
      "Hương",
      "Khánh",
      "Linh",
      "Minh",
      "Nam",
      "Oanh",
      "Phúc",
      "Quang",
      "Sơn",
      "Thảo",
      "Uyên",
      "Vinh",
      "Yến",
      "Tú",
      "Hải",
      "Đức",
      "Long",
      "Nhi",
      "Trang",
      "Hiếu",
      "Việt",
      "Hoàng",
      "Dương",
    ];
    let k = 0;
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 7; j++) {
        const id = `s${i}_${j}`;
        const name = `Nguyễn ${firstNames[k++] || "HS " + k}`;
        users[id] = {
          id,
          name,
          role: ROLES.STUDENT,
          pin: "0000",
          group: i,
          stt: j,
        };
      }
    }
    return {
      users,
      rules: DEFAULT_RULES,
      months: [{ id: 1, name: "Tháng 1" }],
      weeklyData: {},
      managerPermissions: DEFAULT_MANAGER_PERMISSIONS,
    };
  };

  const updateData = async (newData) => {
    if (!user) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "classData_v16",
      "main"
    );
    await updateDoc(docRef, newData);
  };
  if (!dbState)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">
        Đang tải dữ liệu...
      </div>
    );
  if (!currentUser)
    return <LoginScreen dbState={dbState} onLogin={setCurrentUser} />;
  return (
    <Dashboard
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
      dbState={dbState}
      updateData={updateData}
    />
  );
}
