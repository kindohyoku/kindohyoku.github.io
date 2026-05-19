// EYES Generative Design - p5.js version
// Converted from A3_hyuk.py

// Global variables
let sun_radius = 28; // 300px 캔버스에 맞춰 조정 (원본의 70 * 300/800 * 2/3)
let max_flares = 200;
let flares = [];

let background_palette = [];
let sun_palette = [];

let current_background_color = null;
let current_sun_color = null;

let canvasContainer;
let eyesCanvas;

// 색상 팔레트 생성 함수 (원본과 동일)
function generate_color_palettes() {
    background_palette = [];
    sun_palette = [];
    
    // 배경 색상 팔레트
    let base_color = [int(random(0, 255)), int(random(0, 255)), int(random(0, 255))];
    for (let i = 0; i < 5; i++) {
        background_palette.push([
            constrain(base_color[0] + int(random(-100, 0)), 0, 255),
            constrain(base_color[1] + int(random(-100, 0)), 0, 255),
            constrain(base_color[2] + int(random(-100, 0)), 0, 255)
        ]);
    }
    
    // 태양 색상 팔레트  
    base_color = [int(random(0, 255)), int(random(0, 255)), int(random(0, 255))];
    for (let i = 0; i < 5; i++) {
        sun_palette.push([
            constrain(base_color[0] + int(random(-20, 20)), 0, 255),
            constrain(base_color[1] + int(random(-20, 20)), 0, 255),
            constrain(base_color[2] + int(random(-20, 20)), 0, 255)
        ]);
    }
}

// SolarThread 클래스 정의 (원본과 동일, 스케일만 조정)
class SolarThread {
    constructor(start_angle) {
        this.progress = 0;
        this.start_angle = start_angle + random(-0.3, 0.3);
        this.thread_length = random(20, 320); // 최대 길이를 240에서 320으로 증가
        this.flare_spd = random(0.02, 0.07) * 0.07371; // 속도를 10% 줄임 (0.0819 * 0.9)
        this.thread_path = this.generate_thread_path();
        this.stroke_weight = random(1, 3) * (2/3) * 0.7; // 두께를 30% 더 줄임 (기존의 70%)
        this.color = this.generate_random_color();
    }

    generate_random_color() {
        return [
            constrain(sun_palette[0][0] + int(random(-100, 0)), 0, 255),
            constrain(sun_palette[0][1] + int(random(-100, 0)), 0, 255),
            constrain(sun_palette[0][2] + int(random(-100, 0)), 0, 255)
        ];
    }

    generate_thread_path() {
        let base_points = [];
        let angle_var = radians(random(-20, 20));
        let mid_r = sun_radius + this.thread_length * 0.5;

        for (let i = 0; i < 4; i++) {
            let t = i / 3;
            let r, angle;
            if (i === 0 || i === 3) {
                r = sun_radius;
                angle = this.start_angle + (i === 0 ? -angle_var : angle_var);
            } else {
                r = mid_r;
                angle = this.start_angle + angle_var * (t - 0.5);
            }

            let x = r * cos(angle);
            let y = r * sin(angle);
            base_points.push([x, y]);
        }
        
        return base_points;
    }

    update() {
        this.progress += this.flare_spd * random(0.6, 1.2);
    }

    display() {
        if (this.progress <= 0) {
            return;
        }
            
        let alpha = max(0, int(255 - (255 * this.progress * this.progress)));
        let steps = max(2, int(15 * this.progress));
        
        stroke(this.color[0], this.color[1], this.color[2], alpha);
        strokeWeight(this.stroke_weight * (1 - this.progress * 0.5));
        noFill();
        
        beginShape();
        for (let i = 0; i <= steps; i++) {
            let t = min(i / steps, this.progress);
            let [x, y] = this.bezier_point(t);
            vertex(x, y);
        }
        endShape();
    }

    bezier_point(t) {
        let mt = 1 - t;
        let [p0, p1, p2, p3] = this.thread_path;
        
        let x = (mt*mt*mt * p0[0] + 
                 3 * mt*mt * t * p1[0] + 
                 3 * mt * t*t * p2[0] + 
                 t*t*t * p3[0]);
                 
        let y = (mt*mt*mt * p0[1] + 
                 3 * mt*mt * t * p1[1] + 
                 3 * mt * t*t * p2[1] + 
                 t*t*t * p3[1]);
                 
        return [x, y];
    }
}

function setup() {
    // 고해상도 캔버스 생성
    pixelDensity(2); // 레티나 디스플레이 지원
    canvasContainer = select('#eyes-canvas-container');
    eyesCanvas = createCanvas(300, 300); // 더 큰 크기로 해상도 향상
    eyesCanvas.parent('eyes-canvas-container');
    
    // 초기 색상 팔레트 생성
    generate_color_palettes();
    current_background_color = random(background_palette);
    current_sun_color = random(sun_palette);
}

function draw() {
    draw_background();
    translate(width / 2, height / 2); // 캔버스가 왼쪽으로 이동했으므로 디자인은 캔버스 중앙에
    draw_sun();
    
    for (let i = flares.length - 1; i >= 0; i--) {
        flares[i].update();
        flares[i].display();
        if (flares[i].progress >= 1.2) {
            flares.splice(i, 1);
        }
    }
}

function draw_background() {
    // 단색 배경으로 변경
    let color = current_background_color;
    background(color[0], color[1], color[2]);
}

function draw_sun() {
    let color = current_sun_color;
    fill(color[0], color[1], color[2]);
    noStroke();
    circle(0, 0, sun_radius * 2);
}

function mousePressed() {
    // Check if mouse is within canvas bounds
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        if (flares.length >= max_flares) return;
        
        generate_color_palettes();
        current_background_color = random(background_palette); // 배경도 단색으로 변경
        current_sun_color = random(sun_palette);
        
        let num_threads = int(random(20, 40));
        for (let i = 0; i < num_threads; i++) {
            let angle = radians(i * (360 / num_threads));
            flares.push(new SolarThread(angle));
        }
    }
} 