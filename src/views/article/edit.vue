<template>
  <div class="app-container">
    <el-form ref="form" :model="article" label-width="100px">
      <el-form-item label="文章名称">
        <el-input v-model="article.Title" @blur="translate()"/>
      </el-form-item>
      <el-form-item label="文章URL">
        <el-input v-model="article.Name"/>
      </el-form-item>
      <el-form-item label="文章作者">
        <el-input v-model="article.Author"/>
      </el-form-item>
      <el-form-item label="文章分类">
        <el-select v-model="article.Type" :remote-method="getTypes" filterable remote placeholder="选择分类">
          <el-option v-for="(item,index) in types" :key="item.Name+index" :label="item.Title" :value="item.Name"/>
        </el-select>
      </el-form-item>
      <el-form-item label="文章内容">
        <markdown-editor v-model="article.Content" :highlight="true"/>
      </el-form-item>
      <el-form-item label="排序编号">
        <el-input v-model="article.Sort" type="number"/>
      </el-form-item>
      <el-form-item label="文章标签">
        <el-tag
          v-for="tag in article.Tags"
          :key="tag"
          :disable-transitions="false"
          closable
          @close="handleClose(tag)">
          {{ tag }}
        </el-tag>
        <el-input
          v-if="tag.inputVisible"
          ref="saveTagInput"
          v-model="tag.inputValue"
          size="small"
          class="input-new-tag"
          @keyup.enter.native="handleInputConfirm"
          @blur="handleInputConfirm"/>
        <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加标签</el-button>
      </el-form-item>
      <el-form-item label="上一篇">
        <el-input v-model="article.Prev"/>
      </el-form-item>
      <el-form-item label="下一篇">
        <el-input v-model="article.Next"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">
          <span v-if="articleName===''">添加</span>
          <span v-else>编辑</span>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import 'simplemde/dist/simplemde.min.css'
/* Highlight theme list: https://github.com/isagalaev/highlight.js/tree/master/src/styles */
import 'highlight.js/styles/github.css'
import markdownEditor from 'vue-simplemde/src/markdown-editor'
import hljs from 'highlight.js'
window.hljs = hljs

import { Title2Url } from '@/api/title2url'
import { getTypes } from '@/api/article-type'
import { addArticle } from '@/api/article'
export default {
  name: 'Article',
  components: {
    markdownEditor
  },
  data() {
    return {
      types: [],
      articleName: '',
      tag: {
        inputVisible: false,
        inputValue: ''
      },
      article: {
        Title: '',
        Name: '',
        Author: '',
        Content: '',
        Type: '',
        Tags: [],
        Sort: 0,
        Prev: '',
        Next: ''
      }
    }
  },
  watch: {
    'article.Sort': function(n, o) {
      var num = parseInt(n)
      this.article.Sort = isNaN(num) ? 0 : num
    }
  },
  mounted() {
    this.getTypes()
  },
  destroyed() {
    this.simplemde.toTextArea()
    this.simplemde = null
  },
  methods: {
    translate() {
      var newV = this.article.Title
      newV = newV.replace(/(\s*)/g, '')
      if (newV === '') {
        return
      }
      Title2Url(newV).then(response => {
        this.article.Name = response.data
      })
    },
    onSubmit() {
      addArticle(this.article).then(res => {
        console.log(res)
      })
    },
    getTypes() {
      getTypes().then(response => {
        this.types = response.types
      })
    },
    handleClose(tag) {
      this.article.Tags.splice(this.article.Tags.indexOf(tag), 1)
    },
    showInput() {
      this.tag.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const inputValue = this.tag.inputValue
      if (inputValue) {
        this.article.Tags.push(inputValue)
      }
      this.tag.inputVisible = false
      this.tag.inputValue = ''
    }
  }
}
</script>

<style scoped>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
