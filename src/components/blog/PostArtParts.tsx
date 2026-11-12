type LabelProps = {
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  size?: number;
  children: string;
};

const TRACKING_SHIFT = { start: 0, middle: 0.06, end: 0.12 } as const;

export function Label({ x, y, anchor = "start", size = 13, children }: LabelProps) {
  return (
    <text
      x={x}
      y={y}
      dx={`${TRACKING_SHIFT[anchor]}em`}
      textAnchor={anchor}
      fontSize={size}
      letterSpacing="0.12em"
      fill="currentColor"
      stroke="none"
      className="font-display font-medium uppercase"
    >
      {children}
    </text>
  );
}

type ArrowHeadProps = {
  x: number;
  y: number;
  angle?: number;
};

export function ArrowHead({ x, y, angle = 0 }: ArrowHeadProps) {
  return (
    <path
      d={`M${x - 9} ${y - 7} L${x} ${y} L${x - 9} ${y + 7}`}
      {...(angle !== 0 && { transform: `rotate(${angle} ${x} ${y})` })}
    />
  );
}

type BarProps = {
  x: number;
  top: number;
  bottom: number;
  w: number;
  r: number;
};

export function barPath({ x, top, bottom, w, r }: BarProps) {
  const right = x + w;
  return `M${x} ${bottom} V${top + r} A${r} ${r} 0 0 1 ${x + r} ${top} H${right - r} A${r} ${r} 0 0 1 ${right} ${top + r} V${bottom}`;
}
