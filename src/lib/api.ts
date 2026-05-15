export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(
    "https://api.fake-rest.refine.dev/products?_start=0&_end=10"
  );
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(
    "https://api.fake-rest.refine.dev/users?_start=0&_end=10"
  );
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}
