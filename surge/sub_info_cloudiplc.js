/*
 * Surge 面板显示 CloudIPLC 剩余流量信息和套餐到期时间
 * update: 8/30/2023
 * version: 1.0
 * github: https://raw.githubusercontent.com/DocOfCard/raw/main/surge/sub_info_cloudiplc.sgmodule
 * telegram: @DocOfCard
*/

const url = 'https://www.cloudiplc.com/clientarea.php';
const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/116.0.5845.118 Mobile/15E148 Safari/604.1"
};

let args = getArgs(); // 解析参数
const email = args.email; // 获取邮箱参数
const password = args.password; // 获取密码参数

let title = args.title || "IPLC_info";
let icon = args.icon || "pencil.and.outline";
let iconColor = args.color || "#32CD32";

let now = new Date();
let hour = now.getHours();
let minutes = now.getMinutes();
hour = hour > 9 ? hour : "0" + hour;
minutes = minutes > 9 ? minutes : "0" + minutes;

getToken(function(tokenResponse) {
  if (tokenResponse.error) {
    $done({ title: `${title} | ${hour}:${minutes}`, content: tokenResponse.error, icon: icon, "icon-color": "#ff4500" });
    return;
  }

  const token = tokenResponse.token;

  getProductIdAndExpiration(token, function(productResponse) {
    if (productResponse.error) {
      $done({ title: `${title} | ${hour}:${minutes}`, content: productResponse.error, icon: icon, "icon-color": "#ff4500" });
      return;
    }

    const productId = productResponse.productId;
    const expirationDate = productResponse.expirationDate;

    getVServerId(productId, function(vserverResponse) {
      if (vserverResponse.error) {
        $done({ title: `${title} | ${hour}:${minutes}`, content: vserverResponse.error, icon: icon, "icon-color": "#ff4500" });
        return;
      }

      const vserverid = vserverResponse.vserverid;

      getVServerDetails(vserverid, function(detailsResponse) {
        if (detailsResponse.error) {
          $done({ title: `${title} | ${hour}:${minutes}`, content: detailsResponse.error, icon: icon, "icon-color": "#ff4500" });
          return;
        }

        const bandwidthUsed = detailsResponse.bandwidthUsed;
        const bandwidthFree = detailsResponse.bandwidthFree;
        const bandwidthTotal = detailsResponse.bandwidthTotal;
        const formattedExpirationDate = expirationDate.replace(/-/g, '.').replace(/\b0+/g, ''); // 将 - 替换为 . 并移除前导 0

        const resetDay = getResetDay(expirationDate);
        const resetDayLeft = getRemainingDays(resetDay);

        let content = [`已用: ${bandwidthUsed} | 剩余: ${bandwidthFree}`];

        if (resetDayLeft && formattedExpirationDate && formattedExpirationDate !== "false") {
          content.push(`重置: \t${resetDayLeft} 天 \t| 到期: ${formattedExpirationDate}`);
        } else {
          content.push(`到期时间：${formattedExpirationDate}`)
        }

        $done({
            title: `${title} | ${toPercent(convertToBytes(bandwidthUsed),convertToBytes(bandwidthFree))} | ${hour}:${minutes}`,
            content: content.join("\n"),
            icon: `${icon}`,
            "icon-color": `${iconColor}`,
          });

      });
    });
  });
});

function getArgs() {
  return Object.fromEntries(
    $argument
      .split("&") // 将参数字符串分隔成数组
      .map((item) => item.split("=")) // 分隔键值对
      .map(([k, v]) => [k, decodeURIComponent(v)]) // 存储解码后的值
  );
}

function getToken(callback) {
  $httpClient.get({url: url, headers: headers}, function(error, response, data) {
    if (error || response.status !== 200) {
      const errorMessage = error ? "无法获取 Token。" : "请检查网络。";
      callback({ error: errorMessage });
      return;
    }
  
    const match = data.match(/<input type="hidden" name="token" value="([^"]+)" \/>/);
    if (match && match[1]) {
      const tokenValue = match[1];
      callback({ token: tokenValue });
    } else {
      callback({ error: "未找到 Token 值。" });
    }
  });
}
  
