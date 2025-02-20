




function screenGame(){
    // Create the square
    var square = document.createElement('div');
    square.style.width = '100px';
    square.style.height = '100px';
    square.style.backgroundColor = 'grey';
    square.id = 'square1';
    document.body.appendChild(square);

    // Create the buttons
    var colors = ['red', 'green', 'blue'];
    colors.forEach(function(color) {
        var button = document.createElement('button');
        button.id = color;
        button.textContent = color.charAt(0).toUpperCase() + color.slice(1); // Capitalize the first letter
        button.style.backgroundColor = color;
        button.onclick = function() {
            console.log(`Emitting color: ${color}`);
            socket.emit('user_emit', ['color_change', color]);
        };
        document.body.appendChild(button);
    });

    var button = document.createElement('button');
    button.id = 'clear';
    button.textContent = 'Clear'; // Capitalize the first letter
    button.onclick = function() {
        clearBody();
    };
    document.body.appendChild(button);
}




socket.on('color_change', function(elements) {
    color = elements[0]
    console.log(`Changing square color to: ${color}`);
    square.style.backgroundColor = color;
});

socket.on('connect', function() {
    console.log('Connected to the server.');  // Debug: log successful connection
});

socket.on('disconnect', function() {
    console.log('Disconnected from the server.');  // Debug: log disconnection
});

socket.on('connect_error', function(error) {
    console.log('Connection failed: ' + error);  // Debug: log connection errors
});
