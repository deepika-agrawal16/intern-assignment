const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let systemReports = {};

app.post('/api/system-report', (req, res) => {
    const {
        machine_id,
        timestamp,
        os,
        os_version,
        disk_encrypted,
        os_update_status,
        antivirus_active,
        sleep_timeout_seconds
    } = req.body;

    if (!machine_id) {
        return res.status(400).json({ error: "machine_id is required" });
    }

    systemReports[machine_id] = {
        machine_id,
        timestamp,
        os,
        os_version,
        disk_encrypted,
        os_update_status,
        antivirus_active,
        sleep_timeout_seconds,
        last_update: new Date().toISOString()
    };

    return res.status(200).json({ message: "System report received successfully" });
});

app.get('/api/machines', (req, res) => {
    const allMachines = Object.values(systemReports);
    return res.status(200).json(allMachines);
});

app.get('/api/machines/:id', (req, res) => {
    const machineId = req.params.id;
    const report = systemReports[machineId];

    if (!report) {
        return res.status(404).json({ error: "Machine not found" });
    }

    return res.status(200).json(report);
});

app.listen(PORT, () => {
    console.log(`✅ Backend API running on http://localhost:${PORT}`);
});
