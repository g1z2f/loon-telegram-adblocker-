/**
 * Telegram 广告屏蔽脚本（iOS 原生 App 实验性版本）
 * 
 * 目标：尝试拦截 iOS Telegram 原生 App 的赞助广告
 * 
 * 技术说明：
 * 
 * ✅ 我们能做的：
 * 1. 拦截 Web API 的 HTTPS 请求（如果存在）
 * 2. 过滤 CDN 图片/视频资源
 * 3. 拦截可能的广告配置请求
 * 4. 处理 JSON 格式的响应数据
 * 
 * ❌ 我们无法做的：
 * 1. 解密 MTProto 协议的消息流
 * 2. 修改二进制 MTProto 数据包
 * 3. 拦截端到端加密的内容
 * 
 * 策略：
 * - 多层过滤机制
 * - 检测各种可能的广告标识
 * - 返回空数据而不是阻止请求
 * - 详细日志以便调试
 * 
 * @author loon-telegram-adblocker
 * @version 4.0.0-experimental
 * @date 2024-10-26
 */

const SCRIPT_NAME = 'Telegram AdBlocker';
const VERSION = '4.0.0-experimental';
const DEBUG_MODE = true;

// 广告关键字（扩展版）
const AD_KEYWORDS = [
    // 英文关键字
    'sponsored',
    'sponsoredMessage',
    'sponsored_message',
    'sponsoredMessages',
    'sponsored_messages',
    'ads',
    'advertisement',
    'promotion',
    'promoted',
    'adsgram',
    'sponsor',
    'ad_',
    '_ad',
    // API 相关
    'getSponsoredMessages',
    'sponsoredMessagesMode',
    'peer_color',
    'sponsor_info',
    'additional_info',
    // 其他可能的标识
    'recommended',
    'recommendation',
    'channel_recommended'
];

/**
 * 日志函数
 */
function log(message, level = 'INFO') {
    const prefix = `[${SCRIPT_NAME} v${VERSION}] [${level}]`;
    if (DEBUG_MODE || level === 'WARN' || level === 'ERROR' || level === 'SUCCESS') {
        console.log(`${prefix} ${message}`);
    }
}

/**
 * 主处理函数
 */
