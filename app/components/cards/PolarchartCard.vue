<script setup lang="ts">
import { PolarArea } from "vue-chartjs";

interface Props {
  title?: string;
  subtitle?: string;
  text?: string;
  tooltips: PolarChartTooltip[];
}

const { title = "", subtitle = "", text = "", tooltips } = defineProps<Props>();

const { $t } = useI18n();
const colorMode = useColorMode();
const { currentLocaleString } = useStrapi();

const isClientMounted = shallowRef(false);

onMounted(() => {
  isClientMounted.value = true;
});

const PERSONALITY_TRAITS_MAPPING = readonly({
  de: ["Initiativ", "Gewissenhaft", "Stetig", "Dominant"] as const,
  en: ["Initiative", "Conscientious", "Steady", "Dominance"] as const,
});

const personalityTraits = computed(() => {
  const locale =
    currentLocaleString?.value as keyof typeof PERSONALITY_TRAITS_MAPPING;
  return locale && PERSONALITY_TRAITS_MAPPING[locale]
    ? PERSONALITY_TRAITS_MAPPING[locale]
    : PERSONALITY_TRAITS_MAPPING.de;
});

const themeColors = computed(() => {
  const isDarkMode =
    import.meta.client && isClientMounted.value
      ? colorMode.value === "dark"
      : false;

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

const tooltipsByTrait = computed(() => {
  if (!tooltips?.length) return {};

  return tooltips.reduce((accumulator, tooltip) => {
    accumulator[tooltip.title] = tooltip;
    return accumulator;
  }, {} as Record<string, PolarChartTooltip>);
});

const chartLabels = computed(() => {
  const traits = personalityTraits.value || [];
  return traits.map((trait) => tooltipsByTrait.value[trait]?.title || trait);
});

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

const chartConfiguration = computed(() => {
  const isDarkMode = colorMode.value === "dark";

  const fillColors = isDarkMode
    ? [
        "rgba(255,193,7,0.30)",
        "rgba(59,130,246,0.28)",
        "rgba(34,197,94,0.28)",
        "rgba(239,68,68,0.30)",
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

  const traits = personalityTraits.value || [];
  const chartData = traits.map(
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

const tooltipContent = computed(() => {
  const traits = personalityTraits.value || [];
  return traits.map((trait) => {
    const tooltip = tooltipsByTrait.value[trait];
    return tooltip ? extractBulletPoints(tooltip.text) : [];
  });
});

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
        display: false,
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

<template>
  <div class="polar-chart-card">
    <h3
      class="polar-chart-card__title"
      :style="{ color: themeColors.titleColor }"
    >
      {{ title }}
    </h3>
    <div class="polar-chart-card__canvas-wrapper">
      <PolarArea
        id="polar-chart"
        :data="chartConfiguration"
        :options="chartDisplayOptions"
        :aria-label="`${title}: ${$t('accessibility.polarChart.description')}`"
      />
    </div>
    <p
      class="polar-chart-card__subtitle"
      :style="{ color: themeColors.subtitleColor }"
    >
      {{ subtitle }}
    </p>
    <p
      class="polar-chart-card__description"
      :style="{ color: themeColors.descriptionColor }"
    >
      {{ text }}
    </p>
  </div>
</template>

<style scoped lang="scss">
$block: "polar-chart-card";

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
