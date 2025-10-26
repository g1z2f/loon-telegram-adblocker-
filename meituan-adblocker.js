/**
 * 美团开屏广告屏蔽脚本
 * 用于拦截和过滤美团 App API 响应中的开屏广告和推广内容
 * 
 * 支持的功能：
 * - 移除启动时的开屏广告（Splash Screen Ads）
 * - 过滤首页推荐流中的广告内容
 * - 屏蔽各类推广信息
 * - 加快应用启动速度
 * - 移除外卖、团购等各模块的广告
 * 
 * @author Loon Meituan AdBlocker
 * @version 1.0.0
 */

const SCRIPT_NAME = 'Meituan AdBlocker';
const VERSION = '1.0.0';
const DEBUG_MODE = true; // 设置为 false 以减少日志输出

// 广告相关的关键字列表
const AD_KEYWORDS = [
    'ad',
    'ads',
    'splash',
    'launch',
    'advertisement',
    'promotion',
    'promoted',
    'banner',
    'popup',
    'float',
    'adv',
    'marketing',
    'recommend_ad',
    'ad_data',
    'splash_ad',
    'launch_ad',
    'startup_ad',
    'open_ad',
    'screen_ad',
    'ad_info',
    'ad_list',
    'advert',
    'sponsor',
    'commercial'
];

// 美团特定的广告字段
const MEITUAN_AD_FIELDS = [
    'splashAd',
    'splashAdList',
    'launchAd',
    'startupAd',
    'openScreenAd',
    'floatAd',
    'popupAd',
    'bannerAd',
    'feedAd',
    'nativeAd',
    'adData',
    'adInfo',
    'adList',
    'advertisementData',
    'promotionData',
    'recommendAd',
    'hotRecommend',
    'activityAd'
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
        log(`处理请求: ${url.substring(0, 150)}...`, true);
        
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
        
        // 使用美团专用清理函数
        const context = { count: 0 };
        obj = cleanMeituanResponse(obj, context);
        
        // 使用通用递归清理函数进行二次清理
        const result = removeAds(obj, context);
        obj = result.obj;
        const adsRemoved = result.count;
        
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
 * 清理美团特定的 API 响应结构
 * @param {Object} response - API 响应对象
 * @param {Object} context - 上下文对象
 * @returns {Object} 清理后的响应对象
 */
function cleanMeituanResponse(response, context = { count: 0 }) {
    if (!response || typeof response !== 'object') {
        return response;
    }

    // 处理美团的通用响应结构 { code: 0, data: {...}, msg: "ok" }
    if (response.data) {
        response.data = cleanMeituanData(response.data, context);
    }

    // 处理直接包含广告数据的情况
    if (response.result) {
        response.result = cleanMeituanData(response.result, context);
    }

    // 移除顶层的广告字段
    MEITUAN_AD_FIELDS.forEach(field => {
        if (response.hasOwnProperty(field)) {
            const adCount = Array.isArray(response[field]) ? response[field].length : 1;
            delete response[field];
            context.count += adCount;
            log(`✓ 移除美团广告字段: ${field} (${adCount} 项)`, true);
        }
    });

    return response;
}

/**
 * 清理美团数据对象中的广告
 * @param {*} data - 数据对象
 * @param {Object} context - 上下文对象
 * @returns {*} 清理后的数据对象
 */
function cleanMeituanData(data, context) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    // 处理数组
    if (Array.isArray(data)) {
        const originalLength = data.length;
        data = data.filter(item => !isMeituanAd(item));
        const filtered = originalLength - data.length;
        if (filtered > 0) {
            context.count += filtered;
            log(`✓ 从数组中过滤 ${filtered} 个广告项`, true);
        }
        // 递归清理数组中的每个元素
        return data.map(item => cleanMeituanData(item, context));
    }

    // 处理对象
    const result = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            // 移除美团特定的广告字段
            if (MEITUAN_AD_FIELDS.includes(key) || isAdField(key)) {
                const adCount = Array.isArray(data[key]) ? data[key].length : 1;
                context.count += adCount;
                log(`✓ 移除广告字段: ${key}`, true);
                continue;
            }
            
            const value = data[key];
            
            // 如果值本身是广告内容，跳过
            if (isMeituanAd(value)) {
                context.count++;
                log(`✓ 移除广告内容: ${key}`, true);
                continue;
            }
            
            // 递归清理嵌套对象
            result[key] = cleanMeituanData(value, context);
        }
    }
    
    return result;
}

