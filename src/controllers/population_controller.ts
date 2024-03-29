// TODO: put this in some general experiment repo at some point

// import CanvasController from "./canvas_controller"

// const ITER = 1000
// const WARMUP = 1000

// const LAMBDA_START = 3.4
// const LAMBDA_END = 4

// function delay(ms : number) {
//   return new Promise(r => setTimeout(r, ms))
// }

// function lerp(x : number, y : number, a : number) {
//   return x + a * (y - x)
// }

// function pop(x : number, lambda : number) {
//   return lambda * x * (1 - x)
// }

// function closeTo(x : number, y : number, delta : number = 0.0001) {
//   return Math.abs(x - y) < delta
// }

// interface TallyEntry {
//   number : number
//   count : number
// }

// class Tally {
//   entries: TallyEntry[] = []

//   clear() {
//     this.entries = []
//   }

//   record(x : number) {
//     let e = this.entries.find(n => closeTo(n.number, x))
//     if (!e) this.entries.push({ number: x, count: 1 })
//   }
// }

// export default class extends CanvasController {
//   image: ImageData | null = null

//   connect() {
//     super.connect()

//     this.image = this.ctx!.createImageData(this.width, this.height)!
//   }

//   disconnect() {
//     super.disconnect()
//     this.image = null
//   }

//   lToX(l : number) {
//     return this.width * (
//       (l - LAMBDA_START) /
//       (LAMBDA_END - LAMBDA_START)
//     )
//   }

//   xToL(x : number) {
//     return lerp(LAMBDA_START, LAMBDA_END, x / this.width)
//   }

//   async perform() {
//     if (!this.ctx) return

//     let t = new Tally()

//     this.ctx.fillStyle = 'white'
//     this.ctx.fillRect(0, 0, this.width, this.height)

//     this.ctx.strokeStyle = 'black'
//     this.ctx.beginPath();
//     for (let l = Math.floor(LAMBDA_START); l <= LAMBDA_END; l++) {
//       let x = this.lToX(l)

//       this.ctx.moveTo(x, 0)
//       this.ctx.lineTo(x, this.height)
//     }
//     this.ctx.closePath();
//     this.ctx.stroke();

//     this.ctx.fillStyle = 'red';
//     for (let x = 0; x < this.width; x++) {
//       t.clear()

//       let lamb = this.xToL(x)

//       let p = 0.5;
//       for (let i = 0; i < WARMUP; i++) {
//         p = pop(p, lamb)
//       }
//       for (let i = 0; i < ITER; i++) {
//         p = pop(p, lamb)
//         t.record(p)
//       }

//       t.entries.forEach(({ number: y }) => {
//         this.ctx!.fillRect(x - 1, this.height - y * this.height - 1, 2, 2);
//       })

//       await delay(0)
//     }
//   }
// }
