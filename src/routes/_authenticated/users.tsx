import { createFileRoute } from "@tanstack/react-router";
import { UsersTable } from "@/components/UsersTable";
import { UserOutlined } from "@ant-design/icons";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
  staticData: {
    menu: {
      label: "Users",
      icon: UserOutlined,
      order: 2,
    },
  },
});

function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      <UsersTable />
    </div>
  );
}
