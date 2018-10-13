import request from '@/utils/request'

export function addArticle(data) {
  return request({
    url: '/article',
    method: 'post',
    data: data
  })
}

export function getArticles(params) {
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}
