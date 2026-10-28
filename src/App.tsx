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
import { AddEmployeeModal } from './components/modals/AddEmployeeModal';
import { RenewContractModal } from './components/modals/RenewContractModal';
import { UploadDocumentModal } from './components/modals/UploadDocumentModal';

const AppContent: React.FC = () => {
  const { activePage, isAuthenticated } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#F5F8F6] text-[#192C21] flex flex-col font-sans">
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
        className={`pt-20 pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 flex-1 ${
          isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {activePage === 'dashboard' && <ExecutiveDashboard />}
          {activePage === 'directory' && <StaffDirectory />}
          {activePage === 'divisions' && <CampusDivisions />}
          {activePage === 'profile' && <EmployeeProfile />}
          {activePage === 'contracts' && <ContractsHub />}
          {activePage === 'reports' && <ReportsCenter />}
          {activePage === 'register' && <RegisterEmployeePage />}
        </div>
      </main>

      {/* Interactive Global Modals */}
      <AddEmployeeModal />
      <RenewContractModal />
      <UploadDocumentModal />
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
