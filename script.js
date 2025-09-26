// Elements
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const calendarGrid = document.getElementById("calendar-grid");
const chartCanvas = document.getElementById("tasks-chart");
const chartPercent = document.getElementById("chart-percent");
const chartCount = document.getElementById("chart-count");
const calendarMonth = document.getElementById("calendar-month");
const emptyMessage = document.getElementById("empty-message");
const progressContainer = document.getElementById("progress-container");
const streakBadgeEl = document.getElementById("streak-badge");

let tasks = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let filterDate = null;
let selectedCell = null;
let streak = 0;

// Chart
const tasksChart = new Chart(chartCanvas, {
  type:"doughnut",
  data:{ labels:["Completed","Pending"], datasets:[{data:[0,1], backgroundColor:["#4CAF50","#ddd"]}] },
  options:{ cutout:"70%", plugins:{legend:{display:false}} }
});

// Update Donut
function updateChart(){
  const completed = tasks.filter(t=>t.completed).length;
  const pending = tasks.length - completed;
  tasksChart.data.datasets[0].data=[completed, pending||1];
  tasksChart.update();
  const percent = tasks.length ? Math.round((completed/tasks.length)*100) : 0;
  chartPercent.textContent = `${percent}%`;
  chartCount.textContent = `${completed}/${tasks.length} Tasks`;
}

// Update Streak Badge
function updateStreak(){
  streak = tasks.filter(t=>t.completed).length; // simple logic for demo
  let badge="";
  if(streak>=10) badge="🏆";
  else if(streak>=5) badge="🥈";
  else if(streak>=3) badge="🥉";
  streakBadgeEl.innerHTML="";
  if(badge){
    const span=document.createElement("span");
    span.textContent=badge;
    span.className="streak-badge";
    streakBadgeEl.appendChild(span);
  }
}

// Render Task List
function renderTasks(){
  taskList.innerHTML="";
  const displayTasks = filterDate ? tasks.filter(t=>t.date===filterDate) : tasks;
  emptyMessage.style.display = displayTasks.length? "none":"block";

  displayTasks.forEach((task,index)=>{
    const row=document.createElement("tr");
    const cell=document.createElement("td");
    cell.className="task-cell";
    cell.dataset.priority=task.priority;
    if(task.completed) cell.style.opacity=0.6;

    cell.innerHTML=`
      <div class="task-top">
        <span>${task.name} - <i>${task.subject}</i></span>
        <div class="task-actions">
          <input type="checkbox" ${task.completed?"checked":""} onchange="toggleTask(${index})">
          <button onclick="deleteTask(${index})">🗑</button>
        </div>
      </div>
      <div class="task-bottom">
        <span>${task.date}</span>
        <span class="priority-indicator">${task.priority}</span>
      </div>
    `;
    row.appendChild(cell);
    taskList.appendChild(row);
  });
  updateChart();
  updateStreak();
  renderCalendar();
}

// Toggle Complete
function toggleTask(index){ tasks[index].completed = !tasks[index].completed; renderTasks(); }
// Delete Task
function deleteTask(index){ tasks.splice(index,1); renderTasks(); }

// Add Task
taskForm.addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("task-input").value;
  const subject=document.getElementById("subject-input").value;
  const priority=document.getElementById("priority-input").value;
  const date=document.getElementById("deadline-input").value;
  tasks.push({name,subject,priority,date,completed:false});
  taskForm.reset();
  renderTasks();
});

// Calendar Rendering
function renderCalendar(){
  calendarGrid.innerHTML="";
  const firstDay=new Date(currentYear,currentMonth,1).getDay();
  const lastDate=new Date(currentYear,currentMonth+1,0).getDate();
  calendarMonth.textContent=new Date(currentYear,currentMonth).toLocaleString("default",{month:"long",year:"numeric"});

  for(let i=0;i<firstDay;i++){ calendarGrid.appendChild(document.createElement("div")); }

  for(let day=1;day<=lastDate;day++){
    const cell=document.createElement("div");
    cell.className="calendar-cell";
    cell.textContent=day;
    const dateString=`${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const dayTasks=tasks.filter(t=>t.date===dateString);

    if(dayTasks.length){ cell.classList.add(dayTasks.every(t=>t.completed)?"completed":"pending"); }
    else{ cell.style.background="#eee"; }

    const today=new Date();
    if(today.toDateString()===new Date(currentYear,currentMonth,day).toDateString()){ cell.classList.add("today"); }

    cell.addEventListener("mouseenter",e=>showTooltip(e,dayTasks));
    cell.addEventListener("mouseleave",hideTooltip);
    cell.addEventListener("click",()=>{
      filterDate=dateString;
      renderTasks();
      if(selectedCell) selectedCell.classList.remove("selected");
      cell.classList.add("selected");
      selectedCell=cell;
    });
    calendarGrid.appendChild(cell);
  }
}

// Tooltip
function showTooltip(e,dayTasks){
  const tooltip=document.getElementById("tooltip");
  tooltip.style.display="block";
  tooltip.style.left=e.pageX+10+"px";
  tooltip.style.top=e.pageY-20+"px";
  tooltip.innerHTML=dayTasks.length?dayTasks.map(t=>`<div>${t.completed?"✅":"⏳"} ${t.name}</div>`):"No tasks";
}
function hideTooltip(){ document.getElementById("tooltip").style.display="none"; }

// Month Navigation
document.getElementById("prev-month").addEventListener("click",()=>{ currentMonth--; if(currentMonth<0){currentMonth=11; currentYear--;} renderCalendar(); });
document.getElementById("next-month").addEventListener("click",()=>{ currentMonth++; if(currentMonth>11){currentMonth=0; currentYear++;} renderCalendar(); });

// Calendar collapse
const toggleCalendarBtn=document.getElementById("toggle-calendar");
const calendarSection=document.getElementById("calendar-section");
toggleCalendarBtn.addEventListener("click",()=>{
  calendarSection.classList.toggle("hidden");
  toggleCalendarBtn.textContent=calendarSection.classList.contains("hidden")?"🔼 Show Tracker":"🔽 Hide Tracker";
});

// Progress collapse
document.getElementById("toggle-progress").addEventListener("click",()=>{ progressContainer.style.display=progressContainer.style.display==="none"?"block":"none"; });

// Initial Render
renderTasks();
