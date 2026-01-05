"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();   
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
    const fetchPatient = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/patients/${id}`);
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            if (data.status === "success") setPatient(data.data);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to fetch patient", "error").then(() => router.back());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPatient();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!patient) return <div>Patient not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{patient.name || patient.user?.email}</h1>
                    <p className="text-sm text-gray-600">{patient.user?.email} • {patient.user?.mobile}</p>
                </div>
                <div>
                    <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 cursor-pointer rounded">Back</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold">Profile</h3>
                    <p className="mt-2">Name: {patient.name}</p>
                    <p>Age: {patient.age}</p>
                    <p>Gender: {patient.gender}</p>
                    <p>Blood Group: {patient.bloodGroup || '-'}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                    <h3 className="font-semibold">History</h3>

                    <section className="mt-4">
                        <h4 className="font-medium">Appointments</h4>
                        {patient.appointments?.length ? (
                            <ul className="mt-2 space-y-2">
                                {patient.appointments.map((a: any) => (
                                    <li key={a.id} className="border p-3 rounded">With Dr. {a.doctor?.name} • {new Date(a.scheduledAt).toLocaleString()} • {a.status}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500">No appointments</p>
                        )}
                    </section>

                    <section className="mt-4">
                        <h4 className="font-medium">Prescriptions</h4>
                        {patient.prescriptions?.length ? (
                            <ul className="mt-2 space-y-2">
                                {patient.prescriptions.map((p: any) => (
                                    <li key={p.id} className="border p-3 rounded">By Dr. {p.doctor?.name} • {p.diagnosis}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500">No prescriptions</p>
                        )}
                    </section>

                    <section className="mt-4">
                        <h4 className="font-medium">Consultations</h4>
                        {patient.consultations?.length ? (
                            <ul className="mt-2 space-y-2">
                                {patient.consultations.map((c: any) => (
                                    <li key={c.id} className="border p-3 rounded">With {c.advisor?.name} • {new Date(c.consultationAt).toLocaleString()}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500">No consultations</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
