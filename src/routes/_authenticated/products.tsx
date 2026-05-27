import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { Card, Descriptions, Typography, Tag, Space } from "antd";
import { UserOutlined, MailOutlined, SafetyOutlined, IdcardOutlined } from "@ant-design/icons";

const { Title } = Typography;

export const Route = createFileRoute("/_authenticated/products")({
  component: ProfilePage,
  staticData: {
    menu: {
      label: "Profile",
      icon: IdcardOutlined,
      order: 1,
    },
  },
});

function ProfilePage() {
  const auth = useAuth();
  const user = auth.user;

  if (!user) return null;

  const groups = (user.profile.groups as string[] | undefined) || [];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>User Profile</Title>

      <Card title="Profile Information" bordered={false}>
        <Descriptions column={1}>
          <Descriptions.Item label={<><UserOutlined /> Name</>}>
            {user.profile.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>
            {user.profile.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Subject (sub)">
            {user.profile.sub}
          </Descriptions.Item>
          <Descriptions.Item label="Email Verified">
            {user.profile.email_verified ? "✅ Yes" : "❌ No"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {groups.length > 0 && (
        <Card title={<><SafetyOutlined /> Groups</>} bordered={false}>
          <Space wrap>
            {groups.map((group) => (
              <Tag key={group} color="blue" style={{ fontSize: "14px", padding: "4px 12px" }}>
                {group}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      <Card title="Token Information" bordered={false}>
        <Descriptions column={1}>
          <Descriptions.Item label="Token Type">
            {user.token_type}
          </Descriptions.Item>
          <Descriptions.Item label="Expires At">
            {user.expires_at ? new Date(user.expires_at * 1000).toLocaleString() : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Scope">
            {user.scope}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}
