local ReplicatedStorage = game:GetService("ReplicatedStorage")

local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Signal = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "Librairies", "Externals", "goodsignal")

local OnReloadModuleSpecific = Signal.new()
local OnReloadModuleTriggered = Signal.new()

return {
    PluginUtils = {
        plugin = plugin,
        App = App,
        Manager = Manager,

        OnReloadModuleSpecific = OnReloadModuleSpecific,
        OnReloadModuleTriggered = OnReloadModuleTriggered,

        ReloadModulesThatChanged = function() 
            local AllModules = TS._ReloadModuleThatChangedStep1()
            for k,v in AllModules do
                Manager.ClearCacheForModule(v)
                print("Reloaded", v)

                OnReloadModuleSpecific:Fire(v)
            end

            -- Reload all registry modules
            for _,v in ReplicatedStorage.TS.Registry:GetDescendants() do
                if v:IsA("ModuleScript") then
                    task.spawn(function()
                        Manager.ClearCacheForModule(v)
                        require(v)
                    end)
                end
            end

            OnReloadModuleTriggered:Fire()
        end
    }
}