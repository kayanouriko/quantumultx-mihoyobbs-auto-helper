/**
 * @name 米游社小助手
 * @version v2.3.1
 * @description 摆脱米游社 每天定时自动执行相关任务.
 * @author kayanouriko
 * @homepage https://github.com/kayanouriko/quantumultx-mihoyobbs-auto-helper
 * @thanks chavyleung, 各家应用环境的统一封装
 * @thanks NobyDa, 一些原生算法解决方案参考
 * @thanks https://github.com/Womsxd/AutoMihoyoBBS, v2版本业务逻辑部分基本来自该仓库
 * @thanks https://github.com/daye99/genshin-sign-helper, v1版本业务逻辑部分基本来自该仓库
 * @thanks https://github.com/Azure99/GenshinPlayerQuery/issues/20 关键算法逻辑部分的来源
 * @license MIT
 */

/** env.js 全局 */
const $ = new Env('米游社小助手')

/** 通知相关 */

// 通知的 option
const msgOpt = {
    cookie: {
        'open-url': 'https://github.com/kayanouriko/quantumultx-mihoyobbs-auto-helper'
    },
    normal: {},
}
// 文本信息
const msgText = {
    noti: {
        title: '米游社小助手',
        resultsTitle: '脚本执行完成, 长按通知展开报告或者点击通知在应用内查看报告.\n\n',
        resultsEmpty: '脚本执行完成, 不过貌似没有任务执行了Orz',
        resultsEnd: '报告结果结束!'
    },
    // cookie 相关
    cookie: {
        empty: '请先运行获取 cookie 的脚本. 点击该通知将跳转获取 cookie 的教程页面.'
    },
    common: {
        user: '获取账号信息有误, 错误信息: {0}.',
        uid: '无法正确获取账号信息关键参数.',
        sign: '获取账号签到信息有误, 错误信息: {0}.',
        today: '无法正确获取账号签到信息关键参数.',
        awards: '获取签到奖励信息有误, 错误信息: {0}.',
        award: '无法正确获取签到奖励信息关键参数.',
        error: '错误信息: {0}.'
    },
    // 米游币相关
    micoin: {
        cookie: 'cookie 已过期, 请重新运行 cookie 获取脚本一次.',
        finished: '今日可以获取的米游币已达上限.',
        empty: '查询可执行的米游币任务出错.',
        state: '获取米游社账号米游币任务完成状态出错, 错误信息: {0}.',
        forumid: '配置中的 sections 出错, 请参照脚本配置说明重新配置.',
        list: '在{0}讨论区执行米游币任务:\n',
        listError: '获取帖子列表有误, 错误信息: {0}.',
        listEmpty: '获取到的帖子列表为空.',
        signError: '讨论区签到任务执行失败, 错误信息: {0}.\n',
        sign: '讨论区签到任务完成(米游币+30).\n',
        post: '浏览 3 个帖子任务完成(米游币+20).\n',
        postFail: '浏览 3 个帖子任务未完成, 只成功浏览了 {0} 个帖子.\n',
        vote: '5 次点赞任务完成(米游币+30).\n',
        voteFail: '5 次点赞任务未完成, 只成功点赞了 {0} 个帖子.\n',
        shared: '分享帖子任务完成(米游币+10).\n',
        sharedFail: '分享帖子任务未完成.\n',
        taskEmpty: '不过貌似没有任何米游币任务执行了Orz\n',
        success: '米游币任务操作完成!\n{0}\n',
        error: '米游币任务操作未完成!\n{0}\n\n'
    },
    // 原神签到相关
    genshin: {
        bind: '请先前往米游社 App 手动签到一次!',
        signed: '旅行者"{0}"今日已领取过奖励.',
        success: '原神签到操作完成!\n旅行者"{0}"领取了奖励({1}x{2}).\n\n',
        error: '原神签到操作未完成!\n{0}\n\n',
        riskCode: '触发了风控验证码, 请重新运行脚本或者前往米游社 app 手动签到.'
    },
    // 崩坏3rd签到相关
    honkai3rd: {
        signed: '舰长"{0}"今日已领取过奖励.',
        success: '崩坏3rd签到操作完成!\n舰长"{0}"领取了奖励({1}x{2}).\n\n',
        error: '崩坏3rd签到操作未完成!\n{0}\n\n'
    },
    // 根据类型获取对应的数据
    getMsg(type, key) {
        return this?.[type]?.[key]
    }
}

