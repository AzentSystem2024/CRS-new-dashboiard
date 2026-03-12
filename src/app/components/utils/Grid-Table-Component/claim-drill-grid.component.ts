import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services';
import { BrowserModule } from '@angular/platform-browser';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { DxLoadPanelModule } from 'devextreme-angular';
import { DxLoadIndicatorModule } from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular';
import jsPDF from 'jspdf';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { Location } from '@angular/common';

@Component({
  selector: 'app-claim-drill-grid',
  templateUrl: './claim-drill-grid.component.html',
  styleUrls: ['./claim-drill-grid.component.scss'],
})
export class ClaimDrillGridComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  clickedData: any;
  GridSource: any;
  isLoaded = true;
  columns = [];
  paramsData: any;
  constructor(
    private route: ActivatedRoute,
    private service: DataService,
    private router: Router,
    private location:Location
  ) {}
  ngOnInit(): void {
    this.dataLoading();
  }

  //==============Fetch Grid DataSource================
  dataLoading() {
    this.clickedData = JSON.parse(
      sessionStorage.getItem('drillDownClickedItem')
    );
    this.paramsData = JSON.parse(sessionStorage.getItem('selectedValues'));
    // console.log("params :",this.paramsData,this.clickedData)

    const secondKey = JSON.parse(sessionStorage.getItem('clickedchart'));
    if (secondKey == 'receiver') {
      let data = this.clickedData.ReceiverName;
      // console.log('receiver name is :', data);
      this.service
        .get_DrillDown_Data_Grid_Receiver(data, this.paramsData)
        .subscribe((response: any) => {
          this.GridSource = response.Claims;
          if (this.GridSource != '') {
            this.columns = Object.keys(this.GridSource[0]);
            this.isLoaded = false;
          }
        });
    } else if (secondKey == 'clinician') {
      let data = this.clickedData.ClinicianName;
      // console.log('receiver name is :', data);
      this.service
        .get_DrillDown_Data_Grid_Clinician(data, this.paramsData)
        .subscribe((response: any) => {
          this.GridSource = response.Claims;
          this.columns = Object.keys(this.GridSource[0]);
          if (this.GridSource != 'null') {
            this.isLoaded = false;
          }
        });
    } else {
      alert('you are clicked wrong data');
      this.router.navigateByUrl('./Home');
    }
  }
  //===========Go to previous page===============
  BackToPreviousPage=()=>{
    this.location.back()
  }
  //================Data grid refresh============
  refresh = () => {
    this.dataGrid.instance.refresh();
  };
  applyFilter() {
    this.GridSource.filter();
  }
  //=============Export data======================
  onExporting(e) {
    if (e.format === 'pdf') {
      const doc = new jsPDF();
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: e.component,
      }).then(() => {
        doc.save('ClaimSummary.pdf');
      });
    } else {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('ClaimSummary');
      exportDataGridToXLSX({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(
            new Blob([buffer], { type: 'application/octet-stream' }),
            'ClaimSummary.xlsx'
          );
        });
      });
      e.cancel = true;
    }
  }
  //=========================================
}
@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxLoadPanelModule,
    DxButtonModule,
    CommonModule,
    DxLoadIndicatorModule,
  ],
  declarations: [ClaimDrillGridComponent],
})
export class ClaimDrillGridModule {}
