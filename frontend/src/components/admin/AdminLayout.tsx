import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '@/api/auth';
import { 
  LayoutDashboard, 
  Briefcase, 
  Image as ImageIcon, 
  Layers, 
  Package, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ExternalLink,
  Globe,
  PanelBottom,
  Handshake,
  Quote
} from 'lucide-react';
import { useState } from 'react';

// Mock admin layout only. Real authentication and authorization will be added in backend phase.

const navItems = [
  { path: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/website', label: 'محرر الموقع المرئي', icon: Globe },
  { path: '/admin/projects', label: 'المشاريع', icon: Briefcase },
  { path: '/admin/gallery', label: 'المعرض', icon: ImageIcon },
  { path: '/admin/services', label: 'الخدمات', icon: Layers },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/partners', label: 'شركاء النجاح', icon: Handshake },
  { path: '/admin/testimonials', label: 'آراء العملاء', icon: Quote },
  { path: '/admin/footer', label: 'تذييل الموقع', icon: PanelBottom },
  { path: '/admin/messages', label: 'الرسائل', icon: MessageSquare },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  // Exclude login from layout
  if (location.pathname === '/admin/login') {
    return <Outlet />;
  }

  return (
    <div className="flex bg-brand-surface min-h-screen text-brand-text font-sans" dir="rtl">
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 bg-brand-navy p-2 rounded border border-white/10"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-brand-navy border-l border-white/10 shrink-0 z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
           <div className="w-8 h-8 bg-brand-gold flex items-center justify-center font-bold text-white">AL</div>
           <span className="font-bold text-xl text-white">إدارة أفق</span>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-brand-gold/10 text-brand-gold' : 'text-brand-silver hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-bold">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10 space-y-2">
           <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-md text-brand-silver hover:bg-white/5 hover:text-white transition-colors">
              <ExternalLink className="w-5 h-5 shrink-0" />
              <span className="font-medium">العودة للموقع</span>
           </Link>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-red-400 hover:bg-red-400/10 transition-colors">
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="font-medium">تسجيل الخروج</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 pb-24 overflow-x-hidden">
        {/* Top Header Mocking */}
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
          <h1 className="text-2xl font-bold text-white">اللوحة الرئيسية</h1>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-white">المدير العام</p>
               <p className="text-xs text-brand-silver">admin@alu-horizon.com</p>
             </div>
             <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center font-bold text-white">
                AD
             </div>
          </div>
        </header>

        <Outlet />
      </main>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
