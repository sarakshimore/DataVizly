import { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

export default function Admin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/auth/users");
        setUsers(res.data.users);
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  return (
    <>
    <Navbar />
    <div className="mt-30 flex justify-center">
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