function handleResponse() {
    try {
        const url = $request.url || '';
        const method = $request.method || 'UNKNOWN';
        
        log(`请求: ${method} ${url.substring(0, 150)}...`, 'DEBUG');
        
        // 获取响应
        let body = $response.body;
        const statusCode = $response.status || 200;
        const headers = $response.headers || {};
        
        log(`响应: Status ${statusCode}, Content-Type: ${headers['Content-Type'] || 'unknown'}`, 'DEBUG');
        
        if (!body) {
            log('响应体为空，跳过处理', 'DEBUG');
            return { body: $response.body };
        }

        // 检查是否为二进制数据（MTProto）
        if (typeof body !== 'string') {
            log('⚠️ 检测到二进制数据（可能是 MTProto 协议），无法处理', 'WARN');
            log('建议：订阅 Telegram Premium 以官方移除广告', 'INFO');
            return { body: $response.body };
        }

        // 检查 Content-Type
        const contentType = headers['Content-Type'] || headers['content-type'] || '';
        if (contentType && !contentType.includes('json') && !contentType.includes('text')) {
            log(`非文本响应 (${contentType})，跳过处理`, 'DEBUG');
            return { body: $response.body };
        }

        // 尝试解析 JSON
        let obj;
        let isJSON = false;
        try {
            obj = JSON.parse(body);
            isJSON = true;
            log('✓ 成功解析 JSON 响应', 'DEBUG');
        } catch (e) {
            log(`非 JSON 响应或解析失败: ${e.message}`, 'DEBUG');
            // 即使不是 JSON，也检查文本中是否包含广告关键字
            if (containsAdKeywords(body)) {
                log('⚠️ 在非 JSON 响应中检测到广告关键字', 'WARN');
                // 返回空响应
                return { body: '{}' };
            }
            return { body: $response.body };
        }

        // 记录原始大小
        const originalSize = JSON.stringify(obj).length;
        let modified = false;
        let adsRemoved = 0;
        
        // 多层过滤策略
        const context = { count: 0 };
        
        // 1. 检查是否为 Telegram API 响应
        if (isValidTelegramResponse(obj)) {
            log('✓ 识别为 Telegram API 响应', 'INFO');
            
            // 2. 处理 Web API 格式
            if (obj.response) {
                const result = processWebApiResponse(obj.response);
                if (result.modified) {
                    obj.response = result.data;
                    modified = true;
                    adsRemoved += result.count;
                    log(`✓ Web API: 移除了 ${result.count} 个广告项`, 'SUCCESS');
                }
            }
            
            // 3. 处理可能的 MTProto over HTTPS 响应
            if (obj.result) {
                const result = processMTProtoResponse(obj.result);
                if (result.modified) {
                    obj.result = result.data;
                    modified = true;
                    adsRemoved += result.count;
                    log(`✓ MTProto/HTTPS: 移除了 ${result.count} 个广告项`, 'SUCCESS');
                }
            }
        }
        
        // 4. 通用递归过滤（适用于所有格式）
        const cleanedObj = removeAdsFromObject(obj, context);
        if (context.count > 0) {
            obj = cleanedObj;
            modified = true;
            adsRemoved += context.count;
            log(`✓ 通用过滤: 移除了 ${context.count} 个广告项`, 'SUCCESS');
        }
        
        // 5. 特殊处理：直接移除顶层广告字段
        const topLevelRemoved = removeTopLevelAdFields(obj);
        if (topLevelRemoved > 0) {
            modified = true;
            adsRemoved += topLevelRemoved;
            log(`✓ 顶层字段: 移除了 ${topLevelRemoved} 个广告字段`, 'SUCCESS');
        }
        
        if (modified) {
            const modifiedSize = JSON.stringify(obj).length;
            log(`🎉 处理完成! 总共移除 ${adsRemoved} 个广告项`, 'SUCCESS');
            log(`📊 数据大小: ${originalSize} → ${modifiedSize} bytes (-${originalSize - modifiedSize})`, 'INFO');
            return { body: JSON.stringify(obj) };
        } else {
            log('未检测到广告内容', 'DEBUG');
            return { body: $response.body };
        }
        
    } catch (error) {
        log(`❌ 处理异常: ${error.message}`, 'ERROR');
        log(`堆栈: ${error.stack}`, 'ERROR');
        return { body: $response.body };
    }
}

/**
 * 检查文本中是否包含广告关键字
 */
