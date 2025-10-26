/**
 * Telegram 广告屏蔽脚本
 * 用于拦截和过滤 Telegram API 响应中的赞助广告内容
 * 
 * 支持的功能：
 * - 移除频道中的 Sponsored Messages（赞助消息）
 * - 过滤推广内容
 * - 屏蔽广告追踪数据
 * 
 * @author Loon Telegram AdBlocker
 * @version 1.0.0
 */

const SCRIPT_NAME = 'Telegram AdBlocker';
const VERSION = '1.0.0';

// 广告相关的关键字列表
const AD_KEYWORDS = [
    'sponsored',
    'sponsored_message',
    'sponsoredMessage',
    'ads',
    'advertisement',
    'promotion',
    'promoted',
    'adsgram'
];

/**
 * 主处理函数
 */
function handleResponse() {
    try {
        // 获取响应体
        let body = $response.body;
        
        if (!body) {
            console.log(`[${SCRIPT_NAME}] 响应体为空，跳过处理`);
            return { body: $response.body };
        }

        // 尝试解析 JSON
        let obj;
        try {
            obj = JSON.parse(body);
        } catch (e) {
            console.log(`[${SCRIPT_NAME}] 非 JSON 响应，跳过处理`);
            return { body: $response.body };
        }

        // 记录原始数据（调试用）
        const originalSize = JSON.stringify(obj).length;
        
        // 处理响应数据，移除广告
        obj = removeAds(obj);
        
        // 计算处理后的大小
        const modifiedSize = JSON.stringify(obj).length;
        
        if (originalSize !== modifiedSize) {
            console.log(`[${SCRIPT_NAME}] 已处理广告内容 (${originalSize} -> ${modifiedSize} bytes)`);
        }

        // 返回修改后的响应
        return { body: JSON.stringify(obj) };
        
    } catch (error) {
        console.log(`[${SCRIPT_NAME}] 处理异常: ${error.message}`);
        return { body: $response.body };
    }
}

/**
 * 递归移除对象中的广告内容
 * @param {*} obj - 要处理的对象
 * @returns {*} 处理后的对象
 */
function removeAds(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // 处理数组
    if (Array.isArray(obj)) {
        return obj
            .filter(item => !isAdContent(item))
            .map(item => removeAds(item));
    }

    // 处理对象
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            // 跳过广告相关的字段
            if (isAdField(key)) {
                console.log(`[${SCRIPT_NAME}] 移除广告字段: ${key}`);
                continue;
            }
            
            const value = obj[key];
            
            // 如果值本身是广告内容，跳过
            if (isAdContent(value)) {
                console.log(`[${SCRIPT_NAME}] 移除广告内容: ${key}`);
                continue;
            }
            
            // 递归处理嵌套对象
            result[key] = removeAds(value);
        }
    }
    
    return result;
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

    // 检查字符串内容
    if (typeof content === 'string') {
        const lowerContent = content.toLowerCase();
        return AD_KEYWORDS.some(keyword => lowerContent.includes(keyword));
    }

    return false;
}

/**
 * 清理特定的 Telegram API 响应结构
 * @param {Object} response - API 响应对象
 * @returns {Object} 清理后的响应
 */
function cleanTelegramResponse(response) {
    if (!response) {
        return response;
    }

    // 处理 MTProto 响应结构
    if (response.result) {
        response.result = removeAds(response.result);
    }

    // 处理消息列表
    if (response.messages) {
        response.messages = response.messages.filter(msg => !isAdContent(msg));
    }

    // 处理更新
    if (response.updates) {
        response.updates = response.updates.filter(update => !isAdContent(update));
    }

    // 处理对话列表
    if (response.chats) {
        response.chats = response.chats.map(chat => {
            if (chat.sponsored_message) {
                delete chat.sponsored_message;
            }
            return chat;
        });
    }

    return response;
}

// 执行主函数
const result = handleResponse();
$done(result);
