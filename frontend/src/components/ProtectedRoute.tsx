import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fetchAuthSession, signOut as amplifySignOut } from "aws-amplify/auth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: (props: { signOut: () => Promise<void> }) => ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await fetchAuthSession();
        if (session?.tokens?.idToken) {
          setAuthenticated(true);
        }
      } catch {
        setAuthenticated(false);
      }
      setLoading(false);
    }
    checkSession();
  }, []);

  if (loading) return null;
  if (!authenticated) return <Navigate to="/login" replace />;

  return <>{children({ signOut: amplifySignOut })}</>;
}
