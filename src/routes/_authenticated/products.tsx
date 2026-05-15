import { createFileRoute } from "@tanstack/react-router";
import { ProductsTable } from "@/components/ProductsTable";
import { ShoppingOutlined } from "@ant-design/icons";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
  staticData: {
    menu: {
      label: "Products",
      icon: ShoppingOutlined,
      order: 1,
    },
  },
});

function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      <ProductsTable />
    </div>
  );
}
