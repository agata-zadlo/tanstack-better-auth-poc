import { Layout, Menu, Button } from "antd";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "react-oidc-context";
import type { Session } from "@/types/auth";
import { menuItems as menuConfig } from "@/lib/menu-config";

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  session: Session;
}

export function AppLayout({ children, session }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.signoutRedirect();
  };

  const menuItems = menuConfig
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      key: item.path,
      icon: item.icon,
      label: item.label,
      onClick: () => navigate({ to: item.path as any }),
    }));

  // Get groups from OIDC user profile
  const groups = (session.user.profile.groups as string[] | undefined) || [];
  const userName = session.user.profile.name || session.user.profile.email || "User";

  console.log('whole auth', auth)
  console.log("Session:", session);
  console.log("User groups:", groups);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark" collapsible>
        <div
          style={{
            padding: "16px",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          POC App
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div>
              <strong>{userName}</strong>
              {groups.length > 0 && (
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Groups: {groups.join(", ")}
                </div>
              )}
            </div>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Header>
        <Content style={{ margin: "24px 16px", padding: 24, background: "#fff" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
