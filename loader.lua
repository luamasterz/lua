-- =============================================
-- SM-VAULT PROTECTED SCRIPT
-- Buy Source Code: https://sm-vault-xyz.vercel.app/
-- =============================================

local function Protect()
    if not game:IsLoaded() then game.Loaded:Wait() end
    if not getgenv or not identifyexecutor then 
        warn("Executor not supported!")
        return 
    end
    if string.dump or getscriptbytecode then 
        warn("Decompiler detected!")
        return 
    end

    warn("==========================================")
    warn("     SM-VAULT")
    warn("     Buy Source Code:")
    warn("     https://sm-vault-xyz.vercel.app/")
    warn("==========================================")

    print("dziala skrypt wiec by dzialalo")
end

pcall(Protect)
