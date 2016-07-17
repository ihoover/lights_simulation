var c;
var pos; //position
var vel; //velocities
var n = 61;
var mouse_x;
var mouse_y;
var mouse_threshold = 50;
var interval = 12;
var spring_const = 200;
var mass = 1;
var gravity = -200;
var friction1 = .2;
var lpass_length = 20;
var inputs;
var smoothing_kernel = [Math.pow(Math.E, -9), Math.pow(Math.E, -4), Math.pow(Math.E, -1), Math.pow(Math.E, 0), Math.pow(Math.E, -1), Math.pow(Math.E, -4), Math.pow(Math.E, -9)]; // must be odd length!

if (Math.round((smoothing_kernel.length - 1) / 2) != (smoothing_kernel.length - 1) / 2) {
    alert("Smoothing kernel must be odd in length!");
}

var sum = 0;
for (var index = 0; index < smoothing_kernel.length; index++){
    sum += smoothing_kernel[index];
}
for (var index = 0; index < smoothing_kernel.length; index++){
    smoothing_kernel[index] = smoothing_kernel[index]/sum;
}

function zeros(len) {
    var res = new Array(len);
    for (var i = 0; i < len; i++){
        res[i] = 0;
    }
    
    return res;
}

function load() {
    document.onmousemove = handleMouseMove;
    c = document.getElementById("myCanvas");
    pos = zeros(n);
    vel = zeros(n);
    inputs = zeros(lpass_length);
    
    main();
}

function main() {
    var mid = Math.floor(n / 2);
    pos[mid] = getInput();
    
    update_vel();
    vel[mid] = 0;
    update_pos();
    display();
    window.setTimeout(main, interval);
}

function update_vel() {
    for (var i = 0; i < vel.length; i++){
        vel[i] += netYForce(i) * (interval / 1000)/mass;
    }
}

function update_pos() {
    for (var i = 0; i < pos.length; i++){
        pos[i] += vel[i] * (interval / 1000);
        if (pos[i] < 0) {
            pos[i] = 0;
            vel[i] = 0;
        }
    }
}

function netYForce(i) {
    var leftY;
    var rightY;
    if (i == 0) {
        leftY = 0;
    } else
        leftY = pos[i - 1]
    
    if (i == pos.length - 1) {
        rightY = 0;
    } else
        rightY = pos[i + 1]
        
    var dx = c.width / pos.length; // the sign doesn't matter, its the same in both directions, and we only care about virticle force
    
    var right_dy = rightY - pos[i];
    var left_dy = leftY - pos[i];
    
    var dist_right = Math.sqrt(dx * dx + right_dy * right_dy);
    var dist_left = Math.sqrt(dx * dx + left_dy * left_dy);
    
    var force_right = (dist_right - dx) * spring_const; // dx is the rtest length of the spring, as it were
    var force_left = (dist_left - dx) * spring_const;
    
    var force_right_y = force_right * Math.sin(Math.atan(right_dy / dx));
    var force_left_y = force_left * Math.sin(Math.atan(left_dy / dx));
    
    return force_left_y + force_right_y + gravity * mass - friction1 * vel[i];
}

function display() {
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath();
    ctx.moveTo(0, mouse_threshold);
    ctx.lineTo(c.width, mouse_threshold);
    ctx.stroke();
    ctx.font = "15px Georgia";

    var size = 10;
    var h = c.height;
    var w = c.width;
    var x = 0;
    var y = 0;
    var value = 0; //effective value after smoothing
    
    // gap for smoothing function
    var gap = (smoothing_kernel.length - 1) / 2;
    
    
    
    for (var i = gap; i < pos.length - gap; i++){
        
        // these are the centers
        x = (i  - gap + 0.5) * (w / (pos.length - 2*gap));
        
        value = 0;
        for (var k = 0; k < smoothing_kernel.length; k++){
            value += smoothing_kernel[k] * pos[i + k - gap];
        }
        
        y = h - value;
        
        ctx.fillRect(x - size / 2, y - size / 2, 10, 10);
        // ctx.fillText(Math.round(netYForce(i) * 10) / 10, x - size / 2, y - size / 2 - 20);
        // ctx.fillText(Math.round(pos[i] * 10) / 10, x - size / 2, y - size / 2 - 40);
        
    }
    
}

function handleMouseMove(event) {
    mouse_x = event.pageX;
    mouse_y = event.pageY;
}

function getInput() {
    var new_input;
    if (mouse_y > mouse_threshold && mouse_y < c.height)
        new_input = mouse_y - mouse_threshold;
    else if(mouse_y <= mouse_threshold || !mouse_y)
        new_input = 0;
    else
        new_input = c.height - mouse_threshold;
    
    if (inputs.length > 1) {
        for (var i = inputs.length-1; i > 0; i--){
            inputs[i] = inputs[i-1]
        }
    }
    inputs[0] = new_input;
    
    var ave = 0;
    for (var i = 0; i < inputs.length; i++){
        ave += inputs[i]/inputs.length;
    }
    return ave;
}