import request from '@/utils/request'

export function addType(data) {
  return request({
    url: '/article-type',
    method: 'post',
    data: data
  })
}

export function editType(typeName, data) {
  return request({
    url: '/article-type/' + typeName,
    method: 'put',
    data: data
  })
}

export function getList(params) {
  return request({
    url: '/article-types',
    method: 'get',
    params
  })
}

export function getType(typeName) {
  return request({
    url: '/article-type/' + typeName,
    method: 'get'
  })
}
