import { FrameAnimation } from './frame-animation';
import { FAST_TEST_ENABLED, normalize } from './shared';
import { THREE } from './three';
const CAMERA_RADIUS = 100;
class CameraPositionData {
    constructor() {
        this.phi = 0;
        this.theta = 0;
        this.radius = 0;
    }
}
export class CameraController {
    constructor() {
        this.native = new THREE.PerspectiveCamera(90, 1, 1, 1000);
        this.calculateMouseOffset = false;
        this.windowSizeRadiusModifier = 0;
        this.mouseOffset = new CameraPositionData();
        this.frameworkRequested = new CameraPositionData();
        this.current = new CameraPositionData();
        this.initialTheta = 0;
        this.initialAnimation = new FrameAnimation(FAST_TEST_ENABLED ? 75 : 4500, value => {
            this.frameworkRequested.radius = (1 - value) * (200 - CAMERA_RADIUS) + CAMERA_RADIUS;
            this.frameworkRequested.phi = Math.PI * .5 * .7 * value;
            this.frameworkRequested.theta = Math.PI * 2 * value;
            this.native.lookAt(0, 0, 0);
        });
        // @ts-ignore
        window.camera = this;
        this.reset();
        window.addEventListener('mousemove', event => {
            if (!this.calculateMouseOffset)
                return;
            const x = (-event.clientX / window.innerWidth + .5) * .3;
            const y = event.clientY / window.innerHeight * -.3;
            this.mouseOffset.theta = x;
            this.mouseOffset.phi = y;
        }, { passive: true });
        document.addEventListener('wheel', event => {
            if (event.deltaY > 0)
                this.mouseOffset.radius = 100;
            else if (event.deltaY < 0)
                this.mouseOffset.radius = -100;
        }, { passive: true });
        window.addEventListener('resize', () => this.calculateWindowSizeRadiusModifier(), { passive: true });
        this.calculateWindowSizeRadiusModifier();
    }
    calculateWindowSizeRadiusModifier() {
        const aspect = window.innerHeight / window.innerWidth;
        this.windowSizeRadiusModifier = aspect * aspect * aspect * 13;
    }
    set aspect(value) {
        this.native.aspect = value;
        this.native.updateProjectionMatrix();
    }
    get raw() {
        return this.native;
    }
    reset() {
        this.calculateMouseOffset = false;
        this.frameworkRequested.radius = 500;
        this.native.lookAt(0, 0, 0);
    }
    startInitialAnimation(goToBack) {
        this.calculateMouseOffset = true;
        this.initialTheta = goToBack ? Math.PI : 0;
        this.frameworkRequested.theta = Math.PI * 3 + this.initialTheta;
        this.initialAnimation.start();
    }
    // private x = 0
    doFrame() {
        this.current.radius += this.mouseOffset.radius * .03;
        this.mouseOffset.radius *= .9;
        this.current.radius = normalize(this.current.radius, -50, 50);
        this.current.theta += (this.mouseOffset.theta - this.current.theta) * .1;
        this.current.phi += (this.mouseOffset.phi - this.current.phi) * .1;
        this.native.position.setFromSphericalCoords(this.frameworkRequested.radius + this.current.radius + this.windowSizeRadiusModifier, this.frameworkRequested.phi + this.current.phi, this.initialTheta + this.frameworkRequested.theta + this.current.theta);
        // this.native.position.setFromSphericalCoords(
        // 		40,
        // 		// Math.PI,
        // 		// 0,
        // 		Math.PI * .2,
        // 	// Math.PI / 3,
        // 	// 0
        // 	this.x,
        // 	)
        // this.x += .01
        this.native.lookAt(0, 10, 0);
    }
}
