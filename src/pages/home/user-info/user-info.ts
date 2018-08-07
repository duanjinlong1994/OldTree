import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController,} from 'ionic-angular';
import { UserInfo } from '../../../model/UserInfo';
import { Storage} from '@ionic/storage';
import { Http , Headers ,RequestOptions } from '@angular/http';
import { HttpService } from '../../../providers/http-service/http-service';
import { AccountService } from '../../../providers/account-service/account-service';
import { NativeService } from '../../../providers/native-service/native-service';
import { LoginPage } from '../../login/login';
import 'rxjs/add/operator/map';
import { Md5 } from 'ts-md5/dist/md5';
/**
 * Generated class for the UserInfoPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
    selector: 'page-user-info',
    templateUrl: 'user-info.html',
})
export class UserInfoPage {

    userInfo: UserInfo;
    accountOrgName:string = "";
    realName = "";
    phone1 = "";
    phone2 = "";
    email = "";
    userPosition = "";
    account = "";
    accountId = 0 ;
    str:string="";
    changestr:string="";
    checkPassword:boolean=false;
    currentPassword:string;
    username:string;

    user: any;

    constructor(public http:Http,public navCtrl: NavController,
                public navParams: NavParams,
                public accountService: AccountService,
                private httpService: HttpService,
                private alertCtrl: AlertController,
                private modalCtrl: ModalController,
                private storage: Storage,
                private nativeService: NativeService,
    ) {
        this.accountId = (this.accountService.getAccount() as any).accountId;

        console.log("accounId:"+ this.accountId);
        this.userInfo= this.accountService.getUserInfo() as any;
        this.realName = this.userInfo['realName'];
        this.accountOrgName = this.userInfo['accountOrgName'];
        this.phone1 = this.userInfo['phone1'];
        this.email = this.userInfo['email'];
        this.phone2 = this.userInfo['phone2'];

        this.userPosition = this.userInfo['userPosition'];
        this.account = this.userInfo['account'];
        this.storage.get('password').then(password=>{
            this.currentPassword=password;
        });
        this.storage.get('username').then(username=>{
            this.username=username;
        });
        //  this.user = data;
        console.log(this.userInfo);

    }

    openSignupModal() {
        // this.openModal();
    }

    openModal(pageName) {
        this.modalCtrl.create(pageName, this.user , { cssClass: 'inset-modal' })
            .present();
    }
    openUserInfoEditPage() {
        this.openSignupModal();
    }

    getUserInfoByAccountId(accountID) {
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let options = new RequestOptions({
            headers: headers
        });
        let body= "accountID="+accountID;
        let url = this.httpService.getUrl()+"/getAccount.do";
        return new Promise((resolve,reject) => {
            this.http.post(url, body, options)
                .map(res => res.json())
                .subscribe(data => {

                    this.userInfo = data;
                    resolve(data);
                },err => {
                    reject(err);
                });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad UserInfoPage');
    }


    ChangeString()
    {
        console.log("changing。。。");
        if(/\./.test(this.str)){
            this.changestr= this.str.replace(/\d(?=(\d{4})+\.)/g, "$&-").replace(/\d{4}(?![,.]|$)/g, "$&-");
        }else{
            this.changestr=this.str.replace(/\d(?=(\d{4})+$)/g, "$&-");
        }
        console.log(this.changestr);
    }

    showPasswordChange(){
        const prompt = this.alertCtrl.create({
            title: '修改密码',
            message: "请输入当前密码及新密码",
            inputs: [
                {
                    type:'password',
                    name: 'currentPassword',
                    placeholder: '当前密码'
                },
                {
                    type:'password',
                    name: 'newPassword',
                    placeholder: '新密码(不少于4位)'
                },
                {
                    type:'password',
                    name: 'confirmPassword',
                    placeholder: '确认新密码(不少于4位)'
                },
            ],
            buttons: [
                {
                    text: '取消',
                    handler: data => {
                    }
                },
                {
                    text: '确认',
                    handler: data => {
                        this.OnClickChange(data);
                    }
                }
            ]
        });
        prompt.present();
    }

    OnClickChange(value)
    {
        if( value.newPassword.length >= 4 && value.confirmPassword.length >= 4 && value.newPassword.length >= 4 ){
            if(value.newPassword===value.confirmPassword){
                if(value.currentPassword!==value.newPassword){
                    if(value.currentPassword===this.currentPassword){
                        this.nativeService.showLoading('正在修改密码...');
                        this.updataPassword(this.username,value.newPassword);
                    }
                    else {
                        this.nativeService.showToast('当前密码不正确！');
                    }
                }
                else{
                    this.nativeService.showToast('新密码与当前密码相同！');
                }
            }
            else {
                this.nativeService.showToast('修改密码不一致！');
            }
        } else {
            this.nativeService.showToast('密码长度不能少于4位！');
        }
    }

    updataPassword(username,password){
        this.checkChange(username,password).then(data=>{
            this.nativeService.hideLoading();
            if(data['Change']=="Y")
            {
                console.log("Success");
                let alert = this.alertCtrl.create({
                    title: '修改成功',
                    subTitle: '返回重新登录！',
                    buttons: [{
                        text: '退出',
                        handler: () => {
                            this.logout();
                        }
                    },],

                });
                alert.present().then();
            }
            else
            {
                this.nativeService.showToast('修改密码失败！');
            }
        })


    }

    checkChange(username?: string,password?: string) {
        password = Md5.hashStr(password).toString();
        var url = this.httpService.getUrl()+"/changePassword.do";
        let body ="username="+this.username+"password="+password;
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

    logout() {
        // this.navCtrl.push(LoginPage);
        this.storage.remove('username');
        this.storage.remove('password');
        this.navCtrl.setRoot(LoginPage);
    }

}
