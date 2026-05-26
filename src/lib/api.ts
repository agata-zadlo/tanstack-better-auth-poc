const API_BASE_URL = "http://localhost:8081/api";

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}
