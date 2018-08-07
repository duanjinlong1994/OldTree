import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the PhoneNumberPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'setPhoneNumber',
})
export class PhoneNumberPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(str: string, ...args) {
      if(/\./.test(str)){
          return str.replace(/\d(?=(\d{4})+\.)/g, "$&-").replace(/\d{4}(?![,.]|$)/g, "$&-");
      }else{
          return str.replace(/\d(?=(\d{4})+$)/g, "$&-");
      }
  }
}
