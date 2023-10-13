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

  public async findAll(options: any = { page: null,autor:null,publicacao:null,titulo:null,editora:null,descricao:null, perPage: null, search: null, searchBy: null, orderBy: null, orderByAscOrDesc: null }): Promise<any> {
    try {

      let result = Database
        .query()
        .from(this.nomeTabela) //.where(this.nomeTabela+'.typdoc','<>','a')
        .leftJoin('publishers','publishers.ed_id','notices.ed1_id').select(
          'notices.n_contenu as descricao','notices.n_resume as descricao2',
          'notices.n_gen as nota_geral','notices.tit1 as titulo','notices.tit2 as titulo2',
          'notices.tit3 as titulo3','notices.tit4 as titulo4',
          'notices.notice_id as id_livro',
          Database.raw("DATE_FORMAT(notices.create_date, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(notices.update_date, '%d/%m/%Y %H:%i:%s') as data_atualizacao"),
          'publishers.ed_name as editora','publishers.ed_web as cor')
        .leftJoin('notices_categories','notices_categories.notcateg_notice','notices.notice_id')
        .leftJoin('categories','notices_categories.num_noeud','categories.num_noeud').select('categories.libelle_categorie as categoria')

        if(options?.publicacao)
        {
          result.where(Database.raw('YEAR(notices.create_date)'),options.publicacao)
        }
        if(options?.autor)
        {
           result.innerJoin('responsability','notices.notice_id','responsability.responsability_notice')
                 .innerJoin('authors','authors.author_id','responsability.responsability_author')
                 .where('authors.author_rejete','like',`%${options.autor}%`)
        }else {
          result.select(
            Database
            .from('responsability')
            .select(Database.raw('CONCAT(authors.author_rejete," ", authors.author_name)'))

            .whereColumn('notices_categories.num_noeud','categories.num_noeud')
            .leftJoin('authors','authors.author_id','responsability.responsability_author')
            .limit(1)
            .as('autor') // 👈 This is important
          )
          .clone()
        }



        if(options?.search){
          result= result.where(options.searchBy,'like',`%${options.search}%`).clone()
        }

        if(options?.titulo){
          result= result.where('notices.tit1','like',`%${options.titulo}%`).clone()
        }

        if(options?.descricao){
          result= result.where('notices.n_contenu','like',`%${options.descricao}%`).clone()
        }

        if(options?.editora){
          result= result.where('publishers.ed_name','like',`%${options.editora}%`).clone()
        }

        if(options?.orderBy){
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
      let result = Database
        .query()
        .from(this.nomeTabela) //.where(this.nomeTabela+'.typdoc','<>','a')
        .where('notices.notice_id',id)
        .leftJoin('publishers','publishers.ed_id','notices.ed1_id').select(
          'notices.n_contenu as descricao','notices.n_resume as descricao2',
          'notices.n_gen as nota_geral','notices.tit1 as titulo','notices.tit2 as titulo2',
          'notices.tit3 as titulo3','notices.tit4 as titulo4',
          'notices.notice_id as id_livro',
          Database.raw("DATE_FORMAT(notices.create_date, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(notices.update_date, '%d/%m/%Y %H:%i:%s') as data_atualizacao"),
          'publishers.ed_name as editora','publishers.ed_web as cor')
        .leftJoin('notices_categories','notices_categories.notcateg_notice','notices.notice_id')
        .leftJoin('categories','notices_categories.num_noeud','categories.num_noeud').select('categories.libelle_categorie as categoria')

        .select(
          Database
          .from('responsability')
          .select(Database.raw('CONCAT(authors.author_rejete," ", authors.author_name)'))

          .whereColumn('notices_categories.num_noeud','categories.num_noeud')
          .leftJoin('authors','authors.author_id','responsability.responsability_author')
          .limit(1)
          .as('autor') // 👈 This is important
        )

        .clone()
      return result;
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
