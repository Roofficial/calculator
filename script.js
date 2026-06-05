
const input = document.getElementById("input");
const preview = document.getElementById("livePreview");
const buttons = document.querySelectorAll(".buttons button");
const equalBtn = document.getElementById("equal");
const clearBtn = document.getElementById("clear");
const eraseBtn = document.getElementById("erase");
const historyList = document.getElementById("history");
const themeToggle = document.getElementById("themeToggle");

const aiBtn = document.getElementById("askAI");
const aiInput = document.getElementById("aiInput");
const aiResponse = document.getElementById("aiResponse");
const voiceBtn = document.getElementById("voiceBtn");

const graphInput = document.getElementById("graphInput");
const plotBtn = document.getElementById("plotBtn");

let history = [];

buttons.forEach(button => {

    const value = button.innerText;

    if(value !== "=" && value !== "AC" && value !== "⌫"){

        button.addEventListener("click", () => {

            const customValue =
                button.dataset.value || value;

            input.value += customValue;

            updatePreview();
        });
    }
});

clearBtn.addEventListener("click", () => {
    input.value = "";
    preview.innerText = "";
});

eraseBtn.addEventListener("click", () => {
    input.value = input.value.slice(0, -1);
    updatePreview();
});

equalBtn.addEventListener("click", calculateResult);

function calculateResult(){

    try{

        const result = math.evaluate(input.value);

        addToHistory(input.value, result);

        input.value = result;
        preview.innerText = "Result";

    }catch(error){

        preview.innerText = "Invalid Expression";
    }
}

function updatePreview(){

    try{

        if(input.value.trim() !== ""){

            const result = math.evaluate(input.value);

            preview.innerText = "= " + result;

        }

    }catch{
        preview.innerText = "Calculating...";
    }
}

function addToHistory(expression, result){

    history.unshift(`${expression} = ${result}`);

    if(history.length > 10){
        history.pop();
    }

    renderHistory();
}

function renderHistory(){

    historyList.innerHTML = "";

    history.forEach(item => {

        const li = document.createElement("li");
        li.innerText = item;

        li.addEventListener("click", () => {
            input.value = item.split("=")[0].trim();
            updatePreview();
        });

        historyList.appendChild(li);
    });
}

document.addEventListener("keydown", (e) => {

    if(/[0-9+\-*/().%^]/.test(e.key)){
        input.value += e.key;
        updatePreview();
    }

    if(e.key === "Enter"){
        calculateResult();
    }

    if(e.key === "Backspace"){
        input.value = input.value.slice(0,-1);
        updatePreview();
    }
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});

voiceBtn.addEventListener("click", () => {

    if(!('webkitSpeechRecognition' in window)){
        alert("Voice recognition not supported");
        return;
    }

    const recognition = new webkitSpeechRecognition();

    recognition.lang = "en-US";

    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0].transcript;

        aiInput.value = transcript;
    };

    recognition.start();
});

plotBtn.addEventListener("click", () => {

    const expr = graphInput.value;

    if(!expr) return;

    let xValues = [];
    let yValues = [];

    for(let x = -20; x <= 20; x += 0.5){

        xValues.push(x);

        try{

            const y = math.evaluate(expr, {x});

            yValues.push(y);

        }catch{
            yValues.push(null);
        }
    }

    Plotly.newPlot("graph", [{
        x:xValues,
        y:yValues,
        type:"scatter"
    }]);
});

aiBtn.addEventListener("click", async () => {

    const prompt = aiInput.value.trim();

    if(!prompt) return;

    aiResponse.innerText = "Thinking...";

    const API_KEY = "PASTE_OPENAI_API_KEY_HERE";

    if(API_KEY === "PASTE_OPENAI_API_KEY_HERE"){

        aiResponse.innerText =
`AI integration ready.

To activate:
1. Create an OpenAI API key
2. Replace:
PASTE_OPENAI_API_KEY_HERE

Features already included:
- AI math solving
- Homework explanations
- Formula explanations
- Smart assistant`;
        return;
    }

    try{

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer " + API_KEY
                },
                body:JSON.stringify({
                    model:"gpt-4.1-mini",
                    messages:[
                        {
                            role:"system",
                            content:
                            "You are a powerful AI math tutor."
                        },
                        {
                            role:"user",
                            content:prompt
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        aiResponse.innerText =
            data.choices[0].message.content;

    }catch(error){

        aiResponse.innerText =
            "AI request failed. Check API key or internet.";
    }
});
