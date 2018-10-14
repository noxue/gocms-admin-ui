import request from '@/utils/request'

export function addArticle(data) {
  return request({
    url: '/article',
    method: 'post',
    data: data
  })
}

export function addChapter(article, data) {
  return request({
    url: '/article/' + article,
    method: 'post',
    data: data
  })
}

export function getArticle(type, article) {
  return request({
    url: '/article/' + type + '/' + article,
    method: 'get'
  })
}

export function getChapter(type, article, chapter) {
  return request({
    url: '/article/' + type + '/' + article + '/' + chapter,
    method: 'get'
  })
}

export function getArticles(params) {
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}

export function editArticle(oldType, oldArticle, article) {
  return request({
    url: '/article/' + oldType + '/' + oldArticle,
    method: 'put',
    data: article
  })
}

export function editChapter(oldType, oldArticle, oldChapter, article) {
  return request({
    url: '/article/' + oldType + '/' + oldArticle + '/' + oldChapter,
    method: 'put',
    data: article
  })
}

export function deleteArticle(type, article) {
  return request({
    url: '/article/' + type + '/' + article,
    method: 'delete'
  })
}

export function deleteChapter(type, article, chapter) {
  return request({
    url: '/article/' + type + '/' + article + '/' + chapter,
    method: 'delete'
  })
}
