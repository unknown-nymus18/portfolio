
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', function() {
        newInputs = document.querySelectorAll('.command-input');
        newInputs[newInputs.length - 1].focus();
    });
    document.addEventListener('keydown', function(e) {
        if(e.key === 'Enter') {
            const inputs = document.querySelectorAll('.command-input');
            const lines = document.querySelectorAll('.command-line');
            const currentInput = inputs[inputs.length - 1];
            const currentLine = lines[lines.length - 1];
            
            if (!currentInput) return;
            
            const input = currentInput.value;
            currentLine.innerHTML = "<p>C:\\Users\\unknown-nymus18&gt;&nbsp;</p>" + `<p>${input}</p>`;
            command(input);
        }
    });


    function command(input){
        input = input.toLowerCase().trim();

        switch(input.split(' ')[0]){
            case 'home':
                commandRespond("Redirecting to homepage...");
                setInterval(() => {
                    window.location.href = '../index.html';
                }, 1000);
                
                break;

            case 'help':
                commandRespond(`<p>- home: Go to the homepage</p>
                <p>- about: Learn more about me</p>
                <p>- projects: View my projects</p>
                <p>- social: View my social links</p>
                <p>- resume: Download my resume</p>
                <p>- contact: Open contact page</p>
                <p>- contact name="..." email="..." message="...": Send email directly</p>
                <p>- clear: Clear the terminal</p>
                <p>- help: Show this help message</p>`)
                break;

            case 'clear':
                window.location.href = 'terminal.html';
                break;

            case 'projects':
                commandRespond(`<p>=============== MY PROJECTS ===============</p>
<p></p>
<p>[1] Real-Time Chat Application</p>
<p>    A feature-rich real-time messaging app</p>
<p>    Tech: Flutter, Dart, Firebase</p>
<p>    <a href="https://github.com/unknown-nymus18/chat-app" target="_blank" style="color:#3b8eea;">View Source</a></p>
<p></p>
<p>[2] Multiplayer Chess Engine</p>
<p>    Chess game with AI and multiplayer support</p>
<p>    Tech: Flutter, Stockfish, WebSocket</p>
<p>    <a href="https://github.com/unknown-nymus18/chessy" target="_blank" style="color:#3b8eea;">View Source</a></p>
<p></p>
<p>[3] Weather Forecast Application</p>
<p>    Comprehensive weather app with forecasts</p>
<p>    Tech: Flutter, OpenWeather API, Geolocation</p>
<p>    <a href="https://github.com/unknown-nymus18/weather-app" target="_blank" style="color:#3b8eea;">View Source</a></p>
<p></p>
<p>[4] Medical Clinic Management System</p>
<p>    Appointment booking & clinic management</p>
<p>    Tech: HTML/CSS, JavaScript, Django, MySQL</p>
<p>    <a href="https://github.com/CodeNest208/Isercom" target="_blank" style="color:#3b8eea;">View Source</a></p>
<p></p>
<p>[5] Personal Finance Tracker</p>
<p>    Expense tracking with analytics & charts</p>
<p>    Tech: Flutter, Firebase, Charts</p>
<p>    <a href="https://github.com/unknown-nymus18/expenses_tracker" target="_blank" style="color:#3b8eea;">View Source</a></p>
<p></p>
<p>===========================================</p>`);
                break;

            case 'social':
                commandRespond(`<p>========== SOCIAL LINKS ==========</p>
<p></p>
<p>GitHub:   <a href="https://github.com/unknown-nymus18" target="_blank" style="color:#3b8eea;">github.com/unknown-nymus18</a></p>
<p>LinkedIn: <a href="http://www.linkedin.com/in/felix-asante-11882a331" target="_blank" style="color:#3b8eea;">linkedin.com/in/felix-asante</a></p>
<p>Email:    felixasante2005@gmail.com</p>
<p></p>
<p>==================================</p>`);
                break;

            case 'resume':
                commandRespond("Downloading resume...");
                setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = '../assets/Felix_Yamoah_Asante_CV.pdf';
                    link.download = 'Felix_Asante_CV.pdf';
                    link.click();
                    commandRespond("Resume downloaded!");
                }, 500);
                break;
            
            case 'about':
                commandRespond("Redirecting to about page...");
                setInterval(() => {
                    window.location.href = 'about.html';
                }, 1000);
                break;

            case 'game':
                if(input.split(' ').length > 1 && input.split(' ')[1] === 'chess'){
                    commandRespond("Launching chess game...");
                    setInterval(() => {
                        window.location.href = 'chess.html';
                    }, 1000);
                }
                break;

            case 'contact':
                // Check if there are parameters
                if(input.includes('=')){
                    // Parse key="value" pairs using regex
                    const nameMatch = input.match(/name\s*=\s*"([^"]*)"/);
                    const emailMatch = input.match(/email\s*=\s*"([^"]*)"/);
                    const messageMatch = input.match(/message\s*=\s*"([^"]*)"/);
                    
                    const name = nameMatch ? nameMatch[1] : null;
                    const email = emailMatch ? emailMatch[1] : null;
                    const message = messageMatch ? messageMatch[1] : null;
                    
                    // Check all fields are provided
                    if(!name || !email || !message){
                        commandRespond(`Missing fields. Usage: contact name="Your Name" email="your@email.com" message="Your message"`);
                        break;
                    }
                    
                    // Validate email format
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!emailRegex.test(email)){
                        commandRespond("Invalid email format.");
                        break;
                    }
                    
                    commandRespond("Sending email...");
                    
                    let templateParams = {
                        from_name: name,
                        from_email: email,
                        message: message,
                    };
                    
                    emailjs.send("service_fq0fsr6", "template_y0twnl3", templateParams)
                        .then(function(response) {
                            commandRespond("Message sent successfully!");
                            addNewInputLine();
                        })
                        .catch(function(error) {
                            commandRespond("Failed to send message: " + error.text);
                            addNewInputLine();
                        });
                    return; // Don't add input line yet, wait for email result
                }
                else{
                    commandRespond("Redirecting to contact page...");
                    setTimeout(() => {
                        window.location.href = 'contact.html';
                    }, 1000);
                }
                break;
                
            default:
                commandRespond(`Command not found: ${input}. Type 'help' for a list of commands.`);
                break;
        }
        
        addNewInputLine();
    }
    
    function addNewInputLine(){
        document.getElementById('command-box').innerHTML+=`
        <div class="command-line"> 
            <p>C:\\Users\\unknown-nymus18&gt;&nbsp;</p>
            <input type="text" class="command-input" autofocus autocomplete="off" spellcheck="false">
        </div>`;
        
        // Focus the new input
        const newInputs = document.querySelectorAll('.command-input');
        newInputs[newInputs.length - 1].focus();
    }

                
    


    function commandRespond(message){
        document.getElementById("command-box").innerHTML += `<div class="command-output">
        ${message}
        </div>`;
    }
});



