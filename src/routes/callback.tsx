import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import { Spin } from "antd";

export const Route = createFileRoute("/callback")({
  component: CallbackPage,
});

function CallbackPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // After successful authentication, redirect to products
    if (auth.isAuthenticated) {
      navigate({ to: "/products" });
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Spin size="large" tip="Completing login..." />
    </div>
  );
}
