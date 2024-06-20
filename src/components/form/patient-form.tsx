import Image from "next/image";
import { PatientInfo } from "./patient-info";
import { ScreeningQuestions } from "./screening-questions";

export default function AddPatientForm() {
  return (
    <div className=" mx-auto p-8 ">
      <div className="text-center">
        <Image
          src="/favicon.ico"
          alt="AfyaCheck Logo"
          className="mx-auto mb-4"
          width={64}
          height={64}
        />
        <h1 className="text-2xl font-bold">PATIENT SCREENING FORM</h1>
      </div>
      <form className="space-y-8">
        <PatientInfo />
        <ScreeningQuestions />
        {/* Add other components here */}
      </form>
    </div>
  );
}
