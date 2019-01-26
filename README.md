

# 一个简易的mvvm示例

1. 通过Object.defineProperty的get和set进行数据劫持
2. 通过遍历data数据进行数据代理到this上
3. 通过{{}}对数据进行编译
4. 数据双向绑定

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

