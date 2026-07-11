// ==========================================
// C# OOP Learning Portal Client-Side Engine
// ==========================================

let activeSectionId = null;
let currentQuestionIndex = 0;
let quizScore = 0;
let quizAnswersSelected = false;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Presenter Mode
    initPresenterMode();

    // Check if we have code injected from the Lab Manual
    const injectedCode = localStorage.getItem("playground_injected_code");
    if (injectedCode) {
        localStorage.removeItem("playground_injected_code");
        window.injectedCodeQueue = injectedCode;
    }

    // 2. Detect active section
    const sectionDataEl = document.getElementById("sectionData");
    if (sectionDataEl) {
        activeSectionId = parseInt(sectionDataEl.getAttribute("data-id"));
        
        // Load Monaco Editor
        initMonacoEditor();

        // Load Section Progress Status
        initSectionProgress();

        // 4. Initialize Visual Simulator Tab listener
        const simulatorTabBtn = document.getElementById("simulator-tab");
        if (simulatorTabBtn) {
            simulatorTabBtn.addEventListener("shown.bs.tab", () => {
                initSimulator(activeSectionId);
            });
        }

        // Initialize Code Lab Tab listener
        const labTabBtn = document.getElementById("lab-tab");
        if (labTabBtn) {
            labTabBtn.addEventListener("shown.bs.tab", () => {
                initLabEditor();
            });
        }

        // Auto-switch to playground if hash is active
        if (window.location.hash === "#playground") {
            setTimeout(() => {
                const playgroundTabBtn = document.getElementById("playground-tab");
                if (playgroundTabBtn) {
                    const tab = new bootstrap.Tab(playgroundTabBtn);
                    tab.show();
                    playgroundTabBtn.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        }
    }

    // 3. Update Overall Dashboard stats
    updateDashboardStats();
});

// ==========================================
// Presenter Mode
// ==========================================
function initPresenterMode() {
    const isPresenter = localStorage.getItem("presenter_mode") === "true";
    const body = document.body;
    const toggleBtn = document.getElementById("presenterModeToggle");
    
    if (isPresenter) {
        body.classList.add("presenter-mode");
        if (toggleBtn) toggleBtn.classList.add("active");
    } else {
        body.classList.remove("presenter-mode");
        if (toggleBtn) toggleBtn.classList.remove("active");
    }
}

function togglePresenterMode() {
    const body = document.body;
    const toggleBtn = document.getElementById("presenterModeToggle");
    const isCurrent = body.classList.contains("presenter-mode");
    
    if (isCurrent) {
        body.classList.remove("presenter-mode");
        if (toggleBtn) toggleBtn.classList.remove("active");
        localStorage.setItem("presenter_mode", "false");
    } else {
        body.classList.add("presenter-mode");
        if (toggleBtn) toggleBtn.classList.add("active");
        localStorage.setItem("presenter_mode", "true");
    }

    // Trigger editor layout recalculation if open
    if (window.editor) {
        setTimeout(() => { window.editor.layout(); }, 150);
    }
}

// ==========================================
// Monaco Editor Loader
// ==========================================
function initMonacoEditor() {
    const editorTarget = document.getElementById("monacoEditor");
    const codeTemplate = document.getElementById("hiddenCodeTemplate");
    
    if (editorTarget && codeTemplate) {
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
        
        require(['vs/editor/editor.main'], function () {
            window.editor = monaco.editor.create(editorTarget, {
                value: window.injectedCodeQueue || codeTemplate.value,
                language: 'csharp',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                tabSize: 4,
                insertSpaces: true
            });
            window.injectedCodeQueue = null; // reset queue
        });
    }
}

function resetCodeTemplate() {
    if (window.editor && confirm("Are you sure you want to reset the current section code to the default template?")) {
        const codeTemplate = document.getElementById("hiddenCodeTemplate");
        if (codeTemplate) {
            window.editor.setValue(codeTemplate.value);
        }
    }
}

// ==========================================
// In-Memory Compiler Client Trigger
// ==========================================
async function runPlaygroundCode() {
    if (!window.editor) return null;

    const runBtn = document.getElementById("runCodeBtn");
    const spinner = document.getElementById("runBtnSpinner");
    const icon = document.getElementById("runBtnIcon");
    const terminal = document.getElementById("terminalOutput");
    const execTime = document.getElementById("executionTime");

    // Disable button & show spinner
    runBtn.disabled = true;
    spinner.classList.remove("d-none");
    icon.classList.add("d-none");
    terminal.innerHTML = '<span class="text-muted">> Compiling and running code...</span>';
    execTime.innerText = "Status: Compiling...";

    const codeContent = window.editor.getValue();
    const startTime = performance.now();

    try {
        const response = await fetch("/api/compiler/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: codeContent })
        });

        const data = await response.json();
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        execTime.innerText = `Time: ${duration}s`;

        if (data.success) {
            terminal.innerHTML = escapeHtml(data.output) || '<span class="text-muted">[Program executed successfully with no console output]</span>';
            return { success: true, output: data.output };
        } else {
            let errorText = '<span class="text-danger font-outfit">Compilation Errors:</span>\n';
            if (data.errors) {
                errorText += `<span class="text-danger">${escapeHtml(data.errors)}</span>\n`;
            }
            if (data.exception) {
                errorText += `<span class="text-warning font-outfit">\nRuntime Exception:</span>\n<span class="text-warning">${escapeHtml(data.exception)}</span>\n`;
            }
            terminal.innerHTML = errorText;
            return { success: false, output: data.output, errors: data.errors, exception: data.exception };
        }
    } catch (err) {
        terminal.innerHTML = `<span class="text-danger">Failed to connect to compilation server: ${err.message}</span>`;
        execTime.innerText = "Status: Connection Error";
        return { success: false, errors: err.message };
    } finally {
        runBtn.disabled = false;
        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
    }
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function goToTab(tabId) {
    const tabEl = document.getElementById(tabId);
    if (tabEl) {
        const tab = new bootstrap.Tab(tabEl);
        tab.show();
    }
}

// ==========================================
// Challenge Solution Verification
// ==========================================
async function verifyChallengeSolution() {
    const sectionDataEl = document.getElementById("sectionData");
    if (!sectionDataEl) return;

    const expectedText = sectionDataEl.getAttribute("data-expected-output");
    
    // Trigger compilation
    const result = await runPlaygroundCode();
    
    if (result && result.success) {
        const cleanOutput = result.output.toLowerCase().trim();
        const cleanExpected = expectedText.toLowerCase().trim();

        if (cleanOutput.includes(cleanExpected)) {
            // Success! Save progress
            localStorage.setItem(`section_${activeSectionId}_challenge_completed`, "true");
            
            // Show successes
            showChallengeCompletedState();
            
            // Celebration Confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            
            alert("Excellent! You have successfully solved this section's challenge! 🎉");
            updateSectionProgress();
            updateDashboardStats();
        } else {
            alert(`Output does not match requirements.\nOutput was: "${result.output.trim()}"\nExpected to contain: "${expectedText}"`);
        }
    } else {
        alert("Verification failed. Please fix compilation errors first.");
    }
}

function showChallengeCompletedState() {
    const pendingBadge = document.getElementById("challengePendingBadge");
    const completedBadge = document.getElementById("challengeCompletedBadge");
    
    if (pendingBadge) pendingBadge.classList.add("d-none");
    if (completedBadge) completedBadge.classList.remove("d-none");
}

// ==========================================
// Quiz State Engine
// ==========================================
function startQuiz() {
    document.getElementById("quizIntro").classList.add("d-none");
    document.getElementById("quizPlayground").classList.remove("d-none");
    document.getElementById("quizResult").classList.add("d-none");

    currentQuestionIndex = 0;
    quizScore = 0;
    renderQuizQuestion();
}

function renderQuizQuestion() {
    if (!quizQuestions || quizQuestions.length === 0) return;

    quizAnswersSelected = false;
    document.getElementById("quizExplanation").classList.add("d-none");
    document.getElementById("nextQuestionBtn").classList.add("d-none");

    const q = quizQuestions[currentQuestionIndex];
    document.getElementById("quizProgressText").innerText = `QUESTION ${currentQuestionIndex + 1} OF ${quizQuestions.length}`;
    document.getElementById("questionText").innerText = q.QuestionText;

    const optionsContainer = document.getElementById("optionsContainer");
    optionsContainer.innerHTML = "";

    q.Options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => selectQuizOption(idx, btn);
        optionsContainer.appendChild(btn);
    });
}

function selectQuizOption(selectedIndex, buttonEl) {
    if (quizAnswersSelected) return; // Prevent multiple selection
    quizAnswersSelected = true;

    const q = quizQuestions[currentQuestionIndex];
    const optionsContainer = document.getElementById("optionsContainer");
    const buttons = optionsContainer.getElementsByClassName("option-btn");

    if (selectedIndex === q.CorrectOptionIndex) {
        buttonEl.classList.add("correct");
        quizScore++;
    } else {
        buttonEl.classList.add("wrong");
        // Highlight correct option in green
        buttons[q.CorrectOptionIndex].classList.add("correct");
    }

    // Show Explanation
    const explanationText = document.getElementById("explanationText");
    const explanationDiv = document.getElementById("quizExplanation");
    explanationText.innerText = q.Explanation;
    explanationDiv.classList.remove("d-none");

    // Show Next Button
    document.getElementById("nextQuestionBtn").classList.remove("d-none");
}

function nextQuizQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        renderQuizQuestion();
    } else {
        showQuizResult();
    }
}

function showQuizResult() {
    document.getElementById("quizPlayground").classList.add("d-none");
    const resultDiv = document.getElementById("quizResult");
    resultDiv.classList.remove("d-none");

    const scorePct = Math.round((quizScore / quizQuestions.length) * 100);
    document.getElementById("quizFinalScore").innerText = `${quizScore} / ${quizQuestions.length}`;
    
    // Save quiz score
    localStorage.setItem(`section_${activeSectionId}_quiz_score`, scorePct.toString());
    localStorage.setItem(`section_${activeSectionId}_quiz_completed`, "true");

    const messageEl = document.getElementById("quizResultMessage");
    const subEl = document.getElementById("quizResultSub");

    if (scorePct === 100) {
        messageEl.innerText = "Perfect score! 🎉";
        subEl.innerText = "You scored 100% and earned the section badge.";
        // Trigger Confetti
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
        });
    } else if (scorePct >= 50) {
        messageEl.innerText = "Good job! You passed the quiz. 👍";
        subEl.innerText = `You scored ${scorePct}%. You can retake it to try for a perfect score.`;
    } else {
        messageEl.innerText = "You did not pass the quiz. 😞";
        subEl.innerText = `You scored ${scorePct}%. Review the lecture and try again.`;
    }

    updateSectionProgress();
    updateDashboardStats();
}

function resetQuiz() {
    startQuiz();
}

// ==========================================
// Progress Calculation and Management
// ==========================================
function initSectionProgress() {
    if (!activeSectionId) return;

    // Initialize Bug Hunter and Code Puzzle if present
    if (window.bugHunterExercise) {
        initBugHunter();
    }
    if (window.codePuzzleExercise) {
        initCodePuzzle();
    }

    // Check challenge completion
    const isChallengeDone = localStorage.getItem(`section_${activeSectionId}_challenge_completed`) === "true";
    if (isChallengeDone) {
        showChallengeCompletedState();
    }

    // Check quiz completion and prefill score if any
    const isQuizDone = localStorage.getItem(`section_${activeSectionId}_quiz_completed`) === "true";
    if (isQuizDone) {
        const score = localStorage.getItem(`section_${activeSectionId}_quiz_score`);
        // We still show the quiz intro but with an option to restart
        document.getElementById("quizIntro").innerHTML = `
            <h4 class="Cairo-bold text-light mb-3">You have already completed this quiz!</h4>
            <p class="text-cyan-light">Your best score is: <strong class="fs-4 text-cyan">${score}%</strong></p>
            <button class="btn btn-cyan Cairo-bold px-5 py-2 mt-3" onclick="startQuiz()">
                Retake Quiz <i class="fa-solid fa-rotate-left ms-1"></i>
            </button>
        `;
    }
}

