[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("Live", "Evtx")]
    [string]$Mode,

    # --- Live mode parameters ---
    [string]$LogName,
    [datetime]$StartTime,
    [datetime]$EndTime,

    # --- EVTX mode parameters ---
    [string[]]$EvtxPath,

    # --- Common ---
    [int]$ChunkMinutes = 15,
    [string]$OutDir = ".\output"
)

# -------------------------------
# Setup
# -------------------------------
if (!(Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

Write-Host "[*] Mode: $Mode"

# -------------------------------
# Load Events
# -------------------------------
$events = @()

switch ($Mode) {

    "Live" {
        if (-not $LogName) {
            throw "Live mode requires -LogName"
        }

        Write-Host "[*] Reading live log: $LogName"

        $filter = @{ LogName = $LogName }
        if ($StartTime) { $filter.StartTime = $StartTime }
        if ($EndTime)   { $filter.EndTime   = $EndTime }

        $events = Get-WinEvent -FilterHashtable $filter -ErrorAction Stop
    }

    "Evtx" {
        if (-not $EvtxPath) {
            throw "Evtx mode requires -EvtxPath"
        }

        foreach ($path in $EvtxPath) {
            Write-Host "[*] Reading EVTX file: $path"
            $events += Get-WinEvent -Path $path -ErrorAction Stop
        }
    }
}

if (-not $events -or $events.Count -eq 0) {
    Write-Host "[!] No events found"
    return
}

Write-Host "[*] Loaded $($events.Count) events"

# -------------------------------
# Chunk Events by Time
# -------------------------------
$chunks = $events | Group-Object {
    [math]::Floor(
        ([datetime]$_.TimeCreated - [datetime]"1970-01-01").TotalMinutes / $ChunkMinutes
    )
}

# -------------------------------
# Normalize & Write Output
# -------------------------------
foreach ($chunk in $chunks) {

    $normalized = @()

    foreach ($e in $chunk.Group) {

        $record = @{
            ts           = $e.TimeCreated.ToUniversalTime().ToString("o")
            channel      = $e.LogName
            event_id     = $e.Id
            computer     = $e.MachineName
            user         = $e.UserId
            message      = $e.Message
            command_line = $null
            raw = @{
                ProviderName = $e.ProviderName
            }
        }

        # Best-effort command line extraction
        foreach ($p in $e.Properties) {
            if ($p.Value -is [string] -and $p.Value.Length -gt 20) {
                if ($p.Value -match "exe\s" -or $p.Value -match "powershell") {
                    $record.command_line = $p.Value
                    break
                }
            }
        }

        $normalized += $record
    }

    if ($normalized.Count -gt 0) {
        $start = ($chunk.Group | Sort-Object TimeCreated | Select-Object -First 1).TimeCreated
        $logName = ($chunk.Group[0].LogName -replace "[/\\]", "_")

        $fileName = "{0}_{1}.json" -f `
            $logName,
            $start.ToString("yyyy-MM-ddTHH-mm")

        $outPath = Join-Path $OutDir $fileName

        $normalized | ConvertTo-Json -Depth 5 | Out-File -Encoding UTF8 $outPath

        Write-Host "[+] Wrote $outPath ($($normalized.Count) events)"
    }
}

Write-Host "[x] Extraction complete"