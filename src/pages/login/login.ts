import { Component, ElementRef, ViewChild, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { Storage} from '@ionic/storage';
import { TabsPage } from '../../pages/tabs/tabs';
import { UserInfo } from '../../model/UserInfo';
import { SetServerIpPage } from './set-server-ip/set-server-ip';
import { Http, Headers, RequestOptions } from '@angular/http';
import { HttpService } from '../../providers/http-service/http-service';
import { NativeService } from '../../providers/native-service/native-service';
import { AccountService } from '../../providers/account-service/account-service';
import 'rxjs/add/operator/map';
import { Md5 } from 'ts-md5/dist/md5';
import {HomePage} from "../home/home";
declare let cordova: any;
/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  @ViewChild('userName') input:ElementRef;

    isToggled: boolean = false;
    username: string;
    password: string;
    randomCode: string;
    loginForm: any;
    randomCodeImage: string = "";
    randomCodeIsRight: boolean = false;
    userInfo: UserInfo;
    accountId:number;

    constructor(public renderer: Renderer,
                private elementRef: ElementRef,
                public http: Http,
                public httpService: HttpService,
                public accountService: AccountService,
                public toastCtrl: ToastController,
                public storage: Storage,
                public navCtrl: NavController,
                private  formBuilder: FormBuilder,
                public navParams: NavParams,
                private nativeService: NativeService){
        // console.log(Md5.hashStr("111111{admin}"));
        this.createCode();
       this.loginForm = formBuilder.group({
            username: new FormControl(''),
            password: new FormControl(''),
            randomCode: new FormControl(''),
        });
        this.username = this.loginForm.controls['username'];
        this.password = this.loginForm.controls['password'];
        this.randomCode = this.loginForm.controls['randomCode'];

    }
    ngAfterViewInit() {
        this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('input'),
            'focus',[]);
    }

    //判断是否记住密码
    onSubmit(value) {
        if(value.username=='' || value.password.length<4){
            if(value.username=='') {
                this.nativeService.showToast("账号不能为空！");
            }
            else {
                this.nativeService.showToast("密码最小长度为4位！");
            }
        }

        else if (value.randomCode.toUpperCase() === this.randomCodeImage.toUpperCase()){
            this.nativeService.showLoading('正在登陆...');

            if(this.loginForm.valid) {
                this.checkUserInfo(value.username,value.password).then(data =>{
                    // alert(data['load']);
                    this.nativeService.hideLoading();
                    this.accountService.setAccount(data);

                   // alert(this.isToggled);
                    console.log(this.accountService.getAccount());

                    if(data['load'] == "Y"){
                        if(this.isToggled){

                           // alert('记住密码');
                            this.storage.set('username',value.username).then();
                            this.storage.set('password',value.password).then();
                        }

                        this.nativeService.hideLoading();
                        this.navCtrl.setRoot(TabsPage,data).then();
                        this.accountId=(this.accountService.getAccount() as any).accountId;
                        this.storageUserInfo(this.accountId);

                    }else {
                        this.nativeService.showAlert('用户名或密码错误！','请检查你的账号密码是否正确');
                        //设置输入错误提示
                      // 　  let toast = this.toastCtrl.create({
                      //       message: '用户名或密码错误！',
                      //       duration: 2000,
                      //       position: 'top'
                      //   });
                      //
                      //   toast.present(toast).then();　
                    }
                });


            }

        }else {
            this.nativeService.showToast("验证码错误，请重新输入！");
            this.createCode();
        }


    }

    /*
    * 改变记住密码按钮状态
    * */
    toggled() {

        console.log("isToggled: "+ this.isToggled);
        if (this.isToggled === true) {
            this.isToggled = false;
        }
        else {
            this.isToggled = true;
            this.nativeService.showToast("记住密码")
        }
    }

    /*
    *  设施服务器地址
    * */
    setServerIP() {
        this.navCtrl.push(SetServerIpPage).then( ()=> {
        })
    }

    /*
    *  检测用户名密码是否正确
    * */
    checkUserInfo(username?: string,password?: string) {

        let url = this.httpService.getUrl() + "/mainOfApp.do";
        password = Md5.hashStr(password).toString();
        let body= "name="+username+"&password="+password;
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let options = new RequestOptions({
            headers: headers
        });


        return new Promise((resolve, reject) =>{
            this.http.post(url,body,options).map(res =>res.json()).subscribe(data => {
                    resolve(data);
                    console.log(data);

                },
                err =>{
                    //设置输入错误提示
                    this.nativeService.hideLoading();
                    this.nativeService.showAlert('网络连接错误','请检查您的联网信息');
                    reject(err);
                });
        });
    }

    /*
    * 创建随机码
    * */
    createCode() {
        let authCode: string ="";//设置这个为空变量，然后往里面添加随机数
        let authCodeLength=4;//随机数的长度
        const randomArray=[2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R', 'S','T','U','V','W','X','Y','Z'];
        //创建一个数组，随机数从里面选择四位数或者更多
        for(let i=0;i<authCodeLength;i++){
            let index=Math.floor(Math.random()*32);//随机取一位数
            authCode +=randomArray[index];//取四位数，并+相连
        }
        console.log(authCode);//取到四位随机数之后，跳出循环
        this.randomCodeImage = authCode;//将四位随机数赋值给验证码出现的方框
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

                    this.userInfo = data;
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
        })
    }


}