/** 米游社 api 相关 */

// 米游社的版块
const boards = {
    honkai3rd: {
        forumid: 1,
        key: 'honkai3rd',
        biz: 'bh3_cn',
        actid: 'e202207181446311',
        name: '崩坏3rd',
        url: "https://bbs.mihoyo.com/bh3/",
        getReferer() {
            return `https://webstatic.mihoyo.com/bbs/event/signin/bh3/index.html?bbs_auth_required=true&act_id=${this.actid}&bbs_presentation_style=fullscreen&utm_source=bbs&utm_medium=mys&utm_campaign=icon`
        }
    },
    genshin: {
        forumid: 26,
        key: 'genshin',
        biz: 'hk4e_cn',
        actid: 'e202009291139501',
        name: '原神',
        url: "https://bbs.mihoyo.com/ys/",
        getReferer() {
            return `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${this.actid}&utm_source=bbs&utm_medium=mys&utm_campaign=icon`
        }
    },
    honkai2: {
        forumid: 30,
        biz: 'bh2_cn',
        actid: 'e202203291431091',
        name: '崩坏学园2',
        url: "https://bbs.mihoyo.com/bh2/"
    },
    tears: {
        forumid: 37,
        biz: 'nxx_cn',
        name: '未定事件簿',
        url: "https://bbs.mihoyo.com/wd/"
    },
    house: {
        forumid: 34,
        name: '大别野',
        url: "https://bbs.mihoyo.com/dby/"
    },
    honkaisr: {
        forumid: 52,
        name: '崩坏: 星穹铁道',
        url: "https://bbs.mihoyo.com/sr/"
    }
}

/** 请求 url 相关 */
const api = {
    // 获取用户信息(所有游戏通用, 通过不同的游戏 biz 获取绑定的账号信息)
    getUserInfo: 'https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz={0}',
    // bbs 论坛
    micoin: {
        // 获取用户任务完成状态
        getUserMissionState: 'https://bbs-api.mihoyo.com/apihub/sapi/getUserMissionsState',
        // 获取对应版块的帖子列表
        getForumPostList: 'https://bbs-api.mihoyo.com/post/api/getForumPostList?forum_id={0}&is_good=false&is_hot=false&page_size=20&sort_type=1',
        // 讨论区签到
        postSignIn: 'https://bbs-api.mihoyo.com/apihub/app/api/signIn',
        // 浏览帖子
        getPostFull: 'https://bbs-api.mihoyo.com/post/api/getPostFull?post_id={0}',
        // 点赞
        postUpVotePost: 'https://bbs-api.mihoyo.com/apihub/sapi/upvotePost',
        // 分享
        getShareConf: 'https://bbs-api.mihoyo.com/apihub/api/getShareConf?entity_id={0}&entity_type=1'
    },
    // 原神签到
    genshin: {
        // 签到状态
        getSignInfo: 'https://api-takumi.mihoyo.com/event/bbs_sign_reward/info?region={0}&act_id={1}&uid={2}',
        // 签到奖励
        getSignAwards: 'https://api-takumi.mihoyo.com/event/bbs_sign_reward/home?act_id={0}',
        // 签到操作
        postSign: 'https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign'
    },
    honkai3rd: {
        // 签到状态
        getSignInfo: 'https://api-takumi.mihoyo.com/event/luna/info?lang=zh-cn&region={0}&act_id={1}&uid={2}',
        // 奖励信息
        getSignAwards: 'https://api-takumi.mihoyo.com/event/luna/home?lang=zh-cn&act_id={0}',
        // 签到操作
        postSign: 'https://api-takumi.mihoyo.com/event/luna/sign'
    },
    getApi(type) {
        return this[type]
    }
}

/** cookie */
// 米游币相关的 cookie
const bbsCookie = $.getdata('kayanouriko_mihoyobbs_cookie_bbs')
// 签到相关的 cookie
const signCookie = $.getdata('kayanouriko_mihoyobbs_cookie_sign')