function updateSectionProgress() {
    if (!activeSectionId) return;

    let progress = 0;
    
    // Check if all labs are completed for the active section
    let labDone = true;
    if (window.sectionLabs && window.sectionLabs.length > 0) {
        for (let i = 0; i < window.sectionLabs.length; i++) {
            const labId = window.sectionLabs[i].Id;
            if (localStorage.getItem(`section_${activeSectionId}_lab_${labId}_completed`) !== "true") {
                labDone = false;
                break;
            }
        }
    } else {
        labDone = localStorage.getItem(`section_${activeSectionId}_lab_completed`) === "true";
    }

    const challengeDone = localStorage.getItem(`section_${activeSectionId}_challenge_completed`) === "true";
    const quizDone = localStorage.getItem(`section_${activeSectionId}_quiz_completed`) === "true";
    const quizScoreVal = parseInt(localStorage.getItem(`section_${activeSectionId}_quiz_score`) || "0");
    const dragDropDone = localStorage.getItem(`section_${activeSectionId}_dragdrop_completed`) === "true";

    // Check predict output completion
    const hasPredicts = window.predictOutputExercises && window.predictOutputExercises.length > 0;
    let allPredictsDone = false;
    if (hasPredicts) {
        allPredictsDone = window.predictOutputExercises.every((_, i) =>
            localStorage.getItem(`section_${activeSectionId}_predict_${i}_done`) === "true"
        );
    }

    // Check bug hunter completion
    const hasBugHunter = window.bugHunterExercise != null;
    const bugHunterDone = localStorage.getItem(`section_${activeSectionId}_bughunter_completed`) === "true";

    // Check code puzzle completion
    const hasCodePuzzle = window.codePuzzleExercise != null;
    const codePuzzleDone = localStorage.getItem(`section_${activeSectionId}_codepuzzle_completed`) === "true";

    // Dynamic Weights distribution (sums to 100 for all paths)
    let weights = {
        lab: 25,
        challenge: 30,
        quiz: 25,
        dragDrop: 20,
        predict: 0,
        bugHunter: 0,
        codePuzzle: 0
    };

    if (hasPredicts && hasBugHunter && hasCodePuzzle) {
        weights = { lab: 15, challenge: 20, quiz: 20, dragDrop: 15, predict: 10, bugHunter: 10, codePuzzle: 10 };
    } else if (hasPredicts && hasBugHunter && !hasCodePuzzle) {
        weights = { lab: 15, challenge: 25, quiz: 20, dragDrop: 15, predict: 15, bugHunter: 10, codePuzzle: 0 };
    } else if (hasPredicts && !hasBugHunter && hasCodePuzzle) {
        weights = { lab: 15, challenge: 25, quiz: 20, dragDrop: 15, predict: 15, bugHunter: 0, codePuzzle: 10 };
    } else if (hasPredicts && !hasBugHunter && !hasCodePuzzle) {
        weights = { lab: 20, challenge: 25, quiz: 25, dragDrop: 15, predict: 15, bugHunter: 0, codePuzzle: 0 };
    } else if (!hasPredicts && hasBugHunter && hasCodePuzzle) {
        weights = { lab: 20, challenge: 25, quiz: 20, dragDrop: 15, predict: 0, bugHunter: 10, codePuzzle: 10 };
    } else if (!hasPredicts && hasBugHunter && !hasCodePuzzle) {
        weights = { lab: 20, challenge: 25, quiz: 25, dragDrop: 20, predict: 0, bugHunter: 10, codePuzzle: 0 };
    } else if (!hasPredicts && !hasBugHunter && hasCodePuzzle) {
        weights = { lab: 20, challenge: 25, quiz: 25, dragDrop: 20, predict: 0, bugHunter: 0, codePuzzle: 10 };
    }

    if (labDone) progress += weights.lab;
    if (challengeDone) progress += weights.challenge;
    if (quizDone) progress += Math.round((quizScoreVal / 100) * weights.quiz);
    if (dragDropDone) progress += weights.dragDrop;
    if (allPredictsDone) progress += weights.predict;
    if (bugHunterDone) progress += weights.bugHunter;
    if (codePuzzleDone) progress += weights.codePuzzle;

    document.getElementById("sectionProgressVal").innerText = `${progress}%`;

    const sectionCompletedBadge = document.getElementById("sectionOverallCompletedBadge");
    if (progress === 100) {
        if (sectionCompletedBadge) sectionCompletedBadge.classList.remove("d-none");
        localStorage.setItem(`section_${activeSectionId}_fully_completed`, "true");
    } else {
        if (sectionCompletedBadge) sectionCompletedBadge.classList.add("d-none");
        localStorage.removeItem(`section_${activeSectionId}_fully_completed`);
    }
}


function updateDashboardStats() {
    let totalSections = 10;
    let completedCount = 0;
    let challengeCompletedCount = 0;
    let quizSum = 0;
    let quizCount = 0;
    let totalXp = 0;

    for (let i = 1; i <= totalSections; i++) {
        // A section's labs are fully complete if both lab 1 and lab 2 are solved
        const lab1Done = localStorage.getItem(`section_${i}_lab_1_completed`) === "true";
        const lab2Done = localStorage.getItem(`section_${i}_lab_2_completed`) === "true";
        const labDone = lab1Done && lab2Done;

        const challengeDone = localStorage.getItem(`section_${i}_challenge_completed`) === "true";
        const quizDone = localStorage.getItem(`section_${i}_quiz_completed`) === "true";
        const dragDropDone = localStorage.getItem(`section_${i}_dragdrop_completed`) === "true";
        const quizScoreVal = localStorage.getItem(`section_${i}_quiz_score`);
        const fullyCompleted = localStorage.getItem(`section_${i}_fully_completed`) === "true";

        if (fullyCompleted) completedCount++;
        if (challengeDone) challengeCompletedCount++;
        if (quizDone && quizScoreVal !== null) {
            quizSum += parseInt(quizScoreVal);
            quizCount++;
        }

        // Calculate XP for this section
        if (lab1Done) totalXp += 50;
        if (lab2Done) totalXp += 50;
        // fallback for older sections with only one lab representation
        if (!lab1Done && !lab2Done && localStorage.getItem(`section_${i}_lab_completed`) === "true") {
            totalXp += 100;
        }
        if (challengeDone) totalXp += 100;
        if (dragDropDone) totalXp += 50;
        if (quizDone && quizScoreVal !== null) {
            totalXp += Math.round(parseInt(quizScoreVal)); // Up to 100 XP
        }
        // Predict output exercises (20 XP each, up to 10 exercises per section)
        for (let pIdx = 0; pIdx < 10; pIdx++) {
            if (localStorage.getItem(`section_${i}_predict_${pIdx}_done`) === "true") {
                totalXp += 20;
            }
        }
        // Bug Hunter exercise (+50 XP if completed)
        if (localStorage.getItem(`section_${i}_bughunter_completed`) === "true") {
            totalXp += 50;
        }
        // Code Puzzle exercise (+50 XP if completed)
        if (localStorage.getItem(`section_${i}_codepuzzle_completed`) === "true") {
            totalXp += 50;
        }

        // Sidebar Checkmarks (if on section detail page)
        const sidebarCheck = document.getElementById(`sidebarCheck-${i}`);
        if (sidebarCheck) {
            if (labDone && challengeDone && quizDone && dragDropDone) {
                sidebarCheck.classList.remove("d-none");
            } else {
                sidebarCheck.classList.add("d-none");
            }
        }

        // Index page Badges & stats (if on Index page)
        const completedBadge = document.getElementById(`completedBadge-${i}`);
        if (completedBadge) {
            if (fullyCompleted) {
                completedBadge.classList.remove("d-none");
            } else {
                completedBadge.classList.add("d-none");
            }
        }

        const labStatus = document.getElementById(`labStatus-${i}`);
        if (labStatus) {
            if (labDone) {
                labStatus.innerHTML = '<i class="fa-solid fa-flask text-cyan"></i> Lab: Solved';
            } else {
                labStatus.innerHTML = '<i class="fa-solid fa-flask text-muted"></i> Lab: Incomplete';
            }
        }

        const challengeStatus = document.getElementById(`challengeStatus-${i}`);
        if (challengeStatus) {
            if (challengeDone) {
                challengeStatus.innerHTML = '<i class="fa-solid fa-terminal text-cyan"></i> Challenge: Solved';
            } else {
                challengeStatus.innerHTML = '<i class="fa-solid fa-terminal text-muted"></i> Challenge: Unsolved';
            }
        }

        const dragDropStatus = document.getElementById(`dragDropStatus-${i}`);
        if (dragDropStatus) {
            if (dragDropDone) {
                dragDropStatus.innerHTML = '<i class="fa-solid fa-hand-pointer text-cyan"></i> Matching: Solved';
            } else {
                dragDropStatus.innerHTML = '<i class="fa-solid fa-hand-pointer text-muted"></i> Matching: Incomplete';
            }
        }

        const quizStatus = document.getElementById(`quizStatus-${i}`);
        if (quizStatus) {
            if (quizDone) {
                quizStatus.innerHTML = `<i class="fa-solid fa-list-check text-cyan"></i> Quiz: ${quizScoreVal}%`;
            } else {
                quizStatus.innerHTML = '<i class="fa-solid fa-list-check text-muted"></i> Quiz: 0%';
            }
        }

        // Section Mastery Badge Showcase (Index page)
        const badgeCircle = document.getElementById(`badgeIconCircle-${i}`);
        const badgeContainer = document.getElementById(`badgeContainer-${i}`);
        if (badgeCircle && badgeContainer) {
            if (fullyCompleted) {
                badgeCircle.classList.remove("locked");
                badgeCircle.classList.add("unlocked");
                badgeContainer.setAttribute("title", `Mastered! Section ${i} Badge Unlocked!`);
            } else {
                badgeCircle.classList.remove("unlocked");
                badgeCircle.classList.add("locked");
            }
        }
    }

    // Calculators
    const overallProgressPct = Math.round((completedCount / totalSections) * 100);
    const avgScore = quizCount > 0 ? Math.round(quizSum / quizCount) : 0;

    // Calculate Level & Rank based on total XP
    let level = 1;
    let rank = "Novice Coder";
    let minXp = 0;
    let maxXp = 300;

    if (totalXp >= 300 && totalXp < 800) {
        level = 2;
        rank = "Stack Explorer";
        minXp = 300;
        maxXp = 800;
    } else if (totalXp >= 800 && totalXp < 1600) {
        level = 3;
        rank = "Class Constructor";
        minXp = 800;
        maxXp = 1600;
    } else if (totalXp >= 1600 && totalXp < 2600) {
        level = 4;
        rank = "Polymorphic Architect";
        minXp = 1600;
        maxXp = 2600;
    } else if (totalXp >= 2600) {
        level = 5;
        rank = "C# OOP Grandmaster";
        minXp = 2600;
        maxXp = 4000; // Cap
    }

    const currentLevelXp = totalXp - minXp;
    const levelRange = maxXp - minXp;
    const xpPercent = Math.min(100, Math.round((currentLevelXp / levelRange) * 100));

    // Update Gamification UI Elements (Index page)
    const studentLevelEl = document.getElementById("studentLevel");
    const studentRankNameEl = document.getElementById("studentRankName");
    const xpTextEl = document.getElementById("xpText");
    const xpPercentTextEl = document.getElementById("xpPercentText");
    const xpProgressBarEl = document.getElementById("xpProgressBar");

    if (studentLevelEl) studentLevelEl.innerText = level;
    if (studentRankNameEl) studentRankNameEl.innerText = rank;
    if (xpTextEl) xpTextEl.innerText = `${totalXp} / ${maxXp} XP`;
    if (xpPercentTextEl) xpPercentTextEl.innerText = `${xpPercent}%`;
    if (xpProgressBarEl) xpProgressBarEl.style.width = `${xpPercent}%`;

    // Update UI Stats Elements
    const overallProgressEl = document.getElementById("overallProgress");
    const overallProgressBar = document.getElementById("overallProgressBar");
    const averageScoreEl = document.getElementById("averageScore");
    const completedQuizzesCountEl = document.getElementById("completedQuizzesCount");
    const completedChallengesEl = document.getElementById("completedChallenges");

    if (overallProgressEl) overallProgressEl.innerText = `${overallProgressPct}%`;
    if (overallProgressBar) overallProgressBar.style.width = `${overallProgressPct}%`;
    if (averageScoreEl) averageScoreEl.innerText = `${avgScore}%`;
    if (completedQuizzesCountEl) {
        completedQuizzesCountEl.innerText = quizCount > 0 ? `Average score for ${quizCount} quizzes` : "No quizzes completed yet";
    }
    if (completedChallengesEl) completedChallengesEl.innerText = `${challengeCompletedCount} / ${totalSections}`;

    // Update section progress detail text if currently on a section page
    updateSectionProgress();
}


// ==========================================
// Interactive Visual Simulators Engine
// ==========================================
let simState = {}; // Global state to hold simulator specific variables

function initSimulator(sectionId) {
    const container = document.getElementById("simulatorContainer");
    if (!container) return;

    // Reset simulator state
    simState = {
        sectionId: sectionId
    };

    // Render the specific simulator HTML template
    container.innerHTML = getSimulatorHtml(sectionId);

    // Bind event handlers for the specific simulator
    bindSimulatorEvents(sectionId);
}

