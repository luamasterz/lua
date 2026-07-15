export default function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  
  // =============================================
  // TROLL PAGE FOR BROWSERS
  // =============================================
  if (!userAgent.toLowerCase().includes('roblox')) {
    const trollPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Not Found</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
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
    display: block;
    margin-bottom: 20px;
  }
  .big-text {
    font-size: 120px;
    font-weight: 900;
    color: #ffffff;
    line-height: 1.1;
    letter-spacing: -3px;
  }
  .subtitle {
    font-size: 28px;
    color: #888;
    margin-top: 20px;
    font-weight: bold;
  }
  .link {
    display: inline-block;
    margin-top: 40px;
    padding: 15px 40px;
    background: #ffffff;
    color: #000;
    text-decoration: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    transition: transform 0.3s;
  }
  .link:hover {
    transform: scale(1.05);
  }
</style>
</head>
<body>
  <div>
    <div class="emoji">&#128526;</div>
    <div class="big-text">Not Found</div>
    <div class="subtitle">You cannot access this resource</div>
    <a href="https://sm-vault-xyz.vercel.app/" class="link">Buy Source Code</a>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(trollPage);
    return;
  }

  // =============================================
  // LUA SCRIPT FOR ROBLOX
  // =============================================
  const luaCode = `
-- =============================================
-- SM-VAULT PROTECTED SCRIPT v3.1
-- Buy Source Code: https://sm-vault-xyz.vercel.app/
-- =============================================

local DEBUG_MODE = true
local debugLogs = {}

local function DebugLog(logType, message, solution)
    local timeStr = "00:00:00"
    pcall(function()
        if os and os.date then
            timeStr = os.date("%H:%M:%S") or "00:00:00"
        end
    end)
    
    local entry = {
        time = tostring(timeStr),
        type = tostring(logType or "INFO"),
        message = tostring(message or ""),
        solution = tostring(solution or "")
    }
    table.insert(debugLogs, entry)
    if DEBUG_MODE then
        warn("[SM-VAULT] [" .. entry.type .. "] " .. entry.message)
        if entry.solution ~= "" then warn("[SM-VAULT] [FIX] " .. entry.solution) end
    end
end

DebugLog("INFO", "Loading SM-VAULT v3.1")

local success, result = pcall(function()
    return {
        Players = game:GetService("Players"),
        TweenService = game:GetService("TweenService"),
        UserInputService = game:GetService("UserInputService")
    }
end)

if not success then
    DebugLog("ERROR", "Failed to load Services: " .. tostring(result), "Run in Roblox game")
    return
end

local Players = result.Players
local TweenService = result.TweenService
local UserInputService = result.UserInputService

DebugLog("SUCCESS", "Services loaded")

if not game:IsLoaded() then
    game.Loaded:Wait()
end

local player = Players.LocalPlayer
if not player then
    DebugLog("ERROR", "LocalPlayer not found", "Wait until you spawn in the game")
    return
end

DebugLog("SUCCESS", "Player: " .. player.Name)

local executor = "Unknown"
pcall(function()
    if identifyexecutor then
        executor = identifyexecutor() or "Unknown"
    end
end)
DebugLog("INFO", "Executor: " .. executor)

local parent
if gethui then
    parent = gethui()
    DebugLog("SUCCESS", "Using gethui()")
else
    local ok, cg = pcall(function() return game:GetService("CoreGui") end)
    if ok then
        parent = cg
        DebugLog("INFO", "Using CoreGui")
    else
        parent = player:WaitForChild("PlayerGui")
        DebugLog("WARNING", "Using PlayerGui", "GUI will disappear after respawn")
    end
end

pcall(function()
    for _, v in pairs(parent:GetChildren()) do
        if v.Name == "SMVaultGUI" then v:Destroy() end
    end
end)

local success3, err = pcall(function()
    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "SMVaultGUI"
    screenGui.ResetOnSpawn = false
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    screenGui.DisplayOrder = 999
    screenGui.Parent = parent

    local mainFrame = Instance.new("Frame")
    mainFrame.Size = UDim2.new(0, 420, 0, 340)
    mainFrame.Position = UDim2.new(0.5, -210, 0.5, -170)
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
    titleLabel.Text = "SM-VAULT v3.1"
    titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    titleLabel.TextSize = 22
    titleLabel.Font = Enum.Font.GothamBold
    titleLabel.TextXAlignment = Enum.TextXAlignment.Left

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

    local sep = Instance.new("Frame", mainFrame)
    sep.Size = UDim2.new(0.8, 0, 0, 2)
    sep.Position = UDim2.new(0.1, 0, 0, 145)
    sep.BackgroundColor3 = Color3.fromRGB(128, 0, 255)
    sep.BorderSizePixel = 0

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

    -- DEBUG PANEL
    local debugFrame = Instance.new("Frame")
    debugFrame.Size = UDim2.new(0, 600, 0, 400)
    debugFrame.Position = UDim2.new(0.5, -300, 0.5, -200)
    debugFrame.BackgroundColor3 = Color3.fromRGB(10, 10, 15)
    debugFrame.BorderSizePixel = 0
    debugFrame.Visible = false
    debugFrame.Parent = screenGui
    Instance.new("UICorner", debugFrame).CornerRadius = UDim.new(0, 12)

    local debugTitle = Instance.new("TextLabel", debugFrame)
    debugTitle.Size = UDim2.new(1, 0, 0, 40)
    debugTitle.BackgroundColor3 = Color3.fromRGB(50, 150, 255)
    debugTitle.Text = "DEBUG CONSOLE"
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

    local scroll = Instance.new("ScrollingFrame", debugFrame)
    scroll.Size = UDim2.new(1, -20, 1, -50)
    scroll.Position = UDim2.new(0, 10, 0, 45)
    scroll.BackgroundColor3 = Color3.fromRGB(5, 5, 10)
    scroll.BorderSizePixel = 0
    scroll.ScrollBarThickness = 6
    scroll.CanvasSize = UDim2.new(0, 0, 0, 0)
    scroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
    Instance.new("UICorner", scroll).CornerRadius = UDim.new(0, 8)

    local layout = Instance.new("UIListLayout", scroll)
    layout.SortOrder = Enum.SortOrder.LayoutOrder
    layout.Padding = UDim.new(0, 5)

    local pad = Instance.new("UIPadding", scroll)
    pad.PaddingLeft = UDim.new(0, 10)
    pad.PaddingRight = UDim.new(0, 10)
    pad.PaddingTop = UDim.new(0, 10)

    local function RefreshLogs()
        for _, c in pairs(scroll:GetChildren()) do
            if c:IsA("Frame") then c:Destroy() end
        end
        local colors = {
            INFO = Color3.fromRGB(100, 200, 255),
            SUCCESS = Color3.fromRGB(100, 255, 100),
            WARNING = Color3.fromRGB(255, 200, 50),
            ERROR = Color3.fromRGB(255, 80, 80)
        }
        for i, log in ipairs(debugLogs) do
            local lf = Instance.new("Frame")
            lf.Size = UDim2.new(1, -20, 0, 0)
            lf.AutomaticSize = Enum.AutomaticSize.Y
            lf.BackgroundColor3 = Color3.fromRGB(20, 20, 30)
            lf.BorderSizePixel = 0
            lf.LayoutOrder = i
            lf.Parent = scroll
            Instance.new("UICorner", lf).CornerRadius = UDim.new(0, 6)

            local lp = Instance.new("UIPadding", lf)
            lp.PaddingLeft = UDim.new(0, 10)
            lp.PaddingRight = UDim.new(0, 10)
            lp.PaddingTop = UDim.new(0, 5)
            lp.PaddingBottom = UDim.new(0, 5)

            local lt = Instance.new("TextLabel", lf)
            lt.Size = UDim2.new(1, 0, 0, 0)
            lt.AutomaticSize = Enum.AutomaticSize.Y
            lt.BackgroundTransparency = 1
            lt.Text = "[" .. log.time .. "] [" .. log.type .. "] " .. log.message
            lt.TextColor3 = colors[log.type] or Color3.fromRGB(200, 200, 200)
            lt.TextSize = 13
            lt.Font = Enum.Font.Code
            lt.TextXAlignment = Enum.TextXAlignment.Left
            lt.TextWrapped = true

            if log.solution and log.solution ~= "" then
                local st = Instance.new("TextLabel", lf)
                st.Size = UDim2.new(1, 0, 0, 0)
                st.AutomaticSize = Enum.AutomaticSize.Y
                st.BackgroundTransparency = 1
                st.Text = "   FIX: " .. log.solution
                st.TextColor3 = Color3.fromRGB(150, 255, 150)
                st.TextSize = 12
                st.Font = Enum.Font.Code
                st.TextXAlignment = Enum.TextXAlignment.Left
                st.TextWrapped = true
            end
        end
    end

    spawn(function()
        while mainFrame and mainFrame.Parent do
            TweenService:Create(mainStroke, TweenInfo.new(1.5), {Color = Color3.fromRGB(0, 150, 255)}):Play()
            wait(1.5)
            TweenService:Create(mainStroke, TweenInfo.new(1.5), {Color = Color3.fromRGB(128, 0, 255)}):Play()
            wait(1.5)
        end
    end)

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

    pcall(function()
        game:GetService("ScriptContext").Error:Connect(function(msg, st, sc)
            DebugLog("ERROR", "Roblox: " .. tostring(msg), "Check stackTrace in F9")
        end)
    end)

    DebugLog("SUCCESS", "GUI created in " .. parent:GetFullName())
end)

if not success3 then
    DebugLog("ERROR", "Failed to create GUI: " .. tostring(err), "Check executor permissions")
end

warn("==========================================")
warn("     SM-VAULT v3.1 LOADED")
warn("     User: " .. player.Name)
warn("     Executor: " .. executor)
warn("==========================================")

print("script is working so it would work")
DebugLog("SUCCESS", "Script loaded without errors!")
`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(luaCode);
}
