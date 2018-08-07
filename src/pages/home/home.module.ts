import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { MapPage } from './map/map';
import { DevicePage } from './device/device';
import { UserInfoPage } from './user-info/user-info';
import { TreeDetailPage } from '../tree-detail/tree-detail';
import { UserInfoEditPage } from './user-info-edit/user-info-edit';
import { StatisticOfHomePage } from  './statistic-of-home/statistic-of-home';
import { AccordionlistComponentModule } from '../../components/accordionlist/accordionlist.module';
import { AppTreeComponentModule } from '../../components/app-tree/app-tree.module';
import { PopoverPage} from './popover/popover';
import { PhoneNumberPipe} from '../../pipes/phone-number/phone-number'
@NgModule({


  declarations: [
    HomePage, MapPage, TreeDetailPage, DevicePage, StatisticOfHomePage ,UserInfoPage, UserInfoEditPage,PopoverPage,PhoneNumberPipe,
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
      AccordionlistComponentModule,
      AppTreeComponentModule,
  ],
  exports: [
    HomePage
  ],
    entryComponents:[
        MapPage, DevicePage, TreeDetailPage, UserInfoPage, UserInfoEditPage, StatisticOfHomePage,PopoverPage,
    ],

})
export class HomePageModule {}
