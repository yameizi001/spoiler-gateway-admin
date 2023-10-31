import http from '@/utils/request'

export namespace Service {
  export type CreateForm = {
    name: string
    description?: string | null
    metadata?: JSON | null
  }

  export type UpdateForm = {
    id: string
    name?: string | null
    description?: string | null
    metadata?: JSON | null
  }

  export type QueryForm = {
    id?: string | null
    name?: string | null
    enabled?: boolean | null
    page: {
      num: number
      size: number
    }
  }
}

class ServiceApi {
  async create(form: Service.CreateForm) {
    return http.post('/service', undefined, form)
  }

  async remove(id: string) {
    return http.delete('/service', {
      id: id
    })
  }

  async edit(form: Service.UpdateForm) {
    return http.put('/service', undefined, form)
  }

  async disable(id: string) {
    return http.put(
      '/service/disable',
      {
        id: id
      },
      undefined
    )
  }

  async enable(id: string) {
    return http.put(
      '/service/enable',
      {
        id: id
      },
      undefined
    )
  }

  async getPageableServiceList(form: Service.QueryForm) {
    return http.post('/services/_query', undefined, form)
  }
}

const serviceApi = new ServiceApi()

export default serviceApi
