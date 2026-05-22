import type { FriendLink, FriendsPageConfig } from "../types/config";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		title: "精弘 RSS 看板",
		imgurl: "https://static.031130.xyz/uploads/2024/12/31/71b730c8be4a8.webp",
		desc: "浙工大精弘网络技术团队",
		siteurl: "https://zjutjh.github.io/",
		tags: ["支持精弘网络谢谢喵"],
		weight: 500000,
		enabled: true,
	},
	{
		title: "毛衣",
		imgurl: "https://imjh.top/avatar.jpg",
		desc: "Mai's blog",
		siteurl: "https://blog.imjh.top/",
		tags: ["中登"],
		weight: 18000,
		enabled: true,
	},
	{
		title: "勾勾",
		imgurl: "https://www.mggovo.cn/img/icon.png",
		desc: "MangoGovo's Blog",
		siteurl: "https://www.mggovo.cn/",
		tags: ["中登"],
		weight: 17000,
		enabled: true,
	},
	{
		title: "hstardawn",
		imgurl: "https://hstardawn.github.io/img/preview.gif",
		desc: "星起之地",
		siteurl: "https://hstardawn.github.io/",
		tags: ["中登"],
		weight: 16000,
		enabled: true,
	},
	{
		title: "SeSame",
		imgurl: "https://blog.minhan.host/img/avatar.jpg",
		desc: "敏涵の记事本",
		siteurl: "https://blog.minhan.host/",
		tags: ["中登"],
		weight: 15000,
		enabled: true,
	},
	{
		title: "折乙",
		imgurl: "https://blog.fridayssheep.top/upload/zheyi.webp",
		desc: "折乙 - Blog",
		siteurl: "https://zheyi.in/",
		tags: ["中登"],
		weight: 14000,
		enabled: true,
	},
	{
		title: "DumbDaiDai",
		imgurl: "https://zheyi.in/image/%E8%9B%8B%E6%B6%B2.jpg",
		desc: "素心阁",
		siteurl: "https://dumbdaidai.github.io/",
		tags: ["中登"],
		weight: 13000,
		enabled: true,
	},
	{
		title: "SituChengxiang",
		imgurl: "https://s41.ax1x.com/2026/02/13/pZqMzSx.png",
		desc: "司徒和丞相的博客",
		siteurl: "https://situchengxiang.pages.dev/",
		tags: ["中登"],
		weight: 12000,
		enabled: true,
	},
	{
		title: "望舒",
		imgurl: "https://qiuniu.phlin.cn/bucket/icon.png",
		desc: "望舒的尘歌壶",
		siteurl: "https://blog.phlin.cn/",
		tags: ["老登"],
		weight: 1100,
		enabled: true,
	},
	{
		title: "青鸟",
		imgurl: "https://blog.bluebird.icu/config/head.jpg",
		desc: "青鸟のBlog",
		siteurl: "https://blog.bluebird.icu/",
		tags: ["老登"],
		weight: 1000,
		enabled: true,
	},
	{
		title: "惜寞",
		imgurl: "https://www.lonesome.cn/assets/avatar.png",
		desc: "惜寞的无人小间",
		siteurl: "https://www.lonesome.cn/",
		tags: ["老登"],
		weight: 900,
		enabled: true,
	},
	{
		title: "zhullyb",
		imgurl: "https://static.031130.xyz/avatar.webp",
		desc: "竹林里有冰的博客",
		siteurl: "https://zhul.in/",
		tags: ["老登"],
		weight: 800,
		enabled: true,
	},
	{
		title: "Fridayssheep",
		imgurl: "https://blog.fridayssheep.top/upload/acd23f29-4e54-4f25-86e3-3b7f76b62445.png",
		desc: "Fridayssheep的鲸湾",
		siteurl: "https://blog.fridayssheep.top/",
		tags: ["小登"],
		weight: 70,
		enabled: true,
	},
	{
		title: "EliadOArias",
		imgurl: "https://eliadoarias.top/img/logo/logo.png",
		desc: "EArias's 垃圾桶",
		siteurl: "https://eliadoarias.top/",
		tags: ["小登"],
		weight: 60,
		enabled: true,
	},
	{
		title: "资源管理器",
		imgurl: "https://cos.zyglq.cn/static/web-logo.jpg",
		desc: "资源管理器的博客",
		siteurl: "https://www.zyglq.cn/",
		tags: ["大佬"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Purofle",
		imgurl: "https://avatars.githubusercontent.com/u/37149302",
		desc: "日落果的Blog",
		siteurl: "https://blog.archlinux.tech/",
		tags: ["大佬"],
		weight: 4,
		enabled: true,
	},
	{
		title: "xtex",
		imgurl: "https://avatars.githubusercontent.com/u/46394906",
		desc: "xtex's Blog",
		siteurl: "https://blog.xtexx.eu.org/",
		tags: ["大佬"],
		weight: 3,
		enabled: true,
	},
	{
		title: "KitraMGP",
		imgurl: "https://blog.kitramgp.cn/img/kitra1.jpg",
		desc: "Kitra 的遐想空间",
		siteurl: "https://blog.kitramgp.cn/",
		tags: ["大佬"],
		weight: 2,
		enabled: true,
	},
	{
		title: "suny",
		imgurl: "https://pic1.imgdb.cn/item/6891f04e58cb8da5c806dce6.jpg",
		desc: "suny 的博客",
		siteurl: "https://www.sunynov.top/",
		tags: ["大佬"],
		weight: 1,
		enabled: true,
	},
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
