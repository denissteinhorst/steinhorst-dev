// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

// Allow (and enforce) self-closing syntax for void HTML elements like <br /> and <img />
// Adjust other categories only if needed – here we keep defaults for normal & component tags.
export default withNuxt({
  name: "project/custom-html-self-closing",
  rules: {
    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "always", // <br /> <img /> etc.
          normal: "never", // e.g. <div></div>
          component: "always", // <MyComp />
        },
        svg: "always",
        math: "always",
      },
    ],
  },
});
