import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import {RequestOptions} from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { Study } from './study.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

import * as $ from "jquery";

@Injectable()
export class StudyService {

    private resourceUrl = 'api/studies';

    constructor(private http: Http) { }

    create(study: Study): Observable<Study> {
        const copy = this.convert(study);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            return res.json();
        });
    }

    update(study: Study): Observable<Study> {
        const copy = this.convert(study);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            return res.json();
        });
    }

    find(id: number): Observable<Study> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            return res.json();
        });
    }

    query(req?: any): Observable<ResponseWrapper> {
        const options = createRequestOption(req);
        return this.http.get(this.resourceUrl, options)
            .map((res: Response) => this.convertResponse(res));
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }

    send(study: Study): Observable<any> {
        var delay = this.getScheduledTimeAndDelay();
        console.log("Before making post request: the delay is:" + delay);
        let myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');    
        let myParams = new URLSearchParams();
        myParams.append('delay', delay);	

        let options = new RequestOptions({ params: myParams });
        return this.http.post(`${this.resourceUrl}/send`, study, options);
    }

    private convertResponse(res: Response): ResponseWrapper {
        const jsonResponse = res.json();
        return new ResponseWrapper(res.headers, jsonResponse, res.status);
    }

    private convert(study: Study): Study {
        const copy: Study = Object.assign({}, study);
        return copy;
    }

    private getScheduledTimeAndDelay(): string{
        var delay = 0;
        // if user wants to send later:
        if ($('#sendLater').is(':checked')){
            var val = $('#setDate').val();
            console.log("confirmSend() jQuery got setDate value of "+ val);
            if (val != null){
                delay = this.calculateDelay(val);
            } 
        }
        console.log("Therefore we set value of delay to: "+ delay);
        return delay.toString();
    }

    private calculateDelay(delayString: string): number {
        // calculate delay by getting difference between two dates
        var diff = new Date(delayString).valueOf()  - new Date(this.getCurrentDateTime()).valueOf();
        if (diff > 0){ 
            return diff;
        }
        // return 0 if difference between two dates is negative. 
        return 0;
    }

    private getCurrentDateTime(): string {
        var now = new Date();
        var month = (now.getMonth() + 1).toString();
        var day = now.getDate().toString() ;
        var hours = now.getHours().toString();
        var minutes = now.getMinutes().toString();
        var time = 'T' + + ':' + now.getMinutes().toString();
        if (+month < 10)
            month = "0" + month;
        if (+day < 10)
            day = "0" + day;
        if (+hours < 10)
            hours = "0" + hours;
        if (+minutes < 10)
            minutes = "0" + minutes;    
        var today = now.getFullYear() + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
        return today;
    }


}
