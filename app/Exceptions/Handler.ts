/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
// import Env from '@ioc:Adonis/Core/Env'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }
  constructor() {
    super(Logger)
  }
  public async handle(error: any, ctx: HttpContextContract) {

    // const xSourceFont = await ctx.request.headers()['x-source-font']
    // if (!(Env.get('XSOURCEFONT')).includes(xSourceFont)) {
    // return ctx.response.status(404).send({
    //   message: 'Aplicação de Frontend não reconhecido.',
    //   object: null,
    // })
    // }

    /**
     * Self handle the validation exception
     */
    if (error.code === 'E_VALIDATION_FAILURE') {
      // return ctx.response.status(422).send(error.messages)
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(404).send({
        message: 'Rota não encontrada.',
        object: null,
      })
    }

    if (error.code === 'E_INVALID_API_TOKEN') {
      return ctx.response.status(401).send({
        message: 'Token inválido',
        object: null,
      })
    }

    if (error.code ==='E_UNAUTHORIZED_ACCESS') {
       return ctx.response.status(401).send({
         message: 'Sem permissão para realizar esta acção.',
         object: null,
       })
    }

    /**
     * Forward rest of the exceptions to the parent class
     */
    return super.handle(error, ctx)
  }

  public async report(error: any, ctx: HttpContextContract) {
    if (!this.shouldReport(error)) {
      return
    }

    if (typeof error.report === 'function') {
      error.report(error, ctx)
      return
    }

    // someReportingService.report(error.message)
  }

  protected context(ctx: HttpContextContract) {
    return {
      userId: ctx.auth.user?.id,
    }
  }
}
