import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { AppLayout } from "@/components/AppLayout";
import { Spin } from "antd";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const auth = useAuth();

  // Handle loading state
  if (auth.isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const session = {
    user: auth.user!,
  };

  return (
    <AppLayout session={session}>
      <Outlet />
    </AppLayout>
  );
}
