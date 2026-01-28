"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../ui/form";
import {
  Stethoscope,
  TestTube,
  Heart,
  Shield,
  Droplets,
  X,
  Eye,
  Bone,
  Activity,
  Scan,
  FileText,
  User
} from "lucide-react";

export function ClinicalFindings({ form }: any) {
  const [tbScreening, setTbScreening] = useState<any>(null);
  const [hivTesting, setHivTesting] = useState<string | null>(null);
  const [preventiveMeasure, setPreventiveMeasure] = useState<string | null>(null);
  const [cancerType, setCancerType] = useState<string | null>(null);
  const [breastCancerStatus, setBreastCancerStatus] = useState<string | null>(null);
  const [cervicalCancerStatus, setCervicalCancerStatus] = useState<string | null>(null);
  const [prostateCancerStatus, setProstateCancerStatus] = useState<string | null>(null);
  const [radiologyType, setRadiologyType] = useState<string | null>(null);
  const [radiologyStatus, setRadiologyStatus] = useState<string | null>(null);
  const [dentalStatus, setDentalStatus] = useState<string | null>(null);
  const [ophthalmologyStatus, setOphthalmologyStatus] = useState<string | null>(null);
  const [orthoStatus, setOrthoStatus] = useState<string | null>(null);
  const [physioStatus, setPhysioStatus] = useState<string | null>(null);

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg">
            <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Clinical Findings
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Record comprehensive clinical examination findings and screening results
        </p>
      </div>

      {/* Patient Number */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="clinicalFindings.patientNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter patient identifier"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* TB Screening Section */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TestTube className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            TB Screening
          </CardTitle>
          <CardDescription>Record tuberculosis screening results and medication status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="clinicalFindings.tbScreening.status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TB Screening Status</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setTbScreening({ ...tbScreening, status: value });
                    }}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select TB screening status" />
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

          {(tbScreening?.status === "negative" || tbScreening?.status === "suspicious" || tbScreening?.status === "positive") && (
            <FormField
              control={form.control}
              name="clinicalFindings.tbScreening.medicationStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TB Medication Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setTbScreening({ ...tbScreening, medicationStatus: value });
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select medication status" />
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
              name="clinicalFindings.tbScreening.knownCaseMedication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Known Case Medication</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setTbScreening({ ...tbScreening, knownCaseMedication: value });
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select medication status" />
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
        </CardContent>
      </Card>

      {/* HIV Testing Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            HIV Testing
          </CardTitle>
          <CardDescription>Record HIV testing results and care status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="clinicalFindings.hivTesting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HIV Testing</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setHivTesting(value);
                    }}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
                  <FormItem>
                    <FormLabel>HIV Result</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
                <>
                  <FormField
                    control={form.control}
                    name="clinicalFindings.hivCase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HIV Case Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

                  {form.watch("clinicalFindings.hivCase") === "known-case" && (
                    <FormField
                      control={form.control}
                      name="clinicalFindings.hivKnownCaseMedication"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Known Case Medication</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="Select medication status" />
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
                        <FormItem>
                          <FormLabel>New Case Medication</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="Select medication status" />
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Preventive Measures Section */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            Preventive Measures
          </CardTitle>
          <CardDescription>Record preventive measures provided</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="clinicalFindings.preventiveMeasure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preventive Measure</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setPreventiveMeasure(value);
                    }}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

          {preventiveMeasure === "yes" && (
            <FormField
              control={form.control}
              name="clinicalFindings.preventiveMeasureDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preventive Measure Details</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
                <FormItem>
                  <FormLabel>Education and Counseling Follow-Up</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
        </CardContent>
      </Card>

      {/* Blood Donation Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Droplets className="w-5 h-5 text-red-600 dark:text-red-400" />
            Blood Donation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="clinicalFindings.bloodDonation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Donation Status</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
        </CardContent>
      </Card>

      {/* Cancer Screening Section */}
      <Card className="border-pink-200 dark:border-pink-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <X className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            Cancer Screening
          </CardTitle>
          <CardDescription>Record cancer screening results and referrals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="clinicalFindings.cancerScreening"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cancer Screening Type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setCancerType(value);
                    }}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

          {cancerType === "breast-cancer" && (
            <>
              <FormField
                control={form.control}
                name="clinicalFindings.breastCancerStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breast Cancer Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setBreastCancerStatus(value);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
                    <FormItem>
                      <FormLabel>Referred For</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

          {cancerType === "cervical-cancer" && (
            <>
              <FormField
                control={form.control}
                name="clinicalFindings.cervicalCancerStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cervical Cancer Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setCervicalCancerStatus(value);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
                    <FormItem>
                      <FormLabel>Referred For</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
                    <FormItem>
                      <FormLabel>Referred For Treatment</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

          {cancerType === "prostate-cancer" && (
            <FormField
              control={form.control}
              name="clinicalFindings.prostateCancerStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prostate Cancer Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
        </CardContent>
      </Card>

      {/* Radiology Section */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scan className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Radiology
          </CardTitle>
          <CardDescription>Record radiology examination results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="clinicalFindings.radiologyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Radiology Type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setRadiologyType(value);
                    }}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

          {radiologyType && (
            <>
              <FormField
                control={form.control}
                name={`clinicalFindings.${radiologyType}Status`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{`${radiologyType.charAt(0).toUpperCase() + radiologyType.slice(1)} Status`}</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setRadiologyStatus(value);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

              {radiologyStatus === "abnormal" && (
                <FormField
                  control={form.control}
                  name={`clinicalFindings.${radiologyType}Diagnosis`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Enter diagnosis for ${radiologyType}`}
                          {...field}
                          className="border-gray-300 dark:border-gray-600 focus:border-blue-500 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Specialty Screenings - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dental Screening */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Dental Screening
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="clinicalFindings.dentalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dental Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setDentalStatus(value);
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select dental status" />
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
            {dentalStatus === "abnormal" && (
              <FormField
                control={form.control}
                name="clinicalFindings.dentalDiagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter dental diagnosis"
                        {...field}
                        className="border-gray-300 dark:border-gray-600 focus:border-blue-500 min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Ophthalmology */}
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Ophthalmology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="clinicalFindings.ophthalmologyStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ophthalmology Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setOphthalmologyStatus(value);
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
            {ophthalmologyStatus === "abnormal" && (
              <>
                <FormField
                  control={form.control}
                  name="clinicalFindings.ophthalmologyDiagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter ophthalmology diagnosis"
                          {...field}
                          className="border-gray-300 dark:border-gray-600 focus:border-blue-500 min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clinicalFindings.ophthalmologyReferral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral/Medication Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Orthopedic */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Orthopedic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="clinicalFindings.orthoStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orthopedic Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setOrthoStatus(value);
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
            {orthoStatus === "abnormal" && (
              <>
                <FormField
                  control={form.control}
                  name="clinicalFindings.orthoDiagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter orthopedic diagnosis"
                          {...field}
                          className="border-gray-300 dark:border-gray-600 focus:border-blue-500 min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clinicalFindings.orthoReferral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral/Medication Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Physiotherapy */}
        <Card className="border-teal-200 dark:border-teal-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Physiotherapy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="clinicalFindings.physioStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physiotherapy Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setPhysioStatus(value);
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
            {physioStatus === "abnormal" && (
              <>
                <FormField
                  control={form.control}
                  name="clinicalFindings.physioDiagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter physiotherapy diagnosis"
                          {...field}
                          className="border-gray-300 dark:border-gray-600 focus:border-blue-500 min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clinicalFindings.physioReferral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral/Medication Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
