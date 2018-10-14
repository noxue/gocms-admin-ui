<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="分类名称">
        <el-input v-model="form.Title" @blur="translate()"/>
      </el-form-item>
      <el-form-item label="分类url">
        <el-input v-model="form.Name"/>
      </el-form-item>
      <el-form-item label="排序编号">
        <el-input v-model="form.Sort" type="number"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">
          <span v-if="typeName===''">添加</span>
          <span v-else>编辑</span>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

import { Title2Url } from '@/api/title2url'
import { addType, getType, editType } from '@/api/article-type'

export default {
  data() {
    return {
      typeName: '',
      form: {
        Name: '',
        Title: '',
        Sort: 0
      }
    }
  },
  watch: {
    'form.Sort': function(n, o) {
      var num = parseInt(n)
      this.form.Sort = isNaN(num) ? 0 : num
    }
  },
  created: function() {
    if (undefined === this.$route.params.name) {
      this.form.Name = ''
      this.form.Title = ''
      this.form.Sort = 0
      return
    }
    this.typeName = this.$route.params.name
    if (this.typeName !== '') {
      this.loadType(this.typeName)
    }
  },
  methods: {
    loadType(name) {
      getType(name).then(res => {
        this.form = res.data
      })
    },
    onSubmit() {
      if (this.typeName !== '') {
        editType(this.typeName, this.form).then(res => {
          this.typeName = this.form.Name
          this.$message({
            message: '编辑成功',
            type: 'success'
          })
          this.$router.push({ name: 'article-types' })
        })
        return
      }

      addType(this.form).then(res => {
        this.$message({
          message: '添加成功',
          type: 'success'
        })
        this.$router.push({ name: 'article-types' })
      })
    },
    translate() {
      var newV = this.form.Title
      newV = newV.replace(/(\s*)/g, '')
      if (newV === '') {
        return
      }
      Title2Url(newV).then(response => {
        this.form.Name = response.data
      })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