function containsAdKeywords(text) {
    const lowerText = text.toLowerCase();
    return AD_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * 检查是否为有效的 Telegram API 响应
 */
function isValidTelegramResponse(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    
    // Telegram API 常见字段
    const telegramFields = [
        'response', 'result', 'ok',
        'updates', 'messages', 'chats', 'users',
        'fullChat', 'full_chat'
    ];
    
    return telegramFields.some(field => field in obj);
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
    
    // 处理对象
    if (data && typeof data === 'object') {
        // 消息数组
        if (data.messages && Array.isArray(data.messages)) {
            const originalLength = data.messages.length;
            data.messages = data.messages.filter(msg => !isAdContent(msg));
            const removed = originalLength - data.messages.length;
            if (removed > 0) {
                count += removed;
                modified = true;
            }
        }
        
        // 更新数组
        if (data.updates && Array.isArray(data.updates)) {
            const originalLength = data.updates.length;
            data.updates = data.updates.filter(update => !isAdContent(update));
            const removed = originalLength - data.updates.length;
            if (removed > 0) {
                count += removed;
                modified = true;
            }
        }
        
        // 直接移除赞助消息字段
        ['sponsoredMessages', 'sponsored_messages', 'sponsoredMessage', 'sponsored_message'].forEach(field => {
            if (field in data) {
                delete data[field];
                count++;
                modified = true;
            }
        });
    }
    
    return { data, count, modified };
}

/**
 * 处理可能的 MTProto over HTTPS 响应
 */
function processMTProtoResponse(result) {
    let count = 0;
    let modified = false;
    let data = result;
    
    // MTProto 响应可能包含的结构
    if (data && typeof data === 'object') {
        // 处理 messages 结构
        if (data.messages) {
            const msgResult = processWebApiResponse(data.messages);
            if (msgResult.modified) {
                data.messages = msgResult.data;
                count += msgResult.count;
                modified = true;
            }
        }
        
        // 处理 chats 中的赞助消息
        if (data.chats && Array.isArray(data.chats)) {
            data.chats.forEach(chat => {
                ['sponsored_message', 'sponsoredMessage'].forEach(field => {
                    if (field in chat) {
                        delete chat[field];
                        count++;
                        modified = true;
                    }
                });
            });
        }
    }
    
    return { data, count, modified };
}

/**
 * 移除顶层广告字段
 */
function removeTopLevelAdFields(obj) {
    if (!obj || typeof obj !== 'object') {
        return 0;
    }
    
    let count = 0;
    const adFields = [
        'sponsoredMessages', 'sponsored_messages',
        'sponsoredMessage', 'sponsored_message',
        'ads', 'advertisements',
        'promoted', 'promotions'
    ];
    
    adFields.forEach(field => {
        if (field in obj) {
            delete obj[field];
            count++;
        }
    });
    
    return count;
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
                log(`移除数组中的广告项`, 'DEBUG');
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
                log(`移除广告字段: ${key}`, 'DEBUG');
                continue;
            }
            
            const value = obj[key];
            
            // 检查值是否为广告内容
            if (isAdContent(value)) {
                context.count++;
                log(`移除广告内容: ${key}`, 'DEBUG');
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
    return AD_KEYWORDS.some(keyword => lowerFieldName.includes(keyword.toLowerCase()));
}

/**
 * 判断内容是否为广告（扩展版）
 */
function isAdContent(content) {
    if (!content || typeof content !== 'object') {
        return false;
    }

    // 1. 检查对象的键名
    const keys = Object.keys(content);
    for (const key of keys) {
        if (isAdField(key)) {
            return true;
        }
    }

    // 2. 检查 _type 或 type 字段
    if (content._type === 'sponsored' || 
        content._type === 'sponsoredMessage' ||
        content.type === 'sponsored' ||
        content.type === 'sponsoredMessage') {
        return true;
    }

    // 3. 检查布尔标识
    if (content.is_sponsored === true ||
        content.isSponsored === true ||
        content.sponsored === true) {
        return true;
    }

    // 4. 检查消息类型
    if (content.message_type === 'sponsored_message' ||
        content.messageType === 'sponsoredMessage') {
        return true;
    }

    // 5. Telegram TL 类型（MTProto）
    if (content._ === 'sponsoredMessage' || 
        content._ === 'messageSponsored' ||
        content._ === 'sponsoredMessageReportOption') {
        return true;
    }
    
    // 6. 推荐频道标识
    if (content.recommended === true || 
        content.recommendation_reason ||
        content.recommendationReason) {
        return true;
    }
    
    // 7. 赞助消息特有字段组合
    if (content.random_id && content.chat_invite) {
        return true;
    }
    
    if (content.peer_color && content.chat_invite_hash) {
        return true;
    }
    
    // 8. 检查 URL 中是否包含广告标识
    if (content.url && typeof content.url === 'string') {
        const lowerUrl = content.url.toLowerCase();
        if (lowerUrl.includes('sponsor') || 
            lowerUrl.includes('adsgram') || 
            lowerUrl.includes('/ad/') ||
            lowerUrl.includes('?ad=')) {
            return true;
        }
    }
    
    // 9. 检查按钮文本（广告按钮）
    if (content.button_text || content.buttonText) {
        const buttonText = (content.button_text || content.buttonText).toLowerCase();
        if (buttonText.includes('sponsor') || 
            buttonText.includes('ad') ||
            buttonText.includes('promoted')) {
            return true;
        }
    }

    return false;
}

// 执行主函数
log('🚀 脚本启动', 'INFO');
const result = handleResponse();
log('✅ 脚本完成', 'INFO');
$done(result);