/**
 * 脚本的配置文件
 * 用户可以自定义配置, 每项设置均有说明, 脚本默认不做修改就能运行.
 * @param {array} tasks 需要自动执行的任务, 填入数组即可 
 *                      1. 米游币任务 2. 原神签到 3. 崩坏 3rd 签到
 *                      默认为 [1, 2, 3], 执行米游币, 原神, 崩坏3rd 3 个任务
 * @param {object} micoin 米游币任务的配置项, 只有 tasks 项存在 1 时, 该配置项的内容才会生效
 * @param {array} scetions 需要执行米游币任务的讨论区, 填入数字数组即可
 *                         1. 崩坏3, 26. 原神 30. 崩坏学园2 37. 未定事件簿 34. 大别野 52. 崩坏：星穹铁道
 *                         默认为 [34], 即在大别野帖子列表执行米游币任务(看帖子, 点赞和分享帖子)
 *                         后续可能会支持自动执行分区的经验任务, 所以这里用数组, 填写多个id也是没问题的(例如: [34, 26]), 但是暂时没什么, 脚本只会使用到数组里面的第一个id
 * @param {array} actions 需要执行的米游币任务, 填入数字数组即可
 *                        58. 讨论区签到 59. 浏览 3 个帖子 60. 完成 5 次点赞 61. 分享帖子
 *                        默认为 [58, 59, 60, 61], 执行米游社的全部任务
 */

const defaultConfig = {
    tasks: [1, 2, 3],
    micoin: {
        sections: [34],
        actions: [58, 59, 60, 61]
    }
}

let config = $.getdata('kayanouriko_mihoyobbs_config')

//==== 主入口 ====
main()

async function main() {
    try {
        // 如果用户没用运行过 config 设置脚本, 则采用默认的, 否则使用用户自定义的
        if (!config) {
            config = defaultConfig
        } else {
            config = JSON.parse(config)
        }
        // 执行任务流程
        let results = msgText.noti.resultsTitle
        for (const id of config.tasks) {
            switch (id) {
                case 1:
                    await checkBBSCookie()
                    const micoinResult = await micoinTask()
                    results += micoinResult
                    break
                case 2:
                    await checkSignCookie()
                    const genshinResult = await genshinSignTask()
                    results += genshinResult
                    break
                case 3:
                    await checkSignCookie()
                    const honkai3rdResult = await honkai3rdSignTask()
                    results += honkai3rdResult
                    break
                default:
                    break
            }
            await randomSleepAsync()
        }
        if (results === msgText.noti.resultsTitle) {
            results = msgText.noti.resultsEmpty
        } else {
            results += msgText.noti.resultsEnd
        }
        notify(results, msgOpt.normal)
    } catch (error) {
        const option = error === msgText.cookie.empty ? msgOpt.cookie : msgOpt.normal
        notify(error.message || error, option)
    } finally {
        $.done()
    }
}

//==== cookie 检查 ====
function checkSignCookie() {
    if (!signCookie) {
        return Promise.reject(msgText.cookie.empty)
    }
}

function checkBBSCookie() {
    if (!bbsCookie) {
        return Promise.reject(msgText.cookie.empty)
    }
}

//==== 米游币任务 ====
// @todo 这里少请求一个米游社用户信息的接口, 获取不到 cookie 的 nickname, 最后脚本提醒时无法显示用户名字
async function micoinTask() {
    try {
        // 获取执行任务的 board
        const forumid = config.micoin.sections?.[0] ?? 10000
        const board = findBoardByID(forumid)
        if (board === undefined) {
            return Promise.resolve(String.format(msgText.micoin.error, msgText.micoin.forumid))
        }
        // 获取任务列表
        const tasks = await getUserMissionState()
        // 在执行任务之前, 先获取帖子列表
        const lists = await getForumPostList(forumid)
        await randomSleepAsync()
        let results = String.format(msgText.micoin.list, board.name)
        // 开始循环执行任务
        for (const task of tasks) {
            // 如果配置内不包含该任务, 则跳过执行
            if (config.micoin.actions.indexOf(task.id) === -1) { continue }
            // 任务已经完成的也跳过
            if (task.isGetAward) { continue }
            // 否则执行任务
            switch (task.id) {
                case 58:
                    // 讨论区签到
                    const signResult = await postSignIn(forumid)
                    results += signResult
                    await randomSleepAsync()
                    break
                case 59:
                    // 看帖子
                    let postCount = task.times
                    for (let i = task.times; i < 3; i++) {
                        postCount += await getPostFull(lists?.[i])
                        await randomSleepAsync()
                    }
                    results += postCount === 3 ? msgText.micoin.post : String.format(msgText.micoin.postFail, postCount)
                    break
                case 60:
                    // 帖子点赞
                    let voteCount = task.times
                    for (let i = task.times; i < 5; i++) {
                        voteCount += await postUpVotePost(lists?.[i])
                        await randomSleepAsync()
                    }
                    results += voteCount === 5 ? msgText.micoin.vote : String.format(msgText.micoin.voteFail, voteCount)
                    break
                case 61:
                    // 分享
                    const sharedCode = await getShareConf(lists?.[0])
                    const sharedResult = sharedCode === 0 ? msgText.micoin.shared : msgText.micoin.sharedFail
                    results += sharedResult
                    await randomSleepAsync()
                    break
                default:
                    break
            }
        }
        if (results === String.format(msgText.micoin.list, board.name)) {
            results = msgText.micoin.taskEmpty
        }
        return Promise.resolve(String.format(msgText.micoin.success, results))
    } catch (error) {
        return Promise.resolve(String.format(msgText.micoin.error, error.message || (error instanceof Object ? JSON.stringify(error) : error)))
    }
}

