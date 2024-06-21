import Image from "next/image";
import { PatientInfo } from "./patient-info";
import { ScreeningQuestions } from "./screening-questions";
import { DoctorComments } from "./doctor-comments";
import { ClinicalFindings } from "./clinical-findings";

export default function AddPatientForm() {
  return (
    <div className=" mx-auto p-8 ">
      <div className="text-center">
        <Image
          src="/favicon.ico"
          alt="AfyaCheck Logo"
          className="mx-auto mb-4"
          width={50}
          height={50}
        />
        <h1 className="text-2xl font-bold">PATIENT SCREENING FORM</h1>
      </div>
      <form className="space-y-8">
        <PatientInfo />
        <ScreeningQuestions />
        <ClinicalFindings />
        <DoctorComments />
      </form>
    </div>
  );
}
