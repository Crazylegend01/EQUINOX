import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage     from '@/pages/LoginPage';
import RegisterPage  from '@/pages/RegisterPage';
import ChatLayout    from '@/pages/ChatLayout';
import ChatHome      from '@/pages/ChatHome';
import ChatRoom      from '@/pages/ChatRoom';
import AdminPage     from '@/pages/AdminPage';
import SettingsPage  from '@/pages/SettingsPage';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '14px' },
        }}
      />
      <Routes>
        <Route path="/"          element={<Navigate to="/chat" replace />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/chat"      element={<ChatLayout />}>
          <Route index           element={<ChatHome />} />
          <Route path=":chatId"  element={<ChatRoom />} />
        </Route>
        <Route path="/admin"     element={<AdminPage />} />
        <Route path="/settings"  element={<SettingsPage />} />
        <Route path="*"          element={<Navigate to="/chat" replace />} />
      </Routes>
    </>
  );
}