function getSimulatorHtml(sectionId) {
    switch (sectionId) {
        case 1:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-exchange-alt"></i> Parameter Passing</h5>
                        <p class="text-muted small">Select a mechanism to visualize variable scopes, value copying, or reference mapping in Stack memory.</p>
                        
                        <div class="mb-3">
                            <label class="text-light small mb-1">Passing Mode:</label>
                            <select class="form-select form-select-sm bg-dark text-light border-secondary" id="simS1Mode">
                                <option value="value">By Value (Copy)</option>
                                <option value="ref">By Reference (ref)</option>
                                <option value="out">By Reference (out)</option>
                            </select>
                        </div>
                        
                        <div class="mb-2">
                            <label class="text-light small mb-1">Initial Value of a:</label>
                            <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS1ValA" value="10">
                        </div>

                        <button class="btn btn-cyan btn-sm w-100 mt-2" id="btnSimS1Run"><i class="fa-solid fa-play"></i> Execute Method Call</button>
                        
                        <div class="alert alert-info-glow mt-3 text-start small font-outfit" id="simS1Explanation" style="min-height: 80px;">
                            Click execute to visualize stack activation.
                        </div>
                    </div>
                    <div class="sim-visual-panel" style="position: relative; overflow: visible;">
                        <svg id="simS1Svg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;">
                            <defs>
                                <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--neon-cyan)" />
                                </marker>
                            </defs>
                        </svg>
                        <div class="mem-layout text-start" style="gap: 40px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: space-around; padding: 20px;">
                            <div class="mem-column" style="display: flex; flex-direction: column; gap: 10px; width: 45%;">
                                <div class="mem-title font-outfit text-cyan" style="font-size: 0.85rem; letter-spacing: 0.05em; font-weight: 600;">Caller Frame (Main)</div>
                                <div class="mem-cell p-3 border border-secondary rounded bg-dark-theme-light" id="cellS1A" style="position: relative; border-radius: 8px;">
                                    <span class="text-muted small">int a</span>
                                    <div class="fs-4 text-cyan font-mono" id="valS1A">10</div>
                                </div>
                            </div>
                            <div class="mem-column" style="display: flex; flex-direction: column; gap: 10px; width: 45%;">
                                <div class="mem-title font-outfit text-pink" style="font-size: 0.85rem; letter-spacing: 0.05em; font-weight: 600;">Callee Frame (Modify)</div>
                                <div class="mem-cell p-3 border border-secondary rounded bg-dark-theme-light" id="cellS1X" style="position: relative; border-radius: 8px;">
                                    <span class="text-muted small" id="lblS1X">int x</span>
                                    <div class="fs-4 text-pink font-mono" id="valS1X">?</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        case 2:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-table-cells-large"></i> Array & Struct Memory</h5>
                        <p class="text-muted small">Select a type and input values to visualize stack inline allocation vs contiguous array elements memory offset.</p>
                        
                        <div class="mb-3">
                            <label class="text-light small mb-1">Select Type:</label>
                            <select class="form-select form-select-sm bg-dark text-light border-secondary" id="simS2Mode">
                                <option value="array">Contiguous Array (int[5])</option>
                                <option value="struct">Struct Instance (Book)</option>
                            </select>
                        </div>

                        <!-- Array Inputs -->
                        <div id="simS2ArrayInputs">
                            <div class="mb-2">
                                <label class="text-light small mb-1">Enter 5 Numbers (comma separated):</label>
                                <input type="text" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS2ArrVals" value="10, 20, 30, 40, 50">
                            </div>
                        </div>

                        <!-- Struct Inputs -->
                        <div id="simS2StructInputs" class="d-none">
                            <div class="mb-2">
                                <label class="text-light small mb-1">Book Title:</label>
                                <input type="text" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS2BookTitle" value="C# Guide">
                            </div>
                            <div class="mb-2">
                                <label class="text-light small mb-1">Author:</label>
                                <input type="text" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS2BookAuthor" value="Farahat">
                            </div>
                            <div class="mb-2">
                                <label class="text-light small mb-1">Book ID:</label>
                                <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS2BookId" value="105">
                            </div>
                        </div>

                        <button class="btn btn-cyan btn-sm w-100 mt-2" id="btnSimS2Run"><i class="fa-solid fa-plus"></i> Allocate in Memory</button>
                        
                        <div class="alert alert-info-glow mt-3 text-start small font-outfit" id="simS2Explanation" style="min-height: 80px;">
                            Click allocate to visualize stack layout.
                        </div>
                    </div>
                    <div class="sim-visual-panel" style="position: relative; padding: 20px; display: flex; align-items: center; justify-content: center; overflow: auto;">
                        <div id="simS2VisualCanvas" style="width: 100%; display: flex; flex-direction: column; gap: 15px; align-items: center;">
                            <span class="text-cyan font-outfit small">Choose parameters and click Allocate to visualize memory layout.</span>
                        </div>
                    </div>
                </div>`;
        case 3:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-shield-halved"></i> Access Gatekeeper</h5>
                        <p class="text-muted small">Invoke statements and watch C# validation rules protect internal data state.</p>
                        <div class="mb-3">
                            <label class="text-light small mb-1">C# Command Execution:</label>
                            <select class="form-select form-select-sm bg-dark text-light border-secondary font-outfit" id="simS3Op">
                                <option value="direct">Direct: account._balance = -100;</option>
                                <option value="deposit_pos">Method: account.Deposit(500);</option>
                                <option value="deposit_neg">Method: account.Deposit(-50);</option>
                            </select>
                        </div>
                        <button class="btn btn-cyan btn-sm w-100" id="btnSimS3Run"><i class="fa-solid fa-play"></i> Execute Statement</button>
                        <div class="alert alert-info-glow mt-3 text-start small font-mono" id="simS3Console" style="font-size:0.8rem; min-height:80px;">
                            System: Awaiting execution...
                        </div>
                    </div>
                    <div class="sim-visual-panel">
                        <div class="vault-wrapper">
                            <div class="vault-safe" id="simS3Safe" style="position: relative;">
                                <div class="laser-beam" id="simS3Laser"></div>
                                <div class="safe-status-light" id="simS3Light"></div>
                                <div class="safe-dial"></div>
                            </div>
                            <div class="text-center mt-3">
                                <span class="badge bg-dark border border-secondary text-light fs-5 py-2 px-3">
                                    Private Field: <code>_balance</code> = <span class="text-cyan font-mono" id="simS3Balance">$0</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>`;
        case 4:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-code"></i> Live UML Modifier</h5>
                        <p class="text-muted small">Change properties of the UML specification and see live generated C# code.</p>
                        <div class="mb-2">
                            <label class="text-light small mb-1">Field Name:</label>
                            <input type="text" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS4AttrName" value="gpa">
                        </div>
                        <div class="mb-2">
                            <label class="text-light small mb-1">Data Type:</label>
                            <select class="form-select form-select-sm bg-dark text-light border-secondary font-mono" id="simS4AttrType">
                                <option value="double">double</option>
                                <option value="string">string</option>
                                <option value="int">int</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="text-light small mb-1">Visibility Modifiers:</label>
                            <select class="form-select form-select-sm bg-dark text-light border-secondary font-mono" id="simS4AttrVis">
                                <option value="private">- Private</option>
                                <option value="public">+ Public</option>
                            </select>
                        </div>
                    </div>
                    <div class="sim-visual-panel">
                        <div class="uml-live-container text-start">
                            <div class="uml-box w-100" style="margin:0;">
                                <div class="uml-class-header font-outfit">Student</div>
                                <div class="uml-class-body font-mono">
                                    <div id="simS4UmlPreview">- gpa : double</div>
                                    <hr class="uml-divider"/>
                                    <div>+ Study() : void</div>
                                </div>
                            </div>
                            <div class="uml-editor-box w-100 font-mono" style="font-size: 0.8rem; background: #0c0f16; border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 6px;">
                                <pre style="margin:0;"><code id="simS4CodePreview" class="text-cyan-light">class Student
{
    private double gpa;

    public void Study()
    {
    }
}</code></pre>
                            </div>
                        </div>
                    </div>`;
        case 5:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-link"></i> Object Composition</h5>
                        <p class="text-muted small">Compose a <code>BankAccount</code> containing a reference to a <code>Person</code> owner object on the Heap.</p>
                        
                        <div class="mb-2">
                            <label class="text-light small mb-1">Owner Name (Person):</label>
                            <input type="text" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS5Name" value="Ahmed">
                        </div>
                        <div class="mb-3">
                            <label class="text-light small mb-1">Account Balance ($):</label>
                            <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS5Balance" value="5000">
                        </div>
                        <button class="btn btn-cyan btn-sm w-100" id="btnSimS5Run"><i class="fa-solid fa-network-wired"></i> Compose & Link</button>
                        
                        <div class="alert alert-info-glow mt-3 text-start small font-outfit" id="simS5Explanation" style="min-height: 80px;">
                            Click Compose to visualize references link.
                        </div>
                    </div>
                    <div class="sim-visual-panel" style="position: relative; padding: 20px; overflow: visible;">
                        <svg id="simS5Svg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;">
                            <defs>
                                <marker id="arrow-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--neon-pink)" />
                                </marker>
                            </defs>
                        </svg>
                        <div class="mem-layout text-start" style="gap: 20px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-around; align-items: center;">
                            <div class="d-flex w-100 justify-content-around align-items-center">
                                <div class="mem-column" style="width: 45%;">
                                    <div class="mem-title font-outfit text-cyan" style="font-size: 0.85rem; font-weight:600;">BankAccount Instance (Heap: 0x90A0)</div>
                                    <div class="mem-cell p-3 border border-secondary rounded bg-dark-theme-light" id="cellS5Acc" style="border-radius: 8px;">
                                        <div class="mb-2">
                                            <span class="text-muted small">double Balance</span>
                                            <div class="fs-5 text-cyan font-mono" id="valS5Balance">$5,000</div>
                                        </div>
                                        <div id="cellS5OwnerRef" style="position: relative;">
                                            <span class="text-muted small">Person Owner (Reference pointer)</span>
                                            <div class="fs-6 text-pink font-mono">→ 0x20F4</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mem-column" style="width: 45%;">
                                    <div class="mem-title font-outfit text-pink" style="font-size: 0.85rem; font-weight:600;">Person Instance (Heap: 0x20F4)</div>
                                    <div class="mem-cell p-3 border border-secondary rounded bg-dark-theme-light" id="cellS5Person" style="border-radius: 8px;">
                                        <span class="text-muted small">string Name</span>
                                        <div class="fs-5 text-pink font-mono" id="valS5Name">Ahmed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        case 6:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-sitemap"></i> Inheritance Tree</h5>
                        <p class="text-muted small">Select any class inside the hierarchy to analyze inherited variables and behaviors.</p>
                        <div class="alert alert-info-glow small font-outfit" id="simS6Details" style="min-height: 120px;">
                            Click a class node on the right side to inspect its inheritance chain.
                        </div>
                    </div>
                    <div class="sim-visual-panel">
                        <div class="inheritance-tree">
                            <div class="tree-node active" id="nodePerson" data-node="person">
                                <strong>Person (Base Class)</strong>
                                <div class="small text-cyan-light">+ Name : string</div>
                                <div class="small text-cyan-light">+ Age : int</div>
                            </div>
                            <div class="text-muted"><i class="fa-solid fa-arrow-down fs-6"></i></div>
                            <div class="tree-node" id="nodeEmployee" data-node="employee">
                                <strong>Employee : Person (Derived)</strong>
                                <div class="small text-pink">+ Salary : double</div>
                            </div>
                            <div class="text-muted"><i class="fa-solid fa-arrow-down fs-6"></i></div>
                            <div class="tree-node" id="nodeManager" data-node="manager">
                                <strong>Manager : Employee (Multilevel)</strong>
                                <div class="small text-orange">+ Department : string</div>
                            </div>
                        </div>
                    </div>
                </div>`;
        case 7:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-address-card"></i> Employee Role Polymorphism</h5>
                        <p class="text-muted small">Choose an employee subclass, enter values, and execute to see polymorphically resolved salaries.</p>
                        
                        <div class="mb-3">
                            <label class="text-light small mb-1">Employee Type:</label>
                            <select class="form-select form-select-sm bg-dark text-light border-secondary" id="simS7Type">
                                <option value="full">FullTimeEmployee</option>
                                <option value="part">PartTimeEmployee</option>
                            </select>
                        </div>

                        <!-- FullTime Inputs -->
                        <div id="simS7FullInputs">
                            <div class="mb-2">
                                <label class="text-light small mb-1">Base Monthly Salary ($):</label>
                                <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS7BaseSalary" value="4500">
                            </div>
                            <div class="mb-2">
                                <label class="text-light small mb-1">Monthly Bonus ($):</label>
                                <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS7Bonus" value="800">
                            </div>
                        </div>

                        <!-- PartTime Inputs -->
                        <div id="simS7PartInputs" class="d-none">
                            <div class="mb-2">
                                <label class="text-light small mb-1">Hourly Rate ($):</label>
                                <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS7Rate" value="30">
                            </div>
                            <div class="mb-2">
                                <label class="text-light small mb-1">Hours Worked:</label>
                                <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS7Hours" value="160">
                            </div>
                        </div>

                        <button class="btn btn-cyan btn-sm w-100 mt-2" id="btnSimS7Run"><i class="fa-solid fa-play"></i> Polymorphic Invoke</button>
                        
                        <div class="alert alert-info-glow mt-3 text-start small font-outfit" id="simS7Explanation" style="min-height: 80px;">
                            Click Polymorphic Invoke to calculate details.
                        </div>
                    </div>
                    <div class="sim-visual-panel" style="position: relative; padding: 20px; display: flex; align-items: center; justify-content: center; overflow: auto;">
                        <div id="simS7BadgeCanvas" style="width: 100%; display: flex; flex-direction: column; gap: 15px; align-items: center;">
                            <span class="text-cyan font-outfit small">Choose employee type and calculate to generate polymorphic badge.</span>
                        </div>
                    </div>
                </div>`;
        case 8:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-tags"></i> Abstraction & Discounts</h5>
                        <p class="text-muted small">Choose a product subclass, input price, and view dynamically calculated discounts resolved via abstract method overrides.</p>
                        
                        <div class="mb-3">
                            <label class="text-light small mb-1">Product Category:</label>
                            <select class="form-select form-select-sm bg-dark text-light border-secondary" id="simS8Type">
                                <option value="elec">Electronics (10% + Warranty Bonus)</option>
                                <option value="cloth">Clothing (Size-based Discount)</option>
                            </select>
                        </div>

                        <div class="mb-2">
                            <label class="text-light small mb-1">Base Price ($):</label>
                            <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS8Price" value="200">
                        </div>

                        <!-- Elec Inputs -->
                        <div id="simS8ElecInputs">
                            <div class="mb-2">
                                <label class="text-light small mb-1">Warranty Period (Years):</label>
                                <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS8Warranty" value="2" min="1" max="5">
                            </div>
                        </div>

                        <!-- Clothing Inputs -->
                        <div id="simS8ClothInputs" class="d-none">
                            <div class="mb-2">
                                <label class="text-light small mb-1">Size:</label>
                                <select class="form-select form-select-sm bg-dark text-light border-secondary" id="simS8Size">
                                    <option value="S">Small (S) - 5% Off</option>
                                    <option value="M">Medium (M) - 10% Off</option>
                                    <option value="L">Large (L) - 15% Off</option>
                                </select>
                            </div>
                        </div>

                        <button class="btn btn-cyan btn-sm w-100 mt-2" id="btnSimS8Run"><i class="fa-solid fa-calculator"></i> Calculate Price</button>
                        
                        <div class="alert alert-info-glow mt-3 text-start small font-outfit" id="simS8Explanation" style="min-height: 80px;">
                            Click Calculate to analyze abstract behavior.
                        </div>
                    </div>
                    <div class="sim-visual-panel" style="position: relative; padding: 20px; display: flex; align-items: center; justify-content: center; overflow: auto;">
                        <div id="simS8InvoiceCanvas" style="width: 100%; display: flex; flex-direction: column; gap: 15px; align-items: center;">
                            <span class="text-cyan font-outfit small">Choose parameters and calculate to generate polymorphic product invoice receipt.</span>
                        </div>
                    </div>
                </div>`;
        case 9:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-box"></i> Generics Box&lt;T&gt;</h5>
                        <p class="text-muted small">Choose the generic type parameters and input a value to trigger safety analysis checks.</p>
                        <div class="mb-2">
                            <label class="text-light small mb-1">Generic Type Constraint (T):</label>
                            <select class="form-select form-select-sm bg-dark text-light border-secondary font-mono" id="simS9Type">
                                <option value="int">int</option>
                                <option value="string">string</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="text-light small mb-1">SetContent(value) payload:</label>
                            <input type="text" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" id="simS9Val" value="123">
                        </div>
                        <button class="btn btn-cyan btn-sm w-100" id="btnSimS9Add"><i class="fa-solid fa-cube"></i> Set Content</button>
                        <div class="alert alert-info-glow mt-3 text-start small font-mono" id="simS9Console" style="font-size:0.8rem; min-height:80px;">
                            Console: Select generic parameters to start.
                        </div>
                    </div>
                    <div class="sim-visual-panel">
                        <div class="generic-box-display" id="simS9Box">
                            <div class="fs-1 text-orange" id="simS9BoxIcon"><i class="fa-solid fa-box-open"></i></div>
                            <div class="small mt-2 text-light" id="simS9BoxType">Box&lt;T&gt;</div>
                            <div class="small text-cyan font-mono" id="simS9BoxValue">Empty</div>
                        </div>
                    </div>
                </div>`;
        case 10:
            return `
                <div class="sim-container">
                    <div class="sim-controls-panel text-start">
                        <h5 class="Cairo-bold text-cyan"><i class="fa-solid fa-bug-slash"></i> Exception Trace Flowchart</h5>
                        <p class="text-muted small">Select an execution result to watch the trace flowchart highlight blocks in runtime order.</p>
                        <div class="mb-3">
                            <select class="form-select form-select-sm bg-dark text-light border-secondary" id="simS10Type">
                                <option value="success">Normal execution (Success)</option>
                                <option value="div0">DivideByZeroException</option>
                                <option value="nullref">NullReferenceException</option>
                            </select>
                        </div>
                        <button class="btn btn-cyan btn-sm w-100" id="btnSimS10Run"><i class="fa-solid fa-bolt"></i> Run Execution Blocks</button>
                        <div class="alert alert-info-glow mt-3 text-start small font-mono" id="simS10Console" style="font-size:0.8rem; min-height:80px;">
                            Trace Log: Ready to start blocks evaluation.
                        </div>
                    </div>
                    <div class="sim-visual-panel">
                        <div class="exception-chart">
                            <div class="chart-block" id="blockTry">try</div>
                            <div class="text-muted"><i class="fa-solid fa-arrow-down fs-6"></i></div>
                            <div class="chart-block" id="blockCatch">catch (Exception ex)</div>
                            <div class="text-muted"><i class="fa-solid fa-arrow-down fs-6"></i></div>
                            <div class="chart-block" id="blockFinally">finally</div>
                        </div>
                    </div>
                </div>`;
        default:
return `<div class="p-4 text-center text-muted">Simulator not available for section ${sectionId}</div>`;
    }
}

function bindSimulatorEvents(sectionId) {
    switch (sectionId) {
        case 1:
            const s1Btn = document.getElementById("btnSimS1Run");
            const s1Mode = document.getElementById("simS1Mode");
            const s1ValA = document.getElementById("simS1ValA");
            const valA = document.getElementById("valS1A");
            const valX = document.getElementById("valS1X");
            const explanation = document.getElementById("simS1Explanation");
            const svg = document.getElementById("simS1Svg");
            const cellA = document.getElementById("cellS1A");
            const cellX = document.getElementById("cellS1X");
            const lblX = document.getElementById("lblS1X");

            const stopActiveInterval = () => {
                if (simState.interval) {
                    clearInterval(simState.interval);
                    simState.interval = null;
                }
            };

            s1Btn.onclick = () => {
                stopActiveInterval();
                svg.innerHTML = ""; // Clear SVG arrows

                const initA = parseInt(s1ValA.value) || 0;
                valA.innerText = initA;
                cellA.classList.remove("flash-pulse", "border-danger", "border-cyan");
                cellX.classList.remove("flash-pulse", "border-danger", "border-cyan");

                const mode = s1Mode.value;
                if (mode === "value") {
                    lblX.innerText = "int x (parameter)";
                    valX.innerText = "?";
                    explanation.innerHTML = `<strong class="text-cyan">Step 1:</strong> Initializing local variable <code>a = ${initA}</code> in caller stack frame.`;
                    
                    let phase = 0;
                    simState.interval = setInterval(() => {
                        phase++;
                        if (phase === 1) {
                            valX.innerText = initA;
                            cellX.classList.add("border-cyan");
                            explanation.innerHTML = `<strong class="text-cyan">Step 2:</strong> Method called: <code>Modify(a)</code>. The value <code>${initA}</code> is copied into callee parameter <code>x</code>.`;
                        } else if (phase === 2) {
                            valX.innerText = 99;
                            cellX.classList.add("flash-pulse");
                            explanation.innerHTML = `<strong class="text-pink">Step 3:</strong> Parameter modified: <code>x = 99</code>. Only Callee variable changes.`;
                        } else if (phase === 3) {
                            cellX.classList.remove("border-cyan", "flash-pulse");
                            explanation.innerHTML = `<strong class="text-cyan">Result:</strong> Method returned. Caller variable <code>a</code> is still <code>${initA}</code>. No changes were side-effected.`;
                            stopActiveInterval();
                        }
                    }, 2000);
                } else if (mode === "ref") {
                    lblX.innerText = "ref int x (reference)";
                    valX.innerText = "?";
                    explanation.innerHTML = `<strong class="text-cyan">Step 1:</strong> Initializing local variable <code>a = ${initA}</code> in caller stack frame.`;
                    
                    let phase = 0;
                    simState.interval = setInterval(() => {
                        phase++;
                        if (phase === 1) {
                            valX.innerText = initA;
                            cellX.classList.add("border-cyan");
                            // Draw pointer from X to A
                            drawS1Pointer(cellX, cellA);
                            explanation.innerHTML = `<strong class="text-cyan">Step 2:</strong> Method called: <code>Modify(ref a)</code>. Parameter <code>x</code> references the memory address of <code>a</code> directly.`;
                        } else if (phase === 2) {
                            valX.innerText = 99;
                            valA.innerText = 99;
                            cellA.classList.add("flash-pulse");
                            cellX.classList.add("flash-pulse");
                            explanation.innerHTML = `<strong class="text-pink">Step 3:</strong> <code>x = 99</code> is assigned. Since <code>x</code> references <code>a</code>, the value of <code>a</code> updates to <code>99</code> in real time!`;
                        } else if (phase === 3) {
                            cellA.classList.remove("flash-pulse");
                            cellX.classList.remove("flash-pulse");
                            explanation.innerHTML = `<strong class="text-cyan">Result:</strong> Method returned. Variable <code>a</code> in caller frame has been updated to <code>99</code>.`;
                            stopActiveInterval();
                        }
                    }, 2500);
                } else if (mode === "out") {
                    lblX.innerText = "out int x (out reference)";
                    valX.innerText = "?";
                    valA.innerText = "? (uninitialized)";
                    explanation.innerHTML = `<strong class="text-cyan">Step 1:</strong> <code>a</code> is declared but uninitialized (or discard value).`;
                    
                    let phase = 0;
                    simState.interval = setInterval(() => {
                        phase++;
                        if (phase === 1) {
                            cellX.classList.add("border-cyan");
                            drawS1Pointer(cellX, cellA);
                            explanation.innerHTML = `<strong class="text-cyan">Step 2:</strong> Method called: <code>Modify(out a)</code>. <code>x</code> references <code>a</code>. Notice that <code>x</code> starts as uninitialized.`;
                        } else if (phase === 2) {
                            valX.innerText = 99;
                            valA.innerText = 99;
                            cellA.classList.add("flash-pulse");
                            cellX.classList.add("flash-pulse");
                            explanation.innerHTML = `<strong class="text-pink">Step 3:</strong> <code>x = 99</code> is assigned. C# requires out parameters to be assigned before returning. <code>a</code> is now initialized to <code>99</code>.`;
                        } else if (phase === 3) {
                            cellA.classList.remove("flash-pulse");
                            cellX.classList.remove("flash-pulse");
                            explanation.innerHTML = `<strong class="text-cyan">Result:</strong> Method returned. <code>a</code> is now <code>99</code> in caller scope.`;
                            stopActiveInterval();
                        }
                    }, 2500);
                }
            };

            function drawS1Pointer(fromEl, toEl) {
                const svgRect = svg.getBoundingClientRect();
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();

                // Calculate connection points
                const startX = fromRect.left - svgRect.left;
                const startY = fromRect.top + fromRect.height / 2 - svgRect.top;

                const endX = toRect.right - svgRect.left;
                const endY = toRect.top + toRect.height / 2 - svgRect.top;

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", `M ${startX} ${startY} H ${(startX + endX) / 2} V ${endY} H ${endX + 6}`);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", "var(--neon-cyan)");
                path.setAttribute("stroke-width", "2.5");
                path.setAttribute("marker-end", "url(#arrow-cyan)");
                path.setAttribute("style", "filter: drop-shadow(0 0 3px rgba(0, 242, 254, 0.6)); transition: all 0.5s ease;");
                svg.appendChild(path);
            }
            break;

        case 2:
            const s2Mode = document.getElementById("simS2Mode");
            const arrInputs = document.getElementById("simS2ArrayInputs");
            const structInputs = document.getElementById("simS2StructInputs");
            const s2Run = document.getElementById("btnSimS2Run");
            const canvas = document.getElementById("simS2VisualCanvas");
            const explanationS2 = document.getElementById("simS2Explanation");

            if (s2Mode) {
                s2Mode.onchange = () => {
                    if (s2Mode.value === "array") {
                        arrInputs.classList.remove("d-none");
                        structInputs.classList.add("d-none");
                    } else {
                        arrInputs.classList.add("d-none");
                        structInputs.classList.remove("d-none");
                    }
                };
            }

            if (s2Run) {
                s2Run.onclick = () => {
                    canvas.innerHTML = "";
                    const mode = s2Mode.value;

                    if (mode === "array") {
                        const rawVals = document.getElementById("simS2ArrVals").value;
                        const items = rawVals.split(",").map(x => x.trim()).filter(x => x.length > 0).slice(0, 5);
                        
                        explanationS2.innerHTML = `<strong class="text-cyan">Array Allocation:</strong> Creating contiguous memory layout for <code>int[${items.length}]</code>.`;
                        
                        const arrayWrapper = document.createElement("div");
                        arrayWrapper.style.display = "flex";
                        arrayWrapper.style.flexDirection = "column";
                        arrayWrapper.style.gap = "8px";
                        arrayWrapper.style.width = "100%";
                        arrayWrapper.style.maxWidth = "400px";

                        items.forEach((item, idx) => {
                            const address = "0x00A" + (idx * 4).toString(16).toUpperCase();
                            const cell = document.createElement("div");
                            cell.className = "mem-cell p-3 border border-secondary rounded bg-dark-theme-light flash-pulse";
                            cell.style.display = "flex";
                            cell.style.justifyContent = "space-between";
                            cell.style.alignItems = "center";
                            cell.innerHTML = `
                                <div>
                                    <span class="text-muted small">Index [${idx}]</span>
                                    <div class="fs-5 text-cyan font-mono">${item}</div>
                                </div>
                                <div class="text-pink font-mono small">${address}</div>
                            `;
                            arrayWrapper.appendChild(cell);
                        });

                        canvas.appendChild(arrayWrapper);
                        
                        explanationS2.innerHTML = `<strong class="text-cyan">O(1) Access Proof:</strong> An array allocates block elements in contiguous sequence. Each 32-bit integer takes 4 bytes. Thus, index <code>[i]</code> resides precisely at <code>Address + i * 4</code> (e.g. 0x00A0, 0x00A4, 0x00A8, etc.).`;
                    } else {
                        const title = document.getElementById("simS2BookTitle").value || "C# Guide";
                        const author = document.getElementById("simS2BookAuthor").value || "Farahat";
                        const bid = document.getElementById("simS2BookId").value || "105";

                        explanationS2.innerHTML = `<strong class="text-cyan">Struct Allocation:</strong> Structs are value types allocated inline entirely on the Stack.`;

                        const structCell = document.createElement("div");
                        structCell.className = "mem-cell p-4 border border-secondary rounded bg-dark-theme-light flash-pulse";
                        structCell.style.width = "100%";
                        structCell.style.maxWidth = "400px";
                        structCell.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="text-pink font-outfit small">struct Book (Value Type)</span>
                                <span class="text-muted font-mono small">Addr: 0x00D0</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">string Title (Pointer reference)</span>
                                <span class="text-cyan font-mono">"${title}"</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">string Author (Pointer reference)</span>
                                <span class="text-cyan font-mono">"${author}"</span>
                            </div>
                            <div>
                                <span class="text-muted small d-block">int BookID (Inline value)</span>
                                <span class="text-cyan font-mono">${bid}</span>
                            </div>
                        `;
                        canvas.appendChild(structCell);

                        explanationS2.innerHTML = `<strong class="text-cyan">Value Type Semantics:</strong> Unlike classes, the fields of this <code>Book</code> struct are stored **directly inline** inside the single memory segment of the stack variable, without using the garbage-collected heap.`;
                    }
                };
            }
            break;

        case 3:
            // Encapsulation safe
            simState.balance = 0;
            const logConsole = (txt, success) => {
                const consoleEl = document.getElementById("simS3Console");
                consoleEl.innerText = txt;
                consoleEl.style.color = success ? "#34d399" : "#f87171";
            };

            document.getElementById("btnSimS3Run").onclick = () => {
                const op = document.getElementById("simS3Op").value;
                const safe = document.getElementById("simS3Safe");
                const balanceEl = document.getElementById("simS3Balance");

                safe.classList.remove("unlocked");
                safe.classList.remove("opened");
                const laser = document.getElementById("simS3Laser");
                const dial = safe.querySelector(".safe-dial");
                if (laser) laser.classList.remove("active");
                if (dial) dial.style.transform = "rotate(0deg)";

                if (op === "direct") {
                    safe.classList.add("shake-css");
                    if (laser) {
                        laser.classList.add("active");
                        setTimeout(() => laser.classList.remove("active"), 1000);
                    }
                    setTimeout(() => safe.classList.remove("shake-css"), 500);
                    logConsole("C# Compiler Error: 'BankAccount._balance' is inaccessible due to its protection level. You cannot modify private fields directly from outside the class.", false);
                } else if (op === "deposit_pos") {
                    simState.balance += 500;
                    if (dial) dial.style.transform = "rotate(180deg)";
                    setTimeout(() => {
                        safe.classList.add("unlocked");
                        safe.classList.add("opened");
                        balanceEl.innerText = `$${simState.balance}`;
                    }, 500);
                    logConsole(`Public Method account.Deposit(500) successfully passed logic checks (500 > 0). Internal balance updated.`, true);
                } else if (op === "deposit_neg") {
                    if (dial) dial.style.transform = "rotate(45deg)";
                    setTimeout(() => {
                        if (dial) dial.style.transform = "rotate(0deg)";
                        safe.classList.add("shake-css");
                        setTimeout(() => safe.classList.remove("shake-css"), 500);
                    }, 500);
                    logConsole(`Runtime Validation Failed: method rejected value -50 inside checking logic: if (amount > 0) balance += amount; Safe remained locked.`, false);
                }
            };
            break;

        case 4:
            // UML Builder
            const updateUmlCode = () => {
                const name = document.getElementById("simS4AttrName").value.trim() || "gpa";
                const type = document.getElementById("simS4AttrType").value;
                const vis = document.getElementById("simS4AttrVis").value;
                const symbol = vis === "private" ? "-" : "+";

                document.getElementById("simS4UmlPreview").innerText = `${symbol} ${name} : ${type}`;
                document.getElementById("simS4CodePreview").innerText = `class Student
{
    ${vis} ${type} ${name};

    public void Study()
    {
    }
}`;
            };
            document.getElementById("simS4AttrName").oninput = updateUmlCode;
            document.getElementById("simS4AttrType").onchange = updateUmlCode;
            document.getElementById("simS4AttrVis").onchange = updateUmlCode;
            break;

        case 5:
            const s5Btn = document.getElementById("btnSimS5Run");
            const s5Name = document.getElementById("simS5Name");
            const s5Balance = document.getElementById("simS5Balance");
            const valS5Bal = document.getElementById("valS5Balance");
            const valS5Nm = document.getElementById("valS5Name");
            const cellAcc = document.getElementById("cellS5Acc");
            const cellPerson = document.getElementById("cellS5Person");
            const cellOwnerRef = document.getElementById("cellS5OwnerRef");
            const svgS5 = document.getElementById("simS5Svg");
            const explanationS5 = document.getElementById("simS5Explanation");

            s5Btn.onclick = () => {
                svgS5.innerHTML = ""; // Clear existing pointer
                cellAcc.classList.remove("flash-pulse");
                cellPerson.classList.remove("flash-pulse");

                const bal = parseFloat(s5Balance.value) || 0;
                const name = s5Name.value.trim() || "Ahmed";

                valS5Bal.innerText = "$" + bal.toLocaleString();
                valS5Nm.innerText = name;

                cellAcc.classList.add("flash-pulse");
                cellPerson.classList.add("flash-pulse");

                // Draw arrow from cellOwnerRef to cellPerson
                setTimeout(() => {
                    drawS5Pointer(cellOwnerRef, cellPerson);
                }, 100);

                explanationS5.innerHTML = `<strong>Object Linked:</strong> A <code>BankAccount</code> instance is constructed at heap address <code>0x90A0</code>. Its <code>Owner</code> reference field holds the address <code>0x20F4</code>, pointing directly to the composed <code>Person</code> object block on the Heap.`;
            };

            function drawS5Pointer(fromEl, toEl) {
                const svgRect = svgS5.getBoundingClientRect();
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();

                // Start from the right edge of the owner reference row
                const startX = fromRect.right - svgRect.left;
                const startY = fromRect.top + fromRect.height / 2 - svgRect.top;

                // End at the left edge of the person instance box
                const endX = toRect.left - svgRect.left;
                const endY = toRect.top + toRect.height / 2 - svgRect.top;

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                // Simple straight line or cubic curve
                path.setAttribute("d", `M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${(startX + endX) / 2} ${endY}, ${endX - 6} ${endY}`);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", "var(--neon-pink)");
                path.setAttribute("stroke-width", "2.5");
                path.setAttribute("marker-end", "url(#arrow-pink)");
                path.setAttribute("style", "filter: drop-shadow(0 0 3px rgba(244, 63, 94, 0.6)); transition: all 0.5s ease;");
                svgS5.appendChild(path);
            }
            break;

        case 6:
            const nodes = document.querySelectorAll(".tree-node");
            nodes.forEach(node => {
                node.onclick = (e) => {
                    nodes.forEach(n => { n.classList.remove("active"); n.classList.remove("glow-trace"); });
                    const activeNode = e.currentTarget;
                    const type = activeNode.getAttribute("data-node");
                    activeNode.classList.add("active");

                    const details = document.getElementById("simS6Details");
                    if (type === "person") {
                        activeNode.classList.add("glow-trace");
                        details.innerHTML = `
                            <h6 class="text-cyan Cairo-bold">Person (Base Class — inherits from System.Object)</h6>
                            <p class="text-light small font-outfit mb-1"><strong>Own Members:</strong> <code>Name : string</code>, <code>Age : int</code></p>
                            <p class="mb-0 text-light small font-outfit"><strong>Inherited from Object:</strong> <code>ToString()</code>, <code>Equals()</code>, <code>GetHashCode()</code>, <code>GetType()</code></p>
                        `;
                    } else if (type === "employee") {
                        document.getElementById("nodePerson").classList.add("glow-trace");
                        activeNode.classList.add("glow-trace");
                        details.innerHTML = `
                            <h6 class="text-cyan Cairo-bold">Employee : Person (Single Inheritance)</h6>
                            <p class="text-light small font-outfit mb-1"><strong>Own Members:</strong> <code>Salary : double</code></p>
                            <p class="text-light small font-outfit mb-1"><strong>Inherited from Person:</strong> <code>Name</code>, <code>Age</code></p>
                            <p class="mb-0 text-light small font-outfit"><strong>Total accessible:</strong> 3 properties + 4 Object methods</p>
                        `;
                    } else if (type === "manager") {
                        document.getElementById("nodePerson").classList.add("glow-trace");
                        document.getElementById("nodeEmployee").classList.add("glow-trace");
                        activeNode.classList.add("glow-trace");
                        details.innerHTML = `
                            <h6 class="text-cyan Cairo-bold">Manager : Employee : Person (Multilevel)</h6>
                            <p class="text-light small font-outfit mb-1"><strong>Own Members:</strong> <code>Department : string</code></p>
                            <p class="text-light small font-outfit mb-1"><strong>Inherited chain:</strong> Person → Employee → Manager</p>
                            <p class="mb-0 text-light small font-outfit"><strong>Total accessible:</strong> <code>Name</code>, <code>Age</code>, <code>Salary</code>, <code>Department</code> + 4 Object methods</p>
                        `;
                    }
                };
            });
            break;

        case 7:
            const s7Type = document.getElementById("simS7Type");
            const fullInputs = document.getElementById("simS7FullInputs");
            const partInputs = document.getElementById("simS7PartInputs");
            const s7Run = document.getElementById("btnSimS7Run");
            const badgeCanvas = document.getElementById("simS7BadgeCanvas");
            const explanationS7 = document.getElementById("simS7Explanation");

            if (s7Type) {
                s7Type.onchange = () => {
                    if (s7Type.value === "full") {
                        fullInputs.classList.remove("d-none");
                        partInputs.classList.add("d-none");
                    } else {
                        fullInputs.classList.add("d-none");
                        partInputs.classList.remove("d-none");
                    }
                };
            }

            if (s7Run) {
                s7Run.onclick = () => {
                    badgeCanvas.innerHTML = "";
                    const type = s7Type.value;

                    if (type === "full") {
                        const baseSal = parseFloat(document.getElementById("simS7BaseSalary").value) || 0;
                        const bonus = parseFloat(document.getElementById("simS7Bonus").value) || 0;
                        const total = baseSal + bonus;

                        explanationS7.innerHTML = `<strong>Polymorphic Resolution:</strong> Under the hood, <code>Employee emp = new FullTimeEmployee();</code> is dynamically resolved.`;

                        const badge = document.createElement("div");
                        badge.className = "mem-cell p-4 border border-secondary rounded bg-dark-theme-light flash-pulse";
                        badge.style.width = "100%";
                        badge.style.maxWidth = "400px";
                        badge.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-cyan text-dark font-outfit">Full-Time Employee</span>
                                <span class="text-pink font-mono small">Overridden Salary Model</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">Base Salary:</span>
                                <span class="text-light font-mono">$${baseSal.toLocaleString()}</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">Monthly Bonus:</span>
                                <span class="text-light font-mono">$${bonus.toLocaleString()}</span>
                            </div>
                            <div class="mb-3">
                                <span class="text-muted small d-block">Calculated Total Earnings:</span>
                                <span class="text-cyan font-mono fs-5">$${total.toLocaleString()}</span>
                            </div>
                            <div class="border-top border-secondary pt-2">
                                <span class="text-muted small d-block">GetDetails() String Return:</span>
                                <span class="text-pink small font-mono">"Full-Time Employee - Salary: $${total}"</span>
                            </div>
                        `;
                        badgeCanvas.appendChild(badge);

                        explanationS7.innerHTML = `<strong>Overriding Mechanism:</strong> Calling <code>emp.GetDetails()</code> calls the derived override because the object type is <code>FullTimeEmployee</code>. Total earnings are <code>$${total}</code>.`;
                    } else {
                        const rate = parseFloat(document.getElementById("simS7Rate").value) || 0;
                        const hours = parseFloat(document.getElementById("simS7Hours").value) || 0;
                        const total = rate * hours;

                        explanationS7.innerHTML = `<strong>Polymorphic Resolution:</strong> Under the hood, <code>Employee emp = new PartTimeEmployee();</code> is dynamically resolved.`;

                        const badge = document.createElement("div");
                        badge.className = "mem-cell p-4 border border-secondary rounded bg-dark-theme-light flash-pulse";
                        badge.style.width = "100%";
                        badge.style.maxWidth = "400px";
                        badge.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-pink text-light font-outfit">Part-Time Employee</span>
                                <span class="text-cyan font-mono small">Overridden Rate Model</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">Hourly Rate:</span>
                                <span class="text-light font-mono">$${rate.toLocaleString()}/hr</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">Hours Worked:</span>
                                <span class="text-light font-mono">${hours} hrs</span>
                            </div>
                            <div class="mb-3">
                                <span class="text-muted small d-block">Calculated Total Earnings:</span>
                                <span class="text-pink font-mono fs-5">$${total.toLocaleString()}</span>
                            </div>
                            <div class="border-top border-secondary pt-2">
                                <span class="text-muted small d-block">GetDetails() String Return:</span>
                                <span class="text-cyan small font-mono">"Part-Time Employee - Hourly: $${rate}/hr, Hours: ${hours}"</span>
                            </div>
                        `;
                        badgeCanvas.appendChild(badge);

                        explanationS7.innerHTML = `<strong>Overriding Mechanism:</strong> Calling <code>emp.GetDetails()</code> calls the derived override because the object type is <code>PartTimeEmployee</code>. Total earnings are <code>$${total}</code>.`;
                    }
                };
            }
            break;

        case 8:
            const s8Type = document.getElementById("simS8Type");
            const elecInputs = document.getElementById("simS8ElecInputs");
            const clothInputs = document.getElementById("simS8ClothInputs");
            const s8Run = document.getElementById("btnSimS8Run");
            const invoiceCanvas = document.getElementById("simS8InvoiceCanvas");
            const explanationS8 = document.getElementById("simS8Explanation");

            if (s8Type) {
                s8Type.onchange = () => {
                    if (s8Type.value === "elec") {
                        elecInputs.classList.remove("d-none");
                        clothInputs.classList.add("d-none");
                    } else {
                        elecInputs.classList.add("d-none");
                        clothInputs.classList.remove("d-none");
                    }
                };
            }

            if (s8Run) {
                s8Run.onclick = () => {
                    invoiceCanvas.innerHTML = "";
                    const type = s8Type.value;
                    const price = parseFloat(document.getElementById("simS8Price").value) || 0;

                    if (type === "elec") {
                        const warranty = parseInt(document.getElementById("simS8Warranty").value) || 1;
                        // 10% flat discount + warranty bonus (2% per year)
                        const discountPct = 10 + (warranty * 2);
                        const discountAmt = price * (discountPct / 100);
                        const finalPrice = price - discountAmt;

                        explanationS8.innerHTML = `<strong>Abstract Resolution:</strong> <code>Product p = new Electronics();</code> resolved. Calling abstract method <code>p.GetDiscountedPrice()</code>.`;

                        const invoice = document.createElement("div");
                        invoice.className = "mem-cell p-4 border border-secondary rounded bg-dark-theme-light flash-pulse";
                        invoice.style.width = "100%";
                        invoice.style.maxWidth = "400px";
                        invoice.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-cyan text-dark font-outfit">Electronics Product</span>
                                <span class="text-pink font-mono small">Abstract Method Overridden</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">Base Price:</span>
                                <span class="text-light font-mono">$${price.toFixed(2)}</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">Discount Scheme (10% + 2% per warranty year):</span>
                                <span class="text-danger font-mono">-${discountPct}% (-$${discountAmt.toFixed(2)})</span>
                            </div>
                            <div class="mb-3">
                                <span class="text-muted small d-block">Final Price:</span>
                                <span class="text-cyan font-mono fs-5">$${finalPrice.toFixed(2)}</span>
                            </div>
                            <div class="border-top border-secondary pt-2">
                                <span class="text-muted small d-block">Warranty Service:</span>
                                <span class="text-pink small font-mono">${warranty} Years Protection Plan Active</span>
                            </div>
                        `;
                        invoiceCanvas.appendChild(invoice);

                        explanationS8.innerHTML = `<strong>Polymorphism at Work:</strong> The base abstract product variable references an instance of <code>Electronics</code>, dynamically invoking its specific discount formula: <code>BasePrice - ${discountPct}%</code>.`;
                    } else {
                        const size = document.getElementById("simS8Size").value;
                        let discountPct = 5;
                        if (size === "M") discountPct = 10;
                        if (size === "L") discountPct = 15;

                        const discountAmt = price * (discountPct / 100);
                        const finalPrice = price - discountAmt;

                        explanationS8.innerHTML = `<strong>Abstract Resolution:</strong> <code>Product p = new Clothing();</code> resolved. Calling abstract method <code>p.GetDiscountedPrice()</code>.`;

                        const invoice = document.createElement("div");
                        invoice.className = "mem-cell p-4 border border-secondary rounded bg-dark-theme-light flash-pulse";
                        invoice.style.width = "100%";
                        invoice.style.maxWidth = "400px";
                        invoice.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-pink text-light font-outfit">Clothing Product</span>
                                <span class="text-cyan font-mono small">Abstract Method Overridden</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">Base Price:</span>
                                <span class="text-light font-mono">$${price.toFixed(2)}</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-muted small d-block">Discount Scheme (Size ${size} Discount):</span>
                                <span class="text-danger font-mono">-${discountPct}% (-$${discountAmt.toFixed(2)})</span>
                            </div>
                            <div class="mb-3">
                                <span class="text-muted small d-block">Final Price:</span>
                                <span class="text-pink font-mono fs-5">$${finalPrice.toFixed(2)}</span>
                            </div>
                            <div class="border-top border-secondary pt-2">
                                <span class="text-muted small d-block">Garment Specification:</span>
                                <span class="text-cyan small font-mono">Size ${size} Tailoring Standard</span>
                            </div>
                        `;
                        invoiceCanvas.appendChild(invoice);

                        explanationS8.innerHTML = `<strong>Polymorphism at Work:</strong> The base abstract product variable references an instance of <code>Clothing</code>, dynamically invoking its size-based discount formula: <code>BasePrice - ${discountPct}%</code>.`;
                    }
                };
            }
            break;

        case 9:
            // Generics Box
            document.getElementById("btnSimS9Add").onclick = () => {
                const type = document.getElementById("simS9Type").value;
                const val = document.getElementById("simS9Val").value.trim();
                const consoleEl = document.getElementById("simS9Console");
                const box = document.getElementById("simS9Box");
                const boxValue = document.getElementById("simS9BoxValue");
                const boxType = document.getElementById("simS9BoxType");
                const boxIcon = document.getElementById("simS9BoxIcon");

                box.classList.remove("locked");
                if (type === "int") {
                    const isInt = /^\d+$/.test(val);
                    if (isInt) {
                        box.classList.add("locked");
                        boxValue.innerText = val;
                        boxType.innerText = "Box<int>";
                        boxIcon.innerHTML = '<i class="fa-solid fa-box"></i>';
                        consoleEl.innerHTML = `<strong>Compilation Succeeded!</strong><br/>Value '${val}' is type-compatible with Box&lt;int&gt;. Standard generic safety confirmed.`;
                        consoleEl.style.color = "#34d399";
                    } else {
                        consoleEl.innerHTML = `<strong>C# Compile Error:</strong><br/>Cannot convert 'string' representation to generic argument parameter 'int'. Static safety checks prevent invalid types in C# Box&lt;T&gt;.`;
                        consoleEl.style.color = "#f87171";
                        boxValue.innerText = "Compilation Failed";
                    }
                } else if (type === "string") {
                    box.classList.add("locked");
                    boxValue.innerText = `"${val}"`;
                    boxType.innerText = "Box<string>";
                    boxIcon.innerHTML = '<i class="fa-solid fa-box"></i>';
                    consoleEl.innerHTML = `<strong>Compilation Succeeded!</strong><br/>Value '${val}' is type-compatible with Box&lt;string&gt;. Standard generic safety confirmed.`;
                    consoleEl.style.color = "#34d399";
                }
            };
            break;

        case 10:
            // Exception handlers — with stack unwinding visualization
            document.getElementById("btnSimS10Run").onclick = () => {
                const type = document.getElementById("simS10Type").value;
                const consoleEl = document.getElementById("simS10Console");
                const bTry = document.getElementById("blockTry");
                const bCatch = document.getElementById("blockCatch");
                const bFinally = document.getElementById("blockFinally");

                // Reset all states
                [bTry, bCatch, bFinally].forEach(b => {
                    b.classList.remove("active", "pulse-active");
                    b.style.opacity = "0.4";
                });

                consoleEl.innerText = "⏳ Starting execution trace...";
                consoleEl.style.color = "#ffffff";

                // Step 1: try block lights up
                setTimeout(() => {
                    bTry.style.opacity = "1";
                    bTry.classList.add("pulse-active");
                    consoleEl.innerHTML = `<strong>[1/3]</strong> Entering <code style='color:var(--neon-cyan)'>try</code> block...`;
                    
                    // Step 2: evaluate outcome
                    setTimeout(() => {
                        if (type === "success") {
                            bTry.classList.remove("pulse-active");
                            bTry.style.borderColor = "#10b981";
                            bCatch.style.opacity = "0.2";
                            bFinally.style.opacity = "1";
                            bFinally.classList.add("pulse-active");
                            consoleEl.innerHTML = `<strong style='color:#10b981'>[2/3]</strong> Try completed. No exception. <code>catch</code> skipped.<br/><strong style='color:#10b981'>[3/3]</strong> <code>finally</code> executing cleanup...`;
                            consoleEl.style.color = "#34d399";
                        } else {
                            const errName = type === "div0" ? "DivideByZeroException" : "NullReferenceException";
                            const errMsg = type === "div0" ? "Attempted to divide by zero" : "Object reference not set to an instance";
                            bTry.classList.remove("pulse-active");
                            bTry.style.borderColor = "#ef4444";
                            bCatch.style.opacity = "1";
                            bCatch.classList.add("pulse-active");
                            consoleEl.innerHTML = `<strong style='color:#ef4444'>[EXCEPTION]</strong> ${errName} thrown!<br/><strong>[2/3]</strong> Stack unwinding → catch block matched.<br/>Message: "${errMsg}"`;
                            consoleEl.style.color = "#ffaa00";

                            setTimeout(() => {
                                bCatch.classList.remove("pulse-active");
                                bCatch.style.borderColor = "#ffaa00";
                                bFinally.style.opacity = "1";
                                bFinally.classList.add("pulse-active");
                                consoleEl.innerHTML += `<br/><strong style='color:#10b981'>[3/3]</strong> <code>finally</code> always executes — cleanup completed.`;
                                consoleEl.style.color = "#34d399";
                            }, 1800);
                        }
                    }, 1500);
                }, 300);
            };
            break;
    }
}

