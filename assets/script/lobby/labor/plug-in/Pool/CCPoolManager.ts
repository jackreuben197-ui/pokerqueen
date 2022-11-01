/*
 * @Author: ls
 * @Date: 2021-03-31 13:26:56
 * @LastEditTime: 2021-03-31 16:02:57
 * @LastEditors: Please set LastEditors
 * @Description: 节点对象池管理器
 * @FilePath: \calendar\assets\plug-in\Pool\NewScript.ts
 */

import CCNodePool from './CCNodePool';
import CCNodePoolPlus from './CCNodePoolPlus';

export default class CCPoolManager {
	private static instance: CCPoolManager;
	static getInstance(): CCPoolManager {
		if (!this.instance) {
			this.instance = new CCPoolManager();
		}
		return this.instance;
	}

	// 对象池表
	private pools = {};
	// 对象名称 和给定 key的 映射表 这样在回收对象的时候就不需要传入key了。通过节点的name就可以找到key。
	private nameMap = {};

	init(key: string, resItem: cc.Prefab, count: number) {
		if (!this.pools[key]) {
			this.pools[key] = new CCNodePool(key, resItem, count);
			// this.pools[key] = new CCNodePoolPlus(new CCNodePool(key, resItem, count));
		}
	}

	/**
	 * 获取对象池
	 * @param key
	 * @returns
	 */
	getPool(key: string) {
		return this.pools[key].getPool();
	}

	/**
	 * 获取 key缓冲池中的对象
	 * @param key
	 * @returns
	 */
	get(key: string): cc.Node {
		if (this.pools[key]) {
			let go: cc.Node = this.pools[key].get();
			if (!this.nameMap[go.name] && go.name != key) {
				this.nameMap[go.name] = key;
			}
			return go;
		}
		return null;
	}

	/**
	 * 向缓冲池中存入一个不再需要的节点对象。
	 * @param go
	 * @param nodePool
	 * @returns
	 */
	put(go: cc.Node, nodePool: boolean = false) {
		let key = this.nameMap[go.name];

		if (!key) {
			key = go.name;
		}

		if (!this.pools[key]) {
			cc.warn(' not have  name ', key, ' ,go.name ', go.name);
			return;
		}
		this.pools[key].put(go, nodePool);
	}

	/**
	 * 清空 name缓冲池
	 */
	clear(name: string) {
		if (this.pools[name]) {
			this.pools[name].clear();
			this.pools[name] = null;
		}
	}

	/**
	 * 清空所有缓冲池
	 */
	clealAll() {
		for (const key in this.pools) {
			this.clear(key);
		}
		this.pools = {};
	}
}
