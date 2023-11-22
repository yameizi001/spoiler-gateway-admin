import http from '@/utils/request'

export namespace Route {
  export type CreateForm = {
    name: string
    description?: string | null
    serviceId: string
    templateId?: string | null
    predicates: object[]
    filters: object[]
    metadata: object
    ordered: number
  }

  export type UpdateForm = {
    id: string
    name: string
    description?: string | null
    serviceId: string
    templateId?: string | null
    predicates: object[]
    filters: object[]
    metadata: object
    ordered: number
  }

  export type UpsertWithTemplateForm = {
    name: string
    description?: string | null
    serviceId: string
    templateId?: string | null
    template: {
      id?: string | null
    }
    predicates: object[]
    filters: object[]
    metadata: object
    ordered: number
  }

  export type QueryItem = {
    name: string
    args?: string | null
  }

  export type QueryForm = {
    id?: string | null
    serviceId?: string | null
    templateId?: string | null
    name?: string | null
    predicateQueries?: QueryItem[] | null
    filterQueries?: QueryItem[] | null
    metadataQueries?: QueryItem[] | null
    enabled?: boolean | null
    page: {
      num: number
      size: number
    }
  }
}

class RouteApi {
  async create(form: Route.CreateForm) {
    return http.post('/route', undefined, form)
  }

  async remove(id: string) {
    return http.delete('/route', {
      id: id
    })
  }

  async edit(form: Route.UpdateForm) {
    return http.put('/route', undefined, form)
  }

  async upsertWithTemplate(form: Route.UpsertWithTemplateForm) {
    if (form.template.id && form.template.id !== '-1') {
      return http.put('/route/template', undefined, form)
    } else {
      return http.post('/route/template', undefined, form)
    }
  }

  async disable(id: string) {
    return http.put(
      '/route/disable',
      {
        id: id
      },
      undefined
    )
  }

  async enable(id: string) {
    return http.put(
      '/route/enable',
      {
        id: id
      },
      undefined
    )
  }

  async getPageableServiceList(form: Route.QueryForm) {
    return http.post('/routes/_query', undefined, form)
  }
}

const routeApi = new RouteApi()

export default routeApi
