/*
 * @Author: ls
 * @Date: 2021-03-31 13:37:37
 * @LastEditTime: 2021-03-31 16:01:20
 * @LastEditors: Please set LastEditors
 * @Description: 针对cocos对象池优化-使用装饰模式改善大量删除添加引起卡顿现象
 * @FilePath: \calendar\assets\plug-in\Pool\CCNodePoolPlus.ts
 */

import CCNodePool from './CCNodePool';

/**
 * 使用opacity方式隐藏对象
 */
export default class CCNodePoolPlus {
	private pool: CCNodePool;
	private list: cc.Node[] = [];

	constructor(pool: CCNodePool) {
		this.pool = pool;
	}

	/**
	 * 获取缓冲池
	 * @returns
	 */
	getPool() {
		return this.pool;
	}

	/**
	 * 获取当前缓冲池的可用对象数量
	 * @returns
	 */
	size() {
		return this.pool.size() + this.list.length;
	}

	/**
	 * 获取缓冲池中的对象
	 * @returns
	 */
	get() {
		let go: cc.Node = this.list.length > 0 ? this.list.shift() : this.pool.get();
		go.opacity = 255;
		return go;
	}

	/**
	 * 向缓冲池中存入一个不再需要的节点对象。
	 * @param go
	 * @param isPool 是否放入对象池中
	 */
	put(go: cc.Node, isPool: boolean = false) {
		if (isPool) {
			this.pool.put(go);
		} else {
			this.list.push(go);
			go.stopAllActions();
			go.opacity = 0;
		}
	}

	/**
	 * 清空缓冲池
	 */
	clear() {
		this.pool.clear();
		this.list.length = 0;
	}
}
