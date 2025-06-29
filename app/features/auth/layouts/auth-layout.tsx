import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="bg-gradient-to-br from-blue-200 to-purple-500/50 min-h-screen">
      <Outlet />
    </div>
  );
}