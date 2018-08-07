import {Injectable} from '@angular/core';
import {
    Http, Response, Headers, RequestOptions
} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Observable} from "rxjs";
import {NativeService} from '../native-service/native-service';

/*
  Generated class for the HttpServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class HttpService {

    private url:string;// 服务器端口号和IP
    private urlIp:string;//
    private urlPort:string;
    constructor(public http: Http,public nativeService: NativeService) {
        this.url = "http://120.79.39.117:8080/oldtree";
        this.urlIp = "120.79.39.117";
        this.urlPort = "8080";
    }

    public get(url: string, paramMap: any = null): Observable<Response> {
        console.log(url);
        return this.http.get(url);
    }

    // 默认Content-Type为application/json;
    public post(url: string, body: any = null): Observable<Response> {


        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let options = new RequestOptions({
            headers: headers
        });
        return this.http.post(url, body, options);
    }

    public static getDebugUrl() {
        return "http://10.175.200.30:8081";
    }
    getUrl() {
        return this.url;
        // return "http://192.168.2.120:8081";
    }
    //生产环境URL
    public static getProdUrl() {
        return "http://service:8080";
    }

    setUrl(url: string) {
        this.url = url;
    }

    getIp() {
        return this.urlIp;
    }

    getPort() {
        return this.urlPort;
    }
    setIpAndPort(Ip: string, port: string) {
        this.urlIp = Ip;
        this.urlPort = port;
        this.url = "http://" + Ip + ":" + port + "/oldtree";
    }


}
