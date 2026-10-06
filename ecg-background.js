(function () {
    const canvas = document.querySelector('.ecg-live-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });

    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;
    let animationFrame = null;
    let accumulatedOffset = 0;
    let lastFrameTime = 0;
    let isPageVisible = true;
    let isPausedByModal = false;

    // Offscreen canvas for caching static grid lines
    let gridCanvas = null;

    function gaussian(value, center, width, amplitude) {
        const distance = (value - center) / width;
        return amplitude * Math.exp(-0.5 * distance * distance);
    }

    function ecgBeat(phase) {
        return (
            gaussian(phase, 0.15, 0.026, 0.13) -
            gaussian(phase, 0.31, 0.011, 0.18) +
            gaussian(phase, 0.36, 0.0055, 1.68) -
            gaussian(phase, 0.40, 0.013, 0.46) +
            gaussian(phase, 0.64, 0.075, 0.27)
        );
    }

    function buildGridCache() {
        if (!gridCanvas) {
            gridCanvas = document.createElement('canvas');
        }
        gridCanvas.width = canvas.width;
        gridCanvas.height = canvas.height;
        const gctx = gridCanvas.getContext('2d');
        gctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const majorStep = Math.max(46, Math.round(cssWidth / 18));
        const minorStep = majorStep / 5;

        gctx.clearRect(0, 0, cssWidth, cssHeight);

        // Minor grid lines
        gctx.globalAlpha = 0.30;
        gctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
        gctx.lineWidth = 1;
        gctx.beginPath();
        for (let x = 0; x <= cssWidth; x += minorStep) {
            gctx.moveTo(x, 0);
            gctx.lineTo(x, cssHeight);
        }
        for (let y = 0; y <= cssHeight; y += minorStep) {
            gctx.moveTo(0, y);
            gctx.lineTo(cssWidth, y);
        }
        gctx.stroke();

        // Major grid lines
        gctx.globalAlpha = 0.50;
        gctx.strokeStyle = 'rgba(239, 68, 68, 0.28)';
        gctx.lineWidth = 1;
        gctx.beginPath();
        for (let x = 0; x <= cssWidth; x += majorStep) {
            gctx.moveTo(x, 0);
            gctx.lineTo(x, cssHeight);
        }
        for (let y = 0; y <= cssHeight; y += majorStep) {
            gctx.moveTo(0, y);
            gctx.lineTo(cssWidth, y);
        }
        gctx.stroke();
    }

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        // Keep DPR strictly capped to 1.0 on mobile / 1.5 on desktop for peak 60fps rendering without heat/hang
        const isMobile = window.innerWidth <= 768;
        dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
        cssWidth = Math.max(320, rect.width || window.innerWidth);
        cssHeight = Math.max(140, rect.height || 220);

        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        buildGridCache();
    }

    function yAt(position, offset) {
        const beatWidth = Math.max(230, cssWidth * 0.34);
        const shifted = position + offset;
        const phase = ((shifted % beatWidth) + beatWidth) % beatWidth / beatWidth;
        const baseline = cssHeight * 0.52;
        const amplitude = Math.min(76, cssHeight * 0.32);
        const monitorDrift = Math.sin(shifted * 0.014 + phase * Math.PI * 4) * 0.9;
        const microNoise = Math.sin(shifted * 0.19) * 0.18 + Math.cos(shifted * 0.11) * 0.12;

        return baseline - ecgBeat(phase) * amplitude + monitorDrift + microNoise;
    }

    function strokeWave(offset, alpha, lineWidth, step) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        const stride = step || 3;
        for (let pointX = -4; pointX <= cssWidth + 4; pointX += stride) {
            const pointY = yAt(pointX, offset);
            if (pointX === -4) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        }

        ctx.stroke();
        ctx.restore();
    }

    function drawScanner(offset) {
        const beatWidth = Math.max(230, cssWidth * 0.34);
        const leadX = cssWidth - (offset % beatWidth);
        const x = ((leadX % cssWidth) + cssWidth) % cssWidth;
        const y = yAt(x, offset);

        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(220, 38, 38, 0.95)';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawFrame(now) {
        if (!isPageVisible || isPausedByModal) {
            animationFrame = null;
            return;
        }

        if (!lastFrameTime) lastFrameTime = now;
        const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
        lastFrameTime = now;

        const speed = Math.max(90, cssWidth / 7.2);
        accumulatedOffset += delta * speed;

        const beatWidth = Math.max(230, cssWidth * 0.34);
        if (accumulatedOffset > beatWidth * 1000) {
            accumulatedOffset = accumulatedOffset % (beatWidth * 1000);
        }

        ctx.clearRect(0, 0, cssWidth, cssHeight);
        if (gridCanvas) {
            ctx.drawImage(gridCanvas, 0, 0, cssWidth, cssHeight);
        }

        // Live ECG pulses and wave - optimized, no canvas shadowBlur
        strokeWave(accumulatedOffset, 0.28, 4.5, 3.5);
        strokeWave(accumulatedOffset, 0.95, 2.4, 2);
        drawScanner(accumulatedOffset);

        animationFrame = requestAnimationFrame(drawFrame);
    }

    function start() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        lastFrameTime = 0;

        if (isPageVisible && !isPausedByModal) {
            animationFrame = requestAnimationFrame(drawFrame);
        }
    }

    // Modal state integration: pause/resume to save 100% resources while user is in calculators
    window.pauseEcgAnimation = function () {
        isPausedByModal = true;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    };

    window.resumeEcgAnimation = function () {
        isPausedByModal = false;
        if (isPageVisible && !animationFrame) {
            lastFrameTime = 0;
            animationFrame = requestAnimationFrame(drawFrame);
        }
    };

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            isPageVisible = false;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
        } else {
            isPageVisible = true;
            lastFrameTime = 0;
            if (!isPausedByModal && !animationFrame) {
                animationFrame = requestAnimationFrame(drawFrame);
            }
        }
    });

    let resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resizeCanvas();
            start();
        }, 120);
    }, { passive: true });

    resizeCanvas();
    start();
})();
