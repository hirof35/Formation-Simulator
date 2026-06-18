// 2Dベクトルを扱うためのクラス
class Vector2D {
  constructor(public x: number, public y: number) {}
  add(v: Vector2D): Vector2D { return new Vector2D(this.x + v.x, this.y + v.y); }
  sub(v: Vector2D): Vector2D { return new Vector2D(this.x - v.x, this.y - v.y); }
  mult(n: number): Vector2D { return new Vector2D(this.x * n, this.y * n); }
  div(n: number): Vector2D { return n !== 0 ? new Vector2D(this.x / n, this.y / n) : new Vector2D(0, 0); }
  mag(): number { return Math.sqrt(this.x * this.x + this.y * this.y); }
  normalize(): Vector2D { const m = this.mag(); return m > 0 ? this.div(m) : new Vector2D(0, 0); }
  setMag(len: number): Vector2D { return this.normalize().mult(len); }
  limit(max: number): Vector2D { return this.mag() > max ? this.setMag(max) : this; }
}

// 航空機クラス
class Aircraft {
  position: Vector2D; velocity: Vector2D; acceleration: Vector2D;
  maxSpeed: number = 4; maxForce: number = 0.1; r: number = 6;

  constructor(x: number, y: number) {
      this.position = new Vector2D(x, y);
      this.velocity = new Vector2D(Math.random() * 2 - 1, Math.random() * 2 - 1).setMag(this.maxSpeed);
      this.acceleration = new Vector2D(0, 0);
  }

  update() {
      this.velocity = this.velocity.add(this.acceleration).limit(this.maxSpeed);
      this.position = this.position.add(this.velocity);
      this.acceleration = this.acceleration.mult(0);
  }

  applyForce(force: Vector2D) { this.acceleration = this.acceleration.add(force); }

  arrive(target: Vector2D) {
      const desired = target.sub(this.position);
      const d = desired.mag();
      if (d < 100) {
          desired.setMag((d / 100) * this.maxSpeed);
      } else {
          desired.setMag(this.maxSpeed);
      }
      const steer = desired.sub(this.velocity).limit(this.maxForce);
      this.applyForce(steer);
  }

  draw(ctx: CanvasRenderingContext2D, isLeader: boolean = false) {
      const theta = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(theta);
      ctx.fillStyle = isLeader ? '#ff4757' : '#2ed573';
      ctx.beginPath();
      ctx.moveTo(0, -this.r * 2);
      ctx.lineTo(-this.r, this.r * 2);
      ctx.lineTo(this.r, this.r * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
  }
}

// シミュレーター管理クラス
class FormationSimulator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private leader: Aircraft;
  private followers: Aircraft[] = [];
  private formationOffsets: Vector2D[] = [
      new Vector2D(-40, 40), new Vector2D(40, 40),
      new Vector2D(-80, 80), new Vector2D(80, 80),
  ];

  constructor(canvasId: string) {
      this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      this.ctx = this.canvas.getContext('2d')!;
      this.leader = new Aircraft(this.canvas.width / 2, this.canvas.height / 2);
      this.leader.maxSpeed = 3;

      for (let i = 0; i < this.formationOffsets.length; i++) {
          this.followers.push(new Aircraft(Math.random() * this.canvas.width, Math.random() * this.canvas.height));
      }
  }

  private updateLeader(mouseX: number, mouseY: number) {
      this.leader.arrive(new Vector2D(mouseX, mouseY));
      this.leader.update();
  }

  private updateFollowers() {
      const leaderDir = this.leader.velocity.normalize();
      const leaderRight = new Vector2D(-leaderDir.y, leaderDir.x);

      this.followers.forEach((follower, index) => {
          const offset = this.formationOffsets[index];
          const slotX = this.leader.position.x + (leaderRight.x * offset.x) + (leaderDir.x * offset.y);
          const slotY = this.leader.position.y + (leaderRight.y * offset.x) + (leaderDir.y * offset.y);
          follower.arrive(new Vector2D(slotX, slotY));
          follower.update();
      });
  }

  public run(mouseX: number, mouseY: number) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.updateLeader(mouseX, mouseY);
      this.updateFollowers();
      this.leader.draw(this.ctx, true);
      this.followers.forEach(f => f.draw(this.ctx, false));
  }
}

// --- ブラウザ実行用の初期化コード ---
const sim = new FormationSimulator('stage');
let mouseX = 400;
let mouseY = 300;

window.addEventListener('mousemove', (e) => {
  const canvas = document.getElementById('stage') as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

function loop() {
  sim.run(mouseX, mouseY);
  requestAnimationFrame(loop);
}
loop();