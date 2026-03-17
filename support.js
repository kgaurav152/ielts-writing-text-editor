//set minutes
var mins = 15;

//calculate the seconds
var secs = mins * 60;
var timer = null;
var isPaused = false;
var targetWords = 0;
var audio = new Audio("./videoplayback.mp3");

//countdown function is evoked when page is loaded
function countdown() {
  if (document.getElementById("min").value > 0) {
    document.getElementById("writing").disabled = false;
    isPaused = false;
    var pauseBtn = document.getElementById("pauseTimerBtn");
    if(pauseBtn) {
        pauseBtn.classList.remove("hidden");
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Timer';
    }
    clearTimeout(timer);
    timer = setTimeout(Decrement, 60);
    mins = document.getElementById("min").value;
    secs = mins * 60;
    var startBtn = document.getElementById("startimer");
    startBtn.disabled = true;
    startBtn.classList.add("bg-gray-600", "cursor-not-allowed");
    startBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
    document.getElementById("min").disabled = true;
  } else {
    alert("Timer cannot be 0");
  }
}

function getFormattedTime(n) {
  return n.toString().padStart(2, '0');
}

//Decrement function decrement the value.
function Decrement() {
  if (document.getElementById) {
    var time = document.getElementById("Time");

    //if less than a minute remaining
    //Display only seconds value.
    if (secs < 59 && secs >= 0) {
      time.innerHTML = "Timer - 0:" + getFormattedTime(secs);
    }

    //Display both minutes and seconds
    //getminutes and getseconds is used to
    //get minutes and seconds
    else if (secs >= 0) {
      time.innerHTML = "Timer - " + getFormattedTime(getminutes()) + ":" + getFormattedTime(getseconds());
    }
    //when less than a minute remaining
    //colour of the minutes and seconds
    //changes to red
    if (mins < 1) {
      time.style.color = "red";
    }
    //if seconds becomes zero,
    //then page alert time up
    if (mins < 0 || secs < 0) {
      //    alert('time up');
      audio.play();
      document.getElementById("writing").disabled = true;
      document.getElementById("pause").style.display = "block";
      document.getElementById("startimer").disabled = false;
      document.getElementById("min").disabled = false;
      time.innerHTML = "Time Up 💔";
      time.style.color = "red";
    }
    //if seconds > 0 then seconds is decremented
    else {
      secs--;
      timer = setTimeout(Decrement, 1000);
    }
  }
}

function togglePauseTimer() {
  var btn = document.getElementById("pauseTimerBtn");
  var resetBtn = document.getElementById("resetTimerBtn");
  if (isPaused) {
    isPaused = false;
    btn.innerHTML = '<i class="fas fa-pause"></i> Pause Timer';
    if(resetBtn) resetBtn.classList.add("hidden");
    document.getElementById("writing").disabled = false;
    timer = setTimeout(Decrement, 1000);
  } else {
    isPaused = true;
    btn.innerHTML = '<i class="fas fa-play"></i> Resume Timer';
    if(resetBtn) resetBtn.classList.remove("hidden");
    clearTimeout(timer);
    document.getElementById("writing").disabled = true;
  }
}

function resetTimer() {
  clearTimeout(timer);
  isPaused = false;
  var pauseBtn = document.getElementById("pauseTimerBtn");
  if(pauseBtn) {
      pauseBtn.classList.add("hidden");
      pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Timer';
  }
  var resetBtn = document.getElementById("resetTimerBtn");
  if(resetBtn) {
      resetBtn.classList.add("hidden");
  }
  
  var startBtn = document.getElementById("startimer");
  startBtn.disabled = false;
  startBtn.classList.remove("bg-gray-600", "cursor-not-allowed");
  startBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
  
  document.getElementById("min").disabled = false;
  document.getElementById("writing").disabled = false;
  var time = document.getElementById("Time");
  time.innerHTML = "Timer - mm:ss";
  time.style.color = "";
}

function getminutes() {
  //minutes is seconds divided by 60, rounded down
  mins = Math.floor(secs / 60);
  return mins;
}

function getseconds() {
  //take minutes remaining (as seconds) away
  //from total seconds remaining
  return secs - Math.round(mins * 60);
}
function pauseAudio() {
  audio.pause();
}

function cleartextarea() {
  document.getElementById("writing").innerHTML = "";
}

document
  .getElementById("writing")
  .addEventListener("keyup", function countWord() {
    let res = [];
    let str = this.value.replace(/[\t\n\r\.\?\!]/gm, " ").split(" ");
    str.map((s) => {
      let trimStr = s.trim();
      if (trimStr.length > 0) {
        res.push(trimStr);
      }
    });

    // Auto-save
    localStorage.setItem("ielts_draft", this.value);

    let wordCountEl = document.querySelector("#word_count");
    if (targetWords > 0) {
      wordCountEl.innerText = `Total Word Count : ${res.length} / ${targetWords}`;
      if (res.length >= targetWords) {
        wordCountEl.classList.add("text-green-500");
        wordCountEl.classList.remove("text-gray-400");
      } else {
        wordCountEl.classList.remove("text-green-500");
        wordCountEl.classList.add("text-gray-400");
      }
    } else {
      wordCountEl.innerText = "Total Word Count : " + res.length;
      wordCountEl.classList.remove("text-green-500");
      wordCountEl.classList.add("text-gray-400");
    }
  });

