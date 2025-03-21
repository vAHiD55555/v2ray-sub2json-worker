// src/_worker.js


async function handleRequest(request) {
  const url = new URL(request.url);
  
  const basePath = "/Sub2JSON"; // Define your custom base path here
  const homePath = "/convert"; // Define home path here
  const sub = url.searchParams.get("sub") || 'https://example.com/sub'; // subscription URL
  
  // Check if the request path matches the custom base path
  if (url.pathname == homePath) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>V2Ray Sub2JSON Worker</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; text-align: center; }
          input[type="text"] { width: 80%; padding: 8px; margin: 10px 0; }
          input[type="submit"] { padding: 10px 20px; background-color: #007bff; color: white; border: none; cursor: pointer; }
          input[type="submit"]:hover { background-color: #0056b3; }
        </style>
      </head>
      <body>
        <h1>V2Ray Sub2JSON Worker</h1>
        <p>Enter your V2Ray subscription URL below:</p>
        <form action="${basePath}" method="GET">
          <input type="text" name="sub" placeholder="e.g., https://your-sub-url.com/v2ray.txt" required>
          <br>
          <input type="submit" value="Convert">
        </form>
      </body>
      </html>
    `;
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  } 
  else if (url.pathname !== basePath) {
      return new Response("Hello World!", {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  try {
    const response = await fetch(sub);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    let data = await response.text();

    if (isBase64(data)) {
      data = atob(data);
    }

    const result = await convert(data);
    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error.message);
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
function parseUriParams(uri) {
  const url = new URL(uri);
  const params = new URLSearchParams(url.search);
  const getParam = (key, defaultValue = "") => params.get(key) || defaultValue;
  return {
    protocol: url.protocol.slice(0, -1),
    uid: url.username || url.pathname.split("@")[0],
    password: url.username,
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
  return JSON.parse(atob(encoded));
}

// Helper to build stream settings
function buildStreamSettings(params, isVmess = false) {
  const { type, security, sni, fp, host, path, headertype, serviceName, alpn, pbk, sid, spx } = params;
  const streamSettings = { network: type };

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

  if (security && security !== "none") {
    streamSettings.security = security;
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
  }

  return streamSettings;
}

// Main conversion function
function convertUriJson(uri, host = "127.0.0.1", port = 10809, socksport = 10808) {
  if (!uri) return false;
  uri = uri.replace("%2F", "/");

  const isVless = uri.startsWith("vless://");
  const isVmess = uri.startsWith("vmess://");
  const isTrojan = uri.startsWith("trojan://");

  if (!isVless && !isVmess && !isTrojan) return false;

  let params, network;
  if (isVmess) {
    const decoded = decodeVmessUri(uri);
    const url = new URL(`vmess://${decoded.id}@${decoded.add}:${decoded.port}`);
    params = { ...parseUriParams(url.href), ...decoded, type: decoded.net };
    network = decoded.net;
  } else {
    params = parseUriParams(uri);
    network = params.type;
  }

  const { protocol, uid, password, address, port: destPort, flow } = params;

  const isReality = params.security === "reality";
  const isWs = network === "ws";
  const isTcpOrGrpc = network === "tcp" || network === "grpc";

  if (!((isReality && (isVless || isTrojan)) || isWs || isTcpOrGrpc)) return false;

  const config = {
    log: { access: "", error: "", loglevel: "warning" },
    outbounds: [
      {
        tag: "proxy",
        protocol,
        settings: isTrojan
          ? {
              servers: [{
                address,
                method: "chacha20",
                ota: false,
                password,
                port: destPort,
                level: 1,
                flow: flow || ""
              }]
            }
          : {
              vnext: [{
                address,
                port: destPort,
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

  Object.assign(config, generateInbounds(host, port, socksport));
  return JSON.stringify(config, null, 2);
}


function isBase64(str) {
  if (typeof str !== 'string' || str.length % 4 !== 0) return false;
  try {
    atob(str);
    return true;
  } catch (e) {
    return false;
  }
}

function isValidUri(uri) {
  try {
    new URL(uri);
    return true;
  } catch (e) {
    return false;
  }
}

async function convert(data) {
  const baseConfig = JSON.parse(JSON.stringify(configTemplate));
  const processedProxies = [];
  let proxyCount = 0;

  for (const config of data.split('\n')) {
    if (isValidUri(config)) {
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