// src/_worker.js
async function handleRequest(request) {
  const url = new URL(request.url);
  const basePath = "/Sub2JSON"; // Define your custom base path here
  const homePath = "/convert"; // Define home path here
  const sub = url.searchParams.get("sub") || 'https://example.com/sub'; // subscription URL

  if (url.pathname === homePath) {
    const html = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>V2Ray Sub2JSON Worker</title>
        <style>
          :root {
            --primary: #007bff;
            --success: #28a745;
            --gray: #6c757d;
            --bg: #f4f4f9;
            --text: #333;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
          }
          .container {
            background: #fff;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: var(--shadow);
            width: 100%;
            max-width: 600px;
            text-align: center;
          }
          header {
            margin-bottom: 1.5rem;
          }
          h1 {
            font-size: 1.8rem;
            color: var(--primary);
            margin-bottom: 0.5rem;
          }
          h2 {
            font-size: 1.1rem;
            color: var(--primary);
          }
          h2 a {
            color: inherit;
            text-decoration: none;
          }
          h2 a:hover {
            text-decoration: underline;
          }
          .instructions {
            font-size: 1rem;
            color: #555;
            margin-bottom: 1rem;
          }
          .form-group {
            margin-bottom: 1.5rem;
          }
          textarea {
            width: 100%;
            min-height: 120px;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 0.95rem;
            resize: vertical;
            direction: ltr;
            transition: border-color 0.3s;
          }
          textarea:focus {
            border-color: var(--primary);
            outline: none;
          }
          textarea::placeholder {
            color: #aaa;
            font-style: italic;
          }
          .footnote {
            font-size: 0.85rem;
            color: #666;
            margin-top: 0.5rem;
          }
          .button-container {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 1.5rem;
          }
          button, input[type="submit"] {
            padding: 0.75rem 1rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          button.clear-btn {
            background: var(--gray);
            color: white;
          }
          button.clear-btn:hover {
            background: #5a6268;
          }
          button.copy-btn {
            background: var(--success);
            color: white;
          }
          button.copy-btn:hover {
            background: #218838;
          }
          input[type="submit"] {
            background: var(--primary);
            color: white;
          }
          input[type="submit"]:hover {
            background: #0056b3;
          }
          button:hover, input[type="submit"]:hover {
            transform: translateY(-2px);
          }
          .lang-toggle {
            padding: 0.5rem 1rem;
            background: var(--gray);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s;
            margin-bottom: 1rem;
            margin-left: auto; /* Changed from margin-right: 0 to ensure right-alignment */
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }          
          .lang-toggle:hover {
            background: #5a6268;
          }
          /* Removed html[dir="ltr"] .lang-toggle to keep right-aligned */
          .status {
            margin-top: 1rem;
            font-size: 0.9rem;
            color: #555;
            height: 1rem;
          }
          .status.success {
            color: var(--success);
          }
          .status.error {
            color: #dc3545;
          }
          footer {
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #777;
          }
          footer a {
            color: inherit;
            text-decoration: none;
          }
          footer a:hover {
            text-decoration: underline;
          }
          @media (max-width: 480px) {
            .container {
              padding: 1rem;
            }
            h1 {
              font-size: 1.5rem;
            }
            h2 {
              font-size: 1rem;
            }
            .lang-toggle {
              position: static;
              width: 100%;
              max-width: 140px;
              margin: 0 0 1rem auto; /* Right-aligned on mobile */
            }
            .button-container {
              flex-direction: column;
              gap: 0.5rem;
            }
            button, input[type="submit"] {
              width: 100%;
              padding: 0.65rem;
              justify-content: center;
            }
          }
        </style>
      </head>
      <body>
        <button class="lang-toggle" aria-label="Toggle Language" onclick="toggleLanguage()">
          <span aria-hidden="true" id="langEmoji">🌐</span>
          <span id="langText">English</span>
        </button>
        <div class="container">
          <header>
            <h1 id="title">V2Ray Sub2JSON Worker</h1>
            <h2 id="subTitle">(تولید ساب جیسون برای <a href="https://github.com/XTLS/Xray-core" target="_blank">هسته XRAY</a>)</h2>
          </header>
          <p class="instructions" id="instruction">لینک(های) اشتراک و یا کانفیگ(های) V2Ray خود را وارد کنید:</p>
          <form class="form-group" action="${basePath}" method="GET">
            <textarea name="sub" id="sub" placeholder="مثال: https://your-sub-url.com/v2ray.txt" required aria-label="Subscription Links"></textarea>
            <p class="footnote" id="footnote">(هر کدام در یک خط جداگانه)</p>
            <p class="status" id="status"></p>
            <div class="button-container">
              <button type="button" class="clear-btn" onclick="clearTextarea()" aria-label="Clear Textarea"><span aria-hidden="true">🧽</span> <span id="clearText">پاک کردن</span></button>
              <button type="button" class="copy-btn" onclick="copyToClipboard()" aria-label="Convert and Copy"><span aria-hidden="true">🔗</span> <span id="copyText">تبدیل و کپی</span></button>
              <input type="submit" value="↗️ باز کردن" aria-label="Open JSON">
            </div>
          </form>
          <footer>
            Source: <a href="https://github.com/mer30hamid/v2ray-sub2json-worker" target="_blank">GitHub Repository</a>
          </footer>
        </div>
        <script>
          const translations = {
            en: {
              title: "V2Ray Sub2JSON Worker",
              subTitle: "(Generate JSON sub for <a href='https://github.com/XTLS/Xray-core' target='_blank'>XRAY core</a>)",
              instruction: "Enter your V2Ray subscription link(s) or config(s) below:",
              footnote: "(each on a separate line)",
              clearButton: "Clear",
              copyButton: "Convert & Copy",
              submitButton: "Open",
              langButton: "فارسی",
              placeholder: "e.g., https://your-sub-url.com/v2ray.txt",
              error: "Error! Please enter something!",
              copied: "Converted URL copied to clipboard ✔",
              cleared: "Text cleared",
              copyFailed: "Failed to copy: "
            },
            fa: {
              title: "V2Ray Sub2JSON Worker",
              subTitle: "(تولید ساب جیسون برای <a href='https://github.com/XTLS/Xray-core' target='_blank'>هسته XRAY</a>)",
              instruction: "لینک(های) اشتراک و یا کانفیگ(های) V2Ray خود را وارد کنید:",
              footnote: "(هر کدام در یک خط جداگانه)",
              clearButton: "پاک کردن",
              copyButton: "تبدیل و کپی",
              submitButton: "باز کردن",
              langButton: "English",
              placeholder: "مثال: https://your-sub-url.com/v2ray.txt",
              error: "خطا! لطفا یک چیزی وارد کنید!",
              copied: "لینک تبدیل شده در کلیپ‌بورد کپی شد ✔",
              cleared: "متن پاک شد",
              copyFailed: "کپی ناموفق: "
            }
          };

          let currentLang = 'fa';

          function toggleLanguage() {
            currentLang = currentLang === 'en' ? 'fa' : 'en';
            updateLanguage();
          }

          function updateLanguage() {
            document.getElementById('title').textContent = translations[currentLang].title;
            document.getElementById('subTitle').innerHTML = translations[currentLang].subTitle;
            document.getElementById('instruction').textContent = translations[currentLang].instruction;
            document.getElementById('footnote').textContent = translations[currentLang].footnote;
            document.getElementById('clearText').textContent = translations[currentLang].clearButton;
            document.getElementById('copyText').textContent = translations[currentLang].copyButton;
            document.querySelector('input[type="submit"]').value = '↗️ ' + translations[currentLang].submitButton;
            document.getElementById('sub').placeholder = translations[currentLang].placeholder;
            document.getElementById('langText').textContent = translations[currentLang].langButton;
            document.getElementById('langEmoji').textContent = currentLang === 'en' ? '🇮🇷' : '🌐';
            document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
            document.documentElement.lang = currentLang;
          }

          async function copyToClipboard() {
            const subInput = document.getElementById('sub');
            const status = document.getElementById('status');
            if (!subInput.value.trim()) {
              status.textContent = translations[currentLang].error;
              status.className = 'status error';
              return;
            }
            const url = window.location.origin + "${basePath}?sub=" + encodeURIComponent(subInput.value);
            try {
              await navigator.clipboard.writeText(url);
              status.textContent = translations[currentLang].copied;
              status.className = 'status success';
              setTimeout(() => { status.textContent = ''; status.className = 'status'; }, 3000);
            } catch (err) {
              status.textContent = translations[currentLang].copyFailed + err;
              status.className = 'status error';
            }
          }

          function clearTextarea() {
            const subInput = document.getElementById('sub');
            const status = document.getElementById('status');
            subInput.value = '';
            status.textContent = translations[currentLang].cleared;
            status.className = 'status success';
            setTimeout(() => { status.textContent = ''; status.className = 'status'; }, 2000);
          }

          updateLanguage();
        </script>
      </body>
      </html>
    `;
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  } else if (url.pathname !== basePath) {
    return new Response("Hello World!", {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  let data = "";
  const lines = sub.split(/\r\n|\n|\r/).filter(line => line.trim()); // Skip empty lines

  for (const line of lines) {
    if (isValidUri(line, true)) {
      data += line + "\n"; // Proxy URI, add directly
    } else if (isValidUri(line)) {
      try {
        const response = await fetch(line);
        if (!response.ok) {
          console.error(`Fetch failed for ${line}: ${response.status}`);
          continue; // Skip failed fetches
        }
        const responseText = await response.text();
        data += isBase64(responseText) ? atob(responseText) : responseText;
      } catch (error) {
        console.error(`Error fetching ${line}: ${error.message}`);
        continue; // Skip fetch errors
      }
    } else {
      console.log(`Skipping invalid line: ${line}`);
    }
  }

  try {
    const result = await convert(data);
    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Conversion error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


// Base configuration templates
const BASE_OUTBOUNDS = [
  { tag: "direct", protocol: "freedom", settings: {} },
  { tag: "block", protocol: "blackhole", settings: { response: { type: "http" } } }
];

// Helper to generate inbound configuration
function generateInbounds(host = "127.0.0.1", port = 10809, socksport = 10808) {
  const sniffing = { enabled: true, destOverride: ["http", "tls"], routeOnly: false };
  const settings = { auth: "noauth", udp: true, allowTransparent: false };
  return {
    inbounds: [
      { tag: "socks", port: socksport, listen: host, protocol: "socks", sniffing, settings },
      { tag: "http", port, listen: host, protocol: "http", sniffing, settings }
    ]
  };
}

// Helper to parse URI parameters efficiently
function parseUriParams(uri, isShadowsocks = false) {
  const url = new URL(uri);
  const params = new URLSearchParams(url.search);
  const getParam = (key, defaultValue = "") => params.get(key) || defaultValue;
  return {
    protocol: url.protocol.slice(0, -1),
    uid: url.username || url.pathname.split("@")[0],
    password: isShadowsocks ? url.password : url.username,
    method: isShadowsocks ? url.username : "chacha20",
    address: url.hostname,
    port: parseInt(url.port, 10),
    type: getParam("type"),
    security: getParam("security"),
    sni: getParam("sni"),
    fp: getParam("fp"),
    pbk: getParam("pbk"),
    sid: getParam("sid"),
    spx: getParam("spx"),
    flow: getParam("flow"),
    host: getParam("host"),
    path: getParam("path", "/"),
    headertype: getParam("headertype", "http"),
    serviceName: getParam("serviceName"),
    alpn: getParam("alpn", "").split(",").filter(Boolean)
  };
}

// Helper to decode VMess URI
function decodeVmessUri(uri) {
  const encoded = uri.split("://")[1];
  return JSON.parse(decodeBase64(encoded));
}

function decodeBase64(str) {
  const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";

  // Clean the string: remove anything not in the base64 alphabet or padding
  const cleanStr = str.replace(/[^A-Za-z0-9+/=]/g, '');

  // Pad to a multiple of 4 if needed
  const paddingNeeded = (4 - (cleanStr.length % 4)) % 4;
  const paddedStr = cleanStr + "=".repeat(paddingNeeded);

  // Manual decoding
  let buffer = 0, bits = 0;
  for (let i = 0; i < paddedStr.length; i++) {
    if (paddedStr[i] === "=") break; // Stop at padding
    const value = base64Chars.indexOf(paddedStr[i]);
    if (value === -1) continue; // Skip any remaining invalid chars

    buffer = (buffer << 6) + value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      const byte = (buffer >> bits) & 0xFF;
      result += String.fromCharCode(byte);
    }
  }

  return result;
}
// Helper to build stream settings
function buildStreamSettings(params) {
  const { type, security, sni, fp, host, path, headertype, serviceName, alpn, pbk, sid, spx } = params;
  const streamSettings = { network: type == "" ? "tcp" : type };

  if (host && (type === "tcp" || type === "http")) {
    streamSettings.tcpSettings = {
      header: {
        type: headertype,
        request: {
          version: "1.1",
          method: "GET",
          path: [path],
          headers: {
            Host: [host],
            "User-Agent": [""],
            "Accept-Encoding": ["gzip, deflate"],
            Connection: ["keep-alive"],
            Pragma: "no-cache"
          }
        }
      }
    };
  }

  if (type === "ws") {
    streamSettings.wsSettings = {
      path,
      headers: host ? { Host: host } : {}
    };
  }

  if (type === "grpc") {
    streamSettings.grpcSettings = {
      serviceName: serviceName || "",
      multiMode: false,
      idle_timeout: 60,
      health_check_timeout: 20,
      permit_without_stream: false,
      initial_windows_size: 0
    };
  }


  if (security && !security.startsWith("none")) {
    streamSettings.security = security.startsWith("tls") ? "tls" : security;
    streamSettings.security = security.startsWith("reality") ? "reality" : security;
    if (security === "reality") {
      streamSettings.realitySettings = {
        serverName: sni,
        fingerprint: fp,
        show: false,
        publicKey: pbk,
        shortId: sid || "",
        spiderX: spx || ""
      };
    } else {
      streamSettings.tlsSettings = {
        allowInsecure: true,
        serverName: sni,
        alpn: alpn.length ? alpn : [],
        show: false
      };
      if (fp && fp !== "none") streamSettings.tlsSettings.fingerprint = fp;
    }
  } else {
    streamSettings.security = "none";
  }

  return streamSettings;
}


function isValidShadowsocksUrl4XRAY(uri) {
  try {
    if (typeof uri !== 'string') return false;
    uri = uri.trim();
    if (!uri) return false;
    if (!uri.startsWith("ss://")) return false;
    const protocolCount = (uri.match(/:\/\//g) || []).length;
    if (protocolCount > 1) return false;
    const [_, rest] = uri.split("ss://");
    if (!rest) return false;
    const [authHost, tag] = rest.split("#");
    if (!authHost.includes("@")) return false;
    const [auth, hostPort] = authHost.split("@");
    if (!auth || !hostPort) return false;
    let method, password;
    if (isBase64(auth)) {
      const decoded = decodeBase64(auth);
      if (!decoded.includes(":")) return false;
      [method, password] = decoded.split(":");
    } else {
      if (!auth.includes(":")) return false;
      [method, password] = auth.split(":");
    }
    if (!method || !password) return false;

    /*
    const validMethods = [
      "aes-128-gcm", "aes-192-gcm", "aes-256-gcm",
      "aes-128-cfb", "aes-192-cfb", "aes-256-cfb",
      "chacha20", "chacha20-ietf", "chacha20-ietf-poly1305",
      "rc4", "rc4-md5"
    ];
    */

    // Supported Shadowsocks methods in Xray
    const supportedMethodsByXRAY = [
      "aes-128-gcm",
      "aes-256-gcm",
      "chacha20-ietf-poly1305",
      "xchacha20-ietf-poly1305",
      "none",
      "2022-blake3-aes-128-gcm",
      "2022-blake3-aes-256-gcm",
      "2022-blake3-chacha20-poly1305"
    ];

    if (!supportedMethodsByXRAY.includes(method)) {
      //if (!validMethods.includes(method)) {
      //console.warn(`Unknown Shadowsocks method: ${method}`); // Optional warning
      return false;
    }
    const [host, port] = hostPort.split(":");
    if (!host || !port) return false;

    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) return false;
    return true;
  } catch (e) {
    console.error(`Error validating Shadowsocks URL: ${e.message}`);
    return false;
  }
}

// Main conversion function
function convertUriJson(uri, host = "127.0.0.1", httpPort = 10809, socksPort = 10808) {
  if (!uri) return false;
  uri = uri.replace("%2F", "/");

  const isVless = isValidUri(uri, isProxy = true, protocol = "vless");
  const isVmess = isValidUri(uri, isProxy = true, protocol = "vmess");
  const isTrojan = isValidUri(uri, isProxy = true, protocol = "trojan");
  const isShadowsocks = isValidUri(uri, isProxy = true, protocol = "ss");
  const isWireguard = isValidUri(uri, isProxy = true, protocol = "wireguard");

  if (!isVless && !isVmess && !isTrojan && !isShadowsocks && !isWireguard) return false;

  let params, network;
  if (isVmess) {
    const decoded = decodeVmessUri(uri);
    if (!decoded) return false;
    const url = new URL(`vmess://${decoded.id}@${decoded.add}:${decoded.port}`);
    params = { ...parseUriParams(url.href), ...decoded, type: decoded.net };
    params.port = parseInt(params.port, 10);
    network = decoded.net;
  } else if (isShadowsocks) {
    if (!isValidShadowsocksUrl4XRAY(uri)) return false
    const shadowUri = `shadowsocks://${decodeBase64(uri.split("://")[1].split("@")[0])}@${uri.split("@")[1]}`;
    //if (!isValidUri(url)) return false;
    params = parseUriParams(shadowUri, isShadowsocks);
    network = params.type == "" ? "tcp" : params.type;
  } else if (isWireguard) {
    return false;
  } else {
    params = parseUriParams(uri);
    network = params.type;
  }

  const { protocol, uid, password, address, port, flow, method } = params;

  // Validate and ensure port is an integer
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(`Invalid port value: ${port}`);
    return false;
  }

  const isReality = params.security.startsWith("reality");
  const isWs = ((network === "ws") || (network === "httpupgrade"));
  const isTcpOrGrpc = network === "tcp" || network === "grpc";

  if (!((isReality && (isVmess || isVless || isTrojan)) || isWs || isTcpOrGrpc || isShadowsocks)) return false;

  const config = {
    log: { access: "", error: "", loglevel: "warning" },
    outbounds: [
      {
        tag: "proxy",
        protocol,
        settings: isTrojan || isShadowsocks
          ? {
            servers: [{
              address,
              method,
              ota: false,
              password,
              port,
              level: 1,
              flow: flow || ""
            }]
          }
          : {
            vnext: [{
              address,
              port,
              users: [{
                id: uid,
                alterId: 0,
                email: "t@t.tt",
                security: "auto",
                encryption: isVless ? "none" : undefined,
                flow: flow || ""
              }]
            }]
          },
        streamSettings: buildStreamSettings(params, isVmess),
        mux: { enabled: false, concurrency: -1 }
      },
      ...BASE_OUTBOUNDS
    ]
  };

  Object.assign(config, generateInbounds(host, httpPort, socksPort));
  return JSON.stringify(config, null, 2);
}



