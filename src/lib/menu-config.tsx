import { ShoppingOutlined, UserOutlined } from "@ant-design/icons";

export interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  order: number;
}

export const menuItems: MenuItem[] = [
  {
    path: "/products",
    label: "Products",
    icon: <ShoppingOutlined />,
    order: 1,
  },
  {
    path: "/users",
    label: "Users",
    icon: <UserOutlined />,
    order: 2,
  },
];
