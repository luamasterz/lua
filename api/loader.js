export default function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  
  // =============================================
  // TROLL PAGE DLA PRZEGLADAREK
  // =============================================
  if (!userAgent.toLowerCase().includes('roblox')) {
    const trollPage = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>SM-VAULT</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: linear-gradient(135deg, #1a0033, #000000);
    color: #fff;
    font-family: 'Arial Black', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    overflow: hidden;
    text-align: center;
  }
  .emoji {
    font-size: 180px;
    animation: bounce 1s infinite alternate;
    display: block;
    margin-bottom: 20px;
  }
  .big-text {
    font-size: 90px;
    font-weight: 900;
    background: linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine 2s linear infinite;
    line-height: 1.1;
  }
  .subtitle { font-size: 32px; color: #ff6699; margin-top: 20px; font-weight: bold; }
  .link {
    display: inline-block; margin-top: 30px; padding: 15px 40px;
    background: linear-gradient(90deg, #ff00ff, #8000ff);
    color: white; text-decoration: none; border-radius: 50px;
    font-size: 18px; font-weight: bold; transition: transform 0.3s;
    box-shadow: 0 0 30px rgba(255, 0, 255, 0.6);
  }
  .link:hover { transform: scale(1.1); }
  @keyframes bounce { from{transform:translateY(0) rotate(-5deg)} to{transform:translateY(-30px) rotate(5deg)} }
  @keyframes shine { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
</style>
</head>
<body>
  <div>
    <div class="emoji">&#128526;</div>
    <div class="big-text">NICE TRY BUDDY!</div>
    <div class="subtitle">Nie ukradniesz mojego kodu XD</div>
    <a href="https://sm-vault-xyz.vercel.app/" class="link">Buy Source Code</a>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(trollPage);
    return;
  }

  // =============================================
  // KOD LUA DLA ROBLOXA
  // =============================================
  const luaCode = `
-- =============================================
-- SM-VAULT PROTECTED SCRIPT v3.0 with DEBUG
-- Buy Source Code: https://sm-vault-xyz.vercel.app/
-- =============================================

-- ============ SYSTEM DEBUG ============
local DEBUG_MODE = true -- ustaw na false aby wylaczyc debug
local debugLogs = {}

local function DebugLog(type, message, solution)
    local logEntry = {
        time = os.date("%H:%M:%S"),
        type = type,
        message = tostring(message),
        solution = solution or "Brak rozwiazania"
    }
    table.insert(debugLogs, logEntry)
    
    if DEBUG_MODE then
        local color = {
            INFO = "\\27[36m",
            SUCCESS = "\\27[32m",
            WARNING = "\\27[33m",
            ERROR = "\\27[31m"
        }
        warn("[SM-VAULT DEBUG] [" .. type .. "] " .. tostring(message))
        if solution and solution ~= "Brak rozwiazania" then
            warn("[SM-VAULT DEBUG] [FIX] " .. solution)
        end
    end
end

DebugLog("INFO", "Rozpoczynam ladowanie skryptu SM-VAULT v3.0")

-- ============ SPRAWDZENIE ENVIRONMENT ============
local success, result = pcall(function()
    local Players = game:GetService("Players")
    local TweenService = game:GetService("TweenService")
    local UserInputService = game:GetService("UserInputService")
    
    DebugLog("SUCCESS", "Services zaladowane pomyslnie")
    return {Players = Players, TweenService = TweenService, UserInputService = UserInputService}
end)

if not success then
    DebugLog("ERROR", "Nie mozna zaladowac Services: " .. tostring(result), 
        "Sprawdz czy jestes w grze Roblox i czy executor obsluguje game:GetService()")
    return
end

local Players = result.Players
local TweenService = result.TweenService
local UserInputService = result.UserInputService

-- ============ CHECK: gra zaladowana ============
if not game:IsLoaded() then
    DebugLog("INFO", "Gra nie zaladowana, czekam...")
    game.Loaded:Wait()
    DebugLog("SUCCESS", "Gra zaladowana")
end

-- ============ CHECK: anti-dump ============
if string.dump then
    DebugLog("ERROR", "Wykryto string.dump - proba dumpu kodu!", 
        "Uzyj legalnego executora bez modyfikacji")
    return
end

if getscriptbytecode then
    DebugLog("ERROR", "Wykryto getscriptbytecode - proba dumpu!", 
        "Uzyj legalnego executora bez modyfikacji")
    return
end

DebugLog("SUCCESS", "Anti-dump: OK")

-- ============ CHECK: Player ============
local player = Players.LocalPlayer
if not player then
    DebugLog("ERROR", "LocalPlayer nie istnieje!", 
        "Poczekaj az sie zaladujesz do gry i uruchom skrypt ponownie")
    return
end

DebugLog("SUCCESS", "LocalPlayer: " .. player.Name .. " (ID: " .. player.UserId .. ")")

-- ============ CHECK: Executor ============
local executor = "Unknown"
if identifyexecutor then
    executor = identifyexecutor()
    DebugLog("INFO", "Executor: " .. executor)
else
    DebugLog("WARNING", "identifyexecutor() nie dostepny", 
        "To nie problem, kontynuuje...")
end

-- ============ CHECK: gethui / CoreGui ============
local parent
if gethui then
    parent = gethui()
    DebugLog("SUCCESS", "Uzywam gethui() - najlepsza opcja")
else
    local success2, coreGui = pcall(function() return game:GetService("CoreGui") end)
    if success2 and coreGui then
        parent = coreGui
        DebugLog("WARNING", "gethui() niedostepny, uzywam CoreGui", 
            "Skrypt zadziala, ale rozwaz uzycie lepszego executora")
    else
        parent = player:WaitForChild("PlayerGui")
        DebugLog("WARNING", "CoreGui niedostepny, uzywam PlayerGui", 
            "GUI zniknie po respawnie - to normalne dla tego executora")
    end
end

-- ============ USUN STARE GUI ============
local removed = 0
pcall(function()
    for _, v in pairs(parent:GetChildren()) do
        if v.Name == "SMVaultGUI" then 
            v:Destroy() 
            removed = removed + 1
        end
    end
end)
if removed > 0 then
    DebugLog("INFO", "Usunieto stare GUI (" .. removed .. " szt.)")
end

-- ============ TWORZENIE GUI ============
local success3, err = pcall(function()
    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "SMVaultGUI"
    screenGui.ResetOnSpawn = false
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    screenGui.DisplayOrder = 999
    screenGui.Parent = parent

    local mainFrame = Instance.new("Frame")
    mainFrame.Size = UDim2.new(0, 420, 0, 380)
    mainFrame.Position = UDim2.new(0.5, -210, 0.5, -190)
    mainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 25)
    mainFrame.BorderSizePixel = 0
    mainFrame.Parent = screenGui

    Instance.new("UICorner", mainFrame).CornerRadius = UDim.new(0, 14)
    local mainStroke = Instance.new("UIStroke", mainFrame)
    mainStroke.Color = Color3.fromRGB(128, 0, 255)
    mainStroke.Thickness = 2

    local titleBar = Instance.new("Frame", mainFrame)
    titleBar.Size = UDim2.new(1, 0, 0, 45)
    titleBar.BackgroundColor3 = Color3.fromRGB(128, 0, 255)
    titleBar.BorderSizePixel = 0
    Instance.new("UICorner", titleBar).CornerRadius = UDim.new(0, 14)

    local titleFix = Instance.new("Frame", titleBar)
    titleFix.Size = UDim2.new(1, 0, 0, 15)
    titleFix.Position = UDim2.new(0, 0, 1, -15)
    titleFix.BackgroundColor3 = Color3.fromRGB(128, 0, 255)
    titleFix.BorderSizePixel = 0

    local titleLabel = Instance.new("TextLabel", titleBar)
    titleLabel.Size = UDim2.new(1, -100, 1, 0)
    titleLabel.Position = UDim2.new(0, 15, 0, 0)
    titleLabel.BackgroundTransparency = 1
    titleLabel.Text = "SM-VAULT v3.0"
    titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    titleLabel.TextSize = 22
    titleLabel.Font = Enum.Font.GothamBold
    titleLabel.TextXAlignment = Enum.TextXAlignment.Left

    -- Debug button
    local debugBtn = Instance.new("TextButton", titleBar)
    debugBtn.Size = UDim2.new(0, 60, 0, 32)
    debugBtn.Position = UDim2.new(1, -105, 0, 7)
    debugBtn.BackgroundColor3 = Color3.fromRGB(50, 150, 255)
    debugBtn.Text = "DEBUG"
    debugBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    debugBtn.TextSize = 12
    debugBtn.Font = Enum.Font.GothamBold
    debugBtn.BorderSizePixel = 0
    Instance.new("UICorner", debugBtn).CornerRadius = UDim.new(0, 8)

    local closeBtn = Instance.new("TextButton", titleBar)
    closeBtn.Size = UDim2.new(0, 32, 0, 32)
    closeBtn.Position = UDim2.new(1, -40, 0, 7)
    closeBtn.BackgroundColor3 = Color3.fromRGB(255, 50, 50)
    closeBtn.Text = "X"
    closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    closeBtn.TextSize = 16
    closeBtn.Font = Enum.Font.GothamBold
    closeBtn.BorderSizePixel = 0
    Instance.new("UICorner", closeBtn).CornerRadius = UDim.new(0, 8)

    -- ============ MAIN CONTENT ============
    local statusLabel = Instance.new("TextLabel", mainFrame)
    statusLabel.Size = UDim2.new(1, -20, 0, 40)
    statusLabel.Position = UDim2.new(0, 10, 0, 60)
    statusLabel.BackgroundTransparency = 1
    statusLabel.Text = "Script Loaded Successfully!"
    statusLabel.TextColor3 = Color3.fromRGB(0, 255, 100)
    statusLabel.TextSize = 22
    statusLabel.Font = Enum.Font.GothamBold

    local infoLabel = Instance.new("TextLabel", mainFrame)
    infoLabel.Size = UDim2.new(1, -20, 0, 25)
    infoLabel.Position = UDim2.new(0, 10, 0, 110)
    infoLabel.BackgroundTransparency = 1
    infoLabel.Text = "Executor: " .. executor
    infoLabel.TextColor3 = Color3.fromRGB(150, 150, 255)
    infoLabel.TextSize = 14
    infoLabel.Font = Enum.Font.GothamBold

    local separator = Instance.new("Frame", mainFrame)
    separator.Size = UDim2.new(0.8, 0, 0, 2)
    separator.Position = UDim2.new(0.1, 0, 0, 145)
    separator.BackgroundColor3 = Color3.fromRGB(128, 0, 255)
    separator.BorderSizePixel = 0

    local buyTitle = Instance.new("TextLabel", mainFrame)
    buyTitle.Size = UDim2.new(1, -20, 0, 25)
    buyTitle.Position = UDim2.new(0, 10, 0, 165)
    buyTitle.BackgroundTransparency = 1
    buyTitle.Text = "Buy Source Code:"
    buyTitle.TextColor3 = Color3.fromRGB(180, 180, 180)
    buyTitle.TextSize = 14
    buyTitle.Font = Enum.Font.Gotham

    local buyLink = Instance.new("TextLabel", mainFrame)
    buyLink.Size = UDim2.new(1, -20, 0, 25)
    buyLink.Position = UDim2.new(0, 10, 0, 190)
    buyLink.BackgroundTransparency = 1
    buyLink.Text = "https://sm-vault-xyz.vercel.app/"
    buyLink.TextColor3 = Color3.fromRGB(100, 150, 255)
    buyLink.TextSize = 14
    buyLink.Font = Enum.Font.GothamBold

    local userInfo = Instance.new("TextLabel", mainFrame)
    userInfo.Size = UDim2.new(1, -20, 0, 25)
    userInfo.Position = UDim2.new(0, 10, 0, 225)
    userInfo.BackgroundTransparency = 1
    userInfo.Text = "User: " .. player.Name .. " | ID: " .. player.UserId
    userInfo.TextColor3 = Color3.fromRGB(100, 100, 100)
    userInfo.TextSize = 12
    userInfo.Font = Enum.Font.Gotham

    local protStatus = Instance.new("TextLabel", mainFrame)
    protStatus.Size = UDim2.new(1, -20, 0, 25)
    protStatus.Position = UDim2.new(0, 10, 0, 250)
    protStatus.BackgroundTransparency = 1
    protStatus.Text = "Protection: ACTIVE | Debug: ON"
    protStatus.TextColor3 = Color3.fromRGB(0, 200, 0)
    protStatus.TextSize = 12
    protStatus.Font = Enum.Font.GothamBold

    -- Debug counter
    local debugCounter = Instance.new("TextLabel", mainFrame)
    debugCounter.Size = UDim2.new(1, -20, 0, 25)
    debugCounter.Position = UDim2.new(0, 10, 0, 275)
    debugCounter.BackgroundTransparency = 1
    debugCounter.Text = "Debug Logs: " .. #debugLogs
    debugCounter.TextColor3 = Color3.fromRGB(150, 150, 150)
    debugCounter.TextSize = 12
    debugCounter.Font = Enum.Font.Gotham

    -- ============ DEBUG PANEL (chowany) ============
    local debugFrame = Instance.new("Frame")
    debugFrame.Size = UDim2.new(0, 600, 0, 400)
    debugFrame.Position = UDim2.new(0.5, -300, 0.5, -200)
    debugFrame.BackgroundColor3 = Color3.fromRGB(10, 10, 15)
    debugFrame.BorderSizePixel = 0
    debugFrame.Visible = false
    debugFrame.Parent = screenGui
    Instance.new("UICorner", debugFrame).CornerRadius = UDim.new(0, 12)
    
    local debugStroke = Instance.new("UIStroke", debugFrame)
    debugStroke.Color = Color3.fromRGB(50, 150, 255)
    debugStroke.Thickness = 2

    local debugTitle = Instance.new("TextLabel", debugFrame)
    debugTitle.Size = UDim2.new(1, 0, 0, 40)
    debugTitle.BackgroundColor3 = Color3.fromRGB(50, 150, 255)
    debugTitle.Text = "DEBUG CONSOLE - SM-VAULT"
    debugTitle.TextColor3 = Color3.fromRGB(255, 255, 255)
    debugTitle.TextSize = 18
    debugTitle.Font = Enum.Font.GothamBold
    debugTitle.BorderSizePixel = 0
    Instance.new("UICorner", debugTitle).CornerRadius = UDim.new(0, 12)

    local debugClose = Instance.new("TextButton", debugFrame)
    debugClose.Size = UDim2.new(0, 30, 0, 30)
    debugClose.Position = UDim2.new(1, -35, 0, 5)
    debugClose.BackgroundColor3 = Color3.fromRGB(255, 50, 50)
    debugClose.Text = "X"
    debugClose.TextColor3 = Color3.fromRGB(255, 255, 255)
    debugClose.TextSize = 14
    debugClose.Font = Enum.Font.GothamBold
    debugClose.BorderSizePixel = 0
    Instance.new("UICorner", debugClose).CornerRadius = UDim.new(0, 6)

    local scrollFrame = Instance.new("ScrollingFrame", debugFrame)
    scrollFrame.Size = UDim2.new(1, -20, 1, -50)
    scrollFrame.Position = UDim2.new(0, 10, 0, 45)
    scrollFrame.BackgroundColor3 = Color3.fromRGB(5, 5, 10)
    scrollFrame.BorderSizePixel = 0
    scrollFrame.ScrollBarThickness = 6
    scrollFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
    scrollFrame.AutomaticCanvasSize = Enum.AutomaticSize.Y
    Instance.new("UICorner", scrollFrame).CornerRadius = UDim.new(0, 8)

    local layout = Instance.new("UIListLayout", scrollFrame)
    layout.SortOrder = Enum.SortOrder.LayoutOrder
    layout.Padding = UDim.new(0, 5)

    local padding = Instance.new("UIPadding", scrollFrame)
    padding.PaddingLeft = UDim.new(0, 10)
    padding.PaddingRight = UDim.new(0, 10)
    padding.PaddingTop = UDim.new(0, 10)

    -- Wypelnij logami
    local function RefreshLogs()
        for _, child in pairs(scrollFrame:GetChildren()) do
            if child:IsA("Frame") then child:Destroy() end
        end
        
        for i, log in ipairs(debugLogs) do
            local logFrame = Instance.new("Frame")
            logFrame.Size = UDim2.new(1, -20, 0, 0)
            logFrame.AutomaticSize = Enum.AutomaticSize.Y
            logFrame.BackgroundColor3 = Color3.fromRGB(20, 20, 30)
            logFrame.BorderSizePixel = 0
            logFrame.LayoutOrder = i
            logFrame.Parent = scrollFrame
            Instance.new("UICorner", logFrame).CornerRadius = UDim.new(0, 6)
            
            local logPadding = Instance.new("UIPadding", logFrame)
            logPadding.PaddingLeft = UDim.new(0, 10)
            logPadding.PaddingRight = UDim.new(0, 10)
            logPadding.PaddingTop = UDim.new(0, 5)
            logPadding.PaddingBottom = UDim.new(0, 5)
            
            local typeColors = {
                INFO = Color3.fromRGB(100, 200, 255),
                SUCCESS = Color3.fromRGB(100, 255, 100),
                WARNING = Color3.fromRGB(255, 200, 50),
                ERROR = Color3.fromRGB(255, 80, 80)
            }
            
            local logText = Instance.new("TextLabel", logFrame)
            logText.Size = UDim2.new(1, 0, 0, 0)
            logText.AutomaticSize = Enum.AutomaticSize.Y
            logText.BackgroundTransparency = 1
            logText.Text = "[" .. log.time .. "] [" .. log.type .. "] " .. log.message
            logText.TextColor3 = typeColors[log.type] or Color3.fromRGB(200, 200, 200)
            logText.TextSize = 13
            logText.Font = Enum.Font.Code
            logText.TextXAlignment = Enum.TextXAlignment.Left
            logText.TextWrapped = true
            
            if log.solution and log.solution ~= "Brak rozwiazania" then
                local solText = Instance.new("TextLabel", logFrame)
                solText.Size = UDim2.new(1, 0, 0, 0)
                solText.AutomaticSize = Enum.AutomaticSize.Y
                solText.BackgroundTransparency = 1
                solText.Text = "   FIX: " .. log.solution
                solText.TextColor3 = Color3.fromRGB(150, 255, 150)
                solText.TextSize = 12
                solText.Font = Enum.Font.Code
                solText.TextXAlignment = Enum.TextXAlignment.Left
                solText.TextWrapped = true
            end
        end
    end

    -- ============ ANIMACJE ============
    spawn(function()
        while mainFrame and mainFrame.Parent do
            TweenService:Create(mainStroke, TweenInfo.new(1.5, Enum.EasingStyle.Sine), {Color = Color3.fromRGB(0, 150, 255)}):Play()
            wait(1.5)
            TweenService:Create(mainStroke, TweenInfo.new(1.5, Enum.EasingStyle.Sine), {Color = Color3.fromRGB(128, 0, 255)}):Play()
            wait(1.5)
        end
    end)

    -- ============ EVENTS ============
    debugBtn.MouseButton1Click:Connect(function()
        debugFrame.Visible = not debugFrame.Visible
        if debugFrame.Visible then RefreshLogs() end
    end)

    debugClose.MouseButton1Click:Connect(function()
        debugFrame.Visible = false
    end)

    closeBtn.MouseButton1Click:Connect(function()
        screenGui:Destroy()
    end)

    -- Dragging
    local dragging = false
    local dragStart, startPos
    titleBar.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = mainFrame.Position
        end
    end)
    titleBar.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = false
        end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            local delta = input.Position - dragStart
            mainFrame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
        end
    end)

    -- ============ ERROR CATCHER (globalny) ============
    game:GetService("ScriptContext").Error:Connect(function(message, stackTrace, scriptContext)
        DebugLog("ERROR", "Roblox Error: " .. tostring(message), 
            "Sprawdz stackTrace w F9. Jesli to blad gry (nie skryptu), zignoruj.")
        if debugFrame.Visible then RefreshLogs() end
        debugCounter.Text = "Debug Logs: " .. #debugLogs
    end)

    DebugLog("SUCCESS", "GUI utworzone pomyslnie w " .. parent:GetFullName())
end)

if not success3 then
    warn("[SM-VAULT] KRYTYCZNY BLAD GUI: " .. tostring(err))
    DebugLog("ERROR", "Nie udalo sie stworzyc GUI: " .. tostring(err), 
        "Sprawdz czy executor obsluguje Instance.new i UDim2.new")
end

-- ============ KONSOLA ============
warn("==========================================")
warn("     SM-VAULT v3.0 LOADED")
warn("     User: " .. player.Name)
warn("     Executor: " .. executor)
warn("     Debug Mode: " .. tostring(DEBUG_MODE))
warn("     Buy Source Code:")
warn("     https://sm-vault-xyz.vercel.app/")
warn("==========================================")

print("dziala skrypt wiec by dzialalo")

DebugLog("SUCCESS", "Skrypt zaladowany bez bledow!")
`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(luaCode);
}
