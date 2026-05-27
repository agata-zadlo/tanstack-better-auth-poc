import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { Card, Typography, Alert, Space } from "antd";
import { KeyOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export const Route = createFileRoute("/_authenticated/users")({
  component: TokensPage,
  staticData: {
    menu: {
      label: "Tokens",
      icon: KeyOutlined,
      order: 2,
    },
  },
});

function TokensPage() {
  const auth = useAuth();
  const user = auth.user;

  if (!user) return null;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>OIDC Tokens & Claims</Title>

      <Alert
        message="Token Information"
        description="These tokens are managed by react-oidc-context and stored in browser sessionStorage. They are automatically refreshed before expiry."
        type="info"
        showIcon
      />

      <Card title="ID Token Claims" bordered={false}>
        <Paragraph>
          <Text strong>What is it?</Text><br />
          The ID Token contains identity information about the authenticated user.
        </Paragraph>
        <pre style={{
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "4px",
          overflow: "auto",
          maxHeight: "400px"
        }}>
          {JSON.stringify(user.profile, null, 2)}
        </pre>
      </Card>

      <Card title="Access Token (Encoded)" bordered={false}>
        <Paragraph>
          <Text strong>What is it?</Text><br />
          The Access Token is used to authorize API calls. In production, your backend would verify this token.
        </Paragraph>
        <Alert
          message="Security Note"
          description="In a real application, you would send this token in the Authorization header to your backend APIs. The backend would verify it with Okta before granting access."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <pre style={{
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "4px",
          overflow: "auto",
          wordBreak: "break-all",
          whiteSpace: "pre-wrap"
        }}>
          {user.access_token}
        </pre>
      </Card>

      {user.refresh_token && (
        <Card title="Refresh Token" bordered={false}>
          <Paragraph>
            <Text strong>What is it?</Text><br />
            The Refresh Token is used to obtain new access tokens without requiring the user to log in again.
          </Paragraph>
          <Text type="secondary">Present (hidden for security)</Text>
        </Card>
      )}

      <Card title="Session State" bordered={false}>
        <Paragraph>
          <Text code>isAuthenticated:</Text> {auth.isAuthenticated ? "✅ true" : "❌ false"}<br />
          <Text code>isLoading:</Text> {auth.isLoading ? "⏳ true" : "✅ false"}<br />
          <Text code>Token expires at:</Text> {user.expires_at ? new Date(user.expires_at * 1000).toLocaleString() : "N/A"}<br />
          <Text code>Automatic renewal:</Text> ✅ Enabled
        </Paragraph>
      </Card>
    </Space>
  );
}
