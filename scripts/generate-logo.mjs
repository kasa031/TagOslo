import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "public/full_logo.png");
const outDir = path.join(root, "public");
const fontsDir = path.join(root, "scripts/fonts");

await mkdir(outDir, { recursive: true });
await mkdir(fontsDir, { recursive: true });

const fontUrl =
  "https://github.com/google/fonts/raw/main/ofl/cinzel/Cinzel-Bold.ttf";
const fontPath = path.join(fontsDir, "Cinzel-Bold.ttf");

try {
  const res = await fetch(fontUrl);
  if (res.ok) {
    await writeFile(fontPath, Buffer.from(await res.arrayBuffer()));
  }
} catch {
  // Fallback to system serif caps in SVG
}

const fontFamily = "Cinzel, 'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const fontFileUri = fontPath.replace(/\\/g, "/");

/** Finn indre våpen: blått felt + krone, uten ytre tekstring. */
async function detectInnerEmblemCrop(source) {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  const isBlue = (r, g, b) => b > 90 && b > r * 1.15 && b > g * 0.85 && r < 130;

  const bluePoints = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isBlue(r, g, b)) bluePoints.push([x, y]);
    }
  }

  let sumX = 0;
  let sumY = 0;
  for (const [x, y] of bluePoints) {
    sumX += x;
    sumY += y;
  }
  const blueCx = sumX / bluePoints.length;
  const blueCy = sumY / bluePoints.length;

  const blueDistances = bluePoints.map(([x, y]) => Math.hypot(x - blueCx, y - blueCy));
  blueDistances.sort((a, b) => a - b);

  let minX = w;
  let maxX = 0;
  let minY = h;
  let maxY = 0;
  for (const [x, y] of bluePoints) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const leftExtent = blueCx - minX;
  const rightExtent = maxX - blueCx;

  const cx = blueCx;
  // ~84 % av blåfeltets bredde — kutte tekstring, beholde våpen
  const radius = Math.min(leftExtent, rightExtent) * 0.845;
  const cy = maxY - radius;

  const safeRadius = Math.min(radius, cx - 2, cy - 2, w - cx - 2, h - cy - 2);
  const cropSize = Math.round(safeRadius * 2);
  const cropLeft = Math.round(cx - safeRadius);
  const cropTop = Math.round(cy - safeRadius);

  return { cx, cy, radius: safeRadius, cropLeft, cropTop, cropSize, w, h };
}

const crop = await detectInnerEmblemCrop(sourcePath);
const { cropLeft, cropTop, cropSize } = crop;
console.log(
  `Emblem crop: center (${crop.cx.toFixed(0)}, ${crop.cy.toFixed(0)}), radius ${crop.radius.toFixed(0)}px`,
);

const emblemSize = 520;
const pad = 24;
const labelHeight = 100;
const totalWidth = emblemSize + pad * 2;
const totalHeightBelow = emblemSize + pad * 2 + labelHeight;
const totalHeightRing = emblemSize + pad * 2;

async function cropRoundEmblem(size) {
  const square = await sharp(sourcePath)
    .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>`,
  );

  return sharp(square)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

function fontFaceCss() {
  try {
    return `@font-face {
      font-family: 'Cinzel';
      src: url('file:///${fontFileUri}') format('truetype');
      font-weight: 700;
    }`;
  } catch {
    return "";
  }
}

function labelBelowSvg(width, height) {
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>${fontFaceCss()}</style>
      <text
        x="50%"
        y="68"
        text-anchor="middle"
        font-family="${fontFamily}"
        font-size="52"
        font-weight="700"
        letter-spacing="6"
        fill="#1a1a1a"
      >TagOslo</text>
    </svg>`,
  );
}

function labelArcSvg(size) {
  const r = size / 2 - 8;
  const cxSvg = size / 2;
  const cySvg = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <style>${fontFaceCss()}</style>
      <defs>
        <path id="arc" d="M ${cxSvg - r * 0.78} ${cySvg + r * 0.28}
          A ${r} ${r} 0 0 0 ${cxSvg + r * 0.78} ${cySvg + r * 0.28}" fill="none"/>
      </defs>
      <text
        font-family="${fontFamily}"
        font-size="38"
        font-weight="700"
        letter-spacing="7"
        fill="#1a1a1a"
      >
        <textPath href="#arc" startOffset="50%" text-anchor="middle">TagOslo</textPath>
      </text>
    </svg>`,
  );
}

function labelSkirtSvg(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <style>${fontFaceCss()}</style>
      <text
        x="50%"
        y="${Math.round(size * 0.58)}"
        text-anchor="middle"
        font-family="${fontFamily}"
        font-size="30"
        font-weight="700"
        letter-spacing="4"
        fill="#ffffff"
        stroke="#1a1a1a"
        stroke-width="1.2"
        paint-order="stroke fill"
      >TagOslo</text>
    </svg>`,
  );
}

const emblem = await cropRoundEmblem(emblemSize);
const emblemLeft = pad;
const emblemTop = pad;

// Main logo — emblem + TagOslo below
await sharp({
  create: {
    width: totalWidth,
    height: totalHeightBelow,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: emblem, top: emblemTop, left: emblemLeft },
    {
      input: await sharp(labelBelowSvg(totalWidth, labelHeight)).png().toBuffer(),
      top: emblemTop + emblemSize + 4,
      left: 0,
    },
  ])
  .png()
  .toFile(path.join(outDir, "logo.png"));

// Arc variant — TagOslo along lower curve (outside inner art)
await sharp({
  create: {
    width: totalHeightRing,
    height: totalHeightRing,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: emblem, top: pad, left: pad },
    {
      input: await sharp(labelArcSvg(emblemSize + pad * 2)).png().toBuffer(),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toFile(path.join(outDir, "logo-ring.png"));

// Skirt variant — TagOslo on the red robe
await sharp({
  create: {
    width: totalHeightRing,
    height: totalHeightRing,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: emblem, top: pad, left: pad },
    {
      input: await sharp(labelSkirtSvg(emblemSize + pad * 2)).png().toBuffer(),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toFile(path.join(outDir, "logo-skirt.png"));

// Round emblem only (app icon / favicon)
const emblemRound = await sharp(emblem).resize(512, 512).png().toBuffer();
await sharp(emblemRound).toFile(path.join(outDir, "emblem-round.png"));

const appIconSizes = [
  { name: "icon-16.png", size: 16 },
  { name: "icon-32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

for (const { name, size } of appIconSizes) {
  await sharp(emblemRound).resize(size, size).png().toFile(path.join(outDir, name));
}

const maskableSize = 512;
const innerSize = Math.round(maskableSize * 0.72);
const maskableEmblem = await sharp(emblemRound)
  .resize(innerSize, innerSize)
  .png()
  .toBuffer();

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: { r: 16, g: 61, b: 145, alpha: 255 },
  },
})
  .composite([
    {
      input: maskableEmblem,
      top: Math.round((maskableSize - innerSize) / 2),
      left: Math.round((maskableSize - innerSize) / 2),
    },
  ])
  .png()
  .toFile(path.join(outDir, "icon-maskable-512.png"));

console.log(
  "Created public/logo.png, logo-ring.png, logo-skirt.png, emblem-round.png, app icons",
);
