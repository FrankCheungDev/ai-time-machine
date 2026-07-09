import type { CnnKernelDemo } from "@ai-history/demo-core";
import {
  cloneData,
  defaultLocale,
  getLocalizedValue,
  type Locale,
} from "../locales";

const imageGrid: CnnKernelDemo["imageGrid"] = [
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
];

const cnnKernelDemos = {
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
    kernels: [
      {
        id: "edge",
        label: "边缘检测",
        title: "边缘检测突出明暗变化",
        description: "这个 kernel 会在左暗右亮的边界处产生强响应。",
        matrix: [
          [-1, 0, 1],
          [-1, 0, 1],
          [-1, 0, 1],
        ],
      },
      {
        id: "blur",
        label: "平滑卷积",
        title: "平滑卷积汇总局部区域",
        description: "平滑 kernel 更像局部平均，会降低尖锐变化。",
        matrix: [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1],
        ],
      },
    ],
    scanSteps: [
      {
        id: "s1",
        x: 0,
        y: 0,
        title: "扫描左上窗口",
        description: "kernel 先看一个小局部，而不是整张图。",
      },
      {
        id: "s2",
        x: 1,
        y: 0,
        title: "滑到边界附近",
        description: "窗口覆盖明暗变化处，边缘响应开始增强。",
      },
      {
        id: "s3",
        x: 2,
        y: 0,
        title: "生成右侧响应",
        description: "多个局部响应组合成 feature map。",
      },
    ],
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
    kernels: [
      {
        id: "edge",
        label: "Edge detection",
        title: "Edge detection highlights changes in brightness",
        description:
          "This kernel produces a strong response at the boundary between a dark left side and a bright right side.",
        matrix: [
          [-1, 0, 1],
          [-1, 0, 1],
          [-1, 0, 1],
        ],
      },
      {
        id: "blur",
        label: "Smoothing convolution",
        title: "Smoothing convolution summarizes a local region",
        description:
          "A smoothing kernel acts like a local average and reduces sharp changes.",
        matrix: [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1],
        ],
      },
    ],
    scanSteps: [
      {
        id: "s1",
        x: 0,
        y: 0,
        title: "Scan the upper-left window",
        description:
          "The kernel first inspects a small region, not the entire image.",
      },
      {
        id: "s2",
        x: 1,
        y: 0,
        title: "Slide toward the boundary",
        description:
          "The window covers the brightness transition, so the edge response begins to grow.",
      },
      {
        id: "s3",
        x: 2,
        y: 0,
        title: "Generate the response on the right",
        description: "Multiple local responses combine into a feature map.",
      },
    ],
  },
} satisfies Record<Locale, Omit<CnnKernelDemo, "imageGrid">>;

export function getCnnKernelDemo(
  locale: Locale = defaultLocale,
): CnnKernelDemo {
  return {
    ...getLocalizedValue(cnnKernelDemos, locale),
    imageGrid: cloneData(imageGrid),
  };
}

export const cnnKernelDemo = getCnnKernelDemo();