/**
 * 判断是否为美团广告内容
 * @param {*} content - 要检查的内容
 * @returns {boolean} 是否为广告内容
 */
function isMeituanAd(content) {
    if (!content || typeof content !== 'object') {
        return false;
    }

    // 检查类型标识
    if (content.type) {
        const type = String(content.type).toLowerCase();
        if (type.includes('ad') || 
            type.includes('splash') || 
            type.includes('banner') ||
            type.includes('promotion') ||
            type.includes('float')) {
            return true;
        }
    }

    // 检查美团特定的广告标识
    if (content.itemType === 'ad' || 
        content.item_type === 'ad' ||
        content.contentType === 'ad' ||
        content.content_type === 'ad') {
        return true;
    }

    // 检查是否标记为广告
    if (content.isAd === true || 
        content.is_ad === true ||
        content.isAdvertisement === true ||
        content.is_advertisement === true) {
        return true;
    }

    // 检查广告来源标识
    if (content.adSource || 
        content.ad_source ||
        content.adId ||
        content.ad_id ||
        content.advertisementId ||
        content.advertisement_id) {
        return true;
    }

    // 检查是否为推广内容
    if (content.isPromotion === true || 
        content.is_promotion === true ||
        content.promoted === true) {
        return true;
    }

    // 检查开屏广告特征
    if (content.splashUrl || 
        content.splash_url ||
        content.splashImage ||
        content.splash_image) {
        return true;
    }

    // 检查跳转 URL（广告通常有特定的跳转链接）
    if (content.jumpUrl || content.jump_url || content.clickUrl || content.click_url) {
        const jumpUrl = content.jumpUrl || content.jump_url || content.clickUrl || content.click_url;
        if (typeof jumpUrl === 'string') {
            const lowerUrl = jumpUrl.toLowerCase();
            if (lowerUrl.includes('/ad/') || 
                lowerUrl.includes('/ads/') ||
                lowerUrl.includes('advertisement') ||
                lowerUrl.includes('promotion')) {
                return true;
            }
        }
    }

    // 检查展示类型（美团的广告通常有特定的展示类型）
    if (content.displayType || content.display_type) {
        const displayType = String(content.displayType || content.display_type).toLowerCase();
        if (displayType.includes('ad') || 
            displayType.includes('splash') ||
            displayType.includes('float') ||
            displayType.includes('popup')) {
            return true;
        }
    }

    // 检查对象键中是否包含广告标识
    const keys = Object.keys(content);
    if (keys.some(key => MEITUAN_AD_FIELDS.includes(key) || isAdField(key))) {
        return true;
    }

    // 检查广告标签
    if (content.tag || content.tags) {
        const tags = Array.isArray(content.tags) ? content.tags : [content.tag];
        if (tags.some(tag => {
            if (typeof tag === 'string') {
                const lowerTag = tag.toLowerCase();
                return lowerTag.includes('ad') || lowerTag.includes('promotion') || lowerTag.includes('sponsor');
            }
            return false;
        })) {
            return true;
        }
    }

    return false;
}

/**
 * 递归移除对象中的广告内容（通用函数）
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
            if (isMeituanAd(item) || isAdContent(item)) {
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
            if (isAdField(key) || MEITUAN_AD_FIELDS.includes(key)) {
                log(`✓ 移除广告字段: ${key}`, true);
                context.count++;
                continue;
            }
            
            const value = obj[key];
            
            // 如果值本身是广告内容，跳过
            if (isMeituanAd(value) || isAdContent(value)) {
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
 * 判断字段名是否与广告相关（通用判断）
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
 * 判断内容是否为广告（通用判断）
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

    // 检查通用的广告标识
    if (content._type === 'ad' || 
        content.type === 'ad' ||
        content.is_ad === true ||
        content.isAd === true ||
        content.ad === true) {
        return true;
    }

    // 检查字符串内容（谨慎使用，避免误杀）
    if (typeof content === 'string' && content.length < 50) {
        const lowerContent = content.toLowerCase();
        // 只在明确包含广告关键词时才判定为广告
        if (lowerContent === 'ad' || 
            lowerContent === 'ads' ||
            lowerContent === 'advertisement' ||
            lowerContent === 'splash_ad') {
            return true;
        }
    }

    return false;
}

// 执行主函数
const result = handleResponse();
$done(result);