// ==========================================
// Interactive Code Lab (Bug Fixer & Feature Builder)
// ==========================================
let activeLabIndex = 0;

function initLabEditor() {
    const editorTarget = document.getElementById("labMonacoEditor");
    if (!editorTarget) return;

    if (!window.labEditor) {
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
        
        require(['vs/editor/editor.main'], function () {
            activeLabIndex = 0;
            const lab = window.sectionLabs[activeLabIndex];
            const savedCode = localStorage.getItem(`section_${activeSectionId}_lab_${lab.Id}_code`);
            const codeToLoad = savedCode !== null ? savedCode : lab.InitialCode;

            window.labEditor = monaco.editor.create(editorTarget, {
                value: codeToLoad,
                language: 'csharp',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                tabSize: 4,
                insertSpaces: true
            });

            // Trigger visual synchronization for Lab 1
            switchLab(0);
        });
    } else {
        window.labEditor.layout();
    }
}

function switchLab(index) {
    if (!window.sectionLabs || index < 0 || index >= window.sectionLabs.length) return;

    // Save editor progress of previous lab
    if (window.labEditor) {
        const prevLab = window.sectionLabs[activeLabIndex];
        localStorage.setItem(`section_${activeSectionId}_lab_${prevLab.Id}_code`, window.labEditor.getValue());
    }

    activeLabIndex = index;
    const lab = window.sectionLabs[index];

    // Toggle button active states
    document.querySelectorAll(".lab-switch-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`lab-btn-${index}`);
    if (activeBtn) activeBtn.classList.add("active");

    // Update title, description, and validation target inputs
    document.getElementById("labDisplayTitle").innerHTML = `<i class="fa-solid fa-flask me-2"></i> Section Lab: ${lab.Title}`;
    document.getElementById("labDisplayDesc").innerText = lab.Description;
    document.getElementById("labExpectedOutput").value = lab.ExpectedOutput;

    // Dynamic header label updates depending on task type
    const isBugFix = lab.Title.toLowerCase().includes("fix") || lab.Title.toLowerCase().includes("mismatch") || lab.Title.toLowerCase().includes("nullreference");
    const instructionEl = document.getElementById("labTaskInstructionLabel");
    if (instructionEl) {
        instructionEl.innerHTML = isBugFix 
            ? `<i class="fa-solid fa-bugs text-cyan"></i> Fix the C# code below and click Run & Test Lab:`
            : `<i class="fa-solid fa-code text-cyan"></i> Implement the feature in the C# editor below and click Run & Test Lab:`;
    }

    // Load template or cached edits
    const savedCode = localStorage.getItem(`section_${activeSectionId}_lab_${lab.Id}_code`);
    if (window.labEditor) {
        window.labEditor.setValue(savedCode !== null ? savedCode : lab.InitialCode);
    }

    // Refresh completed state badges
    const isCompleted = localStorage.getItem(`section_${activeSectionId}_lab_${lab.Id}_completed`) === "true";
    const badge = document.getElementById("labCompletedBadge");
    const pending = document.getElementById("labPendingBadge");
    if (badge && pending) {
        if (isCompleted) {
            badge.classList.remove("d-none");
            pending.classList.add("d-none");
        } else {
            badge.classList.add("d-none");
            pending.classList.remove("d-none");
        }
    }

    // Reset terminal views
    const term = document.getElementById("labTerminalOutput");
    if (term) term.innerHTML = `<span class='text-muted'>&gt; Solve/Fix code and click Run & Test Lab to verify...</span>`;
    
    const execTime = document.getElementById("labExecutionTime");
    if (execTime) execTime.innerText = "Status: Ready";
}

function resetLabCodeTemplate() {
    if (window.labEditor && window.sectionLabs) {
        const lab = window.sectionLabs[activeLabIndex];
        window.labEditor.setValue(lab.InitialCode);
        localStorage.removeItem(`section_${activeSectionId}_lab_${lab.Id}_code`);
    }
}

function runLabCode() {
    const code = window.labEditor ? window.labEditor.getValue() : "";
    const spinner = document.getElementById("runLabBtnSpinner");
    const icon = document.getElementById("runLabBtnIcon");
    const term = document.getElementById("labTerminalOutput");
    const execTimeBadge = document.getElementById("labExecutionTime");

    if (!code.trim()) {
        term.innerText = "> Error: Editor is empty!";
        return;
    }

    if (spinner) spinner.classList.remove("d-none");
    if (icon) icon.classList.add("d-none");
    term.innerHTML = "<span class='text-muted'>> Compiling C# source code and running validation...</span>";
    if (execTimeBadge) execTimeBadge.innerText = "Status: Compiling...";

    const startTime = performance.now();

    fetch("/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code })
    })
    .then(res => res.json())
    .then(data => {
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        if (spinner) spinner.classList.add("d-none");
        if (icon) icon.classList.remove("d-none");
        
        if (data.success) {
            term.innerText = data.output || "> Program completed with empty stdout.";
            if (execTimeBadge) execTimeBadge.innerText = `Status: Success (${elapsed}s)`;
        } else {
            term.innerHTML = `<span class='text-danger'>${escapeHtml(data.output || "Compilation/Runtime Error")}</span>`;
            if (execTimeBadge) execTimeBadge.innerText = `Status: Failed (${elapsed}s)`;
        }
    })
    .catch(err => {
        if (spinner) spinner.classList.add("d-none");
        if (icon) icon.classList.remove("d-none");
        term.innerHTML = `<span class='text-danger'>> Communication Failure: ${escapeHtml(err.message)}</span>`;
        if (execTimeBadge) execTimeBadge.innerText = "Status: Error";
    });
}

