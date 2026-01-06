"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function AdvisorDetail() {
    const { id } = useParams<{ id: string }>();
    
    const [advisor, setAdvisor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchAdvisor = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/health-advisors/${id}`);
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            if (data.status === "success") setAdvisor(data.data);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to fetch advisor", "error").then(() => router.back());
        }
        setLoading(false);
    };

    useEffect(() => { fetchAdvisor(); }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!advisor) return <div>Advisor not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{advisor.name || advisor.user?.email}</h1>
                    <p className="text-sm text-gray-600">{advisor.user?.email} • {advisor.user?.mobile}</p>
                </div>
                <div>
                    <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 cursor-pointer rounded">Back</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold">Profile</h3>
                    <p className="mt-2">Name: {advisor.name}</p>
                    <p>Specialization: {advisor.specialization}</p>
                    <p>Qualification: {advisor.qualification}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                    <h3 className="font-semibold">Activity</h3>
                    <p className="mt-2 text-sm text-gray-500">Consultations and activity view to be added.</p>
                </div>
            </div>
        </div>
    );
}
