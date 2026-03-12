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
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  DxLoadIndicatorModule,
  DxFunnelModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxTabsModule,
  DxTextBoxModule,
  DxToolbarModule,
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
  DxDataGridComponent,
  DxTreeViewComponent,
  DxPopupModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import { trigger, transition, style, animate } from '@angular/animations';
import { DxTagBoxTypes } from 'devextreme-angular/ui/tag-box';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-ceo-dashboard-page',
  templateUrl: './ceo-dashboard-page.component.html',
  styleUrls: ['./ceo-dashboard-page.component.scss'],
  providers: [DataService],
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
export class CeoDashboardPageComponent implements OnInit {
  @ViewChild('insuranceTagBox', { static: false }) insuranceTagBox: any;

  @ViewChild(DxTreeViewComponent, { static: false })
  treeView: DxTreeViewComponent;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  @HostListener('window:resize')
  onResize() {
    this.chartSize = { width: window.innerWidth * 0.008 };

    if (this.chartInstance) {
      this.chartInstance.option('size', { width: this.chartSize.width });
    }
  }
  chartSize = { width: window.innerWidth * 0.44 };

  pipe = new PercentPipe('en-US');
  insurancePopupVisible = false;
  loadingVisible: boolean = false;
  exportLoadingVisible: boolean = false;
  vibleExportBtn: boolean = true;
  searchOnvalue: any = '';
  facilityvalue: any[] = [];
  FacilityDataSource: any;

  EncountrTypeDatasource: any;
  DenailCategoryDatasource: any;
  denialcategoryvalue: any[] = [];
  encountertypevalue: any[] = [];
  encountertypeNewvalue: any[] = [];
  DateFrom: any = new Date();
  DateTo: any = new Date();
  RejectionIndexDatasource: any;
  rejectionIndexvalue: any;
  blockDataSource: any;
  blockValue: any[] = [];
  blockNewValue: any[] = [];
  regionDataSource: any;
  RegionValue: any[] = [];
  ProviderTypeDatasource: any;
  ProviderTypevalue: any[] = [];
  insuranceDataSource: any;
  insuranceValue: any[] = [];
  insuranceNewValue: any[] = [];
  departmentDataSource: any;
  departmentValue: any[] = [];
  departmentNewValue: any[] = [];
  showGroups: boolean = true;

  //=================card data variables=====================
  ClaimsmrydataObj: any;
  claimData: any;
  //====================Variables for card data=================
  ClaimAmount: any = 0;
  claimPrcnt: any = 100;
  remittedAmt: any = 0;
  remittedPercnt: any = 0;
  paidAmt: any = 0;
  paidPrcnt: any = 0;
  deniedAmt: any = 0;
  deniedPrcnt: any = 0;
  balanceAmt: any = 0;
  balancePrcnt: any = 0;

  remittancePrcnt: any = 0;
  rejectionPrcnt: any = 0;
  userId: any;

  // =======================Demo Chart DataSources===================
  RemittanceRejectionPercentDatasource: any;
  CaseTypeRejectionDataSource: any;
  DenialGroupdataSource: any;
  DenialCategoryRejectionDataSource: any;
  BlockWiseRejectionDataSource: any;
  RejectionAccountabilityDataSource: any;
  ToptenInsuranceRejectedDataSource: any;
  TopTenFacilityRejectedDataSource: any;
  TopTenCodeRejectedDataSource: any;
  TopTenDepartmentWiseRejectedDataSource: any;
  TopTenDoctorWiseRejectedDataSource: any;
  modifiedFacilityDatasource: any;
  dateForm = {
    fromdate: '',
    todate: '',
  };

  InsuranceSubmissionRevenueMOMDatasource: any;

  InsuranceSubmissionRevenueCumulativeProgressDatasource: any;

  CaseMixIndexDatasource: any;

  IPVolume: any;

  CaseTypeWiseRatioDatasource: any;

  DailyFootFallDatasource: any;
  OPFootFallBasedDatasource: any;

  ERFootFallBasedDatasource: any;

