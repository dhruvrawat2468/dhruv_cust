class PhysicsEngine {
    constructor() {
      this.ball = document.querySelector('.ball');
      this.blockTop = document.querySelector('.block-top');
      this.ballSize = 40; // Size of the ball
      this.y = 100; // Initial vertical position
      this.velocity = 0; // Initial velocity
      this.gravity = 0.8; // Gravity effect
      this.bounce = -0.7; // Bounce factor
      this.damping = 0.9; // Damping factor
      this.isCompressed = false; // Compression state
  
      this.init();
    }
  
    init() {
      this.animate();
    }
  
    animate() {
      this.applyPhysics();
      this.updateBall();
      this.applySquash();
      requestAnimationFrame(this.animate.bind(this));
    }
  
    applyPhysics() {
      this.velocity += this.gravity; // Apply gravity
      this.y += this.velocity; // Update position
  
      const blockRect = this.blockTop.getBoundingClientRect();
      const ballBottom = this.y + this.ballSize;
  
      // Check for collision with the block
      if (ballBottom > blockRect.top && 
          this.y < blockRect.bottom &&
          this.ball.offsetLeft + this.ballSize > blockRect.left &&
          this.ball.offsetLeft < blockRect.right) {
        
        this.velocity *= this.bounce; // Reverse velocity on bounce
        this.y = blockRect.top - this.ballSize; // Reset position to on top of block
        this.compressBlock(); // Compress the block
      }
  
      // If the ball goes below the block, reset its position to the block's top
      if (this.y > window.innerHeight) {
        this.y = blockRect.top - this.ballSize; // Reset to just above the block
        this.velocity = 0; // Reset velocity
      }
    }
  
    updateBall() {
      this.ball.style.transform = `translate(-50%, ${this.y}px)`;
    }
  
    applySquash() {
      const squash = Math.min(Math.abs(this.velocity * 0.1), 0.5);
      this.ball.style.transform += ` scale(${1 + squash}, ${1 - squash})`;
    }
  
    compressBlock() {
      this.blockTop.style.transform = `rotateX(20deg) scaleY(0.6)`;
      setTimeout(() => {
        this.blockTop.style.transform = 'rotateX(20deg)';
      }, 300);
    }
  }
  
  // Instantiate the PhysicsEngine class
  new PhysicsEngine();