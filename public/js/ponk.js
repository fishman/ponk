
function State() {
	this.p1x = 0;
	this.p1y = 0;
	this.ball = new Ball();
}

function Ball() {
	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = 0;
}

function handleRegister(payload) {
	console.log('register');
	// NO-OP client -> server
}

function handleStart(payload) {
	console.log('start');
	// NO-OP server -> client
}

function handlePause(payload) {
	console.log('pause');
	// NO-OP server -> client, client -> server
}

function handleRestart(payload) {
	console.log('restart');
	// NO-OP server -> client, client -> server
}

function handleStop(payload) {
	console.log('stop');
	// NO-OP server -> client
}

function handlePos(payload) {
	console.log('pos');
	// NO-OP server -> client
}

function handleWin(payload) {
	console.log('win');
	// NO-OP server -> client
}

function handleHighscore(payload) {
	console.log('highscore');
	// NO-OP server -> client
}

var dictionary = [];
dictionary['register'] = handleRegister;
dictionary['start'] = handleStart;
dictionary['pause'] = handlePause;
dictionary['restart'] = handleRestart;
dictionary['stop'] = handleStop;
dictionary['pos'] = handlePos;
dictionary['win'] = handleWin;
dictionary['highscore'] = handleHighscore;

// 2 secs to cover 640x480 at 10f/s
var game = new State();

var scoreboard = [];
var highscores = [];

var sock = new SockJS('/socks');
var renderTimer = 0;

sock.onopen = function() {
	console.log('open');
	// TODO start scoreboard
};

sock.onmessage = function(e) {
	console.log('message', e.data);
	log("Received message... " + e.data);
	var json = JSON.parse(e.data);
	var func = dictionary[json['event']];
	func(json.data);
};

sock.onclose = function() {
	console.log('close');
	stopGame();
};

$(document).ready( function() {
	// TODO load game status from cookie
	var username = ''; // $.cookie("ponk-username");
	if (game.status == 2) {
		restartGame();
	}
	else if (game.status == 1) {
		startGame();
	}
	else {
		if (username != null && username != '') {
			$("input#username").val(username);
		}
		$('#login-window').show();
	}
});

$('#signin-button').click( function() {
	$('#signin').submit();
});

$('#signin').submit( function() {
	var username = $("input#username").val();
	if (username == null || username == '') {
		return false;
	}

	// $.cookie("ponk-username", username, { expires: 7 });
	$('#login-window').hide();
	$('#log-window').show();

	log("Sending username...");
        sock.send(event('register', username));

	// temp testing, for renderer
	$('#game-window').show();
	initGame();
	render();

	return false;
});


function event(type, data) {
  return JSON.stringify({'event': type, 'data': data});
}

function startGame() {
  game.status = 1;
  renderTimer = setInterval('render()', 500);
}

function restartGame() {
	// TODO kill & restart render timer
  game.status = 1;
  renderTimer = setInterval('render()', 500);
}

function pauseGame() {
	// TODO send pause request
  game.status = 2;
  clearInterval(renderTimer);
}

function stopGame() {
	// TODO kill render timer
  game.status = 0;
  clearInterval(renderTimer);
}

function initGame() {
	//
}

function render() {
	// TODO find localPlayer
	var canvas = document.getElementById('game-field'); // jquery didn't find this
	var context = canvas.getContext('2d');
	// field is 400 high & 600 wide
	// context.fillRect(x, y, w, h);
	var offset = 10;
	var paddleWidth = 10;
	var localH = 80;
	var remoteH = 80;

	var localX = offset;
	var remoteX = canvas.width - (offset + paddleWidth);

	var localY = canvas.height/2 - (localH/2); // temp, needs further calc
	var remoteY = canvas.height/2 - (remoteH/2); // temp, needs further calc

	context.fillStyle = '#cc9999';
	context.fillRect(localX, localY, paddleWidth, localH);
	context.fillStyle = '#9999cc';
	context.fillRect(remoteX, remoteY, paddleWidth, remoteH);

	context.fillStyle = '#333333';

	// ontext.arc(x, y, r, n, Math.PI*2, true);
	var ballX = canvas.width/2;
	var ballY = canvas.height/2;
	drawBall(context, ballX, ballY);
}

function drawBall(context, x, y) {
	var radius = 10;
	var startAngle = 0;
	var endAngle = Math.PI*2;
	var antiClockwise = true;
	context.beginPath();
	context.arc(x, y, radius, startAngle, endAngle, antiClockwise);
	context.closePath();
	context.fill();
}

function log(msg) {
	$('#log-window').append('<p>' + msg + '</p>');
}