// 获取用户的任务状态
function getUserMissionState() {
    const option = {
        url: api.micoin.getUserMissionState,
        headers: getBBSHeaders()
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode === -100) {
            // cookie 失效, 需特别处理
            return Promise.reject(msgText.micoin.cookie)
        } else if (retcode === 0) {
            // 今日还能获取的任务米游币
            const getCoinsCount = data?.['can_get_points'] ?? 0
            if (getCoinsCount === 0) {
                // 已经无法通过任务获取米游币
                return Promise.reject(msgText.micoin.finished)
            }
            const states = data?.states ?? []
            let halfTasks = []
            for (const state of states) {
                const id = state?.['mission_id'] ?? 10000
                const times = state?.['happened_times'] ?? 0
                const isGetAward = state?.['is_get_award'] ?? true
                // 小于 62 的均为米游币任务
                if (id < 62) {
                    halfTasks.push({
                        id,
                        times,
                        isGetAward
                    })
                }
            }
            // 创建 task 数组
            const tasks = [58, 59, 60, 61].map(id => {
                let task = halfTasks.find(e => e.id === id)
                if (!task) {
                    task = {
                        id,
                        times: 0,
                        isGetAward: false
                    }
                }
                return task
            })
            return tasks
        } else {
            // 其余情况返回接口的报错信息
            return Promise.reject(String.format(msgText.micoin.state, message))
        }
    })
}

// 获取帖子列表
function getForumPostList(forumid) {
    const option = {
        url: String.format(api.micoin.getForumPostList, forumid),
        headers: getBBSHeaders()
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) { 
            return Promise.reject(String.format(msgText.micoin.listError, message))
        }
        const lists = data?.list ?? []
        if (lists.length === 0) {
            return Promise.reject(msgText.micoin.listEmpty)
        }
        return lists
    })
}

// 讨论区签到
function postSignIn(forumid) {
    const json = {
        'gids': forumid
    }
    const option = {
        url: api.micoin.postSignIn,
        headers: getBBSHeaders(JSON.stringify(json)),
        body: JSON.stringify(json)
    }
    return $.http.post(option).then(res => {
        const { retcode, message } = JSON.parse(res.body)
        if (retcode !== 0) {
            // 签到操作未完成, 但是下面的任务还需要继续, 所以返回提示文本
            return String.format(msgText.micoin.signError, message)
        }
        return msgText.micoin.sign
    })
}

// 浏览帖子任务
function getPostFull(post) {
    const postid = post?.post?.['post_id']
    if (!postid) { return 0 }
    const option = {
        url: String.format(api.micoin.getPostFull, postid),
        headers: getBBSHeaders()
    }
    return $.http.get(option).then(res => {
        const { retcode } = JSON.parse(res.body)
        return retcode === 0 ? 1 : 0
    })
}

// 点赞任务
function postUpVotePost(post) {
    const postid = post?.post?.['post_id']
    if (!postid) { return 0 }
    const json = {
        'post_id': postid,
        'is_cancel': false
    }
    const option = {
        url: api.micoin.postUpVotePost,
        headers: getBBSHeaders(),
        body: JSON.stringify(json)
    }
    return $.http.post(option).then(res => {
        const { retcode } = JSON.parse(res.body)
        return retcode === 0 ? 1 : 0
    })
}

// 分享任务
function getShareConf(post) {
    const postid = post?.post?.['post_id']
    if (!postid) { 
        return 0
    }
    const option = {
        url: String.format(api.micoin.getShareConf, postid),
        headers: getBBSHeaders()
    }
    return $.http.get(option).then(res => {
        const { retcode } = JSON.parse(res.body)
        return retcode
    })
}


