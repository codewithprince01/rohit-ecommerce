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
  Star,
  Image as ImageIcon,
  Mail,
  MapPin,
  Palette,
  Receipt,
  Store,
  Repeat,
  Bike,
  Clock,
  RotateCcw,
  BellRing,
} from "lucide-react";

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setDarkMode] = useState(() => {
    // Default to dark mode unless explicitly set to light
    const savedTheme = localStorage.getItem('admin-theme');
    return savedTheme !== 'light';
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
        { path: "/admin/brands", icon: Store, label: "Brands" },
        {
          path: "/admin/inventory",
          icon: Package,
          label: "Inventory",
          badge: "3",
        },
        { path: "/admin/reviews", icon: Star, label: "Reviews" },
      ],
    },
    {
      title: "Sales",
      items: [
        { path: "/admin/orders", icon: Truck, label: "Orders" },
        { path: "/admin/subscriptions", icon: Repeat, label: "Subscriptions" },
        { path: "/admin/customers", icon: Users, label: "Customers" },
        { path: "/admin/coupons", icon: Tag, label: "Coupons & Offers" },
      ],
    },
    {
      title: "Marketing",
      items: [
        { path: "/admin/banners", icon: ImageIcon, label: "Banners" },
        { path: "/admin/push-notifications", icon: BellRing, label: "Push Notifications" },
        { path: "/admin/newsletters", icon: Mail, label: "Newsletters" },
      ],
    },
    {
      title: "Operations & Logistics",
      items: [
        { path: "/admin/delivery-slots", icon: Clock, label: "Delivery Slots" },
        { path: "/admin/fleet", icon: Bike, label: "Delivery Fleet" },
        { path: "/admin/returns", icon: RotateCcw, label: "Returns & Refunds" },
        { path: "/admin/suppliers", icon: Warehouse, label: "Suppliers" },
        { path: "/admin/shipping", icon: MapPin, label: "Shipping & Zones" },
        { path: "/admin/reports", icon: FileText, label: "Reports" },
      ],
    },
    {
      title: "Settings",
      items: [
        { path: "/admin/appearance", icon: Palette, label: "Appearance" },
        { path: "/admin/settings", icon: Settings, label: "Store Settings" },
        { path: "/admin/taxes", icon: Receipt, label: "Taxes & Duties" },
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
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">A</span>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    Agrawal
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                    Store Admin
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
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar">
            {menuSections.map((section, idx) => (
              <div key={section.title} className={idx > 0 ? "mt-6" : ""}>
                {!isSidebarCollapsed && (
                  <h3 className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      location.pathname.startsWith(`${item.path}/`);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                          isActive
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-semibold"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white font-medium"
                        }`}
                        title={isSidebarCollapsed ? item.label : ""}
                      >
                        <Icon
                          size={18}
                          className={
                            isActive
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                          }
                        />
                        {!isSidebarCollapsed && (
                          <>
                            <span className="flex-1 text-sm">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                  isActive
                                    ? "bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
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
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
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
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium text-sm border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
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
