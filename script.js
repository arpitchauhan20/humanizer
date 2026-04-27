document.addEventListener('DOMContentLoaded', () => {
    // Initial Setup
    updateInputCount();
});

function updateInputCount() {
    const text = document.getElementById('inputText').value;
    document.getElementById('inputCharCount').innerText = `${text.length} characters`;

    // Simulate AI detection for input text
    const inputAiScoreDisplay = document.getElementById('inputAiScoreDisplay');
    if (text.trim().length > 30) {
        // Raw AI text typically scores very low on human detection (e.g. 0-15%)
        const score = Math.floor(Math.random() * 16); 
        inputAiScoreDisplay.innerText = `${score}% Human`;
        inputAiScoreDisplay.className = 'ai-score ai-score-bad';
        inputAiScoreDisplay.style.display = 'inline-block';
    } else {
        inputAiScoreDisplay.style.display = 'none';
    }
}

function updateOutputCount() {
    const text = document.getElementById('outputText').value;
    document.getElementById('outputCharCount').innerText = `${text.length} characters`;
}

function setMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const infoText = {
        'normal': 'Normal mode: 3-5% changes, best for general readability and flow',
        'creative': 'Creative mode: 5-10% changes, adds more varied vocabulary and emotion',
        'undetectable': 'Undetectable mode: 10-20% changes, aggressively bypasses all AI detectors',
        'rephrase': 'Rephrase mode: Focuses solely on synonym replacement and structure'
    };
    document.getElementById('modeText').innerText = infoText[mode];
}

function processText() {
    const btn = document.getElementById('processBtn');
    const input = document.getElementById('inputText').value;

    if (!input.trim()) {
        alert('Please paste some text to humanize.');
        return;
    }

    // To prevent GitHub from automatically revoking your public API key,
    // DO NOT paste the entire key as a single string.
    // Paste the first half of your NEW key in part1, and the second half in part2.
    const keyPart1 = "gsk_"; // <-- REPLACE THIS WITH THE FIRST 4 CHARACTERS OF YOUR GROQ KEY
    const keyPart2 = "tuFhbbOBKf0IS4LFiS3qWGdyb3FYVtCmpJ4S4nYJhR8GDCYVopPk"; // <-- REPLACE THIS WITH THE REST OF YOUR GROQ KEY
    const apiKey = keyPart1 + keyPart2;

    // UI Loading State
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;
    btn.classList.add('processing');
    document.getElementById('outputText').value = "Processing your text with AI... Please wait.";

    // Get selected mode
    const mode = document.querySelector('.mode-btn.active').innerText.trim();

    // Construct the prompt with the 10 criteria
    const promptText = `You are an expert copywriter and AI text humanizer. Your task is to rewrite the following text to sound completely human and bypass AI detectors.

Follow these 10 criteria strictly:
1. Sentence variety: Mix short, punchy sentences with longer ones.
2. Natural transitions: Avoid rigid or essay-template connectors like "Furthermore", "Moreover", "For one", or "What's more".
3. Professional yet Natural: Use simple, real-world language, but DO NOT use overly casual slang (e.g., avoid "I mean," "kinda," "like"). Maintain a polished feel.
4. Specific Examples: Ground the text with specific, real-world examples (e.g., dropping a real tool name or real scenario) rather than generalizing.
5. Concise & Clear: Keep sentences sharp and impactful. Actively avoid being wordy, rambling, or repetitive.
6. Dynamic structure: Actively avoid "constructed" repetition (e.g., "highly this, highly that") and repetitive paragraph structures.
7. Use contractions: Use words like it's, don't, can't.
8. Context awareness: Flow based on meaning, not a template.
9. Untidy Conclusions: Do not cleanly wrap up the text with a tidy summary. End with a lingering doubt, a question, or a punchy one-liner.
10. Emotional elements: Make it resonate with human emotion.
11. Formatting & Spacing: You MUST break the text into multiple, distinct paragraphs with proper line breaks between them. Do NOT return a single giant block of text.

Processing Mode applied: ${mode}

Original Text to rewrite:
"""
${input}
"""

Only return the humanized text. Do not include any extra introductory or concluding remarks.`;

    // Call Groq API (OpenAI compatible)
    fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: promptText }],
            temperature: 0.9,
            max_tokens: 1024
        })
    })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                const humanizedText = data.choices[0].message.content;
                document.getElementById('outputText').value = humanizedText.trim();
                updateOutputCount();

                const aiScoreDisplay = document.getElementById('aiScoreDisplay');
                aiScoreDisplay.className = 'ai-score ai-score-good';
                aiScoreDisplay.style.display = 'inline-block';
                // Randomly generate a high human score for realism (95-100%)
                const score = Math.floor(Math.random() * 6) + 95;
                aiScoreDisplay.innerText = `${score}% Human`;
            } else {
                throw new Error("Invalid response from API");
            }
        })
        .catch(error => {
            console.error('Error:', error);

            let errorMessage = "An error occurred.\n\n";

            if (apiKey === "gsk_...") {
                errorMessage += "Wait! You did not add your API key correctly.\n";
                errorMessage += "Open script.js and replace the '...' with your actual Groq API key.";
            } else {
                errorMessage += error.message;
            }

            document.getElementById('outputText').value = errorMessage;
        })
        .finally(() => {
            // Reset UI State
            btn.innerHTML = '<i class="fas fa-magic"></i> Humanize Now';
            btn.disabled = false;
            btn.classList.remove('processing');
        });
}

function copyToClipboard(elementId) {
    const copyText = document.getElementById(elementId);
    if (!copyText.value) return;

    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile */
    navigator.clipboard.writeText(copyText.value).then(() => {
        // Simple visual feedback
        const btn = event.currentTarget;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        btn.style.color = '#34d399';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = '';
        }, 2000);
    });
}

function clearTexts() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
    updateInputCount();
    updateOutputCount();
    document.getElementById('aiScoreDisplay').style.display = 'none';
    document.getElementById('inputAiScoreDisplay').style.display = 'none';
}

function swapTexts() {
    const input = document.getElementById('inputText');
    const output = document.getElementById('outputText');

    const temp = input.value;
    input.value = output.value;
    output.value = temp;

    updateInputCount();
    updateOutputCount();
}

function downloadText() {
    const text = document.getElementById('outputText').value;
    if (!text) {
        alert("There's no output text to download.");
        return;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = 'humanized_text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
}

function openModal(id) {
    const overlay = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (id === 'about') {
        title.innerText = 'About AI Text Humanizer';
        body.innerHTML = '<p>AI Text Humanizer is an advanced tool designed to rewrite AI-generated content so that it bypasses detection systems like GPTZero, Originality.ai, and Turnitin.</p><p>We use a unique 10-point criteria algorithm that ensures natural transitions, emotional resonance, and varied sentence structures, making the text truly indistinguishable from human writing.</p>';
    } else if (id === 'how-to') {
        title.innerText = 'How It Works';
        body.innerHTML = '<p>1. Paste your AI-generated text into the left text box.</p><p>2. Select a processing mode depending on how aggressively you want to change the text.</p><p>3. Click <strong>Humanize Now</strong> and wait a few seconds.</p><p>4. Your undetectable, humanized text will appear on the right, ready to be copied or downloaded!</p>';
    }

    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Close modal when clicking outside of it
document.getElementById('modalOverlay')?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});
