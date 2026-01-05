"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";

export default function DoctorDetail() {
    const { id } = useParams<{ id: string }>();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchDoctor = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/doctors/${id}`);
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            if (data.status === "success") setDoctor(data.data);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to fetch doctor", "error").then(() => router.back());
        }
        setLoading(false);
    };

    useEffect(() => { fetchDoctor(); }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!doctor) return <div>Doctor not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{doctor.name || doctor.user?.email}</h1>
                    <p className="text-sm text-gray-600">{doctor.user?.email} • {doctor.user?.mobile}</p>
                </div>
                <div>
                    <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 cursor-pointer rounded">Back</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold">Profile</h3>
                    <p className="mt-2">Name: {doctor.name}</p>
                    <p>Specialization: {doctor.specialization}</p>
                    <p>Qualification: {doctor.qualification}</p>
                    <p>Experience: {doctor.experience}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                    <h3 className="font-semibold">Activity</h3>
                    <p className="mt-2 text-sm text-gray-500">Appointments and prescriptions view to be added.</p>
                </div>
            </div>
        </div>
    );
}
