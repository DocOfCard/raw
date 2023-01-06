//event network-changed script-path=proxy-auto-switch.js
//version: 1.1
//telegram: @docofcard

//根据SSID和MCC-MNC自动切换ProxyGroup
//请根据自己的需求和配置改动脚本内容
//将脚本放到surge文件夹内,然后在文本模式下将代码复制到[script]下
//TwitchSwitch = type=event,event-name=network-changed,script-path=proxy-auto-switch.js

//通知（可按照需要自己修改）
let TITLE = '自动切换规则!';
let SUBTITLE_CELLULAR = '蜂窝网络: ';
let SUBTITLE_WIFI = 'Wi-Fi: ';
let CNIP = 'ProxyCN: ';
let Proxy_UK = 'ProxyUK: ';
let Proxy_HK = 'ProxyHK: ';
let ABOUT_IP = 'IP: ';


//ssid 连接特定WiFi时切换规则（改为你自己的SSID）
let UKWiFi = [
            "UK_ssid1",
            "UK_ssid2"
    ];
let HKWiFi = [
            "HK_ssid1",
            "HK_ssid2"
    ];

//mcc-mnc 使用特定漫游SIM卡时切换规则（改为你自己的SIM卡MCCMNC, 查询https://cellidfinder.com/mcc-mnc）
let UKCarrier = [
            "234-33",
            "234-20",
            "234-91"
    ];
let HKCarrier = [
            "454-00",
            "454-07",
            "454-12",
            "454-14"
    ];

//自动切换规则，“”中的规则在需要切换的ProxyGroup中必须要有;
let Direct = "DIRECT";
let Reject = "REJECT";

//根据wifi-ssid切换规则;
let NETWORK = "";

if ($network.v4.primaryInterface == "en0") {
    NETWORK += SUBTITLE_WIFI + $network.wifi.ssid;
    ABOUT_IP += $network.v4.primaryAddress;
    if (UKWiFi.indexOf($network.wifi.ssid) != -1) {
        $surge.setSelectGroupPolicy('🇬🇧ProxyUK',Direct);
            $notification.post(TITLE, NETWORK, Proxy_UK + Direct + '\n' + ABOUT_IP);
        $surge.setSelectGroupPolicy('🇭🇰ProxyHK', Reject);
    } else if (HKWiFi.indexOf($network.wifi.ssid) != -1) {
        $surge.setSelectGroupPolicy('🇬🇧ProxyUK',Reject);
        $surge.setSelectGroupPolicy('🇭🇰ProxyHK', Direct);
            $notification.post(TITLE, NETWORK, Proxy_HK + Direct + '\n' + ABOUT_IP);
    } else {
        $surge.setSelectGroupPolicy('🇬🇧ProxyUK',Reject);
        $surge.setSelectGroupPolicy('🇭🇰ProxyHK', Reject);
            $notification.post(TITLE, NETWORK, Proxy_UK + Reject + '\n' + Proxy_HK + Reject + '\n' + ABOUT_IP);
    }

//根据mcc-mnc切换规则;
}else if ($network.v4.primaryInterface == "pdp_ip0") {
  
    const carrierNames = loadCarrierNames();
    const carrierId = $network['cellular-data'].carrier;
    //cellularInfo = carrierNames[carrierId];
    NETWORK += carrierNames[carrierId] + " " + $network['cellular-data'].carrier;
    ABOUT_IP += $network.v4.primaryAddress;
  
    if (UKCarrier.indexOf($network['cellular-data'].carrier) != -1) {
        $surge.setSelectGroupPolicy('🇬🇧ProxyUK',Direct);
            $notification.post(TITLE, NETWORK, Proxy_UK + Direct + '\n' + ABOUT_IP);
        $surge.setSelectGroupPolicy('🇭🇰ProxyHK', Reject);
    } else if (HKCarrier.indexOf($network['cellular-data'].carrier) != -1) {
        $surge.setSelectGroupPolicy('🇬🇧ProxyUK',Reject);
        $surge.setSelectGroupPolicy('🇭🇰ProxyHK', Direct);
            $notification.post(TITLE, NETWORK, Proxy_HK + Direct + '\n' + ABOUT_IP);
    } else {
        $surge.setSelectGroupPolicy('🇬🇧ProxyUK',Reject);
        $surge.setSelectGroupPolicy('🇭🇰ProxyHK', Reject);
            $notification.post(TITLE, NETWORK, Proxy_UK + Reject + '\n' + Proxy_HK + Reject + '\n' + ABOUT_IP);
    }

}

