import type { CnnKernelDemo } from "@ai-history/demo-core";

export const cnnKernelDemo = {
  title: "深度学习与 CNN：机器如何从图像中学习局部特征？",
  question: "机器如何从图像中识别局部特征？",
  simplificationNote:
    "本案例是二维网格卷积示意，不训练真实 CNN；数值只用来展示局部感受野和 feature map 的直觉。",
  imageGrid: [
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1]
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
        [-1, 0, 1]
      ]
    },
    {
      id: "blur",
      label: "平滑卷积",
      title: "平滑卷积汇总局部区域",
      description: "平滑 kernel 更像局部平均，会降低尖锐变化。",
      matrix: [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ]
    }
  ],
  scanSteps: [
    { id: "s1", x: 0, y: 0, title: "扫描左上窗口", description: "kernel 先看一个小局部，而不是整张图。" },
    { id: "s2", x: 1, y: 0, title: "滑到边界附近", description: "窗口覆盖明暗变化处，边缘响应开始增强。" },
    { id: "s3", x: 2, y: 0, title: "生成右侧响应", description: "多个局部响应组合成 feature map。" }
  ]
} satisfies CnnKernelDemo;
