import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Users,
  Package,
  BarChart3,
  Truck,
  Tag,
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Warehouse,
  FileText,
  Shield,
  HelpCircle,
} from "lucide-react";

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('admin-theme') === 'dark';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Unified theme sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [isDarkMode]);

  // Menu items organized by sections
  const menuSections = [
    {
      title: "Overview",
      items: [
        { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        {
          path: "/admin/analytics",
          icon: BarChart3,
          label: "Analytics",
          badge: "New",
        },
      ],
    },
    {
      title: "Catalog",
      items: [
        { path: "/admin/products", icon: ShoppingBag, label: "Products" },
        { path: "/admin/categories", icon: Layers, label: "Categories" },
        {
          path: "/admin/inventory",
          icon: Package,
          label: "Inventory",
          badge: "3",
        },
      ],
    },
    {
      title: "Sales",
      items: [
        { path: "/admin/orders", icon: Truck, label: "Orders" },
        { path: "/admin/customers", icon: Users, label: "Customers" },
        { path: "/admin/coupons", icon: Tag, label: "Coupons & Offers" },
      ],
    },
    {
      title: "Operations",
      items: [
        { path: "/admin/suppliers", icon: Warehouse, label: "Suppliers" },
        { path: "/admin/reports", icon: FileText, label: "Reports" },
      ],
    },
    {
      title: "Settings",
      items: [
        { path: "/admin/settings", icon: Settings, label: "Store Settings" },
        { path: "/admin/users", icon: Shield, label: "Admin Users" },
        { path: "/admin/messages", icon: MessageSquare, label: "Messages" },
      ],
    },
  ];

  const notifications = [
    {
      id: 1,
      type: "order",
      message: "New order #ORD2601A7 received",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "stock",
      message: "Low stock alert: Basmati Rice (5 left)",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      type: "order",
      message: "Order #ORD2601A5 delivered successfully",
      time: "1 hour ago",
      unread: false,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".notification-dropdown"))
        setShowNotifications(false);
      if (!e.target.closest(".user-dropdown")) setShowUserMenu(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      className={`min-h-screen flex ${isDarkMode ? "dark bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "w-20" : "w-72"} lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Agrawal
                  </span>
                  <span className="text-[10px] text-primary-600 font-semibold tracking-widest uppercase">
                    Admin Panel
                  </span>
                </div>
              )}
            </Link>
            <button
              className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Search (visible when expanded) */}
          {!isSidebarCollapsed && (
            <div className="px-4 py-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-all outline-none"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar">
            {menuSections.map((section, idx) => (
              <div key={section.title} className={idx > 0 ? "mt-6" : ""}>
                {!isSidebarCollapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      location.pathname.startsWith(`${item.path}/`);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title={isSidebarCollapsed ? item.label : ""}
                      >
                        <Icon
                          size={20}
                          className={
                            isActive
                              ? "text-white"
                              : "text-gray-500 dark:text-gray-400 group-hover:text-primary-600"
                          }
                        />
                        {!isSidebarCollapsed && (
                          <>
                            <span className="font-medium flex-1">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-primary-50 text-primary-600"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer - User */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div
              className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors font-medium text-sm"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile menu button */}
            <button
              className="p-2 text-gray-600 dark:text-gray-300 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Collapse button (desktop) */}
            <button
              className="hidden lg:flex p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            >
              <Menu size={20} />
            </button>

            {/* Page Title */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {(() => {
                  const segments = location.pathname.split("/").filter(Boolean);
                  const last = segments[segments.length - 1];
                  const prev = segments[segments.length - 2];

                  if (!last || last === "admin") return "Dashboard";

                  // Handle "new"
                  if (last === "new")
                    return `New ${prev?.slice(0, -1) || "Item"}`;

                  // Handle Mongo ID (24 hex chars)
                  if (/^[0-9a-fA-F]{24}$/.test(last)) {
                    if (prev === "edit") {
                      const resource = segments[segments.length - 3];
                      return `Edit ${resource?.slice(0, -1) || "Item"}`;
                    }
                    return `${prev?.slice(0, -1) || "Details"}`;
                  }

                  return last.replace(/-/g, " ");
                })()}
              </h1>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2 active:scale-90"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-gray-600" />}
              <span className="text-[10px] font-black uppercase hidden sm:block tracking-widest">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            {/* Notifications */}
            <div className="relative notification-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${notif.unread ? "bg-primary-50/50 dark:bg-primary-900/20" : ""}`}
                      >
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative user-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <ChevronDown
                  size={16}
                  className="text-gray-500 hidden sm:block"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Settings size={16} />
                    <span className="text-sm">Settings</span>
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <HelpCircle size={16} />
                    <span className="text-sm">View Store</span>
                  </Link>
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
