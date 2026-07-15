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
  .container { padding: 20px; }
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
    background-clip: text;
    animation: shine 2s linear infinite;
    text-shadow: 0 0 30px rgba(255, 0, 255, 0.5);
    line-height: 1.1;
  }
  .subtitle {
    font-size: 32px;
    color: #ff6699;
    margin-top: 20px;
    font-weight: bold;
  }
  .link {
    display: inline-block;
    margin-top: 30px;
    padding: 15px 40px;
    background: linear-gradient(90deg, #ff00ff, #8000ff);
    color: white;
    text-decoration: none;
    border-radius: 50px;
    font-size: 18px;
    font-weight: bold;
    transition: transform 0.3s;
    box-shadow: 0 0 30px rgba(255, 0, 255, 0.6);
  }
  .link:hover {
    transform: scale(1.1);
  }
  @keyframes bounce {
    from { transform: translateY(0) rotate(-5deg); }
    to { transform: translateY(-30px) rotate(5deg); }
  }
  @keyframes shine {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
</style>
</head>
<body>
  <div class="container">
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
-- SM-VAULT PROTECTED SCRIPT v2.0
-- Buy Source Code: https://sm-vault-xyz.vercel.app/
-- =============================================

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")

if not game:IsLoaded() then game.Loaded:Wait() end
if string.dump or getscriptbytecode then return end

local player = Players.LocalPlayer
local parent = (gethui and gethui()) or game:GetService("CoreGui")

pcall(function()
    for _, v in pairs(parent:GetChildren()) do
        if v.Name == "SMVaultGUI" then v:Destroy() end
    end
end)

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "SMVaultGUI"
screenGui.ResetOnSpawn = false
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.DisplayOrder = 999
screenGui.Parent = parent

local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 420, 0, 320)
mainFrame.Position = UDim2.new(0.5, -210, 0.5, -160)
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
titleLabel.Size = UDim2.new(1, -50, 1, 0)
titleLabel.Position = UDim2.new(0, 15, 0, 0)
titleLabel.BackgroundTransparency = 1
titleLabel.Text = "SM-VAULT"
titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
titleLabel.TextSize = 22
titleLabel.Font = Enum.Font.GothamBold
titleLabel.TextXAlignment = Enum.TextXAlignment.Left

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
statusLabel.Position = UDim2.new(0, 10, 0, 80)
statusLabel.BackgroundTransparency = 1
statusLabel.Text = "Script Loaded Successfully!"
statusLabel.TextColor3 = Color3.fromRGB(0, 255, 100)
statusLabel.TextSize = 22
statusLabel.Font = Enum.Font.GothamBold

local separator = Instance.new("Frame", mainFrame)
separator.Size = UDim2.new(0.8, 0, 0, 2)
separator.Position = UDim2.new(0.1, 0, 0, 140)
separator.BackgroundColor3 = Color3.fromRGB(128, 0, 255)
separator.BorderSizePixel = 0

local buyTitle = Instance.new("TextLabel", mainFrame)
buyTitle.Size = UDim2.new(1, -20, 0, 25)
buyTitle.Position = UDim2.new(0, 10, 0, 160)
buyTitle.BackgroundTransparency = 1
buyTitle.Text = "Buy Source Code:"
buyTitle.TextColor3 = Color3.fromRGB(180, 180, 180)
buyTitle.TextSize = 14
buyTitle.Font = Enum.Font.Gotham

local buyLink = Instance.new("TextLabel", mainFrame)
buyLink.Size = UDim2.new(1, -20, 0, 25)
buyLink.Position = UDim2.new(0, 10, 0, 185)
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
protStatus.Position = UDim2.new(0, 10, 0, 260)
protStatus.BackgroundTransparency = 1
protStatus.Text = "Protection: ACTIVE | Version: 2.0"
protStatus.TextColor3 = Color3.fromRGB(0, 200, 0)
protStatus.TextSize = 12
protStatus.Font = Enum.Font.GothamBold

spawn(function()
    while mainFrame and mainFrame.Parent do
        TweenService:Create(mainStroke, TweenInfo.new(1.5, Enum.EasingStyle.Sine), {Color = Color3.fromRGB(0, 150, 255)}):Play()
        wait(1.5)
        TweenService:Create(mainStroke, TweenInfo.new(1.5, Enum.EasingStyle.Sine), {Color = Color3.fromRGB(128, 0, 255)}):Play()
        wait(1.5)
    end
end)

closeBtn.MouseEnter:Connect(function()
    TweenService:Create(closeBtn, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(255, 0, 0)}):Play()
end)
closeBtn.MouseLeave:Connect(function()
    TweenService:Create(closeBtn, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(255, 50, 50)}):Play()
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

closeBtn.MouseButton1Click:Connect(function()
    screenGui:Destroy()
end)

warn("==========================================")
warn("     SM-VAULT v2.0 LOADED")
warn("     User: " .. player.Name)
warn("     Buy Source Code:")
warn("     https://sm-vault-xyz.vercel.app/")
warn("==========================================")

print("dziala skrypt wiec by dzialalo")
`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(luaCode);
}
