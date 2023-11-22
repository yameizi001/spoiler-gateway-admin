import http from '@/utils/request'

export namespace Template {
  export type Element = {
    id: string
    alias: string
    properties: Property[]
  }

  export type Property = {
    id: string
    alias: string
    values: string[]
  }

  export type CreateForm = {
    name: string
    description?: string | null
    predicates?: Element[] | null
    filters?: Element[] | null
    metadata?: Property[] | null
    type?: string | null
  }

  export type UpdateForm = {
    id: string
    name: string
    description?: string | null
    predicates?: Element[] | null
    filters?: Element[] | null
    metadata?: Property[] | null
    type?: string | null
  }

  export type QueryForm = {
    id?: string | null
    name?: string | null
    type?: string | null
    page: {
      num: number
      size: number
    }
  }
}

class TemplateApi {
  async create(form: Template.CreateForm) {
    return http.post('/template', undefined, form)
  }

  async remove(id: string) {
    return http.delete('/template', {
      id: id
    })
  }

  async edit(form: Template.UpdateForm) {
    return http.put('/template', undefined, form)
  }

  async apply(form: object) {
    return http.post('/template/apply', undefined, form)
  }

  async getPageableTemplateList(form: Template.QueryForm) {
    return http.post('/templates/_query', undefined, form)
  }

  async getTemplateDetail(id: string) {
    return http.get('/template', {
      id: id
    })
  }
}

const templateApi = new TemplateApi()

export default templateApi