//==== 原神签到 ====

// 主入口
async function genshinSignTask() {
    try {
        // 获取 cookie 所属的账号信息
        const { game_uid, region, nickname } = await getUserInfo(boards.genshin)
        // 获取账号签到信息 (签到次数)
        const total = await getGenshinSignInfo(game_uid, region, nickname)
        // 获取奖励列表信息
        const { name, count } = await getGenshinSignAwards(total)
        // 签到操作
        await postSign(boards.genshin, game_uid, region)
        return Promise.resolve(String.format(msgText.genshin.success, nickname, name, count))
    } catch (error) {
        return Promise.resolve(String.format(msgText.genshin.error, error.message || (error instanceof Object ? JSON.stringify(error) : error)))
    }
}

// 获取账号签到信息
function getGenshinSignInfo(game_uid, region, nickname) {
    const option = {
        url: String.format(api.genshin.getSignInfo, region, boards.genshin.actid, game_uid),
        headers: getHeaders(boards.genshin)
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.sign, message))
        }
        const total_sign_day = data?.['total_sign_day']
        const first_bind = data?.['first_bind']
        const is_sign = data?.['is_sign']
        if (total_sign_day !== undefined && first_bind !== undefined && is_sign !== undefined) {
            // 未绑定
            if (first_bind) {
                return Promise.reject(msgText.genshin.bind)
            }
            // 已签到
            if (is_sign) {
                return Promise.reject(String.format(msgText.genshin.signed, nickname))
            }
            // 返回总签到次数
            return total_sign_day
        } else {
            return Promise.reject(msgText.common.today)
        }
    })
}

// 获取签到奖励信息
function getGenshinSignAwards(total) {
    const option = {
        url: String.format(api.genshin.getSignAwards, boards.genshin.actid),
        headers: getHeaders(boards.genshin)
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.awards, message))
        }
        const name = data?.awards?.[total]?.name
        const cnt = data?.awards?.[total]?.cnt
        if (name && cnt) {
            return {
                name,
                count: cnt
            }
        } else {
            return Promise.reject(msgText.common.award)
        }
    })
}

//==== 崩坏 3rd 签到 ====

// 主入口
async function honkai3rdSignTask() {
    try {
        // 获取账号信息
        const { game_uid, region, nickname } = await getUserInfo(boards.honkai3rd)
        // 获取签到信息
        const total = await getHonkai3rdSignInfo(game_uid, region, nickname)
        // 获取奖励信息
        const { name, count } = await getHonkai3rdSignAwards(total)
        // 签到操作
        await postSign(boards.honkai3rd, game_uid, region)
        return Promise.resolve(String.format(msgText.honkai3rd.success, nickname, name, count))
    } catch (error) {
        return Promise.resolve(String.format(msgText.honkai3rd.error, error.message || (error instanceof Object ? JSON.stringify(error) : error)))
    }
}

// 获取签到状态
function getHonkai3rdSignInfo(game_uid, region, nickname) {
    const option = {
        url: String.format(api.honkai3rd.getSignInfo, region, boards.honkai3rd.actid, game_uid),
        headers: getHeaders(boards.honkai3rd)
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.sign, message))
        }
        const isSign = data?.['is_sign'] ?? false
        if (isSign) {
            // 已经签到完成
            return Promise.reject(String.format(msgText.honkai3rd.signed, nickname))
        }
        const total = data?.['total_sign_day']
        if (total !== undefined) {
            return total
        } else {
            return Promise.reject(msgText.common.today)
        }
    })
}

// 获取奖励信息
function getHonkai3rdSignAwards(total) {
    const option = {
        url: String.format(api.honkai3rd.getSignAwards, boards.honkai3rd.actid),
        headers: getHeaders(boards.honkai3rd)
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.awards, message))
        }
        const name = data?.awards?.[total]?.name
        const cnt = data?.awards?.[total]?.cnt
        if (name && cnt) {
            return {
                name,
                count: cnt
            }
        } else {
            return Promise.reject(msgText.common.award)
        }
    })
}

//==== 签到任务 ====
// @todo 签到任务大概率是接口通用的, 只是部分参数不一样, 可以构造通用方法, 方便后续整合崩2, 事件簿, 铁道等