function verifyLabSolution() {
    const expectedInput = document.getElementById("labExpectedOutput");
    const expected = expectedInput ? expectedInput.value.trim().toLowerCase() : "";
    const term = document.getElementById("labTerminalOutput");
    const termText = term ? term.innerText.trim().toLowerCase() : "";
    
    if (termText.includes(expected) && expected.length > 0) {
        const lab = window.sectionLabs[activeLabIndex];
        localStorage.setItem(`section_${activeSectionId}_lab_${lab.Id}_completed`, "true");
        
        const badge = document.getElementById("labCompletedBadge");
        const pending = document.getElementById("labPendingBadge");
        if (badge) badge.classList.remove("d-none");
        if (pending) pending.classList.add("d-none");
        
        alert("🎉 Lab Completed Successfully! Great job.");
        
        if (typeof confetti === "function") {
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.8 }
            });
        }
        
        updateSectionProgress();
        updateDashboardStats();
    } else {
        alert("❌ Verification Failed: The program output does not match the expected criteria. Review console output and ensure all compiler warnings/errors are resolved.");
    }
}

// ==========================================
// Drag and Drop Concept Matching Game
// ==========================================
function initDragDropGame() {
    if (!window.dragDropExercise || !window.dragDropExercise.Pairs) return;

    const sourceContainer = document.getElementById("dragSourceContainer");
    const targetContainer = document.getElementById("dropTargetContainer");
    if (!sourceContainer || !targetContainer) return;

    // Check if matching game was already completed
    const isCompleted = localStorage.getItem(`section_${activeSectionId}_dragdrop_completed`) === "true";

    // Clear previous elements
    sourceContainer.innerHTML = "";
    targetContainer.innerHTML = "";

    // Extract terms and descriptions
    const pairs = window.dragDropExercise.Pairs;

    // Shuffle terms for the drag sources
    const shuffledPairsForTerms = [...pairs].sort(() => Math.random() - 0.5);
    // Shuffle descriptions for the target drops
    const shuffledPairsForDescs = [...pairs].sort(() => Math.random() - 0.5);

    // Create Concept Drag Cards
    shuffledPairsForTerms.forEach(pair => {
        const card = document.createElement("div");
        card.className = "draggable-card";
        card.id = `card-${pair.Id}`;
        card.innerText = pair.Term;

        if (isCompleted || localStorage.getItem(`section_${activeSectionId}_pair_${pair.Id}_matched`) === "true") {
            card.classList.add("matched");
            card.setAttribute("draggable", "false");
        } else {
            card.setAttribute("draggable", "true");
            
            // Drag Start
            card.addEventListener("dragstart", (e) => {
                card.classList.add("dragging");
                e.dataTransfer.setData("text/plain", pair.Id);
            });

            // Drag End
            card.addEventListener("dragend", () => {
                card.classList.remove("dragging");
            });
        }

        sourceContainer.appendChild(card);
    });

    // Create Description Drop Zones
    shuffledPairsForDescs.forEach(pair => {
        const wrapper = document.createElement("div");
        wrapper.className = "drop-zone-wrapper";
        wrapper.id = `wrapper-${pair.Id}`;

        const zone = document.createElement("div");
        zone.className = "drop-zone";
        zone.id = `zone-${pair.Id}`;
        
        const isMatched = isCompleted || localStorage.getItem(`section_${activeSectionId}_pair_${pair.Id}_matched`) === "true";
        if (isMatched) {
            zone.classList.add("correct");
            zone.innerText = pair.Term;
        } else {
            zone.innerText = "Drag Concept Here";

            // Drag Over
            zone.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            // Drag Enter
            zone.addEventListener("dragenter", () => {
                if (!zone.classList.contains("correct")) {
                    zone.classList.add("hovered");
                }
            });

            // Drag Leave
            zone.addEventListener("dragleave", () => {
                zone.classList.remove("hovered");
            });

            // Drop
            zone.addEventListener("drop", (e) => {
                e.preventDefault();
                zone.classList.remove("hovered");
                const droppedPairId = e.dataTransfer.getData("text/plain");

                if (droppedPairId === pair.Id) {
                    // Success Match!
                    zone.classList.add("correct");
                    zone.innerText = pair.Term;

                    const dragCard = document.getElementById(`card-${droppedPairId}`);
                    if (dragCard) {
                        dragCard.classList.add("matched");
                        dragCard.setAttribute("draggable", "false");
                    }

                    localStorage.setItem(`section_${activeSectionId}_pair_${pair.Id}_matched`, "true");
                    checkDragDropCompletion();
                } else {
                    // Fail Match!
                    zone.classList.add("shake-fail");
                    setTimeout(() => {
                        zone.classList.remove("shake-fail");
                    }, 500);
                }
            });
        }

        const descText = document.createElement("div");
        descText.className = "font-outfit text-white-50";
        descText.innerHTML = `<strong>Definition:</strong> ${pair.Description}`;

        wrapper.appendChild(zone);
        wrapper.appendChild(descText);
        targetContainer.appendChild(wrapper);
    });

    updateDragDropUIBadges(isCompleted);
}

