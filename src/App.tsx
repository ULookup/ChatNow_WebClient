import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { ToastContainer } from './components/Toast/ToastContainer';
import { AuthPage } from './pages/auth/AuthPage';
import { ChatPage } from './pages/chat/ChatPage';
import { ContactsPage } from './pages/contacts/ContactsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route element={<AuthGuard />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:convId" element={<ChatPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
