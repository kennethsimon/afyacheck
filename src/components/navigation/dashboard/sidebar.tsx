'use client'

import { Button } from "@/components/ui/button";
import { Package2Icon, BellIcon, HomeIcon, CalendarIcon, ClipboardIcon, SettingsIcon, UserIcon, PlusIcon, BarChartIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation'

const sidebarItems = [
    { href: "/", icon: HomeIcon, label: "Dashboard" },
    { href: "/patients", icon: UserIcon, label: "Patients" },
    { href: "/add-patient", icon: PlusIcon, label: "Add Patient" },
    { href: "/analytics", icon: BarChartIcon, label: "Analytics" },
    { href: "/settings", icon: SettingsIcon, label: "Settings" },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-muted/40 lg:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-[60px] items-center border-b px-6">
                    <Link href="#" className="flex items-center gap-2 font-semibold" prefetch={false}>
                        <Package2Icon className="h-6 w-6" />
                        <span className="">Clinic</span>
                    </Link>
                    <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                        <BellIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                                prefetch={false}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    )
}
