import { Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/lib/api";

export function UsersTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  if (error) {
    return <div>Error loading users: {(error as Error).message}</div>;
  }

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={isLoading}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
}
