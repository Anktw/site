"use client";

import { useEffect, useRef } from "react";

type NetworkState = {
  layerSizes: number[];
  weights: number[][][];
  biases: number[][];
  activations: number[][];
  preActivations: number[][];
  nodePositions: { x: number; y: number }[][];
};

type GradientState = {
  w: number;
  b: number;
  history: { w: number; b: number; loss: number }[];
};

type LogisticPoint = {
  x: number;
  y: number;
  label: 0 | 1;
};

type LogisticState = {
  w1: number;
  w2: number;
  b: number;
  points: LogisticPoint[];
};

type KMeansState = {
  points: { x: number; y: number }[];
  centroids: { x: number; y: number }[];
  assignments: number[];
};

type Mode = {
  name: string;
  formula: string;
  draw: (time: number, normalizedPointerX: number, normalizedPointerY: number) => void;
};

const MODE_TRANSITION_MS = 1200;

const relu = (value: number): number => Math.max(0, value);
const sigmoid = (value: number): number => 1 / (1 + Math.exp(-value));

const randomWeight = (fanIn: number): number => {
  const heScale = Math.sqrt(2 / Math.max(1, fanIn));
  return (Math.random() * 2 - 1) * heScale * 2.2;
};

const randomBias = (): number => (Math.random() * 2 - 1) * 0.9;

function randomModeDurationMs(): number {
  return 10000 + Math.random() * 10000;
}

function createNetwork(layerSizes: number[]): NetworkState {
  const weights: number[][][] = [];
  const biases: number[][] = [];

  for (let layer = 0; layer < layerSizes.length - 1; layer += 1) {
    const inputSize = layerSizes[layer];
    const outputSize = layerSizes[layer + 1];

    weights.push(
      Array.from({ length: outputSize }, () =>
        Array.from({ length: inputSize }, () => randomWeight(inputSize))
      )
    );

    biases.push(Array.from({ length: outputSize }, () => randomBias()));
  }

  return {
    layerSizes,
    weights,
    biases,
    activations: layerSizes.map((size) => Array.from({ length: size }, () => 0)),
    preActivations: layerSizes.map((size) => Array.from({ length: size }, () => 0)),
    nodePositions: layerSizes.map((size) =>
      Array.from({ length: size }, () => ({ x: 0, y: 0 }))
    ),
  };
}

function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) => {
    let sum = 0;
    for (let index = 0; index < row.length; index += 1) {
      sum += row[index] * vector[index];
    }
    return sum;
  });
}

function forwardPass(
  network: NetworkState,
  inputVector: number[],
  smoothing = 0.24
): void {
  network.activations[0] = inputVector;
  network.preActivations[0] = inputVector;

  for (let layer = 0; layer < network.layerSizes.length - 1; layer += 1) {
    const weighted = multiplyMatrixVector(network.weights[layer], network.activations[layer]);
    const z = weighted.map((value, index) => value + network.biases[layer][index]);

    const nextActivation = z.map((value) =>
      layer === network.layerSizes.length - 2 ? sigmoid(value) : relu(value)
    );

    const currentActivation = network.activations[layer + 1];
    const smoothed = currentActivation.map(
      (value, index) => value + (nextActivation[index] - value) * smoothing
    );

    network.preActivations[layer + 1] = z;
    network.activations[layer + 1] = smoothed;
  }
}

function updateNodeLayout(
  network: NetworkState,
  width: number,
  height: number,
  horizontalPadding = 130,
  verticalPadding = 100
): void {
  const availableWidth = Math.max(1, width - horizontalPadding * 2);
  const availableHeight = Math.max(1, height - verticalPadding * 2);
  const layerCount = network.layerSizes.length;

  for (let layer = 0; layer < layerCount; layer += 1) {
    const nodeCount = network.layerSizes[layer];
    const x =
      layerCount === 1
        ? width / 2
        : horizontalPadding + (availableWidth * layer) / (layerCount - 1);

    const gap = nodeCount > 1 ? availableHeight / (nodeCount - 1) : 0;

    for (let node = 0; node < nodeCount; node += 1) {
      const y =
        nodeCount === 1
          ? height / 2
          : verticalPadding + (height - verticalPadding * 2 - gap * (nodeCount - 1)) / 2 + gap * node;

      network.nodePositions[layer][node] = { x, y };
    }
  }
}

