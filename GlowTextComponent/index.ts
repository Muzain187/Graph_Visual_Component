import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class GlowTextComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null = null;
    private graphData: any;
    private positions: { [key: number]: { x: number; y: number; node: any } } = {};
    private tooltip: HTMLDivElement | null = null;

    // Edge hitboxes
    private edgePaths: { edge: any; from: { x: number; y: number }; to: { x: number; y: number } }[] = [];

    // Zoom & Pan
    private scale: number = 1;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private isDragging: boolean = false;
    private lastX: number = 0;
    private lastY: number = 0;

    // Controls
    private controls: HTMLDivElement | null = null;

    constructor() {}

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        // Canvas
        this.canvas = document.createElement("canvas");
        this.canvas.width = container.offsetWidth || 800;
        this.canvas.height = container.offsetHeight || 600;
        this.canvas.style.background = "#1e1e2f";
        this.canvas.style.borderRadius = "8px";
        this.ctx = this.canvas.getContext("2d");
        container.appendChild(this.canvas);

        // Tooltip
        this.tooltip = document.createElement("div");
        this.tooltip.style.position = "absolute";
        this.tooltip.style.padding = "6px 10px";
        this.tooltip.style.background = "rgba(0,0,0,0.85)";
        this.tooltip.style.color = "white";
        this.tooltip.style.borderRadius = "6px";
        this.tooltip.style.fontSize = "12px";
        this.tooltip.style.pointerEvents = "none";
        this.tooltip.style.display = "none";
        container.style.position = "relative";
        container.appendChild(this.tooltip);

        // Controls (bottom-right)
        this.controls = document.createElement("div");
        this.controls.style.position = "absolute";
        this.controls.style.bottom = "20px";
        this.controls.style.right = "20px";
        this.controls.style.display = "grid";
        this.controls.style.gridTemplateColumns = "repeat(3, 40px)";
        this.controls.style.gridTemplateRows = "repeat(3, 40px)";
        this.controls.style.gap = "6px";
        this.controls.style.background = "rgba(30,30,47,0.85)";
        this.controls.style.padding = "10px";
        this.controls.style.borderRadius = "12px";
        this.controls.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
        container.appendChild(this.controls);

        // Buttons
        const btnStyle = `
            background:#444;
            color:white;
            border:none;
            width:40px;
            height:40px;
            border-radius:8px;
            font-size:16px;
            cursor:pointer;
            transition: all 0.2s ease;
        `;
        const makeButton = (label: string, action: () => void): HTMLButtonElement => {
            const btn = document.createElement("button");
            btn.innerText = label;
            btn.setAttribute("style", btnStyle);
            btn.onmouseenter = () => (btn.style.background = "#666");
            btn.onmouseleave = () => (btn.style.background = "#444");
            btn.onclick = () => {
                action();
                this.drawGraph();
            };
            return btn;
        };

        const slots: (HTMLElement | null)[] = new Array(9).fill(null);
        slots[1] = makeButton("↑", () => (this.offsetY -= 50));
        slots[3] = makeButton("←", () => (this.offsetX -= 50));
        slots[5] = makeButton("→", () => (this.offsetX += 50));
        slots[7] = makeButton("↓", () => (this.offsetY += 50));
        slots[9] = makeButton("+", () => (this.scale *= 1.2));
        slots[11] = makeButton("−", () => (this.scale *= 0.8));

        slots.forEach((el) => {
            const cell = document.createElement("div");
            if (el) cell.appendChild(el);
            this.controls!.appendChild(cell);
        });

        // Events
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("wheel", this.handleWheel.bind(this));
        this.canvas.addEventListener("mouseleave", this.handleMouseUp.bind(this));
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const graphJson = context.parameters.GlowText.raw;

        if (graphJson) {
            try {
                this.graphData = JSON.parse(graphJson);
                this.drawGraph();
            } catch {
                if (this.ctx) {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.fillStyle = "#fff";
                    this.ctx.fillText("Invalid Graph JSON", 10, 20);
                }
            }
        }
    }

    private drawGraph(): void {
        if (!this.ctx || !this.graphData) return;
        const ctx = this.ctx;

        ctx.save();
        ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
        ctx.clearRect(-this.offsetX / this.scale, -this.offsetY / this.scale, this.canvas.width / this.scale, this.canvas.height / this.scale);

        const nodes = this.graphData.nodes || [];
        const edges = this.graphData.edges || [];

        const childrenMap: { [key: number]: number[] } = {};
        edges.forEach((e: any) => {
            if (!childrenMap[e.from]) childrenMap[e.from] = [];
            childrenMap[e.from].push(e.to);
        });

        const allTo = new Set(edges.map((e: any) => e.to));
        const root = nodes.find((n: any) => !allTo.has(n.id));

        this.positions = {};
        this.edgePaths = [];
        const startY = 80;
        const levelHeight = 150;

        const layoutTree = (nodeId: number, depth: number, x: number, availableWidth: number) => {
            const y = startY + depth * levelHeight;
            this.positions[nodeId] = { x, y, node: nodes.find((n: any) => n.id === nodeId) };
            const children = childrenMap[nodeId] || [];
            if (children.length > 0) {
                const step = availableWidth / children.length;
                children.forEach((childId, i) => {
                    const childX = x - availableWidth / 2 + step / 2 + i * step;
                    layoutTree(childId, depth + 1, childX, step);
                });
            }
        };
        if (root) layoutTree(root.id, 0, this.canvas.width / 2, this.canvas.width / 1.5);

        // Edges with arrowheads
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 2;
        edges.forEach((edge: any) => {
            const from = this.positions[edge.from];
            const to = this.positions[edge.to];
            if (from && to) {
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2 - 40;

                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.quadraticCurveTo(midX, midY, to.x, to.y);
                ctx.stroke();

                const t = 0.9;
                const qx = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
                const qy = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * midY + t * t * to.y;
                const angle = Math.atan2(to.y - qy, to.x - qx);

                ctx.beginPath();
                ctx.moveTo(to.x, to.y);
                ctx.lineTo(to.x - 14 * Math.cos(angle - Math.PI / 6), to.y - 14 * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(to.x - 14 * Math.cos(angle + Math.PI / 6), to.y - 14 * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fillStyle = "#aaa";
                ctx.fill();

                // Store edge for tooltip
                this.edgePaths.push({ edge, from: { x: from.x, y: from.y }, to: { x: to.x, y: to.y } });
            }
        });

        // Nodes
        nodes.forEach((node: any) => {
            const pos = this.positions[node.id];
            if (pos) {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 28, 0, 2 * Math.PI);
                ctx.fillStyle = node.color || "#2d89ef";
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "#222";
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = "#fff";
                ctx.font = "bold 14px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(node.label, pos.x, pos.y);
            }
        });

        ctx.restore();
    }

    // Zoom/Pan
    private handleWheel(event: WheelEvent): void {
        event.preventDefault();
        const zoom = event.deltaY < 0 ? 1.1 : 0.9;
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        this.offsetX = mouseX - zoom * (mouseX - this.offsetX);
        this.offsetY = mouseY - zoom * (mouseY - this.offsetY);
        this.scale *= zoom;
        this.drawGraph();
    }

    private handleMouseDown(event: MouseEvent): void {
        this.isDragging = true;
        this.lastX = event.clientX;
        this.lastY = event.clientY;
    }

    private handleMouseUp(): void {
        this.isDragging = false;
    }

    private handleMouseMove(event: MouseEvent): void {
        if (this.isDragging) {
            this.offsetX += event.clientX - this.lastX;
            this.offsetY += event.clientY - this.lastY;
            this.lastX = event.clientX;
            this.lastY = event.clientY;
            this.drawGraph();
            if (this.tooltip) this.tooltip.style.display = "none"; // hide while dragging
            return;
        }

        if (!this.ctx || !this.graphData) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left - this.offsetX) / this.scale;
        const y = (event.clientY - rect.top - this.offsetY) / this.scale;

        let found: string | null = null;

        // Check nodes
        for (const id in this.positions) {
            const pos = this.positions[id];
            if (pos) {
                const dx = x - pos.x;
                const dy = y - pos.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 28) {
                    found = pos.node.label;
                    break;
                }
            }
        }

        // Check edges (approximate distance to line)
        if (!found) {
            for (const path of this.edgePaths) {
                const { from, to, edge } = path;
                const A = to.y - from.y;
                const B = from.x - to.x;
                const C = to.x * from.y - from.x * to.y;
                const dist = Math.abs(A * x + B * y + C) / Math.sqrt(A * A + B * B);
                if (dist < 10) {
                    found = `${edge.from} → ${edge.to}`;
                    break;
                }
            }
        }

        if (this.tooltip) {
            if (found) {
                this.tooltip.innerText = found;
                this.tooltip.style.left = `${event.clientX - rect.left + 15}px`;
                this.tooltip.style.top = `${event.clientY - rect.top + 15}px`;
                this.tooltip.style.display = "block";
            } else {
                this.tooltip.style.display = "none";
            }
        }
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        if (this.canvas) this.canvas.remove();
        if (this.tooltip) this.tooltip.remove();
        if (this.controls) this.controls.remove();
    }
}