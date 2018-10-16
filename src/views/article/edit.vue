<template>
  <div class="app-container">
    <el-form ref="form" :model="article" label-width="100px">
      <el-form-item label="标题">
        <el-input v-model="article.Title" @blur="translate()"/>
      </el-form-item>
      <el-form-item label="URL">
        <el-input v-model="article.Name"/>
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="article.Author"/>
      </el-form-item>
      <el-form-item v-if="!isAddChapter" label="分类">
        <el-select v-model="article.Type" :remote-method="getTypes" filterable remote placeholder="选择分类">
          <el-option v-for="(item,index) in types" :selected="article.Type===item.Name" :key="item.Name+index" :label="item.Title" :value="item.Name"/>
        </el-select>
      </el-form-item>
      <el-form-item label="内容">
        <markdown-editor v-model="article.Content" :configs="configs" :highlight="true"/>
      </el-form-item>
      <el-form-item class="upload" label="文件上传">
        <el-upload
          ref="upload"
          :data="file"
          :thumbnail-mode="false"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
          :show-file-list="false"
          drag
          action="https://up.qiniup.com">
          <i ref="uploadBtn" class="el-icon-upload"/>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="排序编号">
        <el-input v-model="article.Sort" type="number"/>
      </el-form-item>
      <el-form-item label="标签">
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
import SimpleMDE from 'simplemde'
import hljs from 'highlight.js'
window.hljs = hljs

import { Title2Url } from '@/api/title2url'
import { getTypes } from '@/api/article-type'
import { addArticle, addChapter, getArticle, getChapter, editChapter, editArticle } from '@/api/article'
import { getToken } from '@/api/qiniu'

var that = null
var Editor = null

function insertText(text) {
  var cm = Editor.codemirror
  var startPoint = cm.getCursor('start')
  var endPoint = cm.getCursor('end')
  cm.replaceRange(text, {
    line: startPoint.line,
    ch: endPoint.ch
  })
  cm.focus()
}

