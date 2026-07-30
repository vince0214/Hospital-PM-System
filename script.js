// Dynamic Settings Loaded from LocalStorage
let adminPassword = localStorage.getItem("pmAdminPass") || "admin123";
let defaultTechName = localStorage.getItem("pmTechName") || "Vincent";

let records = JSON.parse(localStorage.getItem("pmRecords")) || [];
let savedLogo = localStorage.getItem("hospitalLogo") || "";
let isAdminLoggedIn = false;

const form = document.getElementById("pmForm");
const tbody = document.querySelector("#table tbody");
const search = document.getElementById("search");
const logoInput = document.getElementById("logoInput");
const hospitalLogo = document.getElementById("hospitalLogo");

// Set default technician name on start
document.getElementById("technician").value = defaultTechName;

// Load Logo on Start
if (savedLogo) {
    hospitalLogo.src = savedLogo;
    hospitalLogo.style.display = "block";
}

// Auto Calculate Next PM Date (3 Months Default)
function autoCalculateNextDate() {
    const currentDate = document.getElementById("date").value;
    if (currentDate) {
        let d = new Date(currentDate);
        d.setMonth(d.getMonth() + 3);
        document.getElementById("nextDate").value = d.toISOString().split('T')[0];
    }
}

// ================= LOGIN / LOGOUT LOGIC ================= //

function openLoginModal() {
    document.getElementById("loginModal").style.display = "flex";
    document.getElementById("adminPassword").focus();
}

function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("adminPassword").value = "";
}

function checkPassword() {
    const inputPass = document.getElementById("adminPassword").value;
    if (inputPass === adminPassword) {
        isAdminLoggedIn = true;
        closeLoginModal();
        toggleAdminUI();
        showToast("🔓 Logged in as Admin!", "success");
    } else {
        alert("❌ Mali nga Password!");
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    resetForm();
    toggleAdminUI();
    showToast("🔒 Logged out successfully!", "danger");
}

function toggleAdminUI() {
    const adminElements = document.querySelectorAll(".admin-only");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (isAdminLoggedIn) {
        adminElements.forEach(el => el.style.display = "block");
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        adminElements.forEach(el => el.style.display = "none");
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
    renderTable();
}

// ================= DYNAMIC SETTINGS ================= //

function openSettingsModal() {
    document.getElementById("settingTechName").value = defaultTechName;
    document.getElementById("settingNewPass").value = "";
    document.getElementById("settingsModal").style.display = "flex";
}

function closeSettingsModal() {
    document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
    const newTech = document.getElementById("settingTechName").value.trim();
    const newPass = document.getElementById("settingNewPass").value.trim();

    if (newTech) {
        defaultTechName = newTech;
        localStorage.setItem("pmTechName", defaultTechName);
        document.getElementById("technician").value = defaultTechName;
    }

    if (newPass) {
        adminPassword = newPass;
        localStorage.setItem("pmAdminPass", adminPassword);
    }

    closeSettingsModal();
    showToast("⚙️ Settings saved successfully!", "success");
}

// ================= LOGO & BACKUP ================= //

logoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            savedLogo = e.target.result;
            localStorage.setItem("hospitalLogo", savedLogo);
            hospitalLogo.src = savedLogo;
            hospitalLogo.style.display = "block";
            showToast("🖼️ Hospital Logo updated successfully!", "success");
        };
        reader.readAsDataURL(file);
    }
});

function exportBackup() {
    if (records.length === 0 && !savedLogo) {
        alert("Wala pa'y data o logo nga pwedeng i-backup!");
        return;
    }

    const backupData = { records: records, logo: savedLogo };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    
    const today = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("download", `PM_System_Backup_${today}.json`);
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("📥 Backup file downloaded successfully!", "success");
}

function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.records) {
                records = importedData.records;
                localStorage.setItem("pmRecords", JSON.stringify(records));
            }
            if (importedData.logo) {
                savedLogo = importedData.logo;
                localStorage.setItem("hospitalLogo", savedLogo);
                hospitalLogo.src = savedLogo;
                hospitalLogo.style.display = "block";
            }
            renderTable();
            showToast("📤 Data & Logo restored successfully!", "success");
        } catch (err) {
            alert("Error sa pag-read sa file!");
        }
    };
    reader.readAsText(file);
}

// ================= ALERT CALCULATION LOGIC ================= //

function getScheduleAlert(nextDateStr) {
    if (!nextDateStr) return { badgeHTML: '<span class="badge badge-ok">N/A</span>', isOverdue: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDate = new Date(nextDateStr);
    nextDate.setHours(0, 0, 0, 0);

    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { badgeHTML: `<span class="badge badge-overdue">🔴 OVERDUE (${Math.abs(diffDays)}d)</span>`, isOverdue: true };
    } else if (diffDays <= 7) {
        return { badgeHTML: `<span class="badge badge-soon">🟡 DUE SOON (${diffDays}d)</span>`, isOverdue: false };
    } else {
        return { badgeHTML: `<span class="badge badge-ok">🟢 UP TO DATE</span>`, isOverdue: false };
    }
}

// ================= SYSTEM FUNCTIONS ================= //

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = toast.className.replace(`toast show ${type}`, "toast");
    }, 3000);
}

function updateDashboard(){
    document.getElementById("total").innerHTML = records.length;
    let completed = records.filter(r => r.status === "Completed").length;
    let notcompleted = records.filter(r => r.status === "Not Completed").length;

    let overdueCount = 0;
    records.forEach(r => {
        if (r.nextDate && getScheduleAlert(r.nextDate).isOverdue) {
            overdueCount++;
        }
    });

    document.getElementById("completed").innerHTML = completed;
    document.getElementById("notcompleted").innerHTML = notcompleted;
    document.getElementById("overdueCount").innerHTML = overdueCount;
}

