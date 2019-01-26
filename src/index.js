import './style.css';
import icon from './img/icon.png';


// 创建一个Mvvm构造函数
// 这里用es6方法将options赋一个初始值，防止没传，等同于options || {}
function Mvvm(options = {}) {
  // vm.$options Vue上是将所有属性挂载到上面
  // 所以我们也同样实现,将所有属性挂载到了$options
  this.$options = options;
  // this._data 这里也和Vue一样
  let data = this._data = this.$options.data;
  
  // 数据劫持
  observe(data);
  // this 代理this._data
  for(let key in data) {
    Object.defineProperty(this, key, {
      configurable: true,
      get() {
        return this._data[key]
      },
      set(newVal) {
        return this._data[key] = newVal
      }
    })
  }

  // 编译
  new Compile(options.el, this)
}
/**
 *  数据劫持
 *  观察对象，给对象增加Object.defineProperty
 *  vue特点是不能新增不存在的属性 不存在的属性没有get和set
 *  深度响应 因为每次赋予一个新对象时会给这个新对象增加defineProperty(数据劫持)
 */
function Observe(data) { // 把data属性通过defineProperty的方式定义属性
  let dep = new Dep()
  for (let key in data) {
    let val = data[key]
    observe(val)
    Object.defineProperty(data, key, {
      configurable: true,
      get () {
        Dep.target && dep.addSub(Dep.target) // 将watcher添加到订阅事件中 [watcher]
        return val
      },
      set (newVal) {
        if (val === newVal) return // 设置的值和以前值一样不处理
        observe(newVal) // 当设置为新值后，也需要把新值再去定义成属性
        val = newVal
        dep.notify()  // 让所有watcher的update方法执行即可
      }
    })
  }
}
// 外面再写一个函数
// 不用每次调用都写个new
// 方便递归调用
function observe (data) {
  if (!data || typeof data !== 'object') return
  return new Observe(data)
}

function Compile(el, vm) {
  // 将el挂载到实例上方便调用
  vm.$el = document.querySelector(el)
  
  // 在el范围里将内容都拿到放入文档碎片中，节省开销
  let fragment = document.createDocumentFragment()
  let child
  // 将firstChild放到文档碎片中，然后再赋给child继续循环，直到没有子节点再放入文档碎片中
  while (child = vm.$el.firstChild) {
    // appendChild() 如果被插入的节点已经存在与当前文档的文档树种，则那个节点会先从原来的位置移除，再插入新的位置
    // 所以vm.$el.firstChild 每次取的都是剩余元素 直至空 
    fragment.appendChild(child)
  }
  function replace(fragment) {
    Array.from(fragment.childNodes).forEach(node => {
      let text = node.textContent
      let reg = /\{\{(.*?)\}\}/g

      if(node.nodeType === 1) {  // 元素节点
        let nodeAttr = node.attributes //获取node 所有属性
        Array.from(nodeAttr).forEach(attr => {
          let name = attr.name
          let exp = attr.value
          if (name.includes('v-')) {
            node.value = vm[exp]
          }

          new Watcher(vm, exp, function (newVal) {
            node.value = newVal;   // 当watcher触发时会自动将内容放进输入框中
          })
          node.addEventListener('input', e => {
            console.log(vm);
            let newVal = e.target.value
            vm[exp] = newVal
          })
        })
      }

      if (node.nodeType === 3 && reg.test(text)) {  // 即是文本节点又有大括号的情况{{}}
        // console.log(RegExp.$1); // 正则匹配到的第一个分组 如： a.b, c
        let arr = RegExp.$1.split('.')
        let val = vm
        arr.forEach(key => {
          val = val[key]
        })
        node.textContent = text.replace(reg, val).trim();
      }
      // 如果还有子节点，继续递归replace
      if (node.childNodes && node.childNodes.length) {
        replace(node)
      }
      // 给Watcher再添加两个参数，用来取新的值(newVal)给回调函数传参
      new Watcher(vm, RegExp.$1, newVal => {
        node.textContent = text.replace(reg, newVal).trim()  
      })
    })
  }

  replace(fragment)  // 替换内容

  vm.$el.appendChild(fragment) // 再将文档碎片放入el中
}

// 发布订阅
function Dep () {
  // 一个数组(存放函数的事件池
  this.subs = [];
}
Dep.prototype = {
  addSub(sub) {
    this.subs.push(sub)
  },
  notify() {
    this.subs.forEach(sub => sub.update())
  }
}

// 监听函数
// 通过Watcher这个类创建的实例，都拥有update方法
function Watcher(vm, exp, fn) {
  this.fn = fn
  this.exp = exp
  this.vm = vm
  Dep.target = this
  let arr = exp.split('.')
  let val = vm
  arr.forEach(key => {
    val = val[key]
  })
  Dep.target = null
}

Watcher.prototype.update = function () {
  let arr = this.exp.split('.');
  let val = this.vm;
  arr.forEach(key => {    
      val = val[key]   // 通过get获取到新的值
  })
  this.fn(val);   // 将每次拿到的新值去替换{{}}的内容即可
}

/**
 * 
 */
new Mvvm({
  el: '#app',
  data: {
      a: {
          b: 1123
      },
      c: 2
  },

})