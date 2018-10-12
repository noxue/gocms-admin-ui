import request from '@/utils/request'

export function Title2Url(title) {
  return request({
    url: '/translate',
    method: 'get',
    params: { 'title': title }
  })
}

