module.exports = {
  extends: ["@commitlint/config-conventional"],
  ignores: [(message) => message.startsWith("chore(release):")],
  rules: {
    "body-max-line-length": [1, "always", 100],
    "footer-max-line-length": [1, "always", 100],
  },
};
