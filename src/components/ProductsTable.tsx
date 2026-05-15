import { Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";

export function ProductsTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `$${price}`,
    },
    { title: "Category", dataIndex: "category", key: "category" },
  ];

  if (error) {
    return <div>Error loading products: {(error as Error).message}</div>;
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