// Restore drafted text on load
document.addEventListener("DOMContentLoaded", () => {
  const savedDraft = localStorage.getItem("ielts_draft");
  if (savedDraft) {
    const writingArea = document.getElementById("writing");
    writingArea.value = savedDraft;
    // trigger word count calculation
    writingArea.dispatchEvent(new Event("keyup"));
  }
});

function resettextbox() {
  if (confirm("Are you sure you want to clear your text? This action cannot be undone.")) {
    document.querySelector("#word_count").innerText = "Total Word Count : 0";
    document.querySelector("#word_count").classList.remove("text-green-500");
    document.querySelector("#word_count").classList.add("text-gray-400");
    document.getElementById("writing").value = "";
    document.getElementById("writing").disabled = false;
    document.getElementById("min").value = "";
    targetWords = 0;
    localStorage.removeItem("ielts_draft");
    resetTimer();
  }
}

function exportToDocx() {
  const text = document.getElementById("writing").value;
  if (!text.trim()) {
    alert("There is no text to export.");
    return;
  }
  
  const paragraphs = text.split('\n').map(line => new docx.Paragraph({
    children: [new docx.TextRun(line)]
  }));

  const doc = new docx.Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  docx.Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "IELTS_Practice.docx";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function selectTask1() {
  document.getElementById("min").value = 20;
  targetWords = 150;
  // Trigger word count display update
  document.getElementById("writing").dispatchEvent(new Event("keyup"));
}

function selectTask2() {
  document.getElementById("min").value = 40;
  targetWords = 250;
  // Trigger word count display update
  document.getElementById("writing").dispatchEvent(new Event("keyup"));
}

function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.contains("bg-white");
  const textarea = document.getElementById("writing");
  const header = document.getElementById("mainHeader");
  const icon = document.getElementById("themeIcon");
  const label = document.getElementById("writingLabel");
  const taskTitle = document.getElementById("taskTitle");

  if (isLight) {
    // Switch to Dark Mode
    body.classList.remove("bg-white", "text-black");
    body.classList.add("bg-gradient-to-br", "from-blue-900", "to-black");
    
    textarea.classList.remove("bg-white", "text-black", "border-gray-500");
    textarea.classList.add("bg-black", "bg-opacity-50", "text-gray-300", "border-white");
    
    if (header) {
      header.classList.add("bg-black", "bg-opacity-50", "text-white");
      header.classList.remove("bg-gray-100", "text-black");
    }
    if (label) {
      label.classList.remove("text-black");
      label.classList.add("text-white");
    }
    if (taskTitle) {
      taskTitle.classList.remove("text-gray-800");
      taskTitle.classList.add("text-gray-300");
    }
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    // Switch to Light Mode
    body.classList.remove("bg-gradient-to-br", "from-blue-900", "to-black");
    body.classList.add("bg-white", "text-black");
    
    textarea.classList.remove("bg-black", "bg-opacity-50", "text-gray-300", "border-white");
    textarea.classList.add("bg-white", "text-black", "border-gray-500");
    
    if (header) {
      header.classList.remove("bg-black", "bg-opacity-50", "text-white");
      header.classList.add("bg-gray-100", "text-black");
    }
    if (label) {
      label.classList.remove("text-white");
      label.classList.add("text-black");
    }
    if (taskTitle) {
      taskTitle.classList.remove("text-gray-300");
      taskTitle.classList.add("text-gray-800");
    }
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }
}

function toggleFullScreen() {
  const elem = document.documentElement;
  const icon = document.getElementById("fullscreenIcon");
  const text = document.getElementById("fullscreenText");
  const header = document.getElementById("mainHeader");
  const footer = document.querySelector("footer");
  const counterDiv = document.getElementById("counter");
  const writingArea = document.getElementById("writing");

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch((err) => {
      alert(`Error attempting to enable fullscreen mode: ${err.message}`);
    });
    icon.classList.remove("fa-expand");
    icon.classList.add("fa-compress");
    if(text) text.innerText = "Exit Full Screen";
    if(header) header.style.display = "none";
    if(footer) footer.style.display = "none";
    if(counterDiv) counterDiv.style.display = "none";
    writingArea.rows = 35; // Expand height
  } else {
    document.exitFullscreen();
    icon.classList.remove("fa-compress");
    icon.classList.add("fa-expand");
    if(text) text.innerText = "Full Screen";
    // Restore UI
    if(header) header.style.display = "flex";
    if(footer) footer.style.display = "flex";
    if(counterDiv) counterDiv.style.display = "block";
    writingArea.rows = 20;
  }
}