function checkDragDropCompletion() {
    if (!window.dragDropExercise || !window.dragDropExercise.Pairs) return;
    const pairs = window.dragDropExercise.Pairs;

    let allMatched = true;
    for (let i = 0; i < pairs.length; i++) {
        if (localStorage.getItem(`section_${activeSectionId}_pair_${pairs[i].Id}_matched`) !== "true") {
            allMatched = false;
            break;
        }
    }

    if (allMatched) {
        localStorage.setItem(`section_${activeSectionId}_dragdrop_completed`, "true");
        updateDragDropUIBadges(true);
        alert("🎉 Congratulations! You have successfully matched all concepts correctly.");
        if (typeof confetti === "function") {
            confetti({
                particleCount: 70,
                spread: 50,
                origin: { y: 0.8 }
            });
        }
        updateSectionProgress();
        updateDashboardStats();
    }
}

function updateDragDropUIBadges(isCompleted) {
    const badge = document.getElementById("dragDropCompletedBadge");
    const pending = document.getElementById("dragDropPendingBadge");
    if (badge && pending) {
        if (isCompleted) {
            badge.classList.remove("d-none");
            pending.classList.add("d-none");
        } else {
            badge.classList.add("d-none");
            pending.classList.remove("d-none");
        }
    }
}

function resetDragDropGame() {
    if (!window.dragDropExercise || !window.dragDropExercise.Pairs) return;
    const pairs = window.dragDropExercise.Pairs;

    // Reset matching tokens
    localStorage.removeItem(`section_${activeSectionId}_dragdrop_completed`);
    pairs.forEach(pair => {
        localStorage.removeItem(`section_${activeSectionId}_pair_${pair.Id}_matched`);
    });

    // Reinitialize game
    initDragDropGame();
    updateSectionProgress();
    updateDashboardStats();
}

