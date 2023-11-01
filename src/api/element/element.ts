import http from '@/utils/request'

export namespace Element {
  export type CreateForm = {
    name: string
    alias: string
    icon: string
    description?: string | null
    ordered?: number | null
    type?: string | null
  }

  export type QueryForm = {
    name?: string | null
    alias?: string | null
    ordered?: boolean | null
    type?: string | null
    page: {
      num: number
      size: number
    }
  }
}

class ElementApi {
  async createPredicate(form: Element.CreateForm) {
    form.type = 'PREDICATE'
    return this.create(form)
  }

  async createFilter(form: Element.CreateForm) {
    form.type = 'FILTER'
    return this.create(form)
  }

  async create(form: Element.CreateForm) {
    return http.post('/element', undefined, form)
  }

  async remove(id: string) {
    return http.delete('/element', {
      id: id
    })
  }

  async getPageablePredicateList(form: Element.QueryForm) {
    form.type = 'PREDICATE'
    return this.getPageableElementList(form)
  }

  async getPageableFilterList(form: Element.QueryForm) {
    form.type = 'FILTER'
    return this.getPageableElementList(form)
  }

  async getPageableElementList(form: Element.QueryForm) {
    return http.post('/elements/_query', undefined, form)
  }

  async upload(file: any) {
    return http.request({
      url: '/file/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: {
        file: file
      }
    })
  }

  async removeUpload(path: string) {
    return http.request({
      url: '/file',
      method: 'DELETE',
      params: {
        path: path
      }
    })
  }
}

const elementApi = new ElementApi()

export default elementApi
