"use client";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select"; 
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";

export function ClinicalFindings({ form }: any) {
  // Calculate BMI when weight or height changes
 

  // State to manage TB screening selection
  const [tbScreening, setTbScreening] = useState<any>(null);
  
  // State to manage HIV testing selection
  const [hivTesting, setHivTesting] = useState<string | null>(null);
  
  // State to manage Preventive Measure selection
  const [preventiveMeasure, setPreventiveMeasure] = useState<string | null>(null);

  // State for managing Cancer Screening selections
  const [cancerType, setCancerType] = useState<string | null>(null);
  const [breastCancerStatus, setBreastCancerStatus] = useState<string | null>(null);
  const [cervicalCancerStatus, setCervicalCancerStatus] = useState<string | null>(null);
  const [prostateCancerStatus, setProstateCancerStatus] = useState<string | null>(null);

  // New state variables for Radiology section
  const [radiologyType, setRadiologyType] = useState<string | null>(null);
  const [radiologyStatus, setRadiologyStatus] = useState<string | null>(null);

  const [dentalStatus, setDentalStatus] = useState<string | null>(null);


  const [ophthalmologyStatus, setOphthalmologyStatus] = useState<string | null>(null);

  const [orthoStatus, setOrthoStatus] = useState<string | null>(null);


  const [physioStatus, setPhysioStatus] = useState<string | null>(null);

  return (
    <div className="space-y-4 py-8">
      <h2 className="text-center text-lg font-bold">CLINICAL FINDINGS</h2>

      {/* First Section */}

    {/* Third Section - TB Screening */}
<div className="grid grid-cols-1 gap-4">
  {/* TB Screening */}
  <FormField
          control={form.control}
          name="clinicalFindings.patientNumber"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="patient-number">Patient Number:</FormLabel>
              <FormControl>
                <Input id="patient-number" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
  <FormField
    control={form.control}
    name="clinicalFindings.tbScreening.status" // Change to status
    render={({ field }) => (
      <FormItem className="space-y-2">
        <FormLabel htmlFor="tb-screening">TB Screening:</FormLabel>
        <FormControl>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              setTbScreening({ ...tbScreening, status: value }); // Update status in the object
            }}
            defaultValue={field.value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select TB Screening status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="known-case">Known case</SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  {/* Conditionally Render Medication Select */}
  {(tbScreening?.status === "negative" || tbScreening?.status === "suspicious" || tbScreening?.status === "positive") && (
    <FormField
      control={form.control}
      name="clinicalFindings.tbScreening.medicationStatus" // Change to medicationStatus
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel htmlFor="tb-medication">TB Medication:</FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setTbScreening({ ...tbScreening, medicationStatus: value }); // Update medicationStatus in the object
              }}
              defaultValue={field.value}
            >
              
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="started">Started on medication</SelectItem>
                <SelectItem value="notStarted">Not started on medication</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )}

  {tbScreening?.status === "known-case" && (
    <FormField
      control={form.control}
      name="clinicalFindings.tbScreening.knownCaseMedication" // Update to a proper field
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel htmlFor="tb-known-case-medication">Known Case Medication:</FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setTbScreening({ ...tbScreening, knownCaseMedication: value }); // Update knownCaseMedication in the object
              }}
              defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onMedication">On medication</SelectItem>
                <SelectItem value="notOnMedication">Not on medication</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )}