  topPerformingDoctorDataSource: any;

  topPerformingDepartmentDataSource: any;

  topFootFallDepartmentDataSource: any;

  isloggedIn: any;
  ParamsUserId: any;
  chartInstance: any;

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

  displayMode: any = 'full';

  insuranceDataSource1: any;
  insuranceSelectedItems: any[] = [];
  customMultiTagText: string = '';

  constructor(
    public service: DataService,
    private dataservice: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const dashboardID = '7';
    const parameter = 'Payer';

    this.insuranceDataSource1 = new DataSource<any>({
      load: () =>
        new Promise((resolve, reject) => {
          this.service.get_Parameter_List(dashboardID, parameter).subscribe({
            next: (response: any) => {
              const allPayers = response?.Parameters ?? [];
              const sorted = this.sortInsuranceDataSource(allPayers);
              resolve(sorted);
            },
            error: (error) => reject(error.message),
          });
        }),
    });
  }

  onInsuranceSelectionChanged(e: any) {
    console.log(e);
    this.insuranceSelectedItems = e.selectedRowsData;
    this.insuranceValue = e.selectedRowKeys;
    this.insuranceNewValue = this.insuranceValue.map((item: any) => item.ID);
  }

  onInsuranceDropdownOpened() {
    this.insurancePopupVisible = true;
  }
  handleInsuranceClick(event: MouseEvent) {
    // Prevent the dropdown from opening
    event.preventDefault();
    event.stopPropagation();
    this.openInsurancePopup();
  }

  private sortInsuranceDataSource(allPayers: any[]) {
    const selectedIds = this.insuranceValue?.map((item: any) => item.ID) || [];
    const selectedSet = new Set(selectedIds);

    return [
      // Selected payers first
      ...(this.insuranceValue || []),
      // Remaining payers
      ...allPayers.filter((item: any) => !selectedSet.has(item.ID)),
    ];
  }

  getInsuranceTooltip(): string {
    if (
      !this.insuranceSelectedItems ||
      this.insuranceSelectedItems.length === 0
    ) {
      return '';
    }

    return this.insuranceSelectedItems.map((item: any) => item.Name).join(', ');
  }

  onInsuranceValueChanged(e: any) {
    const selectedIDs = e.value || [];

    //Update the selected items based on selected IDs
    this.insuranceValue = this.insuranceSelectedItems.filter((item: any) =>
      selectedIDs.includes(item.ID)
    );

    this.insuranceNewValue = selectedIDs;
  }

  openInsurancePopup() {
    this.insurancePopupVisible = true;
  }

