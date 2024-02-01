/**
 * @description Web 数据库
 * @extends https://juejin.cn/post/7267146720710344744
 */

/**
 * indexedDB 概念
 * 1.数据库：类似 MySQL 的数据库，每个网站下都有唯一的 indexedDB，每个 indexedDB 下有若干数据库。
 * 2.对象存储空间：数据库中基本存储单位，类似 MySQL 的表，通过 keyPath 设置每张表的主键。
 * 3.存储方式：NoSQL 结构，通过 key-value 结构存储数据，一般来说 key 是每个对象存储空间的唯一值。
 * 4.存储类型：支持任何数据类型，不同于 localStorage 的字符串存储。
 * 5.版本：indexedDB 通过版本号管理数据库结构 + 对象存储空间结构，任何结构上的修改应在版本变更的 callback 中执行。
 * 6.支持持久化存储、索引、事务。
 * 7.indexedDB 事务类型
 * - readonly：只读，允许执行查
 * - readwrite：读写，允许执行增删改查
 * 8.indexedDB 事务模式
 * - default：执行数据库操作。
 * - versionchange：执行版本变更操作，例如用于增删改对象存储空间。
 * 9.乐观锁：多个事务修改同一条数据，indexedDB 在写入阶段进行冲突检测。A写入成功后增加版本号，B会更新版本号后重新读取数据再使用。
 *
 * 事务概念
 * 1.原子性 atomicity：事务中的所有操作要么全部成功执行，要么全部回滚，不会出现部分执行的情况。
 * 2.一致性 consistency：事务执行前后，数据库的状态保持一致，不会破坏数据的完整性和约束条件。
 * 3.隔离性 isolation：并发执行的多个事务之间应该相互隔离，每个事务都应该感觉不到其他事务的存在。
 * 4.持久性 durability：事务一旦提交成功，对数据库的修改应该永久保存，即使系统发生故障也不会丢失。
 */

/**
 * 删除数据库
 * - name：数据库名
 */
// window.indexedDB.deleteDatabase(import.meta.env.VITE_APP_STORAGE)

/**
 * 打开或创建数据库
 * - name：数据库名
 * - version?：数据库版本，从1开始
 */
const request: IDBOpenDBRequest = window.indexedDB.open(
  import.meta.env.VITE_APP_STORAGE,
  1
)

/**
 * 数据库版本变更
 */
request.onupgradeneeded = event => {
  console.warn('数据库版本变更！', event.target as IDBOpenDBRequest)

  // 1.获取数据库对象
  const db = (event.target as IDBOpenDBRequest).result

  // 2.创建对象存储空间（类似 MySQL 表）
  const store = db.createObjectStore('users', {
    keyPath: 'id' // 主键 PRIMARY KEY
  })

  // 3.创建对象存储空间索引
  store.createIndex(
    'users_index', // 索引名
    'name', // 索引属性（可通过数组设置联合索引）
    { unique: false } // 是否为候选键 UNIQUE KEY
  )

  // 4.删除对象存储空间（类似 MySQL 表）
  // db.deleteObjectStore('users')
}

/**
 * 数据库启动失败
 */
request.onerror = event => {
  console.error('数据库启动失败！', (event.target as IDBOpenDBRequest).error)
}

/**
 * 数据库启动成功
 */
request.onsuccess = event => {
  console.log('数据库启动成功！', event.target as IDBOpenDBRequest)

  // 1.获取数据库对象
  const db = (event.target as IDBOpenDBRequest).result

  // 2.创建一个事务
  const transaction = db.transaction(['users'], 'readwrite')
  transaction.oncomplete = event => {
    console.log('事务执行成功！', event.target as IDBTransaction)

    /**
     * 关闭数据库
     */
    db.close()
  }
  transaction.onabort = event => {
    console.warn('事务执行中断！', event.target as IDBTransaction)
  }
  transaction.onerror = event => {
    console.error('事务执行失败！', (event.target as IDBTransaction).error)
  }

  // 3.获取对象存储空间
  const store = transaction.objectStore('users')

  try {
    /**
     * 事务操作本身不会抛出异常，一般可不必 try catch
     */

    /**
     * 删
     */
    // 通过 keyPath 删除数据
    const deleteUserRequest = store.delete(11)
    // 通过 keyPath 删除数据成功的回调函数
    deleteUserRequest.onsuccess = event => {
      console.log('删除数据成功！', event.target as IDBRequest)
    }
    // 通过 keyPath 删除数据失败的回调函数
    deleteUserRequest.onerror = event => {
      console.log('删除数据失败！', event.target as IDBRequest)
    }
    // 删除所有数据
    store.clear()

    /**
     * 增
     */
    // 新增数据
    const addUserRequest = store.add({ id: 11, name: 'John Doe1', age: 31 })
    store.add({ id: 12, name: 'John Doe2', age: 32 })
    store.add({ id: 13, name: 'John Doe3', age: 33 })
    store.add({ id: 14, name: 'John Doe4', age: 34 })
    store.add({ id: 15, name: 'John Doe5', age: 35 })
    // 新增数据成功的回调函数
    addUserRequest.onsuccess = event => {
      console.log('新增数据成功！', (event.target as IDBRequest).result)
    }
    // 新增数据失败的回调函数
    addUserRequest.onerror = event => {
      console.log('新增数据失败！', event.target as IDBRequest)
    }

    /**
     * 改
     */
    // 修改数据
    const putUserRequest = store.put({ id: 11, name: 'aodazhang', age: 33 })
    // 修改数据成功的回调函数
    putUserRequest.onsuccess = event => {
      console.log('修改数据成功！', (event.target as IDBRequest).result)
    }
    // 修改数据失败的回调函数
    putUserRequest.onerror = event => {
      console.log('修改数据失败！', event.target as IDBRequest)
    }

    /**
     * 查
     */
    // 通过 keyPath 查询数据
    const getUserRequest = store.get(11)
    // 通过 keyPath 查询数据成功的回调函数
    getUserRequest.onsuccess = event => {
      console.log('查询数据成功！', (event.target as IDBRequest).result)
    }
    // 通过 keyPath 查询数据失败的回调函数
    getUserRequest.onerror = event => {
      console.log('查询数据失败！', event.target as IDBRequest)
    }

    // 查询所有数据
    const getAllUserRequest = store.getAll()
    // 查询所有数据成功的回调函数
    getAllUserRequest.onsuccess = event => {
      console.log('查询所有数据成功！', (event.target as IDBRequest).result)
    }
    // 查询所有数据失败的回调函数
    getAllUserRequest.onerror = event => {
      console.log('查询所有数据失败！', event.target as IDBRequest)
    }

    // 创建游标范围（不传为查所有）
    const range = IDBKeyRange.bound(11, 13) // keyPath 范围从 11 到 13
    // 通过游标查询数据
    const cursorRequest = store.openCursor(range)
    // 游标遍历数据的回调函数
    cursorRequest.onsuccess = event => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        console.log('游标查询数据成功！', cursor.value)
        cursor.continue()
      }
    }
  } catch (error) {
    console.error('事务执行异常！', error)
  }
}
