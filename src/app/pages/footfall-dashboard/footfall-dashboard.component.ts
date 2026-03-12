import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule, PercentPipe } from '@angular/common';
import {
  Component,
  HostListener,
  NgModule,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {
  DxButtonModule,
  DxChartModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxDropDownButtonModule,
  DxFormModule,
  DxFunnelModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxLookupModule,
  DxPieChartModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTemplateModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxTreeViewModule,
} from 'devextreme-angular';
import { DxTagBoxTypes } from 'devextreme-angular/ui/tag-box';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';
import { firstValueFrom, forkJoin } from 'rxjs';

@Component({
  selector: 'app-footfall-dashboard',
  templateUrl: './footfall-dashboard.component.html',
  styleUrls: ['./footfall-dashboard.component.scss'],
  animations: [
    trigger('toggleRows', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('300ms ease-in', style({ height: '0', opacity: 0 })),
      ]),
    ]),
  ],
})
export class FootfallDashboardComponent implements OnInit {
  @ViewChild('insuranceTagBox', { static: false }) insuranceTagBox: any;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  @HostListener('window:resize')
  onResize() {
    this.chartSize = { width: window.innerWidth * 0.95 };

    if (this.chartInstance) {
      this.chartInstance.option('size', { width: this.chartSize.width });
    }
  }
  chartSize = { width: window.innerWidth * 0.95 };
  insurancePopupVisible = false;
  pipe = new PercentPipe('en-US');

  dateForm = {
    fromdate: '',
    todate: '',
  };

  chartInstance: any;

  userId: any;
  loadingVisible: boolean = false;
  exportLoadingVisible: boolean = false;
  showGroups: boolean = true;

  exportOptions = [
    {
      id: 'pdf',
      text: 'As PDF',
      icon: 'exportpdf',
      onClick: () => this.export(),
    },
    {
      id: 'excel',
      text: 'As Excel',
      icon: 'exportxlsx',
      onClick: () => this.exportExcel(),
    },
  ];

  FacilityDataSource: any;
  DepartmentDatasource: any;
  modifiedFacilityDatasource: CustomStore<any, any>;
  facilityvalue: any[] = [];
  DepartmentNewValue: any[] = [];
  DepartmentValue: any[] = [];

  vibleExportBtn: boolean = true;

  DailyFootfallChartDataSource: any;
  HourlyDistributionChartDataSource: any;
  MonthlyInsuranceChartDataSource: any;
  ClinicianwiseChartDataSource: any;
  DepartmentWisedataSource: any;

  colorLegend = [
    { color: '#4089ff', label: '≥ 90' },
    { color: '#b3ba4c', label: '75-89' },
    { color: '#26a69a', label: '60-74' },
    { color: '#a5d6a7', label: '45-59' },
    { color: '#ffb74d', label: '30-44' },
    { color: '#f48fb1', label: '15-29' },
    { color: '#e57373', label: '< 15' },
  ];