  onChartInitialized(e) {
    this.chartInstance = e.component; // Store reference to the chart
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.get_initial_data();
    }, 500);
  }

  onMultiTagBlockPreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    console.log(selectedItemsLength, 'selectedItemsLength');
    const totalCount = this.BlockWiseRejectionDataSource.length;
    console.log(totalCount, 'total count');

    if (selectedItemsLength < totalCount) {
      this.blockNewValue = this.blockValue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.blockNewValue = [];
    }
  }

  onMultiTagDepartmentPreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    console.log(selectedItemsLength, 'selectedItemsLength');
    const totalCount = this.departmentDataSource.length;
    console.log(totalCount, 'total count');

    if (selectedItemsLength < totalCount) {
      this.departmentNewValue = this.departmentValue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.departmentNewValue = [];
    }
  }

  onMultiTagInsurancePreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    console.log(selectedItemsLength, 'selectedItemsLength');
    const totalCount = this.insuranceDataSource.length;
    console.log(totalCount, 'total count');

    if (selectedItemsLength < totalCount) {
      this.insuranceNewValue = this.insuranceValue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.insuranceNewValue = [];
    }
  }

  //===========show filter div by clicking showing div========
  Show_toggle_Groups_By_Div_click(): void {
    this.showGroups = true;
  }

  //=========== reorder list options to selected data to the top side ========
  reorderDataSource(selectedvalues: string, datsourceName: string) {
    // Filter the selected items
    const selectedItems = this[datsourceName].filter((item) =>
      this[selectedvalues].includes(item.ID)
    );
    const nonSelectedItems = this[datsourceName].filter(
      (item) => !this[selectedvalues].includes(item.ID)
    );

    // Store only the selected IDs in the correct `*Newvalue`
    switch (selectedvalues) {
      case 'departmentValue':
        this.departmentNewValue = selectedItems.map((item) => item.ID);
        break;
    }

    nonSelectedItems.sort((a, b) => a.Name.localeCompare(b.Name));
    this[datsourceName] = [...selectedItems, ...nonSelectedItems];
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

  // ======================== X-Axis value rotated and value custom==============
  formatXAxisText = (axisInfo: any): string => {
    let text = axisInfo.value;
    if (text.length < 10) {
      text = text.padEnd(10, ' ');
    }
    const parts = text.split(' ');
    const middleIndex = Math.ceil(parts.length / 2);
    const firstLine = parts.slice(0, middleIndex).join(' ');
    const secondLine = parts.slice(middleIndex).join(' ');

    return `${firstLine}\n${secondLine}`;
  };

  //===================Custom label for pie chart ===========
  customizeLabel = (pointInfo: any) => {
    return `${pointInfo.valueText}%`;
  };
  
  PieChartcustomizeLabel(arg) {
    const value = arg.valueText;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M (${arg.percentText})`;
    } else {
      return `${(value / 1000).toFixed(2)}K (${arg.percentText})`;
    }
  }

  //=======Custom label for Million Values of chart ========
  MillioncustomizeLabel(pointInfo: any) {
    const value = pointInfo.value;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} M`;
    } else if (value > 0) {
      return `${(value / 1000).toFixed(2)} K`;
    }
    return `${value}`; // Show as is if less than 1000
  }

  customizeTooltip = ({
    valueText,
    percent,
  }: {
    valueText: string;
    percent: number;
  }) => ({
    text: `${valueText} - ${this.pipe.transform(percent, '1.2-2')}`,
  });

  //================== custom tooltip =====================
  customizeChartToolTip = (args: any) => {
    return {
      text: `${this.customizeLabelText(args)}`,
    };
  };

  customizeLabelText(pointInfo: any) {
    const value = pointInfo.value;

    if (value === 0) {
      return ''; // Skip label for zero value
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} M`;
    } else if (value > 0) {
      return `${(value / 1000).toFixed(2)} K`;
    }
    return `${value}`; // Show as is if less than 1000
  }
  //================== custom tooltip =====================
  TotalcustomizeChartToolTip = (info: any) => {
    const total = Object.entries(info.point.data)
      .filter(([key, _]) => key !== 'MonthName')
      .reduce((sum, [_, value]) => sum + Number(value), 0);

    let formattedTotal = '';
    if (total >= 1_000_000) {
      formattedTotal = `${(total / 1_000_000).toFixed(2)} M`;
    } else if (total >= 1_000) {
      formattedTotal = `${(total / 1_000).toFixed(2)} K`;
    } else {
      formattedTotal = total.toFixed(2);
    }

    return {
      text: `Total: ${formattedTotal}`,
    };
  };
  //========= day wise total value tooltip ===========
  TotalcustomizeChartToolTipDayWise = (info: any) => {
    const total = Object.entries(info.point.data)
      .filter(([key, _]) => key !== 'Date')
      .reduce((sum, [_, value]) => sum + Number(value), 0);

    let formattedTotal = '';
    if (total >= 1_000_000) {
      formattedTotal = `${(total / 1_000_000).toFixed(2)} M`;
    } else if (total >= 1_000) {
      formattedTotal = `${(total / 1_000).toFixed(2)} K`;
    } else {
      formattedTotal = total.toFixed(2);
    }

    return {
      text: `Total: ${formattedTotal}`,
    };
  };

  //======================top 10 insurance tooltip===================
  DailyFootFallCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.MonthName}`,
    };
  }
  //======================top 10 facility tooltip===================
  OPFootFallBasedCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Time}`,
    };
  }
  //======================top 10 code tooltip===================
  ERFootFallBasedCustomizeTooltip(arg: any) {
    console.log('arg data', arg);
    return {
      text: `${arg.point.data.Time}`,
    };
  }

  //======================top Performing Doctor tooltip===================
  topPerformingDoctorCustomizeTooltip(arg: any) {
    console.log('arg data', arg);
    return {
      text: `${arg.point.data.ClinicianName}`,
    };
  }

  //======================top 10 clinician tooltip===================
  topPerformingDepartmentCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Department}`,
    };
  }
  //======================Denial Category tooltip===================
  topFootFallDepartmentCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Department}`,
    };
  }

  toggleGroups(): void {
    this.showGroups = !this.showGroups;
  }

  customTagTemplate = (itemData: any) => {
    return `<span>${itemData.Name}</span>`;
  };

  customizeArgumentDateLabel(arg) {
    const date = new Date(arg.value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "May 1"
  }

  //==================MAking cutom datasource for facility datagrid and dropdown loADING=======
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

  //===============Format the date fetch from date picker of ui ==================
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().substr(-4);
    return `${year}/${month}/${day}`;
  }

  // Refactored CEO Dashboard code to match Finance Dashboard structure without changing logic or variable names

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
      .get_Ceo_Dashboard_InitData(this.userId)
      .subscribe((response: any) => {
        if (response) {
          this.EncountrTypeDatasource = response.EncounterType;
          this.RejectionIndexDatasource = response.RejectionIndex;
          this.DenailCategoryDatasource = response.DenialCategory;
          this.blockDataSource = response.Block;
          this.insuranceDataSource = response.Insurance;
          this.departmentDataSource = response.Department;
          this.FacilityDataSource = response.Facility;
          this.modifiedFacilityDatasource = this.makeAsyncDataSourceFromJson(
            response.Facility
          );

          this.dateForm.fromdate = response.DateFrom;
          this.dateForm.todate = response.DateTo;

          this.facilityvalue = this.FacilityDataSource.filter(
            (item) => item.Default === '1'
          ).map((item) => item.ID);
          this.insuranceValue = this.insuranceDataSource
            .filter((item) => item.Default === '1')
            .map((item) => item.ID);
          this.departmentValue = this.departmentDataSource
            .filter((item) => item.Default === '1')
            .map((item) => item.ID);
        }
        this.get_graph_DataSource(1, 0); // Opened
      });
  }

  //================== Fetch data of graph datasource ====================
  get_graph_DataSource(action: number = 8, exportFlag: number = 0) {
    this.showGroups = false;
    this.loadingVisible = true;

    const start = performance.now();

    this.DateFrom = this.dateForm.fromdate;
    this.DateTo = this.dateForm.todate;

    const ceoParam = {
      DateFrom: this.DateFrom,
      DateTo: this.DateTo,
      EncounterType: this.encountertypeNewvalue.join(','),
      Facility: this.facilityvalue.join(','),
      Insurance: this.insuranceNewValue.join(','),
      Department: this.departmentNewValue.join(','),
    };

    this.dataservice
      .get_Ceo_Home_Dashboard_Datasource(
        ceoParam.DateFrom,
        ceoParam.DateTo,
        ceoParam.EncounterType,
        ceoParam.Facility,
        ceoParam.Insurance,
        ceoParam.Department
      )
      .subscribe((response: any) => {
        if (response.flag === '1') {
          this.InsuranceSubmissionRevenueMOMDatasource = response.RevenueMonth;
          this.InsuranceSubmissionRevenueCumulativeProgressDatasource =
            response.RevenueDay;
          this.CaseMixIndexDatasource = response.CaseMixIndex;
          this.CaseTypeWiseRatioDatasource = response.CaseTypeWiseRatio;
          this.IPVolume = response.IPVolume;

          this.dataservice
            .get_Ceo_Home_Dashboard_Datasource_part2(
              ceoParam.DateFrom,
              ceoParam.DateTo,
              ceoParam.EncounterType,
              ceoParam.Facility,
              ceoParam.Insurance,
              ceoParam.Department
            )
            .subscribe((response: any) => {
              this.loadingVisible = false;
              if (response.flag === '1') {
                this.DailyFootFallDatasource = response.MonthFootFall;
                this.OPFootFallBasedDatasource = response.TimeFootFallOP;
                this.ERFootFallBasedDatasource = response.TimeFootFallER;
                this.topPerformingDoctorDataSource = response.ClinicianRevenue;
                this.topPerformingDepartmentDataSource =
                  response.DepartmentRevenue;
                this.topFootFallDepartmentDataSource =
                  response.DepartmentFootFall;
              }

              const duration = ((performance.now() - start) / 1000).toFixed(2);
              this.logDashboardActivity(action, duration, ceoParam, exportFlag);
            });
        } else {
          this.loadingVisible = false;
          notify(`${response.message}`, 'error', 3000);
        }
      });
  }

  //================== Log dashboard activity ==================
  logDashboardActivity(
    action: number,
    duration: string,
    ceoParam: any,
    exportFlag: number = 0
  ) {
    const sessionID = sessionStorage.getItem('SessionID');
    const payload = {
      sessionid: sessionID,
      action,
      dashboard: 'CEO Dashboard',
      duration,
      export: exportFlag,
      CEOParameter: ceoParam,
    };
    this.service.dashboard_activity_LogData(payload).subscribe();
  }

  //===================== Apply Button Clicked ========================
  applyButtonClicked() {
    this.get_graph_DataSource(8, 0); // Refreshed
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
    const exportDiv7 = document.querySelector('.ExportDiv7') as HTMLElement;
    const reportName = 'CEO Dashboard';
    const start = performance.now();

    this.service
      .exportGraphData(reportName, [
        exportDiv1,
        exportDiv2,
        exportDiv3,
        exportDiv4,
        exportDiv5,
        exportDiv6,
        exportDiv7,
      ])
      .then(() => {
        const duration = ((performance.now() - start) / 1000).toFixed(2);
        const ceoParam = {
          DateFrom: this.DateFrom,
          DateTo: this.DateTo,
          EncounterType: this.encountertypeNewvalue.join(','),
          Facility: this.facilityvalue.join(','),
          Insurance: this.insuranceNewValue.join(','),
          Department: this.departmentNewValue.join(','),
        };
        this.logDashboardActivity(8, duration, ceoParam, 1);
        this.exportLoadingVisible = false;
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
    const start = performance.now();

    const ceoParam = {
      DateFrom: this.dateForm.fromdate,
      DateTo: this.dateForm.todate,
      EncounterType: this.encountertypeNewvalue.join(','),
      Block: this.blockNewValue.join(','),
      Facility: this.facilityvalue.join(','),
      Insurance: this.insuranceNewValue.join(','),
      Department: this.departmentNewValue.join(','),
    };

    this.service
      .get_Revenue_Dashboard_Export_Data(
        this.searchOnvalue,
        ceoParam.DateFrom,
        ceoParam.DateTo,
        this.rejectionIndexvalue,
        ceoParam.EncounterType,
        ceoParam.Block,
        ceoParam.Facility,
        ceoParam.Insurance,
        ceoParam.Department
      )
      .subscribe((response: any) => {
        this.exportLoadingVisible = false;

        if (response && response.data) {
          this.service.PriorexportToExcel(
            response.data,
            'ExportedCEODashboardData',
            'data'
          );
          const duration = ((performance.now() - start) / 1000).toFixed(2);
          this.logDashboardActivity(8, duration, ceoParam, 1);
        } else {
          notify(`${response.message}`, 'error', 3000);
        }
      });
  }

  onExportClick(e: any) {}
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
    FormsModule,
    DxPopupModule,
  ],
  declarations: [CeoDashboardPageComponent],
  exports: [CeoDashboardPageComponent],
})
export class CeoDashboardPageModule {}
