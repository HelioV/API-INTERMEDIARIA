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
| new NotDeleteException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class NotDeleteException extends HttpExceptionHandler {
  #message?:any
  constructor (message?:any) {
    super(Logger)
    this.#message = message
  }
  /**
       * Handle this exception by itself
       */
  public async handle (error: any, ctx: HttpContextContract) {
    // console.log('Error > ', error.status)
    // console.log('Body > ', ctx.request.body())
    console.log('error : ', error);
    return ctx.response.badRequest({
      message: this.#message || 'Não é possível eliminar este registo!',
      object: null,
    })
  }
}
