<template>
  <div class="polar-chart">
    <h3 class="polar-chart__title" :style="{ color: themeColors.titleColor }">
      {{ title }}
    </h3>
    <div class="polar-chart__canvas-wrapper">
      <PolarArea
        id="polar-chart"
        :data="chartConfiguration"
        :options="chartDisplayOptions"
      />
    </div>
    <p
      class="polar-chart__subtitle"
      :style="{ color: themeColors.subtitleColor }"
    >
      {{ subtitle }}
    </p>
    <p
      class="polar-chart__description"
      :style="{ color: themeColors.descriptionColor }"
    >
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { PolarArea } from "vue-chartjs";

interface Props {
  title?: string;
  subtitle?: string;
  text?: string;
  tooltips: PolarChartTooltip[];
}

const { title = "", subtitle = "", text = "", tooltips } = defineProps<Props>();

const colorMode = useColorMode();
const hydrated = ref(false);
if (import.meta.client) {
  onMounted(() => {
    hydrated.value = true;
  });
}

// Personality trait order for consistent display
const PERSONALITY_TRAITS = [
  "Initiativ",
  "Gewissenhaft",
  "Stetig",
  "Dominant",
] as const;

/**
 * Chart theme colors - kept as hardcoded values since they need to be used in JavaScript
 * These values should match the CSS custom properties defined in theme.scss
 */
const themeColors = computed(() => {
  // Always use light mode colors on SSR to prevent hydration mismatches
  // Only use actual color mode after client hydration
  const isDarkMode =
    import.meta.client && hydrated.value ? colorMode.value === "dark" : false;
  return {
    tooltipBackground: isDarkMode ? "#0f172a" : "#ffffff",
    tooltipTitle: isDarkMode ? "#e2e8f0" : "#0f172a",
    tooltipBody: isDarkMode ? "#f8fafc" : "#1e293b",
    tooltipBorder: isDarkMode ? "rgba(99,102,241,0.4)" : "#ffffff",
    gridColor: isDarkMode ? "rgba(148,163,184,0.25)" : "rgba(100,116,139,0.25)",
    tickColor: isDarkMode ? "#cbd5e1" : "#334155",
    titleColor: isDarkMode ? "#e5e5e5" : "#1e293b",
    subtitleColor: isDarkMode ? "#c9d3de" : "#475569",
    descriptionColor: isDarkMode ? "#bfc3c9" : "#475569",
  };
});

/**
 * Creates a mapping of tooltip data by personality trait name
 * This allows for consistent ordering regardless of input order
 */
const tooltipsByTrait = computed(() => {
  return tooltips.reduce((accumulator, tooltip) => {
    accumulator[tooltip.title] = tooltip;
    return accumulator;
  }, {} as Record<string, PolarChartTooltip>);
});

/**
 * Ordered chart labels based on predefined personality trait sequence
 */
const chartLabels = computed(() => {
  return PERSONALITY_TRAITS.map(
    (trait) => tooltipsByTrait.value[trait]?.title || trait
  );
});

/**
 * Extracts bullet point text from rich text content blocks
 * Processes list items and converts them to readable bullet points
 */
const extractBulletPoints = (richTextBlocks: RichTextBlock[]): string[] => {
  const bulletPoints: string[] = [];

  for (const block of richTextBlocks) {
    if (block.type === "list" && block.children) {
      for (const child of block.children) {
        if (child.type === "list-item" && child.children) {
          const textContent = child.children
            .filter((item) => item.type === "text")
            .map((item) => item.text)
            .join("")
            .trim();

          if (textContent) {
            bulletPoints.push(`- ${textContent}`);
          }
        }
      }
    }
  }

  return bulletPoints;
};

/**
 * Chart data configuration with theme-appropriate colors
 * Uses translucent fills to maintain grid/tick visibility
 */