  constructor(
    public service: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.get_initial_data();
    }, 500);
  }

  // ================ oncell value changed in datagrid =============
  onCellPrepared(e: any) {
    if (
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(
        e.column?.dataField
      ) &&
      e.rowType === 'data'
    ) {
      e.cellElement.style.backgroundColor = this.getCellColor(e.value);
      e.cellElement.style.color = '#000';
      e.cellElement.style.fontWeight = '600';
      e.cellElement.style.textAlign = 'center';
      e.cellElement.innerText = `${e.value}%`;
    }

    if (e.rowType === 'header') {
      e.cellElement.style.textAlign = 'center';
      // e.cellElement.style.color = '#000';
      // e.cellElement.style.backgroundColor ='#bec4cf'
    }
  }
  // ============ color fetching in datagrid cell =========
  getCellColor(value: number): string {
    if (value >= 90) return '#4089ff'; // Blue (Outstanding)
    if (value >= 75) return '#b3ba4c'; // Bright Blue (Excellent)
    if (value >= 60) return '#26a69a'; // Teal (Good)
    if (value >= 45) return '#a5d6a7'; // Soft Mint Green (Average)
    if (value >= 30) return '#ffb74d'; // Soft Orange (Below Average)
    if (value >= 15) return '#f48fb1'; // Light Pink (Poor)
    return '#e57373'; // Soft Red (Critical)
  }

  //================== Call initial value fetching ==========
  get_initial_data() {
    const storedUserId = sessionStorage.getItem('paramsid');

    if (storedUserId && storedUserId !== 'undefined') {
      this.setUserIdAndFetchData(storedUserId);
    } else {
      this.route.queryParams.subscribe((params: Params) => {
        const queryUserId = params['userId'];
        if (queryUserId && queryUserId !== 'undefined') {
          sessionStorage.setItem('paramsid', queryUserId);
          this.setUserIdAndFetchData(queryUserId);
        } else {
          console.warn('No user data available, redirecting to login.');
          this.loadingVisible = false;
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  private setUserIdAndFetchData(userId: string) {
    this.userId = userId;
    this.getValuesOfInitData();
  }

  //===================== Fetch init dataSource =========================
  getValuesOfInitData() {
    this.loadingVisible = true;

    this.service
      .get_Footfall_Dashboard_InitData(this.userId)
      .subscribe((response: any) => {
        if (response) {
          console.log('init data response ::>>');
          this.DepartmentDatasource = response.Department;
          this.FacilityDataSource = response.Facility;
          this.modifiedFacilityDatasource = this.makeAsyncDataSourceFromJson(
            response.Facility
          );

          this.dateForm = {
            fromdate: response.DateFrom,
            todate: response.DateTo,
          };

          this.facilityvalue = this.FacilityDataSource.filter(
            (item) => item.Default === '1'
          ).map((item) => item.ID);
        }

        this.get_graph_DataSource(1);
      });
  }

  //=========MAking cutom datasource for facility datagrid and dropdown loADING=======
  makeAsyncDataSourceFromJson(jsonData: any) {
    return new CustomStore({
      loadMode: 'raw',
      key: 'ID',
      load: () => {
        return new Promise((resolve, reject) => {
          try {
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  }

  //================== Fetch data of graph datasource ====================
  async get_graph_DataSource(action: number = 1) {
    const startTime = performance.now();
    this.loadingVisible = true;
    this.showGroups = false;

    const { fromdate, todate } = this.dateForm;

    const payloadParams = {
      DateFrom: fromdate,
      DateTo: todate,
      Facility: this.facilityvalue.join(','),
      Department: this.DepartmentNewValue.join(','),
    };

    try {
      // ====== PART 1 - Weekly Data ======
      const response1: any = await firstValueFrom(
        this.service.get_FootFall_PART1_Dashboard_Datasource(payloadParams)
      );

      if (response1.flag === '1') {
        this.DailyFootfallChartDataSource = response1.FootFallWeekday || [];
      } else {
        notify(`${response1.message}`, 'error', 3000);
      }

      // ✅ Hide loader immediately after Part 1 finishes
      this.loadingVisible = false;

      // ====== PART 2 - Hourly & Monthly Data (background load) ======
      firstValueFrom(
        this.service.get_FootFall_PART2_Dashboard_Datasource(payloadParams)
      )
        .then((response2: any) => {
          if (response2.flag === '1') {
            this.HourlyDistributionChartDataSource =
              response2.FootFallHourly || [];
            this.MonthlyInsuranceChartDataSource =
              response2.FootFallMonthly || [];
          } else {
            notify(`${response2.message}`, 'error', 3000);
          }
        })
        .catch((err) => console.error('Part 2 Load Failed:', err));

      // ====== PART 3 - Department & Clinician Data (background load) ======
      firstValueFrom(
        this.service.get_FootFall_PART3_Dashboard_Datasource(payloadParams)
      )
        .then((response3: any) => {
          if (response3.flag === '1') {
            this.DepartmentWisedataSource = response3.FootFallDepartment || [];
            this.ClinicianwiseChartDataSource =
              response3.FootFallClinician || [];
          } else {
            notify(`${response3.message}`, 'error', 3000);
          }
        })
        .catch((err) => console.error('Part 3 Load Failed:', err));

      // ====== Log Activity After All Parts Complete ======
      Promise.all([
        firstValueFrom(
          this.service.get_FootFall_PART2_Dashboard_Datasource(payloadParams)
        ).catch(() => null),
        firstValueFrom(
          this.service.get_FootFall_PART3_Dashboard_Datasource(payloadParams)
        ).catch(() => null),
      ]).then(() => {
        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        this.logDashboardActivity(action, durationInSeconds, payloadParams, 0);
      });
    } catch (err) {
      console.error(err);
      notify('Failed to load dashboard data.', 'error', 3000);
      this.loadingVisible = false;
    }
  }

  // ======= chart initializing ===========
  onChartInitialized(e) {
    this.chartInstance = e.component; // Store reference to the chart
  }

  //=============== Custom Label for Footfall Stacked Bar Chart =============
  MillioncustomizeLabel = (args: any): string => {
    const value = args.value;
    const seriesName = args.seriesName; // "Thiqa" or "Non-Thiqa"
    const data = args.point?.data;

    // ===== Format value =====
    let formattedValue = '';
    if (value >= 1_000_000) {
      formattedValue = `${(value / 1_000_000).toFixed(2)} M`;
    } else if (value >= 1_000) {
      formattedValue = `${(value / 1_000).toFixed(1)} K`;
    } else {
      formattedValue = `${value}`;
    }

    // ===== Append type label (Thiqa / Non-Thiqa) =====
    return `${formattedValue}`;
  };

  //=========== bar chart percentage custom latel ============
  customizePercentageLabel = (args: any): string => {
    const value = args.value;
    const data = args.point?.data;

    if (!data) return '';
    // ===== Calculate total of Thiqa + Non-Thiqa =====
    const total = (data.FootFallThiqua || 0) + (data.FootFallNonThiqua || 0);
    // ===== Compute percentage =====
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
    // ===== Return only percentage text =====
    return `${percentage}%`;
  };

  //=============== Custom Tooltip for Each Series (Clean Version) =============
  barChartcustomizeTooltip = (info: any) => {
    const argumentText = info.argumentText;
    const value = info.value;
    const seriesName = info.seriesName;
    const total = info.total;

    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

    return {
      text: `${argumentText}\n${seriesName}: ${value.toLocaleString()} (${percentage}%)`,
    };
  };

  //=========== clinician chart percentage custom latel ============
  clinicianLabelText = (info: any) => {
    // Show actual number formatted nicely
    return `${info.value.toLocaleString()}`;
  };
  //=============== clinician chart Tooltip =============
  clinicianTooltip = (info: any) => {
    const { argumentText, value } = info;
    return {
      text: `${argumentText}\nThiqa Patients: ${value.toLocaleString()}`,
    };
  };

  //===================Custom label for pie chart ===========
  customizeLabel(arg) {
    return `${arg.point.data.Percentage}%`;
  }
  // ========== DepartmentWisedataSource customize tooltip =========
  customizeTooltip(arg: any) {
    return {
      text: `${arg.seriesName}: ${arg.value}%`,
    };
  }

  //================= hide and show filter div ===============
  toggleGroups(): void {
    this.showGroups = !this.showGroups;
  }

  //===========show filter div by clicking showing div========
  Show_toggle_Groups_By_Div_click(): void {
    this.showGroups = true;
  }

  //===========Function to handle selection change and sort the data==========
  onSelectionChanged(event: any, jsonData: any[], dataSourceKey: string): void {
    console.log('Original JSON Data:', jsonData);
    const selectedRows = event.selectedRowsData;
    const selectedRowIds = selectedRows.map((row) => row.ID);
    const unselectedRows = jsonData.filter(
      (row) => !selectedRowIds.includes(row.ID)
    );
    const reorderedData = [...selectedRows, ...unselectedRows];
    this[dataSourceKey] = this.makeAsyncDataSourceFromJson(reorderedData);
    console.log('Updated DataSource:', this[dataSourceKey]);
    this.dataGrid.instance.refresh();
  }

  //========= department showing and value prepared ========
  onMultiTagDepartmentPreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.DepartmentDatasource.length;

    if (selectedItemsLength < totalCount) {
      this.DepartmentNewValue = this.DepartmentValue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.DepartmentNewValue = [];
    }
  }

  //===================== Apply Button Clicked ========================
  applyButtonClicked() {
    this.get_graph_DataSource(8); // Refreshed
  }

  // ======================== X-Axis value rotated and value custom==============
  formatXAxisText = (axisInfo: any): string => {
    const text = axisInfo.value;
    const parts = text.split(' ');
    const middleIndex = Math.ceil(parts.length / 2);
    const firstLine = parts.slice(0, middleIndex).join(' ');
    const secondLine = parts.slice(middleIndex).join(' ');
    return `${firstLine}\n${secondLine}`;
  };

  //================== Log dashboard activity ==================
  logDashboardActivity(
    action: number,
    duration: string,
    payloadParams: any,
    exportFlag: number = 0
  ) {
    const sessionID = sessionStorage.getItem('SessionID');

    const activityLogPayload: any = {
      sessionid: sessionID,
      action,
      dashboard: 'Footfall Dashboard',
      duration: duration,
      export: exportFlag,
      FinanceParameter: payloadParams,
    };

    this.service.dashboard_activity_LogData(activityLogPayload).subscribe({
      next: () => console.log('Activity log saved with action:', action),
      error: (err) => console.error('Failed to save activity log', err),
    });
  }

  //=================== PDF Export Function ====================
  export() {
    this.exportLoadingVisible = true;
    const exportDiv1 = document.querySelector('.ExportDiv1') as HTMLElement;
    const exportDiv2 = document.querySelector('.ExportDiv2') as HTMLElement;
    const exportDiv3 = document.querySelector('.ExportDiv3') as HTMLElement;
    const exportDiv4 = document.querySelector('.ExportDiv4') as HTMLElement;
    const exportDiv5 = document.querySelector('.ExportDiv5') as HTMLElement;
    const exportDiv6 = document.querySelector('.ExportDiv6') as HTMLElement;
    const reportName = 'Footfall Dashboard';
    const start = performance.now();
    this.service
      .exportGraphData(reportName, [
        exportDiv1,
        exportDiv2,
        exportDiv3,
        exportDiv4,
        exportDiv5,
        exportDiv6,
      ])
      .then(() => {
        this.exportLoadingVisible = false;
        const end = performance.now();
        const duration = ((end - start) / 1000).toFixed(2);
        const payloadParams = {
          dateFrom: this.dateForm.fromdate,
          dateTo: this.dateForm.todate,
          facility: this.facilityvalue.join(','),
          department: this.DepartmentNewValue.join(','),
        };
        this.logDashboardActivity(8, duration, payloadParams, 1); // Closed + Export
      })
      .catch((error) => {
        this.exportLoadingVisible = false;
        console.error('Export failed:', error);
      });
  }

  //================== Excel Export Function ==================
  exportExcel() {
    this.showGroups = false;
    this.exportLoadingVisible = true;
    const { fromdate, todate } = this.dateForm;
    const payload = {
      DateFrom: fromdate,
      DateTo: todate,
      Facility: this.facilityvalue.join(','),
      Department: this.DepartmentNewValue.join(','),
    };
    this.service
      .get_Footfall_Dashboard_Export_Data(payload)
      .subscribe((response: any) => {
        this.exportLoadingVisible = false;
        if (response && response.FootFallData) {
          this.service.PriorexportToExcel(
            response.FootFallData,
            'ExportedFootfallDashboardData',
            'FootFallData'
          );
          const payloadParams = {
            dateFrom: fromdate,
            dateTo: todate,
            facility: this.facilityvalue.join(','),
            department: this.DepartmentNewValue.join(','),
          };
          const duration = '0'; // Optional: Calculate duration if needed
          this.logDashboardActivity(8, duration, payloadParams, 1); // Closed + Export
        } else {
          notify(`${response.message}`, 'error', 3000);
        }
      });
  }
}
@NgModule({
  imports: [
    CommonModule,
    DxLoadIndicatorModule,
    DxFunnelModule,
    DxButtonModule,
    DxDropDownButtonModule,
    DxTabsModule,
    DxTextBoxModule,
    DxToolbarModule,
    BrowserModule,
    DxLookupModule,
    DxDateBoxModule,
    DxTreeViewModule,
    DxFormModule,
    DxDropDownBoxModule,
    DxSelectBoxModule,
    DxChartModule,
    DxPieChartModule,
    DxTagBoxModule,
    DxLoadPanelModule,
    DxDataGridModule,
    DxTemplateModule,
    FormsModule,
    DxPopupModule,
  ],
  declarations: [FootfallDashboardComponent],
  exports: [FootfallDashboardComponent],
})
export class FootfallDashboardModule {}
