import { Injectable, asNativeElements } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Observable,
  from,
  Subject,
  throwError,
  catchError,
  BehaviorSubject,
} from 'rxjs';
import {
  CRS_DASHBOARD_CLAIMSMRY_DOCTORDATA,
  CRS_DASHBOARD_CLAIMSMRY_RECEIVEDATA,
  CRS_DASHBOARD_CLAIMSUMMARY_BRKUP,
  CRS_DASHBOARD_CLAIMSUMMARY_HOME,
  CRS_DASHBOARD_DENIAL_EXPORT,
  CRS_DASHBOARD_FINANCE_EXPORT,
  CRS_DASHBOARD_PRIOR_EXPORT,
  CRS_DASHBOARD_PRIOR_DASHBOARD,
  CRS_DASHBOARD_CLINICIANRECEIVER_CPT,
  CRS_DASHBOARD_CLINICIANRECIVER_BRKUP,
  CRS_DASHBOARD_CLINICIAN_HOME,
  CRS_DASHBOARD_FINANCE_AGEING,
  CRS_DASHBOARD_FINANCE_HOME,
  CRS_DASHBOARD_INIT_DATA,
  CRS_DASHBOARD_RCMCLAIM_BRKUP,
  CRS_DASHBOARD_RCMDENIAL_BRKUP,
  CRS_DASHBOARD_RCM_HOME,
  CRS_DASHBOARD_RECEIVER_HOME,
  CRS_DASHBOARD_REMITTANCE_HOME,
  CRS_DASHBOARD_SUBMISSION_HOME,
  CRS_DASHBOARD_LOGIN,
  CRS_DASHBOARD_TABS_DATA,
  CRS_DENIAL_DASHBOARD_INIT_DATA,
  CRS_FINANCE_DASHBOARD_INIT_DATA,
  CRS_CEO_DASHBOARD_INIT_DATA,
  CRS_FINANCE_DASHBOARD_CLAIMSUMMARY_HOME,
  CRS_DASHBOARD_PRIOR_DASHBOARD_OPERATIONS,
  CRS_DASHBOARD_REVENUE_HOME,
  CRS_DASHBOARD_CEO_HOME_PART1,
  CRS_DASHBOARD_CEO_HOME_PART2,
  CRS_DASHBOARD_REVENUE_EXPORT,
  CRS_DASHBOARD_EANDM_EXPORT,
  CRS_EnM_DASHBOARD_INIT_DATA,
  CRS_DASHBOARD_EnM_HOME,
  CRS_DASHBOARD_PARAMETER_LIST,
  CRS_DASHBOARD_SECURITY_POLICY,
  CRS_DASHBOARD_RESET_PASSWORD,
  CRS_DASHBOARD_ACTIVITY_LOG,
  CRS_DASHBOARD_USERS_LOGIN,
  CRS_FOOTFALL_DASHBOARD_INIT_DATA,
  CRS_DASHBOARD_FOOTFALL_EXPORT,
  CRS_FOOTFALL_DASHBOARD_PART1,
  CRS_FOOTFALL_DASHBOARD_PART2,
  CRS_FOOTFALL_DASHBOARD_PART3,
} from 'src/constants/constantURl';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const colors: string[] = ['#6babac', '#e55253'];

@Injectable({
  providedIn: 'root',
})
export class DataService {
  isLoggedIn: any;

  private months: { name: string; value: any }[] = [
    { name: 'All', value: ' ' },
    { name: 'January', value: 0 },
    { name: 'February', value: 1 },
    { name: 'March', value: 2 },
    { name: 'April', value: 3 },
    { name: 'May', value: 4 },
    { name: 'June', value: 5 },
    { name: 'July', value: 6 },
    { name: 'August', value: 7 },
    { name: 'September', value: 8 },
    { name: 'October', value: 9 },
    { name: 'November', value: 10 },
    { name: 'December', value: 11 },
  ];
  Id: number;

  Assigned: string;

  Subject: string;

  private _values = new Subject();

  public selectedValues: any;

  private applyButtonClicked = new Subject<void>();
  private dataSubject = new Subject<void>();

  applyButtonClicked$ = this.applyButtonClicked.asObservable();
  dataSubject$ = this.dataSubject.asObservable();

