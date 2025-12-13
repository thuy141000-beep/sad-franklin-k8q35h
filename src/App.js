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
  collection,
  getDocs,
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
  Bot,
  Zap,
  Broom,
  HelpCircle,
  TrendingUp,
  Database,
  Wifi,
  Download,
  Upload,
  HardDrive,
  Shield,
  UserMinus,
  Layers,
  Star,
  Crown,
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

// --- CẤU HÌNH MẶC ĐỊNH ---
const DEFAULT_APP_ID = "lop12-4-2025";
const DEFAULT_DATA_VERSION = "classData_v13";

// Biến dùng chung
const appId = DEFAULT_APP_ID;
const DATA_VERSION = DEFAULT_DATA_VERSION;

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
  allowBulkActions: true,
  allowCustomMode: false,
  allowReceiveNotis: false,
  allowRunBot: false,
};
const DEFAULT_PERMISSIONS = {
  canManageUsers: false,
  canManageRules: false,
  canResetPin: false,
  progressivePenaltyMode: false,
};
const DEFAULT_BOT_CONFIG = {
  enabled: true,
  mode: "week",
  minScoreToPraise: 90,
  minFineToWarn: 20000,
  cleaningSource: "stt",
  cleaningScoreBasis: "week",
  cleaningStartStt: 1,
  cleaningTargetGroup: 1,
  cleaningPrioritizeLowScore: false,
  cleaningPerDay: 2,
  targetManagerIds: [],
};
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
const HelpModal = ({ role, onClose }) => {
  const guides = {
    [ROLES.TEACHER]: [
      "🔒 Khóa/Mở tháng: Bấm icon ổ khóa.",
      "⚙️ Cấp quyền: Vào tab Nhân sự -> Cài đặt.",
      "🤖 Bot: Dùng để tự động đăng báo cáo hoặc xếp lịch trực nhật.",
      "⚡ Phạt lũy tiến: Bật trong tab Nội quy để tự động tăng tiền phạt khi tái phạm.",
      "⭐ Tuần đặc biệt: Nhân hệ số điểm/tiền cho các dịp thi đua.",
    ],
    [ROLES.ADMIN]: [
      "📝 Chấm điểm: Chọn tab Chấm điểm.",
      "✏️ Sửa lỗi: Dùng chế độ 'Chọn nhiều' hoặc bấm 'Tùy chỉnh'.",
      "📢 Thông báo: Đăng thông báo nhắc nhở cả lớp.",
      "🔑 Đổi PIN: Hỗ trợ các bạn đổi lại mã PIN.",
    ],
    [ROLES.MANAGER]: [
      "👥 Quản lý tổ: Chấm điểm thành viên tổ mình.",
      "⚠️ Lưu ý: Chỉ sửa được lỗi tháng chưa khóa.",
      "📨 Thông báo: Nhận thông báo khi thành viên bị trừ điểm (nếu được cấp quyền).",
    ],
    [ROLES.STUDENT]: [
      "👀 Xem điểm: Vào tab Chấm điểm.",
      "💰 Xem quỹ: Vào tab Tài chính.",
      "📢 Thông báo: Theo dõi bảng tin.",
    ],
  };
  const currentGuide = guides[role] || guides[ROLES.STUDENT];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {" "}
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-slideDown">
        {" "}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
            <HelpCircle size={24} /> Hướng dẫn sử dụng
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>{" "}
        <div className="space-y-3">
          {currentGuide.map((text, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="min-w-[6px] h-[6px] rounded-full bg-indigo-500 mt-2"></div>
              <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
const BotConfigModal = ({
  config = DEFAULT_BOT_CONFIG,
  onClose,
  onSave,
  onRun,
  activeMonthId,
  activeWeek,
  users,
}) => {
  const [localConfig, setLocalConfig] = useState({
    ...DEFAULT_BOT_CONFIG,
    ...config,
  });
  const managers = Object.values(users)
    .filter((u) => u.role === ROLES.MANAGER)
    .sort((a, b) => a.group - b.group);
  const toggleManagerSelection = (id) => {
    const current = localConfig.targetManagerIds || [];
    const next = current.includes(id)
      ? current.filter((cid) => cid !== id)
      : [...current, id];
    setLocalConfig({ ...localConfig, targetManagerIds: next });
  };
  useEffect(() => {
    if (
      !localConfig.targetManagerIds ||
      localConfig.targetManagerIds.length === 0
    ) {
      setLocalConfig((prev) => ({
        ...prev,
        targetManagerIds: managers.map((m) => m.id),
      }));
    }
  }, []);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {" "}
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs animate-slideDown max-h-[90vh] overflow-y-auto">
        {" "}
        <div className="flex items-center gap-2 mb-4 text-indigo-900">
          <Bot size={24} />
          <h3 className="font-bold text-lg">Trợ lý ảo Bot</h3>
        </div>{" "}
        <div className="space-y-4 mb-6">
          {" "}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Chế độ hoạt động
            </label>
            <select
              className="w-full p-2 border rounded font-medium text-indigo-700"
              value={localConfig.mode}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, mode: e.target.value })
              }
            >
              <option value="week">📅 Báo cáo Tuần {activeWeek}</option>
              <option value="month">📊 Tổng kết Tháng {activeMonthId}</option>
              <option value="cleaning">🧹 Xếp lịch Trực nhật</option>
              <option value="remind">🔔 Nhắc nhở Tổ trưởng</option>
            </select>
          </div>{" "}
          {(localConfig.mode === "week" || localConfig.mode === "month") && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Điểm khen thưởng ( &ge; )
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={localConfig.minScoreToPraise}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      minScoreToPraise: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Tiền phạt cảnh báo ( &ge; )
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={localConfig.minFineToWarn}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      minFineToWarn: Number(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}{" "}
          {localConfig.mode === "cleaning" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-100">
                <input
                  type="checkbox"
                  checked={localConfig.cleaningPrioritizeLowScore}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      cleaningPrioritizeLowScore: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label className="text-xs font-bold text-red-700">
                  Ưu tiên phạt dưới 81 điểm
                </label>
              </div>
              {localConfig.cleaningPrioritizeLowScore && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Xét điểm theo:
                  </label>
                  <select
                    className="w-full p-2 border rounded text-sm text-red-600 font-bold"
                    value={localConfig.cleaningScoreBasis}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        cleaningScoreBasis: e.target.value,
                      })
                    }
                  >
                    <option value="week">Tuần hiện tại ({activeWeek})</option>
                    <option value="month">
                      Tháng hiện tại ({activeMonthId})
                    </option>
                    <option value="both">Cả Tuần và Tháng</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Số người trực / ngày:
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={localConfig.cleaningPerDay}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      cleaningPerDay: Number(e.target.value),
                    })
                  }
                  placeholder="Mặc định: 2"
                />
              </div>
              {!localConfig.cleaningPrioritizeLowScore && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Hoặc bắt đầu từ STT:
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={localConfig.cleaningStartStt}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        cleaningStartStt: Number(e.target.value),
                      })
                    }
                    placeholder="Ví dụ: 1"
                  />
                </div>
              )}
            </div>
          )}{" "}
          {localConfig.mode === "remind" && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-600">
                Chọn Tổ trưởng cần nhắc:
              </p>
              <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                {managers.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={localConfig.targetManagerIds?.includes(m.id)}
                      onChange={() => toggleManagerSelection(m.id)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      {m.name} (Tổ {m.group})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}{" "}
        </div>{" "}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onSave(localConfig);
              onRun(localConfig);
            }}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700"
          >
            <Zap size={18} /> Thực hiện ngay
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
          >
            Đóng
          </button>
        </div>{" "}
      </div>{" "}
    </div>
  );
};
const NoticeBoard = ({
  notices,
  currentUser,
  onSave,
  onDelete,
  onOpenBot,
  canRunBot,
}) => {
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
      isBot: false,
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
      {" "}
      <div className="flex gap-2">
        {" "}
        {canPost && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 py-3 bg-white border border-indigo-100 shadow-sm text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
          >
            <Plus size={20} /> Viết thông báo
          </button>
        )}{" "}
        {canRunBot && !isEditing && (
          <button
            onClick={onOpenBot}
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
          >
            <Bot size={20} /> Bot
          </button>
        )}{" "}
      </div>{" "}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-indigo-100 animate-slideDown">
          {" "}
          <h3 className="font-bold text-gray-800 mb-3">
            {editingId ? "Chỉnh sửa" : "Bài viết mới"}
          </h3>{" "}
          <input
            className="w-full p-2 border rounded text-sm font-bold mb-2"
            placeholder="Tiêu đề..."
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            autoFocus
          />{" "}
          <textarea
            className="w-full p-2 border rounded text-sm h-24 mb-2"
            placeholder="Nội dung..."
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />{" "}
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
          </div>{" "}
        </div>
      )}{" "}
      <div className="space-y-3">
        {" "}
        {notices && notices.length > 0 ? (
          notices
            .sort((a, b) => b.date - a.date)
            .map((notice) => (
              <div
                key={notice.id}
                className={`bg-white rounded-xl shadow-sm p-4 border-l-4 relative group ${
                  notice.isBot ? "border-purple-500" : "border-blue-500"
                }`}
              >
                {" "}
                <div className="flex justify-between items-start mb-2">
                  {" "}
                  <div>
                    {" "}
                    <div className="flex items-center gap-2">
                      {notice.isBot && (
                        <Bot size={16} className="text-purple-600" />
                      )}
                      <h4 className="font-bold text-gray-800 text-lg">
                        {notice.title}
                      </h4>
                    </div>{" "}
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      {formatDate(notice.date)} •{" "}
                      <span
                        className={`font-bold ${
                          notice.isBot
                            ? "text-purple-600"
                            : notice.role === ROLES.TEACHER
                            ? "text-indigo-600"
                            : "text-blue-600"
                        }`}
                      >
                        {notice.author}
                      </span>
                    </p>{" "}
                  </div>{" "}
                  {canPost && (
                    <div className="flex gap-2">
                      {!notice.isBot && (
                        <button
                          onClick={() => handleEdit(notice)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}{" "}
                </div>{" "}
                <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {notice.content}
                </p>{" "}
              </div>
            ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-2 opacity-20" />
            <p>Chưa có thông báo nào</p>
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
const BulkEditModal = ({ count, onClose, onConfirm, onDelete }) => {
  const [points, setPoints] = useState(0);
  const [fine, setFine] = useState(0);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {" "}
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs animate-slideDown">
        {" "}
        <h3 className="font-bold text-indigo-900 mb-2">
          Sửa {count} lỗi đang chọn
        </h3>{" "}
        <div className="space-y-3 mb-4">
          {" "}
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
          </div>{" "}
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
          </div>{" "}
        </div>{" "}
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
        </div>{" "}
      </div>{" "}
    </div>
  );
};
const CustomRuleModal = ({ rule, onClose, onConfirm }) => {
  const [customPoints, setCustomPoints] = useState(rule.points);
  const [customFine, setCustomFine] = useState(rule.fine);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {" "}
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs animate-slideDown">
        {" "}
        <h3 className="font-bold text-gray-800 mb-2">
          Tùy chỉnh: {rule.label}
        </h3>{" "}
        <div className="space-y-3">
          {" "}
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
          </div>{" "}
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
          </div>{" "}
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
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
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
      {" "}
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-slideDown">
        {" "}
        <h3 className="font-bold text-indigo-900 mb-2">
          {isBulk ? "Đồng bộ tất cả thay đổi?" : "Cập nhật đồng bộ?"}
        </h3>{" "}
        <p className="text-sm text-gray-600 mb-4">
          Bạn vừa sửa {isBulk ? "danh sách" : "nội quy"}. Chọn các tháng bạn
          muốn áp dụng mức phạt mới này cho các lỗi cũ:
        </p>{" "}
        <div className="mb-4 max-h-60 overflow-y-auto border rounded p-2 bg-gray-50">
          {" "}
          <div className="flex items-center gap-2 mb-2 border-b pb-2">
            <input
              type="checkbox"
              checked={selectedMonths.length === months.length}
              onChange={toggleAll}
              className="w-4 h-4"
            />
            <span className="font-bold text-sm">Chọn tất cả</span>
          </div>{" "}
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
          </div>{" "}
        </div>{" "}
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
        </div>{" "}
      </div>{" "}
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
      {" "}
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        {" "}
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Lock size={20} className="text-indigo-600" /> Đổi mật khẩu
        </h3>{" "}
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
        </div>{" "}
      </div>{" "}
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
      {" "}
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-slideDown">
        {" "}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Sửa thông tin</h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>{" "}
        <div className="space-y-3">
          {" "}
          <div>
            <label className="text-xs font-medium text-gray-500">
              Họ và tên
            </label>
            <input
              className="w-full p-2 border rounded text-sm"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>{" "}
          <div className="flex gap-2">
            {" "}
            <div className="w-1/3">
              <label className="text-xs font-medium text-gray-500">STT</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                value={formData.stt}
                onChange={(e) => handleChange("stt", e.target.value)}
              />
            </div>{" "}
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
            </div>{" "}
          </div>{" "}
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
          )}{" "}
        </div>{" "}
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
        </div>{" "}
      </div>{" "}
    </div>
  );
};

// --- COMPONENT MỚI: QUẢN LÝ NHÂN SỰ ---
const AccountManager = ({
  users,
  updateData,
  currentUser,
  adminPermissions,
  managerPermissions,
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
  const canAddUser =
    isTeacher ||
    (isAdmin && adminPermissions.canManageUsers) ||
    (isManager && managerPermissions.allowAdd);
  const checkManagerAction = (action) => {
    if (isTeacher || (isAdmin && adminPermissions.canManageUsers)) return true;
    if (isManager) {
      if (action === "edit") return managerPermissions.allowEditName;
      if (action === "delete") return managerPermissions.allowDelete;
      if (action === "pin") return managerPermissions.allowResetPin;
    }
    return false;
  };
  const handleSaveUser = (updatedData) => {
    const userId = editingUser.id;
    let userToUpdate = { ...users[userId], ...updatedData };
    updateData({ users: { ...users, [userId]: userToUpdate } });
    setEditingUser(null);
    alert("Cập nhật thành công!");
  };
  const handleDeleteUser = (userId) => {
    if (window.confirm("Xóa thành viên?")) {
      const updatedUsers = { ...users };
      delete updatedUsers[userId];
      updateData({ users: updatedUsers });
    }
  };
  const handleResetPin = (user) => {
    const newPin = prompt("Nhập PIN mới (4 số):", "0000");
    if (newPin && newPin.length >= 4) {
      const updatedUsers = { ...users, [user.id]: { ...user, pin: newPin } };
      updateData({ users: updatedUsers });
      alert("Đã đổi PIN!");
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
    alert("Đã thêm!");
  };
  const toggleUserNoticePermission = (userId) => {
    if (!isTeacher) return;
    const user = users[userId];
    const newStatus = !user.canPostNotices;
    updateData({
      users: { ...users, [userId]: { ...user, canPostNotices: newStatus } },
    });
  };
  const toggleUserBotPermission = (userId) => {
    if (!isTeacher) return;
    const user = users[userId];
    const newStatus = !user.canUseBot;
    updateData({
      users: { ...users, [userId]: { ...user, canUseBot: newStatus } },
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
              <div className="flex items-center justify-between bg-white p-2 rounded border border-purple-100">
                <span className="text-sm text-gray-700">
                  Phạt Lũy Tiến (Global)
                </span>
                <button
                  onClick={() =>
                    toggleAdminPermission("progressivePenaltyMode")
                  }
                  className={
                    adminPermissions.progressivePenaltyMode
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {adminPermissions.progressivePenaltyMode ? (
                    <ToggleRight size={28} />
                  ) : (
                    <ToggleLeft size={28} />
                  )}
                </button>
              </div>
            </div>
          </div>
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
              <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                <span className="text-xs text-gray-700">Sử dụng Bot</span>
                <button
                  onClick={() => toggleManagerPermission("allowRunBot")}
                  className={
                    managerPermissions.allowRunBot
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {managerPermissions.allowRunBot ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                <span className="text-xs text-gray-700">Nhận Thông báo</span>
                <button
                  onClick={() => toggleManagerPermission("allowReceiveNotis")}
                  className={
                    managerPermissions.allowReceiveNotis
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {managerPermissions.allowReceiveNotis ? (
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
                {isTeacher &&
                  (user.role === ROLES.STUDENT ||
                    user.role === ROLES.MANAGER) && (
                    <>
                      <button
                        onClick={() => toggleUserNoticePermission(user.id)}
                        className={`p-1.5 rounded ${
                          user.canPostNotices
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-300 hover:bg-gray-100"
                        }`}
                        title="Quyền Thông báo"
                      >
                        <Megaphone size={16} />
                      </button>
                      <button
                        onClick={() => toggleUserBotPermission(user.id)}
                        className={`p-1.5 rounded ${
                          user.canUseBot
                            ? "text-purple-600 bg-purple-50"
                            : "text-gray-300 hover:bg-gray-100"
                        }`}
                        title="Quyền Bot"
                      >
                        <Bot size={16} />
                      </button>
                    </>
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

// --- NEW COMPONENT: BULK ADD MODAL ---
const BulkAddModal = ({ selectedStudents, rules, onClose, onConfirm }) => {
  const [selectedRuleId, setSelectedRuleId] = useState(
    rules.length > 0 ? rules[0].id : ""
  );
  const [quantities, setQuantities] = useState({});
  const [isMerge, setIsMerge] = useState(false);

  useEffect(() => {
    const initialQty = {};
    selectedStudents.forEach((s) => (initialQty[s.id] = 1));
    setQuantities(initialQty);
  }, [selectedStudents]);

  const handleQtyChange = (id, val) => {
    setQuantities((prev) => ({ ...prev, [id]: Number(val) }));
  };

  const handleConfirm = () => {
    const rule = rules.find((r) => r.id === selectedRuleId);
    if (!rule) return;
    const data = selectedStudents.map((s) => ({
      studentId: s.id,
      qty: quantities[s.id] || 1,
    }));
    onConfirm(rule, data, isMerge);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-slideDown max-h-[80vh] flex flex-col">
        <h3 className="font-bold text-lg text-indigo-900 mb-4 flex items-center gap-2">
          <Layers size={20} /> Xử lý hàng loạt ({selectedStudents.length})
        </h3>
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Chọn Lỗi / Thưởng:
          </label>
          <select
            className="w-full p-2 border rounded text-sm"
            value={selectedRuleId}
            onChange={(e) => setSelectedRuleId(e.target.value)}
          >
            {rules.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} ({r.points}đ)
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto border rounded p-2 bg-gray-50 mb-4">
          {selectedStudents.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center py-2 border-b last:border-0"
            >
              <span className="text-sm font-medium text-gray-700 w-2/3 truncate">
                {s.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Số lượng:</span>
                <input
                  type="number"
                  min="1"
                  className="w-16 p-1 border rounded text-center font-bold text-indigo-600"
                  value={quantities[s.id] || ""}
                  onChange={(e) => handleQtyChange(s.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-4 bg-yellow-50 p-2 rounded border border-yellow-200">
          <input
            type="checkbox"
            id="mergeCheck"
            checked={isMerge}
            onChange={(e) => setIsMerge(e.target.checked)}
            className="w-4 h-4 text-indigo-600"
          />
          <label
            htmlFor="mergeCheck"
            className="text-xs font-bold text-gray-700 cursor-pointer select-none"
          >
            Gộp thành 1 dòng (Ví dụ: "Lỗi... (x3)")
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 text-gray-600 rounded font-bold"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NEW COMPONENT: SPECIAL WEEK MODAL ---
const SpecialWeekModal = ({
  year,
  month,
  week,
  currentConfig,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState(
    currentConfig || { name: "", pointRate: 1, fineRate: 1 }
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-slideDown">
        <div className="flex items-center gap-2 mb-4 text-yellow-600">
          <Star size={24} fill="currentColor" />
          <h3 className="font-bold text-lg">Cấu hình Tuần Đặc Biệt</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Thiết lập cho:{" "}
          <b>
            Tuần {week} - Tháng {month}/{year}
          </b>
        </p>

        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Tên sự kiện (VD: Thi đua 20/11)
            </label>
            <input
              className="w-full p-2 border rounded font-bold text-indigo-700"
              placeholder="Nhập tên..."
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Hệ số Điểm (x)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border rounded"
                value={config.pointRate}
                onChange={(e) =>
                  setConfig({ ...config, pointRate: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Hệ số Tiền (x)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border rounded"
                value={config.fineRate}
                onChange={(e) =>
                  setConfig({ ...config, fineRate: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 italic">
            * Đặt hệ số là 1 để về bình thường.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 text-gray-600 rounded font-bold"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(config)}
            className="flex-1 py-2 bg-yellow-500 text-white rounded font-bold hover:bg-yellow-600"
          >
            Lưu thiết lập
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ dbState, onLogin, updateData }) => {
  const [activeTab, setActiveTab] = useState("student");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [searchStudent, setSearchStudent] = useState("");

  const [config, setConfig] = useState({
    appId: DEFAULT_APP_ID,
    version: DEFAULT_DATA_VERSION,
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [foundArtifacts, setFoundArtifacts] = useState([]);
  const [foundVersions, setFoundVersions] = useState([]);

  const [authorized, setAuthorized] = useState(false);
  const [authPin, setAuthPin] = useState("");

  useEffect(() => {
    if (isConfigOpen) {
      setDbStatus("checking");
      const docRef = doc(
        db,
        "artifacts",
        config.appId,
        "public",
        "data",
        config.version,
        "main"
      );
      const unsub = onSnapshot(docRef, (snap) => {
        if (snap.exists()) setDbStatus("found");
        else setDbStatus("not_found");
      });
      return () => unsub();
    }
  }, [config, isConfigOpen]);

  useEffect(() => {
    const localData = localStorage.getItem(`backup_${config.appId}`);
    if (localData) {
    }
  }, [config]);

  const verifyMaintenancePin = () => {
    const teacherPin = dbState?.users["teacher"]?.pin;
    if (authPin === teacherPin) {
      setAuthorized(true);
      setError("");
    } else {
      setError("Mã PIN không đúng! Vui lòng nhập PIN Giáo viên.");
    }
  };

  const handleScan = async () => {
    setDbStatus("scanning");
    try {
      const artifactsRef = collection(db, "artifacts");
      const artifactsSnap = await getDocs(artifactsRef);
      const apps = artifactsSnap.docs.map((d) => d.id);
      setFoundArtifacts(apps);
      if (apps.length > 0) handleSelectApp(apps[0]);
      else setDbStatus("no_artifacts");
    } catch (err) {
      console.error(err);
      setDbStatus("error");
    }
  };

  const handleSelectApp = async (appId) => {
    setConfig((prev) => ({ ...prev, appId }));
    try {
      const versionsRef = collection(db, "artifacts", appId, "public", "data");
      const versionsSnap = await getDocs(versionsRef);
      const versions = versionsSnap.docs.map((d) => d.id);
      setFoundVersions(versions);
    } catch (err) {
      setFoundVersions([]);
    }
  };

  const handleSelectVersion = (v) => {
    setConfig((prev) => ({ ...prev, version: v }));
  };
  const handleBackup = () => {
    const dataStr = JSON.stringify(dbState, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${config.appId}_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("✅ Đã tải file backup về máy!");
  };
  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (
      !window.confirm(
        "⚠️ CẢNH BÁO: Dữ liệu hiện tại sẽ bị GHI ĐÈ bằng dữ liệu trong file. Bạn có chắc chắn không?"
      )
    )
      return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.users || !parsed.weeklyData)
          return alert("❌ File không hợp lệ!");
        await updateData(parsed);
        alert("✅ Khôi phục dữ liệu thành công!");
      } catch (err) {
        alert("❌ Lỗi: " + err.message);
      }
    };
    reader.readAsText(file);
  };
  const handleRestoreFromCache = async () => {
    const localData = localStorage.getItem(`backup_${config.appId}`);
    if (localData) {
      if (!window.confirm("Khôi phục dữ liệu từ bộ nhớ đệm trình duyệt?"))
        return;
      try {
        const parsed = JSON.parse(localData);
        await updateData(parsed);
        alert("✅ Đã khôi phục từ Cache!");
      } catch (e) {
        alert("Lỗi cache");
      }
    } else {
      alert("Không có dữ liệu trong Cache");
    }
  };

  const getSortedList = (roleFilter) =>
    Object.values(dbState.users)
      .filter((u) => u.role === roleFilter)
      .sort((a, b) => (a.stt || 999) - (b.stt || 999));
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
      {" "}
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
            {" "}
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
              {" "}
              {user.role === ROLES.TEACHER ? (
                <School size={20} />
              ) : user.role === ROLES.ADMIN ? (
                <ShieldAlert size={20} />
              ) : user.role === ROLES.MANAGER ? (
                <UserCheck size={20} />
              ) : (
                <User size={20} />
              )}{" "}
            </div>{" "}
            <div className="text-center">
              <span className="font-medium text-sm text-gray-700 block truncate w-24">
                {user.name}
              </span>
              {user.stt && (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded">
                  STT: {user.stt}
                </span>
              )}
            </div>{" "}
          </button>
        ))}{" "}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={() => {
            setIsConfigOpen(!isConfigOpen);
            setAuthorized(false);
            setAuthPin("");
            setError("");
          }}
          className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
        >
          <Database size={16} />
        </button>
        {isConfigOpen && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm animate-slideDown">
            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Wifi size={14} /> Cấu hình & Backup
            </h3>
            {!authorized ? (
              <div className="space-y-2">
                {" "}
                <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                  <Shield size={12} /> Khu vực bảo mật
                </p>{" "}
                <input
                  type="password"
                  className="w-full p-2 border rounded text-center tracking-widest"
                  placeholder="Nhập PIN Giáo viên"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  autoFocus
                />{" "}
                <button
                  onClick={verifyMaintenancePin}
                  className="w-full py-1.5 bg-gray-800 text-white rounded text-xs font-bold hover:bg-black"
                >
                  Mở khóa
                </button>{" "}
                {error && (
                  <p className="text-red-500 text-xs text-center">{error}</p>
                )}{" "}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {" "}
                  <button
                    onClick={handleScan}
                    className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-indigo-700"
                  >
                    🔍 Quét tìm dữ liệu cũ
                  </button>{" "}
                </div>
                {foundArtifacts.length > 0 && (
                  <div className="mb-2">
                    {" "}
                    <p className="text-xs font-bold text-gray-600">
                      Chọn Lớp (App ID):
                    </p>{" "}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {" "}
                      {foundArtifacts.map((app) => (
                        <button
                          key={app}
                          onClick={() => handleSelectApp(app)}
                          className={`px-2 py-1 text-xs rounded border ${
                            config.appId === app
                              ? "bg-blue-100 border-blue-500 text-blue-700"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          {" "}
                          {app}{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )}
                {foundVersions.length > 0 && (
                  <div className="mb-2">
                    {" "}
                    <p className="text-xs font-bold text-gray-600">
                      Chọn Phiên bản (Version):
                    </p>{" "}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {" "}
                      {foundVersions.map((v) => (
                        <button
                          key={v}
                          onClick={() => handleSelectVersion(v)}
                          className={`px-2 py-1 text-xs rounded border ${
                            config.version === v
                              ? "bg-green-100 border-green-500 text-green-700"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          {" "}
                          {v}{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )}
                <div>
                  <label className="block text-xs text-gray-500">
                    Mã Lớp (Hiện tại)
                  </label>
                  <input
                    className="w-full p-1 border rounded"
                    value={config.appId}
                    onChange={(e) =>
                      setConfig({ ...config, appId: e.target.value })
                    }
                  />
                </div>{" "}
                <div>
                  <label className="block text-xs text-gray-500">
                    Phiên bản (Hiện tại)
                  </label>
                  <input
                    className="w-full p-1 border rounded"
                    value={config.version}
                    onChange={(e) =>
                      setConfig({ ...config, version: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  {" "}
                  {dbStatus === "checking" && (
                    <span className="text-yellow-600 text-xs">
                      Đang kiểm tra kết nối...
                    </span>
                  )}{" "}
                  {dbStatus === "found" && (
                    <span className="text-green-600 text-xs font-bold">
                      ✅ Đã kết nối thành công!
                    </span>
                  )}{" "}
                  {dbStatus === "not_found" && (
                    <span className="text-red-500 text-xs font-bold">
                      ❌ Không tìm thấy (Sẽ tạo mới)
                    </span>
                  )}{" "}
                  {dbStatus === "no_artifacts" && (
                    <span className="text-gray-500 text-xs">
                      Không tìm thấy lớp nào.
                    </span>
                  )}{" "}
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-300">
                  {" "}
                  <button
                    onClick={handleBackup}
                    className="flex-1 py-1.5 bg-blue-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-600"
                  >
                    <Download size={14} /> Backup
                  </button>{" "}
                  <label className="flex-1 py-1.5 bg-orange-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-orange-600 cursor-pointer">
                    {" "}
                    <Upload size={14} /> Restore{" "}
                    <input
                      type="file"
                      className="hidden"
                      accept=".json"
                      onChange={handleRestore}
                    />{" "}
                  </label>{" "}
                </div>{" "}
                <button
                  onClick={handleRestoreFromCache}
                  className="w-full py-1.5 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700 mt-1 flex items-center justify-center gap-1"
                >
                  <HardDrive size={14} /> Khôi phục từ Bộ nhớ đệm
                </button>{" "}
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-1.5 bg-gray-800 text-white rounded text-xs font-bold hover:bg-black mt-2"
                >
                  🔄 Tải lại trang để áp dụng
                </button>{" "}
              </div>
            )}{" "}
          </div>
        )}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Lớp Học Vui Vẻ</h1>
          <p className="text-gray-500 text-sm">Năm học mới & Danh sách mới</p>
        </div>
        {!selectedUser ? (
          <>
            {" "}
            <div className="flex border-b border-gray-200 mb-4">
              {" "}
              <button
                onClick={() => setActiveTab("student")}
                className={`flex-1 pb-2 text-xs sm:text-sm font-medium ${
                  activeTab === "student"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
              >
                Học sinh
              </button>{" "}
              <button
                onClick={() => setActiveTab("manager")}
                className={`flex-1 pb-2 text-xs sm:text-sm font-medium ${
                  activeTab === "manager"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
              >
                Tổ trưởng
              </button>{" "}
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 pb-2 text-xs sm:text-sm font-medium ${
                  activeTab === "admin"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
              >
                Quản trị
              </button>{" "}
            </div>{" "}
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
            )}{" "}
            {activeTab === "admin" && renderUserList(admins)}{" "}
            {activeTab === "manager" && renderUserList(managers)}{" "}
            {activeTab === "student" && renderUserList(students)}{" "}
          </>
        ) : (
          <div className="space-y-5">
            {" "}
            <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-lg">
              {" "}
              <div className="bg-indigo-100 p-2 rounded-full">
                {selectedUser.role === ROLES.TEACHER ? (
                  <School size={20} className="text-indigo-600" />
                ) : (
                  <User size={20} className="text-indigo-600" />
                )}
              </div>{" "}
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                  {selectedUser.role}
                </p>
              </div>{" "}
            </div>{" "}
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
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
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
    botConfig = DEFAULT_BOT_CONFIG,
    specialWeeks = {},
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

  // STATE FOR BULK ADD
  const [isStudentSelectionMode, setIsStudentSelectionMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkAddModalOpen, setBulkAddModalOpen] = useState(false);

  // Other Existing State
  const [customMode, setCustomMode] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [selectedRuleForCustom, setSelectedRuleForCustom] = useState(null);
  const [selectedStudentForCustom, setSelectedStudentForCustom] =
    useState(null);
  const [batchUpdateModalOpen, setBatchUpdateModalOpen] = useState(false);
  const [pendingRuleUpdate, setPendingRuleUpdate] = useState(null);
  const [pendingBulkRulesUpdate, setPendingBulkRulesUpdate] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedViolationKeys, setSelectedViolationKeys] = useState([]);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [isBulkRulesMode, setIsBulkRulesMode] = useState(false);
  const [tempRules, setTempRules] = useState([]);
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(1);
  const [startYear, setStartYear] = useState(activeYearId);
  const [endYear, setEndYear] = useState(activeYearId);
  const [botModalOpen, setBotModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    label: "",
    fine: 0,
    points: -2,
    type: "penalty",
  });
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // STATE FOR SPECIAL WEEK
  const [specialWeekModalOpen, setSpecialWeekModalOpen] = useState(false);

  const isTeacher = currentUser.role === ROLES.TEACHER;
  const isAdmin = currentUser.role === ROLES.ADMIN;
  const isManager = currentUser.role === ROLES.MANAGER;
  const isStudent = currentUser.role === ROLES.STUDENT;
  const canManageAccount = !isStudent;
  const canManageRules =
    isTeacher || (isAdmin && adminPermissions.canManageRules);
  const canEditMonths = isTeacher || isAdmin;
  const canUseBulk =
    isTeacher || isAdmin || (isManager && managerPermissions.allowBulkActions);
  const canUseCustom =
    isTeacher || isAdmin || (isManager && managerPermissions.allowCustomMode);
  const canRunBot = isTeacher || isAdmin || currentUser.canUseBot;

  useEffect(() => {
    if (dbState) {
      localStorage.setItem(`backup_${DEFAULT_APP_ID}`, JSON.stringify(dbState));
    }
  }, [dbState]);

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

  // CHECK SPECIAL WEEK
  const currentWeekKey = getKey(activeYearId, activeMonthId, activeWeek);
  const currentSpecialWeek = specialWeeks[currentWeekKey];

  // --- STATS ---
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

  // --- ACTIONS ---
  const handleChangeSelfPassword = (newPin) => {
    const updatedUsers = {
      ...users,
      [currentUser.id]: { ...currentUser, pin: newPin },
    };
    updateData({ users: updatedUsers });
    setShowPasswordModal(false);
    alert("Đổi mật khẩu thành công!");
  };
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
  const handleRunBot = (config) => {
    /* Code Bot giữ nguyên (rút gọn để đỡ dài) */ let content = "";
    let title = "";
    if (config.mode === "cleaning") {
      title = "🧹 Lịch trực nhật";
      content = "Phân công:\n"; /* ... logic cleaning ... */
    } else if (config.mode === "remind") {
      title = "📢 Nhắc nhở";
      content = "Nhắc nhở...";
    } else {
      title = "🤖 Báo cáo";
      content = "Báo cáo...";
    }
    const botNotice = {
      id: Date.now(),
      title: title,
      content: content,
      date: Date.now(),
      author: "Bot",
      role: "bot",
      isBot: true,
    };
    updateData({ notices: [botNotice, ...notices], botConfig: config });
    setBotModalOpen(false);
    alert("Đã đăng!");
  };

  // --- SPECIAL WEEK LOGIC ---
  const handleSaveSpecialWeek = (config) => {
    const key = getKey(activeYearId, activeMonthId, activeWeek);
    const newSpecialWeeks = { ...specialWeeks, [key]: config };
    // Nếu rate = 1 và name rỗng -> Xóa
    if (config.pointRate === 1 && config.fineRate === 1 && !config.name) {
      delete newSpecialWeeks[key];
    }
    updateData({ specialWeeks: newSpecialWeeks });
    setSpecialWeekModalOpen(false);
  };

  // --- VIOLATION LOGIC (UPDATED WITH SPECIAL WEEK) ---
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

    let calculatedFine = fine || 0;
    let calculatedPoints = points;
    let violationLabel = rule.label;

    // Apply Progressive Penalty
    if (adminPermissions.progressivePenaltyMode && rule.type === "penalty") {
      const totalPenalties = cD.violations.filter(
        (v) => v.type === "penalty"
      ).length;
      const multiplier = totalPenalties + 1;
      if (multiplier > 1) {
        calculatedFine = calculatedFine * multiplier;
        violationLabel = `${rule.label} (Lần ${multiplier})`;
      }
    }

    // Apply Special Week Multiplier
    if (currentSpecialWeek) {
      calculatedPoints *= currentSpecialWeek.pointRate;
      calculatedFine *= currentSpecialWeek.fineRate;
      // Chỉ thêm tag nếu có tên sự kiện
      if (currentSpecialWeek.name)
        violationLabel = `[${currentSpecialWeek.name}] ${violationLabel}`;
    }

    const nE = {
      id: Date.now(),
      ruleId: rule.id,
      ruleLabel: violationLabel,
      fineAtTime: calculatedFine,
      pointsAtTime: calculatedPoints,
      timestamp: Date.now(),
      by: currentUser.name,
      type: rule.type,
    };
    let fineChange = 0;
    if (rule.type === "penalty") {
      fineChange = calculatedFine;
    } else if (rule.type === "bonus") {
      fineChange = -calculatedFine;
    }
    const uD = {
      ...cD,
      score: cD.score + calculatedPoints,
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

  // --- BULK ADD LOGIC (UPDATED WITH SPECIAL WEEK) ---
  const toggleStudentSelection = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleBulkAddViolations = (rule, data, isMerge) => {
    let newWeeklyData = { ...weeklyData };
    const dataKey = getKey(activeYearId, activeMonthId, activeWeek);
    const weekData = newWeeklyData[dataKey] || {};

    data.forEach((item) => {
      const { studentId, qty } = item;
      if (qty <= 0) return;

      const currentStudentData = weekData[studentId] || {
        score: 80,
        fines: 0,
        violations: [],
      };

      let unitPoints = rule.points;
      let unitFine = rule.fine || 0;
      let labelPrefix = "";

      // Apply Special Week
      if (currentSpecialWeek) {
        unitPoints *= currentSpecialWeek.pointRate;
        unitFine *= currentSpecialWeek.fineRate;
        if (currentSpecialWeek.name)
          labelPrefix = `[${currentSpecialWeek.name}] `;
      }

      const totalPoints = unitPoints * qty;
      const totalFine = unitFine * qty;

      let newViolationsToAdd = [];

      if (isMerge) {
        const label = `${labelPrefix}${rule.label} (x${qty})`;
        newViolationsToAdd.push({
          id: Date.now() + Math.random(),
          ruleId: rule.id,
          ruleLabel: label,
          fineAtTime: rule.type === "penalty" ? totalFine : 0,
          pointsAtTime: totalPoints,
          timestamp: Date.now(),
          by: currentUser.name,
          type: rule.type,
        });
      } else {
        for (let i = 0; i < qty; i++) {
          newViolationsToAdd.push({
            id: Date.now() + Math.random() + i,
            ruleId: rule.id,
            ruleLabel: labelPrefix + rule.label,
            fineAtTime: unitFine,
            pointsAtTime: unitPoints,
            timestamp: Date.now(),
            by: currentUser.name,
            type: rule.type,
          });
        }
      }

      let fineChange = 0;
      if (rule.type === "penalty") fineChange = totalFine;
      else if (rule.type === "bonus") fineChange = -totalFine;

      weekData[studentId] = {
        ...currentStudentData,
        score: currentStudentData.score + totalPoints,
        fines: currentStudentData.fines + fineChange,
        violations: [...newViolationsToAdd, ...currentStudentData.violations],
      };
    });

    newWeeklyData[dataKey] = weekData;
    updateData({ weeklyData: newWeeklyData });
    setBulkAddModalOpen(false);
    setSelectedStudentIds([]);
    setIsStudentSelectionMode(false);
    alert(`Đã cập nhật cho ${data.length} học sinh!`);
  };

  // --- OTHER ACTIONS ---
  const handleAddYear = () => {
    if (!isTeacher && !isAdmin) return;
    const newYear = activeYearId + 1;
    if (confirm(`Tạo năm học mới: ${newYear}?`)) {
      updateData({
        years: [
          ...years,
          { id: newYear, name: `${newYear}`, lockedMonths: [] },
        ],
      });
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
    /* ... giữ nguyên ... */ const updates = pendingBulkRulesUpdate
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
                      <div className="flex items-center gap-2">
                        {isStudentSelectionMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStudentSelection(student.id);
                            }}
                          >
                            {selectedStudentIds.includes(student.id) ? (
                              <CheckSquare
                                size={20}
                                className="text-indigo-600"
                              />
                            ) : (
                              <Square size={20} className="text-gray-400" />
                            )}
                          </button>
                        )}
                        <span className="font-semibold text-gray-800">
                          {student.stt}. {student.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${rating.color}`}
                      >
                        {sData.score}đ - {rating.label}
                      </span>
                    </div>

                    {!isStudent &&
                      !isMonthLocked &&
                      !selectionMode &&
                      !isStudentSelectionMode && (
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
      {helpModalOpen && (
        <HelpModal
          role={currentUser.role}
          onClose={() => setHelpModalOpen(false)}
        />
      )}
      {botModalOpen && (
        <BotConfigModal
          config={botConfig}
          onClose={() => setBotModalOpen(false)}
          onSave={(cfg) => updateData({ botConfig: cfg })}
          onRun={handleRunBot}
          activeMonthId={activeMonthId}
          activeWeek={activeWeek}
          users={users}
        />
      )}
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
      {bulkAddModalOpen && (
        <BulkAddModal
          selectedStudents={Object.values(users).filter((u) =>
            selectedStudentIds.includes(u.id)
          )}
          rules={rules}
          onClose={() => setBulkAddModalOpen(false)}
          onConfirm={handleBulkAddViolations}
        />
      )}
      {specialWeekModalOpen && (
        <SpecialWeekModal
          year={activeYearId}
          month={activeMonthId}
          week={activeWeek}
          currentConfig={currentSpecialWeek}
          onClose={() => setSpecialWeekModalOpen(false)}
          onSave={handleSaveSpecialWeek}
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
              onClick={() => setHelpModalOpen(true)}
              className="p-2 text-gray-400 hover:text-blue-500"
            >
              <HelpCircle size={18} />
            </button>
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
        {/* BANNER TUẦN ĐẶC BIỆT */}
        {currentSpecialWeek && activeMonthId !== "ALL" && (
          <div className="mb-4 bg-gradient-to-r from-yellow-200 to-orange-100 p-3 rounded-xl border border-yellow-300 shadow-sm animate-slideDown flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400 text-white rounded-full shadow-sm">
                <Crown size={20} />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900 text-sm uppercase">
                  {currentSpecialWeek.name}
                </h3>
                <div className="flex gap-2 text-xs font-medium text-yellow-800 mt-0.5">
                  {currentSpecialWeek.pointRate !== 1 && (
                    <span className="bg-white/50 px-2 py-0.5 rounded">
                      Điểm x{currentSpecialWeek.pointRate}
                    </span>
                  )}
                  {currentSpecialWeek.fineRate !== 1 && (
                    <span className="bg-white/50 px-2 py-0.5 rounded">
                      Tiền x{currentSpecialWeek.fineRate}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {isTeacher && (
              <button
                onClick={() => setSpecialWeekModalOpen(true)}
                className="p-2 text-yellow-700 hover:bg-yellow-200 rounded-lg"
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>
        )}

        {/* TAB: THÔNG BÁO */}
        {activeTab === "notices" && (
          <NoticeBoard
            notices={notices}
            currentUser={currentUser}
            onSave={handleAddNotice}
            onDelete={handleDeleteNotice}
            onOpenBot={() => setBotModalOpen(true)}
            canRunBot={canRunBot}
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
                  {/* NÚT CHỌN HS (MỚI) */}
                  {canUseBulk && (
                    <button
                      onClick={() => {
                        setIsStudentSelectionMode(!isStudentSelectionMode);
                        setSelectedStudentIds([]);
                        setSelectionMode(false);
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all ${
                        isStudentSelectionMode
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-600"
                      }`}
                    >
                      <UserCheck size={14} /> Chọn HS
                    </button>
                  )}

                  {/* NÚT XỬ LÝ HÀNG LOẠT (HIỆN KHI CÓ CHỌN) */}
                  {isStudentSelectionMode && selectedStudentIds.length > 0 && (
                    <button
                      onClick={() => setBulkAddModalOpen(true)}
                      className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm animate-slideDown flex items-center gap-1"
                    >
                      <Zap size={14} /> Xử lý ({selectedStudentIds.length})
                    </button>
                  )}

                  {/* NÚT CHỌN LỖI (CŨ) */}
                  {canUseBulk && !isStudentSelectionMode && (
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
                      <CheckSquare size={14} /> Chọn Lỗi
                    </button>
                  )}
                  {selectionMode && selectedViolationKeys.length > 0 && (
                    <button
                      onClick={() => setBulkEditModalOpen(true)}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm animate-slideDown"
                    >
                      Sửa Lỗi ({selectedViolationKeys.length})
                    </button>
                  )}
                </div>

                {/* Nút chế độ tùy chỉnh cũ (nếu cần) */}
                {!selectionMode && !isStudentSelectionMode && canUseCustom && (
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
                      <p className="text-sm font-medium flex items-center gap-1">
                        {r.label}
                      </p>
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
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  {editingRuleId ? "Sửa quy định" : "Thêm quy định mới"}
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

        {/* TAB: CẤU HÌNH (SETTINGS) - CHỈ DÀNH CHO GV */}
        {activeTab === "settings" && isTeacher && (
          <div className="fade-in space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Star size={20} className="text-yellow-500" /> Tuần Đặc Biệt
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 mb-2">
                  Đang chọn:{" "}
                  <b>
                    Tuần {activeWeek} - {activeMonthLabel}
                  </b>
                </p>
                {currentSpecialWeek ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-yellow-900">
                        {currentSpecialWeek.name}
                      </p>
                      <p className="text-xs text-yellow-700">
                        Điểm x{currentSpecialWeek.pointRate} | Tiền x
                        {currentSpecialWeek.fineRate}
                      </p>
                    </div>
                    <button
                      onClick={() => setSpecialWeekModalOpen(true)}
                      className="bg-white border border-yellow-300 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSpecialWeekModalOpen(true)}
                    className="w-full py-2 bg-yellow-500 text-white rounded-lg font-bold text-sm hover:bg-yellow-600 shadow-sm"
                  >
                    Thiết lập tuần này là Tuần Đặc Biệt
                  </button>
                )}
              </div>
            </div>
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
          {isTeacher && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center p-2 rounded-lg ${
                activeTab === "settings"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-400"
              }`}
            >
              <Settings size={20} />
              <span className="text-[10px] mt-1">Cấu hình</span>
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
      managerPermissions: DEFAULT_MANAGER_PERMISSIONS,
      months: FIXED_MONTHS.map((m) => ({ ...m, isLocked: false })),
      notices: [],
      botConfig: DEFAULT_BOT_CONFIG,
      specialWeeks: {},
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
    return (
      <LoginScreen
        dbState={dbState}
        onLogin={setCurrentUser}
        updateData={updateData}
      />
    );
  return (
    <Dashboard
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
      dbState={dbState}
      updateData={updateData}
    />
  );
}
