<script setup lang="ts">
import type { Chart, TooltipItem } from "chart.js";
import { Bar } from "vue-chartjs";

interface Props {
  title?: string;
  subtitle?: string;
  text?: string;
  tooltips: BarChartTooltip[];
}

interface MotivationDimension {
  name: string;
  innerValue: number;
  outerValue: number;
  description: string;
}

type MotivationTraitDE =
  | "Durchsetzung"
  | "Integration"
  | "Sicherheit"
  | "Individualität"
  | "Erkenntnis"
  | "Empathie";
type MotivationTraitEN =
  | "Assertiveness"
  | "Integration"
  | "Security"
  | "Individuality"
  | "Insight"
  | "Empathy";
type MotivationTrait = MotivationTraitDE | MotivationTraitEN;

const { title = "", subtitle = "", text = "", tooltips } = defineProps<Props>();

const { $t } = useI18n();
const colorMode = useColorMode();
const { currentLocaleString } = useStrapi();

const isClientMounted = shallowRef(false);

onMounted(() => {
  isClientMounted.value = true;
});

const MOTIVATION_TRAITS_MAPPING = readonly({
  de: [
    "Durchsetzung",
    "Integration",
    "Sicherheit",
    "Individualität",
    "Erkenntnis",
    "Empathie",
  ] as const,
  en: [
    "Assertiveness",
    "Integration",
    "Security",
    "Individuality",
    "Insight",
    "Empathy",
  ] as const,
});

const TRAIT_COLOR_MAP: Record<MotivationTrait, { base: string }> = readonly({
  Durchsetzung: { base: "#ef4444" },
  Integration: { base: "#f59e0b" },
  Sicherheit: { base: "#22c55e" },
  Individualität: { base: "#3b82f6" },
  Erkenntnis: { base: "#856dca" },
  Empathie: { base: "#ec4899" },
  Assertiveness: { base: "#ef4444" },
  Security: { base: "#22c55e" },
  Individuality: { base: "#3b82f6" },
  Insight: { base: "#856dca" },
  Empathy: { base: "#ec4899" },
});

const motivationTraits = computed(() => {
  const locale =
    currentLocaleString?.value as keyof typeof MOTIVATION_TRAITS_MAPPING;
  return locale && MOTIVATION_TRAITS_MAPPING[locale]
    ? MOTIVATION_TRAITS_MAPPING[locale]
    : MOTIVATION_TRAITS_MAPPING.de;
});

const themeColors = computed(() => {
  const isDarkMode =
    import.meta.client && isClientMounted.value
      ? colorMode.value === "dark"
      : false;

  return {
    axisTick: isDarkMode ? "#cbd5e1" : "#334155",
    axisGrid: isDarkMode ? "rgba(148,163,184,0.22)" : "rgba(100,116,139,0.15)",
    tooltipTitle: isDarkMode ? "#e2e8f0" : "#0f172a",
    tooltipBody: isDarkMode ? "#f8fafc" : "#1e293b",
    tooltipBorder: isDarkMode ? "rgba(148,163,184,0.4)" : "#334155",
    titleColor: isDarkMode ? "#e5e5e5" : "#1e293b",
    subtitleColor: isDarkMode ? "#c9d3de" : "#475569",
    descriptionColor: isDarkMode ? "#bfc3c9" : "#475569",
  };
});

const extractDescriptionText = (richTextBlocks: RichTextBlock[]): string => {
  for (const block of richTextBlocks) {
    if (block.type === "paragraph" && block.children) {
      const textContent = block.children
        .filter((item: RichTextBlock): boolean => item.type === "text")
        .map((item: RichTextBlock): string => item.text || "")
        .join("")
        .trim();

      if (textContent) return textContent;
    }
  }
  return "";
};

const motivationDimensions = computed((): MotivationDimension[] => {
  if (!tooltips?.length) return [];

  const tooltipsByTrait = tooltips.reduce((acc, tooltip) => {
    acc[tooltip.title] = tooltip;
    return acc;
  }, {} as Record<string, BarChartTooltip>);

  const traits = motivationTraits.value || [];

  return traits.map((trait) => {
    const tooltip = tooltipsByTrait[trait];
    return {
      name: trait,
      innerValue: tooltip?.innerValue || 0,
      outerValue: tooltip?.outerValue || 0,
      description: tooltip ? extractDescriptionText(tooltip.text) : "",
    };
  });
});

