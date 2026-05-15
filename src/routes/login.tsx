import { createFileRoute } from "@tanstack/react-router";
import { Button, Card } from "antd";
import { getLoginUrl } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    callbackURL: (search.callbackURL as string) ?? "/",
  }),
  component: LoginPage,
});

function LoginPage() {
  const { callbackURL } = Route.useSearch();
  const loginUrl = getLoginUrl(callbackURL);

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
      <Card title="Login" style={{ width: 400 }}>
        <p>Sign in with Okta to access the application.</p>
        <Button type="primary" block href={loginUrl}>
          Login with Okta
        </Button>
      </Card>
    </div>
  );
}