// 获取账号信息 通用
function getUserInfo(board) {
    const option = {
        url: String.format(api.getUserInfo, board.biz),
        headers: getHeaders(board)
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.user, message))
        }
        const game_uid = data?.list?.[0]?.game_uid
        const region = data?.list?.[0]?.region
        const nickname = data?.list?.[0]?.nickname
        // 取出必要数据
        if (game_uid && region && nickname) {
            return {
                game_uid,
                region,
                nickname
            }
        } else {
            // 无法获取到正确的 uid, region, nickname
            return Promise.reject(msgText.common.uid)
        }
    })
}

// 游戏签到操作 逻辑通用, 根据传入的 board 构建不同的参数
function postSign(board, game_uid, region) {
    const body = {
        act_id: board.actid,
        region,
        uid: game_uid
    }
    const option = {
        url: api.getApi(board.key).postSign,
        headers: getHeaders(board),
        body: JSON.stringify(body)
    }
    return $.http.post(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.error, message))
        }
        if (board.forumid === 26) {
            // 原神游戏签到需要进一步的判断是否触发风险验证码
            const riskCode = data?.['risk_code'] ?? 0
            if (riskCode !== 0) {
                return Promise.reject(msgText.genshin.riskCode)
            }
        }
    })
}

//============== 辅助函数 ==========================

/** 调用系统通知 */
function notify(message, option) {
    $.msg(msgText.noti.title, '', message, option)
}

/** 随机睡眠 */
async function randomSleepAsync() {
    const s = random(2, 5)
    await sleep(s)
}

/** 休眠 n 秒 */
function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

/** 获取 [n, m] 区间的某个随机数 */
function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

// 通过 id 获取对应的 board
function findBoardByID(forumid) {
    for (const key in boards) {
        if (Object.prototype.hasOwnProperty.call(boards, key)) {
            const board = boards[key]
            if (board.forumid === forumid) {
                return board
            }
        }
    }
}

/** 米游社 api headers */

// 通用参数
const headers = {
    // 论坛米游币相关参数
    clientType: '2',
    salt: 'ZSHlXeQUBis52qD1kEgKt5lUYed4b7Bb',
    saltV2: 't0qEgfub6cvueAPgR5m9aQWWVciEer7v',
    host: 'bbs-api.mihoyo.com',
    // 游戏签到相关, 内嵌 webview, 所以用的是 web 相关参数
    clientTypeWeb: '5',
    saltWeb: 'N50pqm7FSy2AkFz2B3TqtuZMJ5TOl3Ep',
    hostWeb: 'api-takumi.mihoyo.com',
    // 通用参数
    appVersion: '2.35.2',
    userAgent: `Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/${this.appVersion}`,
    deviceId: uuidv4().replace('-', '').toLocaleUpperCase(),
    referer: 'https://app.mihoyo.com/'
}

// 构建基础 headers
function getBaseHeaders() {
    return {
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'x-rpc-device_id': headers.deviceId,
        'User-Agent': headers.userAgent,
        'x-rpc-channel': 'appstore',
        'x-rpc-app_version': headers.appVersion,
        'x-requested-with': 'com.mihoyo.hyperion',
        'Content-Type': 'application/json;charset=UTF-8'
    }
}

// 游戏签到的 headers, 用的是 webview , 所以用的是 web 相关的参数
function getHeaders(board) {
    let gameHeaders = getBaseHeaders()
    gameHeaders['Referer'] = board.getReferer()
    gameHeaders['Host'] = headers.hostWeb
    gameHeaders['DS'] = getDS(headers.saltWeb)
    gameHeaders['x-rpc-client_type'] = headers.clientTypeWeb
    gameHeaders['Cookie'] = signCookie
    return gameHeaders
}

// 米游币任务的 headers
function getBBSHeaders(json) {
    let bbsHeaders = getBaseHeaders()
    bbsHeaders['Referer'] = headers.referer
    bbsHeaders['Host'] = headers.host
    bbsHeaders['DS'] = json ? getDSV2(headers.saltV2, '', json) : getDS(headers.salt)
    bbsHeaders['x-rpc-client_type'] = headers.clientType
    bbsHeaders['Cookie'] = bbsCookie
    return bbsHeaders
}

/** ds 获取 */
// 备注1: x-rpc-client_type 参数: 游戏签到是内嵌 webview 所以用 5 为 web mobile, 米游币为 api 请求 所以用 2 为 安卓
// 备注2: salt 与 x-rpc-app_version 和 x-rpc-client_type 都是联动的
function getDS(n) {
    const i = Math.floor(new Date().getTime() / 1000) + ''
    const r = getRandomString(6)
    const c = md5(`salt=${n}&t=${i}&r=${r}`)
    return `${i},${r},${c}`
}

