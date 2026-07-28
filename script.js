// Load existing records
let records = JSON.parse(localStorage.getItem("pmRecords")) || [];

const form = document.getElementById("pmForm");
const tbody = document.querySelector("#table tbody");
const search = document.getElementById("search");

function renderTable(data = records){

    tbody.innerHTML = "";

    data.forEach((item,index)=>{

        tbody.innerHTML += `
        <tr>
            <td>${item.date}</td>
            <td>${item.department}</td>
            <td>${item.computer}</td>
            <td>${item.maintenance}</td>
            <td>${item.technician}</td>
            <td>${item.status}</td>
            <td>${item.remarks}</td>
            <td>
                <button onclick="deleteRecord(${index})">Delete</button>
            </td>
        </tr>
        `;

    });

}

form.addEventListener("submit",function(e){

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

    localStorage.setItem("pmRecords",JSON.stringify(records));

    renderTable();

    form.reset();

    document.getElementById("technician").value="Vincent";
    document.getElementById("work").value="Cleaned System Unit, Updated Windows";
    document.getElementById("remarks").value="No Issues";

});

function deleteRecord(index){

    if(confirm("Delete this record?")){

        records.splice(index,1);

        localStorage.setItem("pmRecords",JSON.stringify(records));

        renderTable();

    }

}

search.addEventListener("keyup",function(){

    const keyword=this.value.toLowerCase();

    const filtered=records.filter(r=>

        r.department.toLowerCase().includes(keyword) ||

        r.computer.toLowerCase().includes(keyword)

    );

    renderTable(filtered);

});

renderTable();