const chartConfiguration = computed(() => {
  const isDarkMode = colorMode.value === "dark";

  // Color schemes for personality traits
  const fillColors = isDarkMode
    ? [
        "rgba(255,193,7,0.30)", // Initiativ - yellow
        "rgba(59,130,246,0.28)", // Gewissenhaft - blue
        "rgba(34,197,94,0.28)", // Stetig - green
        "rgba(239,68,68,0.30)", // Dominant - red
      ]
    : [
        "rgba(255,193,7,0.40)",
        "rgba(0,123,255,0.38)",
        "rgba(40,167,69,0.38)",
        "rgba(220,53,69,0.40)",
      ];

  const borderColors = isDarkMode
    ? [
        "rgba(255,193,7,0.85)",
        "rgba(59,130,246,0.85)",
        "rgba(34,197,94,0.85)",
        "rgba(239,68,68,0.85)",
      ]
    : [
        "rgba(255,193,7,0.95)",
        "rgba(0,123,255,0.95)",
        "rgba(40,167,69,0.95)",
        "rgba(220,53,69,0.95)",
      ];

  // Extract percentage data in correct order
  const chartData = PERSONALITY_TRAITS.map(
    (trait) => tooltipsByTrait.value[trait]?.percentage || 0
  );

  return {
    labels: chartLabels.value,
    datasets: [
      {
        data: chartData,
        backgroundColor: fillColors,
        borderColor: borderColors,
        borderWidth: 1.5,
      },
    ],
  };
});

/**
 * Tooltip content organized by personality trait order
 * Pre-processes rich text into readable bullet points
 */
const tooltipContent = computed(() => {
  return PERSONALITY_TRAITS.map((trait) => {
    const tooltip = tooltipsByTrait.value[trait];
    return tooltip ? extractBulletPoints(tooltip.text) : [];
  });
});

/**
 * Chart display configuration and interaction settings
 * Handles responsive behavior, tooltips, and visual styling
 */
const chartDisplayOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 0 },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false, // External title element used instead
      },
      tooltip: {
        callbacks: {
          title: function (context: Array<{ label: string }>) {
            return context?.[0]?.label || "";
          },
          label: function (context: { dataIndex: number; raw: unknown }) {
            const dataIndex = context.dataIndex;
            const percentage = Number(context.raw) || 0;
            const bulletPoints = tooltipContent.value[dataIndex] || [];

            return [`${percentage}%`, "", ...bulletPoints];
          },
        },
        displayColors: true,
        backgroundColor: () => themeColors.value.tooltipBackground,
        titleColor: themeColors.value.tooltipTitle,
        bodyColor: themeColors.value.tooltipBody,
        borderColor: (context: unknown) => {
          // Extract border color based on data point
          const contextData = context as
            | {
                tooltip?: {
                  dataPoints?: Array<{
                    dataIndex: number;
                    datasetIndex: number;
                    chart?: { config?: { data?: { datasets?: unknown[] } } };
                  }>;
                };
              }
            | undefined;

          const dataPoint = contextData?.tooltip?.dataPoints?.[0];
          if (dataPoint) {
            const dataset = dataPoint.chart?.config?.data?.datasets?.[
              dataPoint.datasetIndex
            ] as { backgroundColor?: string[] } | undefined;
            const color = dataset?.backgroundColor?.[dataPoint.dataIndex];

            if (typeof color === "string" && color.startsWith("rgba")) {
              // Convert to full opacity for border
              return color.replace(
                /rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/,
                "rgba($1,$2,$3,1)"
              );
            }
            if (typeof color === "string") {
              return color;
            }
          }
          return themeColors.value.tooltipBorder;
        },
        borderWidth: 2,
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
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          display: true,
          stepSize: 20,
          color: themeColors.value.tickColor,
          font: {
            size: 10,
          },
          showLabelBackdrop: false,
          backdropColor: "transparent",
        },
        grid: {
          color: themeColors.value.gridColor,
        },
        pointLabels: {
          display: true,
          centerPointLabels: true,
          font: {
            size: 11,
            weight: "bold" as const,
          },
          color: themeColors.value.tickColor,
          backdropColor: "transparent",
        },
        backgroundColor: "transparent",
      },
    },
  };
});
</script>

<style scoped lang="scss">
$block: "polar-chart";

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
