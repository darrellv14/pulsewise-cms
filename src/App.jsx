import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import { EditorSkeleton } from './components/AsyncState.jsx';
import { ArticleDetailPage } from './pages/ArticleDetailPage.jsx';
import { ArticlesPage } from './pages/ArticlesPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ModerationPage } from './pages/ModerationPage.jsx';
import { MyArticlesPage } from './pages/MyArticlesPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

const EditorPage = lazy(() =>
  import('./pages/EditorPage.jsx').then((module) => ({
    default: module.EditorPage
  }))
);

function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <EditorSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/articles" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<EditorSkeleton />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/articles" replace />} />
            <Route path="articles" element={<ArticlesPage />} />
            <Route path="articles/:slug" element={<ArticleDetailPage />} />
            <Route path="my-articles" element={<MyArticlesPage />} />
            <Route path="editor/new" element={<EditorPage mode="create" />} />
            <Route
              path="editor/:articleId"
              element={<EditorPage mode="edit" />}
            />
            <Route
              path="moderation"
              element={
                <AdminRoute>
                  <ModerationPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