</div>


      {/* HIV Section */}
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="clinicalFindings.hivTesting"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="hiv-testing">HIV Testing:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setHivTesting(value); // Set HIV Testing selection
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HIV testing status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-tested">Not Tested</SelectItem>
                    <SelectItem value="tested">Tested</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {hivTesting === "tested" && (
          <>
            <FormField
              control={form.control}
              name="clinicalFindings.hivResult"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="hiv-result">HIV Result:</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select HIV result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="negative">Negative</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("clinicalFindings.hivResult") === "positive" && (
              <FormField
                control={form.control}
                name="clinicalFindings.hivCase"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="hiv-case">HIV Case:</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select HIV case status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="known-case">Known Case</SelectItem>
                          <SelectItem value="new-case">New Case</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("clinicalFindings.hivCase") === "known-case" && (
              <FormField
                control={form.control}
                name="clinicalFindings.hivKnownCaseMedication"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="hiv-known-case-medication">Known Case Medication:</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on-medication">On medication</SelectItem>
                          <SelectItem value="not-on-medication">Not on medication</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("clinicalFindings.hivCase") === "new-case" && (
              <FormField
                control={form.control}
                name="clinicalFindings.hivNewCaseMedication"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="hiv-new-case-medication">New Case Medication:</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="started">Started on medication</SelectItem>
                          <SelectItem value="not-started">Not started</SelectItem>
                          <SelectItem value="linked-to-care">Linked to care</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
      </div>

      {/* Preventive Measure Section */}
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="clinicalFindings.preventiveMeasure"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="preventive-measure">Preventive Measure:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setPreventiveMeasure(value); // Set Preventive Measure selection
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preventive measure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="education-and-counseling">Education and Counseling</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditionally Render Preventive Measure Details */}
        {preventiveMeasure === "yes" && (
          <FormField
            control={form.control}
            name="clinicalFindings.preventiveMeasureDetails"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="preventive-measure-details">Preventive Measure Details:</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select detail" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self-test-kit">Self-test kit</SelectItem>
                      <SelectItem value="condom">Condom</SelectItem>
                      <SelectItem value="pep">PEP</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {preventiveMeasure === "education-and-counseling" && (
          <FormField
            control={form.control}
            name="clinicalFindings.educationCounseling"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="education-counseling">Education and Counseling Follow-Up:</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select yes or no" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Blood Donation Section */}
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="clinicalFindings.bloodDonation"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="blood-donation">Blood Donation:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood donation status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="not-reported">Not Reported</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Cancer Screening Section */}
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="clinicalFindings.cancerScreening"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="cancer-screening">Cancer Screening:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setCancerType(value); // Set Cancer type selection
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cancer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breast-cancer">Breast Cancer</SelectItem>
                    <SelectItem value="cervical-cancer">Cervical Cancer</SelectItem>
                    <SelectItem value="prostate-cancer">Prostate Cancer</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditionally Render Breast Cancer Status */}
        {cancerType === "breast-cancer" && (
          <>
            <FormField
              control={form.control}
              name="clinicalFindings.breastCancerStatus"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="breast-cancer-status">Breast Cancer Status:</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setBreastCancerStatus(value);
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="suspicious">Suspicious</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {breastCancerStatus === "suspicious" && (
              <FormField
                control={form.control}
                name="clinicalFindings.breastCancerReferred"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="breast-cancer-referred">Referred For:</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select referral status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="further-investigation">Further Investigation</SelectItem>
                          <SelectItem value="not-referred">Not Referred</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        {/* Conditionally Render Cervical Cancer Status */}
        {cancerType === "cervical-cancer" && (
          <>
            <FormField
              control={form.control}
              name="clinicalFindings.cervicalCancerStatus"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="cervical-cancer-status">Cervical Cancer Status:</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setCervicalCancerStatus(value);
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="suspicious">Suspicious</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {cervicalCancerStatus === "suspicious" && (
              <FormField
                control={form.control}
                name="clinicalFindings.cervicalCancerReferred"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="cervical-cancer-referred">Referred For:</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select referral status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="further-investigation">Further Investigation</SelectItem>
                          <SelectItem value="not-referred">Not Referred</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {cervicalCancerStatus === "positive" && (
              <FormField
                control={form.control}
                name="clinicalFindings.cervicalCancerTreatment"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="cervical-cancer-treatment">Referred For Treatment:</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select treatment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="referred-for-treatment">Referred for Treatment</SelectItem>
                          <SelectItem value="not-referred">Not Referred</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        {/* Conditionally Render Prostate Cancer Status */}
        {cancerType === "prostate-cancer" && (
          <FormField
            control={form.control}
            name="clinicalFindings.prostateCancerStatus"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="prostate-cancer-status">Prostate Cancer Status:</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="suspicious">Suspicious</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

       {/* Radiology Section */}
       <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="clinicalFindings.radiologyType"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="radiology-type">Radiology Type:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setRadiologyType(value); // Set Radiology type selection
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select radiology type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="echo">Echo</SelectItem>
                    <SelectItem value="ecg">ECG</SelectItem>
                    <SelectItem value="x-ray">X-Ray</SelectItem>
                    <SelectItem value="ultrasound">Ultrasound</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditionally Render Radiology Status based on Type */}
        {radiologyType && (
          <>
            <FormField
              control={form.control}
              name={`clinicalFindings.${radiologyType}Status`} // Dynamic status name
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor={`${radiologyType}-status`}>{`${radiologyType.charAt(0).toUpperCase() + radiologyType.slice(1)} Status:`}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setRadiologyStatus(value);
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="abnormal">Abnormal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Textarea for Diagnosis if Status is Abnormal */}
            {radiologyStatus === "abnormal" && (
              <FormField
                control={form.control}
                name={`clinicalFindings.${radiologyType}Diagnosis`} // Dynamic diagnosis name
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor={`${radiologyType}-diagnosis`}>Diagnosis:</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Enter diagnosis for ${radiologyType}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
      </div>

       {/* Dental Screening Section */}
       <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="clinicalFindings.dentalStatus"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="dental-status">Dental Screening Status:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setDentalStatus(value); // Set Dental status selection
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dental screening status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Textarea for Diagnosis if Status is Abnormal */}
        {dentalStatus === "abnormal" && (
          <FormField
            control={form.control}
            name="clinicalFindings.dentalDiagnosis"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="dental-diagnosis">Write Diagnosis:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter diagnosis for dental screening"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>


      {/* Ophthalmology Section */}
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="clinicalFindings.ophthalmologyStatus"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="ophthalmology-status">Ophthalmology Status:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setOphthalmologyStatus(value); // Set Ophthalmology status selection
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ophthalmology status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Textarea for Diagnosis if Status is Abnormal */}
        {ophthalmologyStatus === "abnormal" && (
          <FormField
            control={form.control}
            name="clinicalFindings.ophthalmologyDiagnosis"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="ophthalmology-diagnosis">Write Diagnosis:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter diagnosis for ophthalmology screening"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Referral/Medication Status for Ophthalmology */}
        {ophthalmologyStatus === "abnormal" && (
          <FormField
            control={form.control}
            name="clinicalFindings.ophthalmologyReferral"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="ophthalmology-referral">Referral/Medication Status:</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select referral status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="referred">Referred</SelectItem>
                      <SelectItem value="not-referred">Not Referred</SelectItem>
                      <SelectItem value="given-medication">Given Medication</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

         {/* Orthopedic Section */}
         <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="clinicalFindings.orthoStatus"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="ortho-status">Orthopedic Status:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setOrthoStatus(value); // Set Orthopedic status selection
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select orthopedic status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Textarea for Diagnosis if Status is Abnormal */}
        {orthoStatus === "abnormal" && (
          <FormField
            control={form.control}
            name="clinicalFindings.orthoDiagnosis"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="ortho-diagnosis">Write Diagnosis:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter diagnosis for orthopedic screening"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Referral/Medication Status for Orthopedic */}
        {orthoStatus === "abnormal" && (
          <FormField
            control={form.control}
            name="clinicalFindings.orthoReferral"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="ortho-referral">Referral/Medication Status:</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select referral status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="referred">Referred</SelectItem>
                      <SelectItem value="not-referred">Not Referred</SelectItem>
                      <SelectItem value="given-medication">Given Medication</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

{/* Physiotherapy Section */}
<div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="clinicalFindings.physioStatus"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="physio-status">Physiotherapy Status:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setPhysioStatus(value); // Set Physiotherapy status selection
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select physiotherapy status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Textarea for Diagnosis if Status is Abnormal */}
        {physioStatus === "abnormal" && (
          <FormField
            control={form.control}
            name="clinicalFindings.physioDiagnosis"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="physio-diagnosis">Write Diagnosis:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter diagnosis for physiotherapy screening"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Referral/Medication Status for Physiotherapy */}
        {physioStatus === "abnormal" && (
          <FormField
            control={form.control}
            name="clinicalFindings.physioReferral"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="physio-referral">Referral/Medication Status:</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select referral status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="referred">Referred</SelectItem>
                      <SelectItem value="not-referred">Not Referred</SelectItem>
                      <SelectItem value="given-medication">Given Medication</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

    </div>
  );
}
