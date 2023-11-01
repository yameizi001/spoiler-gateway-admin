import http from '@/utils/request'

export namespace Property {
  export type CreateForm = {
    elementId?: string | null
    key?: string | null
    alias: string
    description?: string | null
    required: boolean
    regex?: string | null
  }

  export type QueryForm = {
    elementId?: string | null
    key?: string | null
    alias?: string | null
    required?: boolean | null
    page: {
      num: number
      size: number
    }
  }
}

class PropertyApi {
  async create(form: Property.CreateForm) {
    return http.post('/property', undefined, form)
  }

  async remove(id: string) {
    return http.delete('/property', {
      id: id
    })
  }

  async getPageablePropertyList(form: Property.QueryForm) {
    return http.post('/properties/_query', undefined, form)
  }
}

const propertyApi = new PropertyApi()

export default propertyApi
