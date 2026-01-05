"use client";

import { useEffect, useState } from "react";

export default function DoctorAppointments() {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApps = async () => {
        setLoading(true);
        const res = await fetch("/api/appointments");
        const data = await res.json();
        if (data.status === "success") setApps(data.data || []);
        setLoading(false);
    };

    useEffect(() => { fetchApps(); }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <div className="bg-white p-4 rounded shadow">
                {loading ? <p>Loading...</p> : (
                    <ul className="space-y-2">
                        {apps.map(a => (
                            <li key={a.id} className="border p-3 rounded">
                                <div className="font-medium">Patient: {a.patient?.name || a.patient?.user?.email}</div>
                                <div className="text-sm text-gray-600">When: {new Date(a.scheduledAt).toLocaleString()}</div>
                                <div className="text-sm">Status: {a.status}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