window.loadIntoPlayground = function(code, sectionId) {
    localStorage.setItem("playground_injected_code", code);
    window.location.href = "/Section/" + sectionId + "#playground";
};

// =============================================================
//  PREDICT THE OUTPUT ENGINE
// =============================================================

let predictCurrentIndex = 0;
let predictCompleted = [];

function initPredictOutput() {
    if (!predictOutputExercises || predictOutputExercises.length === 0) return;

    // Load persisted completion state
    predictCompleted = predictOutputExercises.map((_, i) => {
        return localStorage.getItem(`section_${activeSectionId}_predict_${i}_done`) === "true";
    });

    predictCurrentIndex = 0;
    renderPredictSwitcherBar();
    loadPredictExercise(0);
}

function renderPredictSwitcherBar() {
    const bar = document.getElementById("predictSwitcherBar");
    if (!bar) return;
    bar.innerHTML = "";
    predictOutputExercises.forEach((ex, i) => {
        const isDone = predictCompleted[i];
        const btn = document.createElement("button");
        btn.className = `btn btn-sm Cairo-bold px-3 predict-switch-btn ${i === predictCurrentIndex ? "btn-cyan" : "btn-outline-secondary"} ${isDone ? "predict-done" : ""}`;
        btn.id = `predict-switcher-${i}`;
        btn.innerHTML = `${isDone ? '<i class="fa-solid fa-circle-check me-1 text-success"></i>' : `<i class="fa-solid fa-eye me-1"></i>`} Ex ${i + 1}`;
        btn.onclick = () => loadPredictExercise(i);
        bar.appendChild(btn);
    });
}

function loadPredictExercise(index) {
    predictCurrentIndex = index;
    const ex = predictOutputExercises[index];
    if (!ex) return;

    // Update switcher bar active states
    renderPredictSwitcherBar();

    // Exercise number + title
    document.getElementById("predictExerciseNum").textContent = `Exercise ${index + 1}`;
    document.getElementById("predictExerciseTitle").textContent = ex.Title;

    // Code display — escape HTML
    const codeEl = document.querySelector("#predictCodeDisplay code");
    if (codeEl) {
        codeEl.textContent = ex.Code;
        // Re-trigger Prism highlight if available
        if (window.Prism) Prism.highlightElement(codeEl);
    }

    // Reset hint
    const hintBox = document.getElementById("predictHintBox");
    const hintBtn = document.getElementById("predictHintBtn");
    if (hintBox) hintBox.classList.add("d-none");
    if (hintBtn) { hintBtn.disabled = false; hintBtn.innerHTML = '<i class="fa-solid fa-lightbulb me-1"></i> Show Hint'; }
    document.getElementById("predictHintText").textContent = ex.Hint;

    // Reset answer
    document.getElementById("predictAnswerInput").value = "";
    document.getElementById("predictAnswerInput").disabled = false;

    // Reset feedback
    const fb = document.getElementById("predictFeedback");
    fb.classList.add("d-none");
    fb.innerHTML = "";

    // Update score display
    updatePredictProgress();
}

function revealPredictHint() {
    const hintBox = document.getElementById("predictHintBox");
    const hintBtn = document.getElementById("predictHintBtn");
    if (hintBox) hintBox.classList.remove("d-none");
    if (hintBtn) { hintBtn.disabled = true; hintBtn.innerHTML = '<i class="fa-solid fa-lightbulb me-1"></i> Hint Shown'; }
}

function normalizePredictOutput(str) {
    return str
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim()
        .split("\n")
        .map(l => l.trimEnd())
        .join("\n");
}

function checkPredictAnswer() {
    const ex = predictOutputExercises[predictCurrentIndex];
    if (!ex) return;

    const userRaw = document.getElementById("predictAnswerInput").value;
    const userNorm = normalizePredictOutput(userRaw);
    const expectedNorm = normalizePredictOutput(ex.ExpectedOutput);

    const isCorrect = userNorm === expectedNorm;
    const fb = document.getElementById("predictFeedback");
    fb.classList.remove("d-none");

    if (isCorrect) {
        fb.innerHTML = `
            <div class="alert" style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.35); border-radius:10px; padding:20px;">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <i class="fa-solid fa-circle-check fa-2x" style="color:#10b981;"></i>
                    <h5 class="Cairo-bold mb-0" style="color:#10b981;">Correct! Your mental model is right.</h5>
                </div>
                <p class="font-outfit mb-2 text-light">The output matches exactly. Great understanding of C# execution flow!</p>
                <div style="background:#0c0f16; border-radius:6px; padding:10px 14px; font-family:monospace; color:#a8d5a2; font-size:0.88rem; border-left:3px solid #10b981;">
                    ${escapeHtml(ex.ExpectedOutput)}
                </div>
            </div>`;

        // Persist completion
        if (!predictCompleted[predictCurrentIndex]) {
            predictCompleted[predictCurrentIndex] = true;
            localStorage.setItem(`section_${activeSectionId}_predict_${predictCurrentIndex}_done`, "true");
            updateSectionProgress();
            updateDashboardStats();
        }

        // Disable input
        document.getElementById("predictAnswerInput").disabled = true;

        // Auto-advance after 1.5s if not last
        if (predictCurrentIndex < predictOutputExercises.length - 1) {
            setTimeout(() => loadPredictExercise(predictCurrentIndex + 1), 2000);
        }
    } else {
        // Show diff — line-by-line comparison
        const expectedLines = normalizePredictOutput(ex.ExpectedOutput).split("\n");
        const userLines = userNorm.split("\n");
        const maxLen = Math.max(expectedLines.length, userLines.length);

        let diffHtml = "";
        for (let i = 0; i < maxLen; i++) {
            const eL = expectedLines[i] ?? "<em class='text-muted'>(missing line)</em>";
            const uL = userLines[i] ?? "<em class='text-muted'>(missing line)</em>";
            const match = (expectedLines[i] ?? "") === (userLines[i] ?? "");
            diffHtml += `
                <tr>
                    <td style="color:${match ? '#10b981' : '#ef4444'}; font-family:monospace; padding:3px 8px; font-size:0.85rem;">${match ? '✓' : '✗'}</td>
                    <td style="font-family:monospace; padding:3px 8px; font-size:0.85rem; color:#e2e8f0;">${escapeHtml(String(userLines[i] ?? ""))}</td>
                    <td style="font-family:monospace; padding:3px 8px; font-size:0.85rem; color:#${match ? '10b981' : 'fbbf24'};">${escapeHtml(String(expectedLines[i] ?? ""))}</td>
                </tr>`;
        }

        fb.innerHTML = `
            <div class="alert" style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:20px;">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <i class="fa-solid fa-circle-xmark fa-2x" style="color:#ef4444;"></i>
                    <h5 class="Cairo-bold mb-0" style="color:#ef4444;">Not quite right — check your reasoning.</h5>
                </div>
                <p class="font-outfit mb-3 text-light">Compare your output line-by-line with the expected output:</p>
                <div style="overflow-x:auto; background:#0c0f16; border-radius:8px; padding:12px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th style="color:#94a3b8; font-size:0.75rem; padding:3px 8px; text-align:left;"></th>
                                <th style="color:#94a3b8; font-size:0.75rem; padding:3px 8px; text-align:left;">Your Output</th>
                                <th style="color:#fbbf24; font-size:0.75rem; padding:3px 8px; text-align:left;">Expected Output</th>
                            </tr>
                        </thead>
                        <tbody>${diffHtml}</tbody>
                    </table>
                </div>
                <p class="font-outfit mt-3 mb-0 text-white-50" style="font-size:0.85rem;"><i class="fa-solid fa-lightbulb text-warning me-1"></i> Try again — edit your answer above and re-check.</p>
            </div>`;
    }

    updatePredictProgress();
}

function resetPredictExercise() {
    document.getElementById("predictAnswerInput").value = "";
    document.getElementById("predictAnswerInput").disabled = false;
    const fb = document.getElementById("predictFeedback");
    fb.classList.add("d-none");
    fb.innerHTML = "";
    const hintBox = document.getElementById("predictHintBox");
    if (hintBox) hintBox.classList.add("d-none");
    const hintBtn = document.getElementById("predictHintBtn");
    if (hintBtn) { hintBtn.disabled = false; hintBtn.innerHTML = '<i class="fa-solid fa-lightbulb me-1"></i> Show Hint'; }
}

