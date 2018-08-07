import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';

/*
 Generated class for the AccountServiceProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class AccountService {
    private sysType: number;
    private account: object ;
    private userinfo:object;

    constructor(public http: Http,private storage: Storage) {

        console.log('Hello AccountServiceProvider Provider');
    }

    getAccount() {
        if ((this.account as any).accountId !== null){
            return this.account;
        }else if((this.storage.get('account') as any).accountId !== null) {
            this.account = this.storage.get('account');
            return this.account
        }
        else {
            return 0;
        }
    }
    getSysType() {
        return this.sysType;
    }


    setAccount(account: object){
        this.account = account;
        this.sysType = (account as any).accountType;
        this.storage.set('account',account).then();
    }

    getUserInfo(){
        if ((this.userinfo as any).accountID !== null){
            return this.userinfo;
        }else if((this.storage.get('userinfo') as any).accountID !== null) {
            this.userinfo = this.storage.get('userinfo');
            return this.userinfo
        }
        else {
            return 0;
        }
    }

    setUserInfo(userinfo: object) {
        this.userinfo = userinfo;
        console.log(this.userinfo);
        this.storage.set('userinfo',userinfo).then();
    }

}
