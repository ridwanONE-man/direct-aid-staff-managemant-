import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { StaffDirectory } from './components/directory/StaffDirectory';
import { CampusDivisions } from './components/divisions/CampusDivisions';
import { EmployeeProfile } from './components/profile/EmployeeProfile';
import { ContractsHub } from './components/contracts/ContractsHub';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { RegisterEmployeePage } from './components/register/RegisterEmployeePage';
import { RenewContractModal } from './components/modals/RenewContractModal';
import { SaveNotice } from './components/common/SaveNotice';
import { SettingsPage } from './components/settings/SettingsPage';

const ReadOnlyNotice: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="bg-white border border-[#E2EAE4] rounded-2xl p-12 text-center shadow-xs">
    <h3 className="text-base font-bold text-[#192C21]">Read-only account</h3>
    <p className="text-xs text-[#57685D] mt-1">Registering staff needs an Admin or HR account.</p>
    <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl">
      Back to Dashboard
    </button>
  </div>
);

const AppContent: React.FC = () => {
  const { activePage, isAuthenticated, isAuthReady, isDataLoading, syncError, clearSyncError, canEdit, setActivePage } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#F5F8F6] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#147D4A]/30 border-t-[#147D4A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell min-h-screen bg-[#F5F8F6] text-[#192C21] flex flex-col font-sans" data-readonly={canEdit ? undefined : ''}>
      {/* Branded background: soft green tints with a faint DirectAid logo watermark */}
      <div className="app-backdrop" aria-hidden="true">
        <img
          src="/directaid-logo-full.png"
          alt=""
          className={`app-backdrop-logo ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        />
      </div>
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
      />

      {/* Header Bar */}
      <Header
        isCollapsed={isSidebarCollapsed}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
      />

      {/* Main Content Area */}
      <main
        className={`relative z-[1] pt-20 pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 flex-1 ${
          isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {syncError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-start justify-between gap-3">
              <span>{syncError}</span>
              <button type="button" onClick={clearSyncError} className="font-bold shrink-0 hover:underline">
                Dismiss
              </button>
            </div>
          )}
          {!canEdit && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium">
              You have <span className="font-bold">read-only</span> access. You can view everything, but only Admin and HR accounts can make changes.
            </div>
          )}
          {isDataLoading && (
            <div className="mb-4 p-3 bg-[#EBF7EE] border border-[#C5E8D2] text-[#147D4A] rounded-xl text-xs font-semibold">
              Loading data from Supabase...
            </div>
          )}
          {activePage === 'dashboard' && <ExecutiveDashboard />}
          {activePage === 'directory' && <StaffDirectory />}
          {activePage === 'divisions' && <CampusDivisions />}
          {activePage === 'profile' && <EmployeeProfile />}
          {activePage === 'contracts' && <ContractsHub />}
          {activePage === 'reports' && <ReportsCenter />}
          {activePage === 'register' && (canEdit ? <RegisterEmployeePage /> : <ReadOnlyNotice onBack={() => setActivePage('dashboard')} />)}
          {activePage === 'settings' && <SettingsPage />}
        </div>
      </main>

      <SaveNotice />

      {/* Interactive Global Modals */}
      <RenewContractModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
