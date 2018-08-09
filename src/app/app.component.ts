import { Component, ViewChild} from '@angular/core';
import { Platform, MenuController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { UserInfo } from '../model/UserInfo';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { HelpPage } from  '../pages/menu/help/help';
import { AboutPage } from  '../pages/menu/about/about';
import { UserInfoPage } from '../pages/home/user-info/user-info'
import { TaskPage } from '../pages/task/task'
import { Http, RequestOptions, Headers} from '@angular/http';
import { HomePage } from '../pages/home/home';
// import { AboutPage } from '../pages/about/about';
import { HttpService } from '../providers/http-service/http-service';
import { AccountService } from '../providers/account-service/account-service';
import { Md5 } from 'ts-md5/dist/md5';
@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  @ViewChild('content') nav;
  rootPage:any = LoginPage;
    UserRealName:string="默认用户";
    userInfo:UserInfo;
  accountId:number;

  constructor(platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              public http: Http,
              public httpService: HttpService,
              public accountService: AccountService,
              private storage: Storage,
              private menuCtrl: MenuController ) {
    // console.log(Md5.hashStr("111111{admin}"));
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.backgroundColorByHexString("33A1C9");
      splashScreen.hide();
      this.checkPreviousAuthorization();
    });
  }

    checkPreviousAuthorization(): void {

        this.storage.get('username').then((username) =>{
            this.storage.get('password').then((password) =>{

                if(username === null || username === "undefined" || password === null || password === "undefined" ){
                    this.rootPage = LoginPage;
                }else{

                    let url = this.httpService.getUrl() + "//mainOfApp.do";
                    password = Md5.hashStr(password).toString();
                    let body= "name="+username+"&password="+password;
                    let headers = new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                    });
                    let options = new RequestOptions({
                        headers: headers
                    });
                    this.http.post(url,body,options).map(res =>res.json()).subscribe(data => {
                                console.log(data);
                                this.accountService.setAccount(data);
                                this.rootPage = TabsPage;
                            this.accountId=(this.accountService.getAccount() as any).accountId;
                            this.storageUserInfo(this.accountId);

                            },
                            err =>{
                            });


                }
            });
        });
    }

    logout() {
        // this.navCtrl.push(LoginPage);
        this.storage.remove('username');
        this.storage.remove('password');
        this.nav.setRoot(LoginPage);
        this.menuCtrl.close();

    }

    poweredBy() {
        // let url = 'https://darksky.net/poweredby/';
        // this.browserTab.isAvailable()
        //     .then((isAvailable: boolean) => {
        //         if (isAvailable) {
        //             this.browserTab.openUrl(url);
        //         }
        //     })
        //     .catch(err => console.error(err));
    }

    gotoPageAbout() {
        this.nav.push(AboutPage);
    }
    gotoPageTask () {
        this.nav.push(TaskPage);

    }
    gotoPageChangePassword() {
        this.nav.push(HelpPage);

    }

    gotoPageUserinfo(){
      this.nav.push(UserInfoPage);
    }


    getUserInfoByAccountId(accountID) {
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let options = new RequestOptions({
            headers: headers
        });
        let body = "accountID=" + accountID;
        let url = this.httpService.getUrl() + "/getAccount.do";
        return new Promise((resolve, reject) => {
            this.http.post(url, body, options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, err => {
                    reject(err);
                });
        });
    }

    storageUserInfo(accountID)
    {
        this.getUserInfoByAccountId(accountID).then(data=>{
            this.accountService.setUserInfo(data);
            this.userInfo=this.accountService.getUserInfo() as any;
            this.UserRealName=this.userInfo['realName'];
        })
    }


}
