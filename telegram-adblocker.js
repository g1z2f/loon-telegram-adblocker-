/**
 * Telegram 广告屏蔽脚本（增强版）
 * 用于拦截和过滤 Telegram API 响应中的赞助广告内容
 * 
 * 支持的功能：
 * - 移除频道中的 Sponsored Messages（赞助消息）
 * - 过滤推广内容
 * - 屏蔽广告追踪数据
 * - 处理频道顶部的赞助消息（蓝色"广告"标签）
 * - 支持多种 Telegram API 响应结构
 * 
 * @author Loon Telegram AdBlocker
 * @version 2.0.0
 */

const SCRIPT_NAME = 'Telegram AdBlocker';
const VERSION = '2.0.0';
const DEBUG_MODE = true; // 设置为 false 以减少日志输出

// 广告相关的关键字列表
const AD_KEYWORDS = [
    'sponsored',
    'sponsored_message',
    'sponsoredMessage',
    'sponsoredmessage',
    'ads',
    'advertisement',
    'promotion',
    'promoted',
    'adsgram',
    'peer_color', // Telegram 赞助消息特有字段
    'sponsor'
];

/**
 * 日志函数
 */
function log(message, isDebug = false) {
    if (!isDebug || DEBUG_MODE) {
        console.log(`[${SCRIPT_NAME} v${VERSION}] ${message}`);
    }
}

/**
 * 主处理函数
 */
function handleResponse() {
    try {
        const url = $request.url || '';
        log(`处理请求: ${url.substring(0, 100)}...`, true);
        
        // 获取响应体
        let body = $response.body;
        
        if (!body) {
            log('响应体为空，跳过处理', true);
            return { body: $response.body };
        }

        // 尝试解析 JSON
        let obj;
        try {
            obj = JSON.parse(body);
        } catch (e) {
            log('非 JSON 响应，跳过处理', true);
            return { body: $response.body };
        }

        // 记录原始数据（调试用）
        const originalSize = JSON.stringify(obj).length;
        let adsRemoved = 0;
        
        // 首先使用专门的 Telegram 响应清理函数
        const context = { count: 0 };
        const cleanResult = cleanTelegramResponse(obj, context);
        obj = cleanResult.obj;
        
        // 然后使用通用的递归移除函数进行二次清理
        const result = removeAds(obj, context);
        obj = result.obj;
        adsRemoved = result.count;
        
        // 计算处理后的大小
        const modifiedSize = JSON.stringify(obj).length;
        
        if (adsRemoved > 0) {
            log(`✓ 成功移除 ${adsRemoved} 个广告项 (${originalSize} -> ${modifiedSize} bytes)`);
        } else if (originalSize !== modifiedSize) {
            log(`处理完成 (${originalSize} -> ${modifiedSize} bytes)`, true);
        }

        // 返回修改后的响应
        return { body: JSON.stringify(obj) };
        
    } catch (error) {
        log(`❌ 处理异常: ${error.message}\n${error.stack}`);
        return { body: $response.body };
    }
}

/**
 * 递归移除对象中的广告内容
 * @param {*} obj - 要处理的对象
 * @param {Object} context - 上下文对象，用于追踪统计信息
 * @returns {Object} 包含处理后对象和统计信息的结果
 */
function removeAds(obj, context = { count: 0 }) {
    if (!obj || typeof obj !== 'object') {
        return { obj, count: context.count };
    }

    // 处理数组
    if (Array.isArray(obj)) {
        const filteredArray = [];
        for (let i = 0; i < obj.length; i++) {
            const item = obj[i];
            if (isAdContent(item)) {
                log(`✓ 移除数组中的广告项 [${i}]`, true);
                context.count++;
                continue;
            }
            const result = removeAds(item, context);
            filteredArray.push(result.obj);
        }
        return { obj: filteredArray, count: context.count };
    }

    // 处理对象
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            // 跳过广告相关的字段
            if (isAdField(key)) {
                log(`✓ 移除广告字段: ${key}`, true);
                context.count++;
                continue;
            }
            
            const value = obj[key];
            
            // 如果值本身是广告内容，跳过
            if (isAdContent(value)) {
                log(`✓ 移除广告内容: ${key}`, true);
                context.count++;
                continue;
            }
            
            // 递归处理嵌套对象
            const nestedResult = removeAds(value, context);
            result[key] = nestedResult.obj;
        }
    }
    
    return { obj: result, count: context.count };
}

/**
 * 判断字段名是否与广告相关
 * @param {string} fieldName - 字段名
 * @returns {boolean} 是否为广告字段
 */
function isAdField(fieldName) {
    if (typeof fieldName !== 'string') {
        return false;
    }
    
    const lowerFieldName = fieldName.toLowerCase();
    return AD_KEYWORDS.some(keyword => lowerFieldName.includes(keyword));
}

/**
 * 判断内容是否为广告
 * @param {*} content - 要检查的内容
 * @returns {boolean} 是否为广告内容
 */
