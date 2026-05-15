export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    groups?: string;
  };
}