function isBase64(str) {
  if (typeof str !== 'string') return false;
  str = str.trim();
  if (!str) return false;

  // Pad the string if needed
  const paddingNeeded = (4 - (str.length % 4)) % 4;
  const paddedStr = str + "=".repeat(paddingNeeded);

  // Check length (should now be multiple of 4)
  if (paddedStr.length % 4 !== 0) return false;

  // Validate characters
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(paddedStr)) return false;

  // Try decoding
  try {
    atob(paddedStr);
    return true;
  } catch (e) {
    console.error(`Base64 decode error for "${str}": ${e.message}`);
    return false;
  }
}

// Test cases
console.log(isBase64("YWVzLTI1Ni1jZmI6YW1hem9uc2tyMDU")); // true (unpadded)
console.log(isBase64("YWVzLTI1Ni1jZmI6YW1hem9uc2tyMDU=")); // true (padded)
console.log(isBase64("invalid!")); // false

function isValidUri(uri, isProxy = false, protocol = "none") {
  try {
    new URL(uri);
    let protocolMatch = true;
    if (protocol !== "none") protocolMatch = uri.startsWith(protocol + "://");
    if (isProxy) {
      const isVless = uri.startsWith("vless://");
      const isVmess = uri.startsWith("vmess://");
      const isTrojan = uri.startsWith("trojan://");
      const isShadowsocks = uri.startsWith("ss://");
      const isWireguard = uri.startsWith("wireguard://");
      return (isVless || isVmess || isTrojan || isShadowsocks || isWireguard) && protocolMatch;
    }
    return protocolMatch;
  } catch (e) {
    return false;
  }
}

