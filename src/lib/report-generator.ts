import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ReportData {
  projectName?: string;
  campName?: string;
  generatedAt: Date;
  stats: {
    attended: number;
    male: number;
    female: number;
    others: number;
    children: number;
    teenagers: number;
    adults: number;
    seniors: number;
    newPatientsToday: number;
    newPatientsThisWeek: number;
    newPatientsThisMonth: number;
    newPatientsThisYear: number;
    prevNewPatientsToday?: number;
    prevNewPatientsThisWeek?: number;
    prevNewPatientsThisMonth?: number;
    prevNewPatientsThisYear?: number;
  };
  analytics: {
    attended: number;
    male: number;
    female: number;
    children: number;
    teenagers: number;
    adults: number;
    seniors: number;
    withInsurance: number;
    withoutInsurance: number;
    newPatientsOverTime: { date: string; count: number }[];
    hivTested?: number;
    hivPositive?: number;
    hivNegative?: number;
    tbPositive?: number;
    tbNegative?: number;
    cancerScreened?: number;
    breastCancerScreened?: number;
    cervicalCancerScreened?: number;
    prostateCancerScreened?: number;
    preventiveMeasures?: number;
    bloodDonation?: number;
    physioAbnormal?: number;
    dentalAbnormal?: number;
    ophthalmologyAbnormal?: number;
    orthoAbnormal?: number;
    echoAbnormal?: number;
    ecgAbnormal?: number;
    xrayAbnormal?: number;
    ultrasoundAbnormal?: number;
  };
}