function updatePredictProgress() {
    const total = predictOutputExercises.length;
    const done = predictCompleted.filter(Boolean).length;
    const scoreEl = document.getElementById("predictScoreText");
    const bar = document.getElementById("predictProgressBar");
    if (scoreEl) scoreEl.textContent = `${done} / ${total}`;
    if (bar) bar.style.width = `${(done / total) * 100}%`;
    renderPredictSwitcherBar();
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ==========================================
// Bug Hunter Clickable Code Lines Handler
// ==========================================
function initBugHunter() {
    if (!activeSectionId || !window.bugHunterExercise) return;

    const isCompleted = localStorage.getItem(`section_${activeSectionId}_bughunter_completed`) === "true";
    const statusText = document.getElementById("bugHunterStatusText");
    const completedBadge = document.getElementById("bugHunterCompletedBadge");
    const feedback = document.getElementById("bugHunterFeedback");

    // Reset lines styling
    const totalLines = window.bugHunterExercise.CodeLines.length;
    for (let i = 0; i < totalLines; i++) {
        const lineRow = document.getElementById(`bugLine-${i}`);
        if (lineRow) {
            lineRow.classList.remove("correct", "wrong");
        }
    }

    if (isCompleted) {
        if (statusText) statusText.innerHTML = '<span class="text-success font-outfit"><i class="fa-solid fa-circle-check"></i> Resolved</span>';
        if (completedBadge) completedBadge.classList.remove("d-none");
        
        // Mark correct line
        const correctLine = document.getElementById(`bugLine-${window.bugHunterExercise.BuggyLineIndex}`);
        if (correctLine) {
            correctLine.classList.add("correct");
        }

        // Show explanation
        if (feedback) {
            feedback.className = "alert p-4 mb-4 alert-success";
            feedback.style.background = "rgba(16, 185, 129, 0.1)";
            feedback.style.border = "1px solid rgba(16, 185, 129, 0.3)";
            document.getElementById("bugHunterFeedbackTitle").innerHTML = '<i class="fa-solid fa-medal text-success me-2"></i> Bug Uncovered! +50 XP';
            document.getElementById("bugHunterFeedbackTitle").style.color = "#10b981";
            document.getElementById("bugHunterFeedbackText").innerHTML = `<strong>Success!</strong> ${window.bugHunterExercise.Explanation}`;
            document.getElementById("bugHunterFeedbackText").style.color = "#e2e8f0";
            feedback.classList.remove("d-none");
        }
    } else {
        if (statusText) statusText.textContent = "Active Hunting";
        if (completedBadge) completedBadge.classList.add("d-none");
        if (feedback) {
            feedback.classList.add("d-none");
            feedback.innerHTML = '<h5 class="Cairo-bold mb-2" id="bugHunterFeedbackTitle">Result</h5><p class="mb-0 font-outfit" id="bugHunterFeedbackText"></p>';
        }
    }
}

function clickBugLine(lineIdx) {
    if (!activeSectionId || !window.bugHunterExercise) return;

    const isCompleted = localStorage.getItem(`section_${activeSectionId}_bughunter_completed`) === "true";
    if (isCompleted) return; // Already resolved, do nothing

    const buggyIdx = window.bugHunterExercise.BuggyLineIndex;
    const lineRow = document.getElementById(`bugLine-${lineIdx}`);
    const feedback = document.getElementById("bugHunterFeedback");
    const statusText = document.getElementById("bugHunterStatusText");
    const completedBadge = document.getElementById("bugHunterCompletedBadge");

    if (lineIdx === buggyIdx) {
        // Correct Bug Line Clicked!
        lineRow.classList.remove("wrong");
        lineRow.classList.add("correct");

        localStorage.setItem(`section_${activeSectionId}_bughunter_completed`, "true");
        if (statusText) statusText.innerHTML = '<span class="text-success font-outfit"><i class="fa-solid fa-circle-check"></i> Resolved</span>';
        if (completedBadge) completedBadge.classList.remove("d-none");

        // Show Success Feedback
        if (feedback) {
            feedback.className = "alert p-4 mb-4 alert-success";
            feedback.style.background = "rgba(16, 185, 129, 0.1)";
            feedback.style.border = "1px solid rgba(16, 185, 129, 0.3)";
            document.getElementById("bugHunterFeedbackTitle").innerHTML = '<i class="fa-solid fa-medal text-success me-2"></i> Bug Uncovered! +50 XP';
            document.getElementById("bugHunterFeedbackTitle").style.color = "#10b981";
            document.getElementById("bugHunterFeedbackText").innerHTML = `<strong>Success!</strong> ${window.bugHunterExercise.Explanation}`;
            document.getElementById("bugHunterFeedbackText").style.color = "#e2e8f0";
            feedback.classList.remove("d-none");
        }

        // Update progress & stats in real-time
        updateSectionProgress();
        updateDashboardStats();
    } else {
        // Incorrect Line Clicked!
        // Reset previous failures and trigger shake animation
        lineRow.classList.remove("wrong");
        void lineRow.offsetWidth; // Trigger reflow for animation restart
        lineRow.classList.add("wrong");

        // Show Failure Feedback
        if (feedback) {
            feedback.className = "alert p-4 mb-4 alert-danger";
            feedback.style.background = "rgba(239, 68, 68, 0.08)";
            feedback.style.border = "1px solid rgba(239, 68, 68, 0.3)";
            document.getElementById("bugHunterFeedbackTitle").innerHTML = '<i class="fa-solid fa-triangle-exclamation text-danger me-2"></i> Try Again';
            document.getElementById("bugHunterFeedbackTitle").style.color = "#ef4444";
            document.getElementById("bugHunterFeedbackText").textContent = "This line of code is compiled correctly. Review your OOP rules and try another line!";
            document.getElementById("bugHunterFeedbackText").style.color = "#fca5a5";
            feedback.classList.remove("d-none");
        }
    }
}

function resetBugHunter() {
    if (!activeSectionId) return;

    localStorage.removeItem(`section_${activeSectionId}_bughunter_completed`);
    initBugHunter();
    updateSectionProgress();
    updateDashboardStats();
}


// ==========================================
// Code Puzzle (Fill-in-the-Blanks) Handlers
// ==========================================
window.codePuzzleFills = {};
window.activePuzzleBlankIndex = null;
window.activePuzzleSnippetValue = null;

function initCodePuzzle() {
    if (!activeSectionId || !window.codePuzzleExercise) return;

    const isCompleted = localStorage.getItem(`section_${activeSectionId}_codepuzzle_completed`) === "true";
    const feedback = document.getElementById("codePuzzleFeedback");
    const completedBadge = document.getElementById("codePuzzleCompletedBadge");
    
    window.codePuzzleFills = {};
    window.activePuzzleBlankIndex = null;
    window.activePuzzleSnippetValue = null;

    // Reset snippets styling
    const snippets = document.querySelectorAll(".draggable-snippet");
    snippets.forEach(s => s.classList.remove("selected"));

    const correctAnswers = window.codePuzzleExercise.CorrectAnswers;
    const totalBlanks = correctAnswers.length;

    // Load saved answers or reset
    let savedFills = null;
    try {
        const savedStr = localStorage.getItem(`section_${activeSectionId}_codepuzzle_fills`);
        if (savedStr) savedFills = JSON.parse(savedStr);
    } catch (e) {
        console.error("Failed to parse saved puzzle fills", e);
    }

    for (let i = 0; i < totalBlanks; i++) {
        const blank = document.getElementById(`puzzleBlank-${i}`);
        if (blank) {
            blank.classList.remove("active", "filled", "correct", "incorrect");
            if (isCompleted) {
                const answer = correctAnswers[i];
                blank.textContent = answer;
                blank.classList.add("correct", "filled");
            } else if (savedFills && savedFills[i]) {
                blank.textContent = savedFills[i];
                blank.classList.add("filled");
                window.codePuzzleFills[i] = savedFills[i];
            } else {
                blank.textContent = "?";
            }
        }
    }

    if (isCompleted) {
        if (completedBadge) completedBadge.classList.remove("d-none");
        if (feedback) {
            feedback.className = "alert p-4 mb-4 alert-success";
            feedback.style.background = "rgba(16, 185, 129, 0.1)";
            feedback.style.border = "1px solid rgba(16, 185, 129, 0.3)";
            document.getElementById("codePuzzleFeedbackTitle").innerHTML = '<i class="fa-solid fa-medal text-success me-2"></i> Puzzle Completed! +50 XP';
            document.getElementById("codePuzzleFeedbackTitle").style.color = "#10b981";
            document.getElementById("codePuzzleFeedbackText").innerHTML = `<strong>Success!</strong> ${window.codePuzzleExercise.Explanation}`;
            document.getElementById("codePuzzleFeedbackText").style.color = "#e2e8f0";
            feedback.classList.remove("d-none");
        }
    } else {
        if (completedBadge) completedBadge.classList.add("d-none");
        if (feedback) {
            feedback.classList.add("d-none");
            feedback.innerHTML = '<h5 class="Cairo-bold mb-2" id="codePuzzleFeedbackTitle">Result</h5><p class="mb-0 font-outfit" id="codePuzzleFeedbackText"></p>';
        }
    }
}

// HTML5 Drag and Drop events
function dragSnippet(ev, snippetVal, sIdx) {
    if (localStorage.getItem(`section_${activeSectionId}_codepuzzle_completed`) === "true") {
        ev.preventDefault();
        return;
    }
    ev.dataTransfer.setData("text/plain", snippetVal);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function dropSnippet(ev, blankIdx) {
    ev.preventDefault();
    if (localStorage.getItem(`section_${activeSectionId}_codepuzzle_completed`) === "true") return;

    const val = ev.dataTransfer.getData("text/plain");
    if (val) {
        fillPuzzleBlank(blankIdx, val);
    }
}

// Click to Fill (Mobile & alternate Desktop accessibility)
function clickPuzzleBlank(blankIdx) {
    const isCompleted = localStorage.getItem(`section_${activeSectionId}_codepuzzle_completed`) === "true";
    if (isCompleted) return;

    // Reset other blanks active state
    const correctAnswers = window.codePuzzleExercise.CorrectAnswers;
    for (let i = 0; i < correctAnswers.length; i++) {
        const b = document.getElementById(`puzzleBlank-${i}`);
        if (b) b.classList.remove("active");
    }

    const clickedBlank = document.getElementById(`puzzleBlank-${blankIdx}`);

    if (window.activePuzzleSnippetValue !== null) {
        // We already have a snippet selected, fill it!
        fillPuzzleBlank(blankIdx, window.activePuzzleSnippetValue);
        
        // Reset selection state
        window.activePuzzleSnippetValue = null;
        window.activePuzzleBlankIndex = null;
        const snippets = document.querySelectorAll(".draggable-snippet");
        snippets.forEach(s => s.classList.remove("selected"));
    } else {
        // Highlight this blank as active
        if (clickedBlank) clickedBlank.classList.add("active");
        window.activePuzzleBlankIndex = blankIdx;
    }
}

function clickPuzzleSnippet(val, snippetIdx) {
    const isCompleted = localStorage.getItem(`section_${activeSectionId}_codepuzzle_completed`) === "true";
    if (isCompleted) return;

    const snippetEl = document.getElementById(`puzzleSnippet-${snippetIdx}`);

    if (window.activePuzzleBlankIndex !== null) {
        // We have an active blank, fill it immediately!
        fillPuzzleBlank(window.activePuzzleBlankIndex, val);

        // Remove active class from blank
        const activeBlank = document.getElementById(`puzzleBlank-${window.activePuzzleBlankIndex}`);
        if (activeBlank) activeBlank.classList.remove("active");

        // Reset state
        window.activePuzzleBlankIndex = null;
        window.activePuzzleSnippetValue = null;
    } else {
        // Highlight snippet as selected
        const snippets = document.querySelectorAll(".draggable-snippet");
        snippets.forEach(s => s.classList.remove("selected"));

        if (snippetEl) snippetEl.classList.add("selected");
        window.activePuzzleSnippetValue = val;
    }
}

function fillPuzzleBlank(blankIdx, val) {
    window.codePuzzleFills[blankIdx] = val;
    
    const blank = document.getElementById(`puzzleBlank-${blankIdx}`);
    if (blank) {
        blank.textContent = val;
        blank.classList.add("filled");
        blank.classList.remove("active", "incorrect", "correct");
    }

    // Save state
    localStorage.setItem(`section_${activeSectionId}_codepuzzle_fills`, JSON.stringify(window.codePuzzleFills));
}

function checkCodePuzzle() {
    if (!activeSectionId || !window.codePuzzleExercise) return;

    const isCompleted = localStorage.getItem(`section_${activeSectionId}_codepuzzle_completed`) === "true";
    if (isCompleted) return;

    const correctAnswers = window.codePuzzleExercise.CorrectAnswers;
    const totalBlanks = correctAnswers.length;
    const feedback = document.getElementById("codePuzzleFeedback");
    const completedBadge = document.getElementById("codePuzzleCompletedBadge");

    // Check if all are filled
    const filledCount = Object.keys(window.codePuzzleFills).length;
    if (filledCount < totalBlanks) {
        if (feedback) {
            feedback.className = "alert p-4 mb-4 alert-warning";
            feedback.style.background = "rgba(251, 191, 36, 0.08)";
            feedback.style.border = "1px solid rgba(251, 191, 36, 0.3)";
            document.getElementById("codePuzzleFeedbackTitle").innerHTML = '<i class="fa-solid fa-circle-exclamation text-warning me-2"></i> Incomplete Puzzle';
            document.getElementById("codePuzzleFeedbackTitle").style.color = "#fbbf24";
            document.getElementById("codePuzzleFeedbackText").textContent = "Please place a snippet in every blank space before verifying!";
            document.getElementById("codePuzzleFeedbackText").style.color = "#fef3c7";
            feedback.classList.remove("d-none");
        }
        return;
    }

    let allCorrect = true;
    for (let i = 0; i < totalBlanks; i++) {
        const blank = document.getElementById(`puzzleBlank-${i}`);
        const userVal = window.codePuzzleFills[i];
        const correctVal = correctAnswers[i];

        if (blank) {
            if (userVal === correctVal) {
                blank.classList.remove("incorrect");
                blank.classList.add("correct");
            } else {
                allCorrect = false;
                blank.classList.remove("correct");
                // Trigger reflow to restart shake animation
                blank.classList.remove("incorrect");
                void blank.offsetWidth;
                blank.classList.add("incorrect");
            }
        }
    }

    if (allCorrect) {
        localStorage.setItem(`section_${activeSectionId}_codepuzzle_completed`, "true");
        if (completedBadge) completedBadge.classList.remove("d-none");

        if (feedback) {
            feedback.className = "alert p-4 mb-4 alert-success";
            feedback.style.background = "rgba(16, 185, 129, 0.1)";
            feedback.style.border = "1px solid rgba(16, 185, 129, 0.3)";
            document.getElementById("codePuzzleFeedbackTitle").innerHTML = '<i class="fa-solid fa-medal text-success me-2"></i> Puzzle Completed! +50 XP';
            document.getElementById("codePuzzleFeedbackTitle").style.color = "#10b981";
            document.getElementById("codePuzzleFeedbackText").innerHTML = `<strong>Success!</strong> ${window.codePuzzleExercise.Explanation}`;
            document.getElementById("codePuzzleFeedbackText").style.color = "#e2e8f0";
            feedback.classList.remove("d-none");
        }

        // Update progress & stats in real-time
        updateSectionProgress();
        updateDashboardStats();
    } else {
        if (feedback) {
            feedback.className = "alert p-4 mb-4 alert-danger";
            feedback.style.background = "rgba(239, 68, 68, 0.08)";
            feedback.style.border = "1px solid rgba(239, 68, 68, 0.3)";
            document.getElementById("codePuzzleFeedbackTitle").innerHTML = '<i class="fa-solid fa-circle-xmark text-danger me-2"></i> Check Your Reasoning';
            document.getElementById("codePuzzleFeedbackTitle").style.color = "#ef4444";
            document.getElementById("codePuzzleFeedbackText").textContent = "Not all blanks are filled with the correct C# code snippets. Review your C# syntax rules and try again!";
            document.getElementById("codePuzzleFeedbackText").style.color = "#fca5a5";
            feedback.classList.remove("d-none");
        }
    }
}

function resetCodePuzzle() {
    if (!activeSectionId) return;

    localStorage.removeItem(`section_${activeSectionId}_codepuzzle_completed`);
    localStorage.removeItem(`section_${activeSectionId}_codepuzzle_fills`);
    initCodePuzzle();
    updateSectionProgress();
    updateDashboardStats();
}
