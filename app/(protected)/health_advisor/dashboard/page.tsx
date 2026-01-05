"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Calendar, ClipboardList } from "lucide-react";

type AdvisorDashboard = {
    user: { email: string | null; mobile: string; role: { name: string }; createdAt: string };
    stats: { totalPatients: number; totalConsultations: number; totalAppointments: number };
};

export default function AdvisorDashboard() {
    const [data, setData] = useState<AdvisorDashboard | null>(null);

    useEffect(() => {
        fetch("/api/health_advisor/dashboard")
            .then((r) => r.json())
            .then(setData)
            .catch(() => setData(null));
    }, []);

    const user = data?.user;
    const stats = data?.stats;

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Welcome {user?.email || user?.mobile || "Advisor"}!
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Overview of your advisory panel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Stat title="My Patients" value={stats?.totalPatients} icon={<Users />} color="green" />
                <Stat title="Consultations" value={stats?.totalConsultations} icon={<ClipboardList />} color="purple" />
                <Stat title="Appointments" value={stats?.totalAppointments} icon={<Calendar />} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-xl font-semibold mb-6">Advisor Actions</h3>
                    <div className="space-y-4">
                        <ActionLink href="/health_advisor/consultations" icon={<ClipboardList className="text-purple-600" />} label="My Consultations" />
                        <ActionLink href="/health_advisor/patients" icon={<Users className="text-green-600" />} label="Patients" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-xl font-semibold mb-6">My Profile</h3>
                    <Info label="Email" value={user?.email} />
                    <Info label="Mobile" value={user?.mobile} />
                    <Info label="Role" value={user?.role?.name || "Health Advisor"} />
                    <Info label="Member Since" value={user?.createdAt && new Date(user.createdAt).toLocaleDateString()} />
                </div>
            </div>
        </div>
    );
}

function Stat({ title, value, icon, color }: any) {
    const colors: any = { blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600", purple: "bg-purple-100 text-purple-600" };
    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500">{title}</p>
                    <p className="text-4xl font-bold mt-2">{value ?? "-"}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function ActionLink({ href, icon, label }: any) {
    return (
        <Link href={href} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition">
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    );
}

function Info({ label, value }: any) {
    return (
        <div className="mb-4">
            <p className="text-gray-500">{label}</p>
            <p className="font-medium text-gray-900">{value || "-"}</p>
        </div>
    );
}