// ds 的 v2 版本, 目前只有米游币任务签到接口用
// n: salt
// q: 目前暂时不清楚作用, 传空字符串
// b: body 的 json 字符串
function getDSV2(n, q, b) {
    const i = Math.floor(new Date().getTime() / 1000) + ''
    const r = `${getRandomInt(100001, 200000)}`
    const c = md5(`salt=${n}&t=${i}&r=${r}&b=${b}&q=${q}`)
    return `${i},${r},${c}`
}

/** 随机字符串获取 */
function getRandomString(count) {
    const d = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    const t = d.length
    let n = ''
    for (var i = 0; i < count; i++) n += d.charAt(Math.floor(Math.random() * t))
    return n
}

/** 生成 [n, m] 的随机整数 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

//============= 类与原型上添加方法 ======================

/** 格式化字符串 */
String.format = function (string, ...args) {
    let formatted = string
    for (let i = 0; i < args.length; i++) {
        formatted = formatted.replace('{' + i + '}', args[i])
    }
    return formatted
}

//============== 第三方辅助函数 =========================

/**
 * uuidv4 生成器简易版本实现
 * @see https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
 */
function uuidv4() {
    const chars = '0123456789abcdef'.split('')

    const uuid = []
    const rnd = Math.random
    let r = 0
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4' // version 4

    for (var i = 0; i < 36; i++) {
        if (!uuid[i]) {
            r = 0 | (rnd() * 16)
            uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r & 0xf]
        }
    }
    return uuid.join('')
}

/**
 * 从 NobyDa 脚本里面获取到的原生 md5 函数
 * @see https://github.com/blueimp/JavaScript-MD5
 */
