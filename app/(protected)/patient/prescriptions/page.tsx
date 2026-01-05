"use client";

import { useEffect, useState } from "react";

export default function PatientPrescriptions() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        setLoading(true);
        const res = await fetch("/api/prescriptions");
        const data = await res.json();
        if (data.status === "success") setItems(data.data || []);
        setLoading(false);
    };

    useEffect(() => { fetchItems(); }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Prescriptions</h1>
            <div className="bg-white p-4 rounded shadow">
                {loading ? <p>Loading...</p> : (
                    <ul className="space-y-2">
                        {items.map(p => (
                            <li key={p.id} className="border p-3 rounded">
                                <div className="font-medium">Doctor: {p.doctor?.name}</div>
                                <div className="text-sm">Diagnosis: {p.diagnosis}</div>
                                <div className="text-sm">Medicines: {p.medicines}</div>
                                <div className="text-sm text-gray-500">Created: {new Date(p.createdAt).toLocaleString()}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
