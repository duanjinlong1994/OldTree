import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { MenuPageModule } from '../pages/menu/menu.module';
import { LoginPageModule } from '../pages/login/login.module';
import { TabsPageModule } from '../pages/tabs/tabs.module';
import { HomePageModule } from '../pages/home/home.module';
import { AttentionPageModule } from '../pages/attention/attention.module';
import { StatisticPageModule } from '../pages/statistic/statistic.module';
import { UploadPageModule } from '../pages/upload/upload.module';
import { TaskPageModule } from '../pages/task/task.module';
import { NameLengthPipe } from '../pipes/name-length/name-length';
// import { ChartModule } from 'angular2-highcharts';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {AppVersion} from '@ionic-native/app-version';
import {Camera} from '@ionic-native/camera';
import {Geolocation} from '@ionic-native/geolocation';
import {Toast} from '@ionic-native/toast';
import {File} from '@ionic-native/file';
import {Transfer} from '@ionic-native/transfer';
import {Network} from '@ionic-native/network';
import { IonicStorageModule } from '@ionic/storage';
import { NativeService } from '../providers/native-service/native-service';
import { HttpService } from '../providers/http-service/http-service';
import { HttpModule } from '@angular/http';
import { HTTP } from '@ionic-native/http';
import { AccountService } from '../providers/account-service/account-service';
import { PaginationComponentModule } from '../components/pagination/pagination.module';
import { PopoverPageModule } from '../pages/home/popover/popover.module';


@NgModule({
  declarations: [
    MyApp,
    NameLengthPipe,
  ],
  imports: [
      // ChartModule,
      IonicStorageModule.forRoot(),
      BrowserModule,
      IonicModule.forRoot(MyApp,{
      backButtonText:'',
      }),
      LoginPageModule,
      MenuPageModule,
      TabsPageModule,
      PopoverPageModule,
      HomePageModule,
      AttentionPageModule,
      UploadPageModule,
      StatisticPageModule,
      TaskPageModule,
      HttpModule,
      PaginationComponentModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
      MyApp
  ],
  providers: [
      StatusBar,
      SplashScreen,
      AppVersion,
      Camera,
      Geolocation,
      Toast,
      File,
      HTTP,
      Transfer,
      Network,
      StatusBar,
      SplashScreen,
      {provide: ErrorHandler, useClass: IonicErrorHandler},
      NativeService,
      HttpService,
      AccountService
  ]
})
export class AppModule {}
