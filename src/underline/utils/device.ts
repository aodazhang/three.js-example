/**
 * @description 设备信息
 */

/** 系统信息 */
export type SystemInfo = {
  /** 系统 */
  system: 'windows' | 'macos' | 'linux' | 'android' | 'ios'
  /** 系统版本 */
  systemVersion: string
}

/** 浏览器信息 */
export type BrowserInfo = {
  /** 浏览器内核 */
  engine: 'webkit' | 'gecko' | 'presto' | 'trident'
  /** 浏览器内核版本 */
  engineVersion: string
  /** 浏览器载体 */
  browser: 'chrome' | 'safari' | 'firefox' | 'opera' | 'edge' | 'ie'
  /** 浏览器载体版本 */
  browserVersion: string
  /** 浏览器外壳 */
  shell:
    | 'wechat'
    | 'qq'
    | 'uc'
    | '360'
    | '2345'
    | 'sougou'
    | 'liebao'
    | 'maxthon'
  /** 浏览器外壳版本 */
  shellVersion: string
}

/** 视口尺寸 */
export type DeviceSize = {
  /** dpr */
  ratio: number
  /** 像素比（宽/高） */
  ascept: number
  /** 视口宽度 */
  width: number
  /** 视口高度 */
  height: number
}

/**
 * 正则替换ua中特定版本号
 * @param ua 浏览器ua
 * @param regexp 正则表达式
 * @returns 替换结果
 */
const matchVersion = (ua: string, regexp: RegExp): string =>
  ua
    .match(regexp)
    .toString()
    .replace(/[^0-9|_.]/g, '')
    .replace(/_/g, '.')

/**
 * 获取当前运行系统信息
 * @returns 系统信息
 */
export function getSystemInfo(): SystemInfo {
  // 获取浏览器ua信息
  const ua = navigator.userAgent.toLowerCase()
  // 系统信息
  const systemInfo: SystemInfo = {
    system: null,
    systemVersion: null
  }
  // 系统
  if (/windows|win32|win64|wow32|wow64/g.test(ua)) {
    systemInfo.system = 'windows' // windows系统
  } else if (/macintosh|macintel/g.test(ua)) {
    systemInfo.system = 'macos' // macos系统
  } else if (/x11/g.test(ua)) {
    systemInfo.system = 'linux' // linux系统
  } else if (/android|adr/g.test(ua)) {
    systemInfo.system = 'android' // android系统
  } else if (/ios|iphone|ipad|ipod|iwatch/g.test(ua)) {
    systemInfo.system = 'ios' // ios系统
  } else if (/mobile/g.test(ua)) {
    systemInfo.system = 'android' // 缺省移动端设备默认为android系统
  }
  // 系统版本
  switch (systemInfo.system) {
    case 'windows':
      if (/windows nt 5.1|windows xp/g.test(ua)) {
        systemInfo.systemVersion = 'xp'
      } else if (/windows nt 5.0|windows 2000/g.test(ua)) {
        systemInfo.systemVersion = '2000'
      } else if (/windows nt 5.2|windows 2003/g.test(ua)) {
        systemInfo.systemVersion = '2003'
      } else if (/windows nt 6.0|windows vista/g.test(ua)) {
        systemInfo.systemVersion = 'vista'
      } else if (/windows nt 6.1|windows 7/g.test(ua)) {
        systemInfo.systemVersion = '7'
      } else if (/windows nt 6.2|windows 8/g.test(ua)) {
        systemInfo.systemVersion = '8'
      } else if (/windows nt 6.3|windows 8.1/g.test(ua)) {
        systemInfo.systemVersion = '8.1'
      } else if (/windows nt 10.0|windows 10/g.test(ua)) {
        systemInfo.systemVersion = '10'
      }
      break
    case 'macos':
      systemInfo.systemVersion = matchVersion(ua, /os x [\d._]+/g)
      break
    case 'android':
      systemInfo.systemVersion = matchVersion(ua, /android [\d._]+/g)
      break
    case 'ios':
      systemInfo.systemVersion = matchVersion(ua, /os [\d._]+/g)
      break
  }
  return systemInfo
}

/**
 * 获取当前运行浏览器信息
 * @returns 浏览器信息
 */