async function convert(data) {
  const baseConfig = JSON.parse(JSON.stringify(configTemplate));
  const processedProxies = [];
  let proxyCount = 0;

  for (const config of data.split('\n')) {
    if (isValidUri(config, isProxy = true)) {
      const result = convertUriJson(config);
      if (!result) continue;

      let convertedConfig;
      try {
        convertedConfig = JSON.parse(result);
      } catch (e) {
        console.error('JSON parse error:', e.message);
        continue;
      }

      const proxyOutbound = convertedConfig.outbounds.find(out => out.tag === "proxy");
      if (!proxyOutbound) continue;

      proxyCount++;
      const newTag = `proxy-${proxyCount}`;
      proxyOutbound.tag = newTag;

      processedProxies.push(proxyOutbound);
      baseConfig.burstObservatory.subjectSelector.push(newTag);
      baseConfig.routing.balancers[0].selector.push(newTag);
    }
  }

  if (processedProxies.length === 0) return { error: "No valid proxies found" };
  baseConfig.outbounds = processedProxies.concat(baseConfig.outbounds);
  return baseConfig;
}


const configTemplate = {
  "remarks": "v2ray-sub2json-worker",
  "log": {
    "access": "",
    "error": "",
    "loglevel": "none",
    "dnsLog": false
  },
  "dns": {
    "tag": "dns",
    "hosts": {
      "cloudflare-dns.com": [
        "172.67.73.38",
        "104.19.155.92",
        "172.67.73.163",
        "104.18.155.42",
        "104.16.124.175",
        "104.16.248.249",
        "104.16.249.249",
        "104.26.13.8"
      ],
      "domain:youtube.com": ["google.com"]
    },
    "servers": ["https://cloudflare-dns.com/dns-query"]
  },
  "inbounds": [
    {
      "domainOverride": ["http", "tls"],
      "protocol": "socks",
      "tag": "socks-in",
      "listen": "127.0.0.1",
      "port": 10808,
      "settings": {
        "auth": "noauth",
        "udp": true,
        "userLevel": 8
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    },
    {
      "protocol": "http",
      "tag": "http-in",
      "listen": "127.0.0.1",
      "port": 10809,
      "settings": {
        "userLevel": 8
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    }
  ],
  "outbounds": [
    { "tag": "direct", "protocol": "freedom" },
    { "tag": "block", "protocol": "blackhole" },
    {
      "tag": "fragment-out",
      "protocol": "freedom",
      "domainStrategy": "UseIP",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "fragment": {
          "packets": "tlshello",
          "length": "10-20",
          "interval": "10-20"
        }
      },
      "streamSettings": {
        "sockopt": {
          "tcpNoDelay": true,
          "tcpKeepAliveIdle": 100,
          "mark": 255,
          "domainStrategy": "UseIP"
        }
      }
    },
    { "protocol": "dns", "tag": "dns-out" },
    {
      "protocol": "vless",
      "tag": "fakeproxy-out",
      "domainStrategy": "",
      "settings": {
        "vnext": [
          {
            "address": "google.com",
            "port": 443,
            "users": [
              {
                "encryption": "none",
                "flow": "",
                "id": "UUID",
                "level": 8,
                "security": "auto"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "security": "tls",
        "tlsSettings": {
          "allowInsecure": false,
          "alpn": ["h2", "http/1.1"],
          "fingerprint": "randomized",
          "publicKey": "",
          "serverName": "google.com",
          "shortId": "",
          "show": false,
          "spiderX": ""
        },
        "wsSettings": {
          "headers": { "Host": "google.com" },
          "path": "/"
        }
      },
      "mux": { "concurrency": 8, "enabled": false }
    }
  ],
  "policy": {
    "levels": {
      "8": { "connIdle": 300, "downlinkOnly": 1, "handshake": 4, "uplinkOnly": 1 }
    },
    "system": {
      "statsOutboundUplink": true,
      "statsOutboundDownlink": true
    }
  },
  "burstObservatory": {
    "pingConfig": {
      "connectivity": "http://connectivitycheck.platform.hicloud.com/generate_204",
      "destination": "http://www.google.com/gen_204",
      "interval": "15m",
      "sampling": 10,
      "timeout": "3s"
    },
    "subjectSelector": []
  },
  "routing": {
    "balancers": [
      {
        "selector": [],
        "strategy": { "type": "leastLoad" },
        "tag": "xray-load-balancer"
      }
    ],
    "domainMatcher": "hybrid",
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        "inboundTag": ["socks-in", "http-in"],
        "type": "field",
        "port": "53",
        "outboundTag": "dns-out",
        "enabled": true
      },
      { "type": "field", "outboundTag": "direct", "domain": ["regexp:.+\\.ir$"] },
      { "type": "field", "port": "443", "network": "udp", "outboundTag": "block" },
      { "type": "field", "outboundTag": "direct", "protocol": ["bittorrent"] },
      { "type": "field", "outboundTag": "direct", "ip": ["geoip:private"] },
      { "type": "field", "outboundTag": "direct", "domain": ["geosite:private"] },
      { "type": "field", "outboundTag": "direct", "domain": ["geosite:category-ir"] },
      { "type": "field", "outboundTag": "direct", "ip": ["geoip:ir"] },
      {
        "type": "field",
        "outboundTag": "fragment-out",
        "domain": ["geosite:google", "geosite:facebook", "regexp:.+instagram\\.com$"]
      },
      {
        "balancerTag": "xray-load-balancer",
        "inboundTag": ["socks-in", "http-in"],
        "type": "field"
      }
    ]
  }
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});