// Extract data arrays for chart configuration
const dimensionLabels = computed(() =>
  motivationDimensions.value.map((dimension) => dimension.name)
);

const innerSelfValues = computed(() =>
  motivationDimensions.value.map((dimension) => dimension.innerValue)
);

const outerSelfDifferences = computed(() =>
  motivationDimensions.value.map(
    (dimension) => dimension.outerValue - dimension.innerValue
  )
);

const createRgbaColor = (hexColor: string, alpha: number): string => {
  const hex = hexColor.replace("#", "");
  const red = parseInt(hex.substring(0, 2), 16);
  const green = parseInt(hex.substring(2, 4), 16);
  const blue = parseInt(hex.substring(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
};

// Memoize color creation to avoid recalculations
const colorCache = new Map<string, string>();
const getCachedRgbaColor = (hexColor: string, alpha: number): string => {
  const key = `${hexColor}-${alpha}`;
  if (!colorCache.has(key)) {
    colorCache.set(key, createRgbaColor(hexColor, alpha));
  }
  return colorCache.get(key)!;
};

const getTraitColor = (traitName: string): string => {
  if (!traitName) {
    if (import.meta.dev) {
      console.warn(`Empty trait name provided to getTraitColor`);
    }
    return "#6b7280";
  }

  const traitColor = TRAIT_COLOR_MAP[traitName as MotivationTrait];

  if (import.meta.dev && !traitColor) {
    console.warn(
      `No color mapping found for trait: "${traitName}". Available traits:`,
      Object.keys(TRAIT_COLOR_MAP)
    );
  }

  return traitColor?.base || "#6b7280";
};

const chartConfiguration = computed(() => ({
  labels: dimensionLabels.value,
  datasets: [
    {
      label: $t("personality_section.internal_self_image") as string,
      data: innerSelfValues.value,
      backgroundColor: dimensionLabels.value
        .filter((label): label is string => Boolean(label))
        .map((label) => getCachedRgbaColor(getTraitColor(label), 0.8)),
      borderRadius: {
        topLeft: 4,
        topRight: 4,
        bottomLeft: 4,
        bottomRight: 4,
      },
      stack: "motivation-profile",
      barPercentage: 0.6,
      categoryPercentage: 0.7,
    },
    {
      label: $t("personality_section.external_self_image") as string,
      data: outerSelfDifferences.value,
      backgroundColor: dimensionLabels.value
        .filter((label): label is string => Boolean(label))
        .map((label) => getCachedRgbaColor(getTraitColor(label), 0.35)),
      borderRadius: {
        topLeft: 4,
        topRight: 4,
        bottomLeft: 0,
        bottomRight: 0,
      },
      stack: "motivation-profile",
      barPercentage: 0.6,
      categoryPercentage: 0.7,
    },
  ],
}));

const wrapTextContent = (text: string, maxLineLength = 50): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine + word;
    if (testLine.length > maxLineLength) {
      if (currentLine.trim().length > 0) {
        lines.push(currentLine.trim());
      }
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }

  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }

  return lines.length > 0 ? lines : [text];
};

const chartDisplayOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  layout: {
    padding: { top: 0 },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: () =>
        themeColors.value.axisTick === "#cbd5e1" ? "#0f172a" : "#ffffff",
      titleColor: themeColors.value.tooltipTitle,
      bodyColor: themeColors.value.tooltipBody,
      filter: () => true,
      itemSort: (a: TooltipItem<"bar">, b: TooltipItem<"bar">) => {
        return a.datasetIndex - b.datasetIndex;
      },
      borderColor: (context: unknown) => {
        const contextData = context as
          | { tooltip?: { dataPoints?: Array<{ dataIndex: number }> } }
          | undefined;

        const dataPoint = contextData?.tooltip?.dataPoints?.[0];
        if (dataPoint) {
          const traitName = dimensionLabels.value[dataPoint.dataIndex];
          if (traitName) {
            return getTraitColor(traitName);
          }
        }
        return themeColors.value.tooltipBorder;
      },
      borderWidth: 2,
      callbacks: {
        title: (items: TooltipItem<"bar">[]) => {
          const firstItem = items?.[0];
          const dimension = firstItem
            ? motivationDimensions.value[firstItem.dataIndex]
            : undefined;
          return dimension?.name || "";
        },
        label: (context: TooltipItem<"bar">) => {
          const dimension = motivationDimensions.value[context.dataIndex];
          if (!dimension) return "";

          if (context.datasetIndex === 0) {
            return `${$t("personality_section.internal_self_image")}: ${
              dimension.innerValue
            }`;
          } else if (context.datasetIndex === 1) {
            return `${$t("personality_section.external_self_image")}: ${
              dimension.outerValue
            }`;
          }

          return "";
        },
        afterBody: (items: TooltipItem<"bar">[]) => {
          const firstItem = items?.[0];
          if (!firstItem) return "";
          const dimension = motivationDimensions.value[firstItem.dataIndex];
          if (!dimension) return "";
          return ["", ...wrapTextContent(dimension.description, 50)];
        },
      },
      titleFont: {
        size: 16,
        weight: "bold" as const,
      },
      bodyFont: {
        size: 14,
      },
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        color: themeColors.value.axisGrid,
      },
      ticks: {
        color: themeColors.value.axisTick,
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      max: 150,
      grid: {
        color: themeColors.value.axisGrid,
      },
      ticks: {
        color: themeColors.value.axisTick,
        stepSize: 25,
      },
    },
  },
}));

// Chart plugin that draws a horizontal reference line at value 100
const averageLinePlugin = {
  id: "averageLine",
  afterDatasetsDraw(chart: Chart) {
    const yScale = chart.scales.y as unknown as {
      min: number;
      max: number;
      getPixelForValue: (value: number) => number;
    };

    if (!yScale) return;

    const referenceValue = 100;
    if (referenceValue < yScale.min || referenceValue > yScale.max) return;

    const yPosition = yScale.getPixelForValue(referenceValue);
    const { ctx, chartArea } = chart as unknown as {
      ctx: CanvasRenderingContext2D;
      chartArea: { left: number; right: number };
    };

    if (!chartArea) return;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.moveTo(chartArea.left, yPosition);
    ctx.lineTo(chartArea.right, yPosition);
    ctx.stroke();

    ctx.font =
      '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "bottom";
    ctx.fillText("Ø", chartArea.right - 12, yPosition - 2);
    ctx.restore();
  },
};
</script>

<template>
  <div class="bar-chart">
    <h3 class="bar-chart__title" :style="{ color: themeColors.titleColor }">
      {{ title }}
    </h3>
    <div class="bar-chart__canvas-wrapper">
      <Bar
        id="motivation-profile"
        :data="chartConfiguration"
        :options="chartDisplayOptions"
        :plugins="[averageLinePlugin]"
      />
    </div>
    <p
      class="bar-chart__subtitle"
      :style="{ color: themeColors.subtitleColor }"
    >
      {{ subtitle }}
    </p>
    <p
      class="bar-chart__description"
      :style="{ color: themeColors.descriptionColor }"
    >
      {{ text }}
    </p>
  </div>
</template>

<style scoped lang="scss">
$block: "bar-chart";

.#{$block} {
  width: 100%;

  &__title {
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: 0.025rem;
    margin: 0 0 1rem 0;
    text-align: center;
    color: #1e293b;

    :global(.dark) & {
      color: #f1f5f9;
    }
  }

  &__canvas-wrapper {
    position: relative;
    height: 360px;
    width: 100%;
    margin-bottom: 0.85rem;
    margin-top: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(canvas) {
      height: 100% !important;
      width: 100% !important;
      padding: 18px;
      transform-origin: center center;
    }
  }

  &__subtitle {
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.025rem;
    padding-top: 0.33rem;
    color: #475569;

    :global(.dark) & {
      color: #94a3b8;
    }
  }

  &__description {
    margin-top: 0.75rem;
    font-size: 1rem;
    color: #475569;

    :global(.dark) & {
      color: #a0a0a0;
    }
  }
}
</style>
