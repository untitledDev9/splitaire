import React from 'react';
import { X, Home, Plus, History, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="flex items-center">
      <div className="w-6 h-6 bg-emerald-600 rounded-sm"></div>
      <div className="flex flex-col ml-1">
        <div className="w-3 h-1.5 bg-emerald-600 rounded-sm mb-0.5"></div>
        <div className="w-3 h-1.5 bg-emerald-600 rounded-sm mb-0.5"></div>
        <div className="w-3 h-1.5 bg-emerald-600 rounded-sm"></div>
      </div>
    </div>
  );
};

const Sidebar = ({ activePage, setActivePage, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'create', label: 'Create Bill', icon: Plus, path: '/createbill' },
    { id: 'history', label: 'History', icon: History, path: '/history' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const handleMenuClick = (itemId, path) => {
    setActivePage(itemId);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    navigate(path);
  };

  const MenuItems = () => (
    <nav className="flex-1 p-4 space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id, item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activePage === item.id
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-semibold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <Logo />
          <span className="text-xl font-bold text-emerald-600">
            Splitaire
          </span>
        </div>
        <MenuItems />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className="lg:hidden fixed left-0 top-0 w-64 bg-white h-screen z-50 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo />
                <span className="text-xl font-bold text-emerald-600">
                  Splitaire
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <MenuItems />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;