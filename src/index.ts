polyfill();
/*
 * Copy paste from https://github.com/ZhelinCheng/mint-filter
 */

interface Dict<T> {
	[key: string]: T;
}

class Node {
	// 节点值
	public key: string;
	// 是否为单词最后节点
	public word: boolean;
	// 父节点的引用
	public parent: Node | undefined;
	// 子节点的引用（goto表）
	public children: Dict<Node> = {};
	// failure表，用于匹配失败后的跳转
	public failure: Node | undefined = undefined;

	constructor(
		key: string,
		parent: Node | undefined = undefined,
		word = false
	) {
		this.key = key;
		this.parent = parent;
		this.word = word;
	}
}

class Tree {
	public root: Node;

	constructor() {
		this.root = new Node('root');
	}

	/**
	 * 插入数据
	 * @param key
	 */
	insert(key: string): boolean {
		if (!key) return false;
		const keyArr = key.split('');
		const firstKey = keyArr.shift() as string;
		const children = this.root.children;
		const len = keyArr.length;
		const firstNode = children[firstKey];

		// 第一个key
		if (!firstNode) {
			children[firstKey] = len
				? new Node(firstKey)
				: new Node(firstKey, undefined, true);
		} else if (!len) {
			firstNode.word = true;
		}

		// 其他多余的key
		if (keyArr.length >= 1) {
			this.insertNode(children[firstKey], keyArr);
		}

		return true;
	}

	/**
	 * 插入节点
	 * @param node
	 * @param word
	 */
	insertNode(node: Node, word: string[]): void {
		const len = word.length;

		if (len) {
			const children = node.children;

			const key = word.shift() as string;
			let item = children[key];
			const isWord = len === 1;

			if (!item) {
				item = new Node(key, node, isWord);
			} else if (!item.word) {
				item.word = isWord;
			}

			children[key] = item;
			this.insertNode(item, word);
		}
	}

	/**
	 * 创建Failure表
	 */
	createFailureTable(): void {
		// 获取树第一层
		let currQueue: Array<Node> = Object.values(this.root.children);
		while (currQueue.length > 0) {
			const nextQueue: Array<Node> = [];
			for (let i = 0; i < currQueue.length; i++) {
				const node: Node = currQueue[i];
				const key = node.key;
				const parent = node.parent;
				node.failure = this.root;
				// 获取树下一层
				for (const k in node.children) {
					nextQueue.push(node.children[k]);
				}

				if (parent) {
					let failure: any = parent.failure;
					while (failure) {
						const children: any = failure.children[key];

						// 判断是否到了根节点
						if (children) {
							node.failure = children;
							break;
						}
						failure = failure.failure;
					}
				}
			}

			currQueue = nextQueue;
		}
	}

	/**
	 * 搜索节点
	 * @param key
	 * @param node
	 */
	search(key: string, node: Dict<Node> = this.root.children): Node | false {
		return node[key] ?? false;
	}
}

interface FilterValue {
	text?: string | boolean;
	filter: Array<string | undefined>;
	pass?: boolean;
}

class Mint extends Tree {
	// 是否替换原文本敏感词
	constructor(keywords: Array<string | number>) {
		super();
		if (!(keywords instanceof Array && keywords.length >= 1)) {
			throw Error('Mint：敏感词keywords应该是一个数组！');
		}

		// 创建Trie树
		for (let item of keywords) {
			if (!item) continue;
			item = item.toString();
			if (/[a-z]/i.test(item)) {
				// 有字母
				this.insert(item.toLocaleUpperCase());
			} else {
				this.insert(item);
			}
		}

		this.createFailureTable();
	}

	private filterFunc(
		word: string,
		every = false,
		replace = true
	): FilterValue {
		let startIndex = 0;
		let endIndex = startIndex;
		const wordLen = word.length;
		const originalWord: string = word;
		const filterKeywords: Array<string> = [];
		word = word.toLocaleUpperCase();

		// 保存过滤文本
		const filterTextArr: string[] = [];
		let keyword: string[] = [];

		// 是否通过，无敏感词
		let isPass = true;

		// 下一个Node与当前Node
		let searchNode: Node = this.root;
		// let currNode: Node | boolean

		// 是否开始匹配
		let isStart = false;

		while (endIndex < wordLen) {
			const key: string = word[endIndex];
			let nextNode: Node | false = this.search(key, searchNode.children);
			filterTextArr[endIndex] = key;

			// console.log(endIndex, key)
			// 判断是否找到
			if (nextNode) {
				// keywords += nextNode.key

				if (!isStart) {
					isStart = true;
					startIndex = endIndex;
				}

				if (nextNode.word) {
					// console.log('==>', key, startIndex, endIndex)
					const keywordLen = endIndex - startIndex + 1;
					isStart = isPass = false;
					keyword = filterTextArr.splice(
						startIndex,
						keywordLen,
						'*'.repeat(keywordLen)
					);
					filterKeywords.push(keyword.join(''));
					nextNode = false;
					if (every) break;
				}
			} else if (isStart) {
				isStart = false;
				// 在失配路线上找到子元素
				searchNode = searchNode.failure as Node;
				nextNode = this.search(key, searchNode.children);
				if (nextNode && searchNode.key !== 'root') {
					startIndex = endIndex - 1;
					isStart = isPass = true;
					nextNode = searchNode;
				} else {
					nextNode = false;
				}
				endIndex--;
			} else {
				isStart = false;
			}

			searchNode = nextNode || searchNode.failure || this.root;
			endIndex++;
		}
		const uniqFilter = filterKeywords.filter(
			(v, i, a) => a.indexOf(v) === i
		);

		return {
			text: replace ? filterTextArr.join('') : originalWord,
			filter: uniqFilter,
			pass: isPass
		};
	}

	/**
	 * 同步快速检测字符串是否无敏感词
	 * @param word
	 */
	validator(word: string): boolean {
		return !this.filterFunc(word, true).pass;
	}

	every(word: string): boolean {
		return this.filterFunc(word, true).pass ?? false;
	}

	/**
	 * 同步过滤方法
	 * @param word
	 * @param replace
	 */
	filter(word: string, replace = true): FilterValue {
		return this.filterFunc(word, false, replace);
	}
}
const mint = new Mint(['keyword']);
const no = mint.filter('keywrdstring');
const yes = mint.filter('keywordstring');

log(no.text);
