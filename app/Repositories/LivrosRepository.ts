import Database from '@ioc:Adonis/Lucid/Database'

import NotFoundException from 'App/Exceptions/NotFoundException'
import NotCreatedFileException from 'App/Exceptions/NotCreatedFileException'
import NotCreatedException from 'App/Exceptions/NotCreatedException'
import InternalServerException from 'App/Exceptions/InternalServerException'

export default class LivroRepository {

  private nomeTabela="notices"
  constructor() {
  }

  /**
   * Return an element
   *
   * @param { any } id
   *
   * @throws { NotFoundException , InternalServerException}
   * @returns { Object } modelResponse
   */

  public async findAll(options: any = { page: null, perPage: null, search: null, searchBy: null, orderBy: null, orderByAscOrDesc: null }): Promise<any> {
    try {
      let result = Database
        .query()
        .from(this.nomeTabela).where(this.nomeTabela+'.typdoc','<>','a')
        .leftJoin('publishers','publishers.ed_id','notices.ed1_id').select('notices.*','publishers.ed_name as editora1')
        .leftJoin('notices_categories','notices_categories.notcateg_notice','notices.notice_id')
        .leftJoin('categories','notices_categories.num_noeud','categories.num_noeud').select('categories.libelle_categorie as categoria')
        //.leftJoin('responsability','responsability.responsability_notice','notices.notice_id').select('responsability.responsability_author as autores')
        .select(
          Database
          .from('responsability')
          .select('authors.author_rejete')
          .whereColumn('notices_categories.num_noeud','categories.num_noeud')
          .leftJoin('authors','authors.author_id','responsability.responsability_author')
          .limit(1)
          .as('autor') // 👈 This is important
        )

        .clone()


        if(options.search){
          result= result.where(options.searchBy,'like',`%${options.search}%`).clone()
        }

        if(options.orderBy){
          result= result.orderBy(options.orderBy, options.orderByAscOrDesc).clone()
        }

    return options.page
        ? await result.paginate(options.page, options.perPage || 10)
        : await result

    } catch (e) {
      console.log(e)
      throw new NotFoundException('Não foi possível listar!')
    }
  }

  public async findById(id: number): Promise<any> {

    try {
      const query = await Database
        .query()
        .from('livros')
        .where('livros.id', id).where('livros.deleted', false).where('livros.activated', true)
        .innerJoin('autors','autors.id','livros.autor_id')
        .select('autors.nome_completo as autor')
        .innerJoin('categoria_livros','categoria_livros.id','livros.categoria_livro_id')
        .select('categoria_livros.nome as categoria','categoria_livros.cor')
        .select('livros.id','livros.titulo','livros.capa','livros.descricao','livros.volume','livros.total_pagina','livros.lancamento',
        'livros.gostos','livros.favoritos','livros.visualizacao','livros.categoria_livro_id as categoria_id',
        Database.raw("DATE_FORMAT(livros.updated_at, '%d/%m/%Y %H:%i:%s') as data")
        ,'livros.url')
        .first()
      return query;
    } catch (e) {
      console.log(e)
      throw new NotFoundException()
    }
  }

  public async livrosRelacionados(idcategoria: string,idlivro:string): Promise<any> {

    try {
      const query = await Database
        .query()
        .from('livros')
        .where('livros.categoria_livro_id', idcategoria).where('livros.deleted', false).where('livros.activated', true)
        .andWhere('livros.id','<>',idlivro)
        .innerJoin('autors','autors.id','livros.autor_id')
        .select('autors.nome_completo as autor')
        .innerJoin('categoria_livros','categoria_livros.id','livros.categoria_livro_id')
        .select('categoria_livros.nome as categoria','categoria_livros.cor')
        .select('livros.id','livros.titulo','livros.capa','livros.descricao','livros.volume','livros.total_pagina','livros.lancamento',
        'livros.gostos','livros.favoritos','livros.visualizacao',
        Database.raw("DATE_FORMAT(livros.updated_at, '%d/%m/%Y %H:%i:%s') as data")
        )
        .limit(6)

      return query;
    } catch (e) {
      console.log(e)
      throw new NotFoundException()
    }
  }





  public async Biblioteca(options: any = { page: null, perPage: null, search: null, searchBy: null, orderBy: null, orderByAscOrDesc: null,departamento:null,curso:null,disciplina:null }) {

    try {
      let result = Database
        .query()
        .from('livros').where('livros.deleted',false).where('livros.activated',true)
        .innerJoin('autors','autors.id','=','livros.autor_id')
        .select(['livros.id','livros.capa','livros.titulo','livros.created_at','livros.gostos','livros.anotacaos','livros.visualizacao','livros.favoritos']) //
        .innerJoin('categoria_livros','categoria_livros.id','=','livros.categoria_livro_id')
        .select('categoria_livros.nome as categoria','categoria_livros.cor as cor')
        .select(['autors.nome_completo as autor'])
        .clone()

        if(options.departamento)
        {

          result = result
                   .whereIn('livros.id',
                     Database
                     .from('livro_disciplinas')
                     .select('livro_disciplinas.livro_id')
                     .whereColumn('livro_disciplinas.livro_id','livros.id')
                     .where((query)=>{

                      if(options.disciplina) query.where('livro_disciplinas.disciplina_id',options.disciplina)
                     })

                     .whereIn('livro_disciplinas.disciplina_id',
                      Database
                      .from('curso_disciplinas')
                      .select('curso_disciplinas.disciplina_id')
                      .whereColumn('curso_disciplinas.disciplina_id','livro_disciplinas.disciplina_id')
                      .where((query)=>{

                        if(options.curso) query.where('curso_disciplinas.curso_id',options.curso)
                       })

                       .whereIn('curso_disciplinas.curso_id',
                        Database
                        .from('cursos')
                        .select('cursos.id')
                        .whereColumn('curso_disciplinas.curso_id','cursos.id')
                        .where('cursos.departamento_id',options.departamento)

                        )
                      )

                  )

        }

        if(options.curso && !options.departamento)
        {

          result = result
                   .whereIn('livros.id',
                     Database
                     .from('livro_disciplinas')
                     .select('livro_disciplinas.livro_id')
                     .whereColumn('livro_disciplinas.livro_id','livros.id')
                     .where((query)=>{

                      if(options.disciplina) query.where('livro_disciplinas.disciplina_id',options.disciplina)
                     })

                     .whereIn('livro_disciplinas.disciplina_id',
                      Database
                      .from('curso_disciplinas')
                      .select('curso_disciplinas.disciplina_id')
                      .where('curso_disciplinas.curso_id',options.curso)
                      .whereColumn('curso_disciplinas.disciplina_id','livro_disciplinas.disciplina_id')
                      )
                  )

        }

        if(options.disciplina && !options.curso && !options.departamento)
        {
          result = result.innerJoin('livro_disciplinas','livro_disciplinas.livro_id','=','livros.id').where('disciplina_id',options.disciplina).clone()
        }

        if(options.search){
          result= result.where(options.searchBy,'like',`%${options.search}%`).clone()
        }

        if(options.orderBy){
          result= result.orderBy(options.orderBy, options.orderByAscOrDesc).clone()
        }

    return options.page
        ? await result.paginate(options.page, options.perPage || 10)
        : await result

    } catch (e) {
      console.log(e)
      throw new NotFoundException('Não foi possível listar!')
    }
  }




}