function isAdContent(content) {
    if (!content || typeof content !== 'object') {
        return false;
    }

    // 检查对象的键
    const keys = Object.keys(content);
    if (keys.some(key => isAdField(key))) {
        return true;
    }

    // 检查特定的广告标识
    if (content._type === 'sponsored' || 
        content.type === 'sponsored' ||
        content.is_sponsored === true ||
        content.isSponsored === true ||
        content.sponsored === true) {
        return true;
    }

    // 检查消息类型
    if (content.message_type === 'sponsored_message' ||
        content.messageType === 'sponsoredMessage') {
        return true;
    }

    // 检查频道 post 中的赞助标识
    if (content.views && content.from_id && content.sponsored_peer) {
        return true;
    }
    
    // 检查 Telegram MTProto API 特定的赞助消息结构
    // 频道赞助消息通常包含这些字段组合
    if (content.random_id && content.from_id && content.chat_invite) {
        return true;
    }
    
    // 检查是否包含赞助消息特有的 peer_color 字段
    if (content.peer_color && content.chat_invite_hash) {
        return true;
    }
    
    // 检查赞助消息的推荐频道结构
    if (content.recommended === true || content.recommendation_reason) {
        return true;
    }
    
    // 检查包含 sponsor 相关的 URL 或链接
    if (content.url && typeof content.url === 'string') {
        const lowerUrl = content.url.toLowerCase();
        if (lowerUrl.includes('sponsor') || lowerUrl.includes('adsgram') || lowerUrl.includes('/ad')) {
            return true;
        }
    }
    
    // 检查消息文本中是否包含广告标识（Telegram 频道赞助消息的文本特征）
    if (content.message && typeof content.message === 'string') {
        // 不要误杀包含 "广告" 的普通消息，需要结合其他字段判断
        if (content.message.length < 500 && (content.chat_invite || content.random_id)) {
            return true;
        }
    }

    // 检查字符串内容（谨慎使用，避免误杀）
    if (typeof content === 'string' && content.length < 50) {
        const lowerContent = content.toLowerCase();
        return AD_KEYWORDS.some(keyword => lowerContent.includes(keyword));
    }

    return false;
}

/**
 * 清理特定的 Telegram API 响应结构
 * @param {Object} response - API 响应对象
 * @param {Object} context - 上下文对象
 * @returns {Object} 包含清理后响应和统计信息
 */
function cleanTelegramResponse(response, context = { count: 0 }) {
    if (!response) {
        return { obj: response, count: context.count };
    }

    // 处理 MTProto 响应结构
    if (response.result) {
        const result = removeAds(response.result, context);
        response.result = result.obj;
    }

    // 处理消息列表
    if (response.messages && Array.isArray(response.messages)) {
        const originalLength = response.messages.length;
        response.messages = response.messages.filter(msg => !isAdContent(msg));
        const filtered = originalLength - response.messages.length;
        if (filtered > 0) {
            context.count += filtered;
            log(`✓ 从消息列表移除 ${filtered} 条广告`, true);
        }
    }

    // 处理更新
    if (response.updates && Array.isArray(response.updates)) {
        const originalLength = response.updates.length;
        response.updates = response.updates.filter(update => !isAdContent(update));
        const filtered = originalLength - response.updates.length;
        if (filtered > 0) {
            context.count += filtered;
            log(`✓ 从更新列表移除 ${filtered} 条广告`, true);
        }
    }

    // 处理对话列表
    if (response.chats && Array.isArray(response.chats)) {
        response.chats = response.chats.map(chat => {
            if (chat.sponsored_message) {
                delete chat.sponsored_message;
                context.count++;
                log(`✓ 移除频道赞助消息`, true);
            }
            if (chat.sponsoredMessage) {
                delete chat.sponsoredMessage;
                context.count++;
                log(`✓ 移除频道赞助消息`, true);
            }
            return chat;
        });
    }
    
    // 处理频道的完整信息响应（包含赞助消息的主要位置）
    if (response.full_chat || response.fullChat) {
        const fullChat = response.full_chat || response.fullChat;
        if (fullChat.sponsored_message) {
            delete fullChat.sponsored_message;
            context.count++;
            log(`✓ 移除频道完整信息中的赞助消息`);
        }
        if (fullChat.sponsoredMessage) {
            delete fullChat.sponsoredMessage;
            context.count++;
            log(`✓ 移除频道完整信息中的赞助消息`);
        }
    }
    
    // 直接处理响应中的 sponsoredMessages 数组（常见结构）
    if (response.sponsoredMessages) {
        const count = Array.isArray(response.sponsoredMessages) ? response.sponsoredMessages.length : 1;
        delete response.sponsoredMessages;
        context.count += count;
        log(`✓ 移除 sponsoredMessages 字段 (${count} 条)`);
    }
    
    if (response.sponsored_messages) {
        const count = Array.isArray(response.sponsored_messages) ? response.sponsored_messages.length : 1;
        delete response.sponsored_messages;
        context.count += count;
        log(`✓ 移除 sponsored_messages 字段 (${count} 条)`);
    }

    return { obj: response, count: context.count };
}

// 执行主函数
const result = handleResponse();
$done(result);