function md5(string){function RotateLeft(lValue,iShiftBits){return(lValue<<iShiftBits)|(lValue>>>(32-iShiftBits))}function AddUnsigned(lX,lY){var lX4,lY4,lX8,lY8,lResult;lX8=(lX&0x80000000);lY8=(lY&0x80000000);lX4=(lX&0x40000000);lY4=(lY&0x40000000);lResult=(lX&0x3FFFFFFF)+(lY&0x3FFFFFFF);if(lX4&lY4){return(lResult^0x80000000^lX8^lY8)}if(lX4|lY4){if(lResult&0x40000000){return(lResult^0xC0000000^lX8^lY8)}else{return(lResult^0x40000000^lX8^lY8)}}else{return(lResult^lX8^lY8)}}function F(x,y,z){return(x&y)|((~x)&z)}function G(x,y,z){return(x&z)|(y&(~z))}function H(x,y,z){return(x^y^z)}function I(x,y,z){return(y^(x|(~z)))}function FF(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(F(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)};function GG(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(G(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)};function HH(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(H(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)};function II(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(I(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)};function ConvertToWordArray(string){var lWordCount;var lMessageLength=string.length;var lNumberOfWords_temp1=lMessageLength+8;var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1%64))/64;var lNumberOfWords=(lNumberOfWords_temp2+1)*16;var lWordArray=Array(lNumberOfWords-1);var lBytePosition=0;var lByteCount=0;while(lByteCount<lMessageLength){lWordCount=(lByteCount-(lByteCount%4))/4;lBytePosition=(lByteCount%4)*8;lWordArray[lWordCount]=(lWordArray[lWordCount]|(string.charCodeAt(lByteCount)<<lBytePosition));lByteCount++}lWordCount=(lByteCount-(lByteCount%4))/4;lBytePosition=(lByteCount%4)*8;lWordArray[lWordCount]=lWordArray[lWordCount]|(0x80<<lBytePosition);lWordArray[lNumberOfWords-2]=lMessageLength<<3;lWordArray[lNumberOfWords-1]=lMessageLength>>>29;return lWordArray};function WordToHex(lValue){var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;for(lCount=0;lCount<=3;lCount++){lByte=(lValue>>>(lCount*8))&255;WordToHexValue_temp="0"+lByte.toString(16);WordToHexValue=WordToHexValue+WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2)}return WordToHexValue};function Utf8Encode(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c)}else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128)}else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128)}}return utftext};var x=Array();var k,AA,BB,CC,DD,a,b,c,d;var S11=7,S12=12,S13=17,S14=22;var S21=5,S22=9,S23=14,S24=20;var S31=4,S32=11,S33=16,S34=23;var S41=6,S42=10,S43=15,S44=21;string=Utf8Encode(string);x=ConvertToWordArray(string);a=0x67452301;b=0xEFCDAB89;c=0x98BADCFE;d=0x10325476;for(k=0;k<x.length;k+=16){AA=a;BB=b;CC=c;DD=d;a=FF(a,b,c,d,x[k+0],S11,0xD76AA478);d=FF(d,a,b,c,x[k+1],S12,0xE8C7B756);c=FF(c,d,a,b,x[k+2],S13,0x242070DB);b=FF(b,c,d,a,x[k+3],S14,0xC1BDCEEE);a=FF(a,b,c,d,x[k+4],S11,0xF57C0FAF);d=FF(d,a,b,c,x[k+5],S12,0x4787C62A);c=FF(c,d,a,b,x[k+6],S13,0xA8304613);b=FF(b,c,d,a,x[k+7],S14,0xFD469501);a=FF(a,b,c,d,x[k+8],S11,0x698098D8);d=FF(d,a,b,c,x[k+9],S12,0x8B44F7AF);c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);a=FF(a,b,c,d,x[k+12],S11,0x6B901122);d=FF(d,a,b,c,x[k+13],S12,0xFD987193);c=FF(c,d,a,b,x[k+14],S13,0xA679438E);b=FF(b,c,d,a,x[k+15],S14,0x49B40821);a=GG(a,b,c,d,x[k+1],S21,0xF61E2562);d=GG(d,a,b,c,x[k+6],S22,0xC040B340);c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);b=GG(b,c,d,a,x[k+0],S24,0xE9B6C7AA);a=GG(a,b,c,d,x[k+5],S21,0xD62F105D);d=GG(d,a,b,c,x[k+10],S22,0x2441453);c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);b=GG(b,c,d,a,x[k+4],S24,0xE7D3FBC8);a=GG(a,b,c,d,x[k+9],S21,0x21E1CDE6);d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);c=GG(c,d,a,b,x[k+3],S23,0xF4D50D87);b=GG(b,c,d,a,x[k+8],S24,0x455A14ED);a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);d=GG(d,a,b,c,x[k+2],S22,0xFCEFA3F8);c=GG(c,d,a,b,x[k+7],S23,0x676F02D9);b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);a=HH(a,b,c,d,x[k+5],S31,0xFFFA3942);d=HH(d,a,b,c,x[k+8],S32,0x8771F681);c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);a=HH(a,b,c,d,x[k+1],S31,0xA4BEEA44);d=HH(d,a,b,c,x[k+4],S32,0x4BDECFA9);c=HH(c,d,a,b,x[k+7],S33,0xF6BB4B60);b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);d=HH(d,a,b,c,x[k+0],S32,0xEAA127FA);c=HH(c,d,a,b,x[k+3],S33,0xD4EF3085);b=HH(b,c,d,a,x[k+6],S34,0x4881D05);a=HH(a,b,c,d,x[k+9],S31,0xD9D4D039);d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);b=HH(b,c,d,a,x[k+2],S34,0xC4AC5665);a=II(a,b,c,d,x[k+0],S41,0xF4292244);d=II(d,a,b,c,x[k+7],S42,0x432AFF97);c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);b=II(b,c,d,a,x[k+5],S44,0xFC93A039);a=II(a,b,c,d,x[k+12],S41,0x655B59C3);d=II(d,a,b,c,x[k+3],S42,0x8F0CCC92);c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);b=II(b,c,d,a,x[k+1],S44,0x85845DD1);a=II(a,b,c,d,x[k+8],S41,0x6FA87E4F);d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);c=II(c,d,a,b,x[k+6],S43,0xA3014314);b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);a=II(a,b,c,d,x[k+4],S41,0xF7537E82);d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);c=II(c,d,a,b,x[k+2],S43,0x2AD7D2BB);b=II(b,c,d,a,x[k+9],S44,0xEB86D391);a=AddUnsigned(a,AA);b=AddUnsigned(b,BB);c=AddUnsigned(c,CC);d=AddUnsigned(d,DD)}var temp=WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);return temp.toLowerCase()}

/**
 * Env 各家应用环境适配
 * @see https://github.com/chavyleung/scripts/blob/master/Env.min.js
 */
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}