export async function generateAnalyticsReport(data: ReportData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Colors
  const primaryColor = [59, 130, 246]; // Blue
  const secondaryColor = [16, 185, 129]; // Green
  const textColor = [31, 41, 55]; // Gray-800
  const lightGray = [243, 244, 246]; // Gray-100

  // Helper function to add a new page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, icon?: string) => {
    checkNewPage(15);
    yPosition += 5;
    doc.setFillColor(...primaryColor);
    doc.rect(margin, yPosition - 3, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPosition + 5);
    doc.setTextColor(...textColor);
    yPosition += 12;
  };

  // Helper function to add a table
  const addTable = (headers: string[], rows: (string | number)[][], title?: string) => {
    if (title) {
      checkNewPage(10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, yPosition);
      yPosition += 7;
    }

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPosition,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: textColor,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      theme: 'striped',
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  };

  // Cover Page
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Medical Camp Analytics Report', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive Health Data Analysis', pageWidth / 2, 35, { align: 'center' });
  
  doc.setTextColor(...textColor);
  yPosition = 75;

  // Report Information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const reportInfo = [
    ['Project:', data.projectName || 'N/A'],
    ['Camp:', data.campName || 'N/A'],
    ['Generated On:', format(data.generatedAt, 'MMMM dd, yyyy HH:mm:ss')],
    ['Report Type:', 'Comprehensive Analytics'],
  ];

  addTable(['Field', 'Value'], reportInfo, 'Report Information');

  // Executive Summary
  addSectionHeader('Executive Summary');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryText = [
    `This report provides a comprehensive analysis of patient data collected during the medical camp.`,
    `Total patients attended: ${data.stats.attended.toLocaleString()}`,
    `The data includes demographic breakdowns, clinical findings, screening results, and health interventions.`,
    `All statistics are based on verified patient records and clinical assessments.`,
  ];

  summaryText.forEach((line) => {
    checkNewPage(6);
    doc.text(line, margin, yPosition, { maxWidth: contentWidth });
    yPosition += 6;
  });

  yPosition += 5;

  // Patient Demographics
  addSectionHeader('Patient Demographics');

  // Gender Distribution
  const genderData = [
    ['Male', data.stats.male.toLocaleString(), `${((data.stats.male / data.stats.attended) * 100).toFixed(1)}%`],
    ['Female', data.stats.female.toLocaleString(), `${((data.stats.female / data.stats.attended) * 100).toFixed(1)}%`],
    ['Others', (data.stats.others || 0).toLocaleString(), `${(((data.stats.others || 0) / data.stats.attended) * 100).toFixed(1)}%`],
    ['Total', data.stats.attended.toLocaleString(), '100%'],
  ];
  addTable(['Gender', 'Count', 'Percentage'], genderData, 'Gender Distribution');

  // Age Distribution
  const ageData = [
    ['Children (0-12)', data.stats.children.toLocaleString(), `${((data.stats.children / data.stats.attended) * 100).toFixed(1)}%`],
    ['Teenagers (13-19)', data.stats.teenagers.toLocaleString(), `${((data.stats.teenagers / data.stats.attended) * 100).toFixed(1)}%`],
    ['Adults (20-60)', data.stats.adults.toLocaleString(), `${((data.stats.adults / data.stats.attended) * 100).toFixed(1)}%`],
    ['Seniors (60+)', data.stats.seniors.toLocaleString(), `${((data.stats.seniors / data.stats.attended) * 100).toFixed(1)}%`],
  ];
  addTable(['Age Group', 'Count', 'Percentage'], ageData, 'Age Distribution');

  // Insurance Status
  if (data.analytics.withInsurance !== undefined || data.analytics.withoutInsurance !== undefined) {
    const insuranceTotal = (data.analytics.withInsurance || 0) + (data.analytics.withoutInsurance || 0);
    if (insuranceTotal > 0) {
      const insuranceData = [
        ['With Insurance', (data.analytics.withInsurance || 0).toLocaleString(), `${(((data.analytics.withInsurance || 0) / insuranceTotal) * 100).toFixed(1)}%`],
        ['Without Insurance', (data.analytics.withoutInsurance || 0).toLocaleString(), `${(((data.analytics.withoutInsurance || 0) / insuranceTotal) * 100).toFixed(1)}%`],
      ];
      addTable(['Insurance Status', 'Count', 'Percentage'], insuranceData, 'Insurance Coverage');
    }
  }

  // New Patients Over Time
  if (data.analytics.newPatientsOverTime && data.analytics.newPatientsOverTime.length > 0) {
    addSectionHeader('Patient Registration Trends');
    const recentPatients = data.analytics.newPatientsOverTime.slice(-10); // Last 10 data points
    const patientTrendData = recentPatients.map(item => [
      format(new Date(item.date), 'MMM dd, yyyy'),
      item.count.toLocaleString(),
    ]);
    addTable(['Date', 'New Patients'], patientTrendData, 'Recent Patient Registrations');
  }

  // Clinical Findings
  addSectionHeader('Clinical Findings & Screening Results');

  // HIV Testing
  if (data.analytics.hivTested !== undefined && data.analytics.hivTested > 0) {
    const hivData = [
      ['Total Tested', data.analytics.hivTested.toLocaleString()],
      ['Positive', (data.analytics.hivPositive || 0).toLocaleString(), `${(((data.analytics.hivPositive || 0) / data.analytics.hivTested) * 100).toFixed(2)}%`],
      ['Negative', (data.analytics.hivNegative || 0).toLocaleString(), `${(((data.analytics.hivNegative || 0) / data.analytics.hivTested) * 100).toFixed(2)}%`],
    ];
    addTable(['HIV Test Result', 'Count', 'Percentage'], hivData, 'HIV Testing Results');
  }

  // TB Screening
  if (data.analytics.tbPositive !== undefined || data.analytics.tbNegative !== undefined) {
    const tbTotal = (data.analytics.tbPositive || 0) + (data.analytics.tbNegative || 0);
    if (tbTotal > 0) {
      const tbData = [
        ['Total Screened', tbTotal.toLocaleString()],
        ['Positive', (data.analytics.tbPositive || 0).toLocaleString(), `${(((data.analytics.tbPositive || 0) / tbTotal) * 100).toFixed(2)}%`],
        ['Negative', (data.analytics.tbNegative || 0).toLocaleString(), `${(((data.analytics.tbNegative || 0) / tbTotal) * 100).toFixed(2)}%`],
      ];
      addTable(['TB Test Result', 'Count', 'Percentage'], tbData, 'TB Screening Results');
    }
  }

  // Cancer Screening
  if (data.analytics.cancerScreened !== undefined && data.analytics.cancerScreened > 0) {
    const cancerData = [
      ['Total Screened', data.analytics.cancerScreened.toLocaleString()],
      ['Breast Cancer', (data.analytics.breastCancerScreened || 0).toLocaleString()],
      ['Cervical Cancer', (data.analytics.cervicalCancerScreened || 0).toLocaleString()],
      ['Prostate Cancer', (data.analytics.prostateCancerScreened || 0).toLocaleString()],
    ];
    addTable(['Cancer Type', 'Screened'], cancerData, 'Cancer Screening Summary');
  }

  // Specialty Referrals
  const specialtyData: (string | number)[][] = [];
  if (data.analytics.physioAbnormal && data.analytics.physioAbnormal > 0) {
    specialtyData.push(['Physiotherapy', data.analytics.physioAbnormal.toLocaleString()]);
  }
  if (data.analytics.dentalAbnormal && data.analytics.dentalAbnormal > 0) {
    specialtyData.push(['Dental', data.analytics.dentalAbnormal.toLocaleString()]);
  }
  if (data.analytics.ophthalmologyAbnormal && data.analytics.ophthalmologyAbnormal > 0) {
    specialtyData.push(['Ophthalmology', data.analytics.ophthalmologyAbnormal.toLocaleString()]);
  }
  if (data.analytics.orthoAbnormal && data.analytics.orthoAbnormal > 0) {
    specialtyData.push(['Orthopedic', data.analytics.orthoAbnormal.toLocaleString()]);
  }
  if (specialtyData.length > 0) {
    addTable(['Specialty', 'Abnormal Findings'], specialtyData, 'Specialty Referrals Required');
  }

  // Radiology Findings
  const radiologyData: (string | number)[][] = [];
  if (data.analytics.ecgAbnormal && data.analytics.ecgAbnormal > 0) {
    radiologyData.push(['ECG', data.analytics.ecgAbnormal.toLocaleString()]);
  }
  if (data.analytics.echoAbnormal && data.analytics.echoAbnormal > 0) {
    radiologyData.push(['Echocardiogram', data.analytics.echoAbnormal.toLocaleString()]);
  }
  if (data.analytics.xrayAbnormal && data.analytics.xrayAbnormal > 0) {
    radiologyData.push(['X-Ray', data.analytics.xrayAbnormal.toLocaleString()]);
  }
  if (data.analytics.ultrasoundAbnormal && data.analytics.ultrasoundAbnormal > 0) {
    radiologyData.push(['Ultrasound', data.analytics.ultrasoundAbnormal.toLocaleString()]);
  }
  if (radiologyData.length > 0) {
    addTable(['Test Type', 'Abnormal Findings'], radiologyData, 'Radiology & Diagnostic Tests');
  }

  // Health Interventions
  addSectionHeader('Health Interventions & Preventive Care');

  const interventionData: (string | number)[][] = [];
  if (data.analytics.preventiveMeasures !== undefined && data.analytics.preventiveMeasures > 0) {
    interventionData.push([
      'Preventive Measures',
      data.analytics.preventiveMeasures.toLocaleString(),
      `${((data.analytics.preventiveMeasures / data.stats.attended) * 100).toFixed(1)}%`,
    ]);
  }
  if (data.analytics.bloodDonation !== undefined && data.analytics.bloodDonation > 0) {
    interventionData.push([
      'Blood Donations',
      data.analytics.bloodDonation.toLocaleString(),
      `${((data.analytics.bloodDonation / data.stats.attended) * 100).toFixed(1)}%`,
    ]);
  }
  if (interventionData.length > 0) {
    addTable(['Intervention Type', 'Count', 'Percentage of Patients'], interventionData, 'Health Interventions');
  }

  // New Patient Statistics
  addSectionHeader('New Patient Registration Statistics');

  const newPatientData = [
    ['Today', data.stats.newPatientsToday.toLocaleString()],
    ['This Week', data.stats.newPatientsThisWeek.toLocaleString()],
    ['This Month', data.stats.newPatientsThisMonth.toLocaleString()],
    ['This Year', data.stats.newPatientsThisYear.toLocaleString()],
  ];
  addTable(['Period', 'New Patients'], newPatientData, 'New Patient Registrations by Period');

  // Key Insights
  addSectionHeader('Key Insights & Recommendations');

  const insights: string[] = [];
  
  if (data.analytics.hivPositive && data.analytics.hivPositive > 0) {
    const hivRate = ((data.analytics.hivPositive / data.analytics.hivTested!) * 100).toFixed(2);
    insights.push(`• HIV positive rate: ${hivRate}% (${data.analytics.hivPositive} out of ${data.analytics.hivTested} tested)`);
  }
  
  if (data.analytics.tbPositive && data.analytics.tbPositive > 0) {
    const tbRate = ((data.analytics.tbPositive / ((data.analytics.tbPositive || 0) + (data.analytics.tbNegative || 0))) * 100).toFixed(2);
    insights.push(`• TB positive rate: ${tbRate}% (${data.analytics.tbPositive} cases identified)`);
  }

  const totalAbnormal = (data.analytics.physioAbnormal || 0) + (data.analytics.dentalAbnormal || 0) + 
    (data.analytics.ophthalmologyAbnormal || 0) + (data.analytics.orthoAbnormal || 0);
  if (totalAbnormal > 0) {
    insights.push(`• Total specialty referrals required: ${totalAbnormal.toLocaleString()} patients`);
  }

  const totalRadiologyAbnormal = (data.analytics.ecgAbnormal || 0) + (data.analytics.echoAbnormal || 0) + 
    (data.analytics.xrayAbnormal || 0) + (data.analytics.ultrasoundAbnormal || 0);
  if (totalRadiologyAbnormal > 0) {
    insights.push(`• Total abnormal radiology findings: ${totalRadiologyAbnormal.toLocaleString()} patients requiring follow-up`);
  }

  if (data.analytics.preventiveMeasures && data.analytics.preventiveMeasures > 0) {
    insights.push(`• Preventive care provided to ${data.analytics.preventiveMeasures.toLocaleString()} patients`);
  }

  if (insights.length === 0) {
    insights.push('• All screening results and clinical findings are within expected parameters.');
    insights.push('• Continue monitoring patient trends and follow-up care requirements.');
  }

  insights.forEach((insight) => {
    checkNewPage(6);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(insight, margin, yPosition, { maxWidth: contentWidth });
    yPosition += 6;
  });

  // Footer on each page
  const addFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${totalPages} | Generated by AfyaCheck Health Management System`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  };

  addFooter();

  // Generate filename
  const filename = `Medical_Camp_Analytics_${data.projectName?.replace(/\s+/g, '_') || 'Report'}_${format(data.generatedAt, 'yyyy-MM-dd')}.pdf`;

  // Save the PDF
  doc.save(filename);
}
