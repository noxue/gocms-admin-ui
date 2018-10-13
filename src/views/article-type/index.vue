<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row>
      <el-table-column align="center" label="#" width="50">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="分类名称">
        <template slot-scope="scope">
          {{ scope.row.Title }}
        </template>
      </el-table-column>
      <el-table-column label="分类URL" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.Name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="createdat" label="添加时间">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span>{{ scope.row.CreatedAt|formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button-group>
            <el-button size="mini" plain icon="el-icon-edit" type="primary" @click="edit(scope.row)"/>
            <el-button size="mini" type="danger" plain icon="el-icon-delete" @click="remove(scope.row)"/>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
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
      list: null,
      listLoading: true
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getTypes(this.listQuery).then(response => {
        this.list = response.types
        this.listLoading = false
      })
    },
    remove(param) {
      console.log(param)
    },
    edit(param) {
      this.$router.push({ name: 'article-type-edit', params: { name: param.Name }})
    }
  }
}
</script>
