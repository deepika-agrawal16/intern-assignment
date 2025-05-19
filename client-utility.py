import platform
import subprocess
import json
import uuid
import os
import time
import requests
from datetime import datetime
import shutil  

API_URL = "http://localhost:5000/api/system-report"
CHECK_INTERVAL_MINUTES = 20
LAST_STATE_FILE = "last_state.json"

def get_machine_id():
    id_file = "machine_id.txt"
    if os.path.exists(id_file):
        with open(id_file, "r") as f:
            return f.read().strip()
    else:
        new_id = str(uuid.uuid4())
        with open(id_file, "w") as f:
            f.write(new_id)
        return new_id

def is_disk_encrypted():
    system = platform.system()
    try:
        if system == "Windows":
            output = subprocess.check_output(["manage-bde", "-status", "C:"], shell=True, text=True)
            return "Percentage Encrypted: 100%" in output
        elif system == "Darwin":  # macOS
            output = subprocess.check_output(["fdesetup", "status"], text=True)
            return "FileVault is On" in output
        elif system == "Linux":
            
            if shutil.which("cryptsetup") is None:
                return False
            try:
                luks_devices = subprocess.check_output(["cryptsetup", "status", "luks-*" ], shell=True, text=True, stderr=subprocess.DEVNULL)
                return "is active" in luks_devices
            except subprocess.CalledProcessError:
                return False
        else:
            return False
    except Exception:
        return False

def get_os_update_status():
    system = platform.system()
    try:
        if system == "Windows":
            return "Updated"
        elif system == "Darwin":
            updates = subprocess.check_output(["softwareupdate", "-l"], text=True)
            latest_available = "No new software available." not in updates
            return "Outdated" if latest_available else "Updated"
        elif system == "Linux":
            try:
                import distro
                distro_name = distro.id().lower()
            except ImportError:
                distro_name = platform.system().lower()
            if "ubuntu" in distro_name or "debian" in distro_name:
                output = subprocess.check_output(["apt-get", "-s", "upgrade"], text=True)
                return "Outdated" if "0 upgraded" not in output else "Updated"
            else:
                return "Unknown"
        else:
            return "Unknown"
    except Exception:
        return "Unknown"

def is_antivirus_active():
    system = platform.system()
    try:
        if system == "Windows":
            output = subprocess.check_output(
                ['powershell', '-Command',
                 'Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName'],
                text=True)
            return bool(output.strip())
        elif system == "Darwin":
            output = subprocess.run(["pgrep", "Sophos"], capture_output=True, text=True)
            return bool(output.stdout.strip())
        elif system == "Linux":
            output = subprocess.run(["pgrep", "clamd"], capture_output=True, text=True)
            return bool(output.stdout.strip())
        else:
            return False
    except Exception:
        return False

def get_sleep_setting():
    system = platform.system()
    try:
        if system == "Windows":
            output = subprocess.check_output(["powercfg", "/getactivescheme"], text=True)
            scheme_guid = output.strip().split()[-1]
            
            return 600
        elif system == "Darwin":
            output = subprocess.check_output(["pmset", "-g"], text=True)
            for line in output.splitlines():
                if "sleep" in line and "displaysleep" not in line:
                    parts = line.split()
                    try:
                        return int(parts[-1]) * 60 
                    except:
                        continue
            return 600
        elif system == "Linux":
            # Using gsettings for GNOME sleep timeout
            output = subprocess.check_output(
                ["gsettings", "get", "org.gnome.settings-daemon.plugins.power", "sleep-inactive-ac-timeout"],
                text=True)
            return int(output.strip().strip("'"))
        else:
            return -1
    except Exception:
        return -1

def gather_system_info():
    return {
        "machine_id": get_machine_id(),
        "timestamp": datetime.utcnow().isoformat(),
        "os": platform.system(),
        "os_version": platform.version(),
        "disk_encrypted": is_disk_encrypted(),
        "os_update_status": get_os_update_status(),
        "antivirus_active": is_antivirus_active(),
        "sleep_timeout_seconds": get_sleep_setting()
    }

def load_last_state():
    if os.path.exists(LAST_STATE_FILE):
        with open(LAST_STATE_FILE, "r") as f:
            return json.load(f)
    return None

def save_last_state(state):
    with open(LAST_STATE_FILE, "w") as f:
        json.dump(state, f)

def has_state_changed(current, last):
    if not last:
        return True
    keys = ["disk_encrypted", "os_update_status", "antivirus_active", "sleep_timeout_seconds"]
    for k in keys:
        if current.get(k) != last.get(k):
            return True
    return False

def send_report(data):
    try:
        response = requests.post(API_URL, json=data, timeout=10)
        if response.status_code == 200:
            print(f"Report sent successfully at {data['timestamp']}")
            return True
        else:
            print(f"Failed to send report: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error sending report: {e}")
        return False

def main():
    while True:
        current_state = gather_system_info()
        last_state = load_last_state()
        if has_state_changed(current_state, last_state):
            if send_report(current_state):
                save_last_state(current_state)
        else:
            print("No changes detected. Skipping report.")
        time.sleep(CHECK_INTERVAL_MINUTES * 60)

if __name__ == "__main__":
    main()