function getProductIdAndExpiration(token, callback) {
  const loginURL = `https://www.cloudiplc.com/dologin.php?token=${token}&username=${email}&password=${password}`;
  $httpClient.get({url: loginURL, headers: headers}, function(error, response, data) {
    if (error || response.status !== 200) {
      callback({ error: "登录失败：请检查网络" });
      return;
    }
  
    if (data.includes("账户或密码错误")) {
      callback({ error: "登录失败：账户或密码错误" });
      return;
    }
  
    const productIdMatch = data.match(/href="clientarea\.php\?action=productdetails&id=(\d+)"/);
    const expirationMatch = data.match(/<span class="text-muted">到期时间: <\/span>\s*([^\s<]+)/);
    if (productIdMatch && expirationMatch) {
      const productId = productIdMatch[1];
      const expirationDate = expirationMatch[1];
      callback({ productId, expirationDate });
    } else {
      callback({ error: "无法获取产品 ID 或到期时间。" });
    }
  });
}
  
function getVServerId(productId, callback) {
  const productDetailsURL = `https://www.cloudiplc.com/clientarea.php?action=productdetails&id=${productId}`;
  $httpClient.get({url: productDetailsURL, headers: headers}, function(error, response, data) {
    if (error || response.status !== 200) {
      callback({ error: "获取产品详情失败。" });
      return;
    }
  
    const vserveridMatch = data.match(/var vserverid = (\d+);/);
    if (vserveridMatch) {
      const vserverid = vserveridMatch[1];
      callback({ vserverid });
    } else {
      callback({ error: "无法获取 vserverid。" });
    }
  });
}
  
function getVServerDetails(vserverid, callback) {
  const vserverDetailsURL = `https://www.cloudiplc.com/modules/servers/solusvmpro/get_client_data.php?vserverid=${vserverid}`;
  $httpClient.get({url: vserverDetailsURL, headers: headers}, function(error, response, data) {
    if (error || response.status !== 200) {
      callback({ error: "获取 vserver 详情失败。" });
      return;
    }

    if (data.includes("未经授权")) {
      callback({ error: "获取失败，请检查用户名密码。" });
      return;
    }
  
    try {
      const jsonData = JSON.parse(data);
      const bandwidthUsed = jsonData.bandwidthused;
      const bandwidthFree = jsonData.bandwidthfree;
      const bandwidthTotal = jsonData.bandwidthtotal;
      callback({ bandwidthUsed, bandwidthFree, bandwidthTotal });
    } catch (parseError) {
      callback({ error: "解析 JSON 失败。" });
    }
  });
}

function getResetDay(expirationDate) {
  const parts = expirationDate.split("-");
  if (parts.length >= 3) {
    const resetDayString = parts[2].split(" ")[0];
    const resetDay = parseInt(resetDayString);
    if (!isNaN(resetDay)) {
      return resetDay;
    }
  }
  return null;
}

function getRemainingDays(resetDay) {
  if (resetDay !== null) {
    const today = new Date();
    const currentDay = today.getDate();
    
    let remainingDays;
    if (currentDay <= resetDay) {
      remainingDays = resetDay - currentDay;
    } else {
      // Assuming it's the next month's reset
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      const daysInNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0).getDate();
      remainingDays = daysInNextMonth - currentDay + resetDay;
    }
    
    return remainingDays;
  }
  
  return null;
}

function convertToBytes(valueWithUnit) {
  const units = {
    GB: Math.pow(1024, 3),
    MB: Math.pow(1024, 2),
    KB: 1024,
  };

  const matches = valueWithUnit.match(/^(\d+(?:\.\d+)?)\s*(GB|MB|KB)\s*$/);
  if (matches) {
    const value = parseFloat(matches[1]);
    const unit = matches[2];
    if (!isNaN(value) && units.hasOwnProperty(unit)) {
      return value * units[unit];
    }
  }

  return null;
}

function toPercent(num, total) {
  return (Math.round((num / total) * 10000) / 100).toFixed(1) + "%";
}