export default {
  name: 'Article',
  components: {
    markdownEditor
  },
  data() {
    return {
      file: {
        token: '',
        key: ''
      },
      isAddChapter: false,
      isEditArticle: false,
      types: [],
      articleName: '',
      parentName: '',
      typeName: '',
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
      },
      configs: {
        toolbar: [{
          name: 'bold',
          action: SimpleMDE.toggleBold,
          className: 'fa fa-bold',
          title: 'Bold',
          default: true
        },
        {
          name: 'italic',
          action: SimpleMDE.toggleItalic,
          className: 'fa fa-italic',
          title: 'Italic',
          default: true
        },
        {
          name: 'strikethrough',
          action: SimpleMDE.toggleStrikethrough,
          className: 'fa fa-strikethrough',
          title: 'Strikethrough'
        },
        {
          name: 'heading',
          action: SimpleMDE.toggleHeadingSmaller,
          className: 'fa fa-header',
          title: 'Heading',
          default: true
        },
        {
          name: 'heading-smaller',
          action: SimpleMDE.toggleHeadingSmaller,
          className: 'fa fa-header fa-header-x fa-header-smaller',
          title: 'Smaller Heading'
        },
        {
          name: 'heading-bigger',
          action: SimpleMDE.toggleHeadingBigger,
          className: 'fa fa-header fa-header-x fa-header-bigger',
          title: 'Bigger Heading'
        },
        {
          name: 'heading-1',
          action: SimpleMDE.toggleHeading1,
          className: 'fa fa-header fa-header-x fa-header-1',
          title: 'Big Heading'
        },
        {
          name: 'heading-2',
          action: SimpleMDE.toggleHeading2,
          className: 'fa fa-header fa-header-x fa-header-2',
          title: 'Medium Heading'
        },
        {
          name: 'heading-3',
          action: SimpleMDE.toggleHeading3,
          className: 'fa fa-header fa-header-x fa-header-3',
          title: 'Small Heading'
        },
        {
          name: 'code',
          action: SimpleMDE.toggleCodeBlock,
          className: 'fa fa-code',
          title: 'Code'
        },
        {
          name: 'quote',
          action: SimpleMDE.toggleBlockquote,
          className: 'fa fa-quote-left',
          title: 'Quote',
          default: true
        },
        {
          name: 'unordered-list',
          action: SimpleMDE.toggleUnorderedList,
          className: 'fa fa-list-ul',
          title: 'Generic List',
          default: true
        },
        {
          name: 'ordered-list',
          action: SimpleMDE.toggleOrderedList,
          className: 'fa fa-list-ol',
          title: 'Numbered List',
          default: true
        },
        {
          name: 'clean-block',
          action: SimpleMDE.cleanBlock,
          className: 'fa fa-eraser fa-clean-block',
          title: 'Clean block'
        },
        {
          name: 'link',
          action: SimpleMDE.drawLink,
          className: 'fa fa-link',
          title: 'Create Link',
          default: true
        },
        {
          name: 'image',
          action: SimpleMDE.drawImage,
          className: 'fa fa-picture-o',
          title: 'Insert Image',
          default: true
        },
        {
          name: 'upload',
          action: function(editor) {
            Editor = editor
            that.submitUpload()
          },
          className: 'fa fa-upload',
          title: '上传文件'
        },
        {
          name: 'table',
          action: SimpleMDE.drawTable,
          className: 'fa fa-table',
          title: 'Insert Table'
        },
        {
          name: 'horizontal-rule',
          action: SimpleMDE.drawHorizontalRule,
          className: 'fa fa-minus',
          title: 'Insert Horizontal Line'
        },
        {
          name: 'preview',
          action: SimpleMDE.togglePreview,
          className: 'fa fa-eye no-disable',
          title: 'Toggle Preview',
          default: true
        },
        {
          name: 'side-by-side',
          action: SimpleMDE.toggleSideBySide,
          className: 'fa fa-columns no-disable no-mobile',
          title: 'Toggle Side by Side',
          default: true
        },
        {
          name: 'fullscreen',
          action: SimpleMDE.toggleFullScreen,
          className: 'fa fa-arrows-alt no-disable no-mobile',
          title: 'Toggle Fullscreen',
          default: true
        },
        {
          name: 'guide',
          action: 'https://simplemde.com/markdown-guide',
          className: 'fa fa-question-circle',
          title: 'Markdown Guide',
          default: true
        },
        {
          name: 'undo',
          action: SimpleMDE.undo,
          className: 'fa fa-undo no-disable',
          title: 'Undo'
        },
        {
          name: 'redo',
          action: SimpleMDE.redo,
          className: 'fa fa-repeat no-disable',
          title: 'Redo'
        }]
      }
    }
  },
  watch: {
    'article.Sort': function(n, o) {
      var num = parseInt(n)
      this.article.Sort = isNaN(num) ? 0 : num
    }
  },
  created() {
    that = this
  },
  mounted() {
    const action = this.$route.query.action
    if (action === 'add_chapter') {
      this.isAddChapter = true
      this.article.Type = this.$route.query.type
    } else if (action === 'edit_article') {
      this.isEditArticle = true
    }
    this.articleName = this.$route.query.article
    this.parentName = this.$route.query.parent
    this.typeName = this.$route.query.type
    this.getTypes()
    if (!this.isAddChapter && this.articleName && this.articleName !== '') {
      this.fetchArticle()
    }
  },
  destroyed() {
  },
  methods: {
    fetchArticle() {
      if (this.parentName && this.parentName !== '') {
        getChapter(this.typeName, this.parentName, this.articleName).then(res => {
          this.article = res.article
        })
      } else {
        getArticle(this.typeName, this.articleName).then(res => {
          this.article = res.article
        })
      }
    },
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
      if (this.isEditArticle) {
        if (this.parentName && this.parentName !== '') {
          editChapter(this.typeName, this.parentName, this.articleName, this.article).then(res => {
            this.$message({
              message: '章节编辑成功',
              type: 'success'
            })
            this.$router.push({ path: '/article/index', query: { type: this.typeName, article: this.parentName }})
          })
          return
        }
        editArticle(this.typeName, this.articleName, this.article).then(res => {
          this.$message({
            message: '文章编辑成功',
            type: 'success'
          })
          this.$router.push({ name: 'articles' })
        })
        return
      }

      if (this.isAddChapter) {
        addChapter(this.articleName, this.article).then(res => {
          this.$message({
            message: '添加章节成功',
            type: 'success'
          })
          this.$router.push({ name: 'articles' })
        })
      } else {
        addArticle(this.article).then(res => {
          this.$message({
            message: '添加文章成功',
            type: 'success'
          })
          this.$router.push({ name: 'articles' })
        })
      }
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
    },
    beforeUpload(file) {
      return getToken(file.name, 'article').then(res => {
        this.file.key = res.path
        this.file.token = res.token
      })
    },
    handleSuccess(response, file, fileList) {
      const key = response.data.path
      const name = response.data.name
      var index1 = key.lastIndexOf('.')
      var index2 = key.length
      var suffix = key.substring(index1 + 1, index2)
      var content = ''
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].indexOf(suffix) >= 0) {
        content = `![${name}](http://static.noxue.com/${encodeURI(key)})`
      } else {
        content = `[${name}](http://static.noxue.com/${encodeURI(key)})`
      }
      insertText(content)
    },
    submitUpload() {
      this.$refs.uploadBtn.click()
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
  .upload{
    display: none;
  }
</style>
