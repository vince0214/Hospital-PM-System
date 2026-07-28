// Load existing records
let records = JSON.parse(localStorage.getItem("pmRecords")) || [];

const form = document.getElementById("pmForm");
const tbody = document.querySelector("#table tbody");
const search = document.getElementById("search");

// Helper function para sa Toast Notification
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = toast.className.replace(`toast show ${type}`, "toast");
    }, 3000); // Maintag pagkahuman sa 3 ka segundo
}

function updateDashboard(){
    document.getElementById("total").innerHTML = records.length;
    let completed = records.filter(r => r.status === "Completed").length;
    let notcompleted = records.filter(r => r.status === "Not Completed").length;

    document.getElementById("completed").innerHTML = completed;
    document.getElementById("notcompleted").innerHTML = notcompleted;
}

function renderTable(data = records){
    tbody.innerHTML = "";

    data.forEach((item, index) => {
        tbody.innerHTML += `
        <tr>
            <td>${item.date}</td>
            <td>${item.department}</td>
            <td>${item.computer}</td>
            <td>${item.maintenance}</td>
            <td>${item.technician}</td>
            <td>${item.work}</td>
            <td>${item.status}</td>
            <td>${item.remarks}</td>
            <td>
                <button onclick="deleteRecord(${index})">Delete</button>
            </td>
        </tr>
        `;
    });

    updateDashboard();
}

form.addEventListener("submit", function(e){
    e.preventDefault();

    const record = {
        date: document.getElementById("date").value,
        department: document.getElementById("department").value,
        computer: document.getElementById("computer").value,
        maintenance: document.getElementById("maintenance").value,
        technician: document.getElementById("technician").value,
        work: document.getElementById("work").value,
        status: document.getElementById("status").value,
        remarks: document.getElementById("remarks").value
    };

    records.push(record);
    localStorage.setItem("pmRecords", JSON.stringify(records));

    renderTable();

    form.reset();

    document.getElementById("technician").value = "Vincent";
    document.getElementById("work").value = "Cleaned System Unit, Updated Windows";
    document.getElementById("remarks").value = "No Issues";

    // Mo-gawas ang Green Alert
    showToast("✅ Maintenance record added successfully!", "success");
});

function deleteRecord(index){
    if(confirm("Delete this record?")){
        records.splice(index, 1);
        localStorage.setItem("pmRecords", JSON.stringify(records));
        renderTable();

        // Mo-gawas ang Red Alert
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
            <td>${item.department}</td>
            <td>${item.computer}</td>
            <td>${item.maintenance}</td>
            <td>${item.technician}</td>
            <td>${item.work}</td>
            <td>${item.status}</td>
            <td>${item.remarks}</td>
        </tr>
        `;
    });

    let win = window.open("", "", "width=1000,height=700");

    win.document.write(`
    <html>
    <head>
        <title>Hospital IT Preventive Maintenance Report</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; color: green; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background-color: #198754; color: white; }
        </style>
    </head>
    <body>
        <h2>Hospital IT Preventive Maintenance Report</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Department</th>
                    <th>Computer Name</th>
                    <th>Maintenance Type</th>
                    <th>Technician</th>
                    <th>Work Performed</th>
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

// Initial load
renderTable();
