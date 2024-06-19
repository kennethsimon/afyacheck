import PatientDetails from "@/components/patient-details";

export default function Page({ params }: { params: { patientId: string } }) {
    return <div>
    <PatientDetails id={params.patientId} />
    
    </div>
  }

  