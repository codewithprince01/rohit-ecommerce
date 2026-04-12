import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import AdminRoute from "./admin/components/AdminRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./admin/layouts/AdminLayout";

// Public Pages
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProductList from "./pages/public/ProductList";
import ProductDetails from "./pages/public/ProductDetails";
import Cart from "./pages/public/Cart";
import Checkout from "./pages/public/Checkout";
import OrderSuccess from "./pages/public/OrderSuccess";
import CategoryPage from "./pages/public/CategoryPage";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";

// Admin Pages
import AdminDashboard from "./admin/pages/Dashboard";
import AdminAnalytics from "./admin/pages/Analytics";
import AdminProducts from "./admin/pages/Products";
import ProductForm from "./admin/pages/ProductForm";
import AdminCategories from "./admin/pages/Categories";
import AdminOrders from "./admin/pages/Orders";
import AdminInventory from "./admin/pages/Inventory";
import AdminCustomers from "./admin/pages/Customers";
import AdminCoupons from "./admin/pages/Coupons";
import AdminSettings from "./admin/pages/Settings";
import AdminMessages from "./admin/pages/Messages";
import AdminLogin from "./admin/pages/Login";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-center" reverseOrder={false} />
            <Suspense
              fallback={
                <div className="h-screen w-screen flex items-center justify-center bg-white">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              }
            >
              <Routes>
                {/* Public Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/product/:slug" element={<ProductDetails />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route
                    path="/category/:slug/:subSlug"
                    element={<CategoryPage />}
                  />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Route>

                {/* Admin Login - Separated from Public Login */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route
                      index
                      element={<Navigate to="/admin/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/edit/:id" element={<ProductForm />} />
                    <Route path="products/:id" element={<ProductForm />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route
                      path="suppliers"
                      element={
                        <div className="text-center py-12 text-gray-500">
                          Suppliers Management - Coming Soon
                        </div>
                      }
                    />
                    <Route
                      path="reports"
                      element={
                        <div className="text-center py-12 text-gray-500">
                          Reports & Analytics - Coming Soon
                        </div>
                      }
                    />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route
                      path="users"
                      element={
                        <div className="text-center py-12 text-gray-500">
                          Admin Users - Coming Soon
                        </div>
                      }
                    />
                    <Route path="messages" element={<AdminMessages />} />
                  </Route>
                </Route>

                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <div className="h-screen flex items-center justify-center text-xl">
                      404 - Page Not Found
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
