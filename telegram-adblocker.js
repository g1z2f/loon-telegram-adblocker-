/**
 * Telegram 广告屏蔽脚本（Web 版本）
 * 
 * ⚠️ 重要技术说明：
 * 
 * Telegram 原生应用（iOS/Android）使用 MTProto 协议通信，这是一个：
 * 1. 端到端加密的专有协议
 * 2. 不使用标准 HTTPS/TLS
 * 3. 无法通过常规 MITM 解密
 * 
 * 因此，本脚本的限制：
 * ❌ 无法拦截原生 App 中的频道赞助消息（蓝色"广告"标签）
 * ❌ 无法修改 MTProto 协议传输的数据
 * ❌ 对原生 Telegram iOS/Android App 基本无效
 * 
 * 本脚本可能有效的场景：
 * ✅ Telegram Web 版本（web.telegram.org）
 * ✅ 某些使用 HTTPS API 的第三方客户端
 * ⚠️ 效果非常有限
 * 
 * 替代方案：
 * 1. 订阅 Telegram Premium（官方去广告）
 * 2. 使用第三方客户端（如 Nicegram、Plus Messenger）
 * 3. 使用桌面版客户端的第三方修改版
 * 
 * @author loon-telegram-adblocker
 * @version 3.0.0
 * @date 2024-10-26
 */

const SCRIPT_NAME = 'Telegram AdBlocker (Web)';
const VERSION = '3.0.0';
const DEBUG_MODE = true;

// 广告相关的关键字（主要针对 Web API）
const AD_KEYWORDS = [
    'sponsored',
    'sponsoredMessage',
    'sponsored_message',
    'ads',
    'advertisement',
    'promotion',
    'promoted',
    'adsgram',
    'peer_color',
    'sponsor'
];

/**
 * 日志函数
 */
function log(message, level = 'INFO') {
    if (DEBUG_MODE || level === 'WARN' || level === 'ERROR') {
        console.log(`[${SCRIPT_NAME} v${VERSION}] [${level}] ${message}`);
    }
}

/**
 * 主处理函数
 */
function handleResponse() {
    try {
        const url = $request.url || '';
        log(`处理请求: ${url.substring(0, 100)}...`);
        
        // 获取响应体
        let body = $response.body;
        
        if (!body) {
            log('响应体为空，跳过处理', 'DEBUG');
            return { body: $response.body };
        }

        // 检查是否为二进制数据（MTProto）
        if (typeof body !== 'string') {
            log('检测到二进制数据（可能是 MTProto），无法处理', 'WARN');
            return { body: $response.body };
        }

        // 尝试解析 JSON
        let obj;
        try {
            obj = JSON.parse(body);
        } catch (e) {
            log(`非 JSON 响应，跳过处理: ${e.message}`, 'DEBUG');
            return { body: $response.body };
        }

        // 检测是否为 Telegram Web API 响应
        if (!isValidTelegramResponse(obj)) {
            log('非 Telegram API 响应格式，跳过处理', 'DEBUG');
            return { body: $response.body };
        }

        // 记录原始数据
        const originalSize = JSON.stringify(obj).length;
        let modified = false;
        
        // 处理响应
        if (obj.response) {
            // Telegram Web API 格式
            const result = processWebApiResponse(obj.response);
            if (result.modified) {
                obj.response = result.data;
                modified = true;
                log(`✓ Web API: 移除了 ${result.count} 个广告项`);
            }
        } else {
            // 通用格式处理
            const context = { count: 0 };
            obj = removeAdsFromObject(obj, context);
            if (context.count > 0) {
                modified = true;
                log(`✓ 通用处理: 移除了 ${context.count} 个广告项`);
            }
        }
        
        if (modified) {
            const modifiedSize = JSON.stringify(obj).length;
            log(`处理完成: ${originalSize} -> ${modifiedSize} bytes`);
            return { body: JSON.stringify(obj) };
        } else {
            log('未检测到广告内容', 'DEBUG');
            return { body: $response.body };
        }
        
    } catch (error) {
        log(`处理异常: ${error.message}\n${error.stack}`, 'ERROR');
        return { body: $response.body };
    }
}

/**
 * 检查是否为有效的 Telegram API 响应
 */
function isValidTelegramResponse(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    
    // Telegram Web API 通常有这些字段
    if (obj.response || obj.updates || obj.messages || obj.chats) {
        return true;
    }
    
    return false;
}

/**
 * 处理 Telegram Web API 响应
 */
function processWebApiResponse(response) {
    let count = 0;
    let modified = false;
    let data = response;
    
    // 处理消息列表
    if (Array.isArray(data)) {
        const filtered = data.filter(item => !isAdContent(item));
        count = data.length - filtered.length;
        if (count > 0) {
            modified = true;
            data = filtered;
        }
    }
    
    // 处理对象中的消息数组
    if (data && typeof data === 'object') {
        if (data.messages && Array.isArray(data.messages)) {
            const originalLength = data.messages.length;
            data.messages = data.messages.filter(msg => !isAdContent(msg));
            const removed = originalLength - data.messages.length;
            if (removed > 0) {
                count += removed;
                modified = true;
            }
        }
        
        // 移除赞助消息字段
        if (data.sponsoredMessages || data.sponsored_messages) {
            delete data.sponsoredMessages;
            delete data.sponsored_messages;
            count++;
            modified = true;
        }
    }
    
    return { data, count, modified };
}

/**
 * 递归移除对象中的广告内容
 */
function removeAdsFromObject(obj, context = { count: 0 }) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // 处理数组
    if (Array.isArray(obj)) {
        const filtered = [];
        for (let item of obj) {
            if (!isAdContent(item)) {
                filtered.push(removeAdsFromObject(item, context));
            } else {
                context.count++;
            }
        }
        return filtered;
    }

    // 处理对象
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            // 跳过广告相关字段
            if (isAdField(key)) {
                context.count++;
                continue;
            }
            
            const value = obj[key];
            
            // 检查值是否为广告内容
            if (isAdContent(value)) {
                context.count++;
                continue;
            }
            
            // 递归处理
            result[key] = removeAdsFromObject(value, context);
        }
    }
    
    return result;
}

/**
 * 判断字段名是否与广告相关
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
 */
function isAdContent(content) {
    if (!content || typeof content !== 'object') {
        return false;
    }

    // 检查对象的键
    const keys = Object.keys(content);
    for (const key of keys) {
        if (isAdField(key)) {
            return true;
        }
    }

    // 检查广告标识
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

    // Telegram Web API 特定结构
    if (content._ === 'sponsoredMessage' || content._ === 'messageSponsored') {
        return true;
    }
    
    // 检查推荐频道
    if (content.recommended === true || content.recommendation_reason) {
        return true;
    }

    return false;
}

// 执行主函数
const result = handleResponse();
$done(result);
