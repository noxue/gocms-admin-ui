import request from '@/utils/request'

export function getToken(filename, type) {
  return request({
    url: 'upload/token?filename=' + filename + '&type=' + type,
    method: 'get'
  })
}