function computeLoss(w: number, b: number, targetW: number, targetB: number): number {
  return 0.5 * (w - targetW) ** 2 + 0.5 * (b - targetB) ** 2;
}

function computeGradient(w: number, b: number, targetW: number, targetB: number): { dw: number; db: number } {
  return { dw: w - targetW, db: b - targetB };
}

function gaussianRandom(mean: number, std: number): number {
  const u1 = Math.max(Number.EPSILON, Math.random());
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * std;
}

function createLogisticPoints(): LogisticPoint[] {
  const points: LogisticPoint[] = [];

  for (let index = 0; index < 28; index += 1) {
    points.push({
      x: gaussianRandom(-0.5, 0.28),
      y: gaussianRandom(-0.25, 0.25),
      label: 0,
    });
    points.push({
      x: gaussianRandom(0.55, 0.27),
      y: gaussianRandom(0.3, 0.24),
      label: 1,
    });
  }

  return points;
}

function nearestCentroidIndex(
  point: { x: number; y: number },
  centroids: { x: number; y: number }[]
): number {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < centroids.length; index += 1) {
    const centroid = centroids[index];
    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
}

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallDevice = window.matchMedia("(max-width: 768px)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const layerSizes = isSmallDevice ? [3, 5, 4, 2] : [4, 6, 5, 3];
    const network = createNetwork(layerSizes);
    const gradientState: GradientState = {
      w: -1.7,
      b: 1.4,
      history: [],
    };
    const logisticState: LogisticState = {
      w1: 1.15,
      w2: -1.05,
      b: -0.25,
      points: createLogisticPoints(),
    };
    const kMeansState: KMeansState = {
      points: [
        ...Array.from({ length: isSmallDevice ? 10 : 14 }, () => ({
          x: gaussianRandom(-0.75, 0.23),
          y: gaussianRandom(-0.42, 0.2),
        })),
        ...Array.from({ length: isSmallDevice ? 10 : 14 }, () => ({
          x: gaussianRandom(0, 0.24),
          y: gaussianRandom(0.72, 0.2),
        })),
        ...Array.from({ length: isSmallDevice ? 10 : 14 }, () => ({
          x: gaussianRandom(0.82, 0.22),
          y: gaussianRandom(-0.22, 0.22),
        })),
      ],
      centroids: [
        { x: -0.9, y: -0.5 },
        { x: 0, y: 0.8 },
        { x: 0.9, y: -0.2 },
      ],
      assignments: [],
    };

    const pointer = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      influence: 0,
    };

    let rafId = 0;
    let resizeRaf = 0;
    let width = 0;
    let height = 0;
    let lastRenderMs = 0;
    let currentModeIndex = 0;
    let previousModeIndex: number | null = null;
    let transitionStartTimeMs = 0;
    let modeStartTimeMs = performance.now();
    let modeDurationMs = randomModeDurationMs();

    const inputState = Array.from({ length: layerSizes[0] }, (_, index) =>
      gaussianRandom(0, 0.18 + index * 0.02)
    );

    const drawModeLabel = (title: string, formula: string, alpha = 1) => {
      const labelX = isSmallDevice ? 16 : 24;
      const titleY = height - (isSmallDevice ? 26 : 32);
      const formulaY = height - (isSmallDevice ? 10 : 14);

      context.fillStyle = `rgba(226, 232, 240, ${0.9 * alpha})`;
      context.font = "600 11px Inter, system-ui, sans-serif";
      context.textAlign = "left";
      context.fillText(title, labelX, titleY);

      context.fillStyle = `rgba(186, 199, 214, ${0.86 * alpha})`;
      context.font = "500 10px Inter, system-ui, sans-serif";
      context.fillText(formula, labelX, formulaY);
    };

    const drawModeAtAlpha = (
      modeIndex: number,
      alpha: number,
      time: number,
      normalizedPointerX: number,
      normalizedPointerY: number
    ) => {
      if (alpha <= 0) {
        return;
      }

      context.save();
      context.globalAlpha = Math.min(1, Math.max(0, alpha));
      const mode = modes[modeIndex];
      mode.draw(time, normalizedPointerX, normalizedPointerY);
      context.restore();
    };

    const resetModeState = (modeIndex: number) => {
      if (modeIndex === 1) {
        gradientState.w = -1.7;
        gradientState.b = 1.4;
        gradientState.history = [];
        return;
      }

      if (modeIndex === 2) {
        logisticState.w1 = gaussianRandom(0.9, 0.12);
        logisticState.w2 = gaussianRandom(-0.9, 0.12);
        logisticState.b = gaussianRandom(-0.1, 0.08);
        logisticState.points = createLogisticPoints();
        return;
      }

      if (modeIndex === 3) {
        const basePoints = [
          ...Array.from({ length: isSmallDevice ? 10 : 14 }, () => ({
            x: gaussianRandom(-0.75, 0.23),
            y: gaussianRandom(-0.42, 0.2),
          })),
          ...Array.from({ length: isSmallDevice ? 10 : 14 }, () => ({
            x: gaussianRandom(0, 0.24),
            y: gaussianRandom(0.72, 0.2),
          })),
          ...Array.from({ length: isSmallDevice ? 10 : 14 }, () => ({
            x: gaussianRandom(0.82, 0.22),
            y: gaussianRandom(-0.22, 0.22),
          })),
        ];

        kMeansState.points = basePoints;
        kMeansState.centroids = [
          { ...basePoints[0] },
          { ...basePoints[Math.floor(basePoints.length / 3)] },
          { ...basePoints[Math.floor((basePoints.length * 2) / 3)] },
        ];
        kMeansState.assignments = [];
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateNodeLayout(network, width, height, isSmallDevice ? 60 : 130, isSmallDevice ? 60 : 100);
    };

    const onResize = () => {
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
      }

      resizeRaf = requestAnimationFrame(resize);
    };

    const onPointerMove = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.influence = 0.75;
    };

    const drawNeuralNetwork = (time: number, normalizedPointerX: number, normalizedPointerY: number) => {
      const input = inputState.map((value, index) => {
        const left = index > 0 ? inputState[index - 1] : 0;
        const right = index < inputState.length - 1 ? inputState[index + 1] : 0;
        const forcing = 0.15 * Math.sin(time * 0.52 + index * 0.6);
        const pointerTerm =
          0.2 * pointer.influence *
          (normalizedPointerX * Math.cos(index + 0.4) + normalizedPointerY * Math.sin(index + 1.1));

        const nextValue = Math.tanh(0.7 * value + 0.14 * (left + right) + forcing + pointerTerm);
        inputState[index] = nextValue;
        return nextValue;
      });

      forwardPass(network, input, prefersReducedMotion ? 0.38 : 0.16);

      const edgeBaseAlpha = 0.08;
      const edgePulseScale = prefersReducedMotion ? 0.08 : 0.16;

      for (let layer = 0; layer < network.layerSizes.length - 1; layer += 1) {
        const sourceNodes = network.nodePositions[layer];
        const targetNodes = network.nodePositions[layer + 1];
        const weightMatrix = network.weights[layer];
        const sourceActivations = network.activations[layer];
        const targetActivations = network.activations[layer + 1];

        for (let target = 0; target < targetNodes.length; target += 1) {
          for (let source = 0; source < sourceNodes.length; source += 1) {
            const weight = weightMatrix[target][source];
            const flowSignal = Math.abs(sourceActivations[source] * weight * targetActivations[target]);
            const weightStrength = Math.min(1, Math.abs(weight) / 1.8);
            const alpha = Math.min(0.34, edgeBaseAlpha + (flowSignal * 0.7 + weightStrength * 0.3) * edgePulseScale);

            context.strokeStyle = `rgba(186, 210, 232, ${alpha})`;
            context.lineWidth = 0.75 + flowSignal * 0.7 + weightStrength * 0.5;
            context.beginPath();
            context.moveTo(sourceNodes[source].x, sourceNodes[source].y);
            context.lineTo(targetNodes[target].x, targetNodes[target].y);
            context.stroke();
          }
        }
      }

      for (let layer = 0; layer < network.nodePositions.length; layer += 1) {
        for (let node = 0; node < network.nodePositions[layer].length; node += 1) {
          const { x, y } = network.nodePositions[layer][node];
          const activation = network.activations[layer][node] || 0;
          const intensity = Math.min(1, Math.abs(activation));
          const radius = 2.4 + intensity * 2.1;

          context.shadowBlur = 2 + intensity * 4;
          context.shadowColor = "rgba(148, 163, 184, 0.16)";
          context.fillStyle = `rgba(226, 232, 240, ${0.15 + intensity * 0.22})`;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      context.shadowBlur = 0;
      context.textAlign = "left";
      context.font = "500 11px Inter, system-ui, sans-serif";
      context.fillStyle = "rgba(186, 199, 214, 0.3)";
      context.fillText("y = σ(Wx + b)", isSmallDevice ? 16 : 24, isSmallDevice ? 26 : 36);

      context.textAlign = "right";
      context.fillStyle = "rgba(186, 199, 214, 0.26)";
      context.fillText("h = ReLU(Wx + b)", width - (isSmallDevice ? 16 : 24), height - (isSmallDevice ? 16 : 24));
    };

    const drawGradientDescent = (normalizedPointerX: number, normalizedPointerY: number) => {
      const minParam = -2.5;
      const maxParam = 2.5;
      const left = isSmallDevice ? 28 : 52;
      const right = width - (isSmallDevice ? 28 : 52);
      const top = isSmallDevice ? 34 : 44;
      const bottom = height - (isSmallDevice ? 38 : 52);
      const targetW = 0.85 + normalizedPointerX * 0.15 * pointer.influence;
      const targetB = -0.9 + normalizedPointerY * 0.15 * pointer.influence;

      const toX = (w: number) => left + ((w - minParam) / (maxParam - minParam)) * (right - left);
      const toY = (b: number) => bottom - ((b - minParam) / (maxParam - minParam)) * (bottom - top);

      const scaleX = (right - left) / (maxParam - minParam);
      const scaleY = (bottom - top) / (maxParam - minParam);
      const centerX = toX(targetW);
      const centerY = toY(targetB);
      const contourLevels = [0.2, 0.45, 0.8, 1.25, 1.8];

      for (let index = 0; index < contourLevels.length; index += 1) {
        const level = contourLevels[index];
        const radiusParam = Math.sqrt(2 * level);

        context.strokeStyle = `rgba(148, 163, 184, ${0.08 + index * 0.04})`;
        context.lineWidth = 1;
        context.beginPath();
        context.ellipse(centerX, centerY, radiusParam * scaleX, radiusParam * scaleY, 0, 0, Math.PI * 2);
        context.stroke();
      }

      context.fillStyle = "rgba(226, 232, 240, 0.66)";
      context.beginPath();
      context.arc(centerX, centerY, 2.4, 0, Math.PI * 2);
      context.fill();

      const lr = prefersReducedMotion ? 0.07 : 0.09;
      const grad = computeGradient(gradientState.w, gradientState.b, targetW, targetB);
      gradientState.w -= lr * grad.dw;
      gradientState.b -= lr * grad.db;
      gradientState.w = Math.max(minParam, Math.min(maxParam, gradientState.w));
      gradientState.b = Math.max(minParam, Math.min(maxParam, gradientState.b));

      const currentLoss = computeLoss(gradientState.w, gradientState.b, targetW, targetB);
      gradientState.history.push({ w: gradientState.w, b: gradientState.b, loss: currentLoss });
      if (gradientState.history.length > 90) {
        gradientState.history.shift();
      }

      context.strokeStyle = "rgba(186, 210, 232, 0.62)";
      context.lineWidth = 1.7;
      context.beginPath();
      for (let index = 0; index < gradientState.history.length; index += 1) {
        const point = gradientState.history[index];
        const x = toX(point.w);
        const y = toY(point.b);
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      context.stroke();

      const currentX = toX(gradientState.w);
      const currentY = toY(gradientState.b);

      context.shadowBlur = 9;
      context.shadowColor = "rgba(148, 163, 184, 0.38)";
      context.fillStyle = "rgba(226, 232, 240, 0.82)";
      context.beginPath();
      context.arc(currentX, currentY, 3.8, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      context.textAlign = "left";
      context.font = "500 11px Inter, system-ui, sans-serif";
      context.fillStyle = "rgba(186, 199, 214, 0.56)";
      context.fillText("L(w,b) = 1/2[(w-w*)² + (b-b*)²]", isSmallDevice ? 16 : 24, isSmallDevice ? 26 : 36);

      context.textAlign = "right";
      context.fillStyle = "rgba(186, 199, 214, 0.52)";
      context.fillText("θ = θ - η∇L", width - (isSmallDevice ? 16 : 24), height - (isSmallDevice ? 16 : 24));
    };

    const drawLogisticRegression = () => {
      const left = isSmallDevice ? 34 : 72;
      const right = width - (isSmallDevice ? 34 : 72);
      const top = isSmallDevice ? 70 : 100;
      const bottom = height - (isSmallDevice ? 70 : 100);
      const toX = (value: number) => left + ((value + 1.25) / 2.5) * (right - left);
      const toY = (value: number) => bottom - ((value + 1.25) / 2.5) * (bottom - top);

      const lr = prefersReducedMotion ? 0.04 : 0.06;
      let gradW1 = 0;
      let gradW2 = 0;
      let gradB = 0;

      for (const point of logisticState.points) {
        const score = logisticState.w1 * point.x + logisticState.w2 * point.y + logisticState.b;
        const pred = sigmoid(score);
        const error = pred - point.label;
        gradW1 += error * point.x;
        gradW2 += error * point.y;
        gradB += error;
      }

      const invCount = 1 / logisticState.points.length;
      logisticState.w1 -= lr * gradW1 * invCount;
      logisticState.w2 -= lr * gradW2 * invCount;
      logisticState.b -= lr * gradB * invCount;

      for (const point of logisticState.points) {
        const score = logisticState.w1 * point.x + logisticState.w2 * point.y + logisticState.b;
        const pred = sigmoid(score);
        const confidence = Math.abs(pred - 0.5) * 2;
        const x = toX(point.x);
        const y = toY(point.y);

        const intensity = 0.28 + confidence * 0.42;
        context.fillStyle = point.label === 1 ? `rgba(200, 210, 235, ${intensity})` : `rgba(160, 176, 196, ${intensity})`;
        context.beginPath();
        context.arc(x, y, 2.4, 0, Math.PI * 2);
        context.fill();
      }

      context.strokeStyle = "rgba(226, 232, 240, 0.66)";
      context.lineWidth = 1.8;
      const x1 = -1.25;
      const x2 = 1.25;
      const safeW2 = Math.abs(logisticState.w2) < 0.08 ? 0.08 * Math.sign(logisticState.w2 || 1) : logisticState.w2;
      const y1 = -(logisticState.w1 * x1 + logisticState.b) / safeW2;
      const y2 = -(logisticState.w1 * x2 + logisticState.b) / safeW2;
      context.beginPath();
      context.moveTo(toX(x1), toY(y1));
      context.lineTo(toX(x2), toY(y2));
      context.stroke();

      context.textAlign = "right";
      context.font = "500 11px Inter, system-ui, sans-serif";
      context.fillStyle = "rgba(186, 199, 214, 0.52)";
      context.fillText("σ(z) = 1 / (1 + e^-z)", width - (isSmallDevice ? 16 : 24), height - (isSmallDevice ? 16 : 24));
    };

    const drawKMeans = () => {
      const left = isSmallDevice ? 34 : 72;
      const right = width - (isSmallDevice ? 34 : 72);
      const top = isSmallDevice ? 70 : 100;
      const bottom = height - (isSmallDevice ? 70 : 100);
      const toX = (value: number) => left + ((value + 1.35) / 2.7) * (right - left);
      const toY = (value: number) => bottom - ((value + 1.35) / 2.7) * (bottom - top);

      kMeansState.assignments = kMeansState.points.map((point) =>
        nearestCentroidIndex(point, kMeansState.centroids)
      );

      for (let centroidIndex = 0; centroidIndex < kMeansState.centroids.length; centroidIndex += 1) {
        let sumX = 0;
        let sumY = 0;
        let count = 0;

        for (let index = 0; index < kMeansState.points.length; index += 1) {
          if (kMeansState.assignments[index] === centroidIndex) {
            sumX += kMeansState.points[index].x;
            sumY += kMeansState.points[index].y;
            count += 1;
          }
        }

        if (count > 0) {
          kMeansState.centroids[centroidIndex].x = sumX / count;
          kMeansState.centroids[centroidIndex].y = sumY / count;
        }
      }

      const pointPalette = [
        "rgba(160, 176, 196, 0.46)",
        "rgba(186, 199, 214, 0.46)",
        "rgba(200, 210, 235, 0.46)",
      ];

      for (let index = 0; index < kMeansState.points.length; index += 1) {
        const point = kMeansState.points[index];
        const cluster = kMeansState.assignments[index];

        context.fillStyle = pointPalette[cluster] ?? pointPalette[0];
        context.beginPath();
        context.arc(toX(point.x), toY(point.y), 2, 0, Math.PI * 2);
        context.fill();
      }

      for (let centroidIndex = 0; centroidIndex < kMeansState.centroids.length; centroidIndex += 1) {
        const centroid = kMeansState.centroids[centroidIndex];
        const cx = toX(centroid.x);
        const cy = toY(centroid.y);

        context.strokeStyle = "rgba(226, 232, 240, 0.78)";
        context.lineWidth = 1.8;
        context.beginPath();
        context.arc(cx, cy, 6.2, 0, Math.PI * 2);
        context.stroke();

        context.fillStyle = "rgba(226, 232, 240, 0.62)";
        context.fillRect(cx - 1, cy - 1, 2, 2);
      }

      context.textAlign = "right";
      context.font = "500 11px Inter, system-ui, sans-serif";
      context.fillStyle = "rgba(186, 199, 214, 0.52)";
      context.fillText("c_i = argmin_k ||x_i - μ_k||²", width - (isSmallDevice ? 16 : 24), height - (isSmallDevice ? 16 : 24));
    };

    const modes: Mode[] = [
      {
        name: "Neural Network Forward Pass",
        formula: "y = σ(Wx + b)",
        draw: (time, normalizedPointerX, normalizedPointerY) => {
          drawNeuralNetwork(time, normalizedPointerX, normalizedPointerY);
        },
      },
      {
        name: "Gradient Descent Optimization",
        formula: "θ = θ - η∇L",
        draw: (_time, normalizedPointerX, normalizedPointerY) => {
          drawGradientDescent(normalizedPointerX, normalizedPointerY);
        },
      },
      {
        name: "Logistic Regression Boundary",
        formula: "p(y=1|x)=σ(wᵀx+b)",
        draw: () => {
          drawLogisticRegression();
        },
      },
      {
        name: "K-Means Clustering",
        formula: "μ_k = mean({x_i : c_i = k})",
        draw: () => {
          drawKMeans();
        },
      },
    ];

    const drawFrame = (timeMs: number) => {
      if (!prefersReducedMotion) {
        const frameInterval = 1000 / 30;
        if (timeMs - lastRenderMs < frameInterval) {
          rafId = requestAnimationFrame(drawFrame);
          return;
        }
        lastRenderMs = timeMs;
      }

      const time = timeMs * 0.001;

      context.clearRect(0, 0, width, height);

      pointer.influence *= 0.94;

      const normalizedPointerX = (pointer.x / Math.max(1, width)) * 2 - 1;
      const normalizedPointerY = (pointer.y / Math.max(1, height)) * 2 - 1;

      if (timeMs - modeStartTimeMs >= modeDurationMs) {
        previousModeIndex = currentModeIndex;
        currentModeIndex = (currentModeIndex + 1) % modes.length;
        transitionStartTimeMs = timeMs;
        modeStartTimeMs = timeMs;
        modeDurationMs = randomModeDurationMs();
        resetModeState(currentModeIndex);
      }

      const transitionProgress =
        previousModeIndex === null
          ? 1
          : Math.min(1, (timeMs - transitionStartTimeMs) / MODE_TRANSITION_MS);

      if (previousModeIndex !== null) {
        drawModeAtAlpha(
          previousModeIndex,
          1 - transitionProgress,
          time,
          normalizedPointerX,
          normalizedPointerY
        );
      }

      drawModeAtAlpha(currentModeIndex, transitionProgress, time, normalizedPointerX, normalizedPointerY);

      if (previousModeIndex !== null && transitionProgress < 1) {
        const prevMode = modes[previousModeIndex];
        drawModeLabel(prevMode.name, prevMode.formula, 1 - transitionProgress);
      }

      const mode = modes[currentModeIndex];
      drawModeLabel(mode.name, mode.formula, transitionProgress);

      if (transitionProgress >= 1) {
        previousModeIndex = null;
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onPointerMove);

    if (prefersReducedMotion) {
      drawFrame(performance.now());
    } else {
      rafId = requestAnimationFrame(drawFrame);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
      }

      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onPointerMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-16 dark:opacity-44"
        aria-hidden="true"
      />
    </div>
  );
}