const activeTokens = new Map();
const usedTokens = new Set();
const ipRequests = new Map();
const hwidBans = new Set();

function cleanup() {
  const now = Date.now();
  for (const [token, data] of activeTokens.entries()) {
    if (now - data.created > 25000) activeTokens.delete(token);
  }
  if (usedTokens.size > 8000) usedTokens.clear();
  if (ipRequests.size > 1500) {
    for (const [ip, times] of ipRequests.entries()) {
      const recent = times.filter(t => now - t < 60000);
      if (recent.length === 0) ipRequests.delete(ip);
      else ipRequests.set(ip, recent);
    }
  }
}

export default function handler(req, res) {
  cleanup();

  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const now = Date.now();
  const method = req.method;
  const action = req.query.action || (req.body && req.body.action) || '';

  if (hwidBans.has(ip)) {
    res.status(403).send('print("Nice Try")');
    return;
  }

  const times = ipRequests.get(ip) || [];
  const recent = times.filter(t => now - t < 8000);
  if (recent.length >= 6) {
    hwidBans.add(ip);
    setTimeout(() => hwidBans.delete(ip), 120000);
    res.status(429).send('print("Nice Try")');
    return;
  }
  recent.push(now);
  ipRequests.set(ip, recent);

  if (!userAgent.toLowerCase().includes('roblox')) {
    const troll = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Not Found</title><style>body{background:#000;color:#0f0;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh}div{text-align:center}h1{font-size:80px}a{color:#0af}</style></head><body><div><h1>NICE TRY</h1><p>You cannot access this resource.</p><a href="https://sm-vault-xyz.vercel.app/">Buy Source Code</a></div></body></html>';
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(troll);
    return;
  }

  if (method === 'GET' && !action) {
    const token = Math.random().toString(36).substring(2, 18) + Date.now().toString(36);
    activeTokens.set(token, { created: now, ip: ip, used: false });

    const loader = [
      'local Token = "' + token + '"',
      'local Endpoint = "https://lua-drab.vercel.app/api/loader"',
      'local hwid = "unknown"',
      'pcall(function() if gethwid then hwid = gethwid() elseif game and game.GetService then hwid = tostring(game:GetService("RbxAnalyticsService"):GetClientId()) end end)',
      'local http = request or http_request or (syn and syn.request) or (http and http.request)',
      'if not http then warn("No HTTP function") return end',
      'local r1 = http({Url=Endpoint.."?action=verify",Method="POST",Headers={["Content-Type"]="application/json",["X-Token"]=Token,["X-HWID"]=hwid},Body=game:GetService("HttpService"):JSONEncode({token=Token,hwid=hwid})})',
      'if not r1 or r1.StatusCode~=200 then warn("Verification failed") return end',
      'local key = r1.Body',
      'local r2 = http({Url=Endpoint.."?action=script",Method="POST",Headers={["Content-Type"]="application/json",["X-Key"]=key,["X-HWID"]=hwid},Body=game:GetService("HttpService"):JSONEncode({key=key,hwid=hwid})})',
      'if not r2 or r2.StatusCode~=200 then warn("Script fetch failed") return end',
      'loadstring(r2.Body)()'
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.status(200).send(loader);
    return;
  }

  if (method === 'POST' && action === 'verify') {
    let body = req.body || {};
    if (typeof body === 'string') try { body = JSON.parse(body); } catch(e){}
    const token = req.headers['x-token'] || body.token;
    const hwid = req.headers['x-hwid'] || body.hwid || 'unknown';

    if (!token || !activeTokens.has(token)) {
      res.status(403).send('print("Nice Try")');
      return;
    }

    const data = activeTokens.get(token);
    if (data.used || (now - data.created > 25000)) {
      hwidBans.add(ip);
      setTimeout(() => hwidBans.delete(ip), 120000);
      res.status(403).send('print("Nice Try")');
      return;
    }

    data.used = true;
    const oneTimeKey = Math.random().toString(36).substring(2, 22) + '_' + Date.now();
    activeTokens.set(oneTimeKey, { created: now, ip: ip, hwid: hwid, isKey: true, used: false });
    activeTokens.delete(token);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(oneTimeKey);
    return;
  }

  if (method === 'POST' && action === 'script') {
    let body = req.body || {};
    if (typeof body === 'string') try { body = JSON.parse(body); } catch(e){}
    const key = req.headers['x-key'] || body.key;
    const hwid = req.headers['x-hwid'] || body.hwid || 'unknown';

    if (!key || !activeTokens.has(key)) {
      res.status(403).send('print("Nice Try")');
      return;
    }

    const data = activeTokens.get(key);
    if (!data.isKey || data.used || data.hwid !== hwid || (now - data.created > 15000)) {
      hwidBans.add(ip);
      setTimeout(() => hwidBans.delete(ip), 120000);
      res.status(403).send('print("Nice Try")');
      return;
    }

    data.used = true;
    setTimeout(() => activeTokens.delete(key), 8000);

    const finalScript = [
      'local original = {}',
      'local detectionCount = 0',
      '',
      'local function Detect(methodName)',
      '    detectionCount = detectionCount + 1',
      '    warn("[Lua.XYZ] (" .. methodName .. ") Was Detected By Lua.XYZ v1.2")',
      '    return nil',
      'end',
      '',
      'local function checkString(text)',
      '    if type(text) ~= "string" then return false end',
      '    return text:find("lua%-drab") or text:find("HttpGet") or text:find("loadstring") or text:find("sm%-vault") or text:find("SM%-VAULT") or text:find("Lua%.XYZ") or #text > 200',
      'end',
      '',
      'pcall(function()',
      '    if getgenv then',
      '        local e = getgenv()',
      '        original.setclipboard = rawget(e, "setclipboard")',
      '        original.writeclipboard = rawget(e, "writeclipboard")',
      '        original.toclipboard = rawget(e, "toclipboard")',
      '        original.writefile = rawget(e, "writefile")',
      '        original.appendfile = rawget(e, "appendfile")',
      '        original.makefolder = rawget(e, "makefolder")',
      '        original.delfile = rawget(e, "delfile")',
      '        original.readfile = rawget(e, "readfile")',
      '        original.rconsoleprint = rawget(e, "rconsoleprint")',
      '        original.rconsoleinfo = rawget(e, "rconsoleinfo")',
      '        original.rconsolewarn = rawget(e, "rconsolewarn")',
      '        original.rconsoleerr = rawget(e, "rconsoleerr")',
      '',
      '        e.setclipboard = function(t) if checkString(t) then return Detect("setclipboard") end if original.setclipboard then return original.setclipboard(t) end end',
      '        e.writeclipboard = function(t) if checkString(t) then return Detect("writeclipboard") end if original.writeclipboard then return original.writeclipboard(t) end end',
      '        e.toclipboard = function(t) if checkString(t) then return Detect("toclipboard") end if original.toclipboard then return original.toclipboard(t) end end',
      '        e.writefile = function(p, d) if checkString(d) then return Detect("writefile") end if original.writefile then return original.writefile(p, d) end end',
      '        e.appendfile = function(p, d) if checkString(d) then return Detect("appendfile") end if original.appendfile then return original.appendfile(p, d) end end',
      '        e.makefolder = function(p) return Detect("makefolder") end',
      '        e.delfile = function(p) return Detect("delfile") end',
      '        e.rconsoleprint = function(t) if checkString(t) then return Detect("rconsoleprint") end if original.rconsoleprint then return original.rconsoleprint(t) end end',
      '        e.rconsoleinfo = function(t) if checkString(t) then return Detect("rconsoleinfo") end if original.rconsoleinfo then return original.rconsoleinfo(t) end end',
      '        e.rconsolewarn = function(t) if checkString(t) then return Detect("rconsolewarn") end if original.rconsolewarn then return original.rconsolewarn(t) end end',
      '        e.rconsoleerr = function(t) if checkString(t) then return Detect("rconsoleerr") end if original.rconsoleerr then return original.rconsoleerr(t) end end',
      '    end',
      'end)',
      '',
      'pcall(function()',
      '    if hookfunction then',
      '        if setclipboard then hookfunction(setclipboard, function(t) if checkString(t) then return Detect("setclipboard(hook)") end end) end',
      '        if writeclipboard then hookfunction(writeclipboard, function(t) if checkString(t) then return Detect("writeclipboard(hook)") end end) end',
      '        if toclipboard then hookfunction(toclipboard, function(t) if checkString(t) then return Detect("toclipboard(hook)") end end) end',
      '        if writefile then hookfunction(writefile, function(p, d) if checkString(d) then return Detect("writefile(hook)") end end) end',
      '        if appendfile then hookfunction(appendfile, function(p, d) if checkString(d) then return Detect("appendfile(hook)") end end) end',
      '        if makefolder then hookfunction(makefolder, function() return Detect("makefolder(hook)") end) end',
      '        if delfile then hookfunction(delfile, function() return Detect("delfile(hook)") end) end',
      '    end',
      'end)',
      '',
      'pcall(function()',
      '    if hookfunction and game.HttpGet then',
      '        local origHttpGet',
      '        origHttpGet = hookfunction(game.HttpGet, function(self, url, ...)',
      '            if type(url)=="string" and (url:find("lua%-drab") or url:find("sm%-vault")) then',
      '                Detect("HttpGet(hook)")',
      '            end',
      '            return origHttpGet(self, url, ...)',
      '        end)',
      '    end',
      'end)',
      '',
      'pcall(function()',
      '    local env = getfenv(1)',
      '    if getgc then env.getgc = function() Detect("getgc") return {} end end',
      '    if getreg then env.getreg = function() Detect("getreg") return {} end end',
      '    if getloadedmodules then env.getloadedmodules = function() Detect("getloadedmodules") return {} end end',
      '    if getscripts then env.getscripts = function() Detect("getscripts") return {} end end',
      '    if getrunningscripts then env.getrunningscripts = function() Detect("getrunningscripts") return {} end end',
      '    if getconnections then env.getconnections = function() Detect("getconnections") return {} end end',
      'end)',
      '',
      'pcall(function()',
      '    if debug then',
      '        local origGetinfo = debug.getinfo',
      '        debug.getinfo = function(f, ...)',
      '            local r = origGetinfo(f, ...)',
      '            if r and r.source then',
      '                if tostring(r.source):find("lua%-drab") or tostring(r.source):find("sm%-vault") then',
      '                    Detect("debug.getinfo")',
      '                    r.source = "?"',
      '                end',
      '            end',
      '            return r',
      '        end',
      '        debug.getupvalues = function() Detect("debug.getupvalues") return {} end',
      '        debug.getupvalue = function() Detect("debug.getupvalue") return nil end',
      '        debug.getconstants = function() Detect("debug.getconstants") return {} end',
      '        debug.getconstant = function() Detect("debug.getconstant") return nil end',
      '        debug.getproto = function() Detect("debug.getproto") return nil end',
      '        debug.getprotos = function() Detect("debug.getprotos") return {} end',
      '    end',
      'end)',
      '',
      'pcall(function()',
      '    local realG = _G',
      '    local fakeG = setmetatable({}, {',
      '        __index = function(t, k) return rawget(realG, k) end,',
      '        __newindex = function(t, k, v)',
      '            if checkString(v) then',
      '                Detect("_G write")',
      '                return',
      '            end',
      '            rawset(realG, k, v)',
      '        end',
      '    })',
      '    getfenv(1)._G = fakeG',
      'end)',
      '',
      'pcall(function()',
      '    local env = getfenv(1)',
      '    if decompile then env.decompile = function() return Detect("decompile") end end',
      '    if getscriptbytecode then env.getscriptbytecode = function() return Detect("getscriptbytecode") end end',
      '    if getscripthash then env.getscripthash = function() return Detect("getscripthash") end end',
      '    if dumpstring then env.dumpstring = function() return Detect("dumpstring") end end',
      '    if string and string.dump then',
      '        string.dump = function(f, ...) return Detect("string.dump") end',
      '    end',
      'end)',
      '',
      'pcall(function()',
      '    if identifyexecutor then',
      '        local exec = tostring(identifyexecutor())',
      '        if exec:find("Fiddler") or exec:find("MITM") or exec:find("Proxy") or exec:find("Debug") then',
      '            Detect("suspicious_executor:" .. exec)',
      '            return',
      '        end',
      '    end',
      'end)',
      '',
      'warn("==========================================")',
      'warn("     Lua.XYZ v1.2 - PROTECTION ACTIVE")',
      'warn("     All theft methods are monitored")',
      'warn("     Any attempt will be detected")',
      'warn("     Buy Source Code:")',
      'warn("     https://sm-vault-xyz.vercel.app/")',
      'warn("==========================================")',
      '',
      'print("hey")'
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(finalScript);
    return;
  }

  res.status(404).send('print("Nice Try")');
}

export const config = {
  api: { bodyParser: true }
}
