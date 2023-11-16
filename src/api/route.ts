import http from '@/utils/request'

export namespace Route {
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
  async remove(id: string) {
    return http.delete('/route', {
      id: id
    })
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
