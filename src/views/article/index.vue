<template>
  <div class="app-container">
    <div class="toolbar">
      <el-form v-if="!search.article" :inline="true" onsubmit="return false">
        <el-form-item label="分类查看">
          <el-select v-model="search.type" :remote-method="fetchTypes" filterable remote placeholder="选择分类">
            <el-option label="查看全部" value=""/>
            <el-option v-for="(item,index) in types" :key="item.Name+index" :label="item.Title" :value="item.Name"/>
          </el-select>
        </el-form-item>
        <el-form-item label="标题查询">
          <el-input v-model="search.word" placeholder="根据标题查询" />
        </el-form-item>
      </el-form>
    </div>
    <el-table
      v-loading="listLoading"
      :data="articles"
      empty-text="文章列表为空"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row>
      <el-table-column align="center" label="#" width="50">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="标题">
        <template slot-scope="scope">
          <span v-if="search.article">{{ scope.row.Title }}</span>
          <router-link v-else :to="{ path: '/article/index', query: { type: scope.row.Type, article: scope.row.Name }}">{{ scope.row.Title }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="URL">
        <template slot-scope="scope">
          <span>{{ scope.row.Name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdat" label="添加时间">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span>{{ scope.row.CreatedAt|formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button-group>
            <el-button size="mini" plain icon="el-icon-edit" type="primary" @click="edit(scope.row)"/>
            <el-button v-if="!search.article" size="mini" type="primary" plain @click="addChapter(scope.row)">+ 章节</el-button>
            <el-button size="mini" type="danger" plain icon="el-icon-delete" @click="remove(scope.row)"/>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <el-col v-if="!search.article" :span="24" class="bottom-toolbar">
      <el-pagination
        :current-page.sync = "search.page"
        :page-size="10"
        layout="prev, next"
        background
        @current-change="pageChange"/>
    </el-col>
  </div>
</template>

<script>
import { getArticles, deleteArticle, deleteChapter } from '@/api/article'
import { getTypes } from '@/api/article-type'

export default {
  filters: {
    formatDate: function(para) {
      if (para === '' || para === null || para === undefined) {
        return ''
      } else {
        var d = new Date(para)
        var minute = d.getMinutes()
        if (minute < 10) {
          minute = '0' + minute // 补齐
        }
        var seconds = d.getSeconds()
        if (seconds < 10) {
          seconds = '0' + seconds // 补齐
        }
        return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日  ' + d.getHours() + ':' + minute + ':' + seconds
      }
    }
  },
  data() {
    return {
      types: [],
      articles: null,
      listLoading: true,
      search: {
        type: '',
        page: 1,
        word: '',
        article: '' // use to get chapters
      }
    }
  },
  watch: {
    'search.type': function(n, o) {
      this.fetArticles()
    },
    'search.word': function(n, o) {
      this.fetArticles()
    },
    'search.article': function() {
      this.fetArticles()
    },
    $route(to, from) {
      this.search.article = this.$route.query.article
      this.search.type = this.$route.query.type
    }
  },
  mounted() {
    this.search.article = this.$route.query.article
    this.search.type = this.$route.query.type
    this.fetArticles()
    if (!this.search.article) {
      this.fetchTypes()
    }
  },
  methods: {
    fetArticles() {
      this.listLoading = true
      getArticles(this.search).then(response => {
        if (this.search.article) {
          if (response.article) {
            this.articles = response.article.Chapters
          } else {
            this.articles = null
          }
        } else {
          this.articles = response.articles
        }
        this.listLoading = false
      })
    },
    remove(article) {
      this.$confirm('此操作将删除该文章, 无法找回，是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.search.article && this.search.article !== '') {
          deleteChapter(this.search.type, this.search.article, article.Name).then(res => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        } else {
          deleteArticle(article.Type, article.Name).then(res => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    edit(param) {
      var type = param.Type
      var parent = '' // chapter belong to whitch article
      if (this.search.article) {
        type = this.search.type
        parent = this.search.article
      }
      this.$router.push({ path: '/article/edit', query: { action: 'edit_article', type: type, article: param.Name, parent: parent }})
    },
    addChapter(param) {
      this.$router.push({ path: '/article/add', query: { action: 'add_chapter', type: param.Type, article: param.Name }})
    },
    fetchTypes() {
      getTypes().then(response => {
        this.types = response.types
      })
    },
    pageChange() {
      this.fetArticles()
    }
  }
}
</script>
