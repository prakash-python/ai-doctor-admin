"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Plus } from "lucide-react";

export default function HealthAdvisorPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);

  const [consultData, setConsultData] = useState({
    consultationAt: "",
    notes: "",
    status: "booked"
  });

  const [apptData, setApptData] = useState({
    scheduledAt: "",
    status: "booked"
  });

  const fetchPatient = async () => {
    const res = await fetch(`/api/health_advisor/patients/${id}`);
    const data = await res.json();
    if (data.status === "success") setPatient(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchPatient(); }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!patient) return <div>Patient not found</div>;

  /* CREATE CONSULTATION */
  const createConsultation = async () => {
    if (!consultData.consultationAt || !consultData.notes)
      return Swal.fire("All fields required", "", "warning");

    const res = await fetch("/api/health_advisor/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId: id, ...consultData })
    });

    if (res.ok) {
      Swal.fire("Consultation Created", "", "success");
      setShowConsultModal(false);
      setConsultData({ consultationAt: "", notes: "", status: "booked" });
      fetchPatient();
    } else Swal.fire("Failed to create consultation", "", "error");
  };

  /* CREATE APPOINTMENT */
  const createAppointment = async () => {
    if (!apptData.scheduledAt)
      return Swal.fire("Select appointment time", "", "warning");

    const res = await fetch("/api/health_advisor/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId: id, ...apptData })
    });

    if (res.ok) {
      Swal.fire("Appointment Created", "", "success");
      setShowApptModal(false);
      setApptData({ scheduledAt: "", status: "booked" });
      fetchPatient();
    } else Swal.fire("Failed to create appointment", "", "error");
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{patient.name || patient.user?.email}</h1>
          <p className="text-gray-600">{patient.user?.email} • {patient.user?.mobile}</p>
        </div>
        <button onClick={() => router.back()} className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
          Back
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        <button onClick={() => setShowConsultModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-5 h-5" /> Create Consultation
        </button>

        <button onClick={() => setShowApptModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" /> Create Appointment
        </button>
      </div>

      {/* PROFILE + HISTORY */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-2">Profile</h3>
          <p>Age: {patient.age}</p>
          <p>Gender: {patient.gender}</p>
          <p>Blood Group: {patient.bloodGroup || "-"}</p>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Consultation History</h3>
          {patient.consultations?.length ? patient.consultations.map((c: any) => (
            <div key={c.id} className="border rounded-lg p-4 mb-2">
              {new Date(c.consultationAt).toLocaleString()} • {c.status}
            </div>
          )) : <p className="text-sm text-gray-500">No consultations</p>}
        </div>
      </div>

      {/* CONSULT MODAL */}
      {showConsultModal && (
        <Modal title="Create Consultation" onClose={() => setShowConsultModal(false)}>
          <input type="datetime-local" value={consultData.consultationAt}
            onChange={e => setConsultData({ ...consultData, consultationAt: e.target.value })}
            className="w-full p-3 border rounded-lg mb-3" />

          <select value={consultData.status}
            onChange={e => setConsultData({ ...consultData, status: e.target.value })}
            className="w-full p-3 border rounded-lg mb-3">
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <textarea placeholder="Notes"
            value={consultData.notes}
            onChange={e => setConsultData({ ...consultData, notes: e.target.value })}
            className="w-full p-3 border rounded-lg" />

          <ModalActions onSave={createConsultation} onCancel={() => setShowConsultModal(false)} />
        </Modal>
      )}

      {/* APPOINTMENT MODAL */}
      {showApptModal && (
        <Modal title="Create Appointment" onClose={() => setShowApptModal(false)}>
          <input type="datetime-local" value={apptData.scheduledAt}
            onChange={e => setApptData({ ...apptData, scheduledAt: e.target.value })}
            className="w-full p-3 border rounded-lg mb-3" />

          <select value={apptData.status}
            onChange={e => setApptData({ ...apptData, status: e.target.value })}
            className="w-full p-3 border rounded-lg">
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <ModalActions onSave={createAppointment} onCancel={() => setShowApptModal(false)} />
        </Modal>
      )}
    </div>
  );
}

/* MODAL */
function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {children}
        {/* <div className="flex justify-end pt-4">
          <button onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg">Cancel</button>
        </div> */}
      </div>
    </div>
  );
}

function ModalActions({ onSave, onCancel }: any) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <button onClick={onCancel} className="px-5 py-2 bg-gray-100 rounded-lg">Cancel</button>
      <button onClick={onSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Save</button>
    </div>
  );
}
