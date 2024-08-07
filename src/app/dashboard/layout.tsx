import DashboardHeader from "@/components/navigation/dashboard/header";
import DashboardSidebar from "@/components/navigation/dashboard/sidebar";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: any = await getServerSession(authOptions);

  console.log("session : ", session);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <DashboardSidebar session={session} />
      <div className="flex flex-col">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
