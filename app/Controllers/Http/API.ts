
export class  ApiResponse {
  public async RetornoApi(message:string | number,code:string='200',data?:any)
{
   return {
      'code':code,
      'sms':message,
      'data':data
   }
}

}