function renderTable(data = records){
    tbody.innerHTML = "";

    data.forEach((item, index) => {
        // PERMANENTE NGA MAGPAKITA ANG EDIT UG DELETE BUTTONS
        let actionTd = `
            <td>
                <button class="btn-edit" onclick="editRecord(${index})">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteRecord(${index})">🗑️ Delete</button>
            </td>`;

        let alertInfo = getScheduleAlert(item.nextDate);

        tbody.innerHTML += `
        <tr>
            <td>${item.date}</td>
            <td><strong>${item.nextDate || 'N/A'}</strong></td>
            <td>${item.department}</td>
            <td>${item.computer}</td>
            <td>${item.maintenance}</td>
            <td>${item.technician}</td>
            <td>${item.status}</td>
            <td>${alertInfo.badgeHTML}</td>
            ${actionTd}
        </tr>
        `;
    });

    updateDashboard();
}

// FORM SUBMIT
form.addEventListener("submit", function(e){
    e.preventDefault();

    const editIndex = parseInt(document.getElementById("editIndex").value);

    const record = {
        date: document.getElementById("date").value,
        nextDate: document.getElementById("nextDate").value,
        department: document.getElementById("department").value,
        computer: document.getElementById("computer").value,
        maintenance: document.getElementById("maintenance").value,
        technician: document.getElementById("technician").value,
        work: document.getElementById("work").value,
        status: document.getElementById("status").value,
        remarks: document.getElementById("remarks").value
    };

    if (editIndex === -1) {
        records.push(record);
        showToast("✅ Maintenance record added successfully!", "success");
    } else {
        records[editIndex] = record;
        showToast("✏️ Record updated successfully!", "success");
    }

    localStorage.setItem("pmRecords", JSON.stringify(records));
    renderTable();
    resetForm();
});

function editRecord(index) {
    const item = records[index];
    
    // Kon dili naka-login ang Admin, i-open lang ang Admin Panel aron makit-an ang form
    document.getElementById("adminPanel").style.display = "block";

    document.getElementById("editIndex").value = index;
    document.getElementById("date").value = item.date;
    document.getElementById("nextDate").value = item.nextDate || "";
    document.getElementById("department").value = item.department;
    document.getElementById("computer").value = item.computer;
    document.getElementById("maintenance").value = item.maintenance;
    document.getElementById("technician").value = item.technician;
    document.getElementById("status").value = item.status;
    document.getElementById("work").value = item.work;
    document.getElementById("remarks").value = item.remarks;

    document.getElementById("saveBtn").innerText = "💾 Save Changes";
    document.getElementById("saveBtn").style.background = "#ffc107";
    document.getElementById("saveBtn").style.color = "black";
    document.getElementById("cancelEditBtn").style.display = "inline-block";

    document.getElementById("adminPanel").scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    form.reset();
    document.getElementById("editIndex").value = "-1";
    document.getElementById("technician").value = defaultTechName;
    document.getElementById("work").value = "Cleaned System Unit, Updated Windows";
    document.getElementById("remarks").value = "No Issues";

    document.getElementById("saveBtn").innerText = "➕ Add Record";
    document.getElementById("saveBtn").style.background = "#198754";
    document.getElementById("saveBtn").style.color = "white";
    document.getElementById("cancelEditBtn").style.display = "none";

    if (!isAdminLoggedIn) {
        document.getElementById("adminPanel").style.display = "none";
    }
}

function deleteRecord(index){
    if(confirm("Delete this record?")){
        records.splice(index, 1);
        localStorage.setItem("pmRecords", JSON.stringify(records));
        renderTable();
        showToast("🗑️ Record deleted successfully!", "danger");
    }
}

search.addEventListener("keyup", function(){
    const keyword = this.value.toLowerCase();
    const filtered = records.filter(r =>
        r.department.toLowerCase().includes(keyword) ||
        r.computer.toLowerCase().includes(keyword)
    );
    renderTable(filtered);
});

function printTable(){
    let rowsHTML = "";
    
    records.forEach(item => {
        rowsHTML += `
        <tr>
            <td>${item.date}</td>
            <td>${item.nextDate || 'N/A'}</td>
            <td>${item.department}</td>
            <td>${item.computer}</td>
            <td>${item.maintenance}</td>
            <td>${item.technician}</td>
            <td>${item.status}</td>
            <td>${item.remarks}</td>
        </tr>
        `;
    });

    let logoHTML = savedLogo ? `<img src="${savedLogo}" style="max-height: 80px; display: block; margin: 0 auto 10px auto;">` : "";

    let win = window.open("", "", "width=1000,height=700");

    win.document.write(`
    <html>
    <head>
        <title>Hospital IT Preventive Maintenance Report</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header-container { text-align: center; margin-bottom: 20px; }
            h2 { color: green; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background-color: #198754; color: white; }
        </style>
    </head>
    <body>
        <div class="header-container">
            ${logoHTML}
            <h2>Hospital IT Preventive Maintenance Report</h2>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Next Due Date</th>
                    <th>Department</th>
                    <th>Computer Name</th>
                    <th>Maintenance Type</th>
                    <th>Technician</th>
                    <th>Status</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>
    </body>
    </html>
    `);

    win.document.close();
    win.print();
}

const darkBtn = document.getElementById("darkBtn");
darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

toggleAdminUI();
