
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new UnAuthorizedException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class UnAuthorizedException extends HttpExceptionHandler {
  #message
  #code:number
  constructor (message) {
    super(Logger)
    this.#message = message
    this.#code=400
  }
  /**
   * Handle this exception by itself
   */
  public async handle (error: any, ctx: HttpContextContract) {
    // console.log('Error > ', error.status)
    // console.log('Body > ', ctx.request.body())
    console.log('error : ',error);
    return ctx.response.unauthorized({
      message: this.#message || 'Sem permissão para realizar acção.',
      code:this.#code,
      object: null,
    })
  }
}