export function getBrowserInfo(): BrowserInfo {
  // 获取浏览器ua信息
  const ua = navigator.userAgent.toLowerCase()
  // 浏览器信息
  const browserInfo: BrowserInfo = {
    engine: null,
    engineVersion: null,
    browser: null,
    browserVersion: null,
    shell: null,
    shellVersion: null
  }
  // 内核 + 载体
  if (/applewebkit/g.test(ua)) {
    browserInfo.engine = 'webkit'
    if (/edge/g.test(ua)) {
      browserInfo.browser = 'edge'
    } else if (/opr/g.test(ua)) {
      browserInfo.browser = 'opera'
    } else if (/chrome/g.test(ua)) {
      browserInfo.browser = 'chrome'
    } else if (/safari/g.test(ua)) {
      browserInfo.browser = 'safari'
    }
  } else if (/gecko/g.test(ua) && /firefox/g.test(ua)) {
    browserInfo.engine = 'gecko'
    browserInfo.browser = 'firefox'
  } else if (/presto/g.test(ua)) {
    browserInfo.engine = 'presto'
    browserInfo.browser = 'opera'
  } else if (/trident|compatible|msie/g.test(ua)) {
    browserInfo.engine = 'trident'
    browserInfo.browser = 'ie'
  }
  // 内核版本
  switch (browserInfo.engine) {
    case 'webkit':
      browserInfo.engineVersion = matchVersion(ua, /applewebkit\/[\d._]+/g)
      break
    case 'gecko':
      browserInfo.engineVersion = matchVersion(ua, /gecko\/[\d._]+/g)
      break
    case 'presto':
      browserInfo.engineVersion = matchVersion(ua, /presto\/[\d._]+/g)
      break
    case 'trident':
      browserInfo.engineVersion = matchVersion(ua, /trident\/[\d._]+/g)
      break
  }
  // 载体版本
  switch (browserInfo.browser) {
    case 'chrome':
      browserInfo.browserVersion = matchVersion(ua, /chrome\/[\d._]+/g)
      break
    case 'safari':
      browserInfo.browserVersion = matchVersion(ua, /version\/[\d._]+/g)
      break
    case 'firefox':
      browserInfo.browserVersion = matchVersion(ua, /firefox\/[\d._]+/g)
      break
    case 'opera':
      browserInfo.browserVersion = matchVersion(ua, /opr\/[\d._]+/g)
      break
    case 'edge':
      browserInfo.browserVersion = matchVersion(ua, /edge\/[\d._]+/g)
      break
    case 'ie':
      browserInfo.browserVersion = matchVersion(
        ua,
        /(msie [\d._]+)|(rv:[\d._]+)/g
      )
      break
  }
  // 外壳 + 外壳版本
  if (/micromessenger/g.test(ua)) {
    browserInfo.shell = 'wechat' // 微信浏览器
    browserInfo.shellVersion = matchVersion(ua, /micromessenger\/[\d._]+/g)
  } else if (/qqbrowser/g.test(ua)) {
    browserInfo.shell = 'qq' // qq浏览器
    browserInfo.shellVersion = matchVersion(ua, /qqbrowser\/[\d._]+/g)
  } else if (/ucbrowser/g.test(ua)) {
    browserInfo.shell = 'uc' // uc浏览器
    browserInfo.shellVersion = matchVersion(ua, /ucbrowser\/[\d._]+/g)
  } else if (/qihu 360se/g.test(ua)) {
    browserInfo.shell = '360' // 360浏览器（无版本）
  } else if (/2345explorer/g.test(ua)) {
    browserInfo.shell = '2345' // 2345浏览器
    browserInfo.shellVersion = matchVersion(ua, /2345explorer\/[\d._]+/g)
  } else if (/metasr/g.test(ua)) {
    browserInfo.shell = 'sougou' // 搜狗浏览器（无版本）
  } else if (/lbbrowser/g.test(ua)) {
    browserInfo.shell = 'liebao' // 猎豹浏览器（无版本）
  } else if (/maxthon/g.test(ua)) {
    browserInfo.shell = 'maxthon' // 遨游浏览器
    browserInfo.shellVersion = matchVersion(ua, /maxthon\/[\d._]+/g)
  }
  return browserInfo
}

/**
 * 获取设备信息
 * @returns 系统信息 + 浏览器信息
 */
export function getDeviceInfo(): SystemInfo & BrowserInfo {
  const systemInfo = getSystemInfo()
  const browserInfo = getBrowserInfo()
  return { ...systemInfo, ...browserInfo }
}

/**
 * 获取设备窗口尺寸参数
 * @returns 窗口尺寸参数
 */
export function getDeviceSize(): DeviceSize {
  const ratio = Math.min(window.devicePixelRatio, 2)
  const width = window.innerWidth
  const height = window.innerHeight
  const ascept = width / height
  return { ratio, ascept, width, height }
}

/**
 * 判断设备是否为移动端
 * @returns 是否为移动端
 */
export function isMobile(): boolean {
  const { system } = getSystemInfo()
  return ['android', 'ios'].includes(system)
}
