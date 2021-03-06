import FluidSolver from './fluidSolver.js';
import FluidBoxRenderer from './fluidBoxRenderer.js';

class FluidSimulator {

  constructor(width, height, resolution, density, diffusion, viscosity, iterations){
    this.width = width;
    this.height = height;
    this.resolution = resolution;
    this.density = density || 90;

    this.startPos = [0, 0];
    this.currentPos = [0, 0];
    this.mouseIsDown = false;
    this.simulating = false;

    this.solver = new FluidSolver(resolution, iterations, viscosity, diffusion);
    this.solver.setUI(this.ui.bind(this));

    this.canvas = this.initCanvas();
    this.initControlPanel();
    this.renderer = new FluidBoxRenderer(this.canvas, this.solver);

    for(let i = 0; i < 20; i++)
      this.update();
  }

  update(){
    this.solver.update();
    this.renderer.render();
  }

  initControlPanel(){
    let $viscCtrl = $('#viscosity');
    $viscCtrl.change( e => {
      this.solver.setViscosity(parseFloat(e.target.value));
    });

    let $diffusionCtrl = $('#diffusion');
    $diffusionCtrl.change( e => {
      this.solver.setDiffusion(parseFloat(e.target.value));
    });

    let $resolutionCtrl = $('#resolution');
    $resolutionCtrl.change( e => {
      this.simulating = false;
      this.resolution = parseInt(e.target.value);
      this.solver = new FluidSolver(this.resolution);

      this.solver.setUI(this.ui.bind(this));
      this.canvas = this.initCanvas();
      this.renderer = new FluidBoxRenderer(this.canvas, this.solver);
    });

    let $iterationsCtrl = $('#iterations');
    $iterationsCtrl.change( e => {
      this.solver.setIterations(parseInt(e.target.value));
    });

    let $densityCtrl = $('#density');
    $densityCtrl.change( e => {
      this.density = parseInt(e.target.value);
    });

  }

  initCanvas(){
    let canvas = $('#fluidSimulator').get(0);

    canvas.width = canvas.height = this.resolution;
    canvas.touchend = canvas.onmouseup = this.mouseUpHandler.bind(this);
    canvas.touchstart = canvas.onmousedown = this.mouseDownHandler.bind(this);
    canvas.touchmove = canvas.onmousemove = this.mouseMoveHandler.bind(this);

    return canvas;
  }

  mouseDownHandler(e){
    e.preventDefault();
    this.startPos = this.currentPos = this.getMousePos(e);
    this.mouseIsDown = true;

    if(!this.simulating){
      this.simulating = true;
      setInterval(this.update.bind(this), 10);
    }
  }

  mouseMoveHandler(e){
    e.preventDefault();
    this.currentPos = this.getMousePos(e);
  }

  mouseUpHandler(e){
    e.preventDefault();
    this.mouseIsDown = false;
  }

  getMousePos(e){
    let posX = e.clientX - this.canvas.offsetLeft;
    let posY = e.clientY - this.canvas.offsetTop;
    return [posX, posY];
  }

  ui(fluidBox){
    let startX = this.startPos[0];
    let startY = this.startPos[1];
    let currentX = this.currentPos[0];
    let currentY = this.currentPos[1];

    if(this.inCanvas(this.startPos) && this.mouseIsDown){
      let dx = currentX - startX;
      let dy = currentY - startY;
      let d = Math.sqrt(dx * dx + dy * dy) || 0;

      for(let i = 0; i < d; i++){
        let x = Math.floor((startX + dx * (i / d)) * fluidBox.width() / this.width);
        let y = Math.floor((startY + dy * (i / d)) * fluidBox.height() / this.height);

        fluidBox.setVelocity(x, y, dx, dy);
        fluidBox.setDensity(x, y, this.density);
      }

      this.startPos = [currentX, currentY];
    }
  }

  inCanvas(pos){
    return pos[0] >= 0 && pos[0] < this.width && pos[1] >= 0 && pos[1] < this.height;
  }
}

export default FluidSimulator;
