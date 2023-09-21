import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LivroRepository from 'App/Repositories/LivrosRepository'
import { ApiResponse } from './API'
export default class LivrosController {
  #livroRepo: any
  #api=new ApiResponse();
  constructor() {
    this.#livroRepo = new LivroRepository()
  }

  public async index({ request, response }: HttpContextContract) {


    const options = {
      page: request.input("page") || null,
      perPage: request.input("perPage") || null,
      search: request.input("search") || null,
      searchBy: request.input("searchBy") || null,
      orderBy: request.input("orderBy") || null,
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc'
    }

    const result = await this.#livroRepo.findAll(options)

    return this.#api.RetornoApi(
      "Sucesso",
      '200',
      result,
    );


  }

  public async Biblioteca({ request, response }: HttpContextContract) {


    const options = {
      page: request.input("page") || null,
      perPage: request.input("perPage") || null,
      search: request.input("search") || null,
      searchBy: request.input("searchBy") || null,
      orderBy: request.input("orderBy") || null,
      departamento: request.input("departamento") || null,
      disciplina: request.input("disciplina") || null,
      curso: request.input("curso") || null,
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc'
    }

    const result = await this.#livroRepo.Biblioteca(options)
    return this.#api.RetornoApi(
      "Sucesso",
      '200',
      result,
    );


  }

  public async show({ params, response }) {
    const user = await this.#livroRepo.findById(params.id)
    return this.#api.RetornoApi(
      "Sucesso",
      '200',
      user,
    );
  }


}
