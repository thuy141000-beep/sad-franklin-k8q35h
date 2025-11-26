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
  RefreshCw,
  Lock,
  Unlock,
  BarChart2,
  UserCog,
  Eye,
  CheckSquare,
  Square,
  ArrowRightCircle,
  ListChecks,
  Bell,
  MessageSquare,
  Send,
  Megaphone,
} from "lucide-react";

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyCRKW6fQwJqj2bSfuAXc5Nr259KVmzhic8",
  authDomain: "lop-hoc-vui-ve2.firebaseapp.com",
  projectId: "lop-hoc-vui-ve2",
  storageBucket: "lop-hoc-vui-ve2.firebasestorage.app",
  messagingSenderId: "454777169300",
  appId: "1:454777169300:web:ebe2542d74b779eb8b1b81",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "lop12-4-2025";
const DATA_VERSION = "classData_v13"; // Giữ nguyên để dùng lại dữ liệu cũ

// --- CONSTANTS ---
const ROLES = {
  TEACHER: "teacher",
  ADMIN: "admin",
  MANAGER: "manager",
  STUDENT: "student",
};

const ROLE_LABELS = {
  [ROLES.TEACHER]: "Giáo viên",
  [ROLES.ADMIN]: "Lớp trưởng",
  [ROLES.MANAGER]: "Tổ trưởng",
  [ROLES.STUDENT]: "Học sinh",
};

const DEFAULT_MANAGER_PERMISSIONS = {
  allowAdd: false,
  allowDelete: false,
  allowEditName: true,
  allowResetPin: true,
  allowMoveGroup: false,
  allowBulkActions: false,
  allowCustomMode: false,
};

const DEFAULT_PERMISSIONS = {
  canManageUsers: false,
  canManageRules: false,
  canResetPin: false,
};

