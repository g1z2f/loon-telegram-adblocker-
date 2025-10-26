/**
 * 美团去广告脚本
 * Meituan Ad Blocker Script
 * 
 * 功能说明：
 * - 屏蔽美团App开屏广告
 * - 移除首页推荐流中的广告卡片
 * - 过滤外卖、团购等模块的推广内容
 * - 清理各类弹窗和浮层广告
 * 
 * 参考来源：
 * - https://github.com/fmz200/wool_scripts
 * - https://github.com/PixivCat/Loon
 * 
 * @version 2.0.0
 * @author Loon AdBlocker
 */

const SCRIPT_NAME = '美团去广告';
const VERSION = '2.0.0';

// 广告相关关键字
const AD_KEYWORDS = [
    'ad', 'ads', 'advertisement', 'advert',
    'splash', 'launch', 'startup', 'open',
    'banner', 'popup', 'float', 'promotion',
    'promoted', 'sponsor', 'commercial', 'marketing'
];

// 美团特定广告字段
const MEITUAN_AD_FIELDS = [
    'splashAd', 'splashAdList', 'splashInfo',
    'launchAd', 'startupAd', 'openScreenAd',
    'floatAd', 'floatLayer', 'popupAd', 'popupWindow',
    'bannerAd', 'bannerList', 'topBanner', 'bottomBanner',
    'feedAd', 'nativeAd', 'adData', 'adInfo', 'adList',
    'advertisementData', 'promotionData', 'promotionInfo',
    'recommendAd', 'hotRecommend', 'activityAd', 'activityInfo'
];

// 日志输出
function log(message) {
    console.log(`[${SCRIPT_NAME} v${VERSION}] ${message}`);
}

// 主处理函数
function main() {
    try {
        const url = $request.url;
        let body = $response.body;
        
        if (!body) {
            log('响应体为空');
            return { body };
        }

        // 解析JSON
        let obj;
        try {
            obj = JSON.parse(body);
        } catch (e) {
            log('非JSON响应');
            return { body };
        }

        const originalSize = JSON.stringify(obj).length;
        let adCount = 0;

        // 处理美团API响应
        obj = processResponse(obj, { count: 0, path: [] });
        adCount = obj.__adCount || 0;
        delete obj.__adCount;

        const modifiedSize = JSON.stringify(obj).length;
        
        if (adCount > 0) {
            log(`✓ 已移除 ${adCount} 个广告 (${originalSize}→${modifiedSize} bytes)`);
        }

        return { body: JSON.stringify(obj) };

    } catch (error) {
        log(`处理异常: ${error.message}`);
        return { body: $response.body };
    }
}

// 处理响应数据
function processResponse(data, context) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    // 处理数组
    if (Array.isArray(data)) {
        return data
            .filter(item => !isAdContent(item, context))
            .map(item => processResponse(item, context));
    }

    // 处理对象
    const result = {};
    
    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;

        // 跳过广告字段
        if (isAdField(key)) {
            context.count++;
            continue;
        }

        const value = data[key];

        // 跳过广告内容
        if (isAdContent(value, context)) {
            context.count++;
            continue;
        }

        // 递归处理
        context.path.push(key);
        result[key] = processResponse(value, context);
        context.path.pop();
    }

    // 传递广告计数
    if (context.path.length === 0) {
        result.__adCount = context.count;
    }

    return result;
}

// 判断是否为广告字段
function isAdField(fieldName) {
    if (typeof fieldName !== 'string') {
        return false;
    }

    const lower = fieldName.toLowerCase();

    // 检查美团特定字段
    if (MEITUAN_AD_FIELDS.some(field => fieldName === field || lower.includes(field.toLowerCase()))) {
        return true;
    }

    // 检查通用广告关键字
    return AD_KEYWORDS.some(keyword => lower.includes(keyword));
}

// 判断是否为广告内容
function isAdContent(content, context) {
    if (!content || typeof content !== 'object') {
        return false;
    }

    // 检查type字段
    if (content.type) {
        const type = String(content.type).toLowerCase();
        if (['ad', 'ads', 'advertisement', 'splash', 'banner', 'promotion'].includes(type)) {
            return true;
        }
    }

    // 检查itemType字段
    if (content.itemType || content.item_type) {
        const itemType = String(content.itemType || content.item_type).toLowerCase();
        if (['ad', 'ads', 'advertisement', 'promotion'].includes(itemType)) {
            return true;
        }
    }

    // 检查contentType字段
    if (content.contentType || content.content_type) {
        const contentType = String(content.contentType || content.content_type).toLowerCase();
        if (['ad', 'ads', 'advertisement', 'promotion'].includes(contentType)) {
            return true;
        }
    }

    // 检查广告标识
    if (content.isAd === true || content.is_ad === true ||
        content.isAdvertisement === true || content.is_advertisement === true ||
        content.isPromotion === true || content.is_promotion === true ||
        content.promoted === true || content.isSponsored === true) {
        return true;
    }

    // 检查广告ID字段
    if (content.adId || content.ad_id || content.adSource || content.ad_source ||
        content.advertisementId || content.advertisement_id) {
        return true;
    }

    // 检查开屏广告特征
    if (content.splashUrl || content.splash_url ||
        content.splashImage || content.splash_image ||
        content.splashData || content.splash_data) {
        return true;
    }

    // 检查跳转URL
    const jumpUrl = content.jumpUrl || content.jump_url || content.clickUrl || content.click_url || content.targetUrl || content.target_url;
    if (jumpUrl && typeof jumpUrl === 'string') {
        const lower = jumpUrl.toLowerCase();
        if (lower.includes('/ad/') || lower.includes('/ads/') ||
            lower.includes('advertisement') || lower.includes('promotion') ||
            lower.includes('advert')) {
            return true;
        }
    }

    // 检查展示类型
    if (content.displayType || content.display_type) {
        const displayType = String(content.displayType || content.display_type).toLowerCase();
        if (['ad', 'splash', 'float', 'popup', 'banner', 'promotion'].includes(displayType)) {
            return true;
        }
    }

    // 检查标签
    if (content.tag || content.tags) {
        const tags = Array.isArray(content.tags) ? content.tags : [content.tag];
        if (tags.some(tag => {
            if (typeof tag === 'string') {
                const lower = tag.toLowerCase();
                return ['ad', 'ads', 'promotion', 'sponsor', 'advertisement'].some(kw => lower.includes(kw));
            }
            return false;
        })) {
            return true;
        }
    }

    // 检查bizType (美团业务类型)
    if (content.bizType || content.biz_type) {
        const bizType = String(content.bizType || content.biz_type).toLowerCase();
        if (['ad', 'advertisement', 'promotion', 'marketing'].includes(bizType)) {
            return true;
        }
    }

    // 检查categoryType (分类类型)
    if (content.categoryType || content.category_type) {
        const categoryType = String(content.categoryType || content.category_type).toLowerCase();
        if (['ad', 'advertisement', 'promotion'].includes(categoryType)) {
            return true;
        }
    }

    // 检查adFlag (广告标识)
    if (content.adFlag === 1 || content.ad_flag === 1 ||
        content.adFlag === true || content.ad_flag === true) {
        return true;
    }

    // 检查showType (展示类型)
    if (content.showType || content.show_type) {
        const showType = String(content.showType || content.show_type).toLowerCase();
        if (['ad', 'splash', 'popup', 'float', 'banner'].includes(showType)) {
            return true;
        }
    }

    // 检查对象键
    const keys = Object.keys(content);
    if (keys.some(key => isAdField(key))) {
        return true;
    }

    return false;
}

// 执行脚本
const result = main();
$done(result);
