const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const pencilButton = document.getElementById('pencil');
const eraserButton = document.getElementById('eraser');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearButton = document.getElementById('clear');
const saveButton = document.getElementById('save');

// Set canvas dimensions
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

// Drawing state
let isDrawing = false;
let currentTool = 'pencil';
let currentColor = '#000000';
let currentSize = 5;

// Event listeners for tools
pencilButton.addEventListener('click', () => (currentTool = 'pencil'));
eraserButton.addEventListener('click', () => (currentTool = 'eraser'));
colorPicker.addEventListener('input', (e) => (currentColor = e.target.value));
brushSize.addEventListener('input', (e) => (currentSize = e.target.value));
clearButton.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));

// Save canvas as image
saveButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'whiteboard.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Drawing functionality
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
});

canvas.addEventListener('mouseup', () => (isDrawing = false));
canvas.addEventListener('mouseout', () => (isDrawing = false));

// Real-time collaboration (using WebSocket for multiplayer)
const socket = new WebSocket('ws://your-websocket-server-url');

socket.addEventListener('open', () => {
  console.log('Connected to WebSocket server');
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  drawFromData(data);
});

function drawFromData(data) {
  ctx.strokeStyle = data.color;
  ctx.lineWidth = data.size;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(data.x1, data.y1);
  ctx.lineTo(data.x2, data.y2);
  ctx.stroke();
}

canvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    const data = {
      x1: e.offsetX - e.movementX,
      y1: e.offsetY - e.movementY,
      x2: e.offsetX,
      y2: e.offsetY,
      color: currentTool === 'eraser' ? '#ffffff' : currentColor,
      size: currentSize,
    };
    socket.send(JSON.stringify(data));
  }
});