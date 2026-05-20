import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Provenance from './pages/Provenance';
import FamilyTree from './pages/FamilyTree';
import AuditChecklist from './pages/AuditChecklist';
import Claims from './pages/Claims';
import ArchiveRequests from './pages/ArchiveRequests';
import Verify from './pages/Verify';
import Custody from './pages/Custody';
import Playbook from './pages/Playbook';
import Workflow from './pages/Workflow';
import FamilySearchProtocol from './pages/protocols/FamilySearchProtocol';
import SHA256Protocol from './pages/protocols/SHA256Protocol';
import WellsFargoLetter from './pages/protocols/WellsFargoLetter';
import PriorityActionPackage from './pages/protocols/PriorityActionPackage';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/provenance" element={<Provenance />} />
      <Route path="/family-tree" element={<FamilyTree />} />
      <Route path="/audit-checklist" element={<AuditChecklist />} />
      <Route path="/claims" element={<Claims />} />
      <Route path="/archive-requests" element={<ArchiveRequests />} />
      <Route path="/verify/:evidenceId" element={<Verify />} />
      <Route path="/custody" element={<Custody />} />
      <Route path="/playbook" element={<Playbook />} />
      <Route path="/playbook/familysearch" element={<FamilySearchProtocol />} />
      <Route path="/playbook/sha256" element={<SHA256Protocol />} />
      <Route path="/playbook/wells-fargo" element={<WellsFargoLetter />} />
      <Route path="/playbook/priority-actions" element={<PriorityActionPackage />} />
      <Route path="/workflow" element={<Workflow />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App