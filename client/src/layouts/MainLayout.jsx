import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/common/CartDrawer';
import WhatsAppButton from '../components/common/WhatsAppButton';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
            <WhatsAppButton />
        </div>
    );
};

export default MainLayout;