function loadCarrierNames() {
  //整理邏輯:前三碼相同->後兩碼同電信->剩下的
  return {
    //中國電信業者 China
    '460-03': '中国电信', '460-05': '中国电信', '460-11': '中国电信',
    '460-01': '中国联通', '460-06': '中国联通', '460-09': '中国联通',
    '460-00': '中国移动', '460-02': '中国移动', '460-04': '中国移动', '460-07': '中国移动', '460-08': '中国移动',
    '460-15': '中国广电', '460-20': '中移铁通',
    //香港電信業者 HongKong
    '454-00': 'CSL', '454-02': 'CSL', '454-10': 'CSL', '454-18': 'CSL',
    '454-03': '3', '454-04': '3', '454-05': '3',
    '454-06': 'SMC HK', '454-15': 'SMC HK', '454-17': 'SMC HK',
    '454-09': 'CMHK', '454-12': 'CMHK', '454-13': 'CMHK', '454-28': 'CMHK', '454-31': 'CMHK',
    '454-16': 'csl.', '454-19': 'csl.', '454-20': 'csl.', '454-29': 'csl.',
    '454-01': '中信國際電訊', '454-07': 'UNICOM HK', '454-08': 'Truphone', '454-11': 'CHKTL', '454-23': 'Lycamobile',
    //美國電信業者 USA
    '310-030': 'AT&T', '310-070': 'AT&T', '310-150': 'AT&T', '310-170': 'AT&T', '310-280': 'AT&T', '310-380': 'AT&T', '310-410': 'AT&T', '310-560': 'AT&T', '310-680': 'AT&T', '310-980': 'AT&T',
    '310-160': 'T-Mobile', '310-200': 'T-Mobile', '310-210': 'T-Mobile', '310-220': 'T-Mobile', '310-230': 'T-Mobile', '310-240': 'T-Mobile', '310-250': 'T-Mobile', '310-260': 'T-Mobile', '310-270': 'T-Mobile', '310-300': 'T-Mobile', '310-310': 'T-Mobile', '310-660': 'T-Mobile', '310-800': 'T-Mobile', '311-660': 'T-Mobile', '311-882': 'T-Mobile', '311-490': 'T-Mobile', '312-530': 'T-Mobile', '311-870': 'T-Mobile', '311-880': 'T-Mobile',
    '310-004': 'Verizon', '310-010': 'Verizon', '310-012': 'Verizon', '310-013': 'Verizon', '311-110': 'Verizon', '311-270': 'Verizon', '311-271': 'Verizon', '311-272': 'Verizon', '311-273': 'Verizon', '311-274': 'Verizon', '311-275': 'Verizon', '311-276': 'Verizon', '311-277': 'Verizon', '311-278': 'Verizon', '311-279': 'Verizon', '311-280': 'Verizon', '311-281': 'Verizon', '311-282': 'Verizon', '311-283': 'Verizon', '311-284': 'Verizon', '311-285': 'Verizon', '311-286': 'Verizon', '311-287': 'Verizon', '311-288': 'Verizon', '311-289': 'Verizon', '311-390': 'Verizon', '311-480': 'Verizon', '311-481': 'Verizon', '311-482': 'Verizon', '311-483': 'Verizon', '311-484': 'Verizon', '311-485': 'Verizon', '311-486': 'Verizon', '311-487': 'Verizon', '311-488': 'Verizon', '311-489': 'Verizon', '310-590': 'Verizon', '310-890': 'Verizon', '310-910': 'Verizon',
    '310-120': 'Sprint', 
    '310-850': 'Aeris Comm. Inc.', '310-510': 'Airtel Wireless LLC', '312-090': 'Allied Wireless Communications Corporation', '310-710': 'Arctic Slope Telephone Association Cooperative Inc.', '311-440': 'Bluegrass Wireless LLC', '311-800': 'Bluegrass Wireless LLC', '311-810': 'Bluegrass Wireless LLC', '310-900': 'Cable & Communications Corp.', '311-590': 'California RSA No. 3 Limited Partnership', '311-500': 'Cambridge Telephone Company Inc.', '310-830': 'Caprock Cellular Ltd.', '312-270': 'Cellular Network Partnership LLC', '312-280': 'Cellular Network Partnership LLC', '310-360': 'Cellular Network Partnership LLC', '311-120': 'Choice Phone LLC', '310-480': 'Choice Phone LLC', '310-420': 'Cincinnati Bell Wireless LLC', '310-180': 'Cingular Wireless', '310-620': 'Coleman County Telco /Trans TX', '310-06': 'Consolidated Telcom', '310-60': 'Consolidated Telcom', '310-700': 'Cross Valliant Cellular Partnership', '312-030': 'Cross Wireless Telephone Co.', '311-140': 'Cross Wireless Telephone Co.', '312-040': 'Custer Telephone Cooperative Inc.', '310-440': 'Dobson Cellular Systems', '310-990': 'E.N.M.R. Telephone Coop.', '312-120': 'East Kentucky Network LLC', '312-130': 'East Kentucky Network LLC', '310-750': 'East Kentucky Network LLC', '310-090': 'Edge Wireless LLC', '310-610': 'Elkhart TelCo. / Epic Touch Co.', '311-311': 'Farmers', '311-460': 'Fisher Wireless Services Inc.', '311-370': 'GCI Communication Corp.', '310-430': 'GCI Communication Corp.', '310-920': 'Get Mobile Inc.', '311-340': 'Illinois Valley Cellular RSA 2 Partnership', '312-170': 'Iowa RSA No. 2 Limited Partnership', '311-410': 'Iowa RSA No. 2 Limited Partnership', '310-770': 'Iowa Wireless Services LLC', '310-650': 'Jasper', '310-870': 'Kaplan Telephone Company Inc.', '312-180': 'Keystone Wireless LLC', '310-690': 'Keystone Wireless LLC', '311-310': 'Lamar County Cellular', '310-016': 'Leap Wireless International Inc.', '310-040': 'Matanuska Tel. Assn. Inc.', '310-780': 'Message Express Co. / Airlink PCS', '311-330': 'Michigan Wireless LLC', '310-400': 'Minnesota South. Wirel. Co. / Hickory', '311-010': 'Missouri RSA No 5 Partnership', '312-010': 'Missouri RSA No 5 Partnership', '311-020': 'Missouri RSA No 5 Partnership', '312-220': 'Missouri RSA No 5 Partnership', '311-920': 'Missouri RSA No 5 Partnership', '310-350': 'Mohave Cellular LP', '310-570': 'MTPCS LLC', '310-290': 'NEP Cellcorp Inc.', '310-34': 'Nevada Wireless LLC', '310-600': 'New-Cell Inc.', '311-300': 'Nexus Communications Inc.', '310-130': 'North Carolina RSA 3 Cellular Tel. Co.', '312-230': 'North Dakota Network Company', '311-610': 'North Dakota Network Company', '310-450': 'Northeast Colorado Cellular Inc.', '311-710': 'Northeast Wireless Networks LLC', '310-011': 'Northstar', '310-670': 'Northstar', '311-420': 'Northwest Missouri Cellular Limited Partnership', '310-760': 'Panhandle Telephone Cooperative Inc.', '310-580': 'PCS ONE', '311-170': 'PetroCom', '311-670': 'Pine Belt Cellular, Inc.', '310-100': 'Plateau Telecommunications Inc.', '310-940': 'Poka Lambro Telco Ltd.', '310-500': 'Public Service Cellular Inc.', '312-160': 'RSA 1 Limited Partnership', '311-430': 'RSA 1 Limited Partnership', '311-350': 'Sagebrush Cellular Inc.', '310-46': 'SIMMETRY', '311-260': 'SLO Cellular Inc / Cellular One of San Luis', '310-320': 'Smith Bagley Inc.', '316-011': 'Southern Communications Services Inc.', '310-740': 'Telemetrix Inc.', '310-14': 'Testing', '310-860': 'Texas RSA 15B2 Limited Partnership', '311-050': 'Thumb Cellular Limited Partnership', '311-830': 'Thumb Cellular Limited Partnership', '310-460': 'TMP Corporation', '310-490': 'Triton PCS', '312-290': 'Uintah Basin Electronics Telecommunications Inc.', '311-860': 'Uintah Basin Electronics Telecommunications Inc.', '310-960': 'Uintah Basin Electronics Telecommunications Inc.', '310-020': 'Union Telephone Co.', '311-220': 'United States Cellular Corp.', '310-730': 'United States Cellular Corp.', '311-650': 'United Wireless Communications Inc.', '310-003': 'Unknown', '310-15': 'Unknown', '310-23': 'Unknown', '310-24': 'Unknown', '310-25': 'Unknown', '310-26': 'Unknown', '310-190': 'Unknown', '310-950': 'Unknown', '310-38': 'USA 3650 AT&T', '310-999': 'Various Networks', '310-520': 'VeriSign', '310-530': 'West Virginia Wireless', '310-340': 'Westlink Communications, LLC', '311-070': 'Wisconsin RSA #7 Limited Partnership', '310-390': 'Yorkville Telephone Cooperative',
    //英國電信業者 UK
    '234-08': 'BT OnePhone UK','234-10': 'O2-UK','234-15': 'vodafone UK','234-20': '3','234-30': 'EE','234-33': 'EE','234-38': 'Virgin','234-50': 'JT','234-55': 'Sure','234-58': 'Manx Telecom',
  };  
}

$done();