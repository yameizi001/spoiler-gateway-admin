import http from '@/utils/request'

export namespace Instance {
  export type CreateForm = {
    serviceId: string
    name: string
    scheme?: string | null
    secure: boolean
    host: string
    port: number
    weight: number
    metadata?: JSON | null
  }

  export type UpdateForm = {
    id: string
    name: string
    scheme?: string | null
    secure: boolean
    host: string
    port: number
    weight: number
    metadata?: JSON | null
  }

  export type QueryForm = {
    name?: string | null
    scheme?: string | null
    secure?: boolean | null
    host?: string | null
    port?: number | null
    health?: boolean | null
    enabled?: boolean | null
    page: {
      num: number
      size: number
      total: number
    }
  }
}

class InstanceApi {
  async create(form: Instance.CreateForm) {
    return http.post('/instance', undefined, form)
  }

  async remove(id: string) {
    return http.delete('/instance', {
      id: id
    })
  }

  async edit(form: Instance.UpdateForm) {
    return http.put('/instance', undefined, form)
  }

  async disable(id: string) {
    return http.put(
      '/instance/disable',
      {
        id: id
      },
      undefined
    )
  }

  async enable(id: string) {
    return http.put(
      '/instance/enable',
      {
        id: id
      },
      undefined
    )
  }

  async getPageableInstanceList(form: Instance.QueryForm) {
    return http.post('/instances/_query', undefined, form)
  }
}

const instanceApi = new InstanceApi()

export default instanceApi