// Đã sửa lại tên biến cho đúng
const FIXED_MONTHS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Tháng ${i + 1}`,
}));

const REAL_STUDENTS = [
  "Văn Nguyễn Thành An",
  "Lê Thoại Cát Anh",
  "Nguyễn Phương Anh",
  "Phan Nữ Huyền Anh",
  "Hoàng Nguyên Chi",
  "Nguyễn Trung Dũng",
  "Nguyễn Đức Thành Đạt",
  "Nguyễn Quốc Thái Hoàng",
  "Đinh Như Khánh Hưng",
  "Nguyễn Ngọc Quốc Hưng",
  "Trần Duy Hưng",
  "Huỳnh Thế Khang",
  "Nguyễn Trần Khánh Linh",
  "Hồ Thùy Miên",
  "Lê Thị Trà My",
  "Lê Thanh Nhàn",
  "Dương Gia Phát",
  "Nguyễn Hữu Quang",
  "Lê Nguyễn Anh Quân",
  "Tôn Nữ Phúc Quỳnh",
  "Nguyễn Thị Anh Thi",
  "Võ Quang Anh Thi",
  "Đỗ Khắc Bảo Trâm",
  "Hoàng Phương Bảo Trân",
  "Nguyễn Hoàng Ý Vân",
  "Trần Nguyễn Thùy Vân",
];

const DEFAULT_RULES = [
  {
    id: "r1",
    label: "Nói chuyện riêng",
    fine: 20000,
    points: -10,
    type: "penalty",
  },
  {
    id: "r2",
    label: "Không học bài, làm bài",
    fine: 20000,
    points: -10,
    type: "penalty",
  },
  {
    id: "r3",
    label: "Sai trang phục",
    fine: 20000,
    points: -10,
    type: "penalty",
  },
  { id: "r4", label: "Ăn quà vặt", fine: 20000, points: -10, type: "penalty" },
  {
    id: "r5",
    label: "Vắng không phép/Bỏ tiết",
    fine: 20000,
    points: -20,
    type: "penalty",
  },
  { id: "r6", label: "Đi học muộn", fine: 20000, points: -10, type: "penalty" },
  { id: "r7", label: "Vệ sinh bẩn", fine: 20000, points: -10, type: "penalty" },
  {
    id: "r8",
    label: "Nộp phạt muộn",
    fine: 10000,
    points: -10,
    type: "penalty",
  },
  {
    id: "r9",
    label: "Lớp phó thiếu trách nhiệm",
    fine: 20000,
    points: -20,
    type: "penalty",
  },
  {
    id: "r10",
    label: "Lộn xộn đầu giờ",
    fine: 20000,
    points: -5,
    type: "penalty",
  },
  {
    id: "r11",
    label: "Dùng điện thoại",
    fine: 20000,
    points: -30,
    type: "penalty",
  },
  { id: "b1", label: "Điểm 8 trở lên", fine: 10000, points: 10, type: "bonus" },
  {
    id: "b2",
    label: "Phát biểu xây dựng bài",
    fine: 5000,
    points: 1,
    type: "bonus",
  },
];

const getRating = (score) => {
  if (score > 80) return { label: "Tốt", color: "bg-green-100 text-green-700" };
  if (score >= 65) return { label: "Khá", color: "bg-blue-100 text-blue-700" };
  if (score >= 50)
    return { label: "TB", color: "bg-yellow-100 text-yellow-700" };
  if (score >= 35)
    return { label: "Yếu", color: "bg-orange-100 text-orange-700" };
  return { label: "Kém", color: "bg-red-100 text-red-700" };
};

const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- COMPONENTS ---

// 1. Notice Board Component
const NoticeBoard = ({ notices, currentUser, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const canPost =
    currentUser.role === ROLES.TEACHER ||
    currentUser.role === ROLES.ADMIN ||
    currentUser.canPostNotices;

  const handleSubmit = () => {
    if (!formData.title || !formData.content)
      return alert("Vui lòng nhập đủ tiêu đề và nội dung!");

    const newNotice = {
      id: editingId || Date.now(),
      title: formData.title,
      content: formData.content,
      date: Date.now(),
      author: currentUser.name,
      role: currentUser.role,
    };

    onSave(newNotice);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: "", content: "" });
  };

  const handleEdit = (notice) => {
    setEditingId(notice.id);
    setFormData({ title: notice.title, content: notice.content });
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (confirm("Bạn có chắc muốn xóa thông báo này?")) {
      onDelete(id);
    }
  };

  return (
    <div className="fade-in space-y-4">
      {canPost && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-indigo-100">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
            >
              <Plus size={20} /> Tạo thông báo mới
            </button>
          ) : (
            <div className="space-y-3 animate-slideDown">
              <h3 className="font-bold text-gray-800">
                {editingId ? "Chỉnh sửa thông báo" : "Thông báo mới"}
              </h3>
              <input
                className="w-full p-2 border rounded text-sm font-bold"
                placeholder="Tiêu đề (Ví dụ: Lịch nghỉ học, Nộp quỹ...)"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                autoFocus
              />
              <textarea
                className="w-full p-2 border rounded text-sm h-24"
                placeholder="Nội dung chi tiết..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setFormData({ title: "", content: "" });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded text-sm font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold flex items-center gap-1"
                >
                  <Send size={14} /> Đăng
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {notices && notices.length > 0 ? (
          notices
            .sort((a, b) => b.date - a.date)
            .map((notice) => (
              <div
                key={notice.id}
                className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-indigo-500 relative group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      {formatDate(notice.date)} •
                      <span
                        className={`font-bold ${
                          notice.role === ROLES.TEACHER
                            ? "text-purple-600"
                            : "text-blue-600"
                        }`}
                      >
                        {notice.author}
                      </span>
                    </p>
                  </div>
                  {canPost && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(notice)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {notice.content}
                </p>
              </div>
            ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-2 opacity-20" />
            <p>Chưa có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Modal Sửa Đồng Loạt
const BulkEditModal = ({ count, onClose, onConfirm, onDelete }) => {
  const [points, setPoints] = useState(0);
  const [fine, setFine] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs animate-slideDown">
        <h3 className="font-bold text-indigo-900 mb-2">
          Sửa {count} lỗi đang chọn
        </h3>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-600">
              Điểm mới (+/-)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600">
              Tiền phạt mới (VNĐ)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={fine}
              onChange={(e) => setFine(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onConfirm(points, fine)}
            className="py-2 bg-indigo-600 text-white rounded font-bold shadow-md"
          >
            Cập nhật tất cả
          </button>
          <button
            onClick={onDelete}
            className="py-2 bg-red-100 text-red-600 rounded font-bold"
          >
            Xóa tất cả
          </button>
          <button
            onClick={onClose}
            className="py-2 bg-gray-100 text-gray-600 rounded font-bold"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomRuleModal = ({ rule, onClose, onConfirm }) => {
  const [customPoints, setCustomPoints] = useState(rule.points);
  const [customFine, setCustomFine] = useState(rule.fine);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs animate-slideDown">
        <h3 className="font-bold text-gray-800 mb-2">
          Tùy chỉnh: {rule.label}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-600">
              Điểm (+/-)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={customPoints}
              onChange={(e) => setCustomPoints(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600">
              Tiền (VNĐ)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={customFine}
              onChange={(e) => setCustomFine(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 rounded"
            >
              Hủy
            </button>
            <button
              onClick={() => onConfirm(customPoints, customFine)}
              className="flex-1 py-2 bg-indigo-600 text-white rounded"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Batch Update Modal
const BatchUpdateModal = ({ months, onConfirm, onClose, isBulk }) => {
  const [selectedMonths, setSelectedMonths] = useState([]);
  const toggleMonth = (id) =>
    setSelectedMonths((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  const toggleAll = () =>
    selectedMonths.length === months.length
      ? setSelectedMonths([])
      : setSelectedMonths(months.map((m) => m.id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-slideDown">
        <h3 className="font-bold text-indigo-900 mb-2">
          {isBulk ? "Đồng bộ tất cả thay đổi?" : "Cập nhật đồng bộ?"}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Bạn vừa sửa {isBulk ? "danh sách" : "nội quy"}. Chọn các tháng bạn
          muốn áp dụng mức phạt mới này cho các lỗi cũ:
        </p>
        <div className="mb-4 max-h-60 overflow-y-auto border rounded p-2 bg-gray-50">
          <div className="flex items-center gap-2 mb-2 border-b pb-2">
            <input
              type="checkbox"
              checked={selectedMonths.length === months.length}
              onChange={toggleAll}
              className="w-4 h-4"
            />
            <span className="font-bold text-sm">Chọn tất cả</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedMonths.includes(m.id)}
                  onChange={() => toggleMonth(m.id)}
                  className="w-3 h-3"
                />
                <span className="text-xs">{m.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm([])}
            className="flex-1 py-2 bg-gray-100 text-gray-600 rounded text-xs font-bold"
          >
            Không đồng bộ
          </button>
          <button
            onClick={() => onConfirm(selectedMonths)}
            className={`flex-1 py-2 text-white rounded text-xs font-bold ${
              selectedMonths.length > 0 ? "bg-indigo-600" : "bg-gray-400"
            }`}
            disabled={selectedMonths.length === 0}
          >
            Đồng bộ ngay
          </button>
        </div>
      </div>
    </div>
  );
};

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
          <input
            type="password"
            placeholder="PIN hiện tại"
            className="w-full p-2 border rounded"
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
          />
          <input
            type="password"
            placeholder="PIN mới"
            className="w-full p-2 border rounded"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nhập lại PIN mới"
            className="w-full p-2 border rounded"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
          />
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

const UserEditModal = ({ targetUser, currentUser, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: targetUser.name,
    stt: targetUser.stt || "",
    group: targetUser.group,
    role: targetUser.role,
  });

  const isTeacher = currentUser.role === ROLES.TEACHER;
  const canEditRole =
    isTeacher ||
    (currentUser.role === ROLES.ADMIN && targetUser.role !== ROLES.TEACHER);

  const availableRoles = [
    ROLES.STUDENT,
    ROLES.MANAGER,
    ROLES.ADMIN,
    ...(isTeacher ? [ROLES.TEACHER] : []),
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-slideDown">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Sửa thông tin</h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Họ và tên
            </label>
            <input
              className="w-full p-2 border rounded text-sm"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="w-1/3">
              <label className="text-xs font-medium text-gray-500">STT</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                value={formData.stt}
                onChange={(e) => handleChange("stt", e.target.value)}
              />
            </div>
            <div className="w-2/3">
              <label className="text-xs font-medium text-gray-500">Tổ</label>
              <select
                className="w-full p-2 border rounded text-sm"
                value={formData.group}
                onChange={(e) => handleChange("group", Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((g) => (
                  <option key={g} value={g}>
                    Tổ {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {canEditRole && (
            <div>
              <label className="text-xs font-medium text-gray-500">
                Chức vụ
              </label>
              <select
                className="w-full p-2 border rounded text-sm font-bold text-indigo-700"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 text-gray-600 rounded font-medium"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 py-2 bg-indigo-600 text-white rounded font-medium"
          >
            Lưu
          </button>
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
      .sort((a, b) => (a.stt || 999) - (b.stt || 999));
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
                  STT: {user.stt}
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
            Thống Kê Tình Hình Lớp 12/4
          </h1>
          <p className="text-gray-500 text-sm">By Banana</p>
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
  adminPermissions,
  managerPermissions, // Nhận props này
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    stt: "",
    group: 1,
    role: ROLES.STUDENT,
  });

  const isTeacher = currentUser.role === ROLES.TEACHER;
  const isAdmin = currentUser.role === ROLES.ADMIN;
  const isManager = currentUser.role === ROLES.MANAGER;

  const canManageUsers =
    isTeacher || (isAdmin && adminPermissions.canManageUsers);

  const handleSaveUser = (updatedData) => {
    const userId = editingUser.id;
    let userToUpdate = { ...users[userId], ...updatedData };
    updateData({ users: { ...users, [userId]: userToUpdate } });
    setEditingUser(null);
    alert("Cập nhật thông tin thành công!");
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Xóa vĩnh viễn thành viên này?")) {
      const updatedUsers = { ...users };
      delete updatedUsers[userId];
      updateData({ users: updatedUsers });
    }
  };

  const handleResetPin = (user) => {
    const newPin = prompt("Nhập mã PIN mới (4 số):", "0000");
    if (newPin && newPin.length >= 4) {
      const updatedUsers = { ...users, [user.id]: { ...user, pin: newPin } };
      updateData({ users: updatedUsers });
      alert("Đã đổi PIN thành công!");
    }
  };

  const handleAddUser = () => {
    if (!newUser.name) return alert("Nhập tên");
    const id = `s_${Date.now()}`;
    const newStudent = {
      id,
      name: newUser.name,
      stt: Number(newUser.stt) || 99,
      group: Number(newUser.group),
      role: newUser.role,
      pin: "0000",
    };
    updateData({ users: { ...users, [id]: newStudent } });
    setIsAdding(false);
    setNewUser({ name: "", stt: "", group: 1, role: ROLES.STUDENT });
    alert("Đã thêm thành viên mới!");
  };

  const toggleUserNoticePermission = (userId) => {
    if (!isTeacher) return;
    const user = users[userId];
    const newStatus = !user.canPostNotices;
    updateData({
      users: { ...users, [userId]: { ...user, canPostNotices: newStatus } },
    });
  };

  const toggleAdminPermission = (key) => {
    if (!isTeacher) return;
    const newPerms = { ...adminPermissions, [key]: !adminPermissions[key] };
    updateData({ adminPermissions: newPerms });
  };

  const toggleManagerPermission = (key) => {
    if (!isTeacher) return;
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
      if (a.group !== b.group) return a.group - b.group;
      return (a.stt || 999) - (b.stt || 999);
    });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden fade-in">
      {editingUser && (
        <UserEditModal
          targetUser={editingUser}
          currentUser={currentUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {isTeacher && (
        <div className="bg-purple-50 p-4 border-b border-purple-100">
          <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Settings size={18} /> Cấu hình quyền hạn
          </h3>

          {/* ADMIN CONFIG */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">
              Quyền Lớp Trưởng (Admin)
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between bg-white p-2 rounded border border-purple-100">
                <span className="text-sm text-gray-700">
                  Quản lý thành viên
                </span>
                <button
                  onClick={() => toggleAdminPermission("canManageUsers")}
                  className={
                    adminPermissions.canManageUsers
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {adminPermissions.canManageUsers ? (
                    <ToggleRight size={28} />
                  ) : (
                    <ToggleLeft size={28} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-purple-100">
                <span className="text-sm text-gray-700">Sửa Nội quy</span>
                <button
                  onClick={() => toggleAdminPermission("canManageRules")}
                  className={
                    adminPermissions.canManageRules
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {adminPermissions.canManageRules ? (
                    <ToggleRight size={28} />
                  ) : (
                    <ToggleLeft size={28} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-purple-100">
                <span className="text-sm text-gray-700">Đổi PIN</span>
                <button
                  onClick={() => toggleAdminPermission("canResetPin")}
                  className={
                    adminPermissions.canResetPin
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {adminPermissions.canResetPin ? (
                    <ToggleRight size={28} />
                  ) : (
                    <ToggleLeft size={28} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* MANAGER CONFIG (NEW) */}
          <div>
            <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">
              Quyền Tổ Trưởng (Manager)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                <span className="text-xs text-gray-700">Thêm HS</span>
                <button
                  onClick={() => toggleManagerPermission("allowAdd")}
                  className={
                    managerPermissions.allowAdd
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {managerPermissions.allowAdd ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                <span className="text-xs text-gray-700">Xóa HS</span>
                <button
                  onClick={() => toggleManagerPermission("allowDelete")}
                  className={
                    managerPermissions.allowDelete
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {managerPermissions.allowDelete ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                <span className="text-xs text-gray-700">Sửa tên</span>
                <button
                  onClick={() => toggleManagerPermission("allowEditName")}
                  className={
                    managerPermissions.allowEditName
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {managerPermissions.allowEditName ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                <span className="text-xs text-gray-700">Đổi PIN</span>
                <button
                  onClick={() => toggleManagerPermission("allowResetPin")}
                  className={
                    managerPermissions.allowResetPin
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {managerPermissions.allowResetPin ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                <span className="text-xs text-gray-700">Chọn nhiều</span>
                <button
                  onClick={() => toggleManagerPermission("allowBulkActions")}
                  className={
                    managerPermissions.allowBulkActions
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {managerPermissions.allowBulkActions ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                <span className="text-xs text-gray-700">Tùy chỉnh điểm</span>
                <button
                  onClick={() => toggleManagerPermission("allowCustomMode")}
                  className={
                    managerPermissions.allowCustomMode
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {managerPermissions.allowCustomMode ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
              </div>
            </div>
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
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 text-xs flex items-center gap-1"
          >
            <UserPlus size={16} /> Thêm
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 bg-blue-50 border-b border-blue-100 animate-slideDown">
          <h3 className="text-sm font-bold text-blue-800 mb-2">
            Thêm thành viên mới
          </h3>
          <div className="flex gap-2 flex-wrap">
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
            <select
              className="p-2 text-sm border rounded"
              value={newUser.group}
              onChange={(e) =>
                setNewUser({ ...newUser, group: Number(e.target.value) })
              }
            >
              {[1, 2, 3, 4].map((g) => (
                <option key={g} value={g}>
                  Tổ {g}
                </option>
              ))}
            </select>
            {(isTeacher || isAdmin) && (
              <select
                className="p-2 text-sm border rounded font-bold text-indigo-700"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value={ROLES.STUDENT}>Học sinh</option>
                <option value={ROLES.MANAGER}>Tổ trưởng</option>
                <option value={ROLES.ADMIN}>Lớp trưởng</option>
              </select>
            )}
            <button
              onClick={handleAddUser}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium w-full sm:w-auto"
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
        {displayedUsers.map((user) => {
          // Determine if current user can edit THIS user
          const isTargetStudent = user.role === ROLES.STUDENT;
          const isSameGroup = user.group === currentUser.group;

          const canEdit =
            isTeacher ||
            (isAdmin && adminPermissions.canManageUsers) ||
            (isManager &&
              isTargetStudent &&
              isSameGroup &&
              checkManagerAction("edit"));
          const canDelete =
            isTeacher ||
            (isAdmin && adminPermissions.canManageUsers) ||
            (isManager &&
              isTargetStudent &&
              isSameGroup &&
              checkManagerAction("delete"));
          const canPin =
            isTeacher ||
            (isAdmin && adminPermissions.canResetPin) ||
            (isManager &&
              isTargetStudent &&
              isSameGroup &&
              checkManagerAction("pin"));

          return (
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
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    <span className="text-gray-400 text-xs mr-1 font-normal">
                      #{user.stt}
                    </span>
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isTeacher && user.role === ROLES.STUDENT && (
                  <button
                    onClick={() => toggleUserNoticePermission(user.id)}
                    className={`p-1.5 rounded ${
                      user.canPostNotices
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-300 hover:bg-gray-100"
                    }`}
                    title="Cấp quyền Thông báo"
                  >
                    <Megaphone size={16} />
                  </button>
                )}
                {user.role !== ROLES.TEACHER && (
                  <>
                    {canEdit && (
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Sửa thông tin"
                      >
                        <UserCog size={18} />
                      </button>
                    )}
                    {canPin && (
                      <button
                        onClick={() => handleResetPin(user)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title="Đổi PIN"
                      >
                        <Key size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Xóa thành viên"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 4. Dashboard
const Dashboard = ({ currentUser, onLogout, dbState, updateData }) => {
  const {
    users,
    weeklyData,
    rules,
    years = [],
    months = [],
    adminPermissions,
    managerPermissions = DEFAULT_MANAGER_PERMISSIONS,
    notices = [],
  } = dbState;

  const [activeYearId, setActiveYearId] = useState(
    years.length > 0 ? years[years.length - 1].id : 2024
  );
  const [activeMonthId, setActiveMonthId] = useState(1);
  const [activeWeek, setActiveWeek] = useState(1);

  const [activeTab, setActiveTab] = useState(
    currentUser.role === ROLES.STUDENT ? "overview" : "input"
  );
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [selectedRuleForCustom, setSelectedRuleForCustom] = useState(null);
  const [selectedStudentForCustom, setSelectedStudentForCustom] =
    useState(null);

  const [batchUpdateModalOpen, setBatchUpdateModalOpen] = useState(false);
  const [pendingRuleUpdate, setPendingRuleUpdate] = useState(null);
  const [pendingBulkRulesUpdate, setPendingBulkRulesUpdate] = useState(null);

  // --- BULK SELECT STATE ---
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedViolationKeys, setSelectedViolationKeys] = useState([]);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);

  // --- BULK RULES STATE ---
  const [isBulkRulesMode, setIsBulkRulesMode] = useState(false);
  const [tempRules, setTempRules] = useState([]);

  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(1);
  const [startYear, setStartYear] = useState(activeYearId);
  const [endYear, setEndYear] = useState(activeYearId);

  const [newRule, setNewRule] = useState({
    label: "",
    fine: 0,
    points: -2,
    type: "penalty",
  });
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const isTeacher = currentUser.role === ROLES.TEACHER;
  const isAdmin = currentUser.role === ROLES.ADMIN;
  const isManager = currentUser.role === ROLES.MANAGER;
  const isStudent = currentUser.role === ROLES.STUDENT;
  const canManageAccount = !isStudent;

  const canManageRules =
    isTeacher || (isAdmin && adminPermissions.canManageRules);
  const canEditMonths = isTeacher || isAdmin;

  // === CHECK MANAGER PERMISSIONS HERE ===
  // Logic: Teacher/Admin always true. Manager depends on setting. Student always false.
  const canUseBulk =
    isTeacher || isAdmin || (isManager && managerPermissions.allowBulkActions);
  const canUseCustom =
    isTeacher || isAdmin || (isManager && managerPermissions.allowCustomMode);

  // FIX: Auto-create currentYearObj if missing
  const currentYearObj = years.find((y) => y.id === activeYearId) || {
    id: activeYearId,
    name: `${activeYearId}`,
    lockedMonths: [],
  };

  const safeMonths = FIXED_MONTHS.map((m) => ({
    ...m,
    isLocked: currentYearObj.lockedMonths?.includes(m.id) || false,
  }));

  const activeMonthLabel =
    activeMonthId === "ALL"
      ? "Cả Năm"
      : safeMonths.find((m) => m.id === activeMonthId)?.name || "Tháng ?";
  const isMonthLocked =
    activeMonthId !== "ALL" &&
    safeMonths.find((m) => m.id === activeMonthId)?.isLocked;

  const getKey = (year, month, week) => `y${year}_m${month}_w${week}`;
  const getStudentData = (userId, year, month, week) =>
    weeklyData[getKey(year, month, week)]?.[userId] || {
      score: 80,
      fines: 0,
      violations: [],
    };
  const studentList = Object.values(users)
    .filter((u) => u.role === ROLES.STUDENT || u.role === ROLES.MANAGER)
    .sort((a, b) => a.stt - b.stt);

  // --- STATS CALCULATION ---
  const classFundStats = useMemo(() => {
    let weekTotal = 0;
    let monthTotal = 0;
    let yearTotal = 0;
    const allStudents = Object.values(users).filter(
      (u) => u.role === ROLES.STUDENT || u.role === ROLES.MANAGER
    );
    allStudents.forEach((st) => {
      weekTotal += getStudentData(
        st.id,
        activeYearId,
        activeMonthId,
        activeWeek
      ).fines;
      if (activeMonthId !== "ALL") {
        for (let w = 1; w <= 4; w++)
          monthTotal += getStudentData(
            st.id,
            activeYearId,
            activeMonthId,
            w
          ).fines;
      }
      safeMonths.forEach((m) => {
        for (let w = 1; w <= 4; w++)
          yearTotal += getStudentData(st.id, activeYearId, m.id, w).fines;
      });
    });
    return { weekTotal, monthTotal, yearTotal };
  }, [users, weeklyData, activeYearId, activeMonthId, activeWeek, safeMonths]);

  // --- USER STATS ---
  const overviewStats = useMemo(() => {
    return studentList
      .map((student) => {
        let currentMonthTotalScore = 0;
        let currentMonthTotalFines = 0;
        let weeklyFines = {};
        let yearTotalFines = 0;
        const debtCarryOver = student.debtCarryOver || 0;
        yearTotalFines += debtCarryOver;

        safeMonths.forEach((m) => {
          for (let w = 1; w <= 4; w++) {
            const data = getStudentData(student.id, activeYearId, m.id, w);
            yearTotalFines += data.fines;
          }
        });

        if (activeMonthId === "ALL") {
          let totalScoreAllTime = 0;
          let totalWeeks = 0;
          safeMonths.forEach((m) => {
            for (let w = 1; w <= 4; w++) {
              const data = getStudentData(student.id, activeYearId, m.id, w);
              totalScoreAllTime += data.score;
              currentMonthTotalFines += data.fines;
              totalWeeks++;
            }
          });
          currentMonthTotalScore =
            totalWeeks > 0 ? (totalScoreAllTime / totalWeeks) * 4 : 320;
        } else {
          for (let w = 1; w <= 4; w++) {
            const data = getStudentData(
              student.id,
              activeYearId,
              activeMonthId,
              w
            );
            currentMonthTotalScore += data.score;
            currentMonthTotalFines += data.fines;
            weeklyFines[w] = data.fines;
          }
        }
        return {
          ...student,
          currentMonthAvg: currentMonthTotalScore / 4,
          currentMonthFines: currentMonthTotalFines,
          weeklyFines,
          yearTotalFines,
          debtCarryOver,
        };
      })
      .sort((a, b) => b.currentMonthAvg - a.currentMonthAvg);
  }, [users, weeklyData, activeMonthId, activeYearId, safeMonths]);

  const rangeStats = useMemo(() => {
    const results = studentList
      .map((student) => {
        let totalScore = 0;
        let totalFines = 0;
        let weeksCount = 0;
        let currentY = startYear;
        let currentM = startMonth;
        const endValue = endYear * 100 + endMonth;
        while (currentY * 100 + currentM <= endValue) {
          for (let w = 1; w <= 4; w++) {
            const data = getStudentData(student.id, currentY, currentM, w);
            totalScore += data.score;
            totalFines += data.fines;
            weeksCount++;
          }
          currentM++;
          if (currentM > 12) {
            currentM = 1;
            currentY++;
          }
        }
        const avgScore = weeksCount > 0 ? totalScore / weeksCount : 80;
        return { ...student, rangeAvg: avgScore, rangeFines: totalFines };
      })
      .sort((a, b) => b.rangeAvg - a.rangeAvg);
    if (isStudent) return results.filter((s) => s.id === currentUser.id);
    return results;
  }, [
    users,
    weeklyData,
    startMonth,
    startYear,
    endMonth,
    endYear,
    isStudent,
    currentUser.id,
  ]);

  const handleChangeSelfPassword = (newPin) => {
    const updatedUsers = {
      ...users,
      [currentUser.id]: { ...currentUser, pin: newPin },
    };
    updateData({ users: updatedUsers });
    setShowPasswordModal(false);
    alert("Đổi mật khẩu thành công!");
  };

  // --- NOTICE ACTIONS ---
  const handleAddNotice = (newNotice) => {
    updateData({ notices: [newNotice, ...notices] });
  };
  const handleEditNotice = (noticeId, updatedNotice) => {
    const newNotices = notices.map((n) =>
      n.id === noticeId ? { ...n, ...updatedNotice } : n
    );
    updateData({ notices: newNotices });
  };
  const handleDeleteNotice = (noticeId) => {
    const newNotices = notices.filter((n) => n.id !== noticeId);
    updateData({ notices: newNotices });
  };

  const handleRuleClick = (studentId, rule) => {
    if (selectionMode) return;
    if (customMode) {
      setSelectedStudentForCustom(studentId);
      setSelectedRuleForCustom(rule);
      setCustomModalOpen(true);
    } else {
      handleAddViolation(studentId, rule, rule.points, rule.fine);
    }
  };
  const handleCustomConfirm = (points, fine) => {
    if (selectedStudentForCustom && selectedRuleForCustom) {
      handleAddViolation(
        selectedStudentForCustom,
        selectedRuleForCustom,
        points,
        fine
      );
      setCustomModalOpen(false);
      setSelectedRuleForCustom(null);
      setSelectedStudentForCustom(null);
    }
  };
  const handleAddViolation = (targetId, rule, points, fine) => {
    if (isStudent || isMonthLocked) return;
    const cD = getStudentData(
      targetId,
      activeYearId,
      activeMonthId,
      activeWeek
    );
    const nE = {
      id: Date.now(),
      ruleId: rule.id,
      ruleLabel: rule.label,
      fineAtTime: fine || 0,
      pointsAtTime: points,
      timestamp: Date.now(),
      by: currentUser.name,
      type: rule.type,
    };
    let fineChange = 0;
    if (rule.type === "penalty") {
      fineChange = fine || 0;
    } else if (rule.type === "bonus") {
      fineChange = -(fine || 0);
    }
    const uD = {
      ...cD,
      score: cD.score + points,
      fines: cD.fines + fineChange,
      violations: [nE, ...cD.violations],
    };
    updateData({
      weeklyData: {
        ...weeklyData,
        [getKey(activeYearId, activeMonthId, activeWeek)]: {
          ...(weeklyData[getKey(activeYearId, activeMonthId, activeWeek)] ||
            {}),
          [targetId]: uD,
        },
      },
    });
  };
  const handleRemoveViolation = (targetId, entryId) => {
    if (isStudent || isMonthLocked) return;
    const cD = getStudentData(
      targetId,
      activeYearId,
      activeMonthId,
      activeWeek
    );
    const entry = cD.violations.find((v) => v.id === entryId);
    if (!entry) return;
    let fineCorrection = 0;
    if (entry.type === "penalty" || (!entry.type && entry.pointsAtTime < 0)) {
      fineCorrection = -(entry.fineAtTime || 0);
    } else if (
      entry.type === "bonus" ||
      (!entry.type && entry.pointsAtTime > 0)
    ) {
      fineCorrection = entry.fineAtTime || 0;
    }
    const uD = {
      ...cD,
      score: cD.score - entry.pointsAtTime,
      fines: cD.fines + fineCorrection,
      violations: cD.violations.filter((v) => v.id !== entryId),
    };
    updateData({
      weeklyData: {
        ...weeklyData,
        [getKey(activeYearId, activeMonthId, activeWeek)]: {
          ...(weeklyData[getKey(activeYearId, activeMonthId, activeWeek)] ||
            {}),
          [targetId]: uD,
        },
      },
    });
  };

  const handleAddYear = () => {
    if (!isTeacher && !isAdmin) return;

    // FIX 1: Ensure structure when adding
    const newYear = activeYearId + 1;
    const updatedYears = [
      ...years,
      {
        id: newYear,
        name: `${newYear}`,
        lockedMonths: [], // Đảm bảo trường này luôn tồn tại
      },
    ];

    if (confirm(`Tạo năm học mới: ${newYear}?`)) {
      updateData({ years: updatedYears });
      setActiveYearId(newYear);
    }
  };

  const handleEditYear = (yearId) => {
    if (!isTeacher && !isAdmin) return;
    const currentName = years.find((y) => y.id === yearId)?.name;
    const newName = prompt("Nhập tên năm học mới:", currentName);
    if (newName && newName !== currentName) {
      const newYears = years.map((y) =>
        y.id === yearId ? { ...y, name: newName } : y
      );
      updateData({ years: newYears });
    }
  };
  const handleDeleteYear = (yearId) => {
    if (!isTeacher) return;
    if (confirm("Bạn có chắc chắn muốn xóa năm học này?")) {
      const newYears = years.filter((y) => y.id !== yearId);
      updateData({ years: newYears });
      if (newYears.length > 0)
        setActiveYearId(newYears[newYears.length - 1].id);
    }
  };
  const toggleMonthLock = (monthId) => {
    if (!canEditMonths) return;
    let updatedYears = [...years];
    const yearIndex = updatedYears.findIndex((y) => y.id === activeYearId);

    if (yearIndex === -1) {
      updatedYears.push({
        id: activeYearId,
        name: `${activeYearId}`,
        lockedMonths: [monthId],
      });
    } else {
      const currentYear = updatedYears[yearIndex];
      const currentLocks = currentYear.lockedMonths || [];
      const newLocks = currentLocks.includes(monthId)
        ? currentLocks.filter((id) => id !== monthId)
        : [...currentLocks, monthId];
      updatedYears[yearIndex] = { ...currentYear, lockedMonths: newLocks };
    }
    updateData({ years: updatedYears });
  };
  const handleDeleteMonth = (monthId) => {
    if (!canEditMonths) return;
    if (confirm("Xóa tháng này khỏi danh sách?")) {
      const newMonths = safeMonths.filter((m) => m.id !== monthId);
      updateData({ months: newMonths });
      if (activeMonthId === monthId)
        setActiveMonthId(newMonths[0]?.id || "ALL");
    }
  };
  const handleCarryOver = () => {
    if (!isTeacher) return;
    if (!confirm("Kết chuyển TỔNG PHẠT NĂM NAY thành NỢ CŨ cho năm sau?"))
      return;
    let updatedUsers = { ...users };
    overviewStats.forEach((stat) => {
      if (updatedUsers[stat.id])
        updatedUsers[stat.id].debtCarryOver = stat.yearTotalFines;
    });
    updateData({ users: updatedUsers });
    alert("Đã kết chuyển số dư thành công!");
  };

  const handleBatchUpdateConfirm = (selectedMonthIds) => {
    const updates = pendingBulkRulesUpdate
      ? pendingBulkRulesUpdate
      : pendingRuleUpdate
      ? [pendingRuleUpdate]
      : [];
    if (updates.length === 0) return;
    let updatedRules = [...rules];
    updates.forEach((u) => {
      updatedRules = updatedRules.map((r) =>
        r.id === u.ruleId
          ? {
              ...r,
              label: u.newLabel,
              points: u.newPoints,
              fine: u.newFine,
              type: u.newType,
            }
          : r
      );
    });
    let newWeeklyData = { ...weeklyData };
    if (selectedMonthIds.length > 0) {
      Object.keys(newWeeklyData).forEach((key) => {
        const parts = key.split("_");
        if (parts.length < 3) return;
        const y = parseInt(parts[0].substring(1));
        const m = parseInt(parts[1].substring(1));
        if (y === activeYearId && selectedMonthIds.includes(m)) {
          const weekData = newWeeklyData[key];
          Object.keys(weekData).forEach((userId) => {
            const userData = weekData[userId];
            let modified = false;
            const newViolations = userData.violations.map((v) => {
              const match = updates.find((u) => u.ruleId === v.ruleId);
              if (match) {
                modified = true;
                return {
                  ...v,
                  ruleLabel: match.newLabel,
                  pointsAtTime: match.newPoints,
                  fineAtTime: match.newFine,
                  type: match.newType,
                };
              }
              return v;
            });
            if (modified) {
              let newScore = 80;
              let newFines = 0;
              newViolations.forEach((v) => {
                newScore += v.pointsAtTime;
                if (v.type === "penalty") newFines += v.fineAtTime || 0;
                else if (v.type === "bonus") newFines -= v.fineAtTime || 0;
              });
              newWeeklyData[key][userId] = {
                ...userData,
                score: newScore,
                fines: newFines,
                violations: newViolations,
              };
            }
          });
        }
      });
    }
    updateData({ rules: updatedRules, weeklyData: newWeeklyData });
    setEditingRuleId(null);
    setBatchUpdateModalOpen(false);
    setPendingRuleUpdate(null);
    setPendingBulkRulesUpdate(null);
    setIsBulkRulesMode(false);
    alert("Cập nhật thành công!");
  };

  const handleSaveRule = () => {
    if (!newRule.label) return;
    if (editingRuleId) {
      const oldRule = rules.find((r) => r.id === editingRuleId);
      if (
        oldRule &&
        (oldRule.points !== newRule.points ||
          oldRule.fine !== newRule.fine ||
          oldRule.type !== newRule.type)
      ) {
        setPendingRuleUpdate({
          ruleId: editingRuleId,
          newPoints: Number(newRule.points),
          newFine: Number(newRule.fine),
          newLabel: newRule.label,
          newType: newRule.type,
        });
        setBatchUpdateModalOpen(true);
      } else {
        const updatedRules = rules.map((r) =>
          r.id === editingRuleId ? { ...newRule, id: editingRuleId } : r
        );
        updateData({ rules: updatedRules });
        setEditingRuleId(null);
        setNewRule({ label: "", fine: 0, points: -2, type: "penalty" });
      }
    } else {
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
    }
  };

  const startEditingRule = (rule) => {
    setEditingRuleId(rule.id);
    setNewRule({ ...rule });
  };
  const handleDeleteRule = (id) => {
    if (confirm("Xóa?"))
      updateData({ rules: rules.filter((r) => r.id !== id) });
  };
  const toggleViolationSelection = (studentId, violationId) => {
    const key = `${studentId}-${violationId}`;
    setSelectedViolationKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };
  const handleBulkEditConfirm = (newPoints, newFine) => {
    let newWeeklyData = { ...weeklyData };
    const dataKey = getKey(activeYearId, activeMonthId, activeWeek);
    const violationsByStudent = {};
    selectedViolationKeys.forEach((key) => {
      const [studentId, violationId] = key.split("-");
      if (!violationsByStudent[studentId]) violationsByStudent[studentId] = [];
      violationsByStudent[studentId].push(violationId);
    });
    Object.keys(violationsByStudent).forEach((studentId) => {
      if (!newWeeklyData[dataKey] || !newWeeklyData[dataKey][studentId]) return;
      const userData = newWeeklyData[dataKey][studentId];
      const targetIds = violationsByStudent[studentId];
      let modified = false;
      const newViolations = userData.violations.map((v) => {
        if (targetIds.includes(String(v.id))) {
          modified = true;
          return { ...v, pointsAtTime: newPoints, fineAtTime: newFine };
        }
        return v;
      });
      if (modified) {
        let newScore = 80;
        let newTotalFines = 0;
        newViolations.forEach((v) => {
          newScore += v.pointsAtTime;
          let fineChange = 0;
          if (v.type === "penalty") fineChange = v.fineAtTime || 0;
          else if (v.type === "bonus") fineChange = -(v.fineAtTime || 0);
          newTotalFines += fineChange;
        });
        newWeeklyData[dataKey][studentId] = {
          ...userData,
          score: newScore,
          fines: newTotalFines,
          violations: newViolations,
        };
      }
    });
    updateData({ weeklyData: newWeeklyData });
    setSelectedViolationKeys([]);
    setBulkEditModalOpen(false);
    setSelectionMode(false);
    alert(`Đã cập nhật thành công!`);
  };
  const handleBulkDelete = () => {
    if (!confirm(`Xóa ${selectedViolationKeys.length} lỗi?`)) return;
    let newWeeklyData = { ...weeklyData };
    const dataKey = getKey(activeYearId, activeMonthId, activeWeek);
    const toDelete = {};
    selectedViolationKeys.forEach((key) => {
      const [studentId, violationId] = key.split("-");
      if (!toDelete[studentId]) toDelete[studentId] = new Set();
      toDelete[studentId].add(Number(violationId));
    });
    Object.keys(toDelete).forEach((studentId) => {
      if (newWeeklyData[dataKey] && newWeeklyData[dataKey][studentId]) {
        const userData = newWeeklyData[dataKey][studentId];
        const idsToDelete = toDelete[studentId];
        const newViolations = userData.violations.filter(
          (v) => !idsToDelete.has(v.id)
        );
        let newScore = 80;
        let newTotalFines = 0;
        newViolations.forEach((v) => {
          newScore += v.pointsAtTime;
          let fineChange = 0;
          if (v.type === "penalty") fineChange = v.fineAtTime || 0;
          else if (v.type === "bonus") fineChange = -(v.fineAtTime || 0);
          newTotalFines += fineChange;
        });
        newWeeklyData[dataKey][studentId] = {
          ...userData,
          score: newScore,
          fines: newTotalFines,
          violations: newViolations,
        };
      }
    });
    updateData({ weeklyData: newWeeklyData });
    setSelectedViolationKeys([]);
    setBulkEditModalOpen(false);
    setSelectionMode(false);
    alert("Đã xóa thành công!");
  };

  const toggleBulkRulesMode = () => {
    if (isBulkRulesMode) {
      setIsBulkRulesMode(false);
      setTempRules([]);
    } else {
      setTempRules(JSON.parse(JSON.stringify(rules)));
      setIsBulkRulesMode(true);
    }
  };
  const handleTempRuleChange = (id, field, value) => {
    setTempRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };
  const saveBulkRules = () => {
    const changes = [];
    tempRules.forEach((temp) => {
      const original = rules.find((r) => r.id === temp.id);
      if (
        original &&
        (original.points !== temp.points ||
          original.fine !== temp.fine ||
          original.type !== temp.type)
      ) {
        changes.push({
          ruleId: temp.id,
          newPoints: Number(temp.points),
          newFine: Number(temp.fine),
          newLabel: temp.label,
          newType: temp.type,
        });
      }
    });
    if (changes.length > 0) {
      setPendingBulkRulesUpdate(changes);
      setBatchUpdateModalOpen(true);
    } else {
      updateData({ rules: tempRules });
      setIsBulkRulesMode(false);
      alert("Đã lưu danh sách nội quy!");
    }
  };

  const renderInputList = () =>
    [1, 2, 3, 4].map((groupId) => {
      let groupMembers = studentList.filter((s) => s.group === groupId);
      if (isManager && currentUser.group !== groupId) return null;
      if (isStudent) {
        if (currentUser.group !== groupId) return null;
        groupMembers = groupMembers.filter((s) => s.id === currentUser.id);
      }
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
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-blue-500">
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
                  activeYearId,
                  activeMonthId,
                  activeWeek
                );
                const rating = getRating(sData.score);
                return (
                  <div key={student.id} className="p-4 hover:bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">
                        {student.stt}. {student.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${rating.color}`}
                      >
                        {sData.score}đ - {rating.label}
                      </span>
                    </div>

                    {!isStudent && !isMonthLocked && !selectionMode && (
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        <div className="flex flex-wrap gap-2">
                          {rules
                            .filter((r) => r.type === "bonus")
                            .map((r) => (
                              <button
                                key={r.id}
                                onClick={() => handleRuleClick(student.id, r)}
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
                                onClick={() => handleRuleClick(student.id, r)}
                                className="text-[10px] px-2 py-1 bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100"
                              >
                                {r.points} {r.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    {sData.violations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                        {sData.violations.map((v) => {
                          const vKey = `${student.id}-${v.id}`;
                          return (
                            <div
                              key={v.id}
                              className={`flex justify-between items-center text-xs text-gray-500 mb-1 p-1 rounded ${
                                selectionMode &&
                                selectedViolationKeys.includes(vKey)
                                  ? "bg-indigo-100"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {selectionMode && (
                                  <button
                                    onClick={() =>
                                      toggleViolationSelection(student.id, v.id)
                                    }
                                  >
                                    {selectedViolationKeys.includes(vKey) ? (
                                      <CheckSquare
                                        size={16}
                                        className="text-indigo-600"
                                      />
                                    ) : (
                                      <Square size={16} />
                                    )}
                                  </button>
                                )}
                                <span>
                                  {v.ruleLabel}{" "}
                                  {v.fineAtTime !== 0 &&
                                    `(${formatMoney(v.fineAtTime)})`}
                                </span>
                              </div>
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
                                {!isStudent &&
                                  !isMonthLocked &&
                                  !selectionMode && (
                                    <button
                                      onClick={() =>
                                        handleRemoveViolation(student.id, v.id)
                                      }
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  )}
                              </div>
                            </div>
                          );
                        })}
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {batchUpdateModalOpen && (
        <BatchUpdateModal
          months={safeMonths}
          isBulk={!!pendingBulkRulesUpdate}
          onConfirm={handleBatchUpdateConfirm}
          onClose={() => setBatchUpdateModalOpen(false)}
        />
      )}
      {bulkEditModalOpen && (
        <BulkEditModal
          count={selectedViolationKeys.length}
          onClose={() => {
            setBulkEditModalOpen(false);
            setSelectionMode(false);
            setSelectedViolationKeys([]);
          }}
          onConfirm={handleBulkEditConfirm}
          onDelete={handleBulkDelete}
        />
      )}
      {customModalOpen && selectedRuleForCustom && (
        <CustomRuleModal
          rule={selectedRuleForCustom}
          onClose={() => setCustomModalOpen(false)}
          onConfirm={handleCustomConfirm}
        />
      )}
      {showPasswordModal && (
        <ChangePasswordModal
          user={currentUser}
          onClose={() => setShowPasswordModal(false)}
          onSave={handleChangeSelfPassword}
        />
      )}

      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-2 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <select
                value={activeYearId}
                onChange={(e) => setActiveYearId(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-gray-700 outline-none p-1"
              >
                {years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
              {(isTeacher || isAdmin) && (
                <>
                  <button
                    onClick={() => handleEditYear(activeYearId)}
                    className="text-blue-400 hover:text-blue-600 p-1 rounded"
                    title="Sửa tên năm"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={handleAddYear}
                    className="text-indigo-600 hover:bg-indigo-200 p-1 rounded"
                    title="Thêm năm mới"
                  >
                    <PlusCircle size={14} />
                  </button>
                  {isTeacher && (
                    <button
                      onClick={() => handleDeleteYear(activeYearId)}
                      className="text-red-400 hover:text-red-600 p-1 rounded"
                      title="Xóa năm hiện tại"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
              <Calendar size={20} />
            </div>
            <div className="flex items-center">
              <select
                value={activeMonthId}
                onChange={(e) => {
                  const val =
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value);
                  setActiveMonthId(val);
                  setActiveWeek(1);
                }}
                className="font-bold text-lg text-gray-800 bg-transparent outline-none cursor-pointer hover:text-indigo-600"
              >
                {safeMonths.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
                <option value="ALL">Cả Năm</option>
              </select>
              {activeMonthId !== "ALL" && canEditMonths && (
                <div className="flex items-center ml-2 gap-1">
                  <button
                    onClick={() => toggleMonthLock(activeMonthId)}
                    className={`${
                      isMonthLocked ? "text-red-500" : "text-gray-400"
                    } hover:scale-110`}
                  >
                    {isMonthLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                  {isTeacher && (
                    <button
                      onClick={() => handleDeleteMonth(activeMonthId)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("notices")}
              className={`p-2 rounded-full ${
                activeTab === "notices"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Bell size={18} />
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-50 rounded-full"
            >
              <Lock size={18} />
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        {activeMonthId !== "ALL" && (
          <div className="max-w-3xl mx-auto px-4 py-2 bg-gray-50/50 backdrop-blur-sm flex justify-between gap-2">
            {[1, 2, 3, 4].map((w) => (
              <button
                key={w}
                onClick={() => setActiveWeek(w)}
                className={`flex-1 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeWeek === w
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                Tuần {w}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {/* TAB: THÔNG BÁO */}
        {activeTab === "notices" && (
          <NoticeBoard
            notices={notices}
            currentUser={currentUser}
            onSave={handleAddNotice}
            onDelete={handleDeleteNotice}
          />
        )}

        {/* TAB: TỔNG QUAN (TÀI CHÍNH) */}
        {activeTab === "overview" && (
          <div className="fade-in space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                  Tổng Phạt Tuần
                </p>
                <p className="text-sm font-bold text-blue-600">
                  {formatMoney(classFundStats.weekTotal)}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                  Tổng Phạt Tháng
                </p>
                <p className="text-sm font-bold text-orange-600">
                  {activeMonthId === "ALL"
                    ? "-"
                    : formatMoney(classFundStats.monthTotal)}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-green-100 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                  Tổng Phạt Năm
                </p>
                <p className="text-sm font-bold text-green-600">
                  {formatMoney(classFundStats.yearTotal)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                <h2 className="font-bold text-indigo-900">
                  Chi tiết {activeMonthLabel}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="p-3 min-w-[140px]">Họ tên</th>
                      <th className="p-3 text-right">TB</th>
                      {activeMonthId !== "ALL" &&
                        [1, 2, 3, 4].map((t) => (
                          <th
                            key={t}
                            className="p-3 text-right bg-red-50 text-red-600"
                          >
                            T{t}
                          </th>
                        ))}
                      <th className="p-3 text-right font-bold text-red-700 bg-red-100">
                        Phạt Tháng
                      </th>
                      <th className="p-3 text-right font-bold text-red-800 bg-red-200">
                        Phạt Năm
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {overviewStats
                      .filter((s) => {
                        if (isStudent) return s.id === currentUser.id;
                        if (isManager) return s.group === currentUser.group;
                        return true;
                      })
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-800">
                            <span className="text-gray-400 text-xs mr-1">
                              {s.stt}.
                            </span>
                            {s.name}
                          </td>
                          <td className="p-3 text-right font-bold text-indigo-600">
                            {s.currentMonthAvg.toFixed(1)}
                          </td>
                          {activeMonthId !== "ALL" &&
                            [1, 2, 3, 4].map((w) => (
                              <td key={w} className="p-3 text-right text-xs">
                                {s.weeklyFines[w] > 0
                                  ? formatMoney(s.weeklyFines[w])
                                  : "-"}
                              </td>
                            ))}
                          <td
                            className={`p-3 text-right font-bold ${
                              s.currentMonthFines > 0
                                ? "text-red-600 bg-red-50"
                                : s.currentMonthFines < 0
                                ? "text-green-600 bg-green-50"
                                : "text-gray-400"
                            }`}
                          >
                            {formatMoney(s.currentMonthFines)}
                          </td>
                          <td
                            className={`p-3 text-right font-bold ${
                              s.yearTotalFines > 0
                                ? "text-red-800 bg-red-100"
                                : s.yearTotalFines < 0
                                ? "text-green-800 bg-green-100"
                                : "text-gray-400"
                            }`}
                          >
                            {formatMoney(s.yearTotalFines)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: THỐNG KÊ TÙY CHỌN */}
        {activeTab === "stats" && (
          <div className="fade-in space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              {isTeacher && activeMonthId === "ALL" && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-yellow-800">
                      Kết chuyển Năm Học
                    </h3>
                    <p className="text-xs text-yellow-600">
                      Cộng dồn tổng phạt năm nay vào nợ cũ.
                    </p>
                  </div>
                  <button
                    onClick={handleCarryOver}
                    className="bg-yellow-600 text-white px-3 py-2 rounded font-bold text-sm flex gap-2"
                  >
                    <ArrowRightCircle size={16} /> Kết chuyển
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="text-orange-500" />
                <h2 className="font-bold text-gray-800">Thống kê tùy chọn</h2>
              </div>
              <div className="flex gap-2 items-center mb-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">
                    Từ tháng
                  </label>
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(Number(e.target.value))}
                    className="w-full p-2 border rounded bg-gray-50"
                  >
                    {safeMonths.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full p-2 border rounded bg-gray-50 mt-1"
                  >
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </div>
                <ArrowRightLeft size={16} className="text-gray-400 mt-4" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">
                    Đến tháng
                  </label>
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(Number(e.target.value))}
                    className="w-full p-2 border rounded bg-gray-50"
                  >
                    {safeMonths.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    className="w-full p-2 border rounded bg-gray-50 mt-1"
                  >
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(endYear < startYear ||
                (endYear === startYear && endMonth < startMonth)) && (
                <p className="text-red-500 text-xs">
                  Thời gian kết thúc không hợp lệ
                </p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-3 bg-orange-50 border-b border-orange-100 text-xs text-orange-800 font-medium">
                Kết quả ({rangeStats.length} học sinh)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="p-3">Họ tên</th>
                      <th className="p-3 text-right">ĐTB Hạnh Kiểm</th>
                      <th className="p-3 text-right">Tổng Tiền Phạt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rangeStats.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">
                          <span className="text-gray-400 text-xs mr-1">
                            {s.stt}.
                          </span>
                          {s.name}
                        </td>
                        <td className="p-3 text-right font-bold text-blue-600">
                          {s.rangeAvg.toFixed(1)}
                        </td>
                        <td
                          className={`p-3 text-right font-bold ${
                            s.rangeFines > 0
                              ? "text-red-600"
                              : s.rangeFines < 0
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {formatMoney(s.rangeFines)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CHẤM ĐIỂM */}
        {activeTab === "input" && (
          <div className="fade-in">
            {!isStudent && !isMonthLocked && (
              <div className="flex justify-between items-center mb-2 px-2">
                <div className="flex items-center gap-2">
                  {/* NÚT CHỌN NHIỀU - CHECK QUYỀN */}
                  {canUseBulk && (
                    <button
                      onClick={() => {
                        setSelectionMode(!selectionMode);
                        setSelectedViolationKeys([]);
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all ${
                        selectionMode
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-600"
                      }`}
                    >
                      <CheckSquare size={14} /> Chọn nhiều
                    </button>
                  )}
                  {selectionMode && selectedViolationKeys.length > 0 && (
                    <button
                      onClick={() => setBulkEditModalOpen(true)}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm animate-slideDown"
                    >
                      Xử lý ({selectedViolationKeys.length})
                    </button>
                  )}
                </div>

                {/* Nút chế độ tùy chỉnh cũ (nếu cần) */}
                {!selectionMode && canUseCustom && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                    <span className="text-xs font-bold text-gray-600">
                      Tùy chỉnh
                    </span>
                    <button
                      onClick={() => setCustomMode(!customMode)}
                      className={`${
                        customMode ? "bg-indigo-600" : "bg-gray-300"
                      } w-8 h-4 rounded-full relative transition-colors`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                          customMode ? "translate-x-4" : ""
                        }`}
                      ></div>
                    </button>
                  </div>
                )}
              </div>
            )}
            {renderInputList()}
          </div>
        )}

        {/* TAB: QUẢN LÝ NỘI QUY */}
        {activeTab === "rules" && (
          <div className="bg-white rounded-xl shadow-sm p-4 fade-in">
            {/* Nút bật chế độ SỬA NHANH */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Danh sách Nội quy</h2>
              <div className="flex gap-2">
                {editingRuleId && (
                  <button
                    onClick={() => {
                      setEditingRuleId(null);
                      setNewRule({
                        label: "",
                        fine: 0,
                        points: -2,
                        type: "penalty",
                      });
                    }}
                    className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Hủy sửa
                  </button>
                )}
                {canManageRules && !editingRuleId && (
                  <button
                    onClick={toggleBulkRulesMode}
                    className={`text-xs font-bold px-2 py-1 rounded border flex items-center gap-1 ${
                      isBulkRulesMode
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600"
                    }`}
                  >
                    <ListChecks size={14} />{" "}
                    {isBulkRulesMode ? "Hủy" : "Sửa nhanh"}
                  </button>
                )}
              </div>
            </div>

            {/* Danh sách Nội quy */}
            <div className="space-y-2 mb-4">
              {isBulkRulesMode ? (
                // GIAO DIỆN SỬA NHANH
                <div className="space-y-2">
                  {tempRules.map((r) => (
                    <div
                      key={r.id}
                      className="p-2 border rounded bg-blue-50 flex flex-col gap-2"
                    >
                      <input
                        className="w-full p-1 border rounded text-sm"
                        value={r.label}
                        onChange={(e) =>
                          handleTempRuleChange(r.id, "label", e.target.value)
                        }
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          className="w-1/3 p-1 border rounded text-sm"
                          value={r.points}
                          onChange={(e) =>
                            handleTempRuleChange(
                              r.id,
                              "points",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Điểm"
                        />
                        <input
                          type="number"
                          className="w-1/3 p-1 border rounded text-sm"
                          value={r.fine}
                          onChange={(e) =>
                            handleTempRuleChange(
                              r.id,
                              "fine",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Tiền"
                        />
                        <select
                          className="w-1/3 p-1 border rounded text-xs"
                          value={r.type}
                          onChange={(e) =>
                            handleTempRuleChange(r.id, "type", e.target.value)
                          }
                        >
                          <option value="penalty">Phạt</option>
                          <option value="bonus">Thưởng</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={saveBulkRules}
                    className="w-full py-2 bg-blue-600 text-white rounded font-bold text-sm mt-2"
                  >
                    Lưu tất cả thay đổi
                  </button>
                </div>
              ) : (
                // GIAO DIỆN HIỂN THỊ THƯỜNG
                rules.map((r) => (
                  <div
                    key={r.id}
                    className={`flex justify-between items-center p-2 border rounded ${
                      editingRuleId === r.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">{r.label}</p>
                      <p
                        className={`text-xs font-bold ${
                          r.type === "bonus" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {r.points > 0 ? "+" : ""}
                        {r.points}đ | {r.type === "bonus" ? "Thưởng" : "Phạt"}:{" "}
                        {formatMoney(r.fine || 0)}
                      </p>
                    </div>
                    {canManageRules && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditingRule(r)}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(r.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Form thêm/sửa đơn lẻ (chỉ hiện khi không ở chế độ sửa nhanh) */}
            {canManageRules && !isBulkRulesMode && (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <h3 className="text-sm font-bold text-gray-700">
                  {editingRuleId
                    ? "Sửa quy định (Có đồng bộ)"
                    : "Thêm quy định mới"}
                </h3>
                <input
                  placeholder="Tên quy định"
                  className="w-full p-2 border rounded text-sm"
                  value={newRule.label}
                  onChange={(e) =>
                    setNewRule({ ...newRule, label: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <select
                    className={`w-1/3 p-2 border rounded text-sm font-bold ${
                      newRule.type === "bonus"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                    value={newRule.type}
                    onChange={(e) =>
                      setNewRule({ ...newRule, type: e.target.value })
                    }
                  >
                    <option value="penalty">Vi phạm (Đỏ)</option>
                    <option value="bonus">Khen thưởng (Xanh)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Điểm"
                    className="w-1/4 p-2 border rounded text-sm"
                    value={newRule.points}
                    onChange={(e) =>
                      setNewRule({ ...newRule, points: Number(e.target.value) })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Tiền phạt"
                    className="w-1/4 p-2 border rounded text-sm"
                    value={newRule.fine}
                    onChange={(e) =>
                      setNewRule({ ...newRule, fine: Number(e.target.value) })
                    }
                  />
                </div>
                <button
                  onClick={handleSaveRule}
                  className={`w-full ${
                    editingRuleId
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white rounded text-sm font-medium py-2`}
                >
                  {editingRuleId ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: QUẢN LÝ NHÂN SỰ (CHỈ GV/LT/TT) */}
        {canManageAccount && activeTab === "accounts" && (
          <AccountManager
            users={users}
            updateData={updateData}
            currentUser={currentUser}
            adminPermissions={adminPermissions || DEFAULT_PERMISSIONS}
            managerPermissions={
              managerPermissions || DEFAULT_MANAGER_PERMISSIONS
            }
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-gray-100 py-2 px-4 z-20">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === "overview"
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-400"
            }`}
          >
            <ClipboardList size={20} />
            <span className="text-[10px] mt-1">Tài chính</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === "stats"
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-400"
            }`}
          >
            <BarChart2 size={20} />
            <span className="text-[10px] mt-1">Thống kê</span>
          </button>
          <button
            onClick={() => setActiveTab("input")}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === "input"
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-400"
            }`}
          >
            {isStudent ? <Eye size={20} /> : <UserCheck size={20} />}
            <span className="text-[10px] mt-1">
              {isStudent ? "Chi tiết" : "Chấm điểm"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === "rules"
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-400"
            }`}
          >
            <Gavel size={20} />
            <span className="text-[10px] mt-1">Nội quy</span>
          </button>
          {canManageAccount && (
            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex flex-col items-center p-2 rounded-lg ${
                activeTab === "accounts"
                  ? "text-indigo-600 bg-indigo-50"
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
      DATA_VERSION,
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
    };
    for (let i = 1; i <= 4; i++)
      users[`mgr${i}`] = {
        id: `mgr${i}`,
        name: `Tổ trưởng ${i}`,
        role: ROLES.MANAGER,
        pin: "1234",
        group: i,
      };

    REAL_STUDENTS.forEach((name, index) => {
      const id = `s_${index + 1}`;
      users[id] = {
        id,
        name,
        stt: index + 1,
        role: ROLES.STUDENT,
        pin: "0000",
        group: (index % 4) + 1,
      };
    });

    return {
      users,
      rules: DEFAULT_RULES,
      years: [{ id: 2024, name: "2024", lockedMonths: [] }],
      weeklyData: {},
      adminPermissions: DEFAULT_PERMISSIONS,
      months: FIXED_MONTHS.map((m) => ({ ...m, isLocked: false })),
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
      DATA_VERSION,
      "main"
    );
    await updateDoc(docRef, newData);
  };
  if (!dbState)
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold">
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