  selectedValue$ = this._values.asObservable();

  lookupDatatoolbar: any;

  constructor(private http: HttpClient) {}
  //============= show headers in dashboard pages ============
  set_Loggin_Value(Value: any) {
    this.isLoggedIn = Value;
    console.log('logging value changed', this.isLoggedIn);
  }
  //============= hide headers in login page ============

  get_Loggin_Value() {
    return this.isLoggedIn;
  }

  //============Share months to component ================
  getMonths(): { name: string; value: number }[] {
    return this.months;
  }

  dashboard_activity_LogData(formData: any) {
    const url = CRS_DASHBOARD_ACTIVITY_LOG;
    const reqBodyData = formData;
    return this.http.post(url, reqBodyData);
  }

  //================ClaimSummary Data Fetching=================
  get_Main_Home_Dashboard_Datasource(
    searchOn: any,
    fromdate: any,
    todate: any,
    rejectionIndex: any,
    denialCategory: any,
    encounterType: any,
    block: any,
    facility: any,
    insurance: any,
    department: any
  ) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_DASHBOARD_CLAIMSUMMARY_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      RejectionIndex: rejectionIndex,
      DenialCategory: denialCategory,
      EncounterType: encounterType,
      Block: block,
      Region: '',
      ProviderType: '',
      Facility: facility,
      Insurance: insurance,
      Department: department,
      SessionID: sessionID,
    };

    return this.http.post(url, reqBodyData);
  }

  //================Finance dashboard Data Fetching=================
  get_Finance_Home_Dashboard_Datasource(
    searchOn: any,
    fromdate: any,
    todate: any,
    asOnDate: any,
    encounterType: any,
    facility: any,
    insurance: any,
    department: any
  ) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_FINANCE_DASHBOARD_CLAIMSUMMARY_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      DateAsOn: asOnDate,
      EncounterType: encounterType,
      Region: '',
      ProviderType: '',
      Facility: facility,
      Insurance: insurance,
      Department: department,
      SessionID: sessionID,
    };

    return this.http.post(url, reqBodyData);
  }

  //================Finance dashboard Data Fetching=================
  get_FootFall_PART1_Dashboard_Datasource(payload: any) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_FOOTFALL_DASHBOARD_PART1;
    const reqBodyData = payload;
    return this.http.post(url, reqBodyData);
  }

  //================Finance dashboard Data Fetching=================
  get_FootFall_PART2_Dashboard_Datasource(payload: any) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_FOOTFALL_DASHBOARD_PART2;
    const reqBodyData = payload;
    return this.http.post(url, reqBodyData);
  }

  //================Finance dashboard Data Fetching=================
  get_FootFall_PART3_Dashboard_Datasource(payload: any) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_FOOTFALL_DASHBOARD_PART3;
    const reqBodyData = payload;
    return this.http.post(url, reqBodyData);
  }

  //================ClaimSummary Data Fetching=================
  get_Prior_Dashboard_Production_Datasource(
    datefrom: any,
    dateTo: any,
    DenialCategory: any,
    facility: any,
    department: any,
    category: any,
    payer: any,
    physiciancategory: any
  ) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_DASHBOARD_PRIOR_DASHBOARD;
    const reqBodyData = {
      DateFrom: datefrom,
      DateTo: dateTo,
      // SubmissionIndex: '',
      DenialCategory: DenialCategory,
      Facility: facility,
      Department: department,
      ServiceCategory: category,
      PayerID: payer,
      PhysicianCategory: physiciancategory,
      SessionID: sessionID,
    };

    return this.http.post(url, reqBodyData);
  }

  //================ClaimSummary Data Fetching=================
  get_Prior_Dashboard_Opreations_Datasource(
    datefrom: any,
    dateTo: any,
    facility: any,
    department: any,
    category: any
  ) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_DASHBOARD_PRIOR_DASHBOARD_OPERATIONS;
    const reqBodyData = {
      DateFrom: datefrom,
      DateTo: dateTo,
      Facility: facility,
      Department: department,
      ServiceCategory: category,
      SessionID: sessionID,
    };

    return this.http.post(url, reqBodyData);
  }

  get_Revenue_Home_Dashboard_Datasource(
    searchOn: any,
    fromdate: any,
    todate: any,
    submissionIndex: any,
    encounterType: any,
    block: any,
    facility: any,
    insurance: any,
    department: any
  ) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_DASHBOARD_REVENUE_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      SubmissionIndex: submissionIndex,
      EncounterType: encounterType,
      Block: block,
      Region: '',
      ProviderType: '',
      Facility: facility,
      Insurance: insurance,
      Department: department,
      SessionID: sessionID,
    };

    return this.http.post(url, reqBodyData);
  }

  get_Ceo_Home_Dashboard_Datasource(
    fromdate: any,
    todate: any,
    encounterType: any,
    facility: any,
    insurance: any,
    department: any
  ) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_DASHBOARD_CEO_HOME_PART1;
    const reqBodyData = {
      DateFrom: fromdate,
      DateTo: todate,
      // EncounterType: encounterType,
      Facility: facility,
      Insurance: insurance,
      Department: department,
      SessionID: sessionID,
    };

    return this.http.post(url, reqBodyData);
  }

  get_Ceo_Home_Dashboard_Datasource_part2(
    fromdate: any,
    todate: any,
    encounterType: any,
    facility: any,
    insurance: any,
    department: any
  ) {
    const sessionID = sessionStorage.getItem('SessionID');
    const url = CRS_DASHBOARD_CEO_HOME_PART2;
    const reqBodyData = {
      DateFrom: fromdate,
      DateTo: todate,
      // EncounterType: encounterType,
      Facility: facility,
      Insurance: insurance,
      Department: department,
      SessionID: sessionID,
    };

    return this.http.post(url, reqBodyData);
  }

  getUserSecurityPolicityData() {
    return this.http.post(`${CRS_DASHBOARD_SECURITY_POLICY}`, {});
  }
  // ========== reset password ===============
  reset_Password(resetData: any) {
    const url = CRS_DASHBOARD_RESET_PASSWORD;
    const reqBodyData = resetData;
    return this.http.post(url, reqBodyData);
  }

  get_EnM_Home_Dashboard_Datasource(
    fromdate: any,
    todate: any,
    facility: any,
    clinician: any,
    department: any,
    category: any,
    level: any
  ) {
    const url = CRS_DASHBOARD_EnM_HOME;
    const reqBodyData = {
      DateFrom: fromdate,
      DateTo: todate,
      Facility: facility,
      Clinician: clinician,
      Department: department,
      EnmLevel: level,
      EnmCategory: category,
    };

    return this.http.post(url, reqBodyData);
  }

  //================ Loading Tabs Data for mainDashboardLayout =====================
  fetch_tab_Data_mainLayout() {
    const UserID = sessionStorage.getItem('paramsid');
    const url = CRS_DASHBOARD_TABS_DATA;
    const reqBody = { UserID: UserID, Trial: '1' };
    return this.http.post(url, reqBody);
  }

  // ================================================================================
  // ================================================================================

  //=============Grouping of higher amound values===========
  formatNumberWithCommas(number: any): any {
    const [integerPart, fractionalPart] = number.toString().split('.');
    const reversedInteger = integerPart.split('').reverse().join('');
    const groupedInteger = reversedInteger
      .replace(/(\d{3})(?=\d)/g, '$1,')
      .replace(/(\d{2})(?=\d)/g, '$1,');
    const formattedInteger = groupedInteger
      .split('')
      .reverse()
      .join('')
      .replace(/^,/, '');
    return fractionalPart
      ? `${formattedInteger}.${fractionalPart}`
      : formattedInteger;
  }

  //=================Init data for denial Dashboard drop down fields==================
  getInitData(id: any): Observable<any> {
    return this.http.post<any>(CRS_DASHBOARD_INIT_DATA, { userid: id });
  }

  //=================Init data for auth-dashboard drop down fields==================
  get_Finance_Dashboard_InitData(id: any): Observable<any> {
    return this.http.post<any>(CRS_FINANCE_DASHBOARD_INIT_DATA, { UserID: id });
  }

  //=================Init data for auth-dashboard drop down fields==================
  get_Footfall_Dashboard_InitData(id: any): Observable<any> {
    return this.http.post<any>(CRS_FOOTFALL_DASHBOARD_INIT_DATA, {
      UserID: id,
    });
  }

  //=================Init data for auth-dashboard drop down fields==================
  get_Denial_Dashboard_InitData(id: any): Observable<any> {
    return this.http.post<any>(CRS_DENIAL_DASHBOARD_INIT_DATA, { userid: id });
  }

  //=================Init data for ceo-dashboard drop down fields==================
  get_Ceo_Dashboard_InitData(id: any): Observable<any> {
    return this.http.post<any>(CRS_CEO_DASHBOARD_INIT_DATA, { userid: id });
  }

  //=================Init data for ceo-dashboard drop down fields==================
  get_EnM_Dashboard_InitData(id: any): Observable<any> {
    return this.http.post<any>(CRS_EnM_DASHBOARD_INIT_DATA, { userid: id });
  }

  //===================== Login dashboard ============================
  dashboard_Login(username: any, password: any) {
    const url = CRS_DASHBOARD_LOGIN;
    const reqBody = { Loginid: username, password: password };
    return this.http.post(url, reqBody);
  }

  dashboard_Params_Demo_Login(username: any, password: any) {
    const url = CRS_DASHBOARD_USERS_LOGIN;
    const reqBody = { Loginid: username, password: password };
    return this.http.post(url, reqBody);
  }

  //================ClaimSummary Data Fetching=================
  getClaimSummary(
    searchOn: any,
    facility: any,
    encounterType: any,
    fromdate: any,
    todate: any
  ) {
    const url = CRS_DASHBOARD_CLAIMSUMMARY_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      EncounterType: encounterType,
      Facility: facility,
    };
    return this.http.post(url, reqBodyData);
  }

  //===================Submission Data Fetching=========================
  getSubmission(
    searchOn: any,
    facility: any,
    encounterType: any,
    fromdate: any,
    todate: any
  ) {
    const url = CRS_DASHBOARD_SUBMISSION_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      EncounterType: encounterType,
      Facility: facility,
    };
    return this.http.post(url, reqBodyData);
  }
  //=======================Remmitance Data Fetching=====================
  getRemittance(
    searchOn: any,
    facility: any,
    encounterType: any,
    fromdate: any,
    todate: any
  ) {
    const url = CRS_DASHBOARD_REMITTANCE_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      EncounterType: encounterType,
      Facility: facility,
    };
    return this.http.post(url, reqBodyData);
  }
  //======================RCM Data Fetching=============================
  getRCM(
    searchOn: any,
    facility: any,
    encounterType: any,
    fromdate: any,
    todate: any
  ) {
    const url = CRS_DASHBOARD_RCM_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      EncounterType: encounterType,
      Facility: facility,
    };
    return this.http.post(url, reqBodyData);
  }
  //======================Doctors Data Fetching=========================
  getClinician(
    searchOn: any,
    facility: any,
    encounterType: any,
    fromdate: any,
    todate: any
  ) {
    const url = CRS_DASHBOARD_CLINICIAN_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      EncounterType: encounterType,
      Facility: facility,
    };
    return this.http.post(url, reqBodyData);
  }
  //=====================Receivers Data Fetching=====================
  getReceiver(
    searchOn: any,
    facility: any,
    encounterType: any,
    fromdate: any,
    todate: any
  ) {
    const url = CRS_DASHBOARD_RECEIVER_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      EncounterType: encounterType,
      Facility: facility,
    };
    return this.http.post(url, reqBodyData);
  }

  getFinance(
    searchOn: any,
    facility: any,
    encounterType: any,
    fromdate: any,
    todate: any,
    asondate: any
  ) {
    const url = CRS_DASHBOARD_FINANCE_HOME;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      EncounterType: encounterType,
      Facility: facility,
      AsOnDate: asondate,
    };
    return this.http.post(url, reqBodyData);
  }

  // //////////////////Drilldown///////////////////

  getdrilldata = (selecteddata: any) => {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    const url = CRS_DASHBOARD_CLAIMSUMMARY_BRKUP;
    const reqBodyData = {
      SearchOn: selectedValuesString.searchOn,
      DateFrom: selectedValuesString.DateFrom,
      DateTo: selectedValuesString.DateTo,
      EncounterType: selectedValuesString.encounterType,
      Facility: selectedValuesString.facility,
      SelectedValue: selecteddata,
    };
    return this.http.post(url, reqBodyData);
  };

  // //////////////////Drilldown of RCM///////////////////

  getdrillrcmdata = (selectedValue: any, submissionLevel: any) => {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    const url = CRS_DASHBOARD_RCMCLAIM_BRKUP;
    const reqBodyData = {
      SearchOn: selectedValuesString.searchOn,
      DateFrom: selectedValuesString.DateFrom,
      DateTo: selectedValuesString.DateTo,
      EncounterType: selectedValuesString.encounterType,
      Facility: selectedValuesString.facility,
      SelectedValue: selectedValue,
      SubmissionLevel: submissionLevel,
    };
    return this.http.post(url, reqBodyData);
  };

  //=============================================================
  getdrilldenialdata = (selecteddata: any) => {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    const url = CRS_DASHBOARD_RCMDENIAL_BRKUP;
    const reqBodyData = {
      SearchOn: selectedValuesString.searchOn,
      DateFrom: selectedValuesString.DateFrom,
      DateTo: selectedValuesString.DateTo,
      EncounterType: selectedValuesString.encounterType,
      Facility: selectedValuesString.facility,
      DenialCode: selecteddata,
    };
    return this.http.post(url, reqBodyData);
  };

  ////////////////////Drilldown of Doctors///////////////////

  getdrilldoctors = (selecteddata: any) => {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    const url = CRS_DASHBOARD_CLINICIANRECIVER_BRKUP;
    const reqBodyData = {
      SearchOn: selectedValuesString.searchOn,
      DateFrom: selectedValuesString.DateFrom,
      DateTo: selectedValuesString.DateTo,
      EncounterType: selectedValuesString.encounterType,
      Facility: selectedValuesString.facility,
      DoctorName: selecteddata,
    };
    return this.http.post(url, reqBodyData);
  };

  getdrilldoctorpies = (selecteddata: any, receiversname: any) => {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    const url = CRS_DASHBOARD_CLINICIANRECEIVER_CPT;
    const reqBodyData = {
      SearchOn: selectedValuesString.searchOn,
      DateFrom: selectedValuesString.DateFrom,
      DateTo: selectedValuesString.DateTo,
      EncounterType: selectedValuesString.encounterType,
      Facility: selectedValuesString.facility,
      DoctorName: selecteddata,
      ReceiverName: receiversname,
    };
    return this.http.post(url, reqBodyData);
  };

  //////////////////// FINANCEDRILLDOWN////////////////////////
  getdrillFinanceageing = (selecteddata: any) => {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    const url = CRS_DASHBOARD_FINANCE_AGEING;
    const reqBodyData = {
      SearchOn: selectedValuesString.searchOn,
      DateFrom: selectedValuesString.DateFrom,
      DateTo: selectedValuesString.DateTo,
      EncounterType: selectedValuesString.encounterType,
      Facility: selectedValuesString.facility,
      AsOnDate: selectedValuesString.AsOnDate,
      Age: selecteddata,
    };
    return this.http.post(url, reqBodyData);
  };

  //====================DrillDown Data Grid of Receiver====================
  get_DrillDown_Data_Grid_Receiver(data: any, paramsData: any) {
    const url = CRS_DASHBOARD_CLAIMSMRY_RECEIVEDATA;

    const reqBodyData = {
      SearchOn: paramsData.searchOn,
      DateFrom: paramsData.DateFrom,
      DateTo: paramsData.DateTo,
      EncounterType: paramsData.encounterType,
      Facility: paramsData.facility,
      ReceiverName: data,
    };
    return this.http.post(url, reqBodyData);
  }

  //====================DrillDown Data Grid of Receiver====================
  get_DrillDown_Data_Grid_Clinician(data: any, paramsData: any) {
    const url = CRS_DASHBOARD_CLAIMSMRY_DOCTORDATA;
    const reqBodyData = {
      SearchOn: paramsData.searchOn,
      DateFrom: paramsData.DateFrom,
      DateTo: paramsData.DateTo,
      EncounterType: paramsData.encounterType,
      Facility: paramsData.facility,
      DoctorName: data,
    };
    return this.http.post(url, reqBodyData);
  }
  //=================Format the date for export pdf date=====================
  formatDate(dateStr: any) {
    // Convert the string to a Date object
    const date = new Date(dateStr);
    // Define the month names
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    // Extract the day, month, and year
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
    const month = monthNames[date.getMonth()]; // Get month name
    const year = date.getFullYear(); // Get full year

    // Return the formatted date
    return `${day}-${month}-${year}`;
  }

  export(reportname: any, element: any) {
    if (element) {
      html2canvas(element).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();

        // Add the title at the top center
        pdf.setFontSize(15);
        pdf.setFont('helvetica', 'bold');
        const textWidth =
          (pdf.getStringUnitWidth(reportname) * pdf.getFontSize()) /
          pdf.internal.scaleFactor;
        const textX = (pdfWidth - textWidth) / 2;
        pdf.text(reportname, textX, 10); // Centered report name

        const startY = 15; // Adjust this value if needed for proper spacing

        // Add the image directly below the text
        const imgProps = pdf.getImageProperties(imgData);
        const imageHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, startY, pdfWidth, imageHeight);

        // Add timestamp to the bottom left
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const exportTime = moment().format('DD-MM-YYYY hh:mm:ss A');
        pdf.setFontSize(10);
        pdf.text(`Exported on: ${exportTime}`, 10, pdfHeight - 5);

        // Save the PDF
        pdf.save(`${reportname}.pdf`);
      });
    }
  }

  exportToExcel(
    datasource1: any,
    datsource2: any,
    fileName: any,
    datasource1name: any,
    datasource2name: any
  ) {
    // Convert JSON to worksheet
    const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datasource1);
    const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datsource2);

    // Create a new workbook and append the sheets
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, `${datasource1name}`);
    XLSX.utils.book_append_sheet(wb, ws2, `${datasource2name}`);

    // Write the file
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Save the file
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `${fileName}.xlsx`);
  }

  PriorexportToExcel(datasource1: any, fileName: any, datasource1name: any) {
    // Convert JSON to worksheet
    const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datasource1);

    // Create a new workbook and append the sheets
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, `${datasource1name}`);

    // Write the file
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Save the file
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `${fileName}.xlsx`);
  }
  // ============== export pdf charts ================
  exportGraphData(reportname: any, elements: HTMLElement[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!elements || elements.length === 0) {
        reject('No elements to export');
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20; // Space for title

      // Title (Centered)
      pdf.setFontSize(15);
      pdf.setFont('helvetica', 'bold');
      const textWidth =
        (pdf.getStringUnitWidth(reportname) * pdf.getFontSize()) /
        pdf.internal.scaleFactor;
      const textX = (pageWidth - textWidth) / 2;
      pdf.text(reportname, textX, 12);

      // Helper: Process each element sequentially
      const processElement = (element: HTMLElement) =>
        html2canvas(element, {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          logging: false,
        }).then((canvas) => {
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const imgProps = pdf.getImageProperties(imgData);

          const scale = Math.min(
            (pageWidth - 20) / imgProps.width, // fit width
            (pageHeight - 20) / imgProps.height // fit height
          );

          const imgW = imgProps.width * scale;
          const imgH = imgProps.height * scale;

          // Page break if not enough space
          if (yPos + imgH > pageHeight - 15) {
            pdf.addPage();
            yPos = 10;
          }

          pdf.addImage(imgData, 'JPEG', 10, yPos, imgW, imgH);
          yPos += imgH + 10; // spacing for next div
        });

      // Run all elements one by one
      elements
        .reduce(
          (p, element) => p.then(() => processElement(element)),
          Promise.resolve()
        )
        .then(() => {
          // Add timestamp footer
          const exportTime = moment().format('DD-MM-YYYY hh:mm:ss A');
          pdf.setFontSize(6);
          pdf.text(`Exported on: ${exportTime}`, 10, pageHeight - 5);

          pdf.save(`${reportname}.pdf`);
          resolve();
        })
        .catch((err) => reject(err));
    });
  }

  //DENIAL EXPORT

  get_Denial_Dashboard_Export_Data(
    searchOn: any,
    fromdate: any,
    todate: any,
    rejectionIndex: any,
    denialCategory: any,
    encounterType: any,
    block: any,
    facility: any,
    insurance: any,
    department: any
  ) {
    const url = CRS_DASHBOARD_DENIAL_EXPORT;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      RejectionIndex: rejectionIndex,
      DenialCategory: denialCategory,
      EncounterType: encounterType,
      Block: block,
      Region: '',
      ProviderType: '',
      Facility: facility,
      Insurance: insurance,
      Department: department,
    };

    return this.http.post(url, reqBodyData);
  }

  get_Finance_Dashboard_Export_Data(
    searchOn: any,
    fromdate: any,
    todate: any,
    asOnDate: any,
    encounterType: any,
    facility: any,
    insurance: any,
    department: any
  ) {
    const url = CRS_DASHBOARD_FINANCE_EXPORT;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      DateAsOn: asOnDate,
      EncounterType: encounterType,
      Region: '',
      ProviderType: '',
      Facility: facility,
      Insurance: insurance,
      Department: department,
    };

    return this.http.post(url, reqBodyData);
  }

  get_Footfall_Dashboard_Export_Data(payload: any) {
    const url = CRS_DASHBOARD_FOOTFALL_EXPORT;
    const reqBodyData = payload;

    return this.http.post(url, reqBodyData);
  }

  get_Prior_Dashboard_Production_Export_Data(
    datefrom: any,
    dateTo: any,
    DenialCategory: any,
    facility: any,
    department: any,
    category: any,
    payer: any,
    physiciancategory: any
  ) {
    const url = CRS_DASHBOARD_PRIOR_EXPORT;
    const reqBodyData = {
      DateFrom: datefrom,
      DateTo: dateTo,
      // SubmissionIndex: '',
      DenialCategory: DenialCategory,
      Facility: facility,
      Department: department,
      ServiceCategory: category,
      PayerID: payer,
      PhysicianCategory: physiciancategory,
    };

    return this.http.post(url, reqBodyData);
  }

  //================ClaimSummary Data Fetching=================
  get_Prior_Dashboard_Opreations_Export_Data(
    datefrom: any,
    dateTo: any,
    facility: any,
    department: any,
    category: any
  ) {
    const url = CRS_DASHBOARD_PRIOR_EXPORT;
    const reqBodyData = {
      DateFrom: datefrom,
      DateTo: dateTo,
      Facility: facility,
      Department: department,
      ServiceCategory: category,
    };

    return this.http.post(url, reqBodyData);
  }

  get_Revenue_Dashboard_Export_Data(
    searchOn: any,
    fromdate: any,
    todate: any,
    submissionIndex: any,
    encounterType: any,
    block: any,
    facility: any,
    insurance: any,
    department: any
  ) {
    const url = CRS_DASHBOARD_REVENUE_EXPORT;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      SubmissionIndex: submissionIndex,
      EncounterType: encounterType,
      Block: block,
      Region: '',
      ProviderType: '',
      Facility: facility,
      Insurance: insurance,
      Department: department,
    };

    return this.http.post(url, reqBodyData);
  }

  get_EAndM_Dashboard_Export_Data(
    searchOn: any,
    fromdate: any,
    todate: any,
    submissionIndex: any,
    encounterType: any,
    block: any,
    facility: any,
    insurance: any,
    department: any
  ) {
    const url = CRS_DASHBOARD_EANDM_EXPORT;
    const reqBodyData = {
      SearchOn: searchOn,
      DateFrom: fromdate,
      DateTo: todate,
      SubmissionIndex: submissionIndex,
      EncounterType: encounterType,
      Block: block,
      Region: '',
      ProviderType: '',
      Facility: facility,
      Insurance: insurance,
      Department: department,
    };

    return this.http.post(url, reqBodyData);
  }

  get_Parameter_List(dashboard: any, Parameter: any) {
    const url = CRS_DASHBOARD_PARAMETER_LIST;
    const reqBodyData = {
      Dashboard: dashboard,
      Parameter: Parameter,
    };

    return this.http.post(url, reqBodyData);
  }
}
