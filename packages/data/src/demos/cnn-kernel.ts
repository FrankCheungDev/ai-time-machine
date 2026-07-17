import type {
  CnnKernel,
  CnnKernelDemo,
  CnnScanStep,
} from "@ai-history/demo-core";
import { cloneData, defaultLocale, type Locale } from "../locales";

const imageGrid: CnnKernelDemo["imageGrid"] = [
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
];

type KernelTopology = {
  readonly id: string;
  readonly matrix: readonly (readonly number[])[];
  readonly normalizationDivisor: number;
};

const kernelTopology = [
  {
    id: "edge",
    normalizationDivisor: 1,
    matrix: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
  },
  {
    id: "blur",
    normalizationDivisor: 9,
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
] as const satisfies readonly KernelTopology[];

type KernelId = (typeof kernelTopology)[number]["id"];
type KernelCopy = Pick<CnnKernel, "label" | "title" | "description">;

type ScanStepTopology = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
};

const scanStepTopology = [
  { id: "s1", x: 0, y: 0 },
  { id: "s2", x: 1, y: 0 },
  { id: "s3", x: 2, y: 0 },
  { id: "s4", x: 0, y: 1 },
  { id: "s5", x: 1, y: 1 },
  { id: "s6", x: 2, y: 1 },
  { id: "s7", x: 0, y: 2 },
  { id: "s8", x: 1, y: 2 },
  { id: "s9", x: 2, y: 2 },
] as const satisfies readonly ScanStepTopology[];

type ScanStepId = (typeof scanStepTopology)[number]["id"];
type ScanStepCopy = Pick<CnnScanStep, "title" | "description">;

type CnnKernelCopy = Omit<
  CnnKernelDemo,
  "imageGrid" | "kernels" | "scanSteps"
> & {
  kernels: Record<KernelId, KernelCopy>;
  scanSteps: Record<ScanStepId, ScanStepCopy>;
};

const cnnKernelCopies = {
  "zh-CN": {
    title: "深度学习与 CNN：机器如何从图像中学习局部特征？",
    question: "机器如何从图像中识别局部特征？",
    simplificationNote:
      "本案例是二维网格卷积示意，不训练真实 CNN；数值只用来展示局部感受野和 feature map 的直觉。",
    learningGoals: [
      "理解卷积核通过局部窗口扫描图像，而不是一次读取整张图。",
      "观察不同 kernel 如何产生不同 feature map 响应。",
      "说明局部感受野和参数共享为什么适合视觉特征提取。",
    ],
    kernels: {
      edge: {
        label: "边缘检测",
        title: "边缘检测突出明暗变化",
        description: "这个 kernel 会在左暗右亮的边界处产生强响应。",
      },
      blur: {
        label: "平滑卷积",
        title: "平滑卷积汇总局部区域",
        description: "平滑 kernel 更像局部平均，会降低尖锐变化。",
      },
    },
    scanSteps: {
      s1: {
        title: "扫描左上窗口",
        description: "kernel 先看一个小局部，而不是整张图。",
      },
      s2: {
        title: "滑到边界附近",
        description: "窗口覆盖明暗变化处，边缘响应开始增强。",
      },
      s3: {
        title: "生成右侧响应",
        description: "多个局部响应组合成 feature map。",
      },
      s4: {
        title: "下移到第二行",
        description: "相同 kernel 继续扫描下一排局部窗口。",
      },
      s5: {
        title: "再次跨过边界",
        description: "同一条明暗边界会在不同垂直位置产生相近响应。",
      },
      s6: {
        title: "完成第二行响应",
        description: "第二行的三个局部响应写入 feature map。",
      },
      s7: {
        title: "扫描最后一行",
        description: "窗口到达最后一排有效位置。",
      },
      s8: {
        title: "记录最后一个边界响应",
        description: "重复使用同一组 kernel 权重体现参数共享。",
      },
      s9: {
        title: "完成完整特征图",
        description: "九个局部响应组成完整的 3×3 feature map。",
      },
    },
  },
  en: {
    title:
      "Deep Learning And CNNs: How do machines learn local visual features?",
    question: "How do machines identify local features in an image?",
    simplificationNote:
      "This demo illustrates convolution on a two-dimensional grid and does not train a real CNN. The values only build intuition for local receptive fields and feature maps.",
    learningGoals: [
      "Understand how a kernel scans an image through local windows instead of reading the whole image at once.",
      "Observe how different kernels produce different feature-map responses.",
      "Explain why local receptive fields and parameter sharing suit visual feature extraction.",
    ],
    kernels: {
      edge: {
        label: "Edge detection",
        title: "Edge detection highlights changes in brightness",
        description:
          "This kernel produces a strong response at the boundary between a dark left side and a bright right side.",
      },
      blur: {
        label: "Smoothing convolution",
        title: "Smoothing convolution summarizes a local region",
        description:
          "A smoothing kernel acts like a local average and reduces sharp changes.",
      },
    },
    scanSteps: {
      s1: {
        title: "Scan the upper-left window",
        description:
          "The kernel first inspects a small region, not the entire image.",
      },
      s2: {
        title: "Slide toward the boundary",
        description:
          "The window covers the brightness transition, so the edge response begins to grow.",
      },
      s3: {
        title: "Generate the response on the right",
        description: "Multiple local responses combine into a feature map.",
      },
      s4: {
        title: "Move down to the second row",
        description:
          "The same kernel continues scanning the next row of local windows.",
      },
      s5: {
        title: "Cross the boundary again",
        description:
          "The same brightness boundary produces a similar response at another vertical position.",
      },
      s6: {
        title: "Complete the second response row",
        description:
          "The three local responses in the second row enter the feature map.",
      },
      s7: {
        title: "Scan the final row",
        description: "The window reaches the final row of valid positions.",
      },
      s8: {
        title: "Record the final boundary response",
        description:
          "Reusing the same kernel weights illustrates parameter sharing.",
      },
      s9: {
        title: "Complete the feature map",
        description: "Nine local responses form the complete 3×3 feature map.",
      },
    },
  },
} satisfies Record<Locale, CnnKernelCopy>;

export function getCnnKernelDemo(
  locale: Locale = defaultLocale,
): CnnKernelDemo {
  const copy = cnnKernelCopies[locale] ?? cnnKernelCopies[defaultLocale];
  const { kernels, scanSteps, ...metadata } = copy;

  return cloneData({
    ...metadata,
    imageGrid,
    kernels: kernelTopology.map(({ id, matrix, normalizationDivisor }) => ({
      id,
      label: kernels[id].label,
      title: kernels[id].title,
      description: kernels[id].description,
      normalizationDivisor,
      matrix: matrix.map((row) => [...row]),
    })),
    scanSteps: scanStepTopology.map(({ id, x, y }) => ({
      id,
      x,
      y,
      title: scanSteps[id].title,
      description: scanSteps[id].description,
    })),
  });
}

export const cnnKernelDemo = getCnnKernelDemo();
