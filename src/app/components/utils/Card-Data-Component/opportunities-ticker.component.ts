import { Component, NgModule, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TickerCardModule } from 'src/app/components/library/ticker-card/ticker-card.component';
import { DataService } from 'src/app/services';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
@Component({
  selector: 'opportunities-ticker',
  templateUrl: 'opportunities-ticker.component.html',
  styleUrls: ['./opportunities-ticker.component.scss'],
})
export class OpportunitiesTickerComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  ClaimsmrydataObj: any;
  claimData: any;
  //====================Variables for card data=================
  ClaimAmount: any = 0;
  claimPrcnt: number = 0;
  remittedAmt: any = 0;
  remittedPercnt: number = 0;
  paidAmt: any = 0;
  paidPrcnt: number = 0;
  deniedAmt: any = 0;
  deniedPrcnt: number = 0;
  balanceAmt: any = 0;
  balancePrcnt: number = 0;

  constructor(
    public service: DataService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    // Subscribe to initDataLoaded$
    this.subscription = this.sharedService.initDataLoaded$.subscribe(
      (isLoaded) => {
        if (isLoaded) {
          this.handleInitDataLoaded();
        }
      }
    );
    // Separate subscription to reloadComponents$
    this.subscription.add(
      this.sharedService.reloadComponents$.subscribe(() => {
        this.fetch_Card_data();
      })
    );
  }
  // Cleanup on component destroy
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.sharedService.setFinanceHomeLoaded(false);
  }
  // Handle the logic for initDataLoaded
  handleInitDataLoaded() {
    this.fetch_Card_data();
  }

  //==============Fetching Data For Cards=========================
  fetch_Card_data = () => {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    var SearchOn_Value = selectedValuesString.searchOn;
    var facility_VAlue = selectedValuesString.facility;
    var encounterType_Value = selectedValuesString.encounterType;
    var fromdate = selectedValuesString.DateFrom;
    var todate = selectedValuesString.DateTo;
    this.service
      .getClaimSummary(
        SearchOn_Value,
        facility_VAlue,
        encounterType_Value,
        fromdate,
        todate
      )
      .subscribe((response: any) => {
        this.ClaimsmrydataObj = response;
        this.claimData = this.ClaimsmrydataObj.data;
        //=======Assign needed value to variables=====
        this.ClaimAmount =
          (this.claimData.ClaimedAmount / 1000000)
            .toFixed(1)
            .replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' M';
        this.claimPrcnt = 100;
        this.remittedAmt =
          (this.claimData.RemittedAmount / 1000000)
            .toFixed(1)
            .replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' M';
        this.remittedPercnt = parseFloat(this.claimData.RemittedPercent);
        this.paidAmt =
          (this.claimData.PaidAmount / 1000000)
            .toFixed(1)
            .replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' M';
        this.paidPrcnt = parseFloat(this.claimData.PaidPercent);
        this.deniedAmt =
          (this.claimData.RejectedAmount / 1000000)
            .toFixed(1)
            .replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' M';
        this.deniedPrcnt = parseFloat(this.claimData.RejectedPercent);
        this.balanceAmt =
          (this.claimData.BalanceAmount / 1000000)
            .toFixed(1)
            .replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' M';
        this.balancePrcnt = parseFloat(this.claimData.BalancePercent);
      });
  };
}

@NgModule({
  imports: [CommonModule, TickerCardModule],
  declarations: [OpportunitiesTickerComponent],
  exports: [OpportunitiesTickerComponent],
})
export class OpportunitiesTickerModule {}
