/*
 * @Author: ls
 * @Date: 2021-03-31 13:24:38
 * @LastEditTime: 2021-04-01 09:14:40
 * @LastEditors: Please set LastEditors
 * @Description: 节点对象池
 * @FilePath: \calendar\assets\plug-in\Pool\CCNodePool.ts
 */

export default class CCNodePool {
	private name: string = '';
	private prefab: cc.Prefab;
	private nodePool: cc.NodePool;

	/**
	 * 构造函数
	 * @param prefab 预制体
	 * @param conut 初始化个数
	 */
	constructor(name: string, prefab: cc.Prefab, conut: number) {
		this.name = name;
		this.prefab = prefab;
		this.nodePool = new cc.NodePool();
		for (let i = 0; i < conut; i++) {
			let obj: cc.Node = this.getNode(); // 创建节点
			this.nodePool.put(obj); // 通过 putInPool 接口放入对象池
		}
	}

	/**
	 * 获取对象池名称
	 * @returns
	 */
	private getName() {
		return this.name;
	}

	/**
	 * 获取节点
	 * @returns
	 */
	private getNode() {
		if (this.prefab) {
			return cc.instantiate(this.prefab);
		} else {
			console.error(' 预制体没有赋值 ');
			return null;
		}
	}

	/**
	 * 获取当前缓冲池的可用对象数量
	 * @returns
	 */
	public size() {
		return this.nodePool.size();
	}

	/**
	 * 获取缓冲池中的对象
	 * @returns
	 */
	public get() {
		let go: cc.Node = this.nodePool.size() > 0 ? this.nodePool.get() : this.getNode();
		return go;
	}

	/**
	 * 向缓冲池中存入一个不再需要的节点对象。
	 * @param go
	 */
	public put(go: cc.Node) {
		this.nodePool.put(go);
	}

	/**
	 * 清空缓冲池
	 */
	public clear() {
		this.nodePool.clear();
	}
}
